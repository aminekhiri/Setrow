import { useEffect, useRef, useCallback } from 'react';
import { useWorkoutStore } from '../store/workoutStore';

export const useTimer = () => {
    const intervalRef = useRef(null);
    const {
        restTimeRemaining,
        isRestTimerActive,
        restTimeDefault,
        startRestTimer,
        tickRestTimer,
        stopRestTimer,
        setRestTime,
    } = useWorkoutStore();

    useEffect(() => {
        if (isRestTimerActive && restTimeRemaining > 0) {
            intervalRef.current = setInterval(() => {
                tickRestTimer();
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRestTimerActive, restTimeRemaining]);

    const formatTime = useCallback((seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const progress = restTimeDefault > 0
        ? (restTimeDefault - restTimeRemaining) / restTimeDefault
        : 0;

    return {
        timeRemaining: restTimeRemaining,
        isActive: isRestTimerActive,
        defaultTime: restTimeDefault,
        formattedTime: formatTime(restTimeRemaining),
        progress,
        start: startRestTimer,
        stop: stopRestTimer,
        setTime: setRestTime,
    };
};
