import { normalizeWorkoutAgentProposal, WORKOUT_AGENT_SCOPE_MESSAGE } from '../shared/workoutAgentSchema.js';

const clampText = (value, maxLength) => String(value || '').trim().slice(0, maxLength);

const getModelCandidates = (env) => [
  env.OPENAI_AGENT_MODEL,
  env.OPENAI_MODEL,
  'gpt-4.1-mini',
  'gpt-4.1'
].filter((modelName, index, list) => modelName && list.indexOf(modelName) === index);

const isOutOfScopeRequest = (prompt) => /\bpro\s+program\b|\b(full|entire|whole)\s+(pro\s+)?program\b|\b(multiple|all)\s+weeks?\b|\brewrite\s+(my\s+)?program\b/i.test(prompt);

const sanitizeWorkout = (workout) => {
  const exercises = Array.isArray(workout) ? workout : Array.isArray(workout?.exercises) ? workout.exercises : [];
  return exercises.slice(0, 20).map((exercise, index) => ({
    index,
    label: clampText(exercise?.label, 20),
    name: clampText(exercise?.name, 160),
    category: clampText(exercise?.category || exercise?.role, 100),
    muscle: clampText(exercise?.muscle, 120),
    sets: clampText(exercise?.sets, 40),
    reps: clampText(exercise?.reps, 80),
    setsReps: clampText(exercise?.setsReps, 160),
    intensity: clampText(exercise?.intensityRange || exercise?.intensity, 120),
    tempo: clampText(exercise?.tempo, 80),
    rest: clampText(exercise?.rest, 80),
    note: clampText(exercise?.agentNote || exercise?.note || exercise?.description, 260)
  })).filter(exercise => exercise.name);
};

const createScopeProposal = () => ({
  intent: 'analyze',
  summary: WORKOUT_AGENT_SCOPE_MESSAGE,
  riskLevel: 'low',
  changes: [],
  coachExplanation: WORKOUT_AGENT_SCOPE_MESSAGE
});

const createAgentPrompt = ({ prompt, workout, settings }) => [
  'You are ForgeAI Workout Agent, a bounded evidence-informed training assistant.',
  'You may analyze and propose changes to the CURRENT workout only.',
  'Never apply changes, rewrite a PRO program, modify multiple weeks, delete the whole workout, or discuss account changes.',
  'Every modification must be conservative, compatible with the stated goal/equipment, and explained.',
  'For sets or reps changes, put only the new sets value or reps value in "after". For intensity, tempo, and rest, provide the complete display value.',
  'For replace_exercise, use field "exercise", preserve the movement purpose, and put the replacement exercise name in "after".',
  'For remove_exercise, use field "exercise". Never remove every exercise.',
  'For analysis-only requests, return intent "analyze" and an empty changes array.',
  `For requests outside scope, return this exact summary and explanation: "${WORKOUT_AGENT_SCOPE_MESSAGE}"`,
  'Return valid JSON only. No markdown and no text outside JSON.',
  'Required shape:',
  JSON.stringify({
    intent: 'analyze | modify',
    summary: 'string',
    riskLevel: 'low | medium | high',
    changes: [{
      id: 'unique-change-id',
      type: 'replace_exercise | modify_field | remove_exercise | add_note',
      exerciseName: 'exact current exercise name',
      field: 'sets | reps | intensity | tempo | rest | exercise | note',
      before: 'current value',
      after: 'proposed value',
      reason: 'specific reason'
    }],
    coachExplanation: 'string'
  }, null, 2),
  '',
  `User request: ${prompt}`,
  `Current settings: ${JSON.stringify(settings || {})}`,
  `Current workout: ${JSON.stringify(workout)}`
].join('\n');

const extractOpenAiText = (data) => {
  if (typeof data?.output_text === 'string') return data.output_text;

  const output = Array.isArray(data?.output) ? data.output : [];
  const chunks = [];

  output.forEach((item) => {
    if (item?.type !== 'message' || !Array.isArray(item.content)) return;
    item.content.forEach((part) => {
      if (typeof part?.text === 'string') chunks.push(part.text);
      if (typeof part?.output_text === 'string') chunks.push(part.output_text);
    });
  });

  return chunks.join('\n').trim();
};

export const generateWorkoutAgentProposal = async ({ body, env = process.env }) => {
  const prompt = clampText(body?.prompt, 700);
  const workout = sanitizeWorkout(body?.currentWorkout);
  const settings = body?.settings && typeof body.settings === 'object' ? body.settings : {};

  if (!prompt) return { status: 400, payload: { error: 'Enter a workout request first.' } };
  if (!workout.length) return { status: 400, payload: { error: 'Generate or open a workout before asking ForgeAI Workout Agent.' } };
  if (isOutOfScopeRequest(prompt)) return { status: 200, payload: { mode: 'live', proposal: createScopeProposal() } };

  const apiKey = env.OPENAI_API_KEY;
  if (!apiKey) return { status: 503, payload: { error: 'ForgeAI Workout Agent is unavailable because the OpenAI API key is missing.' } };

  const modelCandidates = getModelCandidates(env);
  let lastError = null;
  const agentPrompt = createAgentPrompt({ prompt, workout, settings });

  for (const modelName of modelCandidates) {
    try {
      const response = await fetch('https://api.openai.com/v1/responses', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: modelName,
          temperature: 0.2,
          top_p: 0.85,
          max_output_tokens: 1800,
          input: [
            {
              role: 'user',
              content: [{ type: 'input_text', text: agentPrompt }]
            }
          ]
        })
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data?.error?.message || `OpenAI request failed with status ${response.status}`);
      }

      const proposal = normalizeWorkoutAgentProposal(extractOpenAiText(data));
      return {
        status: 200,
        payload: { mode: 'live', provider: 'openai', model: modelName, proposal }
      };
    } catch (error) {
      lastError = error;
    }
  }

  console.error('ForgeAI Workout Agent generation failed', lastError);
  return {
    status: 502,
    payload: { error: lastError?.message || 'ForgeAI Workout Agent could not create a valid proposal.' }
  };
};
