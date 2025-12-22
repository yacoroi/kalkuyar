import { useEffect, useState } from 'react';
import { Dimensions, Platform } from 'react-native';

interface ResponsiveLayout {
    isDesktop: boolean;
    isTablet: boolean;
    isMobile: boolean;
    isWeb: boolean;
    width: number;
}

const DESKTOP_BREAKPOINT = 1024;
const TABLET_BREAKPOINT = 768;

/**
 * Hook to detect responsive layout breakpoints.
 * Desktop sidebar is shown when isDesktop is true.
 * Mobile tab bar is shown when isDesktop is false.
 */
export function useResponsiveLayout(): ResponsiveLayout {
    const [dimensions, setDimensions] = useState(() => Dimensions.get('window'));

    useEffect(() => {
        const subscription = Dimensions.addEventListener('change', ({ window }) => {
            setDimensions(window);
        });

        return () => subscription?.remove();
    }, []);

    const isWeb = Platform.OS === 'web';
    const { width } = dimensions;

    // Only apply desktop layout on web platform
    const isDesktop = isWeb && width >= DESKTOP_BREAKPOINT;
    const isTablet = isWeb && width >= TABLET_BREAKPOINT && width < DESKTOP_BREAKPOINT;
    const isMobile = !isDesktop && !isTablet;

    return {
        isDesktop,
        isTablet,
        isMobile,
        isWeb,
        width,
    };
}
