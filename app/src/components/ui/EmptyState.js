import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS, SPACING } from '../../constants/theme';

export default function EmptyState({ icon = 'barbell-outline', title, message }) {
    return (
        <View style={styles.container}>
            <Ionicons name={icon} size={64} color={COLORS.textMuted} />
            <Text style={styles.title}>{title}</Text>
            {message && <Text style={styles.message}>{message}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: SPACING.xxxl,
        paddingVertical: SPACING.xxxl * 2,
    },
    title: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.lg,
        fontWeight: '600',
        marginTop: SPACING.lg,
        textAlign: 'center',
    },
    message: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.md,
        marginTop: SPACING.sm,
        textAlign: 'center',
        lineHeight: 22,
    },
});
