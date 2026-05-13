import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, TouchableOpacity, Modal as RNModal, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Calendar } from 'react-native-calendars';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { api } from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';

const MONTH_NAMES = ['Jan', 'Fév', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1939 }, (_, i) => CURRENT_YEAR - i);

export default function ProfileScreen({ navigation }) {
    const [profile, setProfile] = useState({
        first_name: '', last_name: '', weight: '', height: '', birth_date: '', gender: '',
    });
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
    const [pickerYear, setPickerYear] = useState(CURRENT_YEAR);
    const signOut = useAuthStore(s => s.signOut);
    const yearListRef = useRef(null);

    useEffect(() => { loadProfile(); }, []);

    const loadProfile = async () => {
        setLoading(true);
        try {
            const data = await api.getProfile();
            setProfile({
                first_name: data.first_name || '',
                last_name: data.last_name || '',
                weight: data.weight?.toString() || '',
                height: data.height?.toString() || '',
                birth_date: data.birth_date || '',
                gender: data.gender || '',
            });
        } catch (err) { console.error(err); }
        setLoading(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.updateProfile({
                first_name: profile.first_name,
                last_name: profile.last_name,
                weight: parseFloat(profile.weight) || null,
                height: parseFloat(profile.height) || null,
                birth_date: profile.birth_date || null,
                gender: profile.gender || null,
            });
            Alert.alert('✅ Profil sauvegardé');
        } catch (err) {
            Alert.alert('Erreur', err.message);
        }
        setSaving(false);
    };

    const handleLogWeight = async () => {
        if (!profile.weight) { Alert.alert('Erreur', 'Entre ton poids'); return; }
        try {
            await api.logWeight({ weight: parseFloat(profile.weight) });
            Alert.alert('✅ Poids enregistré', `${profile.weight} kg ajouté à l'historique`);
        } catch (err) {
            Alert.alert('Erreur', err.message);
        }
    };

    const handleSignOut = () => {
        Alert.alert('Déconnexion', 'Es-tu sûr ?', [
            { text: 'Annuler', style: 'cancel' },
            { text: 'Déconnexion', style: 'destructive', onPress: signOut },
        ]);
    };

    const handleDateSelect = (day) => {
        setProfile(p => ({ ...p, birth_date: day.dateString }));
        setShowDatePicker(false);
    };

    const openDatePicker = () => {
        // Initialize picker month/year from existing birth_date or defaults
        if (profile.birth_date) {
            const d = new Date(profile.birth_date);
            setPickerMonth(d.getMonth() + 1);
            setPickerYear(d.getFullYear());
        } else {
            setPickerMonth(1);
            setPickerYear(2000);
        }
        setShowDatePicker(true);
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const calendarInitialDate = `${pickerYear}-${String(pickerMonth).padStart(2, '0')}-01`;

    const genders = [
        { key: 'male', label: '♂️ Homme' },
        { key: 'female', label: '♀️ Femme' },
        { key: 'other', label: '⚧ Autre' },
    ];

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>👤 Mon Profil</Text>

            <Card style={styles.section}>
                <Input label="Prénom" value={profile.first_name} onChangeText={v => setProfile(p => ({ ...p, first_name: v }))} placeholder="John" />
                <Input label="Nom" value={profile.last_name} onChangeText={v => setProfile(p => ({ ...p, last_name: v }))} placeholder="Doe" />

                {/* Date picker trigger */}
                <Text style={styles.label}>Date de naissance</Text>
                <TouchableOpacity onPress={openDatePicker} style={styles.dateTrigger}>
                    <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
                    <Text style={[styles.dateText, !profile.birth_date && styles.datePlaceholder]}>
                        {profile.birth_date ? formatDisplayDate(profile.birth_date) : 'Sélectionner une date'}
                    </Text>
                </TouchableOpacity>

                <Text style={styles.label}>Genre</Text>
                <View style={styles.genderRow}>
                    {genders.map(g => (
                        <TouchableOpacity
                            key={g.key}
                            onPress={() => setProfile(p => ({ ...p, gender: g.key }))}
                            style={[styles.genderChip, profile.gender === g.key && styles.genderActive]}
                        >
                            <Text style={[styles.genderText, profile.gender === g.key && styles.genderTextActive]}>
                                {g.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </Card>

            <Card style={styles.section}>
                <Text style={styles.sectionTitle}>Mensurations</Text>
                <View style={styles.row}>
                    <Input label="Poids (kg)" value={profile.weight} onChangeText={v => setProfile(p => ({ ...p, weight: v }))} keyboardType="decimal-pad" suffix="kg" style={{ flex: 1 }} />
                    <Input label="Taille (cm)" value={profile.height} onChangeText={v => setProfile(p => ({ ...p, height: v }))} keyboardType="decimal-pad" suffix="cm" style={{ flex: 1 }} />
                </View>
                <Button title="📊 Enregistrer mon poids" variant="secondary" onPress={handleLogWeight} size="sm" />
            </Card>

            <Button title="Sauvegarder le profil" onPress={handleSave} loading={saving} style={{ marginBottom: SPACING.lg }} />
            <Button title="Se déconnecter" variant="danger" onPress={handleSignOut} style={{ marginTop: SPACING.xxl }} />

            {/* Date picker modal with month/year selectors */}
            <RNModal visible={showDatePicker} animationType="slide" transparent>
                <View style={styles.dateModalOverlay}>
                    <View style={styles.dateModalContent}>
                        <View style={styles.dateModalHeader}>
                            <Text style={styles.dateModalTitle}>Date de naissance</Text>
                            <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                                <Ionicons name="close" size={24} color={COLORS.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Year selector */}
                        <Text style={styles.pickerLabel}>Année</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow} contentContainerStyle={styles.pickerRowContent}>
                            {YEARS.map(y => (
                                <TouchableOpacity
                                    key={y}
                                    onPress={() => setPickerYear(y)}
                                    style={[styles.pickerChip, pickerYear === y && styles.pickerChipActive]}
                                >
                                    <Text style={[styles.pickerChipText, pickerYear === y && styles.pickerChipTextActive]}>{y}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Month selector */}
                        <Text style={styles.pickerLabel}>Mois</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.pickerRow} contentContainerStyle={styles.pickerRowContent}>
                            {MONTH_NAMES.map((m, i) => (
                                <TouchableOpacity
                                    key={i}
                                    onPress={() => setPickerMonth(i + 1)}
                                    style={[styles.pickerChip, pickerMonth === i + 1 && styles.pickerChipActive]}
                                >
                                    <Text style={[styles.pickerChipText, pickerMonth === i + 1 && styles.pickerChipTextActive]}>{m}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <Calendar
                            key={calendarInitialDate}
                            initialDate={calendarInitialDate}
                            onDayPress={handleDateSelect}
                            onMonthChange={(month) => {
                                setPickerMonth(month.month);
                                setPickerYear(month.year);
                            }}
                            markedDates={profile.birth_date ? {
                                [profile.birth_date]: { selected: true, selectedColor: COLORS.primary }
                            } : {}}
                            maxDate={new Date().toISOString().split('T')[0]}
                            theme={{
                                backgroundColor: COLORS.surface,
                                calendarBackground: COLORS.surface,
                                textSectionTitleColor: COLORS.textMuted,
                                dayTextColor: COLORS.text,
                                todayTextColor: COLORS.primary,
                                monthTextColor: COLORS.text,
                                arrowColor: COLORS.primary,
                                textDisabledColor: COLORS.textMuted + '40',
                                textDayFontWeight: '500',
                                textMonthFontWeight: '700',
                            }}
                        />
                    </View>
                </View>
            </RNModal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.lg },
    title: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '800', marginBottom: SPACING.xl },
    section: { marginBottom: SPACING.lg },
    sectionTitle: { color: COLORS.text, fontSize: FONTS.sizes.md, fontWeight: '600', marginBottom: SPACING.md },
    label: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '500', marginBottom: SPACING.sm, marginTop: SPACING.md },
    row: { flexDirection: 'row', gap: SPACING.md },
    genderRow: { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg },
    genderChip: {
        paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.full,
        borderWidth: 1, borderColor: COLORS.border,
    },
    genderActive: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary },
    genderText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
    genderTextActive: { color: COLORS.primary, fontWeight: '600' },
    dateTrigger: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.sm,
        backgroundColor: COLORS.surfaceLight, borderRadius: RADIUS.md, padding: SPACING.md,
        borderWidth: 1, borderColor: COLORS.border,
    },
    dateText: { color: COLORS.text, fontSize: FONTS.sizes.md },
    datePlaceholder: { color: COLORS.textMuted },
    dateModalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.6)' },
    dateModalContent: {
        backgroundColor: COLORS.surface, borderTopLeftRadius: RADIUS.xl, borderTopRightRadius: RADIUS.xl,
        padding: SPACING.xl, paddingBottom: 40, maxHeight: '90%',
    },
    dateModalHeader: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: SPACING.md,
    },
    dateModalTitle: { color: COLORS.text, fontSize: FONTS.sizes.lg, fontWeight: '700' },
    pickerLabel: { color: COLORS.textSecondary, fontSize: FONTS.sizes.xs, fontWeight: '600', marginBottom: 4, marginTop: SPACING.sm },
    pickerRow: { maxHeight: 38, marginBottom: SPACING.sm },
    pickerRowContent: { gap: 6, alignItems: 'center' },
    pickerChip: {
        paddingVertical: 6, paddingHorizontal: 14,
        borderRadius: RADIUS.full, backgroundColor: COLORS.surfaceLight,
        borderWidth: 1, borderColor: COLORS.border,
    },
    pickerChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    pickerChipText: { color: COLORS.textMuted, fontSize: FONTS.sizes.sm, fontWeight: '500' },
    pickerChipTextActive: { color: COLORS.white, fontWeight: '700' },
});
