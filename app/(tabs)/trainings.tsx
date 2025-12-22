import { useRouter } from 'expo-router';
import { CheckCircle2, Video } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

interface Training {
    id: number;
    title: string;
    description: string;
    media_url: string;
    image_url: string | null;
    created_at: string;
    topic: string | null;
}

export default function TrainingsScreen() {
    const router = useRouter();
    const session = useAuthStore(state => state.session);
    const { isDesktop } = useResponsiveLayout();
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [userTopics, setUserTopics] = useState<string[]>([]);
    const [activeFilter, setActiveFilter] = useState<string>('Tümü');
    const [readIds, setReadIds] = useState<Set<number>>(new Set());

    useEffect(() => {
        fetchTrainings();
    }, []);

    async function fetchTrainings() {
        if (!session?.user) return;

        try {
            // 1. Get User Topics
            const { data: profile } = await supabase
                .from('profiles')
                .select('topics')
                .eq('id', session.user.id)
                .single();

            const topics = profile?.topics || [];
            setUserTopics(topics);

            // If user has no topics, show nothing (or general content if desired, but request says strict filter)
            if (!topics || topics.length === 0) {
                setTrainings([]);
                setLoading(false);
                return;
            }

            // 2. Fetch Trainings matching topics
            const { data, error } = await supabase
                .from('trainings')
                .select('*')
                .eq('is_active', true)
                .in('topic', topics)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTrainings(data || []);

            // 3. Fetch read status for user
            const { data: reads } = await supabase
                .from('training_reads')
                .select('training_id')
                .eq('user_id', session.user.id);

            if (reads) {
                setReadIds(new Set(reads.map(r => r.training_id)));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchTrainings();
        setRefreshing(false);
    };

    const handlePress = (item: Training) => {
        router.push(`/training/${item.id}`);
    };

    const filteredTrainings = activeFilter === 'Tümü'
        ? trainings
        : trainings.filter(t => t.topic === activeFilter);

    const renderItem = ({ item, index }: { item: Training; index: number }) => (
        <TouchableOpacity
            onPress={() => handlePress(item)}
            activeOpacity={0.9}
            style={isDesktop ? { flex: 1, maxWidth: '50%', padding: 8 } : undefined}
            className={isDesktop ? '' : 'bg-white mb-4 rounded-xl border border-gray-100 overflow-hidden shadow-sm'}
        >
            <View className={isDesktop ? 'bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm' : ''}>
                {/* Thumbnail */}
                <View className="h-48 bg-gray-200 relative">
                    {item.image_url ? (
                        <Image
                            source={{ uri: item.image_url }}
                            className="w-full h-full"
                            resizeMode="cover"
                        />
                    ) : (
                        <View className="w-full h-full items-center justify-center bg-gray-100">
                            <Video size={48} color="#9CA3AF" />
                        </View>
                    )}
                    {readIds.has(item.id) && (
                        <View style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#16a34a', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 20 }}>
                            <CheckCircle2 size={14} color="#fff" />
                            <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#fff' }}>Okundu</Text>
                        </View>
                    )}
                </View>

                {/* Content */}
                <View className="p-4">
                    <Text className="text-lg font-bold text-slate-900 mb-2 leading-tight">
                        {item.title}
                    </Text>
                    <Text className="text-slate-500 text-sm leading-relaxed" numberOfLines={2}>
                        {item.description}
                    </Text>
                    <View className="mt-3 flex-row items-center justify-between">
                        <View className="flex flex-row items-center gap-2">
                            {item.topic && (
                                <Text className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded">
                                    {item.topic}
                                </Text>
                            )}
                            <Text className="text-xs text-gray-400">
                                {new Date(item.created_at).toLocaleDateString('tr-TR')}
                            </Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView className="flex-1 bg-background-light">
            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-200 bg-white items-center">
                <Text className="text-lg font-bold text-slate-900">İçerik Kütüphanesi</Text>
            </View>

            {/* Filters */}
            {userTopics.length > 0 && (
                <View className="bg-white border-b border-gray-200">
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 12, gap: 8 }}>
                        <TouchableOpacity
                            onPress={() => setActiveFilter('Tümü')}
                            className={`px-4 py-2 rounded-full border ${activeFilter === 'Tümü' ? 'bg-red-600 border-red-600' : 'bg-gray-100 border-gray-200'}`}
                        >
                            <Text className={`${activeFilter === 'Tümü' ? 'text-white' : 'text-gray-600'} font-bold text-sm`}>Tümü</Text>
                        </TouchableOpacity>

                        {userTopics.map(topic => (
                            <TouchableOpacity
                                key={topic}
                                onPress={() => setActiveFilter(topic)}
                                className={`px-4 py-2 rounded-full border ${activeFilter === topic ? 'bg-red-600 border-red-600' : 'bg-gray-100 border-gray-200'}`}
                            >
                                <Text className={`${activeFilter === topic ? 'text-white' : 'text-gray-600'} font-bold text-sm`}>{topic}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}

            {loading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#ea2a33" />
                </View>
            ) : (
                <View style={isDesktop ? { maxWidth: 1200, alignSelf: 'center', width: '100%', flex: 1 } : { flex: 1 }}>
                    <FlatList
                        data={filteredTrainings}
                        renderItem={renderItem}
                        keyExtractor={item => item.id.toString()}
                        key={isDesktop ? 'grid' : 'list'}
                        numColumns={isDesktop ? 2 : 1}
                        contentContainerStyle={{ padding: 16 }}
                        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                        ListEmptyComponent={
                            <View className="items-center justify-center py-20 px-8">
                                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                                    <Video size={32} color="#9CA3AF" />
                                </View>
                                <Text className="text-lg font-bold text-gray-900 text-center mb-2">Henüz içerik yok</Text>
                                <Text className="text-gray-500 text-center">
                                    {activeFilter === 'Tümü'
                                        ? 'Şu anda kütüphanede görüntülenecek eğitim materyali bulunmuyor.'
                                        : `"${activeFilter}" konusunda henüz bir içerik bulunmuyor.`}
                                </Text>
                            </View>
                        }
                    />
                </View>
            )}
        </SafeAreaView>
    );
}
