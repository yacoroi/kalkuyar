import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { BookOpen, ClipboardList, MapPin, Trophy, User as UserIcon } from 'lucide-react-native';
import React, { useEffect } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StoriesRail } from '../../components/stories/StoriesRail';
import { WebPullToRefresh } from '../../components/WebPullToRefresh';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';
import { useStoryStore } from '../../stores/useStoryStore';
import { useTaskStore } from '../../stores/useTaskStore';
import { News } from '../../types';

interface RankingData {
  neighborhood: number | null;
  district: number | null;
  city: number | null;
}

interface LatestTraining {
  id: number;
  title: string;
  description: string | null;
  image_url: string | null;
  topic: string | null;
}

interface PendingSurvey {
  training_id: number;
  training_title: string;
  training_topic: string | null;
}

export default function DashboardScreen() {
  const { profile, user } = useAuthStore();
  const { activeTasks, loading, fetchActiveTasks } = useTaskStore();
  const { fetchStories } = useStoryStore();
  const [refreshing, setRefreshing] = React.useState(false);
  const { scaleFont } = useScaleFont();
  const { isDesktop, width } = useResponsiveLayout();
  const router = useRouter();
  const [news, setNews] = React.useState<News[]>([]);
  const [rankings, setRankings] = React.useState<RankingData>({ neighborhood: null, district: null, city: null });
  const [latestTraining, setLatestTraining] = React.useState<LatestTraining | null>(null);
  const [pendingSurveys, setPendingSurveys] = React.useState<PendingSurvey[]>([]);

  useEffect(() => {
    fetchStories();
    fetchNews();
  }, []);

  useEffect(() => {
    if (profile && user) {
      fetchRankings();
    }
  }, [profile, user]);

  async function fetchNews() {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('id, title, image_url, published_at')
        .eq('is_active', true)
        .order('published_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching news:', error);
        return;
      }

      if (data) setNews(data as News[]);
    } catch (e) {
      console.error('Exception fetching news:', e);
    }
  }

  async function fetchRankings() {
    if (!profile || !user) return;

    try {
      // Fetch all three rankings in parallel
      const [neighborhoodRes, districtRes, cityRes] = await Promise.all([
        supabase.rpc('get_leaderboard', {
          p_scope: 'neighborhood',
          p_city: profile.city || '',
          p_district: profile.district || '',
          p_neighborhood: profile.neighborhood || '',
          p_limit: 100
        }),
        supabase.rpc('get_leaderboard', {
          p_scope: 'district',
          p_city: profile.city || '',
          p_district: profile.district || '',
          p_neighborhood: profile.neighborhood || '',
          p_limit: 100
        }),
        supabase.rpc('get_leaderboard', {
          p_scope: 'city',
          p_city: profile.city || '',
          p_district: profile.district || '',
          p_neighborhood: profile.neighborhood || '',
          p_limit: 100
        })
      ]);

      // Find user's rank in each
      const findMyRank = (data: any[] | null) => {
        if (!data) return null;
        const me = data.find(u => u.user_id === user.id);
        return me?.rank || null;
      };

      setRankings({
        neighborhood: findMyRank(neighborhoodRes.data),
        district: findMyRank(districtRes.data),
        city: findMyRank(cityRes.data)
      });
    } catch (e) {
      console.error('Error fetching rankings:', e);
    }
  }

  async function fetchLatestTraining() {
    if (!profile?.topics || profile.topics.length === 0 || !user) {
      setLatestTraining(null);
      return;
    }

    try {
      // First get user's read training IDs
      const { data: readData } = await supabase
        .from('training_reads')
        .select('training_id')
        .eq('user_id', user.id);

      const readIds = readData?.map(r => r.training_id) || [];

      // Then fetch latest unread training from user's topics
      let query = supabase
        .from('trainings')
        .select('id, title, description, image_url, topic')
        .eq('is_active', true)
        .in('topic', profile.topics)
        .order('created_at', { ascending: false });

      // Exclude read trainings if any
      if (readIds.length > 0) {
        query = query.not('id', 'in', `(${readIds.join(',')})`);
      }

      const { data, error } = await query.limit(1).maybeSingle();

      if (error) {
        console.error('Error fetching latest training:', error);
        setLatestTraining(null);
        return;
      }

      // If no unread trainings, show the latest one anyway
      if (!data) {
        const { data: fallbackData } = await supabase
          .from('trainings')
          .select('id, title, description, image_url, topic')
          .eq('is_active', true)
          .in('topic', profile.topics)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        setLatestTraining(fallbackData);
        return;
      }

      setLatestTraining(data);
    } catch (e) {
      console.error('Exception fetching latest training:', e);
    }
  }

  async function fetchPendingSurveys() {
    if (!user) return;

    try {
      // Fetch trainings that user has read but not completed survey
      const { data, error } = await supabase
        .from('training_reads')
        .select(`
          training_id,
          trainings!inner (
            id,
            title,
            topic,
            survey_questions
          )
        `)
        .eq('user_id', user.id)
        .eq('survey_completed', false)
        .not('trainings.survey_questions', 'is', null);

      if (error) {
        console.error('Error fetching pending surveys:', error);
        return;
      }

      // Filter to only include trainings with actual questions
      const surveys = (data || []).filter((item: any) =>
        item.trainings?.survey_questions &&
        Array.isArray(item.trainings.survey_questions) &&
        item.trainings.survey_questions.length > 0
      ).map((item: any) => ({
        training_id: item.trainings.id,
        training_title: item.trainings.title,
        training_topic: item.trainings.topic
      }));

      setPendingSurveys(surveys);
    } catch (e) {
      console.error('Exception fetching pending surveys:', e);
    }
  }

  useEffect(() => {
    if (user && profile) {
      fetchActiveTasks(user.id, profile.topics);
      fetchLatestTraining();
      fetchPendingSurveys();
    }
  }, [user, profile]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchNews(),
      fetchRankings(),
      fetchLatestTraining(),
      fetchPendingSurveys(),
      fetchStories(),
      user && profile ? fetchActiveTasks(user.id, profile.topics) : Promise.resolve()
    ]);
    setRefreshing(false);
  }, [user, profile]);

  // Desktop: fixed card width, Mobile: full width minus padding
  const taskCardWidth = isDesktop ? 420 : Dimensions.get('window').width - 32;

  const renderTaskItem = ({ item, index }: { item: any, index: number }) => (
    <View style={{ width: taskCardWidth, marginRight: isDesktop ? 16 : 0 }}>
      <View className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden relative">
        <View className="h-40 bg-gray-200 w-full relative">
          {item.content_packs.image_url ? (
            <Image
              source={{ uri: item.content_packs.image_url }}
              style={{ width: '100%', height: '100%' }}
              contentFit="cover"
            />
          ) : (
            <View className="absolute inset-0 items-center justify-center bg-gray-100">
              <Text className="text-4xl">🎯</Text>
            </View>
          )}

          <View className="absolute top-2 right-2 bg-white/95 px-2 py-1 rounded-md text-xs font-bold shadow-sm border border-gray-100 flex-row items-center gap-1">
            <Text className="text-primary font-bold" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>GÖREV {index + 1}/{activeTasks.length}</Text>
          </View>
        </View>

        <View className="p-4 gap-4">
          <View>
            <Text className="text-[#333333] font-bold leading-tight mb-2" numberOfLines={1} style={{ fontSize: scaleFont(20) }} allowFontScaling={false}>{item.content_packs.title}</Text>
            <Text className="text-gray-500 line-clamp-2" numberOfLines={2} style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>{item.content_packs.message_framework}</Text>
          </View>

          {/* Progress */}
          <View className="gap-2">
            <View className="w-full bg-gray-200 rounded-full h-2">
              <View className="bg-primary h-2 rounded-full w-[10%]"></View>
            </View>
            <Text className="text-gray-400" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>Başlangıç aşaması</Text>
          </View>

          <View style={{ marginTop: 8 }}>
            <Pressable
              onPress={() => router.push(`/task/${item.id}`)}
              style={{
                width: '100%',
                height: 48,
                backgroundColor: '#ea2a33',
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Text style={{ color: 'white', fontWeight: 'bold', fontSize: scaleFont(16) }} allowFontScaling={false}>Göreve Git</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </View>
  );

  const renderNewsItem = ({ item }: { item: News }) => (
    <Pressable onPress={() => router.push(`/news/${item.id}`)} className="mr-4 w-64 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <View className="h-32 bg-gray-200 relative">
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        ) : (
          <View className="items-center justify-center flex-1"><Text>📰</Text></View>
        )}
      </View>
      <View className="p-3">
        <Text className="font-bold text-gray-800 leading-tight" numberOfLines={2} style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>{item.title}</Text>
        <Text className="text-gray-500 text-xs mt-2" allowFontScaling={false}>{new Date(item.published_at).toLocaleDateString('tr-TR')}</Text>
      </View>
    </Pressable>
  );

  // Desktop-optimized news grid item
  const renderDesktopNewsItem = (item: News) => (
    <Pressable
      key={item.id}
      onPress={() => router.push(`/news/${item.id}`)}
      style={{ width: '31%', marginBottom: 16 }}
    >
      <View style={{ backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', borderWidth: 1, borderColor: '#f3f4f6' }}>
        <View style={{ height: 120, backgroundColor: '#e5e7eb' }}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          ) : (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>📰</Text></View>
          )}
        </View>
        <View style={{ padding: 12 }}>
          <Text style={{ fontWeight: '700', color: '#1f2937', fontSize: 14, lineHeight: 20 }} numberOfLines={2}>{item.title}</Text>
          <Text style={{ color: '#9ca3af', fontSize: 12, marginTop: 8 }}>{new Date(item.published_at).toLocaleDateString('tr-TR')}</Text>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-light" edges={['left', 'right', 'bottom']}>
      <WebPullToRefresh onRefresh={onRefresh} refreshing={refreshing} contentContainerStyle={{ paddingBottom: 20 }}>
        {/* DESKTOP HEADER - Simple title since sidebar has user info */}
        {isDesktop && (
          <View style={{ paddingHorizontal: 32, paddingTop: 24, paddingBottom: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: '700', color: '#1f2937' }}>
              Merhaba, {profile?.full_name?.split(' ')[0] || 'Üye'}
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, marginTop: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#fefce8', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#fef08a' }}>
                <Trophy size={16} color="#ca8a04" />
                <Text style={{ color: '#854d0e', fontWeight: '700', fontSize: 14 }}>{profile?.points || 0} Puan</Text>
              </View>
              <Text style={{ color: '#6b7280', fontSize: 14 }}>{profile?.district}, {profile?.city}</Text>
            </View>
          </View>
        )}

        {/* MOBILE HEADER SECTION - Only show on mobile */}
        {!isDesktop && (
          <View className="bg-background-light sticky top-0 z-10 border-b border-gray-100">
            {/* User Info Row */}
            <View className="flex-row items-center justify-between px-4 pb-3 pt-2">
              <View className="flex-row items-center gap-3 flex-1 mr-2">
                <View className="w-12 h-12 items-center justify-center rounded-full bg-primary/10 overflow-hidden">
                  {profile?.avatar_url ? (
                    <Image source={{ uri: profile.avatar_url }} style={{ width: 48, height: 48 }} />
                  ) : (
                    <UserIcon size={26} color="#ea2a33" />
                  )}
                </View>
                <View className="flex-1">
                  <Text className="text-[#333333] font-bold" style={{ fontSize: scaleFont(22) }} allowFontScaling={false}>
                    Merhaba, {profile?.full_name?.split(' ')[0] || 'Üye'}
                  </Text>
                  <Text className="text-gray-500" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>
                    {profile?.district}, {profile?.city}
                  </Text>
                </View>
              </View>
              <View className="items-end gap-1.5">
                <View className="flex-row items-center gap-1.5 bg-yellow-50 px-2.5 py-1.5 rounded-lg border border-yellow-200 shadow-sm">
                  <Trophy size={16} color="#ca8a04" />
                  <Text className="text-yellow-800 font-extrabold" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>{profile?.points || 0} Puan</Text>
                </View>

                {/* STREAK DISABLED - Keep for future use
                {(() => {
                  // Check if streak is valid (last report today or yesterday)
                  const isStreakValid = () => {
                    if (!profile?.last_report_date || !profile?.streak_days || profile.streak_days === 0) return false;
                    const lastReport = new Date(profile.last_report_date);
                    const today = new Date();
                    const yesterday = new Date(today);
                    yesterday.setDate(yesterday.getDate() - 1);

                    // Compare dates only (not time)
                    const lastReportStr = lastReport.toISOString().split('T')[0];
                    const todayStr = today.toISOString().split('T')[0];
                    const yesterdayStr = yesterday.toISOString().split('T')[0];

                    return lastReportStr === todayStr || lastReportStr === yesterdayStr;
                  };

                  return isStreakValid() ? (
                    <View className="flex-row items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg border border-orange-100">
                      <Flame size={12} color="#ea580c" />
                      <Text className="text-orange-700 font-bold" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>{profile?.streak_days} Gün Seri</Text>
                    </View>
                  ) : null;
                })()}
                */}
              </View>
            </View>
          </View>
        )}

        <View style={isDesktop ? { maxWidth: 1200, alignSelf: 'center', width: '100%', paddingHorizontal: 24 } : undefined} className="flex-1 px-4 mt-4">
          {/* STORIES RAIL */}
          <StoriesRail />

          {/* HERO CAROUSEL: WEEKLY MISSIONS */}
          <View className="mb-6">
            {loading ? (
              <View className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 items-center">
                <ActivityIndicator size="large" color="#ea2a33" />
              </View>
            ) : activeTasks && activeTasks.length > 0 ? (
              <View>
                <FlatList
                  data={activeTasks}
                  renderItem={renderTaskItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  pagingEnabled={!isDesktop}
                  showsHorizontalScrollIndicator={false}
                  snapToInterval={isDesktop ? undefined : taskCardWidth}
                  decelerationRate="fast"
                  contentContainerStyle={isDesktop ? { paddingRight: 16 } : undefined}
                />
              </View>
            ) : null}
          </View>

          {/* LATEST TRAINING */}
          {latestTraining && (
            <Pressable
              onPress={() => router.push(`/training/${latestTraining.id}`)}
              className="mb-6"
            >
              <View className="rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                {/* Hero Image with Overlay */}
                <View className="h-32 bg-gray-900 relative">
                  {latestTraining.image_url ? (
                    <Image
                      source={{ uri: latestTraining.image_url }}
                      style={{ width: '100%', height: '100%', opacity: 0.7 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View className="flex-1 items-center justify-center bg-gradient-to-br from-red-600 to-red-800">
                      <BookOpen size={40} color="#ffffff" />
                    </View>
                  )}

                  {/* Gradient Overlay */}
                  <View className="absolute inset-0 bg-black/40" />

                  {/* Content on top */}
                  <View className="absolute inset-0 p-4 justify-between">
                    <View className="flex-row items-center justify-between">
                      <View className="bg-white/90 px-2 py-1 rounded-lg">
                        <Text className="text-red-600 font-bold" style={{ fontSize: scaleFont(10) }} allowFontScaling={false}>YENİ İÇERİK</Text>
                      </View>
                      {latestTraining.topic && (
                        <View className="bg-red-600 px-2 py-1 rounded-lg">
                          <Text className="text-white font-bold" style={{ fontSize: scaleFont(10) }} allowFontScaling={false}>{latestTraining.topic}</Text>
                        </View>
                      )}
                    </View>

                    <View>
                      <Text className="text-white font-bold" numberOfLines={2} style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                        {latestTraining.title}
                      </Text>
                      <Text className="text-white/80 font-medium mt-1" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>
                        Okumak için dokun →
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            </Pressable>
          )}

          {/* PENDING SURVEYS - İçerik Anketi */}
          {pendingSurveys.length > 0 && (
            <View className="mb-6">
              <View className="flex-row items-center gap-2 mb-3">
                <ClipboardList size={20} color="#ea2a33" />
                <Text className="text-[#333333] font-bold" style={{ fontSize: isDesktop ? 20 : scaleFont(18) }} allowFontScaling={false}>
                  İçerik Anketi
                </Text>
                <View className="bg-red-100 px-2 py-0.5 rounded-full">
                  <Text className="text-red-600 font-bold text-xs">{pendingSurveys.length}</Text>
                </View>
              </View>

              <View style={{ gap: 12 }}>
                {pendingSurveys.map((survey) => (
                  <Pressable
                    key={survey.training_id}
                    onPress={() => router.push(`/survey/${survey.training_id}`)}
                    className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm"
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-1 mr-4">
                        {survey.training_topic && (
                          <View className="self-start bg-red-50 px-2 py-0.5 rounded mb-2">
                            <Text className="text-red-600 font-bold" style={{ fontSize: scaleFont(10) }} allowFontScaling={false}>
                              {survey.training_topic}
                            </Text>
                          </View>
                        )}
                        <Text className="font-bold text-gray-900" style={{ fontSize: scaleFont(14) }} numberOfLines={2} allowFontScaling={false}>
                          {survey.training_title}
                        </Text>
                        <Text className="text-gray-500 mt-1" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>
                          Bu içerikle ilgili görüşlerinizi paylaşın
                        </Text>
                      </View>
                      <View className="bg-primary px-4 py-2 rounded-lg">
                        <Text className="text-white font-bold" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>
                          Anketi Çöz
                        </Text>
                      </View>
                    </View>
                  </Pressable>
                ))}
              </View>
            </View>
          )}

          {/* STATS AND RANKING GRID - Side by side on desktop */}
          <View style={isDesktop ? { flexDirection: 'row', gap: 16 } : undefined}>
            {/* STATS CARDS */}
            <View className="mb-6" style={isDesktop ? { flex: 1, marginBottom: 0 } : undefined}>
              <View className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100" style={isDesktop ? { height: '100%' } : undefined}>
                <Text className="text-gray-900 font-bold mb-4" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>Aylık Temas Hedefi</Text>

                <View className="flex-row items-center gap-4">
                  {/* Large Progress Circle */}
                  <View className="w-20 h-20 rounded-full bg-red-50 border-4 border-red-600 items-center justify-center">
                    <Text className="text-red-600 font-extrabold" style={{
                      fontSize: scaleFont(
                        String(profile?.season_contacts || 0).length <= 2 ? 24 :
                          String(profile?.season_contacts || 0).length <= 3 ? 20 :
                            String(profile?.season_contacts || 0).length <= 4 ? 17 :
                              String(profile?.season_contacts || 0).length <= 5 ? 14 : 12
                      )
                    }} allowFontScaling={false}>
                      {profile?.season_contacts || 0}
                    </Text>
                    <Text className="text-red-400" style={{ fontSize: scaleFont(10) }} allowFontScaling={false}>kişi</Text>
                  </View>

                  {/* Details */}
                  <View className="flex-1">
                    <View className="flex-row items-baseline gap-1 mb-2">
                      <Text className="text-gray-900 font-bold" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>
                        Hedef: {profile?.season_target || 15} kişi
                      </Text>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <View
                        className="h-full bg-red-600 rounded-full"
                        style={{
                          width: `${Math.min(((profile?.season_contacts || 0) / (profile?.season_target || 15)) * 100, 100)}%`
                        }}
                      />
                    </View>

                    <Text className="text-gray-500" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>
                      {(profile?.season_target || 15) - (profile?.season_contacts || 0) > 0
                        ? `${(profile?.season_target || 15) - (profile?.season_contacts || 0)} kişiye daha ulaşman gerekiyor`
                        : '🎉 Tamamlandı!'}
                    </Text>
                  </View>
                </View>
              </View>
            </View>

            {/* RANKING CARDS */}
            <Pressable onPress={() => router.push('/leaderboard')} className="mb-6" style={isDesktop ? { flex: 1, marginBottom: 0 } : undefined}>
              <View className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100">
                <View className="flex-row items-center justify-between mb-3 px-1">
                  <Text className="text-gray-900 font-bold" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>Aylık Sıralaman</Text>
                  <Text className="text-red-600 font-bold" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>Tümünü Gör →</Text>
                </View>
                <View className="flex-row gap-2">
                  {/* Neighborhood Rank */}
                  <View className="flex-1 bg-red-50 rounded-xl p-3 items-center border border-red-100">
                    <MapPin size={16} color="#ea2a33" />
                    <Text className="text-red-600 font-bold mt-1" style={{ fontSize: scaleFont(20) }} allowFontScaling={false}>
                      {rankings.neighborhood ? `${rankings.neighborhood}.` : '-'}
                    </Text>
                    <Text className="text-red-400 font-medium" style={{ fontSize: scaleFont(10) }} allowFontScaling={false}>Mahallende</Text>
                  </View>
                  {/* District Rank */}
                  <View className="flex-1 bg-red-50 rounded-xl p-3 items-center border border-red-100">
                    <MapPin size={16} color="#ea2a33" />
                    <Text className="text-red-600 font-bold mt-1" style={{ fontSize: scaleFont(20) }} allowFontScaling={false}>
                      {rankings.district ? `${rankings.district}.` : '-'}
                    </Text>
                    <Text className="text-red-400 font-medium" style={{ fontSize: scaleFont(10) }} allowFontScaling={false}>İlçende</Text>
                  </View>
                  {/* City Rank */}
                  <View className="flex-1 bg-red-50 rounded-xl p-3 items-center border border-red-100">
                    <MapPin size={16} color="#ea2a33" />
                    <Text className="text-red-600 font-bold mt-1" style={{ fontSize: scaleFont(20) }} allowFontScaling={false}>
                      {rankings.city ? `${rankings.city}.` : '-'}
                    </Text>
                    <Text className="text-red-400 font-medium" style={{ fontSize: scaleFont(10) }} allowFontScaling={false}>İlinde</Text>
                  </View>
                </View>
              </View>
            </Pressable>
          </View>

          {/* NEWS SECTION */}
          {news.length > 0 && (
            <View className="mb-6">
              <Text className="text-[#333333] font-bold mb-3" style={{ fontSize: isDesktop ? 20 : scaleFont(18) }} allowFontScaling={false}>Gündem & Haberler</Text>
              {isDesktop ? (
                // Desktop: Grid layout
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                  {news.slice(0, 6).map(renderDesktopNewsItem)}
                </View>
              ) : (
                // Mobile: Horizontal scroll
                <FlatList
                  data={news}
                  renderItem={renderNewsItem}
                  keyExtractor={(item) => item.id.toString()}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ paddingRight: 20 }}
                />
              )}
            </View>
          )}

        </View>
      </WebPullToRefresh>
    </SafeAreaView>
  );
}
