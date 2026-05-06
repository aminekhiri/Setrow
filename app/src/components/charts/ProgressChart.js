import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Polyline, Line, Circle as SvgCircle, Text as SvgText } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProgressChart({ data, title, yLabel = 'kg', color = COLORS.primary }) {
    if (!data || data.length === 0) {
        return (
            <View style={styles.container}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.noData}>Pas encore de données</Text>
            </View>
        );
    }

    const chartWidth = SCREEN_WIDTH - 80;
    const chartHeight = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };
    const plotWidth = chartWidth - padding.left - padding.right;
    const plotHeight = chartHeight - padding.top - padding.bottom;

    const values = data.map(d => d.value);
    const minVal = Math.min(...values) * 0.9;
    const maxVal = Math.max(...values) * 1.1 || 1;

    const points = data.map((d, i) => {
        const x = padding.left + (i / Math.max(data.length - 1, 1)) * plotWidth;
        const y = padding.top + plotHeight - ((d.value - minVal) / (maxVal - minVal)) * plotHeight;
        return { x, y, label: d.label, value: d.value };
    });

    const polylinePoints = points.map(p => `${p.x},${p.y}`).join(' ');

    // Y axis labels
    const ySteps = 4;
    const yLabels = [];
    for (let i = 0; i <= ySteps; i++) {
        const val = minVal + (maxVal - minVal) * (i / ySteps);
        yLabels.push({
            value: Math.round(val * 10) / 10,
            y: padding.top + plotHeight - (i / ySteps) * plotHeight,
        });
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{title}</Text>
            <Svg width={chartWidth} height={chartHeight}>
                {/* Grid lines */}
                {yLabels.map((yl, i) => (
                    <React.Fragment key={i}>
                        <Line
                            x1={padding.left}
                            y1={yl.y}
                            x2={chartWidth - padding.right}
                            y2={yl.y}
                            stroke={COLORS.border}
                            strokeWidth={1}
                            strokeDasharray="4,4"
                        />
                        <SvgText
                            x={padding.left - 8}
                            y={yl.y + 4}
                            fill={COLORS.textMuted}
                            fontSize={10}
                            textAnchor="end"
                        >
                            {yl.value}
                        </SvgText>
                    </React.Fragment>
                ))}

                {/* Line */}
                <Polyline
                    points={polylinePoints}
                    fill="none"
                    stroke={color}
                    strokeWidth={2.5}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                />

                {/* Data points */}
                {points.map((p, i) => (
                    <React.Fragment key={i}>
                        <SvgCircle cx={p.x} cy={p.y} r={4} fill={color} />
                        <SvgCircle cx={p.x} cy={p.y} r={2} fill={COLORS.white} />
                    </React.Fragment>
                ))}

                {/* X labels */}
                {points.filter((_, i) => i % Math.max(1, Math.floor(points.length / 5)) === 0 || i === points.length - 1).map((p, i) => (
                    <SvgText
                        key={`xl-${i}`}
                        x={p.x}
                        y={chartHeight - 5}
                        fill={COLORS.textMuted}
                        fontSize={9}
                        textAnchor="middle"
                    >
                        {p.label}
                    </SvgText>
                ))}
            </Svg>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: RADIUS.lg,
        padding: SPACING.lg,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    title: {
        color: COLORS.text,
        fontSize: FONTS.sizes.md,
        fontWeight: '600',
        marginBottom: SPACING.md,
    },
    noData: {
        color: COLORS.textMuted,
        fontSize: FONTS.sizes.sm,
        textAlign: 'center',
        paddingVertical: SPACING.xxxl,
    },
});
