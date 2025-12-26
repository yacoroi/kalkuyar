import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { Camera, LogOut, Mail, Trophy, User } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

interface LeaderboardHistoryItem {
  id: string;
  user_id: string;
  period_name: string;
  rank: number;
  points: number;
  archived_at: string;
}

export default function ProfileScreen() {
  const { profile, fetchProfile, user } = useAuthStore();
  const { isDesktop } = useResponsiveLayout();
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [stats, setStats] = useState({
    tasksDone: 0,
    peopleReached: 0
  });
  const [achievements, setAchievements] = useState<LeaderboardHistoryItem[]>([]);

  // Pick and upload profile image
  async function pickImage() {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
    }
  }

  async function uploadAvatar(uri: string) {
    if (!user?.id) return;

    setUploading(true);
    try {
      // Get file extension
      const ext = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${user.id}.${ext}`;

      // For web, we need to fetch and convert to blob
      let fileData: Blob | ArrayBuffer;
      if (Platform.OS === 'web') {
        const response = await fetch(uri);
        fileData = await response.blob();
      } else {
        const response = await fetch(uri);
        fileData = await response.arrayBuffer();
      }

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, fileData, {
          cacheControl: '3600',
          upsert: true,
          contentType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      // Update profile with avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      // Refresh profile
      await fetchProfile();

      if (Platform.OS !== 'web') {
        Alert.alert('Başarılı!', 'Profil fotoğrafınız güncellendi.');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      const message = 'Fotoğraf yüklenirken hata oluştu: ' + error.message;
      if (Platform.OS === 'web') {
        window.alert(message);
      } else {
        Alert.alert('Hata', message);
      }
    } finally {
      setUploading(false);
    }
  }

  useEffect(() => {
    fetchStats();
  }, [profile]);

  async function fetchStats() {
    if (!profile) return;

    try {
      // Count completed tasks
      const { count: taskCount, error: taskError } = await supabase
        .from('tasks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id)
        .eq('status', 'completed');

      if (taskError) {
        console.error('Error fetching task count:', taskError);
      }

      // Sum people_count from reports
      const { data: reportData, error: reportError } = await supabase
        .from('reports')
        .select('people_count')
        .eq('user_id', profile.id);

      if (reportError) {
        console.error('Error fetching reports:', reportError);
      }

      const totalPeople = reportData?.reduce((sum, report) => sum + (report.people_count || 1), 0) || 0;

      // Fetch History Achievements
      const { data: historyData, error: historyError } = await supabase
        .from('leaderboard_history')
        .select('*')
        .eq('user_id', profile.id)
        .order('archived_at', { ascending: false });

      if (historyError) {
        console.error('Error fetching achievements:', historyError);
      }

      setStats({
        tasksDone: taskCount || 0,
        peopleReached: totalPeople
      });
      setAchievements((historyData as LeaderboardHistoryItem[]) || []);
    } catch (e) {
      console.error('Exception fetching stats:', e);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProfile(); // Refresh points
    await fetchStats();
    setRefreshing(false);
  };



  return (
    <SafeAreaView className="flex-1 bg-background-light">
      <ScrollView
        contentContainerStyle={{ paddingBottom: 24 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={isDesktop ? { maxWidth: 800, alignSelf: 'center', width: '100%' } : undefined}>
          {/* HEADER */}
          <View className="px-4 py-4 border-b border-gray-200 sticky top-0 bg-background-light z-10 flex-row items-center justify-between">
            <View style={{ width: 24 }} />
            <Text className="text-lg font-bold text-slate-900">Profilim</Text>
            <TouchableOpacity onPress={() => router.push('/profile/edit')}>
              <Text className="text-primary font-bold text-sm">Düzenle</Text>
            </TouchableOpacity>
          </View>

          {/* AVATAR & INFO */}
          <View className="items-center py-8">
            <TouchableOpacity onPress={pickImage} disabled={uploading} style={{ position: 'relative' }}>
              <View className="w-32 h-32 rounded-full bg-gray-200 overflow-hidden border-4 border-white shadow-sm">
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={{ width: '100%', height: '100%' }} />
                ) : (
                  <View className="w-full h-full items-center justify-center bg-primary/10">
                    <User size={64} color="#bd0505" />
                  </View>
                )}
                {uploading && (
                  <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size="large" color="#fff" />
                  </View>
                )}
              </View>
              <View style={{ position: 'absolute', bottom: 0, right: 0, backgroundColor: '#ea2a33', borderRadius: 20, padding: 8, borderWidth: 3, borderColor: '#fff' }}>
                <Camera size={16} color="#fff" />
              </View>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-slate-900">{profile?.full_name}</Text>
            <Text className="text-slate-500 font-medium">{profile?.role === 'member' ? 'Kullanıcı' : profile?.role}</Text>

            {/* Selected Topics */}
            {profile?.topics && profile.topics.length > 0 && (
              <View className="flex-row flex-wrap justify-center gap-2 mt-3 px-8">
                {profile.topics.map((topic: string) => (
                  <View key={topic} className="bg-red-50 px-3 py-1 rounded-full border border-red-100">
                    <Text className="text-red-600 font-medium text-xs">{topic}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* STATS ROW */}
          <View className="flex-row gap-3 px-4 mb-6">
            <View className="flex-1 bg-white p-4 rounded-xl border border-gray-100 items-center shadow-sm">
              <Text className="text-2xl font-bold text-slate-900">{profile?.points || 0}</Text>
              <Text className="text-xs text-slate-500">Puan</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl border border-gray-100 items-center shadow-sm">
              <Text className="text-2xl font-bold text-slate-900">{profile?.season_target || 15}</Text>
              <Text className="text-xs text-slate-500">Hedef</Text>
            </View>
            <View className="flex-1 bg-white p-4 rounded-xl border border-gray-100 items-center shadow-sm">
              <Text className="text-2xl font-bold text-slate-900">{profile?.season_contacts || 0}</Text>
              <Text className="text-xs text-slate-500">Temas</Text>
            </View>
          </View>



          {/* ACHIEVEMENTS (HISTORY) */}
          <View className="px-4 mb-6">
            <Text className="text-lg font-bold text-slate-900 mb-3">Geçmiş Başarılar</Text>
            {achievements.length > 0 ? (
              <View className="gap-3">
                {achievements.map((item) => (
                  <View key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 flex-row items-center gap-4 shadow-sm">
                    <View className="w-12 h-12 rounded-full bg-yellow-50 items-center justify-center border border-yellow-100">
                      <Trophy size={24} color="#ca8a04" />
                    </View>
                    <View className="flex-1">
                      <Text className="font-bold text-slate-900 text-base">{item.period_name}</Text>
                      <Text className="text-slate-500 text-sm">
                        {item.rank === 1 ? 'Şampiyon 🏆' : `${item.rank}. Sırada Tamamladınız`}
                      </Text>
                    </View>
                    <View className="bg-gray-50 px-3 py-1 rounded-lg">
                      <Text className="text-gray-600 font-bold text-xs">{item.points} P</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-white p-6 rounded-xl border border-gray-100 items-center justify-center border-dashed">
                <Trophy size={32} color="#e5e7eb" className="mb-2" />
                <Text className="text-gray-400 font-medium">Henüz geçmiş dönem başarısı yok.</Text>
              </View>
            )}
          </View>

          {/* ACTIONS */}
          <View className="px-4 mt-6">
            <Text className="text-lg font-bold text-slate-900 mb-3">İşlemler</Text>
            <View className="gap-3">
              <TouchableOpacity
                onPress={() => router.push('/contact')}
                className="bg-white p-4 rounded-xl border border-gray-100 flex-row items-center gap-4 shadow-sm"
              >
                <View className="w-12 h-12 rounded-full bg-red-50 items-center justify-center">
                  <Mail size={24} color="#ea2a33" />
                </View>
                <View>
                  <Text className="font-semibold text-slate-900">Bize Ulaşın</Text>
                  <Text className="text-slate-500 text-sm">Görüş ve önerilerinizi iletin</Text>
                </View>
              </TouchableOpacity>
            </View>
          </View>

          {/* LOGOUT BUTTON */}
          <View className="px-4 mt-4 pb-8">
            <TouchableOpacity
              onPress={async () => {
                const { error } = await supabase.auth.signOut();
                if (error) Alert.alert('Hata', error.message);
              }}
              className="flex-row items-center justify-center gap-2 bg-red-50 p-4 rounded-xl border border-red-100 active:bg-red-100"
            >
              <LogOut size={20} color="#dc2626" />
              <Text className="text-red-600 font-bold text-base">Çıkış Yap</Text>
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
