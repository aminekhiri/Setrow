/**
 * Epley formula for estimated 1RM:
 * 1RM = weight × (1 + reps / 30)
 */
export const calculate1RM = (weight, reps) => {
    if (reps === 0 || weight === 0) return 0;
    if (reps === 1) return weight;
    return Math.round(weight * (1 + reps / 30) * 10) / 10;
};

/**
 * Calculate progress towards a goal
 * Returns a percentage 0-100
 */
export const calculateGoalProgress = (current, target) => {
    if (target <= 0) return 100;
    return Math.min(100, Math.round((current / target) * 100));
};

/**
 * Calculate the weight needed for a given reps target based on 1RM
 */
export const calculateWeightForReps = (oneRM, targetReps) => {
    if (targetReps <= 0 || oneRM <= 0) return 0;
    if (targetReps === 1) return oneRM;
    return Math.round(oneRM / (1 + targetReps / 30) * 10) / 10;
};

/**
 * Get intensity percentage based on reps
 */
export const getIntensity = (reps) => {
    if (reps <= 3) return { label: 'Force Max', color: '#F87171', percent: '90-100%' };
    if (reps <= 6) return { label: 'Force', color: '#FBBF24', percent: '80-90%' };
    if (reps <= 12) return { label: 'Hypertrophie', color: '#4ADE80', percent: '65-80%' };
    return { label: 'Endurance', color: '#45B7D1', percent: '50-65%' };
};
