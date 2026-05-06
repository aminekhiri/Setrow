import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function ForgotPasswordScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');
    const resetPassword = useAuthStore(s => s.resetPassword);

    const handleReset = async () => {
        if (!email) { setError('Entre ton email'); return; }
        setLoading(true);
        setError('');
        try {
            await resetPassword(email.trim());
            setSent(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (sent) {
        return (
            <View style={[styles.container, { justifyContent: 'center', padding: SPACING.xxl }]}>
                <Text style={{ fontSize: 48, textAlign: 'center' }}>📧</Text>
                <Text style={[styles.title, { textAlign: 'center', marginTop: SPACING.lg }]}>Email envoyé !</Text>
                <Text style={styles.subtitle}>Vérifie ta boîte mail pour réinitialiser ton mot de passe.</Text>
                <Button title="Retour" onPress={() => navigation.goBack()} style={{ marginTop: SPACING.xxl }} />
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <View style={{ flexGrow: 1, justifyContent: 'center', padding: SPACING.xxl }}>
                <Text style={styles.title}>Mot de passe oublié</Text>
                <Text style={styles.subtitle}>Entre ton email pour recevoir un lien de réinitialisation.</Text>
                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Input label="Email" value={email} onChangeText={setEmail} placeholder="email@exemple.com" keyboardType="email-address" />
                <Button title="Envoyer" onPress={handleReset} loading={loading} />
                <Button title="Retour" variant="ghost" onPress={() => navigation.goBack()} style={{ marginTop: SPACING.md }} />
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.background },
    title: { color: COLORS.text, fontSize: FONTS.sizes.xxl, fontWeight: '700', marginBottom: SPACING.sm },
    subtitle: { color: COLORS.textSecondary, fontSize: FONTS.sizes.md, marginBottom: SPACING.xxl, textAlign: 'center' },
    error: { color: COLORS.danger, fontSize: FONTS.sizes.sm, textAlign: 'center', marginBottom: SPACING.lg, backgroundColor: COLORS.dangerDim, padding: SPACING.md, borderRadius: RADIUS.md },
});
