import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS, SHADOWS } from '../../constants/theme';
import { api } from '../../api/client';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';

export default function RoutineListScreen({ navigation }) {
    const [routines, setRoutines] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadRoutines();
        }, [])
    );

    const loadRoutines = async () => {
        try {
            setLoading(true);
            const data = await api.getRoutines();
            setRoutines(data);
        } catch (err) {
            console.error('Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleFavorite = async (id) => {
        try {
            const result = await api.toggleRoutineFavorite(id);
            setRoutines(prev => prev.map(r => r.id === id ? { ...r, is_favorite: result.is_favorite } : r));
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = (id, name) => {
        Alert.alert('Supprimer', `Supprimer "${name}" ?`, [
            { text: 'Annuler', style: 'cancel' },
            {
                text: 'Supprimer', style: 'destructive',
                onPress: async () => {
                    try {
                        await api.deleteRoutine(id);
                        setRoutines(prev => prev.filter(r => r.id !== id));
                    } catch (err) {
                        Alert.alert('Erreur', err.message);
                    }
                },
            },
        ]);
    };

    const getMuscleGroups = (routine) => {
        return [...new Set((routine.routine_exercises || []).map(re => re.exercises?.muscle_group).filter(Boolean))];
    };

    const filtered = showFavoritesOnly ? routines.filter(r => r.is_favorite) : routines;

    const renderRoutine = ({ item }) => (
        <Card onPress={() => navigation.navigate('CreateRoutine', { routineId: item.id })} style={styles.routineCard}>
            <View style={styles.routineHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={styles.routineName}>{item.name}</Text>
                    <Text style={styles.routineInfo}>
                        {(item.routine_exercises || []).length} exercices • Repos: {Math.floor((item.rest_time_seconds || 90) / 60)}:{((item.rest_time_seconds || 90) % 60).toString().padStart(2, '0')}
                    </Text>
                </View>
                <View style={styles.routineActions}>
                    <TouchableOpacity onPress={() => handleFavorite(item.id)} style={styles.actionBtn}>
                        <Ionicons name={item.is_favorite ? 'heart' : 'heart-outline'} size={20} color={item.is_favorite ? COLORS.danger : COLORS.textMuted} />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => handleDelete(item.id, item.name)} style={styles.actionBtn}>
                        <Ionicons name="trash-outline" size={18} color={COLORS.textMuted} />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.badges}>
                {getMuscleGroups(item).map(mg => (
                    <Badge key={mg} label={mg} />
                ))}
            </View>

            <TouchableOpacity
                style={styles.startButton}
                onPress={() => navigation.navigate('ActiveWorkout', { routineId: item.id })}
            >
                <Ionicons name="play" size={16} color={COLORS.white} />
                <Text style={styles.startText}>Démarrer la séance</Text>
            </TouchableOpacity>
        </Card>
    );

    if (loading) {
        return <View style={[styles.container, { justifyContent: 'center' }]}><ActivityIndicator color={COLORS.primary} size="large" /></View>;
    }

    return (
        <View style={styles.container}>
            {/* Filter bar */}
            {routines.length > 0 && (
                <View style={styles.filterBar}>
                    <TouchableOpacity
                        onPress={() => setShowFavoritesOnly(false)}
                        style={[styles.filterTab, !showFavoritesOnly && styles.filterTabActive]}
                    >
                        <Text style={[styles.filterTabText, !showFavoritesOnly && styles.filterTabTextActive]}>Toutes</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => setShowFavoritesOnly(true)}
                        style={[styles.filterTab, showFavoritesOnly && styles.filterTabActive]}
                    >
                        <Ionicons name="heart" size={14} color={showFavoritesOnly ? COLORS.primary : COLORS.textMuted} />
                        <Text style={[styles.filterTabText, showFavoritesOnly && styles.filterTabTextActive]}>Favorites</Text>
                    </TouchableOpacity>
                </View>
            )}

            <FlatList
                data={filtered}
                keyExtractor={item => item.id}
                renderItem={renderRoutine}
                contentContainerStyle={styles.list}
                ListEmptyComponent={
                    <EmptyState
                        icon="clipboard-outline"
                        title={showFavoritesOnly ? "Aucune routine favorite" : "Aucune routine"}
                        message={showFavoritesOnly ? "Ajoute des routines en favoris avec ❤️" : "Crée ta première routine d'entraînement !"}
                    />
                }
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateRoutine')}
            >
                <Ionicons name="add" size={28} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    filterBar: {
        flexDirection: 'row', paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
        gap: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    },
    filterTab: {
        flexDirection: 'row', alignItems: 'center', gap: 4,
        paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
        borderRadius: RADIUS.full, backgroundColor: COLORS.surface,
    },
    filterTabActive: { backgroundColor: COLORS.primaryGlow, borderWidth: 1, borderColor: COLORS.primary },
    filterTabText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: '500' },
    filterTabTextActive: { color: COLORS.primary },
    list: { padding: SPACING.lg },
    routineCard: { marginBottom: SPACING.md },
    routineHeader: { flexDirection: 'row', alignItems: 'flex-start' },
    routineName: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
    routineInfo: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, marginTop: 2 },
    routineActions: { flexDirection: 'row', gap: SPACING.xs },
    actionBtn: { padding: SPACING.xs },
    badges: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs, marginTop: SPACING.md },
    startButton: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: SPACING.sm,
        marginTop: SPACING.lg, paddingVertical: SPACING.sm,
        backgroundColor: COLORS.primary, borderRadius: RADIUS.md,
    },
    startText: { color: COLORS.white, fontSize: FONTS.sizes.sm, fontWeight: '600' },
    fab: {
        position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
        borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center',
        justifyContent: 'center', ...SHADOWS.medium,
    },
});
