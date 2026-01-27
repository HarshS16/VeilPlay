/**
 * Theme Context - White & Red with Dark Mode Support
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Color palette - White & Red theme
const colors = {
    light: {
        // Primary colors
        primary: '#DC2626',        // Red-600
        primaryDark: '#B91C1C',    // Red-700
        primaryLight: '#EF4444',   // Red-500

        // Background colors
        background: '#FFFFFF',
        surface: '#F9FAFB',        // Gray-50
        card: '#FFFFFF',

        // Text colors
        text: '#111827',           // Gray-900
        textSecondary: '#6B7280',  // Gray-500
        textMuted: '#9CA3AF',      // Gray-400

        // Border colors
        border: '#E5E7EB',         // Gray-200
        borderLight: '#F3F4F6',    // Gray-100

        // Status colors
        success: '#10B981',
        warning: '#F59E0B',
        error: '#DC2626',

        // Other
        white: '#FFFFFF',
        black: '#000000',
        overlay: 'rgba(0, 0, 0, 0.5)',
    },
    dark: {
        // Primary colors
        primary: '#EF4444',        // Red-500
        primaryDark: '#DC2626',    // Red-600
        primaryLight: '#F87171',   // Red-400

        // Background colors
        background: '#111827',     // Gray-900
        surface: '#1F2937',        // Gray-800
        card: '#1F2937',

        // Text colors
        text: '#F9FAFB',           // Gray-50
        textSecondary: '#9CA3AF',  // Gray-400
        textMuted: '#6B7280',      // Gray-500

        // Border colors
        border: '#374151',         // Gray-700
        borderLight: '#4B5563',    // Gray-600

        // Status colors
        success: '#34D399',
        warning: '#FBBF24',
        error: '#F87171',

        // Other
        white: '#FFFFFF',
        black: '#000000',
        overlay: 'rgba(0, 0, 0, 0.7)',
    },
};

// Spacing scale
const spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
};

// Font sizes
const typography = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    xxxl: 32,
};

// Border radius
const radius = {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
};

const ThemeContext = createContext({
    isDark: false,
    colors: colors.light,
    spacing,
    typography,
    radius,
    toggleTheme: () => { },
});

export function ThemeProvider({ children }) {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    // Auto-update when system theme changes
    useEffect(() => {
        setIsDark(systemColorScheme === 'dark');
    }, [systemColorScheme]);

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    const theme = {
        isDark,
        colors: isDark ? colors.dark : colors.light,
        spacing,
        typography,
        radius,
        toggleTheme,
    };

    return (
        <ThemeContext.Provider value={theme}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export default ThemeContext;
