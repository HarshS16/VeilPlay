/**
 * API Service
 * 
 * Handles all communication with the Flask backend.
 * This is the ONLY place where API URLs are used.
 * The app acts as a thin client - no business logic here.
 */
import axios from 'axios';

// Backend API URL - change this for your network
// For local development with physical device, use your computer's local IP
const API_BASE_URL = 'http://192.168.29.18:5000';

// Create axios instance
const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Store for interceptor reference
let authInterceptor = null;

/**
 * Set the authentication token for all subsequent requests
 */
function setAuthToken(token) {
    if (authInterceptor !== null) {
        apiClient.interceptors.request.eject(authInterceptor);
    }

    if (token) {
        authInterceptor = apiClient.interceptors.request.use(
            (config) => {
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            },
            (error) => Promise.reject(error)
        );
    }
}

// ============================================
// AUTH ENDPOINTS
// ============================================

/**
 * Register a new user
 */
async function signup(name, email, password) {
    const response = await apiClient.post('/auth/signup', {
        name,
        email,
        password,
    });
    return response.data;
}

/**
 * Login user
 */
async function login(email, password) {
    const response = await apiClient.post('/auth/login', {
        email,
        password,
    });
    return response.data;
}

/**
 * Get user profile
 */
async function getProfile() {
    const response = await apiClient.get('/auth/me');
    return response.data;
}

/**
 * Logout user
 */
async function logout() {
    const response = await apiClient.post('/auth/logout');
    return response.data;
}

// ============================================
// VIDEO ENDPOINTS
// ============================================

/**
 * Get dashboard videos (2 videos)
 */
async function getDashboard() {
    const response = await apiClient.get('/dashboard');
    return response.data;
}

/**
 * Get video details with playback token
 */
async function getVideoDetails(videoId) {
    const response = await apiClient.get(`/video/${videoId}`);
    return response.data;
}

/**
 * Get direct stream URL for video playback
 * This returns a direct video URL that can be played by native players
 * YouTube is completely hidden from the app!
 */
async function getStreamUrl(videoId, playbackToken) {
    const response = await apiClient.get(`/video/${videoId}/stream`, {
        params: { token: playbackToken },
    });
    return response.data;
}

/**
 * Get base URL (for reference)
 */
function getBaseUrl() {
    return API_BASE_URL;
}

// Export API service
const api = {
    // Auth
    signup,
    login,
    getProfile,
    logout,
    setAuthToken,

    // Videos
    getDashboard,
    getVideoDetails,
    getStreamUrl,
    getBaseUrl,
};

export default api;
