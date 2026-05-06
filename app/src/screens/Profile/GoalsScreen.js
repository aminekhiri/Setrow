import React, { useState, useCallback, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal as RNModal } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function GoalsScreen({ navigation }) {
    const [activeTab, setActiveTab] = useState('calendar'); // 'calendar' | 'goals' | 'stats'
    const [goals, setGoals] = useState([]);
    const [markedDates, setMarkedDates] = useState({});
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Goal creation state
    const [showGoalModal, setShowGoalModal] = useState(false);
    const [goalExercise, setGoalExercise] = useState('');
    const [goalWeight, setGoalWeight] = useState('');
    const [goalReps, setGoalReps] = useState('');
    const [exercises, setExercises] = useState([]);
    const [selectedExerciseId, setSelectedExerciseId] = useState(null);
    const [exerciseSearch, setExerciseSearch] = useState('');

    const weightRef = useRef(null);
    const repsRef = useRef(null);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    const loadData = async () => {
        setLoading(true);
        try {
            const [goalsData, sessionsData] = await Promise.all([
                api.getGoals().catch(() => []),
                api.getSessions({ limit: 30 }).catch(() => []),
            ]);
            setGoals(goalsData);
            setSessions(sessionsData);

            // Build marked dates from sessions
            const marks = {};
            sessionsData.forEach(s => {
                const dateKey = s.started_at?.split('T')[0];
                if (dateKey) {
                    marks[dateKey] = {
                        marked: true,
                        dotColor: COLORS.primary,
                        selectedColor: COLORS.primary,
                    };
                }
            });
            setMarkedDates(marks);
        } catch (err) {
            console.error('Load error:', err);
        }
        setLoading(false);
    };

    const openGoalModal = async () => {
        setShowGoalModal(true);
        setGoalExercise('');
        setGoalWeight('');
        setGoalReps('');
        setSelectedExerciseId(null);
        setExerciseSearch('');
        try {
            const exs = await api.getExercises();
            setExercises(exs);
        } catch (e) { console.error(e); }
    };

    const handleCreateGoal = async () => {
        if (!selectedExerciseId) { Alert.alert('Erreur', 'Choisis un exercice'); return; }
        if (!goalWeight && !goalReps) { Alert.alert('Erreur', 'Entre un objectif de poids ou de reps'); return; }
        try {
            await api.createGoal({
                exercise_id: selectedExerciseId,
                target_weight: parseFloat(goalWeight) || 0,
                target_reps: parseInt(goalReps) || 0,
            });
            setShowGoalModal(false);
            loadData();
        } catch (err) {
            Alert.alert('Erreur', err.message);
        }
    };

    const handleDeleteGoal = (id) => {
        Alert.alert('Supprimer', 'Supprimer cet objectif ?', [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive', onPress: async () => {
                    try { await api.deleteGoal(id); loadData(); } catch (e) { console.error(e); }
                }
            },
        ]);
    };

    const handleDayPress = (day) => {
        const session = sessions.find(s => s.started_at?.startsWith(day.dateString));
        if (session) {
            navigation.navigate('SessionDetail', { sessionId: session.id });
        }
    };

    const filteredExercises = exercises.filter(e =>
        e.name.toLowerCase().includes(exerciseSearch.toLowerCase())
    );

    if (loading) {
        return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            {/* Tabs: Calendar / Goals / Stats */}
            <View style={styles.tabBar}>
                {[
                    { key: 'calendar', label: 'Calendrier', icon: 'calendar' },
                    { key: 'goals', label: 'Objectifs', icon: 'trophy' },
                ].map(tab => (
                    <TouchableOpacity
                        key={tab.key}
                        onPress={() => setActiveTab(tab.key)}
                        style={[styles.tabItem, activeTab === tab.key && styles.tabItemActive]}
                    >
                        <Ionicons name={tab.icon} size={16} color={activeTab === tab.key ? COLORS.primary : COLORS.textMuted} />
                        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
                {activeTab === 'calendar' && (
                    <>
                        <Calendar
                            markedDates={markedDates}
                            onDayPress={handleDayPress}
                            theme={{
                                backgroundColor: COLORS.background,
                                calendarBackground: COLORS.background,
                                textSectionTitleColor: COLORS.textMuted,
                                dayTextColor: COLORS.text,
                                todayTextColor: COLORS.primary,
                                monthTextColor: COLORS.text,
                                arrowColor: COLORS.primary,
                                textDisabledColor: COLORS.textMuted + '40',
                                dotColor: COLORS.primary,
                                textDayFontWeight: '500',
                                textMonthFontWeight: '700',
                            }}
                        />

                        <View style={styles.statsStrip}>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{Object.keys(markedDates).length}</Text>
                                <Text style={styles.statLabel}>Séances</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statValue}>{sessions.length > 0 ? sessions.length : 0}</Text>
                                <Text style={styles.statLabel}>Ce mois</Text>
                            </View>
                        </View>

                        {sessions.length > 0 && (
                            <>
                                <Text style={styles.sectionTitle}>Séances récentes</Text>
                                {sessions.slice(0, 5).map(s => {
                                    const date = new Date(s.started_at);
                                    const exerciseCount = s.session_exercises?.length || 0;
                                    return (
                                        <Card key={s.id} onPress={() => navigation.navigate('SessionDetail', { sessionId: s.id })} style={styles.sessionCard}>
                                            <View style={styles.sessionRow}>
                                                <View>
                                                    <Text style={styles.sessionName}>{s.routines?.name || 'Séance libre'}</Text>
                                                    <Text style={styles.sessionDate}>
                                                        {date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                        {' • '}{exerciseCount} exercices
                                                    </Text>
                                                </View>
                                                <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
                                            </View>
                                        </Card>
                                    );
                                })}
                            </>
                        )}
                    </>
                )}

                {activeTab === 'goals' && (
                    <>
                        <Button title="➕ Nouvel objectif" onPress={openGoalModal} style={{ marginBottom: SPACING.lg }} />

                        {goals.length === 0 ? (
                            <View style={styles.emptyGoals}>
                                <Ionicons name="trophy-outline" size={48} color={COLORS.textMuted} />
                                <Text style={styles.emptyText}>Aucun objectif défini</Text>
                                <Text style={styles.emptySubtext}>Définis des objectifs pour suivre ta progression</Text>
                            </View>
                        ) : goals.map(g => {
                            const progress = g.current_value && g.target_weight > 0
                                ? Math.min(100, Math.round((g.current_value / g.target_weight) * 100))
                                : 0;
                            const isAchieved = progress >= 100;

                            return (
                                <Card key={g.id} style={styles.goalCard}>
                                    <View style={styles.goalHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.goalName}>{g.exercises?.name || 'Exercice'}</Text>
                                            <Badge label={g.exercises?.muscle_group} />
                                        </View>
                                        <TouchableOpacity onPress={() => handleDeleteGoal(g.id)}>
                                            <Ionicons name="trash-outline" size={16} color={COLORS.textMuted} />
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.goalTarget}>
                                        <Text style={styles.goalTargetText}>
                                            🎯 {g.target_weight > 0 ? `${g.target_weight} kg` : ''}{g.target_weight > 0 && g.target_reps > 0 ? ' × ' : ''}{g.target_reps > 0 ? `${g.target_reps} reps` : ''}
                                        </Text>
                                        {isAchieved && <Text style={styles.achieved}>✅ Atteint !</Text>}
                                    </View>

                                    <View style={styles.progressBarBg}>
                                        <View style={[styles.progressBarFg, { width: `${progress}%`, backgroundColor: isAchieved ? COLORS.success : COLORS.primary }]} />
                                    </View>
                                    <Text style={styles.progressText}>{progress}%</Text>
                                </Card>
                            );
                        })}
                    </>
                )}
            </ScrollView>

            {/* Goal creation modal */}
            <RNModal visible={showGoalModal} animationType="slide" transparent>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Nouvel objectif</Text>
                            <TouchableOpacity onPress={() => setShowGoalModal(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Exercise search */}
                        <Text style={styles.fieldLabel}>Exercice</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Rechercher un exercice..."
                            placeholderTextColor={COLORS.textMuted}
                            value={exerciseSearch}
                            onChangeText={setExerciseSearch}
                            autoFocus={false}
                        />

                        {exerciseSearch.length > 0 && (
                            <ScrollView style={styles.exerciseDropdown} nestedScrollEnabled>
                                {filteredExercises.slice(0, 8).map(ex => (
                                    <TouchableOpacity
                                        key={ex.id}
                                        onPress={() => {
                                            setSelectedExerciseId(ex.id);
                                            setExerciseSearch(ex.name);
                                        }}
                                        style={[styles.exerciseOption, selectedExerciseId === ex.id && styles.exerciseOptionActive]}
                                    >
                                        <Text style={styles.exerciseOptionText}>{ex.name}</Text>
                                        <Badge label={ex.muscle_group} />
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        )}

                        {selectedExerciseId && (
                            <View style={styles.selectedExBadge}>
                                <Ionicons name="checkmark-circle" size={16} color={COLORS.success} />
                                <Text style={styles.selectedExText}>{exerciseSearch}</Text>
                            </View>
                        )}

                        <View style={styles.goalInputRow}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Poids cible (kg)</Text>
                                <TextInput
                                    ref={weightRef}
                                    style={styles.input}
                                    placeholder="ex: 100"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={goalWeight}
                                    onChangeText={setGoalWeight}
                                    keyboardType="decimal-pad"
                                    returnKeyType="next"
                                    onSubmitEditing={() => repsRef.current?.focus()}
                                />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.fieldLabel}>Reps cibles</Text>
                                <TextInput
                                    ref={repsRef}
                                    style={styles.input}
                                    placeholder="ex: 8"
                                    placeholderTextColor={COLORS.textMuted}
                                    value={goalReps}
                                    onChangeText={setGoalReps}
                                    keyboardType="number-pad"
                                    returnKeyType="done"
                                />
                            </View>
                        </View>

                        <Button title="Créer l'objectif" onPress={handleCreateGoal} style={{ marginTop: SPACING.lg }} />
                    </View>
                </View>
            </RNModal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    tabBar: {
        flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
        gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    tabItem: {
        flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
        paddingVertical: SPACING.sm, borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    },
    tabItemActive: { backgroundColor: COLORS.primaryGlow, borderWidth: 1, borderColor: COLORS.primary },
    tabText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: '500' },
    tabTextActive: { color: COLORS.primary, fontWeight: '600' },
    content: { flex: 1 },
    contentInner: { padding: SPACING.lg, paddingBottom: 40 },
    statsStrip: {
        flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.lg,
        backgroundColor: COLORS.surface, borderRadius: RADIUS.md, padding: SPACING.lg,
    },
    statItem: { alignItems: 'center' },
    statValue: { color: COLORS.primary, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
    statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
    sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700', marginTop: SPACING.xl, marginBottom: SPACING.md },
    sessionCard: { marginBottom: SPACING.sm },
    sessionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    sessionName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600' },
    sessionDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
    emptyGoals: { alignItems: 'center', paddingVertical: SPACING.xxl, gap: SPACING.sm },
    emptyText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, fontWeight: '600' },
    emptySubtext: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
    goalCard: { marginBottom: SPACING.md },
    goalHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.sm },
    goalName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600', marginBottom: 4 },
    goalTarget: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    goalTargetText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
    achieved: { color: COLORS.success, fontSize: FONTS.sizes.sm, fontWeight: '600' },
    progressBarBg: { height: 8, backgroundColor: COLORS.surfaceLight, borderRadius: 4, overflow: 'hidden' },
    progressBarFg: { height: '100%', borderRadius: 4 },
    progressText: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 4, textAlign: 'right' },
    // Modal
    modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    modalContent: {
        backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
        padding: SPACING.xl, paddingBottom: 40, maxHeight: '85%',
    },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.lg },
    modalTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
    fieldLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '500', marginBottom: SPACING.xs, marginTop: SPACING.md },
    input: {
        backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md, padding: SPACING.md,
        color: COLORS.text, fontSize: FONTS.sizes.md, borderWidth: 1, borderColor: COLORS.border,
    },
    exerciseDropdown: { maxHeight: 180, marginTop: SPACING.xs },
    exerciseOption: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    exerciseOptionActive: { backgroundColor: COLORS.primaryGlow },
    exerciseOptionText: { color: COLORS.text, fontSize: FONTS.sizes.sm },
    selectedExBadge: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.xs, marginTop: SPACING.sm,
        paddingHorizontal: SPACING.sm, paddingVertical: 4,
    },
    selectedExText: { color: COLORS.success, fontSize: FONTS.sizes.sm, fontWeight: '500' },
    goalInputRow: { flexDirection: 'row', gap: SPACING.md },
});
