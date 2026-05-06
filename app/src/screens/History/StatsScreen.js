import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import { formatShortDate } from '../../utils/dateHelpers';
import ProgressChart from '../../components/charts/ProgressChart';
import WeightChart from '../../components/charts/WeightChart';
import Modal from '../../components/ui/Modal';

export default function StatsScreen() {
    const [exercises, setExercises] = useState([]);
    const [selectedExercise, setSelectedExercise] = useState(null);
    const [exerciseStats, setExerciseStats] = useState([]);
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
        setLoading(true);
        try {
            const data = await api.getExerciseStats(exercise.id, '3months');
            setExerciseStats(data);
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const exerciseChartData = exerciseStats.map(s => ({
        value: s.max_weight,
        label: formatShortDate(s.date),
    }));

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

                {loading ? (
                    <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
                ) : selectedExercise ? (
                    <View style={{ marginTop: SPACING.lg }}>
                        <ProgressChart
                            data={exerciseChartData}
                            title={`${selectedExercise.name} — Poids max (3 mois)`}
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
    exerciseOption: {
        paddingVertical: SPACING.md, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    exerciseOptionName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '500' },
    exerciseOptionMuscle: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, textTransform: 'capitalize' },
});
