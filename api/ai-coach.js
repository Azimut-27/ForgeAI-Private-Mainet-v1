import { GoogleGenerativeAI } from '@google/generative-ai';

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

const getGeminiModelCandidates = () => {
  const configured = process.env.GEMINI_MODEL;
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const prompt = clampText(req.body?.prompt, 700);
  const demoResponse = clampText(req.body?.demoResponse, 1800) || 'ForgeAI Coach - Demo AI\n\nDemo coaching is ready. Add a prompt to get a workout-specific adjustment.';

  // Production/Vercel: keep provider keys in environment variables only.
  // TODO: add auth checks and per-user rate limiting before public launch.
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const modelCandidates = getGeminiModelCandidates();

  if (!prompt) {
    res.status(200).json({ mode: 'demo', answer: demoResponse, error: 'Prompt was empty.' });
    return;
  }

  if (!apiKey) {
    res.status(200).json({ mode: 'demo', answer: demoResponse, error: 'Gemini API key missing. Demo AI answered instead.' });
    return;
  }

  try {
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
              parts: [{ text: createUserPrompt({ prompt, context: req.body?.context || {} }) }]
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

    res.status(200).json({
      mode: 'live',
      provider: 'gemini',
      model: modelName,
      answer: answer || demoResponse
    });
  } catch (error) {
    res.status(200).json({
      mode: 'demo',
      provider: 'gemini',
      model: modelCandidates[0] || 'gemini-2.5-flash',
      answer: demoResponse,
      error: 'All Gemini models are unavailable right now. Demo AI answered instead.'
    });
  }
}
