import AsyncStorage from '@react-native-async-storage/async-storage';

// ⚠️ Remplace par l'IP de ta machine (visible via `hostname -I`)
const API_URL = 'http://192.168.50.110:3000/api';

let authToken = null;

export const setAuthToken = (token) => {
    authToken = token;
};

export const getAuthToken = () => authToken;

const request = async (endpoint, options = {}) => {
    const url = `${API_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
        const response = await fetch(url, {
            ...options,
            headers,
            body: options.body ? JSON.stringify(options.body) : undefined,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Erreur ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        if (error.message === 'Network request failed') {
            throw new Error('Impossible de se connecter au serveur');
        }
        throw error;
    }
};

export const api = {
    // Exercises
    getExercises: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/exercises${query ? `?${query}` : ''}`);
    },
    getExercise: (id) => request(`/exercises/${id}`),
    createExercise: (data) => request('/exercises', { method: 'POST', body: data }),
    deleteExercise: (id) => request(`/exercises/${id}`, { method: 'DELETE' }),
    toggleExerciseFavorite: (id) => request(`/exercises/${id}/favorite`, { method: 'POST' }),

    // Routines
    getRoutines: () => request('/routines'),
    getRoutine: (id) => request(`/routines/${id}`),
    createRoutine: (data) => request('/routines', { method: 'POST', body: data }),
    updateRoutine: (id, data) => request(`/routines/${id}`, { method: 'PUT', body: data }),
    deleteRoutine: (id) => request(`/routines/${id}`, { method: 'DELETE' }),
    toggleRoutineFavorite: (id) => request(`/routines/${id}/favorite`, { method: 'POST' }),

    // Sessions
    startSession: (data) => request('/sessions', { method: 'POST', body: data }),
    addSessionExercise: (sessionId, data) => request(`/sessions/${sessionId}/exercises`, { method: 'POST', body: data }),
    addSet: (sessionId, data) => request(`/sessions/${sessionId}/sets`, { method: 'POST', body: data }),
    updateSet: (sessionId, setId, data) => request(`/sessions/${sessionId}/sets/${setId}`, { method: 'PUT', body: data }),
    finishSession: (id, data) => request(`/sessions/${id}/finish`, { method: 'PUT', body: data }),
    getSessions: (params = {}) => {
        const query = new URLSearchParams(params).toString();
        return request(`/sessions${query ? `?${query}` : ''}`);
    },
    getSession: (id) => request(`/sessions/${id}`),
    getPreviousPerformance: (exerciseId) => request(`/sessions/previous/${exerciseId}`),

    // Profile
    getProfile: () => request('/profile'),
    updateProfile: (data) => request('/profile', { method: 'PUT', body: data }),
    logWeight: (data) => request('/profile/weight', { method: 'POST', body: data }),
    getWeightHistory: (period) => request(`/profile/weight-history?period=${period || ''}`),

    // Goals
    getGoals: () => request('/goals'),
    createGoal: (data) => request('/goals', { method: 'POST', body: data }),
    updateGoal: (id, data) => request(`/goals/${id}`, { method: 'PUT', body: data }),
    deleteGoal: (id) => request(`/goals/${id}`, { method: 'DELETE' }),

    // Stats
    getExerciseStats: (exerciseId, period) => request(`/stats/exercise/${exerciseId}?period=${period || ''}`),
    getCalendar: (month, year) => request(`/stats/calendar?month=${month}&year=${year}`),
};
