import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, FONTS } from '../../constants/theme';
import { MUSCLE_COLORS } from '../../constants/theme';

export default function Badge({ label, color, size = 'sm' }) {
    const badgeColor = color || MUSCLE_COLORS[label] || COLORS.primary;
    const isSmall = size === 'sm';

    return (
        <View style={[
            styles.badge,
            {
                backgroundColor: badgeColor + '20',
                paddingVertical: isSmall ? 3 : 6,
                paddingHorizontal: isSmall ? 8 : 12,
            },
        ]}>
            <Text style={[
                styles.text,
                {
                    color: badgeColor,
                    fontSize: isSmall ? FONTS.sizes.xs : FONTS.sizes.sm,
                },
            ]}>
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    badge: {
        borderRadius: RADIUS.full,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: '600',
        textTransform: 'capitalize',
    },
});
