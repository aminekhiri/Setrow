const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/profile — Lire le profil
router.get('/', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('profiles')
            .select()
            .eq('user_id', req.userId)
            .single();

        if (error && error.code !== 'PGRST116') throw error;
        res.json(data || { user_id: req.userId });
    } catch (err) {
        console.error('GET /profile error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// PUT /api/profile — Mettre à jour le profil
router.put('/', async (req, res) => {
    try {
        const { first_name, last_name, weight, height, birth_date, gender } = req.body;

        // Upsert profile
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                user_id: req.userId,
                first_name,
                last_name,
                weight,
                height,
                birth_date,
                gender,
            }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;

        // Also log weight if provided
        if (weight) {
            await supabase.from('weight_logs').insert({
                user_id: req.userId,
                weight,
                logged_at: new Date().toISOString(),
            });
        }

        res.json(data);
    } catch (err) {
        console.error('PUT /profile error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/profile/weight — Enregistrer un poids
router.post('/weight', async (req, res) => {
    try {
        const { weight } = req.body;
        if (!weight) return res.status(400).json({ error: 'Poids requis' });

        const { data, error } = await supabase
            .from('weight_logs')
            .insert({
                user_id: req.userId,
                weight,
                logged_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) throw error;

        // Also update current profile weight
        await supabase
            .from('profiles')
            .upsert({ user_id: req.userId, weight }, { onConflict: 'user_id' });

        res.status(201).json(data);
    } catch (err) {
        console.error('POST /profile/weight error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/profile/weight-history — Historique du poids
router.get('/weight-history', async (req, res) => {
    try {
        const { period } = req.query; // day, week, month, year
        let from = new Date();

        switch (period) {
            case 'week':
                from.setDate(from.getDate() - 7);
                break;
            case 'month':
                from.setMonth(from.getMonth() - 1);
                break;
            case 'year':
                from.setFullYear(from.getFullYear() - 1);
                break;
            case 'day':
                from.setDate(from.getDate() - 1);
                break;
            default:
                from.setMonth(from.getMonth() - 3); // 3 months default
        }

        const { data, error } = await supabase
            .from('weight_logs')
            .select()
            .eq('user_id', req.userId)
            .gte('logged_at', from.toISOString())
            .order('logged_at', { ascending: true });

        if (error) throw error;

        // Deduplicate: keep only the last entry per day
        const byDay = {};
        (data || []).forEach(entry => {
            const dateKey = entry.logged_at.split('T')[0];
            byDay[dateKey] = entry; // last one wins since sorted ascending
        });
        const deduped = Object.values(byDay);

        res.json(deduped);
    } catch (err) {
        console.error('GET /profile/weight-history error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
