import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { COLORS, RADIUS, FONTS, SPACING } from '../../constants/theme';

export default function Input({
    label,
    value,
    onChangeText,
    placeholder,
    keyboardType = 'default',
    secureTextEntry = false,
    multiline = false,
    error,
    style,
    inputStyle,
    editable = true,
    suffix,
}) {
    return (
        <View style={[styles.container, style]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View style={[
                styles.inputContainer,
                error && styles.inputError,
                !editable && styles.inputDisabled,
            ]}>
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor={COLORS.textMuted}
                    keyboardType={keyboardType}
                    secureTextEntry={secureTextEntry}
                    multiline={multiline}
                    editable={editable}
                    style={[
                        styles.input,
                        multiline && styles.multiline,
                        inputStyle,
                    ]}
                />
                {suffix && <Text style={styles.suffix}>{suffix}</Text>}
            </View>
            {error && <Text style={styles.error}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: SPACING.lg,
    },
    label: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.sm,
        marginBottom: SPACING.xs,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.md,
        borderWidth: 1,
        borderColor: COLORS.border,
        paddingHorizontal: SPACING.lg,
    },
    input: {
        flex: 1,
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        paddingVertical: SPACING.md,
    },
    multiline: {
        minHeight: 80,
        textAlignVertical: 'top',
    },
    inputError: {
        borderColor: COLORS.danger,
    },
    inputDisabled: {
        opacity: 0.5,
    },
    suffix: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.sm,
        marginLeft: SPACING.sm,
    },
    error: {
        color: COLORS.danger,
        fontSize: FONTS.sizes.xs,
        marginTop: SPACING.xs,
    },
});
