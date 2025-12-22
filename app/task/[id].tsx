import { Audio, ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import * as ScreenOrientation from 'expo-screen-orientation';
import { ArrowLeft, Edit3, ExternalLink, Headphones, HelpCircle, Maximize, MessageSquare, Minimize, Pause, Play, Target } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';
import { ContentPack, Task } from '../../types';

// ... (Rest of imports and component code up to CustomVideoPlayer)


export default function TaskDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const { scaleFont } = useScaleFont();
    const { isDesktop } = useResponsiveLayout();
    const [task, setTask] = useState<Task & { content_packs: ContentPack } | null>(null);
    const [loading, setLoading] = useState(true);

    // Audio State
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        fetchTaskDetails();
    }, [id]);

    useEffect(() => {
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    async function playSound() {
        if (!task?.content_packs?.audio_url) return;

        try {
            if (sound) {
                await sound.playAsync();
                setIsPlaying(true);
            } else {
                const { sound: newSound } = await Audio.Sound.createAsync(
                    { uri: task.content_packs.audio_url },
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

    async function fetchTaskDetails() {
        if (!id) return;

        setLoading(true);
        const { data, error } = await supabase
            .from('tasks')
            .select(`
        *,
        content_packs (*)
      `)
            .eq('id', id)
            .single();

        if (error) {
            Alert.alert('Hata', 'Görev detayları alınamadı.');
            router.back();
        } else {
            setTask(data as any);
        }
        setLoading(false);
    }

    // ... rest of the component
    // Parsing survey questions if string or object
    const content = task?.content_packs;

    if (loading) {
        // ...
    }

    if (!task || !content) return null; // Added check for content

    const questions = Array.isArray(content.survey_questions)
        ? content.survey_questions
        : typeof content.survey_questions === 'string'
            ? JSON.parse(content.survey_questions)
            : [];

    return (
        <View className="flex-1 bg-background-light relative">
            <Stack.Screen options={{ headerShown: false }} />

            {/* HEADER */}
            <View className="pt-12 pb-4 px-4 bg-background-light/90 backdrop-blur border-b border-gray-200 flex-row items-center sticky top-0 z-10">
                <TouchableOpacity onPress={() => router.back()} className="w-10 h-10 items-center justify-center rounded-full bg-gray-100">
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text className="ml-4 font-bold text-[#333] flex-1" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>Görev Detayı</Text>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 100, ...(isDesktop ? { maxWidth: 800, alignSelf: 'center', width: '100%' } : {}) }}>
                {/* TITLE */}
                <View className="px-4 pt-6 pb-2">
                    <Text className="font-bold text-[#1C1B1F] leading-tight mb-2" style={{ fontSize: scaleFont(32) }} allowFontScaling={false}>
                        {content.title}
                    </Text>
                    <View className="flex-row gap-2">
                        <View className="bg-primary/10 px-3 py-1 rounded-full">
                            <Text className="text-primary font-bold uppercase" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>{content.topic}</Text>
                        </View>
                    </View>
                </View>

                {/* MESSAGE FRAMEWORK */}
                <View className="mt-4 px-4">
                    <View className="flex-row items-center gap-2 mb-2 pt-4">
                        <Target size={20} color="#333" />
                        <Text className="font-bold text-[#1C1B1F]" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>Konuşma Çerçevesi</Text>
                    </View>
                    <Text className="text-[#49454F] leading-6" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                        {content.message_framework}
                    </Text>
                </View>

                {/* KEY SENTENCES */}
                <View className="mt-6">
                    <View className="flex-row items-center gap-2 px-4 mb-2 pt-4">
                        <MessageSquare size={20} color="#333" />
                        <Text className="font-bold text-[#1C1B1F]" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>Anahtar Cümleler</Text>
                    </View>
                    <View className="px-4 gap-3">
                        {(content.key_sentences && Array.isArray(content.key_sentences) && content.key_sentences.length > 0) ? (
                            content.key_sentences.map((sentence: string, index: number) => (
                                <View key={index} className="rounded-lg border-l-4 border-primary bg-primary/10 p-4">
                                    <Text className="text-[#1C1B1F] font-medium" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                                        "{sentence}"
                                    </Text>
                                </View>
                            ))
                        ) : (
                            <Text className="text-gray-500 italic px-2" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>Bu paket için özel anahtar cümle bulunmuyor.</Text>
                        )}
                    </View>
                </View>

                {/* MEDIA / VIDEO */}
                {content.media_url && (
                    <View className="mt-6 px-4">
                        <Text className="font-bold text-[#1C1B1F] mb-3 pt-4" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>İlgili Materyal</Text>

                        {(content.media_url.toLowerCase().endsWith('.mp4') ||
                            content.media_url.toLowerCase().endsWith('.mov') ||
                            content.media_url.toLowerCase().endsWith('.m4v') ||
                            content.media_url.includes('supabase.co')) ? (
                            <CustomVideoPlayer uri={content.media_url} poster={content.image_url || undefined} />
                        ) : (
                            <TouchableOpacity
                                activeOpacity={0.7}
                                onPress={() => Linking.openURL(content.media_url as string)}
                                className="bg-white border border-gray-100 p-4 rounded-2xl flex-row items-center gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.05)]"
                            >
                                <View className="w-12 h-12 bg-red-50 rounded-xl items-center justify-center border border-red-100">
                                    <Play size={24} color="#DC2626" fill="#DC2626" />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-gray-900 text-base">Videoyu İzle</Text>
                                    <Text className="text-gray-400 text-xs mt-0.5" numberOfLines={1}>Harici bağlantı</Text>
                                </View>
                                <View className="w-8 h-8 rounded-full bg-gray-50 items-center justify-center">
                                    <ExternalLink size={16} color="#6B7280" />
                                </View>
                            </TouchableOpacity>
                        )}
                    </View>
                )}

                {/* AUDIO PLAYER */}
                {content.audio_url && (
                    <View className="mt-6 px-4">
                        <View className="flex-row items-center gap-2 mb-3 pt-4">
                            <Headphones size={20} color="#333" />
                            <Text className="font-bold text-[#1C1B1F]" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>Ses Kaydı</Text>
                        </View>
                        <View className="bg-white border border-gray-200 rounded-xl p-4 flex-row items-center gap-4">
                            <TouchableOpacity
                                onPress={isPlaying ? pauseSound : playSound}
                                className="w-12 h-12 bg-[#ea2a33] rounded-full items-center justify-center shadow-sm active:scale-95"
                            >
                                {isPlaying ? (
                                    <Pause size={24} color="white" fill="white" />
                                ) : (
                                    <Play size={24} color="white" fill="white" className="ml-1" />
                                )}
                            </TouchableOpacity>
                            <View className="flex-1">
                                <Text className="font-bold text-[#333]" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                                    {content.title} - Ses Kaydı
                                </Text>
                                <Text className="text-gray-500 text-xs mt-1">Dinlemek için oynat butonuna basın</Text>
                            </View>
                        </View>
                    </View>
                )}

                {/* SURVEY QUESTIONS */}
                <View className="mt-6 px-4 pb-8">
                    <View className="flex-row items-center gap-2 mb-2 pt-4">
                        <HelpCircle size={20} color="#333" />
                        <Text className="font-bold text-[#1C1B1F]" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>Anket Soruları</Text>
                    </View>
                    <View className="bg-white p-4 rounded-xl border border-gray-200">
                        {questions.length > 0 ? (
                            questions.map((q: any, i: number) => (
                                <View key={i} className="flex-row gap-3 mb-3 last:mb-0">
                                    <Text className="text-primary font-bold" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>•</Text>
                                    <Text className="text-[#49454F]" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>{q.q || q}</Text>
                                </View>
                            ))
                        ) : (
                            <Text className="text-gray-500 italic" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>Saha sorusu bulunmamaktadır.</Text>
                        )}
                    </View>
                </View>
            </ScrollView>

            {/* FAB - REPORT BUTTON */}
            <View className="absolute bottom-6 right-6">
                <TouchableOpacity
                    onPress={() => router.push(`/report/${task.id}`)}
                    className="flex-row items-center gap-3 bg-[#28a745] px-6 h-14 rounded-xl shadow-lg active:scale-95"
                >
                    <Edit3 size={24} color="white" />
                    <Text className="text-white font-bold" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>Rapor Gir</Text>
                </TouchableOpacity>
            </View>

        </View>
    );
}

function CustomVideoPlayer({ uri, poster }: { uri: string, poster?: string }) {
    const videoRef = React.useRef<Video>(null);
    const fullscreenVideoRef = React.useRef<Video>(null);

    // Progress Bar Layout State
    const [progressBarWidth, setProgressBarWidth] = useState(0);

    const [status, setStatus] = useState<any>({});
    const [fullscreenStatus, setFullscreenStatus] = useState<any>({});
    const [isFullscreen, setIsFullscreen] = useState(false);

    const formatTime = (millis: number) => {
        if (!millis) return "0:00";
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const togglePlay = async (ref: React.RefObject<Video>, currentStatus: any) => {
        if (!ref.current) return;

        if (!currentStatus.isLoaded) {
            await ref.current.playAsync();
            return;
        }

        const isFinished = currentStatus.didJustFinish || (currentStatus.positionMillis >= (currentStatus.durationMillis || 0) && (currentStatus.durationMillis || 0) > 0);

        if (isFinished) {
            await ref.current.replayAsync();
        } else {
            currentStatus.isPlaying ? await ref.current.pauseAsync() : await ref.current.playAsync();
        }
    };

    const handleSeek = async (e: any, isFS: boolean) => {
        const width = e.nativeEvent.locationX;
        const totalWidth = progressBarWidth;
        // Basic protection
        if (totalWidth <= 0) return;

        const percent = width / totalWidth;
        const currentRef = isFS ? fullscreenVideoRef : videoRef;
        const currentSt = isFS ? fullscreenStatus : status;

        const duration = currentSt.durationMillis;
        if (!duration) return;

        const newPos = Math.floor(percent * duration);
        if (currentRef.current) {
            await currentRef.current.setPositionAsync(newPos);
        }
    };

    const enterFullscreen = async () => {
        if (!videoRef.current) return;

        // Hide Status Bar
        StatusBar.setHidden(true, 'fade');

        await videoRef.current.pauseAsync();
        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
        setIsFullscreen(true);
    };

    const exitFullscreen = async () => {
        const position = fullscreenStatus.positionMillis || 0;
        const wasPlaying = fullscreenStatus.isPlaying;

        // Show Status Bar
        StatusBar.setHidden(false, 'fade');

        if (fullscreenVideoRef.current) {
            await fullscreenVideoRef.current.pauseAsync();
        }

        await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP);
        setIsFullscreen(false);

        if (videoRef.current) {
            await videoRef.current.setPositionAsync(position);
            if (wasPlaying) {
                await videoRef.current.playAsync();
            }
        }
    };

    // Shared Control Renderer
    const renderControls = (isFS: boolean, ref: React.RefObject<Video>, currentStatus: any) => (
        <View className="absolute inset-0 justify-between z-10">
            {/* Center Play Button */}
            <TouchableOpacity
                activeOpacity={1}
                onPress={() => togglePlay(ref, currentStatus)}
                className="flex-1 items-center justify-center"
            >
                {(!currentStatus.isPlaying && !currentStatus.didJustFinish) && (
                    <View className="w-16 h-16 bg-black/40 rounded-full items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl">
                        <Play size={32} color="white" fill="white" className="ml-1" />
                    </View>
                )}
                {currentStatus.didJustFinish && (
                    <View className="w-16 h-16 bg-black/40 rounded-full items-center justify-center backdrop-blur-sm border border-white/20 shadow-xl">
                        <Play size={32} color="white" fill="white" className="ml-1" />
                    </View>
                )}
            </TouchableOpacity>

            {/* Bottom Bar */}
            <View className={`bg-black/60 px-4 py-3 flex-row items-center gap-3 backdrop-blur-md ${isFS ? 'pb-8 pt-4 px-8' : ''}`}>
                <TouchableOpacity onPress={() => togglePlay(ref, currentStatus)}>
                    {currentStatus.isPlaying ? <Pause size={20} color="white" fill="white" /> : <Play size={20} color="white" fill="white" />}
                </TouchableOpacity>

                <Text className="text-white text-xs font-medium font-mono min-w-[35px] text-center">{formatTime(currentStatus.positionMillis)}</Text>

                {/* Interactive Progress Bar */}
                <TouchableOpacity
                    className="flex-1 h-6 justify-center"
                    activeOpacity={1}
                    onLayout={(e) => setProgressBarWidth(e.nativeEvent.layout.width)}
                    onPress={(e) => handleSeek(e, isFS)}
                >
                    <View className="h-1.5 bg-white/20 rounded-full overflow-hidden pointer-events-none">
                        <View
                            className="h-full bg-red-600 rounded-full"
                            style={{ width: `${(currentStatus.positionMillis / (currentStatus.durationMillis || 1)) * 100}%` }}
                        />
                    </View>
                </TouchableOpacity>

                <Text className="text-white/70 text-xs font-medium font-mono min-w-[35px] text-center">{formatTime(currentStatus.durationMillis)}</Text>

                <TouchableOpacity onPress={isFS ? exitFullscreen : enterFullscreen} className="ml-2">
                    {isFS ? <Minimize size={20} color="white" /> : <Maximize size={20} color="white" />}
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <>
            {/* Inline Player */}
            <View className="rounded-2xl overflow-hidden shadow-lg bg-black border border-gray-100/10 relative h-56">
                <Video
                    ref={videoRef}
                    source={{ uri }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode={ResizeMode.CONTAIN}
                    useNativeControls={false}
                    isLooping={false}
                    onPlaybackStatusUpdate={status => setStatus(() => status)}
                    shouldPlay={false}
                    usePoster={!!poster}
                    posterSource={poster ? { uri: poster } : undefined}
                    posterStyle={{ resizeMode: 'cover' }}
                />
                {!isFullscreen && renderControls(false, videoRef, status)}
            </View>

            {/* Fullscreen Modal: statusBarTranslucent ensures it goes behind status bar area */}
            <Modal visible={isFullscreen} transparent={false} animationType="fade" onRequestClose={exitFullscreen} supportedOrientations={['portrait', 'landscape']} statusBarTranslucent={true}>
                <View className="flex-1 bg-black justify-center items-center relative w-full h-full">
                    <StatusBar hidden={isFullscreen} />

                    {/* Floating Close Button */}
                    <TouchableOpacity onPress={exitFullscreen} className="absolute top-6 right-6 z-50 p-2 bg-black/40 rounded-full">
                        <Minimize size={24} color="white" />
                    </TouchableOpacity>

                    <Video
                        key={isFullscreen ? 'fs' : 'inline'}
                        ref={fullscreenVideoRef}
                        source={{ uri }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode={ResizeMode.CONTAIN}
                        useNativeControls={false}
                        isLooping={false}
                        onPlaybackStatusUpdate={status => setFullscreenStatus(() => status)}
                        shouldPlay={true}
                        positionMillis={status.positionMillis}
                    />
                    {renderControls(true, fullscreenVideoRef, fullscreenStatus)}
                </View>
            </Modal>
        </>
    );
}
