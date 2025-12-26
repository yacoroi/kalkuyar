import { Stack, router } from 'expo-router';
import { ArrowLeft, Save } from 'lucide-react-native';
import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DISTRICTS, getNeighborhoods } from '../../constants/locations';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
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

export default function EditProfileScreen() {
    const { profile, fetchProfile } = useAuthStore();
    const { isDesktop } = useResponsiveLayout();
    const [loading, setLoading] = useState(false);

    // Form State
    const [fullName, setFullName] = useState(profile?.full_name || '');
    const [city, setCity] = useState(profile?.city || 'İstanbul');
    const [district, setDistrict] = useState(profile?.district || '');
    const [neighborhood, setNeighborhood] = useState(profile?.neighborhood || '');
    const [selectedTopics, setSelectedTopics] = useState<string[]>(profile?.topics || []);

    // Modal State for Selectors
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'district' | 'neighborhood' | null>(null);

    const toggleTopic = (topic: string) => {
        if (selectedTopics.includes(topic)) {
            setSelectedTopics(prev => prev.filter(t => t !== topic));
        } else {
            setSelectedTopics(prev => [...prev, topic]);
        }
    };

    const handleUpdate = async () => {
        if (!fullName.trim() || !district) {
            Alert.alert('Hata', 'Lütfen Ad Soyad ve İlçe alanlarını doldurunuz.');
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: fullName,
                    city,
                    district,
                    neighborhood,
                    topics: selectedTopics
                })
                .eq('id', profile?.id);

            if (error) throw error;

            await fetchProfile(); // Refresh global state
            Alert.alert('Başarılı', 'Profiliniz güncellendi.');
            router.back();
        } catch (error: any) {
            Alert.alert('Hata', error.message);
        } finally {
            setLoading(false);
        }
    };

    const openModal = (type: 'district' | 'neighborhood') => {
        setModalType(type);
        setModalVisible(true);
    };

    const handleSelect = (item: string) => {
        if (modalType === 'district') {
            setDistrict(item);
            setNeighborhood(''); // Reset neighborhood when district changes
        } else {
            setNeighborhood(item);
        }
        setModalVisible(false);
    };

    const getListItems = () => {
        if (modalType === 'district') return DISTRICTS['İstanbul'] || [];
        if (modalType === 'neighborhood') return getNeighborhoods(district) || [];
        return [];
    };

    return (
        <SafeAreaView className="flex-1 bg-background-light">
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View className="px-4 py-4 border-b border-gray-200 bg-white flex-row items-center gap-4">
                <TouchableOpacity onPress={() => router.back()} className="p-2 -ml-2">
                    <ArrowLeft size={24} color="#333" />
                </TouchableOpacity>
                <Text className="text-lg font-bold text-slate-900">Profili Düzenle</Text>
            </View>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={0}
            >
                <ScrollView
                    className="flex-1 p-6"
                    contentContainerStyle={isDesktop ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : undefined}
                >

                    {/* Full Name */}
                    <View className="mb-6">
                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Ad Soyad</Text>
                        <TextInput
                            value={fullName}
                            onChangeText={setFullName}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-4 text-gray-900 font-medium"
                            placeholder="Adınız Soyadınız"
                        />
                    </View>

                    {/* City (Disabled/Fixed) */}
                    <View className="mb-6">
                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Şehir</Text>
                        <View className="bg-gray-100 border border-gray-200 rounded-xl px-4 py-4">
                            <Text className="text-gray-500 font-medium">{city}</Text>
                        </View>
                    </View>

                    {/* District */}
                    <View className="mb-6">
                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">İlçe</Text>
                        <TouchableOpacity
                            onPress={() => openModal('district')}
                            className="bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center"
                        >
                            <Text className={`font-medium ${district ? 'text-gray-900' : 'text-gray-400'}`}>
                                {district || 'İlçe Seçiniz'}
                            </Text>
                            <Text className="text-gray-400">▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Neighborhood */}
                    <View className="mb-8">
                        <Text className="text-gray-500 text-xs font-bold uppercase mb-2 ml-1">Mahalle</Text>
                        <TouchableOpacity
                            onPress={() => openModal('neighborhood')}
                            className={`bg-white border border-gray-200 rounded-xl px-4 py-4 flex-row justify-between items-center ${!district && 'opacity-50'}`}
                            disabled={!district}
                        >
                            <Text className={`font-medium ${neighborhood ? 'text-gray-900' : 'text-gray-400'}`}>
                                {neighborhood || 'Mahalle Seçiniz'}
                            </Text>
                            <Text className="text-gray-400">▼</Text>
                        </TouchableOpacity>
                    </View>

                    {/* TOPICS SECTION */}
                    <View className="mb-8">
                        <Text className="text-gray-500 text-xs font-bold uppercase mb-3 ml-1">İLGİ ALANLARIM</Text>
                        <View className="flex-row flex-wrap gap-2">
                            {AVAILABLE_TOPICS.map((topic) => {
                                const isSelected = selectedTopics.includes(topic);
                                return (
                                    <TouchableOpacity
                                        key={topic}
                                        onPress={() => toggleTopic(topic)}
                                        className={`py-3 px-4 rounded-full border ${isSelected
                                            ? 'bg-red-600 border-red-600'
                                            : 'bg-white border-gray-300'
                                            }`}
                                    >
                                        <Text className={`${isSelected ? 'text-white font-bold' : 'text-gray-600'} text-sm`}>
                                            {topic}
                                        </Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </View>
                    </View>

                    {/* Save Button */}
                    <TouchableOpacity
                        onPress={handleUpdate}
                        disabled={loading}
                        className="bg-primary rounded-xl py-4 flex-row items-center justify-center gap-2 shadow-sm active:opacity-90"
                    >
                        {loading ? (
                            <Text className="text-white font-bold text-lg">Kaydediliyor...</Text>
                        ) : (
                            <>
                                <Save size={20} color="white" />
                                <Text className="text-white font-bold text-lg">Değişiklikleri Kaydet</Text>
                            </>
                        )}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>

            {/* SELECTION MODAL */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl h-[60%]">
                        <View className="p-4 border-b border-gray-100 flex-row justify-between items-center">
                            <Text className="text-lg font-bold text-gray-900">
                                {modalType === 'district' ? 'İlçe Seçiniz' : 'Mahalle Seçiniz'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2">
                                <Text className="text-primary font-bold">Kapat</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView contentContainerStyle={{ padding: 16 }}>
                            {getListItems().map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    onPress={() => handleSelect(item)}
                                    className="py-4 border-b border-gray-50 active:bg-gray-50"
                                >
                                    <Text className="text-gray-700 font-medium text-base">{item}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
