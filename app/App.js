import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { useAuthStore } from './src/store/authStore';
import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/constants/theme';

export default function App() {
    const { isAuthenticated, isLoading, initialize } = useAuthStore();

    useEffect(() => {
        initialize();
    }, []);

    if (isLoading) {
        return (
            <View style={styles.loading}>
                <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
                <ActivityIndicator color={COLORS.primary} size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                    primary: COLORS.primary,
                    background: COLORS.background,
                    card: COLORS.surface,
                    text: COLORS.text,
                    border: COLORS.border,
                    notification: COLORS.primary,
                },
                fonts: {
                    regular: {
                        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
                        fontWeight: '400',
                    },
                    medium: {
                        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif-medium', default: 'System' }),
                        fontWeight: '500',
                    },
                    bold: {
                        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
                        fontWeight: '700',
                    },
                    heavy: {
                        fontFamily: Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' }),
                        fontWeight: '800',
                    },
                },
            }}
        >
            <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
            {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
});
