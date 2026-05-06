import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, RADIUS, FONTS, SPACING } from '../../constants/theme';

const VARIANTS = {
    primary: {
        bg: COLORS.primary,
        text: COLORS.white,
        border: 'transparent',
    },
    secondary: {
        bg: COLORS.surfaceLight,
        text: COLORS.text,
        border: COLORS.border,
    },
    danger: {
        bg: COLORS.dangerDim,
        text: COLORS.danger,
        border: 'transparent',
    },
    ghost: {
        bg: 'transparent',
        text: COLORS.primary,
        border: 'transparent',
    },
    success: {
        bg: COLORS.successDim,
        text: COLORS.success,
        border: 'transparent',
    },
};

export default function Button({
    title,
    onPress,
    variant = 'primary',
    size = 'md',
    icon,
    loading = false,
    disabled = false,
    style,
    textStyle,
}) {
    const v = VARIANTS[variant] || VARIANTS.primary;
    const sizeStyles = {
        sm: { paddingVertical: 8, paddingHorizontal: 14, fontSize: FONTS.sizes.sm },
        md: { paddingVertical: 12, paddingHorizontal: 20, fontSize: FONTS.sizes.md },
        lg: { paddingVertical: 16, paddingHorizontal: 28, fontSize: FONTS.sizes.lg },
    };
    const s = sizeStyles[size] || sizeStyles.md;

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
            style={[
                styles.button,
                {
                    backgroundColor: v.bg,
                    borderColor: v.border,
                    paddingVertical: s.paddingVertical,
                    paddingHorizontal: s.paddingHorizontal,
                    opacity: disabled ? 0.5 : 1,
                },
                style,
            ]}
        >
            {loading ? (
                <ActivityIndicator color={v.text} size="small" />
            ) : (
                <>
                    {icon}
                    <Text style={[styles.text, { color: v.text, fontSize: s.fontSize }, textStyle]}>
                        {title}
                    </Text>
                </>
            )}
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: RADIUS.md,
        borderWidth: 1,
        gap: SPACING.sm,
    },
    text: {
        fontWeight: '600',
    },
});
