/**
 * Authentication Context
 * 
 * Manages JWT token storage and authentication state.
 * Uses expo-secure-store on mobile, localStorage on web.
 */
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Platform } from 'react-native';
import api from '../services/api';

// Platform-specific storage imports
let SecureStore;

if (Platform.OS !== 'web') {
    SecureStore = require('expo-secure-store');
}

const AuthContext = createContext({
    user: null,
    token: null,
    isLoading: true,
    isAuthenticated: false,
    login: async () => { },
    signup: async () => { },
    logout: async () => { },
});

const TOKEN_KEY = 'jwt_token';
const USER_KEY = 'user_data';

// Storage helper functions
const storeAuth = async (token, userData) => {
    if (Platform.OS === 'web') {
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));
    } else {
        await SecureStore.setItemAsync(TOKEN_KEY, token);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(userData));
    }
};

const getStoredItem = async (key) => {
    if (Platform.OS === 'web') {
        return localStorage.getItem(key);
    } else {
        return await SecureStore.getItemAsync(key);
    }
};

const removeStoredItem = async (key) => {
    if (Platform.OS === 'web') {
        localStorage.removeItem(key);
    } else {
        await SecureStore.deleteItemAsync(key);
    }
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load stored token on app start
    useEffect(() => {
        loadStoredAuth();
    }, []);

    const loadStoredAuth = async () => {
        try {
            const storedToken = await getStoredItem(TOKEN_KEY);
            const storedUser = await getStoredItem(USER_KEY);

            if (storedToken && storedUser) {
                setToken(storedToken);
                // Optimistically set user first so UI renders
                setUser(JSON.parse(storedUser));
                api.setAuthToken(storedToken);

                // Verify token is still valid in background
                try {
                    // If this fails (timeout/network), we still let the user in
                    // but if it returns 401, we log them out
                    const response = await api.getProfile();
                    setUser(response.user);
                } catch (error) {
                    console.log('Background auth check failed:', error.message);
                    // Only clear auth if specifically unauthorized (401)
                    if (error.response && error.response.status === 401) {
                        await clearAuth();
                    }
                }
            }
        } catch (error) {
            console.error('Error loading auth:', error);
        } finally {
            // ALWAYS finish loading, even if errors occur
            setIsLoading(false);
        }
    };



    const clearAuth = async () => {
        await removeStoredItem(TOKEN_KEY);
        await removeStoredItem(USER_KEY);
        setToken(null);
        setUser(null);
        api.setAuthToken(null);
    };

    const login = async (email, password) => {
        setIsLoading(true);
        try {
            const response = await api.login(email, password);

            if (response.access_token && response.user) {
                await storeAuth(response.access_token, response.user);
                return { success: true };
            }

            return { success: false, error: 'Invalid response from server' };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Login failed. Check your network.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const signup = async (name, email, password) => {
        setIsLoading(true);
        try {
            const response = await api.signup(name, email, password);

            if (response.access_token && response.user) {
                await storeAuth(response.access_token, response.user);
                setToken(response.access_token);
                setUser(response.user);
                api.setAuthToken(response.access_token);
                return { success: true };
            }

            return { success: false, error: 'Invalid response from server' };
        } catch (error) {
            console.error('Signup error:', error);
            return {
                success: false,
                error: error.response?.data?.error || error.message || 'Signup failed. Check your network.'
            };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        setIsLoading(true);
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            await clearAuth();
            setIsLoading(false);
        }
    };

    const value = {
        user,
        token,
        isLoading,
        isAuthenticated: !!token,
        login,
        signup,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
