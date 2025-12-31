import { Medal, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Pressable, RefreshControl, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

interface LeaderboardUser {
    rank: number;
    user_id: string;
    full_name: string;
    avatar_url: string | null;
    points: number;
}

type Scope = 'neighborhood' | 'district' | 'city';

export default function LeaderboardScreen() {
    const { session, profile } = useAuthStore();
    const { isDesktop } = useResponsiveLayout();
    const [scope, setScope] = useState<Scope>('neighborhood');
    const [rankings, setRankings] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLeaderboard();
        setRefreshing(false);
    };

    useEffect(() => {
        if (profile) {
            fetchLeaderboard();
        }
    }, [scope, profile]);

    async function fetchLeaderboard() {
        if (!profile) return;
        setLoading(true);
        console.log('Fetching Leaderboard with:', {
            scope,
            city: profile.city,
            district: profile.district,
            neighborhood: profile.neighborhood
        });

        try {
            const { data, error } = await supabase.rpc('get_leaderboard', {
                p_scope: scope,
                p_city: profile.city || '',
                p_district: profile.district || '',
                p_neighborhood: profile.neighborhood || '',
                p_limit: 50
            });

            console.log('RPC Response:', { data, error });

            if (error) throw error;
            setRankings(data || []);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    }

    const renderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
        const isMe = item.user_id === session?.user.id;
        let medalColor = 'text-gray-500';
        let bgColor = isMe ? 'bg-red-50 border-red-200' : 'bg-white border-gray-100';

        if (item.rank === 1) medalColor = 'text-yellow-500';
        if (item.rank === 2) medalColor = 'text-gray-400';
        if (item.rank === 3) medalColor = 'text-amber-600';

        return (
            <View className={`flex-row items-center p-4 mb-3 rounded-2xl border ${bgColor} shadow-sm`}>
                {/* Rank */}
                <View className="w-8 items-center justify-center mr-3">
                    <Text className={`text-lg font-bold ${item.rank <= 3 ? medalColor : 'text-gray-500'}`}>
                        {item.rank}.
                    </Text>
                </View>

                {/* Avatar */}
                <View className="mr-3">
                    {isMe && item.avatar_url ? (
                        <Image source={{ uri: item.avatar_url }} className="w-10 h-10 rounded-full bg-gray-200" />
                    ) : (
                        <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center">
                            <User size={20} className="text-gray-400" />
                        </View>
                    )}
                </View>

                {/* Info */}
                <View className="flex-1">
                    <Text className={`font-bold text-base ${isMe ? 'text-red-600' : 'text-slate-900'}`}>
                        {isMe ? `${item.full_name} (Sen)` : 'Saadet Üyesi'}
                    </Text>
                    <Text className="text-xs text-gray-400">
                        {scope === 'neighborhood' ? profile?.neighborhood : scope === 'district' ? profile?.district : profile?.city}
                    </Text>
                </View>

                {/* Points */}
                <View className="bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
                    <Text className="text-orange-600 font-bold text-sm">{item.points} P</Text>
                </View>
            </View>
        );
    };

    const ListHeader = () => (
        <View className="bg-white px-4 pt-2 pb-4 shadow-sm z-10 -mx-4 mb-4">
            <View className="items-center mb-4 mt-2">
                <Text className="text-xl font-bold text-slate-900">Puan Sıralaması</Text>
            </View>

            {/* Scope Selector */}
            <View style={{ flexDirection: 'row', backgroundColor: '#f3f4f6', padding: 4, borderRadius: 12 }}>
                <Pressable
                    onPress={() => setScope('neighborhood')}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: 'center',
                        borderRadius: 8,
                        backgroundColor: scope === 'neighborhood' ? '#ffffff' : 'transparent',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: scope === 'neighborhood' ? 0.1 : 0,
                        shadowRadius: 2,
                        elevation: scope === 'neighborhood' ? 2 : 0,
                    }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 12, color: scope === 'neighborhood' ? '#dc2626' : '#6b7280' }}>MAHALLEM</Text>
                </Pressable>
                <Pressable
                    onPress={() => setScope('district')}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: 'center',
                        borderRadius: 8,
                        backgroundColor: scope === 'district' ? '#ffffff' : 'transparent',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: scope === 'district' ? 0.1 : 0,
                        shadowRadius: 2,
                        elevation: scope === 'district' ? 2 : 0,
                    }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 12, color: scope === 'district' ? '#dc2626' : '#6b7280' }}>İLÇEM</Text>
                </Pressable>
                <Pressable
                    onPress={() => setScope('city')}
                    style={{
                        flex: 1,
                        paddingVertical: 8,
                        alignItems: 'center',
                        borderRadius: 8,
                        backgroundColor: scope === 'city' ? '#ffffff' : 'transparent',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: scope === 'city' ? 0.1 : 0,
                        shadowRadius: 2,
                        elevation: scope === 'city' ? 2 : 0,
                    }}
                >
                    <Text style={{ fontWeight: 'bold', fontSize: 12, color: scope === 'city' ? '#dc2626' : '#6b7280' }}>İL GENELİ</Text>
                </Pressable>
            </View>
        </View>
    );

    if (loading) {
        return (
            <SafeAreaView className="flex-1 bg-gray-50">
                <View style={isDesktop ? { maxWidth: 800, alignSelf: 'center', width: '100%', flex: 1 } : { flex: 1 }}>
                    <ListHeader />
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#ea2a33" />
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView className="flex-1 bg-gray-50">
            <View style={isDesktop ? { maxWidth: 800, alignSelf: 'center', width: '100%', flex: 1 } : { flex: 1 }}>
                <FlatList
                    data={rankings}
                    renderItem={renderItem}
                    keyExtractor={item => item.user_id}
                    contentContainerStyle={{ padding: 16, paddingBottom: 100 }}
                    ListHeaderComponent={ListHeader}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                    ListEmptyComponent={
                        <View className="items-center justify-center py-20">
                            <Medal size={48} className="text-gray-300 mb-4" />
                            <Text className="text-gray-500 font-medium">Bu kategoride henüz sıralama yok.</Text>
                        </View>
                    }
                />
            </View>
        </SafeAreaView>
    );
}
