import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, NativeScrollEvent, NativeSyntheticEvent, Platform, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';

interface WebPullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    refreshing?: boolean;
    contentContainerStyle?: any;
}

/**
 * WebPullToRefresh - Web platformunda çalışan pull-to-refresh
 * Native platformlarda normal RefreshControl kullanır.
 */
export function WebPullToRefresh({ children, onRefresh, refreshing = false, contentContainerStyle }: WebPullToRefreshProps) {
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const scrollY = useRef(0);
    const canPull = useRef(false);

    const THRESHOLD = 80;
    const MAX_PULL = 120;

    // Native platforms - use RefreshControl
    if (Platform.OS !== 'web') {
        return (
            <ScrollView
                contentContainerStyle={contentContainerStyle}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {children}
            </ScrollView>
        );
    }

    // Web platform - custom pull-to-refresh
    const handleScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
        scrollY.current = event.nativeEvent.contentOffset.y;
        // Only allow pull when exactly at top
        canPull.current = scrollY.current <= 0;
    }, []);

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        if (scrollY.current <= 0) {
            startY.current = e.touches[0].clientY;
            canPull.current = true;
        } else {
            canPull.current = false;
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!canPull.current || isRefreshing) return;

        // Re-check scroll position
        if (scrollY.current > 0) {
            canPull.current = false;
            setPullDistance(0);
            return;
        }

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        // Only trigger on downward pull from top
        if (diff > 0 && scrollY.current <= 0) {
            e.preventDefault(); // Prevent scroll
            const distance = Math.min(diff * 0.4, MAX_PULL);
            setPullDistance(distance);
        } else if (diff < 0) {
            // User is scrolling up, stop pulling
            canPull.current = false;
            setPullDistance(0);
        }
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!canPull.current || isRefreshing) {
            setPullDistance(0);
            return;
        }

        if (pullDistance >= THRESHOLD && scrollY.current <= 0) {
            setIsRefreshing(true);
            setPullDistance(60);

            try {
                await onRefresh();
            } finally {
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                    canPull.current = false;
                }, 300);
            }
        } else {
            setPullDistance(0);
        }
    }, [pullDistance, isRefreshing, onRefresh]);

    return (
        <View style={styles.container}>
            {/* Pull indicator - only visible when pulling */}
            {pullDistance > 0 && (
                <View style={[styles.indicator, { height: pullDistance }]}>
                    <View style={styles.spinnerContainer}>
                        <ActivityIndicator
                            size="small"
                            color="#ea2a33"
                            animating={isRefreshing}
                        />
                    </View>
                </View>
            )}

            {/* @ts-ignore - Web-specific touch handlers */}
            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
                onScroll={handleScroll}
                scrollEventThrottle={8}
                onTouchStart={handleTouchStart as any}
                onTouchMove={handleTouchMove as any}
                onTouchEnd={handleTouchEnd as any}
            >
                {children}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        overflow: 'hidden',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    indicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 100,
        paddingBottom: 10,
    },
    spinnerContainer: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
});
