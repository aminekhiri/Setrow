require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { authMiddleware } = require('./middleware/auth');

const exercisesRouter = require('./routes/exercises');
const routinesRouter = require('./routes/routines');
const sessionsRouter = require('./routes/sessions');
const profileRouter = require('./routes/profile');
const goalsRouter = require('./routes/goals');
const statsRouter = require('./routes/stats');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Protected routes
app.use('/api/exercises', authMiddleware, exercisesRouter);
app.use('/api/routines', authMiddleware, routinesRouter);
app.use('/api/sessions', authMiddleware, sessionsRouter);
app.use('/api/profile', authMiddleware, profileRouter);
app.use('/api/goals', authMiddleware, goalsRouter);
app.use('/api/stats', authMiddleware, statsRouter);

// Error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({ error: 'Erreur interne du serveur' });
});

app.listen(PORT, () => {
    console.log(`🏋️ Setrow API running on port ${PORT}`);
});
