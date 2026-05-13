import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import { formatDateTime, formatDuration } from '../../utils/dateHelpers';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function SessionDetailScreen({ route }) {
    const { date, sessions: sessionsSummary, sessionId } = route.params || {};
    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadSessions();
    }, []);

    const loadSessions = async () => {
        try {
            if (sessionId) {
                // Single session from GoalsScreen calendar
                const data = await api.getSession(sessionId);
                setSessions(data ? [data] : []);
            } else if (sessionsSummary) {
                const detailed = [];
                for (const s of sessionsSummary) {
                    try {
                        const data = await api.getSession(s.id);
                        detailed.push(data);
                    } catch (e) { /* skip */ }
                }
                setSessions(detailed);
            } else if (date) {
                const data = await api.getSessions({ from: date, to: date + 'T23:59:59' });
                setSessions(data);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {sessions.map((session, si) => (
                <Card key={si} style={styles.sessionCard}>
                    <View style={styles.sessionHeader}>
                        <Text style={styles.sessionName}>{session.routines?.name || 'Séance libre'}</Text>
                        <Text style={styles.sessionTime}>
                            {formatDuration(session.started_at, session.finished_at)}
                        </Text>
                    </View>
                    <Text style={styles.sessionDate}>{formatDateTime(session.started_at)}</Text>

                    {(session.session_exercises || []).map((se, ei) => (
                        <View key={ei} style={styles.exerciseBlock}>
                            <View style={styles.exerciseNameRow}>
                                <Text style={styles.exerciseBlockName}>{se.exercises?.name}</Text>
                                <Badge label={se.exercises?.muscle_group} />
                            </View>
                            {(se.sets || []).map((set, seti) => (
                                <View key={seti} style={styles.setLine}>
                                    <Text style={styles.setNum}>S{set.set_number}</Text>
                                    <Text style={styles.setWeight}>{set.weight} kg</Text>
                                    <Text style={styles.setReps}>× {set.reps}</Text>
                                    {set.is_completed && <Text style={styles.setCheck}>✓</Text>}
                                </View>
                            ))}
                        </View>
                    ))}
                </Card>
            ))}

            {sessions.length === 0 && (
                <Text style={styles.empty}>Aucune séance enregistrée ce jour</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg },
    title: { color: COLORS.text, fontSize: FONTS.sizes.xl, fontWeight: '700', marginBottom: SPACING.lg },
    sessionCard: { marginBottom: SPACING.lg },
    sessionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    sessionName: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
    sessionTime: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
    sessionDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2, marginBottom: SPACING.md },
    exerciseBlock: { marginTop: SPACING.md, paddingTop: SPACING.md, borderTopWidth: 1, borderTopColor: COLORS.border },
    exerciseNameRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.sm },
    exerciseBlockName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600' },
    setLine: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 4, paddingHorizontal: SPACING.sm,
    },
    setNum: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600', width: 30 },
    setWeight: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600', width: 70 },
    setReps: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, flex: 1 },
    setCheck: { color: COLORS.success, fontSize: FONTS.sizes.md },
    empty: { color: COLORS.textMuted, textAlign: 'center', marginTop: 60, fontSize: FONTS.sizes.md },
});
