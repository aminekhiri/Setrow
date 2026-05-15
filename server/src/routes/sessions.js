const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// POST /api/sessions — Démarrer une séance
router.post('/', async (req, res) => {
    try {
        const { routine_id } = req.body;

        // Create session
        const { data: session, error: sessionError } = await supabase
            .from('sessions')
            .insert({
                user_id: req.userId,
                routine_id: routine_id || null,
                started_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (sessionError) throw sessionError;

        // If from a routine, copy exercises
        if (routine_id) {
            const { data: routineExercises } = await supabase
                .from('routine_exercises')
                .select('exercise_id, order_index, target_sets, target_reps, rest_time_seconds')
                .eq('routine_id', routine_id)
                .order('order_index');

            if (routineExercises && routineExercises.length > 0) {
                const sessionExercises = routineExercises.map(re => ({
                    session_id: session.id,
                    exercise_id: re.exercise_id,
                    order_index: re.order_index,
                }));

                // Store rest_time_seconds per exercise for the app
                session._restTimeByExercise = Object.fromEntries(
                    routineExercises.map(re => [re.exercise_id, re.rest_time_seconds || 90])
                );

                await supabase.from('session_exercises').insert(sessionExercises);
            }
        }

        // Re-fetch session with session_exercises to return generated IDs
        const { data: fullSession, error: fetchError } = await supabase
            .from('sessions')
            .select(`
                *,
                session_exercises (
                    id, exercise_id, order_index,
                    exercises ( id, name, muscle_group, exercise_type )
                )
            `)
            .eq('id', session.id)
            .single();

        if (fetchError) throw fetchError;

        // Sort exercises by order
        if (fullSession.session_exercises) {
            fullSession.session_exercises.sort((a, b) => a.order_index - b.order_index);
        }

        res.status(201).json({ ...fullSession, _restTimeByExercise: session._restTimeByExercise || {} });
    } catch (err) {
        console.error('POST /sessions error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/sessions/:id/exercises — Ajouter un exercice à la séance
router.post('/:id/exercises', async (req, res) => {
    try {
        const { exercise_id } = req.body;

        // Get max order_index
        const { data: existing } = await supabase
            .from('session_exercises')
            .select('order_index')
            .eq('session_id', req.params.id)
            .order('order_index', { ascending: false })
            .limit(1);

        const nextOrder = existing && existing.length > 0 ? existing[0].order_index + 1 : 0;

        const { data, error } = await supabase
            .from('session_exercises')
            .insert({
                session_id: req.params.id,
                exercise_id,
                order_index: nextOrder,
            })
            .select('*, exercises(id, name, muscle_group, exercise_type)')
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('POST /sessions/:id/exercises error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/sessions/:id/sets — Ajouter/valider une série
router.post('/:id/sets', async (req, res) => {
    try {
        const { session_exercise_id, set_number, weight, reps } = req.body;

        const { data, error } = await supabase
            .from('sets')
            .insert({
                session_exercise_id,
                set_number,
                weight: weight || 0,
                reps: reps || 0,
                is_completed: true,
                completed_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('POST /sessions/:id/sets error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/sessions/:id/sets/:setId — Modifier une série
router.put('/:id/sets/:setId', async (req, res) => {
    try {
        const { weight, reps, is_completed } = req.body;
        const updates = {};
        if (weight !== undefined) updates.weight = weight;
        if (reps !== undefined) updates.reps = reps;
        if (is_completed !== undefined) {
            updates.is_completed = is_completed;
            if (is_completed) updates.completed_at = new Date().toISOString();
        }

        const { data, error } = await supabase
            .from('sets')
            .update(updates)
            .eq('id', req.params.setId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('PUT /sessions/:id/sets/:setId error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/sessions/:id/finish — Terminer une séance
router.put('/:id/finish', async (req, res) => {
    try {
        const { notes } = req.body;

        const { data, error } = await supabase
            .from('sessions')
            .update({
                finished_at: new Date().toISOString(),
                notes: notes || null,
            })
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('PUT /sessions/:id/finish error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/sessions — Historique des séances
router.get('/', async (req, res) => {
    try {
        const { from, to, limit: queryLimit } = req.query;

        let query = supabase
            .from('sessions')
            .select(`
        *,
        routines ( id, name ),
        session_exercises (
          id, exercise_id, order_index,
          exercises ( id, name, muscle_group, exercise_type ),
          sets ( id, set_number, weight, reps, is_completed )
        )
      `)
            .eq('user_id', req.userId)
            .not('finished_at', 'is', null)
            .order('started_at', { ascending: false });

        if (from) query = query.gte('started_at', from);
        if (to) query = query.lte('started_at', to);
        if (queryLimit) query = query.limit(parseInt(queryLimit));

        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (err) {
        console.error('GET /sessions error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/sessions/:id — Détail d'une séance
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('sessions')
            .select(`
        *,
        routines ( id, name ),
        session_exercises (
          id, exercise_id, order_index,
          exercises ( id, name, muscle_group, description, exercise_type ),
          sets ( id, set_number, weight, reps, is_completed, completed_at )
        )
      `)
            .eq('id', req.params.id)
            .eq('user_id', req.userId)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Séance non trouvée' });

        // Sort exercises and sets
        if (data.session_exercises) {
            data.session_exercises.sort((a, b) => a.order_index - b.order_index);
            data.session_exercises.forEach(se => {
                if (se.sets) se.sets.sort((a, b) => a.set_number - b.set_number);
            });
        }

        // If resuming a session originating from a routine, fetch the exercise rest times
        if (data.routines?.id) {
            const { data: routeExercises } = await supabase
                .from('routine_exercises')
                .select('exercise_id, rest_time_seconds')
                .eq('routine_id', data.routines.id);

            if (routeExercises) {
                data._restTimeByExercise = Object.fromEntries(
                    routeExercises.map(re => [re.exercise_id, re.rest_time_seconds || 90])
                );
            }
        }

        res.json(data);
    } catch (err) {
        console.error('GET /sessions/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/sessions/previous/:exerciseId — Dernière perf sur un exercice
router.get('/previous/:exerciseId', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('session_exercises')
            .select(`
        id, session_id,
        sessions!inner ( user_id, started_at, finished_at ),
        sets ( set_number, weight, reps, is_completed )
      `)
            .eq('exercise_id', req.params.exerciseId)
            .eq('sessions.user_id', req.userId)
            .not('sessions.finished_at', 'is', null)
            .order('sessions(started_at)', { ascending: false })
            .limit(1);

        if (error) throw error;

        if (data && data.length > 0 && data[0].sets) {
            data[0].sets.sort((a, b) => a.set_number - b.set_number);
        }

        res.json(data && data.length > 0 ? data[0] : null);
    } catch (err) {
        console.error('GET /sessions/previous/:exerciseId error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
