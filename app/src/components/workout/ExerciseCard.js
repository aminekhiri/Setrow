import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS, SPACING, SHADOWS } from '../../constants/theme';
import Badge from '../ui/Badge';

export default function ExerciseCard({ exercise, onPress, onFavorite, showFavorite = true }) {
    const muscleIcons = {
        pectoraux: '🫁',
        dos: '🔙',
        epaules: '💪',
        biceps: '💪',
        triceps: '🦾',
        jambes: '🦵',
        abdominaux: '🎯',
        mollets: '🦶',
        'avant-bras': '🤜',
    };

    return (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={[styles.card, SHADOWS.small]}>
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>{muscleIcons[exercise.muscle_group] || '🏋️'}</Text>
            </View>

            <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
                <Badge label={exercise.muscle_group} />
            </View>

            {showFavorite && (
                <TouchableOpacity onPress={() => onFavorite?.(exercise.id)} style={styles.favButton}>
                    <Ionicons
                        name={exercise.is_favorite ? 'heart' : 'heart-outline'}
                        size={22}
                        color={exercise.is_favorite ? COLORS.danger : COLORS.textMuted}
                    />
                </TouchableOpacity>
            )}

            <Ionicons name="chevron-forward" size={18} color={COLORS.textMuted} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: SPACING.md,
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
        marginBottom: SPACING.sm,
    },
    iconContainer: {
        width: 44,
        height: 44,
        borderRadius: RADIUS.md,
        backgroundColor: COLORS.surfaceLight,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: SPACING.md,
    },
    icon: {
        fontSize: 22,
    },
    info: {
        flex: 1,
        gap: SPACING.xs,
    },
    name: {
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
    },
    favButton: {
        padding: SPACING.sm,
        marginRight: SPACING.xs,
    },
});
