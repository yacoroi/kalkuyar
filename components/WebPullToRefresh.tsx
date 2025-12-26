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
    const isAtTop = useRef(false);
    const containerRef = useRef<View>(null);

    const THRESHOLD = 80;
    const MAX_PULL = 120;

    // Find scrollable parent and check scroll position
    const getScrollTop = useCallback(() => {
        if (typeof window === 'undefined') return 0;

        // Try to find the scrollable element
        const scrollables = document.querySelectorAll('[data-testid], [class*="scroll"]');
        for (const el of scrollables) {
            if (el.scrollTop > 0) return el.scrollTop;
        }

        // Fallback to document scroll
        return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }, []);

    const handleTouchStart = useCallback((e: any) => {
        const scrollTop = getScrollTop();
        isAtTop.current = scrollTop <= 5; // Small threshold for tolerance

        if (isAtTop.current) {
            startY.current = e.touches?.[0]?.clientY || e.nativeEvent?.pageY || 0;
            isPulling.current = true;
        } else {
            isPulling.current = false;
        }
    }, [getScrollTop]);

    const handleTouchMove = useCallback((e: any) => {
        if (!isPulling.current || isRefreshing || !isAtTop.current) return;

        const currentY = e.touches?.[0]?.clientY || e.nativeEvent?.pageY || 0;
        const diff = currentY - startY.current;

        // Only allow pulling DOWN, not UP
        if (diff > 0) {
            const distance = Math.min(diff * 0.5, MAX_PULL);
            setPullDistance(distance);
        } else {
            // If user swipes up, reset
            setPullDistance(0);
            isPulling.current = false;
        }
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current || !isAtTop.current) {
            setPullDistance(0);
            return;
        }
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
            ref={containerRef}
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

