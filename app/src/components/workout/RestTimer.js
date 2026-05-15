import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useTimer } from '../../hooks/useTimer';

export default function RestTimer({ onSkip, exerciseId }) {
    const { timeRemaining, isActive, formattedTime, progress, stop, currentDuration, setTime } = useTimer();

    if (!isActive) return null;

    const size = 120;
    const strokeWidth = 6;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    const handleSkip = () => {
        stop();
        if (onSkip) onSkip();
    };

    return (
        <View style={styles.container}>
            <View style={styles.timerBox}>
                <View style={styles.circleContainer}>
                    <Svg width={size} height={size}>
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={COLORS.surfaceLight}
                            strokeWidth={strokeWidth}
                            fill="none"
                        />
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke={COLORS.primary}
                            strokeWidth={strokeWidth}
                            fill="none"
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                            strokeLinecap="round"
                            transform={`rotate(-90 ${size / 2} ${size / 2})`}
                        />
                    </Svg>
                    <View style={styles.timeOverlay}>
                        <Text style={styles.timeText}>{formattedTime}</Text>
                        <Text style={styles.label}>Repos</Text>
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
                        <Ionicons name="play-skip-forward" size={18} color={COLORS.text} />
                        <Text style={styles.skipText}>Passer</Text>
                    </TouchableOpacity>

                    <View style={styles.timeOptions}>
                        {[60, 90, 120, 180].map(t => (
                            <TouchableOpacity
                                key={t}
                                onPress={() => setTime(exerciseId, t)}
                                style={[styles.timeOption, currentDuration === t && styles.timeOptionActive]}
                            >
                                <Text style={[styles.timeOptionText, currentDuration === t && styles.timeOptionTextActive]}>
                                    {t >= 60 ? `${Math.floor(t / 60)}:${(t % 60).toString().padStart(2, '0')}` : `${t}s`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1, borderTopColor: COLORS.border,
        padding: SPACING.lg, paddingBottom: 34,
    },
    timerBox: { alignItems: 'center' },
    circleContainer: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
    timeOverlay: { position: 'absolute', alignItems: 'center' },
    timeText: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '700' },
    label: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, marginTop: 2 },
    controls: { marginTop: SPACING.lg, alignItems: 'center', width: '100%' },
    skipButton: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
        paddingVertical: SPACING.sm, paddingHorizontal: SPACING.lg,
        backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.full,
        marginBottom: SPACING.md,
    },
    skipText: { color: COLORS.text, fontSize: FONTS.sizes.sm, fontWeight: '500' },
    timeOptions: { flexDirection: 'row', gap: SPACING.sm },
    timeOption: {
        paddingVertical: SPACING.xs, paddingHorizontal: SPACING.md,
        borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight,
    },
    timeOptionActive: { backgroundColor: COLORS.primaryGlow, borderWidth: 1, borderColor: COLORS.primary },
    timeOptionText: { color: COLORS.textMuted, fontSize: FONTS.sizes.xs, fontWeight: '500' },
    timeOptionTextActive: { color: COLORS.primary },
});
