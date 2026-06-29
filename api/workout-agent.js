import { generateWorkoutAgentProposal } from '../server/workoutAgentCore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const result = await generateWorkoutAgentProposal({ body: req.body || {}, env: process.env });
    res.status(result.status).json(result.payload);
  } catch (error) {
    console.error('ForgeAI Workout Agent route failed', error);
    res.status(500).json({ error: 'ForgeAI Workout Agent could not process this request.' });
  }
}
