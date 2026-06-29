import { normalizeWorkoutAgentProposal } from '../../shared/workoutAgentSchema.js';

const cloneWorkout = (workout) => {
  if (typeof structuredClone === 'function') return structuredClone(workout);
  return JSON.parse(JSON.stringify(workout));
};

const normalizeName = (value) => String(value || '').trim().toLowerCase().replace(/\s+/g, ' ');

const updateSetsReps = (setsReps, field, nextValue) => {
  const current = String(setsReps || '').trim();
  const next = String(nextValue || '').trim();
  if (!next) return current;
  if (/\d\s*[x×]\s*\S/i.test(next)) return next;

  const match = current.match(/^(\s*\d+(?:\s*-\s*\d+)?)\s*([x×])\s*(.+)$/i);
  if (!match) return field === 'sets' ? `${next} x reps` : `sets x ${next}`;
  return field === 'sets'
    ? `${next} ${match[2]} ${match[3]}`
    : `${match[1]} ${match[2]} ${next}`;
};

const findExerciseIndex = (workout, exerciseName) => {
  const target = normalizeName(exerciseName);
  return workout.findIndex(exercise => normalizeName(exercise?.name) === target);
};

export const requestWorkoutAgentProposal = async ({ prompt, currentWorkout, settings, accessToken }) => {
  const response = await fetch('/api/workout-agent', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify({ prompt, currentWorkout, settings })
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || 'ForgeAI Workout Agent request failed.');
  return normalizeWorkoutAgentProposal(data?.proposal);
};

export const applyWorkoutAgentProposal = (currentWorkout, proposal) => {
  if (!Array.isArray(currentWorkout) || !currentWorkout.length) {
    throw new Error('There is no active workout to update.');
  }

  const normalizedProposal = normalizeWorkoutAgentProposal(proposal);
  const updatedWorkout = cloneWorkout(currentWorkout);
  const appliedChanges = [];
  const executionPriority = { modify_field: 1, add_note: 1, replace_exercise: 2, remove_exercise: 3 };
  const executionChanges = [...normalizedProposal.changes].sort((a, b) => (
    executionPriority[a.type] - executionPriority[b.type]
  ));

  executionChanges.forEach(change => {
    const exerciseIndex = findExerciseIndex(updatedWorkout, change.exerciseName);
    if (exerciseIndex < 0) throw new Error(`${change.exerciseName} is no longer in the current workout.`);
    const exercise = updatedWorkout[exerciseIndex];

    if (change.type === 'remove_exercise') {
      if (updatedWorkout.length <= 1) throw new Error('ForgeAI Workout Agent cannot remove the entire workout.');
      updatedWorkout.splice(exerciseIndex, 1);
    } else if (change.type === 'replace_exercise') {
      exercise.name = change.after;
      exercise.agentChangeReason = change.reason;
    } else if (change.type === 'add_note') {
      exercise.agentNote = change.after;
    } else if (change.field === 'sets' || change.field === 'reps') {
      exercise.setsReps = updateSetsReps(exercise.setsReps, change.field, change.after);
      if (change.field === 'sets' && Object.prototype.hasOwnProperty.call(exercise, 'sets')) exercise.sets = change.after;
      if (change.field === 'reps' && Object.prototype.hasOwnProperty.call(exercise, 'reps')) exercise.reps = change.after;
    } else if (change.field === 'intensity') {
      exercise.intensity = change.after;
      if (Object.prototype.hasOwnProperty.call(exercise, 'intensityRange')) exercise.intensityRange = change.after;
    } else {
      exercise[change.field] = change.after;
    }

    appliedChanges.push(change);
  });

  return { workout: updatedWorkout, appliedChanges };
};

export const cloneWorkoutForAgent = cloneWorkout;
