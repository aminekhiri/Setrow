import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import { useWorkoutStore } from '../store/workoutStore';

export const useTimer = () => {
    const intervalRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);
    const {
        restTimeRemaining,
        isRestTimerActive,
        restTimeDefault,
        restTimerEndAt, // timestamp when timer should reach 0
        startRestTimer,
        tickRestTimer,
        stopRestTimer,
        setRestTime,
        syncRestTimer,
    } = useWorkoutStore();

    // Handle app state changes (background → foreground)
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (appStateRef.current.match(/inactive|background/) && nextAppState === 'active') {
                // App came back to foreground — sync timer from stored end timestamp
                syncRestTimer();
            }
            appStateRef.current = nextAppState;
        });
        return () => subscription?.remove();
    }, [syncRestTimer]);

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
