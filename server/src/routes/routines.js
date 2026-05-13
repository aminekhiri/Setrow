const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/routines — Liste des routines de l'utilisateur
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('routines')
            .select(`
        *,
        routine_exercises (
          id, exercise_id, target_sets, target_reps, order_index,
          exercises ( id, name, muscle_group )
        )
      `)
            .eq('user_id', req.userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('GET /routines error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/routines/:id — Détail d'une routine
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('routines')
            .select(`
        *,
        routine_exercises (
          id, exercise_id, target_sets, target_reps, order_index,
          exercises ( id, name, muscle_group, description, image_url )
        )
      `)
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Routine non trouvée' });

        // Sort exercises by order_index
        if (data.routine_exercises) {
            data.routine_exercises.sort((a, b) => a.order_index - b.order_index);
        }

        res.json(data);
    } catch (err) {
        console.error('GET /routines/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/routines — Créer une routine
router.post('/', async (req, res) => {
    try {
        const { name, description, rest_time_seconds, exercises } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Nom de la routine requis' });
        }

        // Create routine
        const { data: routine, error: routineError } = await supabase
            .from('routines')
            .insert({
                name,
                description: description || '',
                rest_time_seconds: rest_time_seconds || 90,
                user_id: req.userId,
                is_favorite: false,
            })
            .select()
            .single();

        if (routineError) throw routineError;

        // Add exercises if provided
        if (exercises && exercises.length > 0) {
            const routineExercises = exercises.map((ex, index) => ({
                routine_id: routine.id,
                exercise_id: ex.exercise_id,
                target_sets: ex.target_sets || 4,
                target_reps: ex.target_reps || 10,
                order_index: index,
            }));

            const { error: exError } = await supabase
                .from('routine_exercises')
                .insert(routineExercises);

            if (exError) throw exError;
        }

        // Fetch complete routine
        const { data: complete } = await supabase
            .from('routines')
            .select(`
        *,
        routine_exercises (
          id, exercise_id, target_sets, target_reps, order_index,
          exercises ( id, name, muscle_group )
        )
      `)
            .eq('id', routine.id)
            .single();

        res.status(201).json(complete);
    } catch (err) {
        console.error('POST /routines error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/routines/:id — Modifier une routine
router.put('/:id', async (req, res) => {
    try {
        const { name, description, rest_time_seconds, exercises } = req.body;

        const { error: updateError } = await supabase
            .from('routines')
            .update({
                name,
                description,
                rest_time_seconds,
            })
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        if (updateError) throw updateError;

        // Replace exercises if provided
        if (exercises) {
            await supabase
                .from('routine_exercises')
                .delete()
                .eq('routine_id', req.params.id);

            if (exercises.length > 0) {
                const routineExercises = exercises.map((ex, index) => ({
                    routine_id: req.params.id,
                    exercise_id: ex.exercise_id,
                    target_sets: ex.target_sets || 4,
                    target_reps: ex.target_reps || 10,
                    order_index: index,
                }));

                await supabase.from('routine_exercises').insert(routineExercises);
            }
        }

        // Return updated routine
        const { data } = await supabase
            .from('routines')
            .select(`
        *,
        routine_exercises (
          id, exercise_id, target_sets, target_reps, order_index,
          exercises ( id, name, muscle_group )
        )
      `)
            .eq('id', req.params.id)
            .single();

        res.json(data);
    } catch (err) {
        console.error('PUT /routines/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/routines/:id/favorite — Toggle favori
router.post('/:id/favorite', async (req, res) => {
    try {
        const { data: routine } = await supabase
            .from('routines')
            .select('is_favorite')
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (!routine) return res.status(404).json({ error: 'Routine non trouvée' });

        const { error } = await supabase
            .from('routines')
            .update({ is_favorite: !routine.is_favorite })
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ is_favorite: !routine.is_favorite });
    } catch (err) {
        console.error('POST /routines/:id/favorite error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/routines/:id — Supprimer une routine
router.delete('/:id', async (req, res) => {
    try {
        await supabase
            .from('routine_exercises')
            .delete()
            .eq('routine_id', req.params.id);

        const { error } = await supabase
            .from('routines')
            .delete()
            .eq('id', req.params.id)
            .eq('user_id', req.userId);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /routines/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
