import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import ProgressChart from './ProgressChart';

const PERIODS = [
    { key: 'week', label: 'Semaine' },
    { key: 'month', label: 'Mois' },
    { key: 'year', label: 'Année' },
];

export default function WeightChart({ data, selectedPeriod, onPeriodChange }) {
    // Deduplicate: keep only the last entry per day
    const byDay = {};
    (data || []).forEach(d => {
        const dateKey = new Date(d.logged_at).toISOString().split('T')[0];
        byDay[dateKey] = d;
    });
    const uniqueData = Object.values(byDay);

    const chartData = uniqueData.map(d => {
        const date = new Date(d.logged_at);
        let label;
        if (selectedPeriod === 'year') {
            label = date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        } else {
            label = date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        }
        return { value: d.weight, label };
    });

    return (
        <View>
            <View style={styles.periodSelector}>
                {PERIODS.map(p => (
                    <TouchableOpacity
                        key={p.key}
                        onPress={() => onPeriodChange(p.key)}
                        style={[styles.periodButton, selectedPeriod === p.key && styles.periodActive]}
                    >
                        <Text style={[styles.periodText, selectedPeriod === p.key && styles.periodTextActive]}>
                            {p.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ProgressChart
                data={chartData}
                title="Évolution du poids"
                yLabel="kg"
                color="#45B7D1"
            />

            {data && data.length >= 2 && (
                <View style={styles.summary}>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Début</Text>
                        <Text style={styles.summaryValue}>{data[0].weight} kg</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Actuel</Text>
                        <Text style={styles.summaryValue}>{data[data.length - 1].weight} kg</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Text style={styles.summaryLabel}>Diff</Text>
                        <Text style={[
                            styles.summaryValue,
                            { color: (data[data.length - 1].weight - data[0].weight) >= 0 ? COLORS.success : COLORS.danger }
                        ]}>
                            {(data[data.length - 1].weight - data[0].weight) > 0 ? '+' : ''}
                            {(data[data.length - 1].weight - data[0].weight).toFixed(1)} kg
                        </Text>
                    </View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    periodSelector: {
        flexDirection: 'row',
        gap: SPACING.sm,
        marginBottom: SPACING.lg,
    },
    periodButton: {
        paddingVertical: SPACING.sm,
        paddingHorizontal: SPACING.lg,
        borderRadius: RADIUS.full,
        backgroundColor: COLORS.surfaceLight,
    },
    periodActive: {
        backgroundColor: COLORS.primary,
    },
    periodText: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.sm,
        fontWeight: '500',
    },
    periodTextActive: {
        color: COLORS.white,
    },
    summary: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: SPACING.md,
        padding: SPACING.md,
        backgroundColor: COLORS.surfaceLight,
        borderRadius: RADIUS.md,
    },
    summaryItem: {
        alignItems: 'center',
    },
    summaryLabel: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.xs,
        marginBottom: 2,
    },
    summaryValue: {
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        fontWeight: '700',
    },
});
