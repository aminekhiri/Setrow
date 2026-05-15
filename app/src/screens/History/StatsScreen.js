import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import { formatShortDate } from '../../utils/dateHelpers';
import ProgressChart from '../../components/charts/ProgressChart';
import WeightChart from '../../components/charts/WeightChart';
import Modal from '../../components/ui/Modal';

const EXERCISE_PERIODS = [
    { key: 'month', label: '1 mois' },
    { key: '3months', label: '3 mois' },
    { key: '6months', label: '6 mois' },
    { key: 'year', label: '1 an' },
];

export default function StatsScreen() {
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseStats, setExerciseStats] = useState([]);
    const [exercisePeriod, setExercisePeriod] = useState('3months');
    const [weightData, setWeightData] = useState([]);
    const [weightPeriod, setWeightPeriod] = useState('month');
    const [loading, setLoading] = useState(false);
    const [showPicker, setShowPicker] = useState(false);

    useEffect(() => {
        loadExercises();
        loadWeightHistory('month');
    }, []);

    const loadExercises = async () => {
        try {
            const data = await api.getExercises();
            setExercises(data);
        } catch (err) { console.error(err); }
    };

    const loadWeightHistory = async (period) => {
        try {
            const data = await api.getWeightHistory(period);
            setWeightData(data);
            setWeightPeriod(period);
        } catch (err) { console.error(err); }
    };

    const selectExercise = async (exercise) => {
        setSelectedExercise(exercise);
        setShowPicker(false);
        loadExerciseStats(exercise.id, exercisePeriod);
    };

    const loadExerciseStats = async (exerciseId, period) => {
        setLoading(true);
        try {
            const data = await api.getExerciseStats(exerciseId, period);
            setExerciseStats(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handlePeriodChange = (period) => {
        setExercisePeriod(period);
        if (selectedExercise) {
            loadExerciseStats(selectedExercise.id, period);
        }
    };

    const exerciseChartData = exerciseStats.map(s => ({
        value: s.max_weight,
        label: formatShortDate(s.date),
    }));

    const periodLabel = EXERCISE_PERIODS.find(p => p.key === exercisePeriod)?.label || '3 mois';

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>📈 Statistiques</Text>

            {/* Weight evolution */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Évolution du poids corporel</Text>
                <WeightChart
                    data={weightData}
                    selectedPeriod={weightPeriod}
                    onPeriodChange={loadWeightHistory}
                />
            </View>

            {/* Exercise progression */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Progression par exercice</Text>
                <TouchableOpacity style={styles.exercisePicker} onPress={() => setShowPicker(true)}>
                    <Text style={styles.exercisePickerText}>
                        {selectedExercise ? selectedExercise.name : 'Choisir un exercice...'}
                    </Text>
                </TouchableOpacity>

                {selectedExercise && (
                    <View style={styles.periodSelector}>
                        {EXERCISE_PERIODS.map(p => (
                            <TouchableOpacity
                                key={p.key}
                                onPress={() => handlePeriodChange(p.key)}
                                style={[styles.periodButton, exercisePeriod === p.key && styles.periodActive]}
                            >
                                <Text style={[styles.periodText, exercisePeriod === p.key && styles.periodTextActive]}>
                                    {p.label}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}

                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
                ) : selectedExercise ? (
                    <View style={{ marginTop: SPACING.sm }}>
                        <ProgressChart
                            data={exerciseChartData}
                            title={`${selectedExercise.name} — Poids max (${periodLabel})`}
                        />
                    </View>
                ) : null}
            </View>

            {/* Exercise picker modal */}
            <Modal visible={showPicker} onClose={() => setShowPicker(false)} title="Choisir un exercice">
                <ScrollView style={{ maxHeight: 400 }}>
                    {exercises.map(ex => (
                        <TouchableOpacity
                            key={ex.id}
                            onPress={() => selectExercise(ex)}
                            style={styles.exerciseOption}
                        >
                            <Text style={styles.exerciseOptionName}>{ex.name}</Text>
                            <Text style={styles.exerciseOptionMuscle}>{ex.muscle_group}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg },
    title: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '800', marginBottom: SPACING.xl },
    section: { marginBottom: SPACING.xxl },
    sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '600', marginBottom: SPACING.md },
    exercisePicker: {
        backgroundColor: COLORS.surface, padding: SPACING.lg, borderRadius: RADIUS.md,
        borderWidth: 1, borderColor: COLORS.border,
    },
    exercisePickerText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md },
    periodSelector: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginTop: SPACING.lg,
    },
    periodButton: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.surfaceLight,
    },
    periodActive: {
        backgroundColor: COLORS.primary,
    },
    periodText: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.xs,
        fontWeight: '500',
    },
    periodTextActive: {
        color: COLORS.white,
    },
    exerciseOption: {
        paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    exerciseOptionName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '500' },
    exerciseOptionMuscle: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, textTransform: 'capitalize' },
});
