import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { Frown, Meh, MoreHorizontal, Smile, Store, User, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

const CONTACT_TYPES = [
    { label: 'Seçmen', value: 'Seçmen', icon: <Users size={20} color="#333" /> },
    { label: 'Esnaf', value: 'Esnaf', icon: <Store size={20} color="#333" /> },
    { label: 'Akraba', value: 'Akraba', icon: <User size={20} color="#333" /> },
    { label: 'Diğer', value: 'Diğer', icon: <MoreHorizontal size={20} color="#333" /> },
];

const REACTIONS = [
    { label: 'Olumlu', value: 'Olumlu', icon: <Smile size={32} />, color: '#22c55e' },
    { label: 'Nötr', value: 'Nötr', icon: <Meh size={32} />, color: '#eab308' },
    { label: 'Olumsuz', value: 'Olumsuz', icon: <Frown size={32} />, color: '#ef4444' },
];

const MEMBERSHIP_OPTIONS = [
    { label: 'Üye Oldu', value: 'üye_oldu' },
    { label: 'Gönüllü', value: 'gönüllü' },
    { label: 'Kararsız', value: 'kararsız' },
    { label: 'İstemiyor', value: 'üyelik_istemiyor' },
];

export default function ReportScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();
    const navigation = useNavigation();
    const { user } = useAuthStore();
    const { scaleFont } = useScaleFont(); // Ensure hook is used if needed for sizing

    React.useLayoutEffect(() => {
        navigation.setOptions({
            headerShown: true,
            title: 'Rapor Gir',
            headerBackTitle: 'Geri',
            presentation: 'card',
            animation: 'default',
            headerStyle: { backgroundColor: '#ffffff' },
            headerTintColor: '#333333',
            headerShadowVisible: false
        });
    }, [navigation]);

    const [contactType, setContactType] = useState('');
    const [reaction, setReaction] = useState('Nötr');
    const [membershipStatus, setMembershipStatus] = useState('');
    const [peopleCount, setPeopleCount] = useState('1');
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    async function submitReport() {
        if (loading) return; // Prevent double taps

        if (!contactType) {
            Alert.alert('Eksik Bilgi', 'Lütfen kiminle görüştüğünüzü seçin.');
            return;
        }

        if (!peopleCount || isNaN(Number(peopleCount)) || Number(peopleCount) < 1) {
            Alert.alert('Eksik Bilgi', 'Lütfen geçerli bir kişi sayısı giriniz.');
            return;
        }

        setLoading(true);

        try {
            // 1. Insert Report
            const { error: reportError } = await supabase
                .from('reports')
                .insert({
                    task_id: id,
                    user_id: user?.id,
                    contact_type: contactType,
                    reaction: reaction,
                    membership_status: membershipStatus || null,
                    people_count: Number(peopleCount),
                    feedback_note: notes || '',
                    location_lat: 0,
                    location_lng: 0
                });

            if (reportError) throw reportError;

            // 2. Update Task Status
            const { error: taskError } = await supabase
                .from('tasks')
                .update({ status: 'completed', completed_at: new Date() })
                .eq('id', id);

            if (taskError) throw taskError;

            // 3. Navigate away immediately
            router.dismissAll();

            // Delay alert slightly so it shows on top of dashboard
            setTimeout(() => {
                Alert.alert(
                    'Tebrikler! 🎉',
                    'Raporunuz başarıyla gönderildi.'
                );
            }, 500);

        } catch (error: any) {
            Alert.alert('Hata', 'Rapor gönderilemedi: ' + error.message);
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-white">
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={100}
            >
                <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 120, gap: 24 }} keyboardShouldPersistTaps="handled">

                    {/* Contact Type */}
                    <View>
                        <Text className="text-base font-medium text-[#333] mb-3">Kiminle konuştun?</Text>
                        <View className="flex-row gap-3">
                            {CONTACT_TYPES.map((type) => (
                                <Pressable
                                    key={type.value}
                                    onPress={() => setContactType(type.value)}
                                    style={{
                                        flex: 1,
                                        alignItems: 'center',
                                        padding: 12,
                                        borderRadius: 12,
                                        borderWidth: 2,
                                        borderColor: contactType === type.value ? '#ea2a33' : '#e5e7eb',
                                        backgroundColor: contactType === type.value ? 'rgba(234, 42, 51, 0.05)' : '#ffffff'
                                    }}
                                >
                                    <View className="mb-1">{type.icon}</View>
                                    <Text style={{ fontWeight: '500', color: contactType === type.value ? '#ea2a33' : '#4b5563', fontSize: 12 }}>
                                        {type.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* People Count (New Field) */}
                    <View>
                        <Text className="text-base font-medium text-[#333] mb-3">Kaç kişiyle temas edildi?</Text>
                        <View className="flex-row items-center border border-gray-200 rounded-xl bg-white overflow-hidden h-14">
                            <TextInput
                                className="flex-1 px-4 text-lg font-bold text-[#333]"
                                value={peopleCount}
                                onChangeText={setPeopleCount}
                                keyboardType="number-pad"
                                placeholder="1"
                            />
                            <View className="bg-gray-50 px-4 h-full items-center justify-center border-l border-gray-200">
                                <Text className="text-gray-500 font-medium">Kişi</Text>
                            </View>
                        </View>
                    </View>

                    {/* Membership Invitation */}
                    <View>
                        <Text className="text-base font-medium text-[#333] mb-3">Üyelik Daveti</Text>
                        <View className="flex-row gap-2 flex-wrap">
                            {MEMBERSHIP_OPTIONS.map((opt) => {
                                const isSelected = membershipStatus === opt.value;
                                return (
                                    <Pressable
                                        key={opt.value}
                                        onPress={() => setMembershipStatus(isSelected ? '' : opt.value)}
                                        style={{
                                            flexDirection: 'row',
                                            alignItems: 'center',
                                            paddingHorizontal: 14,
                                            paddingVertical: 10,
                                            borderRadius: 20,
                                            borderWidth: 2,
                                            borderColor: isSelected ? '#ea2a33' : '#e5e7eb',
                                            backgroundColor: isSelected ? 'rgba(234, 42, 51, 0.05)' : '#ffffff',
                                            gap: 6,
                                        }}
                                    >
                                        <Text style={{ fontWeight: isSelected ? 'bold' : '500', color: isSelected ? '#ea2a33' : '#4b5563', fontSize: 13 }}>
                                            {opt.label}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Sentiment */}
                    <View>
                        <Text className="text-base font-medium text-[#333] mb-3">Görüşme nasıl geçti?</Text>
                        <View className="flex-row bg-gray-100 p-2 rounded-2xl h-20">
                            {REACTIONS.map((r) => {
                                const isSelected = reaction === r.value;
                                return (
                                    <Pressable
                                        key={r.value}
                                        onPress={() => setReaction(r.value)}
                                        style={{
                                            flex: 1,
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 12,
                                            backgroundColor: isSelected ? '#ffffff' : 'transparent',
                                            shadowColor: '#000',
                                            shadowOffset: { width: 0, height: 1 },
                                            shadowOpacity: isSelected ? 0.1 : 0,
                                            shadowRadius: 2,
                                            elevation: isSelected ? 2 : 0,
                                        }}
                                    >
                                        <Text style={{ fontSize: 32, opacity: isSelected ? 1 : 0.4 }}>
                                            {r.value === 'Olumlu' ? '😊' : r.value === 'Nötr' ? '😐' : '😞'}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Notes */}
                    <View>
                        <Text className="text-base font-medium text-[#333] mb-3">Notlar</Text>
                        <TextInput
                            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-base min-h-[120px]"
                            placeholder="Görüşme detaylarını ve vatandaşın taleplerini buraya yazın..."
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </ScrollView>

                {/* Footer Action */}
                <View className="p-6 bg-white border-t border-gray-100 safe-bottom">
                    <Pressable
                        onPress={submitReport}
                        disabled={loading}
                        style={{
                            width: '100%',
                            height: 56,
                            borderRadius: 28,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: loading ? 'rgba(234, 42, 51, 0.7)' : '#ea2a33',
                            shadowColor: '#ea2a33',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                            elevation: 5
                        }}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold text-lg">Tamamla ve Puan Kazan</Text>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
