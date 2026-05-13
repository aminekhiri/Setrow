const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

/**
 * Auth middleware: verifies the JWT from Authorization header
 * and attaches user info to req.user
 */
async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token manquant ou invalide' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const supabase = createClient(supabaseUrl, supabaseAnonKey, {
            global: { headers: { Authorization: `Bearer ${token}` } },
        });

        const { data: { user }, error } = await supabase.auth.getUser(token);

        if (error || !user) {
            return res.status(401).json({ error: 'Token invalide ou expiré' });
        }

        req.user = user;
        req.userId = user.id;
        next();
    } catch (err) {
        console.error('Auth error:', err);
        return res.status(401).json({ error: 'Erreur d\'authentification' });
    }
}

module.exports = { authMiddleware };
