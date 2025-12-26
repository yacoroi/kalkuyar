import React, { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';

interface WebPullToRefreshProps {
    children: React.ReactNode;
    onRefresh: () => Promise<void>;
    refreshing?: boolean;
}

export function WebPullToRefresh({ children, onRefresh, refreshing = false }: WebPullToRefreshProps) {
    // On native platforms, just render children (use native RefreshControl)
    if (Platform.OS !== 'web') {
        return <>{children}</>;
    }

    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const isPulling = useRef(false);
    const scrollTop = useRef(0);

    const THRESHOLD = 80;
    const MAX_PULL = 120;

    const handleTouchStart = useCallback((e: any) => {
        // Check if we're at the top of the scroll
        const target = e.target as HTMLElement;
        let scrollableParent = target;
        while (scrollableParent && scrollableParent.scrollTop === undefined) {
            scrollableParent = scrollableParent.parentElement as HTMLElement;
        }
        scrollTop.current = scrollableParent?.scrollTop || 0;

        if (scrollTop.current <= 0) {
            startY.current = e.touches?.[0]?.clientY || e.nativeEvent?.pageY || 0;
            isPulling.current = true;
        }
    }, []);

    const handleTouchMove = useCallback((e: any) => {
        if (!isPulling.current || isRefreshing) return;

        const currentY = e.touches?.[0]?.clientY || e.nativeEvent?.pageY || 0;
        const diff = currentY - startY.current;

        if (diff > 0 && scrollTop.current <= 0) {
            const distance = Math.min(diff * 0.5, MAX_PULL);
            setPullDistance(distance);
        }
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current) return;
        isPulling.current = false;

        if (pullDistance >= THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(60);

            try {
                await onRefresh();
            } finally {
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }, 300);
            }
        } else {
            setPullDistance(0);
        }
    }, [pullDistance, isRefreshing, onRefresh]);

    return (
        <View
            style={styles.container}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull indicator */}
            {pullDistance > 0 && (
                <View style={[styles.indicator, { height: pullDistance }]}>
                    <ActivityIndicator
                        size="small"
                        color="#ea2a33"
                        style={{
                            transform: [{ rotate: `${pullDistance * 3}deg` }],
                        }}
                    />
                </View>
            )}

            {/* Content */}
            <View
                style={[
                    styles.content,
                    {
                        transform: [{ translateY: pullDistance > 0 ? Math.min(pullDistance * 0.3, 20) : 0 }],
                    },
                ]}
            >
                {children}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    indicator: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        backgroundColor: 'transparent',
    },
    content: {
        flex: 1,
    },
});
