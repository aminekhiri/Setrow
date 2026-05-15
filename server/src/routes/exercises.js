const express = require('express');
const router = express.Router();
const { supabase } = require('../config/supabase');

// GET /api/exercises — Liste des exercices (filtrable par muscle_group)
router.get('/', async (req, res) => {
    try {
        const { muscle_group, search, favorites_only } = req.query;
        const userId = req.userId;

        let query = supabase
            .from('exercises')
            .select('*, exercise_favorites!left(user_id)')
            .or(`created_by.is.null,created_by.eq.${userId}`);

        if (muscle_group) {
            query = query.eq('muscle_group', muscle_group);
        }

        if (search) {
            query = query.ilike('name', `%${search}%`);
        }

        query = query.order('muscle_group').order('name');

        const { data, error } = await query;

        if (error) throw error;

        const exercises = data.map(ex => ({
            ...ex,
            is_favorite: ex.exercise_favorites?.some(f => f.user_id === userId) || false,
            exercise_favorites: undefined,
        }));

        if (favorites_only === 'true') {
            return res.json(exercises.filter(e => e.is_favorite));
        }

        res.json(exercises);
    } catch (err) {
        console.error('GET /exercises error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// GET /api/exercises/:id — Détail d'un exercice
router.get('/:id', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('exercises')
            .select('*, exercise_favorites!left(user_id)')
            .eq('id', req.params.id)
            .single();

        if (error) throw error;
        if (!data) return res.status(404).json({ error: 'Exercice non trouvé' });

        data.is_favorite = data.exercise_favorites?.some(f => f.user_id === req.userId) || false;
        delete data.exercise_favorites;

        res.json(data);
    } catch (err) {
        console.error('GET /exercises/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/exercises — Créer un exercice custom
router.post('/', async (req, res) => {
    try {
        const { name, muscle_group, description, image_url, exercise_type } = req.body;

        if (!name || !muscle_group) {
            return res.status(400).json({ error: 'Nom et groupe musculaire requis' });
        }

        const { data, error } = await supabase
            .from('exercises')
            .insert({
                name,
                muscle_group,
                description: description || '',
                image_url: image_url || null,
                exercise_type: exercise_type || 'weighted',
                is_custom: true,
                created_by: req.userId,
            })
            .select()
            .single();

        if (error) throw error;
        res.status(201).json(data);
    } catch (err) {
        console.error('POST /exercises error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// POST /api/exercises/:id/favorite — Toggle favori
router.post('/:id/favorite', async (req, res) => {
    try {
        const exerciseId = req.params.id;
        const userId = req.userId;

        // Check if already favorited
        const { data: existing } = await supabase
            .from('exercise_favorites')
            .select()
            .eq('exercise_id', exerciseId)
            .eq('user_id', userId)
            .single();

        if (existing) {
            // Remove favorite
            await supabase
                .from('exercise_favorites')
                .delete()
                .eq('exercise_id', exerciseId)
                .eq('user_id', userId);
            res.json({ is_favorite: false });
        } else {
            // Add favorite
            await supabase
                .from('exercise_favorites')
                .insert({ exercise_id: exerciseId, user_id: userId });
            res.json({ is_favorite: true });
        }
    } catch (err) {
        console.error('POST /exercises/:id/favorite error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// DELETE /api/exercises/:id — Supprimer un exercice custom
router.delete('/:id', async (req, res) => {
    try {
        const { data: exercise } = await supabase
            .from('exercises')
            .select('created_by')
            .eq('id', req.params.id)
            .single();

        if (!exercise) return res.status(404).json({ error: 'Exercice non trouvé' });
        if (exercise.created_by !== req.userId) {
            return res.status(403).json({ error: 'Vous ne pouvez supprimer que vos exercices' });
        }

        const { error } = await supabase
            .from('exercises')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err) {
        console.error('DELETE /exercises/:id error:', err);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

module.exports = router;
