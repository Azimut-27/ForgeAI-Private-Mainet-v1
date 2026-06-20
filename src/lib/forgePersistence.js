import { supabase } from './supabase';

const requireSupabase = () => {
  if (!supabase) throw new Error('Supabase is not configured.');
  return supabase;
};

export const upsertUserProfile = async (user) => {
  if (!user?.id) throw new Error('An authenticated user is required.');
  const client = requireSupabase();
  const profile = {
    id: user.id,
    email: user.email || null,
    username: String(user.user_metadata?.name || user.email || 'ForgeAI Athlete').trim()
  };
  const { error } = await client
    .from('profiles')
    .upsert(profile, { onConflict: 'id' });

  if (error) throw error;
  return profile;
};

export const ensureUserProfile = upsertUserProfile;

export const loadUserProfile = async (userId) => {
  if (!userId) return null;
  const client = requireSupabase();
  const { data, error } = await client
    .from('profiles')
    .select('id, username, email, created_at')
    .eq('id', userId)
    .maybeSingle();
  if (error) throw error;
  return data;
};

export const updateUserProfileName = async (userId, username, email = null) => {
  if (!userId) throw new Error('An authenticated user is required.');
  const client = requireSupabase();
  const cleanUsername = String(username || '').trim().replace(/\s+/g, ' ');
  if (!cleanUsername) throw new Error('A username is required.');

  const { data, error } = await client
    .from('profiles')
    .upsert({
      id: userId,
      username: cleanUsername,
      ...(email ? { email } : {})
    }, { onConflict: 'id' })
    .select('id, username, email, created_at')
    .single();
  if (error) throw error;
  return data;
};

export const loadUserPrograms = async (userId) => {
  if (!userId) return [];
  const client = requireSupabase();
  const { data, error } = await client
    .from('programs')
    .select('id, user_id, name, sport, program_data, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    sport: row.sport,
    programData: row.program_data,
    createdAt: row.created_at
  }));
};

export const saveUserProgram = async (userId, program) => {
  if (!userId || !program) throw new Error('A user and program are required.');
  const client = requireSupabase();
  const name = `${program.sport || 'ForgeAI PRO'}${program.durationWeeks ? ` - ${program.durationWeeks} Weeks` : ''}`;
  const programData = { ...program };
  delete programData.supabaseProgramId;
  const { data, error } = await client
    .from('programs')
    .insert({
      user_id: userId,
      name,
      sport: program.sport || null,
      program_data: programData
    })
    .select('id, user_id, name, sport, program_data, created_at')
    .single();
  if (error) throw error;
  return data;
};

export const updateUserProgram = async (userId, programId, program) => {
  if (!userId || !programId || !program) throw new Error('A user, program id, and program are required.');
  const client = requireSupabase();
  const name = `${program.sport || 'ForgeAI PRO'}${program.durationWeeks ? ` - ${program.durationWeeks} Weeks` : ''}`;
  const programData = { ...program };
  delete programData.supabaseProgramId;
  const { data, error } = await client
    .from('programs')
    .update({
      name,
      sport: program.sport || null,
      program_data: programData
    })
    .eq('id', programId)
    .eq('user_id', userId)
    .select('id, user_id, name, sport, program_data, created_at')
    .single();
  if (error) throw error;
  return data;
};

export const loadUserWorkoutLogs = async (userId) => {
  if (!userId) return [];
  const client = requireSupabase();
  const { data, error } = await client
    .from('workout_logs')
    .select('id, user_id, workout_data, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []).map(row => ({
    ...(row.workout_data || {}),
    supabaseId: row.id,
    createdAt: row.workout_data?.createdAt || row.created_at
  }));
};

export const saveUserWorkoutLog = async (userId, workoutLog) => {
  if (!userId || !workoutLog) throw new Error('A user and workout log are required.');
  const client = requireSupabase();
  const workoutData = { ...workoutLog };
  delete workoutData.supabaseId;
  const { data, error } = await client
    .from('workout_logs')
    .insert({ user_id: userId, workout_data: workoutData })
    .select('id, user_id, workout_data, created_at')
    .single();
  if (error) throw error;
  return {
    ...workoutData,
    supabaseId: data.id,
    createdAt: workoutData.createdAt || data.created_at
  };
};

export const updateUserWorkoutLog = async (userId, workoutLog) => {
  if (!userId || !workoutLog?.supabaseId) return null;
  const client = requireSupabase();
  const workoutData = { ...workoutLog };
  delete workoutData.supabaseId;
  const { error } = await client
    .from('workout_logs')
    .update({ workout_data: workoutData })
    .eq('id', workoutLog.supabaseId)
    .eq('user_id', userId);
  if (error) throw error;
  return workoutLog;
};

export const deleteUserWorkoutLog = async (userId, supabaseId) => {
  if (!userId || !supabaseId) return;
  const client = requireSupabase();
  const { error } = await client
    .from('workout_logs')
    .delete()
    .eq('id', supabaseId)
    .eq('user_id', userId);
  if (error) throw error;
};

export const deleteAllUserWorkoutLogs = async (userId) => {
  if (!userId) return;
  const client = requireSupabase();
  const { error } = await client
    .from('workout_logs')
    .delete()
    .eq('user_id', userId);
  if (error) throw error;
};
