export const WORKOUT_AGENT_SCOPE_MESSAGE = 'I can help adjust the current workout, but I cannot rewrite full PRO programs yet.';

export const WORKOUT_AGENT_INTENTS = ['analyze', 'modify'];
export const WORKOUT_AGENT_RISK_LEVELS = ['low', 'medium', 'high'];
export const WORKOUT_AGENT_CHANGE_TYPES = ['replace_exercise', 'modify_field', 'remove_exercise', 'add_note'];
export const WORKOUT_AGENT_FIELDS = ['sets', 'reps', 'intensity', 'tempo', 'rest', 'exercise', 'note'];

const clampString = (value, maxLength) => String(value ?? '').trim().slice(0, maxLength);

const parseJsonValue = (value) => {
  if (value && typeof value === 'object') return value;
  const source = String(value || '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '');
  if (!source) throw new Error('ForgeAI Workout Agent returned an empty proposal.');
  try {
    return JSON.parse(source);
  } catch {
    throw new Error('ForgeAI Workout Agent returned invalid JSON. Please try again.');
  }
};

const isAllowedChangeCombination = (type, field) => {
  if (type === 'replace_exercise' || type === 'remove_exercise') return field === 'exercise';
  if (type === 'add_note') return field === 'note';
  return type === 'modify_field' && ['sets', 'reps', 'intensity', 'tempo', 'rest'].includes(field);
};

export const normalizeWorkoutAgentProposal = (input) => {
  const raw = parseJsonValue(input);
  const intent = clampString(raw.intent, 20).toLowerCase();
  const riskLevel = clampString(raw.riskLevel, 20).toLowerCase();

  if (!WORKOUT_AGENT_INTENTS.includes(intent)) {
    throw new Error('ForgeAI Workout Agent returned an unsupported intent.');
  }
  if (!WORKOUT_AGENT_RISK_LEVELS.includes(riskLevel)) {
    throw new Error('ForgeAI Workout Agent returned an invalid risk level.');
  }

  const summary = clampString(raw.summary, 500);
  const coachExplanation = clampString(raw.coachExplanation, 1200);
  if (!summary || !coachExplanation) {
    throw new Error('ForgeAI Workout Agent returned an incomplete explanation.');
  }

  if (!Array.isArray(raw.changes) || raw.changes.length > 12) {
    throw new Error('ForgeAI Workout Agent returned an invalid change list.');
  }

  const seenIds = new Set();
  const changes = raw.changes.map((change, index) => {
    const id = clampString(change?.id, 80) || `agent-change-${index + 1}`;
    const type = clampString(change?.type, 40).toLowerCase();
    const field = clampString(change?.field, 30).toLowerCase();
    const exerciseName = clampString(change?.exerciseName, 160);
    const before = clampString(change?.before, 220);
    const after = clampString(change?.after, 220);
    const reason = clampString(change?.reason, 500);

    if (seenIds.has(id)) throw new Error('ForgeAI Workout Agent returned duplicate change IDs.');
    seenIds.add(id);
    if (!WORKOUT_AGENT_CHANGE_TYPES.includes(type) || !WORKOUT_AGENT_FIELDS.includes(field)) {
      throw new Error('ForgeAI Workout Agent returned an unsupported workout change.');
    }
    if (!isAllowedChangeCombination(type, field)) {
      throw new Error('ForgeAI Workout Agent returned an invalid change type and field combination.');
    }
    if (!exerciseName || !reason) {
      throw new Error('ForgeAI Workout Agent returned a change without an exercise or reason.');
    }
    if (type !== 'remove_exercise' && !after) {
      throw new Error('ForgeAI Workout Agent returned a change without a replacement value.');
    }

    return { id, type, exerciseName, field, before, after, reason };
  });

  if (intent === 'modify' && changes.length === 0) {
    throw new Error('ForgeAI Workout Agent did not propose any workout changes.');
  }

  return { intent, summary, riskLevel, changes, coachExplanation };
};
