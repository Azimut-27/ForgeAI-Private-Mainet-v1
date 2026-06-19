const clampText = (value, maxLength = 700) => String(value || '').trim().slice(0, maxLength);

const summarizeWorkout = (generatedWorkout) => {
  const exercises = Array.isArray(generatedWorkout?.exercises)
    ? generatedWorkout.exercises
    : Array.isArray(generatedWorkout)
      ? generatedWorkout
      : [];

  return exercises.slice(0, 10).map(exercise => ({
    label: exercise.label,
    name: exercise.name,
    category: exercise.category,
    muscle: exercise.muscle,
    setsReps: exercise.setsReps,
    tempo: exercise.tempo,
    rest: exercise.rest,
    intensity: exercise.intensity || exercise.schemeName
  }));
};

const summarizeLogs = (workoutLogs = []) => (
  (Array.isArray(workoutLogs) ? workoutLogs : []).slice(0, 3).map(log => ({
    title: log.title,
    createdAt: log.createdAt,
    goal: log.goal,
    focus: log.focus,
    durationSeconds: log.durationSeconds,
    completedSets: log.completedSets,
    totalVolumeKg: log.totalVolumeKg,
    records: (log.records || []).slice(0, 3).map(record => record.label || record.type || record)
  }))
);

export const buildForgeCoachContext = ({
  prompt,
  settings,
  generatedWorkout,
  workoutLogs,
  userProgress,
  activeProgram
}) => ({
  prompt: clampText(prompt, 700),
  settings,
  generatedWorkout: summarizeWorkout(generatedWorkout),
  workoutLogs: summarizeLogs(workoutLogs),
  userProgress: userProgress ? {
    xp: userProgress.xp,
    level: userProgress.level,
    rank: userProgress.rank,
    activeProBlockWeeks: userProgress.activeProBlockWeeks,
    aiSubscriptionActive: !!userProgress.aiSubscriptionActive
  } : null,
  activeProgram: activeProgram ? {
    sport: activeProgram.sport,
    durationWeeks: activeProgram.durationWeeks,
    overloadCurve: activeProgram.overloadCurve
  } : null
});

// Frontend architecture target:
// ForgeAI app -> /api/ai-coach -> Gemini/OpenAI backend.
// Before production, keep all provider keys on the server, regenerate any exposed test keys,
// store them in Vercel environment variables, and add per-user rate limiting.
export async function generateGeminiResponse(context) {
  const prompt = clampText(context?.prompt, 700);
  const demoResponse = context?.demoResponse || '';

  const response = await fetch('/api/ai-coach', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      prompt,
      context: {
        settings: context?.settings,
        generatedWorkout: context?.generatedWorkout,
        workoutLogs: context?.workoutLogs,
        userProgress: context?.userProgress,
        activeProgram: context?.activeProgram
      },
      demoResponse
    })
  });

  if (!response.ok) throw new Error('ForgeAI Coach request failed');
  const data = await response.json();
  const answer = String(data?.answer || '').trim();

  if (data?.mode === 'demo' && data?.error) {
    const error = new Error(data.error);
    error.fallbackAnswer = answer || demoResponse;
    error.mode = 'demo';
    throw error;
  }

  if (!answer) throw new Error('ForgeAI Coach returned an empty response');
  return answer;
}

export const generateForgeCoachResponse = generateGeminiResponse;
