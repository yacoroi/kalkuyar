import { Image } from 'expo-image';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, Calendar, Share2 } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Linking, Pressable, ScrollView, Share, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { supabase } from '../../lib/supabase';
import { News } from '../../types';

export default function NewsDetailScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { isDesktop } = useResponsiveLayout();
    const [news, setNews] = useState<News | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNewsDetail();
    }, [id]);

    async function fetchNewsDetail() {
        if (!id) return;
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            setNews(data);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleShare = async () => {
        if (!news) return;
        try {
            await Share.share({
                message: `${news.title}\n\n${news.url}`,
            });
        } catch (error) {
            console.error(error);
        }
    };

    if (loading) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <ActivityIndicator size="large" color="#CE1126" />
            </View>
        );
    }

    if (!news) {
        return (
            <View className="flex-1 items-center justify-center bg-white">
                <Text>Haber bulunamadı.</Text>
            </View>
        );
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView
                className="flex-1"
                showsVerticalScrollIndicator={false}
                bounces={false}
                contentContainerStyle={isDesktop ? { maxWidth: 800, alignSelf: 'center', width: '100%' } : undefined}
            >
                {/* Hero Image */}
                <View className="w-full h-72 relative">
                    {news.image_url ? (
                        <Image
                            source={{ uri: news.image_url }}
                            style={{ width: '100%', height: '100%' }}
                            contentFit="cover"
                        />
                    ) : (
                        <View className="w-full h-full bg-gray-200 items-center justify-center">
                            <Text>Resim Yok</Text>
                        </View>
                    )}

                    {/* Floating Header Buttons */}
                    {/* Floating Header Buttons */}
                    <View
                        className="absolute top-0 left-0 right-0 px-4 flex-row justify-between items-start"
                        style={{ paddingTop: Math.max(insets.top, 20) + 10 }}
                    >
                        <Pressable
                            onPress={() => router.back()}
                            className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full items-center justify-center"
                        >
                            <ArrowLeft size={24} color="white" />
                        </Pressable>

                        <Pressable
                            onPress={handleShare}
                            className="w-10 h-10 bg-black/30 backdrop-blur-md rounded-full items-center justify-center"
                        >
                            <Share2 size={20} color="white" />
                        </Pressable>
                    </View>
                </View>

                {/* Content Body */}
                <View className="flex-1 bg-white -mt-6 rounded-t-[32px] px-6 pt-8 pb-10">

                    {/* Category/Date Tag */}
                    <View className="flex-row items-center justify-between mb-5">
                        <View className="flex-row items-center gap-2">
                            <View className="w-1 h-4 bg-[#ea2a33] rounded-full"></View>
                            <Text className="text-[#ea2a33] font-bold uppercase tracking-wider text-xs">GÜNDEM</Text>
                        </View>

                        <View className="flex-row items-center gap-1.5">
                            <Calendar size={14} color="#888" />
                            <Text className="text-gray-500 text-xs font-medium">
                                {new Date(news.published_at).toLocaleDateString('tr-TR', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                })}
                            </Text>
                        </View>
                    </View>

                    {/* Title */}
                    <Text className="text-[24px] font-extrabold text-[#111111] leading-[32px] mb-6">
                        {news.title}
                    </Text>

                    {/* Separator */}
                    <View className="h-[1px] w-full bg-gray-100 mb-6"></View>

                    {/* Article Content */}
                    <View>
                        {news.content ? (
                            <Text className="text-[17px] text-[#333333] leading-[28px] font-normal tracking-wide text-left">
                                {news.content}
                            </Text>
                        ) : (
                            <Text className="text-base text-gray-500 italic text-center py-10">
                                İçerik yüklenemedi.
                            </Text>
                        )}
                    </View>

                    {/* Read Original Button */}
                    <Pressable
                        onPress={() => Linking.openURL(news.url)}
                        className="mt-8 py-4 bg-gray-50 rounded-xl border border-gray-200 items-center justify-center active:bg-gray-100"
                    >
                        <Text className="text-gray-600 font-semibold">Haberi Kaynağında Oku</Text>
                    </Pressable>

                    {/* Footer space */}
                    <View className="h-10"></View>
                </View>
            </ScrollView>
        </View>
    );
}
