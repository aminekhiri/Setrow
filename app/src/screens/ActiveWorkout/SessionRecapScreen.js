import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

export default function SessionRecapScreen({ route, navigation }) {
    const { recap } = route.params || {};

    if (!recap) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={styles.noData}>Aucune donnée de séance</Text>
                <Button title="Retour" onPress={() => navigation.popToTop()} style={{ marginTop: SPACING.lg }} />
            </View>
        );
    }

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Celebration header */}
            <View style={styles.celebration}>
                <Text style={styles.emoji}>🎉</Text>
                <Text style={styles.title}>Séance terminée !</Text>
                <Text style={styles.routineName}>{recap.routineName}</Text>
            </View>

            {/* Summary strip */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{recap.exerciseCount}</Text>
                    <Text style={styles.summaryLabel}>Exercices</Text>
                </View>
                <View style={styles.divider} />
                <View style={styles.summaryItem}>
                    <Text style={styles.summaryValue}>{recap.totalSets}</Text>
                    <Text style={styles.summaryLabel}>Séries</Text>
                </View>
            </View>

            {/* Exercise-by-exercise breakdown */}
            <Text style={styles.sectionTitle}>Détail par exercice</Text>

            {recap.exercises.map((ex, i) => (
                <Card key={i} style={styles.exerciseCard}>
                    <View style={styles.exHeader}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.exName}>{ex.name}</Text>
                            <Badge label={ex.muscle_group} />
                        </View>
                        <Text style={styles.exSets}>{ex.setsCount}/{ex.targetSets} séries</Text>
                    </View>

                    <View style={styles.statsRow}>
                        {/* Weight comparison */}
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Poids max</Text>
                            <Text style={styles.statValue}>{ex.maxWeight} kg</Text>
                            {ex.weightDiff !== null && (
                                <View style={[styles.diffBadge, ex.weightDiff >= 0 ? styles.diffUp : styles.diffDown]}>
                                    <Ionicons
                                        name={ex.weightDiff >= 0 ? 'trending-up' : 'trending-down'}
                                        size={12}
                                        color={ex.weightDiff >= 0 ? COLORS.success : COLORS.danger}
                                    />
                                    <Text style={[styles.diffText, ex.weightDiff >= 0 ? styles.diffTextUp : styles.diffTextDown]}>
                                        {ex.weightDiff > 0 ? '+' : ''}{ex.weightDiff}%
                                    </Text>
                                </View>
                            )}
                            {ex.weightDiff === null && (
                                <Text style={styles.noPrev}>1ère fois</Text>
                            )}
                        </View>

                        {/* Volume comparison */}
                        <View style={styles.statBox}>
                            <Text style={styles.statLabel}>Volume</Text>
                            <Text style={styles.statValue}>{Math.round(ex.volume)} kg</Text>
                            {ex.volumeDiff !== null && (
                                <View style={[styles.diffBadge, ex.volumeDiff >= 0 ? styles.diffUp : styles.diffDown]}>
                                    <Ionicons
                                        name={ex.volumeDiff >= 0 ? 'trending-up' : 'trending-down'}
                                        size={12}
                                        color={ex.volumeDiff >= 0 ? COLORS.success : COLORS.danger}
                                    />
                                    <Text style={[styles.diffText, ex.volumeDiff >= 0 ? styles.diffTextUp : styles.diffTextDown]}>
                                        {ex.volumeDiff > 0 ? '+' : ''}{ex.volumeDiff}%
                                    </Text>
                                </View>
                            )}
                            {ex.volumeDiff === null && (
                                <Text style={styles.noPrev}>1ère fois</Text>
                            )}
                        </View>
                    </View>
                </Card>
            ))}

            <Button
                title="Retour à l'accueil"
                onPress={() => navigation.popToTop()}
                style={styles.backButton}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg, paddingBottom: 60 },
    celebration: { alignItems: 'center', paddingVertical: SPACING.xxl },
    emoji: { fontSize: 64, marginBottom: SPACING.md },
    title: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
    routineName: { color: COLORS.primary, fontSize: FONTS.sizes.lg, fontWeight: '600', marginTop: SPACING.xs },
    summaryRow: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
        backgroundColor: COLORS.surface, borderRadius: RADIUS.lg, padding: SPACING.xl,
        borderWidth: 1, borderColor: COLORS.border, marginBottom: SPACING.xxl,
    },
    summaryItem: { alignItems: 'center' },
    summaryValue: { color: COLORS.primary, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
    summaryLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
    divider: { width: 1, height: 40, backgroundColor: COLORS.border },
    sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700', marginBottom: SPACING.md },
    exerciseCard: { marginBottom: SPACING.md },
    exHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: SPACING.md },
    exName: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600', marginBottom: 4 },
    exSets: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm },
    statsRow: { flexDirection: 'row', gap: SPACING.md },
    statBox: {
        flex: 1, backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md,
        padding: SPACING.md, alignItems: 'center',
    },
    statLabel: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginBottom: 4 },
    statValue: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
    diffBadge: {
        flexDirection: 'row', alignItems: 'center', gap: 3,
        marginTop: SPACING.xs, paddingHorizontal: SPACING.sm, paddingVertical: 2,
        borderRadius: RADIUS.full,
    },
    diffUp: { backgroundColor: COLORS.successDim },
    diffDown: { backgroundColor: COLORS.dangerDim },
    diffText: { fontSize: FONTS.sizes.xs, fontWeight: '600' },
    diffTextUp: { color: COLORS.success },
    diffTextDown: { color: COLORS.danger },
    noPrev: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: SPACING.xs, fontStyle: 'italic' },
    noData: { color: COLORS.textMuted, fontSize: FONTS.sizes.md },
    backButton: { marginTop: SPACING.xl },
});
