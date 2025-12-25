import { Image } from 'expo-image';
import React, { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useStoryStore } from '../../stores/useStoryStore';
import { StoryViewer } from './StoryViewer';

export function StoriesRail() {
    const { storyGroups } = useStoryStore();
    const [selectedGroupIndex, setSelectedGroupIndex] = useState<number | null>(null);

    // Feature Flag Check - Geçici olarak devre dışı
    // if (process.env.EXPO_PUBLIC_ENABLE_STORIES !== 'true') return null;

    if (!storyGroups || storyGroups.length === 0) return null;

    const handlePressStory = (index: number) => {
        setSelectedGroupIndex(index);
    };

    const handleCloseViewer = () => {
        setSelectedGroupIndex(null);
    };

    const renderItem = ({ item, index }: { item: any, index: number }) => {
        const thumbnailUrl = item.items?.[0]?.media_url || item.avatar_url;
        const isViewed = item.allViewed;

        return (
            <Pressable
                onPress={() => handlePressStory(index)}
                style={({ pressed }) => [
                    styles.itemContainer,
                    pressed && styles.itemPressed
                ]}
            >
                <View style={[
                    styles.ring,
                    isViewed ? styles.ringViewed : styles.ringUnviewed
                ]}>
                    <View style={styles.innerRing}>
                        <View style={styles.imageWrapper}>
                            {thumbnailUrl ? (
                                <Image
                                    source={{ uri: thumbnailUrl }}
                                    style={styles.image}
                                    contentFit="cover"
                                />
                            ) : (
                                <View style={styles.placeholderImage}>
                                    <Image
                                        source={require('../../assets/images/icon.png')}
                                        style={styles.placeholderIcon}
                                    />
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            </Pressable>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={storyGroups}
                renderItem={renderItem}
                keyExtractor={(item) => item.user_id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
            />

            {selectedGroupIndex !== null && (
                <Modal visible={true} transparent animationType="fade">
                    <StoryViewer
                        initialGroupIndex={selectedGroupIndex}
                        onClose={handleCloseViewer}
                    />
                </Modal>
            )}
        </View>
    );
}

const RING_SIZE = 78;

const styles = StyleSheet.create({
    container: {
        paddingVertical: 14,
        marginBottom: 8,
    },
    listContent: {
        paddingHorizontal: 8,
        gap: 14,
    },
    itemContainer: {
        alignItems: 'center',
    },
    itemPressed: {
        opacity: 0.85,
        transform: [{ scale: 0.94 }],
    },
    ring: {
        width: RING_SIZE,
        height: RING_SIZE,
        borderRadius: RING_SIZE / 2,
        padding: 3,
    },
    ringUnviewed: {
        backgroundColor: '#ea2a33',
        shadowColor: '#ea2a33',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 10,
        elevation: 8,
    },
    ringViewed: {
        backgroundColor: '#d1d5db',
    },
    innerRing: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: RING_SIZE / 2,
        padding: 2,
    },
    imageWrapper: {
        flex: 1,
        borderRadius: (RING_SIZE - 10) / 2,
        overflow: 'hidden',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    placeholderImage: {
        flex: 1,
        backgroundColor: '#f3f4f6',
        alignItems: 'center',
        justifyContent: 'center',
    },
    placeholderIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
});
