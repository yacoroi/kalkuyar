import { useRouter } from 'expo-router';
import { ArrowRight, Check } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

const AVAILABLE_TOPICS = [
    'Ekonomi',
    'Gençlik',
    'Aile',
    'Adalet',
    'Eğitim',
    'Tarım',
    'Şehircilik',
    'Dış Politika',
    'Sağlık',
    'Teknoloji'
];

export default function TopicsScreen() {
    const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { user, fetchProfile, profile } = useAuthStore();
    const { scaleFont } = useScaleFont();
    const { isDesktop } = useResponsiveLayout();

    useEffect(() => {
        if (profile?.topics) {
            setSelectedTopics(profile.topics);
        }
    }, [profile]);

    const toggleTopic = (topic: string) => {
        if (selectedTopics.includes(topic)) {
            setSelectedTopics(prev => prev.filter(t => t !== topic));
        } else {
            setSelectedTopics(prev => [...prev, topic]);
        }
    };

    const MIN_TOPICS = 3;

    const saveTopics = async () => {
        if (selectedTopics.length < MIN_TOPICS) {
            Alert.alert('Uyarı', `Lütfen en az ${MIN_TOPICS} ilgi alanı seçiniz.`);
            return;
        }

        if (!user) return;

        setLoading(true);
        const { error } = await supabase
            .from('profiles')
            .update({ topics: selectedTopics })
            .eq('id', user.id);

        if (error) {
            Alert.alert('Hata', 'Kayıt başarısız: ' + error.message);
        } else {
            await fetchProfile(); // Update local store
            router.replace('/(tabs)');
        }
        setLoading(false);
    };

    return (
        <View className="flex-1 bg-[#d91f26]">
            <SafeAreaView className="flex-1 justify-center">
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: 'center',
                        paddingHorizontal: 16,
                        paddingVertical: 24
                    }}
                >
                    {/* Main Card Container */}
                    <View
                        className="bg-[#fcdcdc] rounded-3xl shadow-xl p-6"
                        style={isDesktop ? { maxWidth: 520, alignSelf: 'center', width: '100%' } : undefined}
                    >
                        {/* Header */}
                        <View className="items-center mb-6">
                            <Text className="font-bold text-[#333333] text-center" style={{ fontSize: scaleFont(26) }} allowFontScaling={false}>
                                İlgi Alanlarınız
                            </Text>
                            <Text className="text-[#666] mt-3 text-center" style={{ fontSize: scaleFont(14), lineHeight: 20 }} allowFontScaling={false}>
                                İçeriklerinizi kişiselleştirmek için{'\n'}ilgi alanlarınızı seçin.
                            </Text>
                        </View>

                        {/* Topics Grid */}
                        <View className="flex-row flex-wrap justify-center mb-6" style={{ gap: 12 }}>
                            {AVAILABLE_TOPICS.map((topic) => {
                                const isSelected = selectedTopics.includes(topic);
                                return (
                                    <TouchableOpacity
                                        key={topic}
                                        onPress={() => toggleTopic(topic)}
                                        style={{
                                            width: '45%',
                                            paddingVertical: 16,
                                            paddingHorizontal: 12,
                                            borderRadius: 16,
                                            borderWidth: 2,
                                            borderColor: isSelected ? '#a61a1f' : '#e0c0c0',
                                            backgroundColor: isSelected ? '#a61a1f' : '#faecec',
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: 8,
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        {isSelected && <Check size={18} color="white" strokeWidth={3} />}
                                        <Text
                                            className={`${isSelected ? 'text-white font-bold' : 'text-[#555] font-semibold'}`}
                                            style={{ fontSize: scaleFont(15) }}
                                            allowFontScaling={false}
                                        >
                                            {topic}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>

                        {/* Selected Count Badge */}
                        <View className="mb-4">
                            <View className={`rounded-lg py-2 px-4 ${selectedTopics.length >= MIN_TOPICS ? 'bg-green-100' : 'bg-[#a61a1f]/10'}`}>
                                <Text className={`font-bold text-center ${selectedTopics.length >= MIN_TOPICS ? 'text-green-700' : 'text-[#a61a1f]'}`} style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>
                                    {selectedTopics.length}/{MIN_TOPICS} alan seçildi {selectedTopics.length >= MIN_TOPICS ? '✓' : ''}
                                </Text>
                            </View>
                        </View>

                        {/* Button */}
                        <TouchableOpacity
                            onPress={saveTopics}
                            disabled={loading || selectedTopics.length < MIN_TOPICS}
                            className={`h-14 rounded-xl flex-row justify-center items-center gap-2 shadow-lg ${selectedTopics.length >= MIN_TOPICS ? 'bg-[#a61a1f]' : 'bg-gray-300'}`}
                            activeOpacity={0.8}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Text className="text-white font-bold" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>
                                        {profile?.topics && profile.topics.length > 0 ? "Kaydet" : "Başla"}
                                    </Text>
                                    <ArrowRight size={22} color="white" strokeWidth={2.5} />
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
