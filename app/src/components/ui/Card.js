import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, SHADOWS } from '../../constants/theme';

export default function Card({ children, onPress, style, variant = 'default' }) {
    const bgColor = variant === 'highlight' ? COLORS.surfaceHighlight : COLORS.surface;

    if (onPress) {
        return (
            <TouchableOpacity
                onPress={onPress}
                activeOpacity={0.7}
                style={[styles.card, { backgroundColor: bgColor }, SHADOWS.small, style]}
            >
                {children}
            </TouchableOpacity>
        );
    }

    return (
        <View style={[styles.card, { backgroundColor: bgColor }, SHADOWS.small, style]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    card: {
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
});
