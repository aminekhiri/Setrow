import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { MUSCLE_GROUPS } from '../../constants/defaultData';
import { api } from '../../api/client';
import ExerciseCard from '../../components/workout/ExerciseCard';
import EmptyState from '../../components/ui/EmptyState';
import MuscleImage from '../../components/ui/MuscleImage';

export default function ExerciseListScreen({ navigation }) {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState(null);
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

    const fetchExercises = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (selectedMuscle) params.muscle_group = selectedMuscle;
            if (search) params.search = search;
            if (showFavoritesOnly) params.favorites_only = 'true';
            const data = await api.getExercises(params);
            setExercises(data);
        } catch (err) {
            console.error('Error fetching exercises:', err);
        } finally {
            setLoading(false);
        }
    }, [selectedMuscle, search, showFavoritesOnly]);

    useEffect(() => { fetchExercises(); }, [fetchExercises]);

    const handleFavorite = async (id) => {
        try {
            await api.toggleExerciseFavorite(id);
            setExercises(prev => prev.map(e => e.id === id ? { ...e, is_favorite: !e.is_favorite } : e));
        } catch (err) {
            console.error('Favorite error:', err);
        }
    };

    // Group exercises by muscle
    const grouped = exercises.reduce((acc, ex) => {
        const group = ex.muscle_group || 'autre';
        if (!acc[group]) acc[group] = [];
        acc[group].push(ex);
        return acc;
    }, {});

    return (
        <View style={styles.container}>
            {/* Search bar */}
            <View style={styles.searchContainer}>
                <View style={styles.searchBar}>
                    <Ionicons name="search" size={18} color={COLORS.textMuted} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Rechercher un exercice..."
                        placeholderTextColor={COLORS.textMuted}
                        value={search}
                        onChangeText={setSearch}
                    />
                    {search.length > 0 && (
                        <TouchableOpacity onPress={() => setSearch('')}>
                            <Ionicons name="close-circle" size={18} color={COLORS.textMuted} />
                        </TouchableOpacity>
                    )}
                </View>
                <TouchableOpacity
                    onPress={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    style={[styles.favFilter, showFavoritesOnly && styles.favFilterActive]}
                >
                    <Ionicons name={showFavoritesOnly ? 'heart' : 'heart-outline'} size={20} color={showFavoritesOnly ? COLORS.danger : COLORS.textMuted} />
                </TouchableOpacity>
            </View>

            {/* Muscle group filters */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={[{ id: null, name: 'Tous' }, ...MUSCLE_GROUPS]}
                keyExtractor={(item) => item.id || 'all'}
                contentContainerStyle={styles.filterContainer}
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => setSelectedMuscle(item.id)}
                        style={[styles.filterChip, selectedMuscle === item.id && styles.filterChipActive]}
                    >
                        {item.id ? (
                            <MuscleImage muscleGroup={item.id} size={18} />
                        ) : (
                            <Ionicons name="barbell-outline" size={18} color={selectedMuscle === null ? COLORS.primary : COLORS.textMuted} />
                        )}
                        <Text style={[styles.filterText, selectedMuscle === item.id && styles.filterTextActive]}>
                            {item.name}
                        </Text>
                    </TouchableOpacity>
                )}
            />

            {/* Exercise list */}
            {loading ? (
                <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
            ) : exercises.length === 0 ? (
                <EmptyState
                    icon="barbell-outline"
                    title="Aucun exercice trouvé"
                    message="Essaie un autre filtre ou crée un exercice personnalisé"
                />
            ) : (
                <FlatList
                    data={selectedMuscle ? exercises : Object.entries(grouped)}
                    keyExtractor={(item, i) => selectedMuscle ? item.id : item[0]}
                    contentContainerStyle={styles.list}
                    renderItem={({ item }) => {
                        if (selectedMuscle) {
                            return (
                                <ExerciseCard
                                    exercise={item}
                                    onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: item.id })}
                                    onFavorite={handleFavorite}
                                />
                            );
                        }
                        const [group, exs] = item;
                        const mg = MUSCLE_GROUPS.find(m => m.id === group);
                        return (
                            <View style={styles.section}>
                                <View style={styles.sectionTitle}>
                                    <MuscleImage muscleGroup={group} size={20} />
                                    <Text style={styles.sectionTitleText}>{mg?.name || group}</Text>
                                </View>
                                {exs.map(ex => (
                                    <ExerciseCard
                                        key={ex.id}
                                        exercise={ex}
                                        onPress={() => navigation.navigate('ExerciseDetail', { exerciseId: ex.id })}
                                        onFavorite={handleFavorite}
                                    />
                                ))}
                            </View>
                        );
                    }}
                />
            )}

            {/* FAB: Create exercise */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('CreateExercise')}
            >
                <Ionicons name="add" size={28} color={COLORS.white} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    searchContainer: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.lg, paddingTop: SPACING.md, gap: SPACING.sm,
    },
    searchBar: {
        flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
        borderRadius: RADIUS.full, paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
        borderWidth: 1, borderColor: COLORS.border, gap: SPACING.sm,
    },
    searchInput: { flex: 1, color: COLORS.text, fontSize: FONTS.sizes.md },
    favFilter: {
        padding: SPACING.sm, backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
        borderWidth: 1, borderColor: COLORS.border,
    },
    favFilterActive: { backgroundColor: COLORS.dangerDim, borderColor: COLORS.danger },
    filterContainer: { paddingHorizontal: SPACING.lg, paddingVertical: SPACING.md, gap: SPACING.sm },
    filterChip: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
        paddingHorizontal: SPACING.md, height: 36,
        backgroundColor: COLORS.surface, borderRadius: RADIUS.full,
        borderWidth: 1, borderColor: COLORS.border,
    },
    filterChipActive: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary },
    filterEmoji: { fontSize: 14 },
    filterText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, fontWeight: '500' },
    filterTextActive: { color: COLORS.primary },
    list: { padding: SPACING.lg },
    section: { marginBottom: SPACING.xl },
    sectionTitle: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm, marginBottom: SPACING.md },
    sectionTitleText: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
    fab: {
        position: 'absolute', bottom: 24, right: 24, width: 56, height: 56,
        borderRadius: 28, backgroundColor: COLORS.primary, alignItems: 'center',
        justifyContent: 'center', elevation: 8,
        shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4, shadowRadius: 8,
    },
});
