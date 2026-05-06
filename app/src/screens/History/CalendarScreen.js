import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Calendar } from 'react-native-calendars';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import { getCurrentMonthYear } from '../../utils/dateHelpers';

export default function CalendarScreen({ navigation }) {
    const [markedDates, setMarkedDates] = useState({});
    const [currentMonth, setCurrentMonth] = useState(getCurrentMonthYear());
    const [loading, setLoading] = useState(true);

    useFocusEffect(
        useCallback(() => {
            loadCalendar(currentMonth.month, currentMonth.year);
        }, [currentMonth])
    );

    const loadCalendar = async (month, year) => {
        try {
            setLoading(true);
            const data = await api.getCalendar(month, year);
            const marks = {};
            Object.entries(data).forEach(([date, info]) => {
                marks[date] = {
                    marked: true,
                    dotColor: COLORS.primary,
                    customStyles: { container: { backgroundColor: COLORS.primaryGlow } },
                    sessions: info.sessions,
                };
            });
            setMarkedDates(marks);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDayPress = (day) => {
        const info = markedDates[day.dateString];
        if (info && info.sessions) {
            navigation.navigate('SessionDetail', { date: day.dateString, sessions: info.sessions });
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>📅 Calendrier</Text>

            <Calendar
                theme={{
                    backgroundColor: COLORS.background,
                    calendarBackground: COLORS.surface,
                    textSectionTitleColor: COLORS.textSecondary,
                    selectedDayBackgroundColor: COLORS.primary,
                    selectedDayTextColor: COLORS.white,
                    todayTextColor: COLORS.primary,
                    dayTextColor: COLORS.text,
                    textDisabledColor: COLORS.textMuted,
                    monthTextColor: COLORS.text,
                    arrowColor: COLORS.primary,
                    textMonthFontWeight: '700',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                }}
                markedDates={markedDates}
                markingType="dot"
                onDayPress={handleDayPress}
                onMonthChange={(month) => {
                    setCurrentMonth({ month: month.month, year: month.year });
                }}
                style={styles.calendar}
            />

            {loading && <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.lg }} />}

            <View style={styles.legend}>
                <View style={styles.legendItem}>
                    <View style={[styles.legendDot, { backgroundColor: COLORS.primary }]} />
                    <Text style={styles.legendText}>Jour d'entraînement</Text>
                </View>
                <Text style={styles.totalText}>
                    {Object.keys(markedDates).length} séance(s) ce mois
                </Text>
            </View>

            {/* Quick links */}
            <View style={styles.quickLinks}>
                <TouchableOpacity style={styles.quickLink} onPress={() => navigation.navigate('Stats')}>
                    <Text style={styles.quickLinkIcon}>📈</Text>
                    <Text style={styles.quickLinkText}>Voir les statistiques</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background, padding: SPACING.lg },
    title: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '800', marginBottom: SPACING.lg },
    calendar: { borderRadius: RADIUS.lg, overflow: 'hidden' },
    legend: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginTop: SPACING.lg, paddingHorizontal: SPACING.sm,
    },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
    legendDot: { width: 10, height: 10, borderRadius: 5 },
    legendText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
    totalText: { color: COLORS.primary, fontSize: FONTS.sizes.sm, fontWeight: '600' },
    quickLinks: { marginTop: SPACING.xl },
    quickLink: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
        padding: SPACING.lg, backgroundColor: COLORS.surface, borderRadius: RADIUS.lg,
        borderWidth: 1, borderColor: COLORS.border,
    },
    quickLinkIcon: { fontSize: 24 },
    quickLinkText: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '500' },
});
