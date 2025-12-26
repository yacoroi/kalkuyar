'use client';

import { useRouter } from 'next/navigation';
import React, { useCallback, useRef, useState } from 'react';

interface PullToRefreshProps {
    children: React.ReactNode;
    onRefresh?: () => Promise<void>;
}

export default function PullToRefresh({ children, onRefresh }: PullToRefreshProps) {
    const router = useRouter();
    const [pullDistance, setPullDistance] = useState(0);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const startY = useRef(0);
    const isPulling = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const THRESHOLD = 80; // Pull distance to trigger refresh
    const MAX_PULL = 120; // Maximum pull distance

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Only start pulling if scrolled to top
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY;
            isPulling.current = true;
        }
    }, []);

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (!isPulling.current || isRefreshing) return;

        const currentY = e.touches[0].clientY;
        const diff = currentY - startY.current;

        if (diff > 0 && containerRef.current?.scrollTop === 0) {
            // Apply resistance - pull less as you go further
            const distance = Math.min(diff * 0.5, MAX_PULL);
            setPullDistance(distance);

            // Prevent default only when pulling down
            if (distance > 10) {
                e.preventDefault();
            }
        }
    }, [isRefreshing]);

    const handleTouchEnd = useCallback(async () => {
        if (!isPulling.current) return;
        isPulling.current = false;

        if (pullDistance >= THRESHOLD && !isRefreshing) {
            setIsRefreshing(true);
            setPullDistance(60); // Show spinner at fixed position

            try {
                if (onRefresh) {
                    await onRefresh();
                }
                router.refresh();
            } finally {
                // Small delay for visual feedback
                setTimeout(() => {
                    setIsRefreshing(false);
                    setPullDistance(0);
                }, 300);
            }
        } else {
            setPullDistance(0);
        }
    }, [pullDistance, isRefreshing, onRefresh, router]);

    return (
        <div
            ref={containerRef}
            className="h-full overflow-auto"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: pullDistance > 0 ? 'none' : 'auto' }}
        >
            {/* Pull indicator */}
            <div
                className="flex items-center justify-center overflow-hidden transition-all duration-200"
                style={{
                    height: pullDistance,
                    opacity: pullDistance > 20 ? 1 : 0,
                }}
            >
                <div
                    className={`w-8 h-8 border-3 border-red-600 border-t-transparent rounded-full ${isRefreshing ? 'animate-spin' : ''
                        }`}
                    style={{
                        transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3}deg)`,
                        borderWidth: '3px',
                    }}
                />
            </div>

            {/* Content */}
            <div
                style={{
                    transform: pullDistance > 0 ? `translateY(${Math.min(pullDistance * 0.3, 20)}px)` : 'none',
                    transition: isPulling.current ? 'none' : 'transform 0.2s ease-out',
                }}
            >
                {children}
            </div>
        </div>
    );
}
