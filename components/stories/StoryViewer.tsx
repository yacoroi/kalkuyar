import { ResizeMode, Video } from 'expo-av';
import { Image } from 'expo-image';
import React, { useEffect, useRef, useState } from 'react';
import {
    Animated,
    BackHandler,
    Dimensions,
    PanResponder,
    Pressable,
    SafeAreaView,
    StyleSheet,
    Text,
    View
} from 'react-native';
import { useStoryStore } from '../../stores/useStoryStore';

const { width, height } = Dimensions.get('window');
const STORY_DURATION = 5000;
const SWIPE_THRESHOLD = 100; // Minimum swipe distance to close

interface StoryViewerProps {
    initialGroupIndex: number;
    onClose: () => void;
}

export function StoryViewer({ initialGroupIndex, onClose }: StoryViewerProps) {
    const { storyGroups, markAsViewed } = useStoryStore();
    const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
    const [storyIndex, setStoryIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const videoRef = useRef<Video>(null);

    // Animation for swipe down
    const translateY = useRef(new Animated.Value(0)).current;
    const opacity = useRef(new Animated.Value(1)).current;

    const currentGroup = storyGroups[groupIndex];
    const currentStory = currentGroup?.items[storyIndex];

    // Back button handler
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            onClose();
            return true;
        });

        return () => backHandler.remove();
    }, [onClose]);

    // Pan responder for swipe down to close
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                // Only respond to vertical swipes down
                return gestureState.dy > 10 && Math.abs(gestureState.dx) < 50;
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy);
                    opacity.setValue(1 - (gestureState.dy / height) * 0.5);
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > SWIPE_THRESHOLD) {
                    // Close with animation
                    Animated.parallel([
                        Animated.timing(translateY, {
                            toValue: height,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 0,
                            duration: 200,
                            useNativeDriver: true,
                        }),
                    ]).start(() => {
                        onClose();
                    });
                } else {
                    // Snap back
                    Animated.parallel([
                        Animated.spring(translateY, {
                            toValue: 0,
                            useNativeDriver: true,
                        }),
                        Animated.timing(opacity, {
                            toValue: 1,
                            duration: 150,
                            useNativeDriver: true,
                        }),
                    ]).start();
                }
            },
        })
    ).current;

    // Reset when group changes
    useEffect(() => {
        setStoryIndex(0);
        setProgress(0);
    }, [groupIndex]);

    // Mark as viewed when story changes
    useEffect(() => {
        if (currentStory) {
            markAsViewed(currentStory.id);
        }
    }, [currentStory]);

    // Timer Logic
    useEffect(() => {
        if (!currentStory || isPaused) return;

        let startTime = Date.now();
        let animationFrameId: number;
        let initialProgress = progress;
        const duration = currentStory.media_type === 'video' ? (currentStory.duration || 10000) : STORY_DURATION;

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min(initialProgress + (elapsed / duration), 1);
            setProgress(newProgress);

            if (newProgress < 1) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                handleNext();
            }
        };

        animationFrameId = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(animationFrameId);
    }, [currentStory, isPaused, storyIndex, groupIndex]);

    const handleNext = () => {
        if (storyIndex < currentGroup.items.length - 1) {
            setStoryIndex(prev => prev + 1);
            setProgress(0);
        }
        else if (groupIndex < storyGroups.length - 1) {
            setGroupIndex(prev => prev + 1);
            setStoryIndex(0);
            setProgress(0);
        }
        else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (storyIndex > 0) {
            setStoryIndex(prev => prev - 1);
            setProgress(0);
        }
        else if (groupIndex > 0) {
            setGroupIndex(prev => prev - 1);
            setStoryIndex(0);
            setProgress(0);
        }
        else {
            onClose();
        }
    };

    const handlePressIn = () => setIsPaused(true);
    const handlePressOut = () => setIsPaused(false);

    if (!currentStory) return null;

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [{ translateY }],
                    opacity
                }
            ]}
            {...panResponder.panHandlers}
        >
            {/* Blurred Background */}
            <View style={styles.blurredBackground}>
                <Image
                    source={{ uri: currentStory.media_url }}
                    style={StyleSheet.absoluteFill}
                    contentFit="cover"
                    blurRadius={30}
                />
                <View style={styles.darkOverlay} />
            </View>

            {/* Main Content */}
            <Pressable
                style={styles.content}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
            >
                {currentStory.media_type === 'video' ? (
                    <Video
                        ref={videoRef}
                        style={styles.media}
                        source={{ uri: currentStory.media_url }}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={!isPaused}
                        isLooping={false}
                    />
                ) : (
                    <Image
                        source={{ uri: currentStory.media_url }}
                        style={styles.media}
                        contentFit="contain"
                    />
                )}
            </Pressable>

            {/* Tap Zones - with long press to pause */}
            <View style={styles.tapZoneContainer}>
                <Pressable
                    style={styles.leftTapZone}
                    onPress={handlePrev}
                    onLongPress={handlePressIn}
                    onPressOut={handlePressOut}
                    delayLongPress={150}
                />
                <Pressable
                    style={styles.rightTapZone}
                    onPress={handleNext}
                    onLongPress={handlePressIn}
                    onPressOut={handlePressOut}
                    delayLongPress={150}
                />
            </View>

            {/* UI Overlays */}
            <SafeAreaView style={styles.overlay}>
                {/* Progress Bars */}
                <View style={styles.progressContainer}>
                    {currentGroup.items.map((item, index) => (
                        <View key={item.id} style={styles.progressBarBackground}>
                            <View
                                style={[
                                    styles.progressBarFill,
                                    {
                                        width: index < storyIndex ? '100%' :
                                            index === storyIndex ? `${progress * 100}%` : '0%'
                                    }
                                ]}
                            />
                        </View>
                    ))}
                </View>

                {/* Swipe indicator */}
                <View style={styles.swipeIndicator}>
                    <View style={styles.swipeBar} />
                </View>

                {/* Caption / Footer */}
                {currentStory.caption && (
                    <View style={styles.footer}>
                        <Text style={styles.caption} numberOfLines={3}>{currentStory.caption}</Text>
                    </View>
                )}
            </SafeAreaView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    blurredBackground: {
        ...StyleSheet.absoluteFillObject,
    },
    darkOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    media: {
        width: width,
        height: height,
    },
    tapZoneContainer: {
        ...StyleSheet.absoluteFillObject,
        flexDirection: 'row',
    },
    leftTapZone: {
        flex: 1,
    },
    rightTapZone: {
        flex: 3,
    },
    overlay: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'space-between',
        paddingVertical: 10,
    },
    progressContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingTop: 10,
        gap: 4,
    },
    progressBarBackground: {
        flex: 1,
        height: 2,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: 'white',
    },
    swipeIndicator: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    swipeBar: {
        width: 40,
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.5)',
        borderRadius: 2,
    },
    footer: {
        padding: 20,
        paddingBottom: 40,
    },
    caption: {
        color: 'white',
        fontSize: 16,
        textAlign: 'center',
        textShadowColor: 'rgba(0,0,0,0.7)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 4,
    },
});
