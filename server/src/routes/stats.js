const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/stats/exercise/:id — Progression par exercice
router.get('/exercise/:id', async (req, res) => {
    try {
        const { period } = req.query; // week, month, 3months, year
        let from = new Date();

        switch (period) {
            case 'week': from.setDate(from.getDate() - 7); break;
            case 'month': from.setMonth(from.getMonth() - 1); break;
            case 'year': from.setFullYear(from.getFullYear() - 1); break;
            default: from.setMonth(from.getMonth() - 3); break;
        }

        const { data, error } = await supabase
            .from('session_exercises')
            .select(`
        exercise_id,
        sessions!inner ( started_at, user_id, finished_at ),
        sets ( set_number, weight, reps, is_completed )
      `)
            .eq('exercise_id', req.params.id)
            .eq('sessions.user_id', req.userId)
            .not('sessions.finished_at', 'is', null)
            .gte('sessions.started_at', from.toISOString())
            .order('sessions(started_at)', { ascending: true });

        if (error) throw error;

        // Extract max weight and max volume per session
        const progression = (data || []).map(item => {
            const completedSets = (item.sets || []).filter(s => s.is_completed);
            const maxWeight = completedSets.reduce((max, s) => Math.max(max, s.weight), 0);
            const totalVolume = completedSets.reduce((sum, s) => sum + (s.weight * s.reps), 0);
            const maxReps = completedSets.reduce((max, s) => Math.max(max, s.reps), 0);

            return {
                date: item.sessions.started_at,
                max_weight: maxWeight,
                max_reps: maxReps,
                total_volume: totalVolume,
                sets_count: completedSets.length,
            };
        });

        res.json(progression);
    } catch (err) {
        console.error('GET /stats/exercise/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/stats/calendar — Jours d'entraînement
router.get('/calendar', async (req, res) => {
    try {
        const { month, year } = req.query;
        const y = parseInt(year) || new Date().getFullYear();
        const m = parseInt(month) || new Date().getMonth() + 1;

        const startDate = new Date(y, m - 1, 1).toISOString();
        const endDate = new Date(y, m, 0, 23, 59, 59).toISOString();

        const { data, error } = await supabase
            .from('sessions')
            .select('id, started_at, finished_at, routines(name)')
            .eq('user_id', req.userId)
            .not('finished_at', 'is', null)
            .gte('started_at', startDate)
            .lte('started_at', endDate)
            .order('started_at');

        if (error) throw error;

        // Format as marked dates
        const markedDates = {};
        (data || []).forEach(session => {
            const dateKey = session.started_at.split('T')[0];
            if (!markedDates[dateKey]) {
                markedDates[dateKey] = { sessions: [] };
            }
            markedDates[dateKey].sessions.push({
                id: session.id,
                routine_name: session.routines?.name || 'Séance libre',
                started_at: session.started_at,
            });
        });

        res.json(markedDates);
    } catch (err) {
        console.error('GET /stats/calendar error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
