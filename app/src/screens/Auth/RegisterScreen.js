import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function RegisterScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const signUp = useAuthStore(s => s.signUp);

    const handleRegister = async () => {
        if (!email || !password || !confirmPassword) {
            setError('Veuillez remplir tous les champs');
            return;
        }
        if (password !== confirmPassword) {
            setError('Les mots de passe ne correspondent pas');
            return;
        }
        if (password.length < 6) {
            setError('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await signUp(email.trim(), password);
            setSuccess(true);
        } catch (err) {
            setError(err.message || "Erreur lors de l'inscription");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <View style={[styles.container, styles.content, { justifyContent: 'center' }]}>
                <Text style={styles.logo}>✅</Text>
                <Text style={[styles.subtitle, { fontSize: FONTS.sizes.lg, marginTop: SPACING.lg }]}>
                    Compte créé !
                </Text>
                <Text style={[styles.subtitle, { marginTop: SPACING.sm }]}>
                    Vérifie ton email pour confirmer ton inscription.
                </Text>
                <Button
                    title="Retour à la connexion"
                    onPress={() => navigation.goBack()}
                    style={{ marginTop: SPACING.xxl }}
                />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.logo}>🏋️ SETROW</Text>
                    <Text style={styles.subtitle}>Créer un compte</Text>
                </View>

                {error ? <Text style={styles.error}>{error}</Text> : null}

                <Input
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="email@exemple.com"
                    keyboardType="email-address"
                />

                <Input
                    label="Mot de passe"
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Minimum 6 caractères"
                    secureTextEntry
                />

                <Input
                    label="Confirmer le mot de passe"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="••••••••"
                    secureTextEntry
                />

                <Button
                    title="S'inscrire"
                    onPress={handleRegister}
                    loading={loading}
                    style={styles.button}
                />

                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.link}
                >
                    <Text style={styles.linkText}>
                        Déjà un compte ? <Text style={styles.linkHighlight}>Se connecter</Text>
                    </Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    content: { flexGrow: 1, justifyContent: 'center', padding: SPACING.xxl },
    header: { alignItems: 'center', marginBottom: SPACING.xxxl },
    logo: { fontSize: 42, fontWeight: '800', color: COLORS.primary, letterSpacing: 2 },
    subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginTop: SPACING.sm, textAlign: 'center' },
    error: {
        color: COLORS.danger, fontSize: FONTS.sizes.sm, textAlign: 'center',
        marginBottom: SPACING.lg, backgroundColor: COLORS.dangerDim, padding: SPACING.md, borderRadius: RADIUS.md,
    },
    button: { marginTop: SPACING.sm },
    link: { marginTop: SPACING.lg, alignItems: 'center' },
    linkText: { color: COLORS.textSecondary, fontSize: FONTS.sizes.sm },
    linkHighlight: { color: COLORS.primary, fontWeight: '600' },
});
