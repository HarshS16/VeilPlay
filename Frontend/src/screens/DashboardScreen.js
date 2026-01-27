/**
 * Dashboard Screen
 * 
 * Shows 2 video tiles fetched from backend.
 * No business logic - just renders data from API.
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Image,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';

export default function DashboardScreen({ navigation }) {
    const { colors, spacing, typography, radius } = useTheme();

    const [videos, setVideos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const fetchVideos = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getDashboard();
            setVideos(response.videos || []);
        } catch (err) {
            console.error('Error fetching dashboard:', err);
            setError('Failed to load videos. Pull to refresh.');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchVideos();
    }, [fetchVideos]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        fetchVideos();
    };

    const handleVideoPress = (video) => {
        navigation.navigate('VideoPlayer', {
            videoId: video.id,
            title: video.title,
            description: video.description,
        });
    };

    const styles = StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        content: {
            flex: 1,
            padding: spacing.md,
        },
        header: {
            marginBottom: spacing.lg,
        },
        greeting: {
            fontSize: typography.lg,
            color: colors.textSecondary,
        },
        headerTitle: {
            fontSize: typography.xxl,
            fontWeight: 'bold',
            color: colors.text,
            marginTop: spacing.xs,
        },
        videoCard: {
            backgroundColor: colors.card,
            borderRadius: radius.lg,
            marginBottom: spacing.md,
            overflow: 'hidden',
            borderWidth: 1,
            borderColor: colors.border,
            // Shadow for iOS
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            // Elevation for Android
            elevation: 3,
        },
        thumbnail: {
            width: '100%',
            height: 200,
            backgroundColor: colors.surface,
        },
        playButton: {
            position: 'absolute',
            top: 80,
            left: '50%',
            marginLeft: -30,
            width: 60,
            height: 60,
            borderRadius: 30,
            backgroundColor: colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            // Shadow
            shadowColor: colors.black,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 6,
            elevation: 6,
        },
        playIcon: {
            fontSize: 24,
            color: colors.white,
            marginLeft: 4,
        },
        cardContent: {
            padding: spacing.md,
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
            lineHeight: 20,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
        },
        errorContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
        },
        errorText: {
            fontSize: typography.md,
            color: colors.error,
            textAlign: 'center',
            marginTop: spacing.md,
        },
        emptyContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            padding: spacing.lg,
        },
        emptyIcon: {
            fontSize: 64,
            marginBottom: spacing.md,
        },
        emptyText: {
            fontSize: typography.lg,
            color: colors.textSecondary,
            textAlign: 'center',
        },
    });

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ marginTop: spacing.md, color: colors.textSecondary }}>
                    Loading videos...
                </Text>
            </View>
        );
    }

    if (error && videos.length === 0) {
        return (
            <View style={[styles.container, styles.errorContainer]}>
                <Text style={{ fontSize: 64 }}>😕</Text>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity
                    style={{
                        marginTop: spacing.lg,
                        backgroundColor: colors.primary,
                        paddingHorizontal: spacing.lg,
                        paddingVertical: spacing.md,
                        borderRadius: radius.md,
                    }}
                    onPress={fetchVideos}
                >
                    <Text style={{ color: colors.white, fontWeight: 'bold' }}>Try Again</Text>
                </TouchableOpacity>
            </View>
        );
    }

    const renderVideoCard = ({ item }) => (
        <TouchableOpacity
            style={styles.videoCard}
            onPress={() => handleVideoPress(item)}
            activeOpacity={0.8}
        >
            <View>
                <Image
                    source={{ uri: item.thumbnail_url }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                />
                <View style={styles.playButton}>
                    <Text style={styles.playIcon}>▶</Text>
                </View>
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.videoTitle} numberOfLines={2}>
                    {item.title}
                </Text>
                <Text style={styles.videoDescription} numberOfLines={2}>
                    {item.description}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={videos}
                renderItem={renderVideoCard}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={isRefreshing}
                        onRefresh={handleRefresh}
                        tintColor={colors.primary}
                        colors={[colors.primary]}
                    />
                }
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.greeting}>Welcome back! 👋</Text>
                        <Text style={styles.headerTitle}>Featured Videos</Text>
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>📹</Text>
                        <Text style={styles.emptyText}>No videos available</Text>
                    </View>
                }
            />
        </View>
    );
}
