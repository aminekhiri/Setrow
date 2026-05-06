import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { COLORS, FONTS, SPACING, RADIUS } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const signIn = useAuthStore(s => s.signIn);

    const handleLogin = async () => {
        if (!email || !password) {
            setError('Veuillez remplir tous les champs');
            return;
        }
        setLoading(true);
        setError('');
        try {
            await signIn(email.trim(), password);
        } catch (err) {
            setError(err.message || 'Erreur de connexion');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
                <View style={styles.header}>
                    <Text style={styles.logo}>🏋️ SETROW</Text>
                    <Text style={styles.subtitle}>Ton carnet de musculation</Text>
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
                    placeholder="••••••••"
                    secureTextEntry
                />

                <Button
                    title="Se connecter"
                    onPress={handleLogin}
                    loading={loading}
                    style={styles.button}
                />

                <TouchableOpacity
                    onPress={() => navigation.navigate('Register')}
                    style={styles.link}
                >
                    <Text style={styles.linkText}>
                        Pas encore de compte ? <Text style={styles.linkHighlight}>S'inscrire</Text>
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => navigation.navigate('ForgotPassword')}
                    style={styles.link}
                >
                    <Text style={styles.linkText}>Mot de passe oublié ?</Text>
                </TouchableOpacity>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    content: {
        flexGrow: 1,
        justifyContent: 'center',
        padding: SPACING.xxl,
    },
    header: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl * 2,
    },
    logo: {
        fontSize: 42,
        fontWeight: '800',
        color: COLORS.primary,
        letterSpacing: 2,
    },
    subtitle: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.md,
        marginTop: SPACING.sm,
    },
    error: {
        color: COLORS.danger,
        fontSize: FONTS.sizes.sm,
        textAlign: 'center',
        marginBottom: SPACING.lg,
        backgroundColor: COLORS.dangerDim,
        padding: SPACING.md,
        borderRadius: RADIUS.md,
    },
    button: {
        marginTop: SPACING.sm,
    },
    link: {
        marginTop: SPACING.lg,
        alignItems: 'center',
    },
    linkText: {
        color: COLORS.textSecondary,
        fontSize: FONTS.sizes.sm,
    },
    linkHighlight: {
        color: COLORS.primary,
        fontWeight: '600',
    },
});
