import { Audio } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, ExternalLink, Headphones, Pause, Play, Video } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

// Define Interface Locally or Import if available
interface Training {
    id: number;
    title: string;
    description: string;
    media_url: string | null;
    image_url: string | null;
    audio_url: string | null;
    created_at: string;
    topic: string | null;
}

export default function TrainingDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { user } = useAuthStore();
    const { isDesktop } = useResponsiveLayout();
    const [training, setTraining] = useState<Training | null>(null);
    const [loading, setLoading] = useState(true);
    const [isRead, setIsRead] = useState(false);

    // Audio State
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        fetchTrainingDetails();
    }, [id]);

    useEffect(() => {
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    async function markAsRead() {
        if (!user?.id || !id) return;

        try {
            await supabase
                .from('training_reads')
                .upsert({
                    user_id: user.id,
                    training_id: Number(id)
                }, { onConflict: 'user_id,training_id' });

            setIsRead(true);
        } catch (error) {
            console.error('Error marking as read:', error);
        }
    }

    async function fetchTrainingDetails() {
        if (!id) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('trainings')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error(error);
            Alert.alert('Hata', 'İçerik detayları alınamadı.');
            router.back();
        } else {
            setTraining(data as Training);
            // Mark as read when content is viewed
            markAsRead();
        }
        setLoading(false);
    }

    async function playSound() {
        if (!training?.audio_url) return;

        try {
            if (sound) {
                await sound.playAsync();
                setIsPlaying(true);
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: training.audio_url },
                    { shouldPlay: true }
                );
                setSound(newSound);
                setIsPlaying(true);

                newSound.setOnPlaybackStatusUpdate((status) => {
                    if (status.isLoaded && status.didJustFinish) {
                        setIsPlaying(false);
                        newSound.setPositionAsync(0);
                        newSound.pauseAsync();
                    }
                });
            }
        } catch (error) {
            console.error('Audio play error:', error);
            Alert.alert('Hata', 'Ses dosyası oynatılamadı.');
        }
    }

    async function pauseSound() {
        if (sound) {
            await sound.pauseAsync();
            setIsPlaying(false);
        }
    }

    const openMedia = () => {
        if (training?.media_url) {
            Linking.openURL(training.media_url);
        }
    };

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-white items-center justify-center">
                <ActivityIndicator size="large" color="#ea2a33" />
            </SafeAreaView>
        );
    }

    if (!training) return null;

    return (
        <SafeAreaView className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header / Back Button */}
            <View className="px-4 py-2 border-b border-gray-100 flex-row items-center gap-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-gray-100">
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-gray-900 flex-1 truncate" numberOfLines={1}>
                    İçerik Detayı
                </Text>
            </View>

            <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40, ...(isDesktop ? { maxWidth: 800, alignSelf: 'center', width: '100%' } : {}) }}>

                {/* Hero Image */}
                <View className="h-64 bg-gray-100 w-full relative">
                    {training.image_url ? (
                        <Image
                            source={{ uri: training.image_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-gray-200">
                            <Video size={64} color="#9CA3AF" />
                        </View>
                    )}
                </View>

                {/* Content Body */}
                <View className="px-6 py-6">
                    {/* Topic Badge */}
                    {training.topic && (
                        <View className="self-start bg-red-50 px-3 py-1 rounded-full mb-3 border border-red-100">
                            <Text className="text-red-700 text-xs font-bold uppercase">{training.topic}</Text>
                        </View>
                    )}

                    <Text className="text-2xl font-bold text-gray-900 leading-tight mb-2">
                        {training.title}
                    </Text>

                    <Text className="text-gray-500 text-sm mb-6">
                        {new Date(training.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>

                    {/* AUDIO PLAYER */}
                    {training.audio_url && (
                        <View className="mb-8 bg-gray-50 border border-gray-200 rounded-2xl p-4 flex-row items-center gap-4 shadow-sm">
                            <TouchableOpacity
                                onPress={isPlaying ? pauseSound : playSound}
                                className="w-14 h-14 bg-[#ea2a33] rounded-full items-center justify-center shadow active:scale-95"
                            >
                                {isPlaying ? (
                                    <Pause size={28} color="white" fill="white" />
                                ) : (
                                    <Play size={28} color="white" fill="white" className="ml-1" />
                                )}
                            </TouchableOpacity>
                            <View className="flex-1">
                                <View className="flex-row items-center gap-2 mb-1">
                                    <Headphones size={14} color="#ea2a33" />
                                    <Text className="font-bold text-gray-900">Ses Kaydı</Text>
                                </View>
                                <Text className="text-gray-500 text-xs">Dinlemek için oynat butonuna basın</Text>
                            </View>
                        </View>
                    )}

                    {/* Description */}
                    <Text className="text-gray-800 text-base leading-relaxed mb-8">
                        {training.description}
                    </Text>

                    {/* Media Link (PDF/Video) */}
                    {training.media_url && (
                        <TouchableOpacity
                            onPress={openMedia}
                            className="bg-white border-2 border-gray-900 rounded-xl p-4 flex-row items-center justify-between active:bg-gray-50"
                        >
                            <View className="flex-row items-center gap-3">
                                <Video size={24} color="#111" />
                                <View>
                                    <Text className="font-bold text-gray-900">Video / Döküman</Text>
                                    <Text className="text-gray-500 text-xs">Görüntülemek için dokunun</Text>
                                </View>
                            </View>
                            <ExternalLink size={20} color="#666" />
                        </TouchableOpacity>
                    )}

                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
