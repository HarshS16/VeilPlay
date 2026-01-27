/**
 * Settings Screen
 * 
 * Shows user profile (name + email) and logout button.
 * Also includes theme toggle for dark/light mode.
 */
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Switch,
    Alert,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function SettingsScreen() {
    const { user, logout, isLoading } = useAuth();
    const { colors, spacing, typography, radius, isDark, toggleTheme } = useTheme();
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
                    onPress: async () => {
                        setIsLoggingOut(true);
                        await logout();
                        // Navigation handled automatically by AuthContext
                    },
                },
            ]
        );
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            padding: spacing.lg,
        },

        // Profile Section
        profileSection: {
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            padding: spacing.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
        },
        avatar: {
            width: 80,
            height: 80,
            borderRadius: 40,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: spacing.md,
        },
        avatarText: {
            fontSize: typography.xxxl,
            color: colors.white,
            fontWeight: 'bold',
        },
        userName: {
            fontSize: typography.xl,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: spacing.xs,
        },
        userEmail: {
            fontSize: typography.md,
            color: colors.textSecondary,
        },

        // Settings Section
        settingsSection: {
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            marginBottom: spacing.lg,
            borderWidth: 1,
            borderColor: colors.border,
            overflow: 'hidden',
        },
        sectionTitle: {
            fontSize: typography.sm,
            fontWeight: '600',
            color: colors.textSecondary,
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: spacing.sm,
            marginLeft: spacing.md,
            marginTop: spacing.lg,
        },
        settingItem: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: spacing.md,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        settingItemLast: {
            borderBottomWidth: 0,
        },
        settingIcon: {
            fontSize: 24,
            marginRight: spacing.md,
        },
        settingContent: {
            flex: 1,
        },
        settingTitle: {
            fontSize: typography.md,
            color: colors.text,
            fontWeight: '500',
        },
        settingSubtitle: {
            fontSize: typography.sm,
            color: colors.textSecondary,
            marginTop: 2,
        },

        // Logout Button
        logoutButton: {
            backgroundColor: colors.error,
            borderRadius: radius.md,
            padding: spacing.md,
            alignItems: 'center',
            marginTop: spacing.md,
        },
        logoutButtonText: {
            color: colors.white,
            fontSize: typography.lg,
            fontWeight: 'bold',
        },

        // Version
        version: {
            textAlign: 'center',
            color: colors.textMuted,
            fontSize: typography.sm,
            marginTop: spacing.xl,
        },
    });

    // Get user initials for avatar
    const getInitials = () => {
        if (!user?.name) return '?';
        return user.name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.content}>
                {/* Profile Section */}
                <View style={styles.profileSection}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{getInitials()}</Text>
                    </View>
                    <Text style={styles.userName}>{user?.name || 'User'}</Text>
                    <Text style={styles.userEmail}>{user?.email || 'email@example.com'}</Text>
                </View>

                {/* Appearance Settings */}
                <Text style={styles.sectionTitle}>Appearance</Text>
                <View style={styles.settingsSection}>
                    <View style={[styles.settingItem, styles.settingItemLast]}>
                        <Text style={styles.settingIcon}>🌙</Text>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Dark Mode</Text>
                            <Text style={styles.settingSubtitle}>
                                {isDark ? 'Currently using dark theme' : 'Currently using light theme'}
                            </Text>
                        </View>
                        <Switch
                            value={isDark}
                            onValueChange={toggleTheme}
                            trackColor={{ false: colors.border, true: colors.primaryLight }}
                            thumbColor={isDark ? colors.primary : colors.white}
                        />
                    </View>
                </View>

                {/* Account Settings */}
                <Text style={styles.sectionTitle}>Account</Text>
                <View style={styles.settingsSection}>
                    <View style={styles.settingItem}>
                        <Text style={styles.settingIcon}>👤</Text>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Name</Text>
                            <Text style={styles.settingSubtitle}>{user?.name || 'Not set'}</Text>
                        </View>
                    </View>
                    <View style={[styles.settingItem, styles.settingItemLast]}>
                        <Text style={styles.settingIcon}>📧</Text>
                        <View style={styles.settingContent}>
                            <Text style={styles.settingTitle}>Email</Text>
                            <Text style={styles.settingSubtitle}>{user?.email || 'Not set'}</Text>
                        </View>
                    </View>
                </View>

                {/* Logout Button */}
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                    disabled={isLoggingOut}
                >
                    {isLoggingOut ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    )}
                </TouchableOpacity>

                {/* Version */}
                <Text style={styles.version}>Video App v1.0.0</Text>
            </View>
        </ScrollView>
    );
}
