import { useEffect, useRef, useCallback } from 'react';
import { AppState } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useWorkoutStore } from '../store/workoutStore';

// Configure notification handler so notifications show even in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
    }),
});

const requestNotificationPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
};

const scheduleTimerNotification = async (seconds) => {
    try {
        const granted = await requestNotificationPermissions();
        if (!granted) return;

        // Cancel any existing timer notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        await Notifications.scheduleNotificationAsync({
            content: {
                title: '⏱ Repos terminé !',
                body: 'Reprends ta séance ! 💪',
                sound: true,
            },
            trigger: {
                type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
                seconds: Math.max(1, seconds),
            },
        });
    } catch (err) {
        console.warn('Notification scheduling error:', err);
    }
};

const cancelTimerNotification = async () => {
    try {
        await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (err) {
        console.warn('Notification cancel error:', err);
    }
};

export const useTimer = () => {
    const intervalRef = useRef(null);
    const appStateRef = useRef(AppState.currentState);
    const {
        restTimeRemaining,
        isRestTimerActive,
        restTimerCurrentDuration,
        restTimerEndAt,
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
                // Cancel notification since user is back in the app
                cancelTimerNotification();
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
            // Timer just finished — cancel notification (we're in the app)
            if (!isRestTimerActive) {
                cancelTimerNotification();
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

    const progress = restTimerCurrentDuration > 0
        ? (restTimerCurrentDuration - restTimeRemaining) / restTimerCurrentDuration
        : 0;

    // Wrapped start that also schedules a notification
    const startWithNotification = useCallback((exerciseId) => {
        startRestTimer(exerciseId);
        // Read the resolved duration from store after starting
        setTimeout(() => {
            const { restTimerCurrentDuration: d } = useWorkoutStore.getState();
            scheduleTimerNotification(d);
        }, 0);
    }, [startRestTimer]);

    // Wrapped stop that also cancels the notification
    const stopWithNotification = useCallback(() => {
        stopRestTimer();
        cancelTimerNotification();
    }, [stopRestTimer]);

    // Wrapped setTime that also reschedules the notification
    const setTimeWithNotification = useCallback((exerciseId, seconds) => {
        setRestTime(exerciseId, seconds);
        const { isRestTimerActive: active } = useWorkoutStore.getState();
        if (active) {
            scheduleTimerNotification(seconds);
        }
    }, [setRestTime]);

    return {
        timeRemaining: restTimeRemaining,
        isActive: isRestTimerActive,
        currentDuration: restTimerCurrentDuration,
        formattedTime: formatTime(restTimeRemaining),
        progress,
        start: startWithNotification,
        stop: stopWithNotification,
        setTime: setTimeWithNotification,
    };
};
