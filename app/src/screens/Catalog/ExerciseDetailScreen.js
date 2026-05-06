import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressChart from '../../components/charts/ProgressChart';
import { formatShortDate } from '../../utils/dateHelpers';

export default function ExerciseDetailScreen({ route, navigation }) {
    const { exerciseId } = route.params;
    const [exercise, setExercise] = useState(null);
    const [stats, setStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [exerciseId]);

    const loadData = async () => {
        try {
            const [exData, statsData] = await Promise.all([
                api.getExercise(exerciseId),
                api.getExerciseStats(exerciseId, '3months'),
            ]);
            setExercise(exData);
            setStats(statsData);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async () => {
        try {
            const result = await api.toggleExerciseFavorite(exerciseId);
            setExercise(prev => ({ ...prev, is_favorite: result.is_favorite }));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
        );
    }

    if (!exercise) return null;

    const chartData = stats.map(s => ({
        value: s.max_weight,
        label: formatShortDate(s.date),
    }));

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            {/* Header */}
            <View style={styles.header}>
                <Badge label={exercise.muscle_group} size="md" />
                <Text style={styles.name}>{exercise.name}</Text>
                {exercise.is_custom && (
                    <Badge label="Personnalisé" color={COLORS.warning} size="sm" />
                )}
            </View>

            {/* Description */}
            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>{exercise.description || 'Pas de description'}</Text>
            </Card>

            {/* Favorite button */}
            <Button
                title={exercise.is_favorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                variant={exercise.is_favorite ? 'danger' : 'secondary'}
                icon={<Ionicons name={exercise.is_favorite ? 'heart' : 'heart-outline'} size={18} color={exercise.is_favorite ? COLORS.danger : COLORS.text} />}
                onPress={handleFavorite}
                style={styles.section}
            />

            {/* Progression chart */}
            <View style={styles.section}>
                <ProgressChart
                    data={chartData}
                    title="Progression (poids max - 3 mois)"
                    yLabel="kg"
                />
            </View>

            {/* Recent stats */}
            {stats.length > 0 && (
                <Card style={styles.section}>
                    <Text style={styles.sectionTitle}>Dernières performances</Text>
                    {stats.slice(-5).reverse().map((s, i) => (
                        <View key={i} style={styles.statRow}>
                            <Text style={styles.statDate}>{formatShortDate(s.date)}</Text>
                            <Text style={styles.statValue}>{s.max_weight} kg</Text>
                            <Text style={styles.statDetail}>{s.sets_count} séries • {s.max_reps} reps max</Text>
                        </View>
                    ))}
                </Card>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg },
    header: { marginBottom: SPACING.lg, gap: SPACING.sm },
    name: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '800' },
    section: { marginBottom: SPACING.lg },
    sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600', marginBottom: SPACING.md },
    description: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, lineHeight: 22 },
    statRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm,
        borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    statDate: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, width: 60 },
    statValue: { color: COLORS.primary, fontSize: FONTS.sizes.md, fontWeight: '700', width: 70 },
    statDetail: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, flex: 1 },
});
