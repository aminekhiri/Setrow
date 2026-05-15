const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// Epley 1RM formula: weight × (1 + reps / 30)
const calc1RM = (weight, reps) => weight * (1 + reps / 30);

// GET /api/goals — Liste des objectifs
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('goals')
            .select('*, exercises ( id, name, muscle_group, exercise_type )')
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;

        // For each goal, get the user's best performance and compute progression
        const goalsWithProgress = await Promise.all(
            data.map(async (goal) => {
                const exerciseType = goal.exercises?.exercise_type || 'weighted';

                const { data: bestSets } = await supabase
                    .from('sets')
                    .select(`
            weight, reps,
            session_exercises!inner (
              exercise_id,
              sessions!inner ( user_id )
            )
          `)
                    .eq('session_exercises.exercise_id', goal.exercise_id)
                    .eq('session_exercises.sessions.user_id', req.userId)
                    .eq('is_completed', true)
                    .order('weight', { ascending: false })
                    .limit(50);

                const targetWeight = goal.target_weight || 0;
                const targetReps = goal.target_reps || 0;

                // Find best values from user's sets
                let best1RM = 0;
                let currentBestWeight = 0;
                let currentBestReps = 0;
                if (bestSets && bestSets.length > 0) {
                    bestSets.forEach(s => {
                        const estimated = calc1RM(s.weight, s.reps);
                        if (estimated > best1RM) {
                            best1RM = estimated;
                            currentBestWeight = s.weight;
                        }
                        if (s.reps > currentBestReps) {
                            currentBestReps = s.reps;
                        }
                    });
                }

                // Calculate progression based on exercise type
                let progress1RM = 0;
                let target1RM = 0;

                if (exerciseType === 'bodyweight' || exerciseType === 'timed') {
                    // Bodyweight/timed: if target_weight is 0, compare reps (or seconds) directly
                    if (targetWeight === 0 && targetReps > 0) {
                        progress1RM = Math.min(100, Math.round((currentBestReps / targetReps) * 100));
                    } else if (targetWeight > 0) {
                        // Bodyweight with added weight (lest): use 1RM
                        target1RM = calc1RM(targetWeight, targetReps);
                        if (target1RM > 0) {
                            progress1RM = Math.min(100, Math.round((best1RM / target1RM) * 100));
                        }
                    }
                } else {
                    // Weighted: use 1RM formula
                    target1RM = targetWeight > 0 ? calc1RM(targetWeight, targetReps) : 0;
                    if (target1RM > 0) {
                        progress1RM = Math.min(100, Math.round((best1RM / target1RM) * 100));
                    } else if (targetWeight > 0) {
                        progress1RM = Math.min(100, Math.round((currentBestWeight / targetWeight) * 100));
                    }
                }

                return {
                    ...goal,
                    current_1rm: Math.round(best1RM * 10) / 10,
                    target_1rm: Math.round(target1RM * 10) / 10,
                    current_weight: currentBestWeight,
                    current_reps: currentBestReps,
                    progress_1rm: progress1RM,
                };
            })
        );

        res.json(goalsWithProgress);
    } catch (err) {
        console.error('GET /goals error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/goals — Créer un objectif
router.post('/', async (req, res) => {
    try {
        const { exercise_id, target_weight, target_reps } = req.body;

        if (!exercise_id) {
            return res.status(400).json({ error: 'Exercice requis' });
        }

        const { data, error } = await supabase
            .from('goals')
            .insert({
                user_id: req.userId,
                exercise_id,
                target_weight: target_weight || 0,
                target_reps: target_reps || 0,
            })
            .select('*, exercises ( id, name, muscle_group )')
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('POST /goals error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/goals/:id — Modifier un objectif
router.put('/:id', async (req, res) => {
    try {
        const { target_weight, target_reps } = req.body;

        const { data, error } = await supabase
            .from('goals')
            .update({ target_weight, target_reps })
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .select('*, exercises ( id, name, muscle_group )')
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('PUT /goals/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/goals/:id — Supprimer un objectif
router.delete('/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('goals')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /goals/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
