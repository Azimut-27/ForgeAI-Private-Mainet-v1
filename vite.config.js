import react from '@vitejs/plugin-react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { defineConfig, loadEnv } from 'vite';
import { generateWorkoutAgentProposal } from './server/workoutAgentCore.js';

const readJsonBody = (req, maxLength = 12000) => new Promise((resolve, reject) => {
  let body = '';
  req.on('data', chunk => {
    body += chunk;
    if (body.length > maxLength) {
      reject(new Error('Request body too large'));
      req.destroy();
    }
  });
  req.on('end', () => {
    try {
      resolve(body ? JSON.parse(body) : {});
    } catch (error) {
      reject(error);
    }
  });
  req.on('error', reject);
});

const sendJson = (res, payload, statusCode = 200) => {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(payload));
};

const clampText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

const SYSTEM_PROMPT = [
  'You are ForgeAI Coach, an elite evidence-informed strength, hypertrophy, conditioning, recovery, and performance coach.',
  'You help users improve workouts, structure progression, manage fatigue, optimize recovery, improve performance, and understand training principles.',
  'Responses should be practical, concise, premium feeling, performance-oriented, safe, not medical, and avoid unnecessary disclaimers.',
  'Explain exact changes clearly. Focus on sets, reps, tempo, rest, exercise order, intensity, progression, recovery, and sport performance.',
  'Keep the response concise but complete. Prefer 4-8 short lines or bullets when useful.',
  'Do not stop mid-list. If the user asks for multiple items, include every item. Use plain text bullets instead of markdown bold.'
].join(' ');

const createUserPrompt = ({ prompt, context }) => [
  SYSTEM_PROMPT,
  '',
  'User request:',
  prompt,
  '',
  'ForgeAI context:',
  JSON.stringify(context || {}, null, 2)
].join('\n');

const getGeminiModelCandidates = (runtimeEnv = process.env) => {
  const configured = runtimeEnv.GEMINI_MODEL;
  return [
    configured,
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-2.0-flash',
    'gemini-1.5-flash'
  ].filter((modelName, index, list) => modelName && list.indexOf(modelName) === index);
};

const isLikelyIncompleteAnswer = (answer, prompt) => {
  const text = String(answer || '').trim();
  const lowerPrompt = String(prompt || '').toLowerCase();
  const asksForList = /\b(three|four|five|six|seven|eight|nine|ten|\d+)\b/.test(lowerPrompt)
    || /\b(list|exercises|workout|program|plan)\b/.test(lowerPrompt);

  if (!text) return true;
  if (text.length < 180 && asksForList) return true;
  if (/\*\*[^*]*$/.test(text)) return true;
  if (/(^|\n)\s*\d+\.\s*[^:\n]*$/.test(text) && asksForList) return true;
  if (/\b(for|with|and|or|then|include|exercise)\s*$/i.test(text)) return true;
  return false;
};

const aiCoachApiPlugin = (runtimeEnv = process.env) => ({
  name: 'forgeai-coach-api',
  configureServer(server) {
    server.middlewares.use('/api/ai-coach', async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, { error: 'Method not allowed' }, 405);
        return;
      }

      try {
        const body = await readJsonBody(req);
        const prompt = clampText(body.prompt, 700);
        const demoResponse = clampText(body.demoResponse, 1800) || 'ForgeAI Coach - Demo AI\n\nDemo coaching is ready. Add a prompt to get a workout-specific adjustment.';
        const apiKey = runtimeEnv.GEMINI_API_KEY || runtimeEnv.GOOGLE_GENERATIVE_AI_API_KEY;
        const modelCandidates = getGeminiModelCandidates(runtimeEnv);

        if (!prompt) {
          sendJson(res, { mode: 'demo', answer: demoResponse, error: 'Prompt was empty.' });
          return;
        }

        if (!apiKey) {
          sendJson(res, { mode: 'demo', answer: demoResponse, error: 'Gemini API key missing. Demo AI answered instead.' });
          return;
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        let result = null;
        let modelName = modelCandidates[0];
        let lastError = null;
        let answer = '';

        for (const candidate of modelCandidates) {
          try {
            const model = genAI.getGenerativeModel({ model: candidate });
            result = await model.generateContent({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: createUserPrompt({ prompt, context: body.context || {} }) }]
                }
              ],
              generationConfig: {
                temperature: 0.7,
                topP: 0.9,
                maxOutputTokens: 900
              }
            });
            answer = clampText(result?.response?.text?.(), 2200);
            if (isLikelyIncompleteAnswer(answer, prompt)) {
              lastError = new Error(`${candidate} returned an incomplete response.`);
              continue;
            }
            modelName = candidate;
            break;
          } catch (error) {
            lastError = error;
          }
        }

        if (!result || !answer) throw lastError || new Error('No Gemini model returned a response.');

        sendJson(res, {
          mode: 'live',
          provider: 'gemini',
          model: modelName,
          answer: answer || demoResponse
        });
      } catch (error) {
        sendJson(res, {
          mode: 'demo',
          provider: 'gemini',
          model: 'gemini-2.5-flash',
          answer: 'ForgeAI Coach - Demo AI\n\nGemini is unavailable right now, so Demo AI is active. Check the API key, billing, model access, or network connection.',
          error: 'All Gemini models are unavailable right now. Demo AI answered instead.'
        });
      }
    });
  }
});

const workoutAgentApiPlugin = (runtimeEnv = process.env) => ({
  name: 'forgeai-workout-agent-api',
  configureServer(server) {
    server.middlewares.use('/api/workout-agent', async (req, res) => {
      if (req.method !== 'POST') {
        sendJson(res, { error: 'Method not allowed' }, 405);
        return;
      }

      try {
        const body = await readJsonBody(req, 100000);
        const result = await generateWorkoutAgentProposal({ body, env: runtimeEnv });
        sendJson(res, result.payload, result.status);
      } catch (error) {
        console.error('ForgeAI local Workout Agent route failed', error);
        sendJson(res, { error: 'ForgeAI Workout Agent could not process this request.' }, 500);
      }
    });
  }
});

export default defineConfig(({ mode }) => {
  const runtimeEnv = { ...process.env, ...loadEnv(mode, process.cwd(), '') };
  return {
    plugins: [react(), aiCoachApiPlugin(runtimeEnv), workoutAgentApiPlugin(runtimeEnv)]
  };
});
