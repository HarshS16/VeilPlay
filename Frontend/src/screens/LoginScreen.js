/**
 * Login Screen
 * 
 * Handles user login with email and password.
 * No business logic - just calls API and stores JWT.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
    const { login, isLoading } = useAuth();
    const { colors, spacing, typography, radius } = useTheme();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        // Basic validation
        if (!email.trim()) {
            setError('Email is required');
            return;
        }
        if (!password) {
            setError('Password is required');
            return;
        }

        setError('');
        const result = await login(email.trim().toLowerCase(), password);

        if (!result.success) {
            setError(result.error);
        }
        // Navigation happens automatically via AuthContext
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        scrollContent: {
            flexGrow: 1,
            justifyContent: 'center',
            padding: spacing.lg,
        },
        header: {
            alignItems: 'center',
            marginBottom: spacing.xxl,
        },
        logo: {
            fontSize: 48,
            marginBottom: spacing.md,
        },
        title: {
            fontSize: typography.xxxl,
            fontWeight: 'bold',
            color: colors.primary,
            marginBottom: spacing.xs,
        },
        subtitle: {
            fontSize: typography.md,
            color: colors.textSecondary,
        },
        form: {
            marginBottom: spacing.lg,
        },
        inputContainer: {
            marginBottom: spacing.md,
        },
        label: {
            fontSize: typography.sm,
            fontWeight: '600',
            color: colors.text,
            marginBottom: spacing.xs,
        },
        input: {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: radius.md,
            padding: spacing.md,
            fontSize: typography.md,
            color: colors.text,
        },
        inputFocused: {
            borderColor: colors.primary,
        },
        errorText: {
            color: colors.error,
            fontSize: typography.sm,
            marginBottom: spacing.md,
            textAlign: 'center',
        },
        button: {
            backgroundColor: colors.primary,
            borderRadius: radius.md,
            padding: spacing.md,
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        buttonDisabled: {
            opacity: 0.7,
        },
        buttonText: {
            color: colors.white,
            fontSize: typography.lg,
            fontWeight: 'bold',
        },
        footer: {
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
        },
        footerText: {
            color: colors.textSecondary,
            fontSize: typography.sm,
        },
        footerLink: {
            color: colors.primary,
            fontSize: typography.sm,
            fontWeight: 'bold',
            marginLeft: spacing.xs,
        },
    });

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.logo}>🎬</Text>
                    <Text style={styles.title}>Video App</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                </View>

                {/* Form */}
                <View style={styles.form}>
                    {/* Email Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor={colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                        />
                    </View>

                    {/* Password Input */}
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor={colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            editable={!isLoading}
                        />
                    </View>

                    {/* Error Message */}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    {/* Login Button */}
                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleLogin}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.buttonText}>Sign In</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={styles.footerText}>Don't have an account?</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
                        <Text style={styles.footerLink}>Sign Up</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
