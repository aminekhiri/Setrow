import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS, FONTS, SPACING } from '../../constants/theme';
import { MUSCLE_GROUPS } from '../../constants/defaultData';
import { api } from '../../api/client';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { TouchableOpacity } from 'react-native';

export default function CreateExerciseScreen({ navigation }) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        if (!name.trim()) { Alert.alert('Erreur', 'Nom requis'); return; }
        if (!selectedMuscle) { Alert.alert('Erreur', 'Choisis un groupe musculaire'); return; }

        setLoading(true);
        try {
            await api.createExercise({
                name: name.trim(),
                muscle_group: selectedMuscle,
                description: description.trim(),
            });
            Alert.alert('✅ Exercice créé', `"${name}" a été ajouté à ton catalogue.`);
            navigation.goBack();
        } catch (err) {
            Alert.alert('Erreur', err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.content}>
            <Text style={styles.title}>Créer un exercice</Text>
            <Text style={styles.subtitle}>Ajoute un exercice personnalisé à ton catalogue</Text>

            <Input
                label="Nom de l'exercice"
                value={name}
                onChangeText={setName}
                placeholder="Ex: Machine convergente"
            />

            <Text style={styles.label}>Groupe musculaire</Text>
            <View style={styles.muscleGrid}>
                {MUSCLE_GROUPS.map(mg => (
                    <TouchableOpacity
                        key={mg.id}
                        onPress={() => setSelectedMuscle(mg.id)}
                        style={[styles.muscleChip, selectedMuscle === mg.id && styles.muscleChipActive]}
                    >
                        <Text style={styles.muscleEmoji}>{mg.icon}</Text>
                        <Text style={[styles.muscleText, selectedMuscle === mg.id && styles.muscleTextActive]}>
                            {mg.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <Input
                label="Description (optionnel)"
                value={description}
                onChangeText={setDescription}
                placeholder="Comment réaliser cet exercice..."
                multiline
            />

            <Button
                title="Créer l'exercice"
                onPress={handleCreate}
                loading={loading}
                style={{ marginTop: SPACING.lg }}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { padding: SPACING.xl },
    title: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '800', marginBottom: SPACING.xs },
    subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginBottom: SPACING.xxl },
    label: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm, fontWeight: '500', marginBottom: SPACING.sm },
    muscleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.xl },
    muscleChip: {
        flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
        paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
        backgroundColor: COLORS.surface, borderRadius: 20,
        borderWidth: 1, borderColor: COLORS.border,
    },
    muscleChipActive: { backgroundColor: COLORS.primaryGlow, borderColor: COLORS.primary },
    muscleEmoji: { fontSize: 16 },
    muscleText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
    muscleTextActive: { color: COLORS.primary, fontWeight: '600' },
});
