import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useWorkoutStore = create(
    persist(
        (set, get) => ({
            // Current session state
            currentSession: null,
            currentExercises: [],
            currentExerciseIndex: 0,
            sets: {}, // { sessionExerciseId: [{ set_number, weight, reps, is_completed }] }
            isActive: false,
            sessionId: null,
            sessionStartedAt: null, // timestamp (ms) for session duration chrono

            // Rest timer
            restTimeByExercise: {}, // { exercise_id: seconds }
            restTimerDefaultFallback: 90,
            restTimerCurrentDuration: 90, // duration of the currently active timer
            restTimeRemaining: 0,
            isRestTimerActive: false,
            restTimerEndAt: null,

            // Start a new session
            startSession: (session, exercises, restTimeByExercise) => {
                const initialSets = {};
                exercises.forEach(ex => {
                    initialSets[ex.id] = [];
                });
                set({
                    currentSession: session,
                    sessionId: session.id,
                    currentExercises: exercises,
                    currentExerciseIndex: 0,
                    sets: initialSets,
                    isActive: true,
                    restTimeByExercise: restTimeByExercise || {},
                    restTimerDefaultFallback: 90,
                    sessionStartedAt: Date.now(),
                });
            },

            // Add a set for current exercise
            addSet: (sessionExerciseId, setData) => {
                const { sets } = get();
                const currentSets = sets[sessionExerciseId] || [];
                set({
                    sets: {
                        ...sets,
                        [sessionExerciseId]: [...currentSets, {
                            ...setData,
                            set_number: currentSets.length + 1,
                            is_completed: true,
                        }],
                    },
                });
            },

            // Navigate between exercises
            nextExercise: () => {
                const { currentExerciseIndex, currentExercises } = get();
                if (currentExerciseIndex < currentExercises.length - 1) {
                    set({ currentExerciseIndex: currentExerciseIndex + 1 });
                }
            },

            previousExercise: () => {
                const { currentExerciseIndex } = get();
                if (currentExerciseIndex > 0) {
                    set({ currentExerciseIndex: currentExerciseIndex - 1 });
                }
            },

            goToExercise: (index) => {
                set({ currentExerciseIndex: index });
            },

            // Rest timer - stores end timestamp for background survival
            startRestTimer: (exerciseId) => {
                const { restTimeByExercise, restTimerDefaultFallback } = get();
                const duration = (exerciseId && restTimeByExercise[exerciseId]) || restTimerDefaultFallback;
                set({
                    restTimerCurrentDuration: duration,
                    restTimeRemaining: duration,
                    isRestTimerActive: true,
                    restTimerEndAt: Date.now() + duration * 1000,
                });
            },

            // Sync timer from stored end timestamp (called when app returns from background)
            syncRestTimer: () => {
                const { restTimerEndAt, isRestTimerActive } = get();
                if (!isRestTimerActive || !restTimerEndAt) return;
                const remaining = Math.max(0, Math.ceil((restTimerEndAt - Date.now()) / 1000));
                if (remaining <= 0) {
                    set({ isRestTimerActive: false, restTimeRemaining: 0, restTimerEndAt: null });
                } else {
                    set({ restTimeRemaining: remaining });
                }
            },

            tickRestTimer: () => {
                const { restTimeRemaining } = get();
                if (restTimeRemaining > 0) {
                    set({ restTimeRemaining: restTimeRemaining - 1 });
                } else {
                    set({ isRestTimerActive: false, restTimerEndAt: null });
                }
            },

            stopRestTimer: () => {
                set({ isRestTimerActive: false, restTimeRemaining: 0, restTimerEndAt: null });
            },

            // Change timer duration for a specific exercise
            setRestTime: (exerciseId, seconds) => {
                const { restTimeByExercise, isRestTimerActive } = get();
                const updated = { ...restTimeByExercise, [exerciseId]: seconds };
                if (isRestTimerActive) {
                    set({
                        restTimeByExercise: updated,
                        restTimerCurrentDuration: seconds,
                        restTimeRemaining: seconds,
                        restTimerEndAt: Date.now() + seconds * 1000,
                    });
                } else {
                    set({ restTimeByExercise: updated });
                }
            },

            finishSession: () => {
                set({
                    currentSession: null,
                    sessionId: null,
                    currentExercises: [],
                    currentExerciseIndex: 0,
                    sets: {},
                    isActive: false,
                    isRestTimerActive: false,
                    restTimeRemaining: 0,
                    restTimerEndAt: null,
                    restTimeByExercise: {},
                    restTimerCurrentDuration: 90,
                    sessionStartedAt: null,
                });
            },

            // Add exercise to current session
            addExerciseToSession: (exercise) => {
                const { currentExercises, sets } = get();
                set({
                    currentExercises: [...currentExercises, exercise],
                    sets: { ...sets, [exercise.id]: [] },
                });
            },
        }),
        {
            name: 'setrow-workout',
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
