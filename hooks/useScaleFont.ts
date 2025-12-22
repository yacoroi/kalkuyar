import { useWindowDimensions } from 'react-native';

/**
 * Custom hook to manually scale font sizes based on user's system setting,
 * but with a safety cap to prevent layout breaking.
 */
export function useScaleFont() {
    const { fontScale } = useWindowDimensions();

    const scaleFont = (size: number) => {
        // Cap at 3.0 to prevent layout breaking (e.g. chars wrapping awkwardness)
        // while still providing very large text for accessibility.
        return size * Math.min(fontScale, 3);
    };

    return { scaleFont };
}
