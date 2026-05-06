import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, RADIUS, FONTS, SPACING } from '../../constants/theme';

export default function SetRow({
    setNumber,
    weight: initialWeight = '',
    reps: initialReps = '',
    isCompleted = false,
    previousWeight,
    previousReps,
    onValidate,
    onUpdate,
}) {
    const [weight, setWeight] = useState(initialWeight.toString());
    const [reps, setReps] = useState(initialReps.toString());
    const [completed, setCompleted] = useState(isCompleted);

    const handleValidate = () => {
        const w = parseFloat(weight) || 0;
        const r = parseInt(reps) || 0;
        setCompleted(true);
        if (onValidate) onValidate({ weight: w, reps: r });
    };

    return (
        <View style={[styles.row, completed && styles.completedRow]}>
            <View style={styles.setNumber}>
                <Text style={[styles.setLabel, completed && styles.completedText]}>
                    S{setNumber}
                </Text>
            </View>

            {previousWeight !== undefined && (
                <View style={styles.previousCol}>
                    <Text style={styles.previousText}>
                        {previousWeight}kg × {previousReps}
                    </Text>
                </View>
            )}

            <View style={styles.inputCol}>
                <TextInput
                    style={[styles.input, completed && styles.completedInput]}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    editable={!completed}
                />
                <Text style={styles.unit}>kg</Text>
            </View>

            <View style={styles.inputCol}>
                <TextInput
                    style={[styles.input, completed && styles.completedInput]}
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="number-pad"
                    placeholder="0"
                    placeholderTextColor={COLORS.textMuted}
                    editable={!completed}
                />
                <Text style={styles.unit}>reps</Text>
            </View>

            <TouchableOpacity
                style={[styles.checkButton, completed && styles.checkedButton]}
                onPress={handleValidate}
                disabled={completed}
            >
                <Ionicons
                    name={completed ? 'checkmark-circle' : 'checkmark-circle-outline'}
                    size={28}
                    color={completed ? COLORS.success : COLORS.textMuted}
                />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.md,
        marginBottom: SPACING.xs,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    completedRow: {
        backgroundColor: COLORS.successDim,
        borderColor: COLORS.success + '40',
    },
    setNumber: {
        width: 32,
        alignItems: 'center',
    },
    setLabel: {
        color: COLORS.primary,
        fontSize: FONTS.sizes.md,
        fontWeight: '700',
    },
    completedText: {
        color: COLORS.success,
    },
    previousCol: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SPACING.xs,
    },
    previousText: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.xs,
        fontStyle: 'italic',
    },
    inputCol: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
    },
    input: {
        backgroundColor: COLORS.surfaceLight,
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 6,
        paddingHorizontal: 8,
        borderRadius: RADIUS.sm,
        width: 52,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    completedInput: {
        opacity: 0.7,
    },
    unit: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.xs,
    },
    checkButton: {
        marginLeft: SPACING.sm,
        padding: 2,
    },
    checkedButton: {
        opacity: 0.8,
    },
});
