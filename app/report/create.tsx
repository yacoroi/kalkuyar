import { Picker } from '@react-native-picker/picker';
import { Stack, useRouter } from 'expo-router';
import { Frown, Meh, MoreHorizontal, Smile, User, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

// Cross-platform alert function
const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
    } else {
        Alert.alert(title, message);
    }
};

const AVAILABLE_TOPICS = [
    'Ekonomi', 'Gençlik', 'Aile', 'Adalet', 'Eğitim',
    'Tarım', 'Şehircilik', 'Dış Politika', 'Sağlık', 'Teknoloji', 'D-8'
];

const CONTACT_TYPES = [
    { label: 'Aile', value: 'Aile', icon: <Users size={20} color="#333" /> },
    { label: 'Arkadaş', value: 'Arkadaş', icon: <User size={20} color="#333" /> },
    { label: 'Grup', value: 'Grup', icon: <Users size={20} color="#333" /> },
    { label: 'Diğer', value: 'Diğer', icon: <MoreHorizontal size={20} color="#333" /> },
];

const REACTIONS = [
    { label: 'Olumlu', value: 'Olumlu', icon: <Smile size={32} /> },
    { label: 'Nötr', value: 'Nötr', icon: <Meh size={32} /> },
    { label: 'Olumsuz', value: 'Olumsuz', icon: <Frown size={32} /> },
];

const MEMBERSHIP_OPTIONS = [
    { label: 'Üye Oldu', value: 'üye_oldu' },
    { label: 'Gönüllü', value: 'gönüllü' },
    { label: 'Kararsız', value: 'kararsız' },
    { label: 'İstemiyor', value: 'üyelik_istemiyor' },
];

// Generate number options 1-100 plus "100+"
const NUMBER_OPTIONS = [...Array.from({ length: 100 }, (_, i) => (i + 1).toString()), '100+'];

export default function CreateReportScreen() {
    const router = useRouter();
    const { user, profile } = useAuthStore();
    const { scaleFont } = useScaleFont();
    const { isDesktop } = useResponsiveLayout();

    const [topic, setTopic] = useState('');
    const [contactType, setContactType] = useState('');
    const [reaction, setReaction] = useState('Nötr');
    const [membershipCounts, setMembershipCounts] = useState<Record<string, string>>({});
    const [peopleCount, setPeopleCount] = useState('1');
    const [showPeopleCountPicker, setShowPeopleCountPicker] = useState(false);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ topic?: boolean; contactType?: boolean; reaction?: boolean; membershipStatus?: boolean; peopleCount?: boolean }>({});

    async function submitReport() {
        if (loading) return;

        // Collect all missing fields
        const missingFields: string[] = [];
        const newErrors: typeof errors = {};

        if (!topic) {
            missingFields.push('• Konu Başlığı');
            newErrors.topic = true;
        }
        if (!contactType) {
            missingFields.push('• Muhatap Tipi');
            newErrors.contactType = true;
        }
        if (!reaction) {
            missingFields.push('• Tepki');
            newErrors.reaction = true;
        }
        if (Object.keys(membershipCounts).length === 0) {
            missingFields.push('• Üyelik Durumu');
            newErrors.membershipStatus = true;
        }
        if (!peopleCount || (peopleCount !== '100+' && (isNaN(Number(peopleCount)) || Number(peopleCount) < 1))) {
            missingFields.push('• Kişi Sayısı');
            newErrors.peopleCount = true;
        }

        if (missingFields.length > 0) {
            setErrors(newErrors);
            // Only show alert on native, on web just show red borders
            if (Platform.OS !== 'web') {
                showAlert(
                    'Eksik Bilgi',
                    `Lütfen aşağıdaki alanları doldurun:\n\n${missingFields.join('\n')}`
                );
            }
            return;
        }

        setErrors({});

        setLoading(true);

        try {
            const { error: reportError } = await supabase
                .from('reports')
                .insert({
                    task_id: null, // Self-report
                    user_id: user?.id,
                    topic: topic,
                    contact_type: contactType,
                    reaction: reaction,
                    membership_status: Object.keys(membershipCounts).length > 0 ? Object.keys(membershipCounts)[0] : null,
                    membership_counts: membershipCounts, // JSONB with all selected types and counts
                    people_count: peopleCount === '100+' ? 100 : Number(peopleCount),
                    feedback_note: notes || '',
                    location_lat: 0,
                    location_lng: 0
                });

            if (reportError) throw reportError;

            // Success -> Go back to dashboard
            router.replace('/(tabs)');

            setTimeout(() => {
                showAlert('Tebrikler! 🎉', 'Raporunuz başarıyla kaydedildi.');
            }, 500);

        } catch (error: any) {
            showAlert('Hata', 'Rapor gönderilemedi: ' + error.message);
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen
                options={{
                    title: 'Yeni Rapor',
                    headerBackTitle: 'Geri',
                    headerShown: true,
                    headerStyle: { backgroundColor: '#ffffff' },
                    headerTintColor: '#333333',
                    headerShadowVisible: false
                }}
            />

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                className="flex-1"
                keyboardVerticalOffset={100}
            >
                <ScrollView
                    contentContainerStyle={{
                        padding: 24,
                        paddingBottom: 120,
                        gap: 24,
                        ...(isDesktop ? { maxWidth: 700, alignSelf: 'center', width: '100%' } : {})
                    }}
                    keyboardShouldPersistTaps="handled"
                >

                    {/* Topic Selector */}
                    <View style={errors.topic ? { padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : undefined}>
                        <Text className="font-medium text-[#333] mb-3" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                            Hangi konuda konuştunuz? {errors.topic && <Text style={{ color: '#ef4444' }}>*</Text>}
                        </Text>
                        <View className="flex-row flex-wrap gap-2">
                            {(() => {
                                const userTopics = profile?.topics || [];
                                const displayedTopics = userTopics.length > 0
                                    ? AVAILABLE_TOPICS.filter(t => userTopics.includes(t))
                                    : AVAILABLE_TOPICS;

                                return displayedTopics.map((t) => {
                                    const isSelected = topic === t;

                                    return (
                                        <Pressable
                                            key={t}
                                            onPress={() => setTopic(t)}
                                            style={{
                                                paddingHorizontal: 16,
                                                paddingVertical: 10,
                                                borderRadius: 20,
                                                backgroundColor: isSelected ? '#ea2a33' : '#f3f4f6',
                                                borderWidth: 1,
                                                borderColor: isSelected ? '#ea2a33' : '#e5e7eb',
                                            }}
                                        >
                                            <Text style={{
                                                fontWeight: isSelected ? 'bold' : 'normal',
                                                color: isSelected ? 'white' : '#4b5563',
                                                fontSize: scaleFont(14)
                                            }} allowFontScaling={false}>
                                                {t}
                                            </Text>
                                        </Pressable>
                                    );
                                });
                            })()}
                        </View>
                    </View>

                    {/* Contact Type */}
                    <View style={errors.contactType ? { padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : undefined}>
                        <Text className="font-medium text-[#333] mb-3" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                            Kiminle konuştun? {errors.contactType && <Text style={{ color: '#ef4444' }}>*</Text>}
                        </Text>
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
                                    <Text style={{ fontSize: scaleFont(12), fontWeight: '500', color: contactType === type.value ? '#ea2a33' : '#4b5563' }} allowFontScaling={false}>
                                        {type.label}
                                    </Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>

                    {/* People Count */}
                    <View style={errors.peopleCount ? { padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : undefined}>
                        <Text className="font-medium text-[#333] mb-3" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                            Kaç kişiyle temas edildi? {errors.peopleCount && <Text style={{ color: '#ef4444' }}>*</Text>}
                        </Text>

                        {Platform.OS === 'web' ? (
                            /* Web: Native HTML Select */
                            <View style={{ backgroundColor: '#f3f4f6', borderRadius: 12, borderWidth: 1, borderColor: '#e5e7eb' }}>
                                <select
                                    value={peopleCount}
                                    onChange={(e: any) => setPeopleCount(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: 16,
                                        fontSize: 18,
                                        fontWeight: 'bold',
                                        color: '#333',
                                        backgroundColor: 'transparent',
                                        border: 'none',
                                        outline: 'none',
                                        cursor: 'pointer',
                                        appearance: 'none',
                                        WebkitAppearance: 'none',
                                        backgroundImage: 'url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3e%3cpolyline points=\'6 9 12 15 18 9\'%3e%3c/polyline%3e%3c/svg%3e")',
                                        backgroundRepeat: 'no-repeat',
                                        backgroundPosition: 'right 12px center',
                                        backgroundSize: '20px',
                                        paddingRight: 40
                                    }}
                                >
                                    {NUMBER_OPTIONS.map((num) => (
                                        <option key={num} value={num}>{num} kişi</option>
                                    ))}
                                </select>
                            </View>
                        ) : (
                            /* Native: Tappable field + Modal Picker */
                            <>
                                <Pressable
                                    onPress={() => setShowPeopleCountPicker(true)}
                                    style={{
                                        flexDirection: 'row',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        backgroundColor: '#f3f4f6',
                                        borderRadius: 12,
                                        padding: 16,
                                        borderWidth: 1,
                                        borderColor: '#e5e7eb'
                                    }}
                                >
                                    <Text style={{ fontWeight: 'bold', fontSize: scaleFont(18), color: '#333' }} allowFontScaling={false}>
                                        {peopleCount} kişi
                                    </Text>
                                    <Text style={{ fontSize: scaleFont(14), color: '#6b7280' }} allowFontScaling={false}>Değiştir →</Text>
                                </Pressable>

                                {/* iOS Wheel Picker Modal */}
                                <Modal
                                    visible={showPeopleCountPicker}
                                    transparent
                                    animationType="slide"
                                >
                                    <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
                                        <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20 }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#e5e7eb' }}>
                                                <Pressable onPress={() => setShowPeopleCountPicker(false)}>
                                                    <Text style={{ fontSize: 17, color: '#6b7280' }}>Cancel</Text>
                                                </Pressable>
                                                <Text style={{ fontSize: 17, fontWeight: '600', color: '#333' }}>Kişi Sayısı</Text>
                                                <Pressable onPress={() => setShowPeopleCountPicker(false)}>
                                                    <Text style={{ fontSize: 17, color: '#ea2a33', fontWeight: '600' }}>Done</Text>
                                                </Pressable>
                                            </View>
                                            <Picker
                                                selectedValue={peopleCount}
                                                onValueChange={(value) => setPeopleCount(value)}
                                                style={{ height: 220 }}
                                            >
                                                {NUMBER_OPTIONS.map((num) => (
                                                    <Picker.Item key={num} label={num} value={num} />
                                                ))}
                                            </Picker>
                                        </View>
                                    </View>
                                </Modal>
                            </>
                        )}
                    </View>

                    {/* Sentiment */}
                    <View style={errors.reaction ? { padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : undefined}>
                        <Text className="font-medium text-[#333] mb-3" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                            Görüşme nasıl geçti? {errors.reaction && <Text style={{ color: '#ef4444' }}>*</Text>}
                        </Text>
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
                                        <Text style={{ fontSize: scaleFont(32), opacity: isSelected ? 1 : 0.4 }} allowFontScaling={false}>
                                            {r.value === 'Olumlu' ? '😊' : r.value === 'Nötr' ? '😐' : '😞'}
                                        </Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                    </View>

                    {/* Membership Invitation */}
                    <View style={errors.membershipStatus ? { padding: 12, borderRadius: 12, borderWidth: 2, borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.05)' } : undefined}>
                        <Text className="font-medium text-[#333] mb-3" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                            Üyelik Daveti Yapıldı Mı ? {errors.membershipStatus && <Text style={{ color: '#ef4444' }}>*</Text>}
                        </Text>
                        <View style={{ gap: 12 }}>
                            {MEMBERSHIP_OPTIONS.map((opt) => {
                                const isSelected = membershipCounts[opt.value] !== undefined;
                                const count = membershipCounts[opt.value] || '1';
                                return (
                                    <View key={opt.value} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                                        <Pressable
                                            onPress={() => {
                                                if (isSelected) {
                                                    const newCounts = { ...membershipCounts };
                                                    delete newCounts[opt.value];
                                                    setMembershipCounts(newCounts);
                                                } else {
                                                    setMembershipCounts({ ...membershipCounts, [opt.value]: '1' });
                                                }
                                            }}
                                            style={{
                                                flex: 1,
                                                flexDirection: 'row',
                                                alignItems: 'center',
                                                paddingHorizontal: 14,
                                                paddingVertical: 12,
                                                borderRadius: 12,
                                                borderWidth: 2,
                                                borderColor: isSelected ? '#ea2a33' : '#e5e7eb',
                                                backgroundColor: isSelected ? 'rgba(234, 42, 51, 0.05)' : '#ffffff',
                                                gap: 10,
                                            }}
                                        >
                                            <View style={{
                                                width: 24, height: 24, borderRadius: 6,
                                                borderWidth: 2, borderColor: isSelected ? '#ea2a33' : '#d1d5db',
                                                backgroundColor: isSelected ? '#ea2a33' : '#ffffff',
                                                alignItems: 'center', justifyContent: 'center'
                                            }}>
                                                {isSelected && <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 14 }}>✓</Text>}
                                            </View>
                                            <Text style={{ fontWeight: isSelected ? 'bold' : '500', color: isSelected ? '#ea2a33' : '#4b5563', fontSize: scaleFont(14) }} allowFontScaling={false}>
                                                {opt.label}
                                            </Text>
                                        </Pressable>
                                        {isSelected && (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f3f4f6', borderRadius: 10, paddingHorizontal: 4 }}>
                                                <Pressable
                                                    onPress={() => {
                                                        const currentNum = count === '100+' ? 100 : Number(count);
                                                        if (currentNum > 1) {
                                                            setMembershipCounts({ ...membershipCounts, [opt.value]: String(currentNum - 1) });
                                                        }
                                                    }}
                                                    style={{ padding: 8 }}
                                                >
                                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#6b7280' }}>−</Text>
                                                </Pressable>
                                                <Text style={{ minWidth: 40, textAlign: 'center', fontWeight: 'bold', fontSize: scaleFont(16), color: '#333' }} allowFontScaling={false}>
                                                    {count}
                                                </Text>
                                                <Pressable
                                                    onPress={() => {
                                                        const currentNum = count === '100+' ? 100 : Number(count);
                                                        if (currentNum < 100) {
                                                            setMembershipCounts({ ...membershipCounts, [opt.value]: String(currentNum + 1) });
                                                        } else {
                                                            setMembershipCounts({ ...membershipCounts, [opt.value]: '100+' });
                                                        }
                                                    }}
                                                    style={{ padding: 8 }}
                                                >
                                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#6b7280' }}>+</Text>
                                                </Pressable>
                                            </View>
                                        )}
                                    </View>
                                );
                            })}
                        </View>
                    </View>

                    {/* Notes */}
                    <View>
                        <Text className="font-medium text-[#333] mb-3" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>Varsa notlarınız</Text>
                        <TextInput
                            className="w-full bg-white border border-gray-200 rounded-xl p-4 min-h-[120px]"
                            style={{ fontSize: scaleFont(16) }}
                            allowFontScaling={false}
                            placeholder="Görüşme detaylarını buraya yazın..."
                            multiline
                            numberOfLines={6}
                            textAlignVertical="top"
                            value={notes}
                            onChangeText={setNotes}
                        />
                    </View>
                </ScrollView>

                {/* Footer Action */}
                <View
                    className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t border-gray-100 safe-bottom"
                    style={isDesktop ? { alignItems: 'center' } : undefined}
                >
                    <Pressable
                        onPress={submitReport}
                        disabled={loading}
                        style={{
                            width: '100%',
                            maxWidth: isDesktop ? 700 : undefined,
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
                            <Text className="text-white font-bold" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>Raporu Kaydet</Text>
                        )}
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
}
