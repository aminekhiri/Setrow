import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, FlatList, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import ExerciseCard from '../../components/workout/ExerciseCard';

export default function CreateRoutineScreen({ route, navigation }) {
    const routineId = route.params?.routineId;
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showExercisePicker, setShowExercisePicker] = useState(false);
    const [allExercises, setAllExercises] = useState([]);
    const [loadingExercises, setLoadingExercises] = useState(false);

    useEffect(() => {
        if (routineId) loadRoutine();
    }, [routineId]);

    const loadRoutine = async () => {
        try {
            const data = await api.getRoutine(routineId);
            setName(data.name);
            setDescription(data.description || '');
            setExercises(
                (data.routine_exercises || []).map(re => ({
                    exercise_id: re.exercise_id,
                    name: re.exercises?.name || '',
                    muscle_group: re.exercises?.muscle_group || '',
                    target_sets: re.target_sets || 4,
                    target_reps: re.target_reps || 10,
                    rest_time_seconds: re.rest_time_seconds || 90,
                }))
            );
        } catch (err) {
            console.error(err);
        }
    };

    const openExercisePicker = async () => {
        setShowExercisePicker(true);
        setLoadingExercises(true);
        try {
            const data = await api.getExercises();
            setAllExercises(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingExercises(false);
        }
    };

    const addExercise = (exercise) => {
        setExercises(prev => [...prev, {
            exercise_id: exercise.id,
            name: exercise.name,
            muscle_group: exercise.muscle_group,
            target_sets: 4,
            target_reps: 10,
            rest_time_seconds: 90,
        }]);
        setShowExercisePicker(false);
    };

    const removeExercise = (index) => {
        setExercises(prev => prev.filter((_, i) => i !== index));
    };

    const updateExercise = (index, field, value) => {
        setExercises(prev => prev.map((ex, i) =>
            i === index ? { ...ex, [field]: value } : ex
        ));
    };

    const handleSave = async () => {
        if (!name.trim()) { Alert.alert('Erreur', 'Nom requis'); return; }
        if (exercises.length === 0) { Alert.alert('Erreur', 'Ajoute au moins un exercice'); return; }

        setLoading(true);
        try {
            const routineData = {
                name: name.trim(),
                description: description.trim(),
                exercises: exercises.map(ex => ({
                    exercise_id: ex.exercise_id,
                    target_sets: parseInt(ex.target_sets) || 4,
                    target_reps: parseInt(ex.target_reps) || 10,
                    rest_time_seconds: parseInt(ex.rest_time_seconds) || 90,
                })),
            };

            if (routineId) {
                await api.updateRoutine(routineId, routineData);
            } else {
                await api.createRoutine(routineData);
            }
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>{routineId ? 'Modifier la routine' : 'Nouvelle routine'}</Text>

            <Input label="Nom de la routine" value={name} onChangeText={setName} placeholder="Ex: Push Day" />
            <Input label="Description (optionnel)" value={description} onChangeText={setDescription} placeholder="Notes..." multiline />

            {/* Exercises list */}
            <View style={styles.exercisesSection}>
                <Text style={styles.sectionTitle}>Exercices ({exercises.length})</Text>

                {exercises.map((ex, index) => (
                    <View key={index} style={styles.exerciseRow}>
                        <View style={styles.exerciseInfo}>
                            <Text style={styles.exerciseName}>{ex.name}</Text>
                            <Text style={styles.exerciseMuscle}>{ex.muscle_group}</Text>
                        </View>
                        <View style={styles.targetInputs}>
                            <View style={styles.targetInput}>
                                <Text style={styles.targetLabel}>Séries</Text>
                                <Input
                                    value={ex.target_sets !== undefined ? ex.target_sets.toString() : ''}
                                    onChangeText={(v) => updateExercise(index, 'target_sets', v)}
                                    keyboardType="number-pad"
                                    style={styles.smallInput}
                                />
                            </View>
                            <View style={styles.targetInput}>
                                <Text style={styles.targetLabel}>Reps</Text>
                                <Input
                                    value={ex.target_reps !== undefined ? ex.target_reps.toString() : ''}
                                    onChangeText={(v) => updateExercise(index, 'target_reps', v)}
                                    keyboardType="number-pad"
                                    style={styles.smallInput}
                                />
                            </View>
                            <View style={styles.targetInput}>
                                <Text style={styles.targetLabel}>Repos(s)</Text>
                                <Input
                                    value={ex.rest_time_seconds !== undefined ? ex.rest_time_seconds.toString() : ''}
                                    onChangeText={(v) => updateExercise(index, 'rest_time_seconds', v)}
                                    keyboardType="number-pad"
                                    style={styles.smallInput}
                                />
                            </View>
                            <TouchableOpacity onPress={() => removeExercise(index)} style={styles.removeBtn}>
                                <Ionicons name="close-circle" size={22} color={COLORS.danger} />
                            </TouchableOpacity>
                        </View>
                    </View>
                ))}

                <Button
                    title="Ajouter un exercice"
                    variant="secondary"
                    icon={<Ionicons name="add" size={18} color={COLORS.text} />}
                    onPress={openExercisePicker}
                    style={{ marginTop: SPACING.md }}
                />
            </View>

            <Button
                title={routineId ? 'Sauvegarder' : 'Créer la routine'}
                onPress={handleSave}
                loading={loading}
                style={{ marginTop: SPACING.xl }}
            />

            {/* Exercise picker modal */}
            <Modal visible={showExercisePicker} onClose={() => setShowExercisePicker(false)} title="Choisir un exercice">
                {loadingExercises ? (
                    <ActivityIndicator color={COLORS.primary} style={{ paddingVertical: 40 }} />
                ) : (
                    <FlatList
                        data={allExercises}
                        keyExtractor={item => item.id}
                        style={{ maxHeight: 400 }}
                        renderItem={({ item }) => (
                            <ExerciseCard
                                exercise={item}
                                onPress={() => addExercise(item)}
                                showFavorite={false}
                            />
                        )}
                    />
                )}
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.xl },
    title: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '800', marginBottom: SPACING.xl },
    exercisesSection: { marginTop: SPACING.md },
    sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '600', marginBottom: SPACING.md },
    exerciseRow: {
        backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.md,
        marginBottom: SPACING.sm, borderWidth: 1, borderColor: COLORS.border,
    },
    exerciseInfo: { marginBottom: SPACING.sm },
    exerciseName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600' },
    exerciseMuscle: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, textTransform: 'capitalize' },
    targetInputs: { flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.md },
    targetInput: { flex: 1 },
    targetLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: 2 },
    smallInput: { marginBottom: 0 },
    removeBtn: { padding: SPACING.xs, marginBottom: SPACING.md },
});
