/**
 * Video Player Screen
 * 
 * Uses WebView to load a custom HTML player from the backend.
 * The player is served by Flask and completely hides YouTube branding.
 * All YouTube URLs are server-side only - never exposed to the app.
 * 
 * Features:
 * - Custom controls via YouTube iframe API
 * - No YouTube logo or links visible (blocked by overlays)
 * - Navigation to YouTube is completely blocked
 */
import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    TouchableOpacity,
    StatusBar,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function VideoPlayerScreen({ route, navigation }) {
    const { videoId, title, description } = route.params;
    const { colors, spacing, typography, radius } = useTheme();
    const webViewRef = useRef(null);

    const [playerUrl, setPlayerUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [webViewLoading, setWebViewLoading] = useState(true);

    useEffect(() => {
        fetchVideoDetails();
    }, [videoId]);

    const fetchVideoDetails = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get video details with playback token
            const response = await api.getVideoDetails(videoId);

            if (response.player_url) {
                // Construct full URL for WebView
                const fullUrl = `${api.getBaseUrl()}${response.player_url}`;
                setPlayerUrl(fullUrl);
            } else {
                setError('Video playback URL not available');
            }
        } catch (err) {
            console.error('Error fetching video:', err);
            if (err.response?.status === 401) {
                setError('Session expired. Please login again.');
            } else {
                setError('Failed to load video. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Block ALL navigation away from our player
     * This completely prevents users from going to YouTube
     */
    const handleShouldStartLoadWithRequest = (request) => {
        const baseUrl = api.getBaseUrl();
        const url = request.url;

        // Block YouTube URLs and app deep links immediately
        if (url.includes('youtube.com') || 
            url.includes('youtu.be') || 
            url.includes('youtube://') ||
            url.startsWith('intent://') ||
            url.startsWith('vnd.youtube')) {
            console.log('Blocked YouTube navigation:', url);
            return false;
        }

        // Only allow our backend URLs and YouTube embeds (for iframe)
        if (request.url.startsWith(baseUrl) || 
            url.includes('youtube-nocookie.com/embed')) {
            return true;
        }

        // Block everything else
        console.log('Blocked navigation to:', request.url);
        return false;
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.black,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.black,
        },
        loadingText: {
            color: colors.white,
            marginTop: spacing.md,
            fontSize: typography.md,
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
            padding: spacing.lg,
        },
        errorIcon: {
            fontSize: 64,
            marginBottom: spacing.md,
        },
        errorText: {
            color: colors.error,
            fontSize: typography.lg,
            textAlign: 'center',
            marginBottom: spacing.lg,
        },
        retryButton: {
            backgroundColor: colors.primary,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
            borderRadius: radius.md,
        },
        retryButtonText: {
            color: colors.white,
            fontSize: typography.md,
            fontWeight: 'bold',
        },
        backButton: {
            marginTop: spacing.md,
            paddingHorizontal: spacing.xl,
            paddingVertical: spacing.md,
        },
        backButtonText: {
            color: colors.primary,
            fontSize: typography.md,
        },
        webViewContainer: {
            flex: 1,
            backgroundColor: colors.black,
        },
        webView: {
            flex: 1,
            backgroundColor: colors.black,
        },
        webViewLoading: {
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.black,
        },
        header: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: spacing.md,
            backgroundColor: colors.black,
        },
        backArrow: {
            fontSize: 24,
            color: colors.white,
            marginRight: spacing.md,
        },
        headerTitle: {
            flex: 1,
            fontSize: typography.lg,
            fontWeight: 'bold',
            color: colors.white,
        },
        videoInfo: {
            backgroundColor: colors.card,
            padding: spacing.md,
            borderTopWidth: 1,
            borderTopColor: colors.border,
        },
        videoTitle: {
            fontSize: typography.lg,
            fontWeight: 'bold',
            color: colors.text,
            marginBottom: spacing.xs,
        },
        videoDescription: {
            fontSize: typography.sm,
            color: colors.textSecondary,
        },
    });

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <StatusBar hidden />
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.loadingText}>Loading video...</Text>
            </View>
        );
    }

    if (error || !playerUrl) {
        return (
            <View style={styles.errorContainer}>
                <StatusBar hidden />
                <Text style={styles.errorIcon}>🎬</Text>
                <Text style={styles.errorText}>{error || 'Video not available'}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={fetchVideoDetails}>
                    <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar hidden />

            {/* Header with back button */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.backArrow}>←</Text>
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            </View>

            {/* WebView Video Player */}
            <View style={styles.webViewContainer}>
                <WebView
                    ref={webViewRef}
                    source={{ uri: playerUrl }}
                    style={styles.webView}
                    
                    // Allow video playback
                    allowsInlineMediaPlayback={true}
                    mediaPlaybackRequiresUserAction={false}
                    allowsFullscreenVideo={true}
                    
                    // CRITICAL: Block all external navigation
                    onShouldStartLoadWithRequest={handleShouldStartLoadWithRequest}
                    
                    // Block links from opening in external apps
                    originWhitelist={['*']}
                    setSupportMultipleWindows={false}
                    
                    // Performance
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    
                    // Events
                    onLoadStart={() => setWebViewLoading(true)}
                    onLoadEnd={() => setWebViewLoading(false)}
                    onError={(syntheticEvent) => {
                        const { nativeEvent } = syntheticEvent;
                        console.error('WebView error:', nativeEvent);
                        setError('Failed to load video player');
                    }}
                    
                    // Styling
                    backgroundColor={colors.black}
                    
                    // Disable gestures that could navigate away
                    bounces={false}
                    scrollEnabled={false}
                    
                    // Block popups and external links
                    injectedJavaScript={`
                        // Block window.open
                        window.open = function() { return null; };
                        
                        // Block all link clicks
                        document.addEventListener('click', function(e) {
                            var target = e.target;
                            while (target && target.tagName !== 'A') {
                                target = target.parentElement;
                            }
                            if (target && target.tagName === 'A') {
                                e.preventDefault();
                                e.stopPropagation();
                                return false;
                            }
                        }, true);
                        
                        // Disable context menu
                        document.oncontextmenu = function() { return false; };
                        
                        true;
                    `}
                />

                {/* Loading overlay */}
                {webViewLoading && (
                    <View style={styles.webViewLoading}>
                        <ActivityIndicator size="large" color={colors.primary} />
                        <Text style={styles.loadingText}>Loading player...</Text>
                    </View>
                )}
            </View>

            {/* Video Info */}
            <View style={styles.videoInfo}>
                <Text style={styles.videoTitle}>{title}</Text>
                {description && (
                    <Text style={styles.videoDescription} numberOfLines={2}>
                        {description}
                    </Text>
                )}
            </View>
        </View>
    );
}
