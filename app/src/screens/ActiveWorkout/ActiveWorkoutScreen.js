import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, SafeAreaView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import { useWorkoutStore } from '../../store/workoutStore';
import SetRow from '../../components/workout/SetRow';
import RestTimer from '../../components/workout/RestTimer';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function ActiveWorkoutScreen({ route, navigation }) {
    const routineId = route.params?.routineId;
    const {
        currentExercises, currentExerciseIndex, sets, isActive,
        startSession, addSet, goToExercise,
        startRestTimer, stopRestTimer, finishSession: clearSession,
    } = useWorkoutStore();

    const [loading, setLoading] = useState(true);
    const [previousPerfs, setPreviousPerfs] = useState({});
    const [sessionId, setSessionId] = useState(null);
    const [routineData, setRoutineData] = useState(null);

    useEffect(() => {
        // Always start fresh — clear stale sessions
        clearSession();
        initSession();
    }, []);

    const initSession = async () => {
        try {
            let routine = null;
            if (routineId) {
                routine = await api.getRoutine(routineId);
                setRoutineData(routine);
            }

            // Start session on server — returns session WITH session_exercises
            const session = await api.startSession({ routine_id: routineId });
            setSessionId(session.id);

            // Build exercises from server session_exercises (these have the correct PKs)
            const sessionExercises = session.session_exercises || [];
            const routineExercises = routine?.routine_exercises || [];

            const exercises = sessionExercises.map(se => {
                const re = routineExercises.find(r => r.exercise_id === se.exercise_id);
                return {
                    id: se.id, // server session_exercise PK
                    exercise_id: se.exercise_id,
                    name: se.exercises?.name || '',
                    muscle_group: se.exercises?.muscle_group || '',
                    target_sets: re?.target_sets || 4,
                    target_reps: re?.target_reps || 10,
                };
            });

            startSession(session, exercises, routine?.rest_time_seconds || 90);

            // Load previous performances
            const perfs = {};
            for (const ex of exercises) {
                try {
                    const prev = await api.getPreviousPerformance(ex.exercise_id);
                    if (prev && prev.sets) perfs[ex.exercise_id] = prev.sets;
                } catch (e) { /* ignore */ }
            }
            setPreviousPerfs(perfs);
        } catch (err) {
            console.error('Init error:', err);
            Alert.alert('Erreur', 'Impossible de démarrer la séance');
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleValidateSet = async (exerciseId, setData) => {
        addSet(exerciseId, setData);

        try {
            if (sessionId) {
                await api.addSet(sessionId, {
                    session_exercise_id: exerciseId,
                    set_number: (sets[exerciseId]?.length || 0) + 1,
                    weight: setData.weight,
                    reps: setData.reps,
                });
            }
        } catch (err) {
            console.error('Save set error:', err);
        }

        startRestTimer();
    };

    const handleSkipTimer = () => {
        stopRestTimer();
    };

    const handleFinish = () => {
        Alert.alert('Terminer la séance ?', 'Tes données sont sauvegardées.', [
            { text: 'Continuer', style: 'cancel' },
            {
                text: 'Terminer', style: 'destructive',
                onPress: async () => {
                    try {
                        if (sessionId) await api.finishSession(sessionId, {});
                    } catch (e) { /* ignore */ }

                    const recapData = buildRecapData();
                    clearSession();
                    navigation.replace('SessionRecap', { recap: recapData });
                },
            },
        ]);
    };

    const buildRecapData = () => {
        let totalSets = 0;
        let totalVolume = 0;
        const exerciseRecaps = [];

        currentExercises.forEach(ex => {
            const exSets = sets[ex.id] || [];
            const prevSets = previousPerfs[ex.exercise_id] || [];
            let exVolume = 0, maxWeight = 0, prevMaxWeight = 0, prevVolume = 0;

            exSets.forEach(s => {
                exVolume += (s.weight || 0) * (s.reps || 0);
                if (s.weight > maxWeight) maxWeight = s.weight;
            });
            prevSets.forEach(s => {
                prevVolume += (s.weight || 0) * (s.reps || 0);
                if (s.weight > prevMaxWeight) prevMaxWeight = s.weight;
            });

            totalSets += exSets.length;
            totalVolume += exVolume;

            exerciseRecaps.push({
                name: ex.name,
                muscle_group: ex.muscle_group,
                setsCount: exSets.length,
                targetSets: ex.target_sets,
                maxWeight, prevMaxWeight,
                volume: exVolume, prevVolume,
                weightDiff: prevMaxWeight > 0 ? Math.round(((maxWeight - prevMaxWeight) / prevMaxWeight) * 100) : null,
                volumeDiff: prevVolume > 0 ? Math.round(((exVolume - prevVolume) / prevVolume) * 100) : null,
            });
        });

        return {
            routineName: routineData?.name || 'Séance libre',
            totalSets, totalVolume,
            exerciseCount: currentExercises.length,
            exercises: exerciseRecaps,
        };
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={COLORS.primary} size="large" />
                <Text style={{ color: COLORS.textSecondary, marginTop: SPACING.lg }}>Chargement de la séance...</Text>
            </View>
        );
    }

    if (!currentExercises || currentExercises.length === 0) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: SPACING.xxl }]}>
                <Text style={{ color: COLORS.textSecondary }}>Aucun exercice dans cette séance</Text>
                <Button title="Retour" onPress={() => navigation.goBack()} style={{ marginTop: SPACING.lg }} />
            </View>
        );
    }

    const currentExercise = currentExercises[currentExerciseIndex];
    const currentSets = sets[currentExercise?.id] || [];
    const prevPerf = previousPerfs[currentExercise?.exercise_id] || [];
    const targetSets = currentExercise?.target_sets || 4;

    return (
        <SafeAreaView style={styles.container}>
            {/* Header with prominent FINISH button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="close" size={22} color={COLORS.textMuted} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{routineData?.name || 'Séance'}</Text>
                <TouchableOpacity onPress={handleFinish} style={styles.finishBtn}>
                    <Ionicons name="checkmark-done" size={18} color={COLORS.white} />
                    <Text style={styles.finishText}>Terminer</Text>
                </TouchableOpacity>
            </View>

            {/* Exercise tabs */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabs} contentContainerStyle={styles.tabsContent}>
                {currentExercises.map((ex, i) => (
                    <TouchableOpacity
                        key={ex.id}
                        onPress={() => goToExercise(i)}
                        style={[styles.tab, i === currentExerciseIndex && styles.tabActive]}
                    >
                        <Text style={[styles.tabText, i === currentExerciseIndex && styles.tabTextActive]} numberOfLines={1}>
                            {ex.name}
                        </Text>
                        {(sets[ex.id]?.length || 0) > 0 && (
                            <View style={[styles.tabBadge, (sets[ex.id]?.length || 0) >= (ex.target_sets || 4) && styles.tabBadgeDone]}>
                                <Text style={styles.tabBadgeText}>{sets[ex.id].length}</Text>
                            </View>
                        )}
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView style={styles.exerciseContent} contentContainerStyle={styles.exerciseContentInner}>
                <View style={styles.exerciseHeader}>
                    <Text style={styles.exerciseName}>{currentExercise?.name}</Text>
                    <Badge label={currentExercise?.muscle_group} />
                    <Text style={styles.target}>
                        Objectif: {targetSets} × {currentExercise?.target_reps || 10} reps — {currentSets.length}/{targetSets} validées
                    </Text>
                </View>

                {prevPerf.length > 0 && (
                    <View style={styles.previousBox}>
                        <Text style={styles.previousTitle}>📊 Dernière séance</Text>
                        {prevPerf.map((s, i) => (
                            <Text key={i} style={styles.previousLine}>S{s.set_number}: {s.weight}kg × {s.reps} reps</Text>
                        ))}
                    </View>
                )}

                {/* Completed sets */}
                {currentSets.map((s, i) => (
                    <SetRow key={`done-${i}`} setNumber={i + 1} weight={s.weight} reps={s.reps} isCompleted={true}
                        previousWeight={prevPerf[i]?.weight} previousReps={prevPerf[i]?.reps} />
                ))}

                {/* ONE new set at a time */}
                {currentSets.length < targetSets && (
                    <SetRow key={`new-${currentSets.length}`} setNumber={currentSets.length + 1}
                        previousWeight={prevPerf[currentSets.length]?.weight} previousReps={prevPerf[currentSets.length]?.reps}
                        onValidate={(data) => handleValidateSet(currentExercise.id, data)} />
                )}

                {currentSets.length >= targetSets && (
                    <View style={styles.allDone}>
                        <Ionicons name="checkmark-circle" size={32} color={COLORS.success} />
                        <Text style={styles.allDoneText}>Objectif atteint ! 💪</Text>
                        <SetRow key={`extra-${currentSets.length}`} setNumber={currentSets.length + 1}
                            onValidate={(data) => handleValidateSet(currentExercise.id, data)} />
                    </View>
                )}
            </ScrollView>

            <RestTimer onSkip={handleSkipTimer} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    header: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    backBtn: { padding: 4 },
    headerTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600', flex: 1, textAlign: 'center', marginHorizontal: SPACING.sm },
    finishBtn: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        backgroundColor: COLORS.success, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full,
    },
    finishText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '700' },
    tabs: { maxHeight: 44, borderBottomWidth: 1, borderBottomColor: COLORS.border },
    tabsContent: { paddingHorizontal: SPACING.md, gap: SPACING.xs, alignItems: 'center' },
    tab: {
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
        flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    },
    tabActive: { backgroundColor: COLORS.primaryGlow, borderWidth: 1, borderColor: COLORS.primary },
    tabText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, maxWidth: 100 },
    tabTextActive: { color: COLORS.primary, fontWeight: '600' },
    tabBadge: { backgroundColor: COLORS.primary, borderRadius: 10, width: 18, height: 18, alignItems: 'center', justifyContent: 'center' },
    tabBadgeDone: { backgroundColor: COLORS.success },
    tabBadgeText: { color: COLORS.white, fontSize: 10, fontWeight: '700' },
    exerciseContent: { flex: 1 },
    exerciseContentInner: { padding: SPACING.lg, paddingBottom: 200 },
    exerciseHeader: { marginBottom: SPACING.lg, gap: SPACING.xs },
    exerciseName: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '800' },
    target: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
    previousBox: {
        backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
        marginBottom: SPACING.lg, borderLeftWidth: 3, borderLeftColor: COLORS.warning,
    },
    previousTitle: { color: COLORS.warning, fontSize: FONTS.sizes.sm, fontWeight: '600', marginBottom: SPACING.xs },
    previousLine: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, lineHeight: 20 },
    allDone: { alignItems: 'center', paddingVertical: SPACING.lg, gap: SPACING.sm },
    allDoneText: { color: COLORS.success, fontSize: FONTS.sizes.md, fontWeight: '600' },
});
