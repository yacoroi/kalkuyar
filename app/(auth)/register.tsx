import { useRouter } from 'expo-router';
import { Check, ChevronDown, MapPin, Shield, User, X } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DISTRICTS, getNeighborhoods } from '../../constants/locations';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

export default function RegisterScreen() {
    const router = useRouter();
    const session = useAuthStore(state => state.session);
    const { isDesktop } = useResponsiveLayout();

    const [fullName, setFullName] = useState('');
    const [city] = useState('İstanbul'); // Fixed City
    const [district, setDistrict] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [loading, setLoading] = useState(false);
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [showKvkkModal, setShowKvkkModal] = useState(false);

    // Modal State
    const [modalVisible, setModalVisible] = useState(false);
    const [modalType, setModalType] = useState<'district' | 'neighborhood' | null>(null);
    const [modalData, setModalData] = useState<string[]>([]);

    const openDistrictModal = () => {
        setModalData(DISTRICTS['İstanbul']);
        setModalType('district');
        setModalVisible(true);
    };

    const openNeighborhoodModal = () => {
        if (!district) {
            Alert.alert('Uyarı', 'Lütfen önce ilçe seçiniz.');
            return;
        }
        setModalData(getNeighborhoods(district));
        setModalType('neighborhood');
        setModalVisible(true);
    };

    const handleSelect = (item: string) => {
        if (modalType === 'district') {
            setDistrict(item);
            setNeighborhood(''); // Reset neighborhood when district changes
        } else if (modalType === 'neighborhood') {
            setNeighborhood(item);
        }
        setModalVisible(false);
    };


    async function completeProfile() {
        if (!fullName || !city || !district || !neighborhood) {
            const message = 'Lütfen İsim, İl, İlçe ve Mahalle bilgilerini doldurunuz.';
            if (Platform.OS === 'web') {
                window.alert(message);
            } else {
                Alert.alert('Hata', message);
            }
            return;
        }

        if (!kvkkAccepted) {
            const message = 'Devam etmek için KVKK Aydınlatma Metnini okumalı ve onaylamalısınız.';
            if (Platform.OS === 'web') {
                window.alert(message);
            } else {
                Alert.alert('Hata', message);
            }
            return;
        }

        if (!session?.user?.id) {
            Alert.alert('Hata', 'Oturum bulunamadı. Lütfen tekrar giriş yapın.');
            router.replace('/login');
            return;
        }

        setLoading(true);

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: session.user.id,
                full_name: fullName,
                city,
                district,
                neighborhood,
                role: 'member',
                points: 0
            });

        if (error) {
            Alert.alert('Hata', error.message);
            setLoading(false);
        } else {
            router.replace('/(auth)/topics');
        }
    }

    return (
        <View className="flex-1 bg-[#d91f26]">
            {/* MAIN CONTENT CENTERED */}
            <View className="flex-1 justify-center px-4" style={isDesktop ? { alignItems: 'center' } : undefined}>

                <View
                    className="bg-[#fcdcdc] rounded-3xl p-6 shadow-xl w-full max-h-[90%]"
                    style={isDesktop ? { maxWidth: 480 } : undefined}
                >

                    {/* ICON - Instead of logo, maybe a User icon */}
                    <View className="self-center w-16 h-16 bg-[#d91f26] rounded-full items-center justify-center mb-6 shadow-sm border-2 border-white/20">
                        <User size={32} color="white" />
                    </View>

                    <Text className="text-2xl font-bold text-[#333333] mb-2 text-center">Profilini Tamamla</Text>
                    <Text className="text-[#666] text-center mb-6 text-sm">
                        Saha çalışmalarına katılmak için bilgilerinizi giriniz.
                    </Text>

                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                        <View className="gap-4">
                            {/* Full Name */}
                            <View>
                                <Text className="text-[#555] font-semibold mb-2 ml-1 text-sm">Ad Soyad</Text>
                                <View className="flex-row items-center bg-[#faecec] rounded-xl border border-[#e0c0c0] h-12 focus:border-[#d91f26]">
                                    <TextInput
                                        className="flex-1 px-4 text-[#333] text-base h-full"
                                        placeholder="Adınız Soyadınız"
                                        placeholderTextColor="#999"
                                        value={fullName}
                                        onChangeText={setFullName}
                                    />
                                    <View className="px-3">
                                        <User size={18} color="#d91f26" />
                                    </View>
                                </View>
                            </View>

                            {/* City (Read Only) */}
                            <View>
                                <Text className="text-[#555] font-semibold mb-2 ml-1 text-sm">İl</Text>
                                <View className="flex-row items-center bg-[#faecec] rounded-xl border border-[#e0c0c0] h-12 opacity-80">
                                    <TextInput
                                        className="flex-1 px-4 text-[#333] text-base h-full font-bold"
                                        value={city}
                                        editable={false}
                                    />
                                    <View className="px-3">
                                        <MapPin size={18} color="#d91f26" />
                                    </View>
                                </View>
                            </View>

                            {/* District */}
                            <View>
                                <Text className="text-[#555] font-semibold mb-2 ml-1 text-sm">İlçe</Text>
                                <TouchableOpacity
                                    onPress={openDistrictModal}
                                    className="flex-row items-center bg-[#faecec] rounded-xl border border-[#e0c0c0] h-12 active:border-[#d91f26]"
                                >
                                    <Text className={`flex-1 px-4 text-base ${district ? 'text-[#333]' : 'text-[#999]'}`}>
                                        {district || 'İlçe Seçiniz'}
                                    </Text>
                                    <View className="px-3">
                                        <ChevronDown size={18} color="#d91f26" />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            {/* Neighborhood */}
                            <View>
                                <View className="flex-row justify-between items-center mb-2 ml-1">
                                    <Text className="text-[#555] font-semibold text-sm">Mahalle</Text>
                                </View>
                                <TouchableOpacity
                                    onPress={openNeighborhoodModal}
                                    className={`flex-row items-center bg-[#faecec] rounded-xl border border-[#e0c0c0] h-12 active:border-[#d91f26] ${!district ? 'opacity-50' : ''}`}
                                    disabled={!district}
                                >
                                    <Text className={`flex-1 px-4 text-base ${neighborhood ? 'text-[#333]' : 'text-[#999]'}`}>
                                        {neighborhood || 'Mahalle Seçiniz'}
                                    </Text>
                                    <View className="px-3">
                                        <ChevronDown size={18} color="#d91f26" />
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>

                    {/* KVKK Consent */}
                    <TouchableOpacity
                        onPress={() => setShowKvkkModal(true)}
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingVertical: 12,
                            paddingHorizontal: 4,
                            marginTop: 8,
                            gap: 12
                        }}
                    >
                        <View style={{
                            width: 24,
                            height: 24,
                            borderRadius: 6,
                            borderWidth: 2,
                            borderColor: kvkkAccepted ? '#16a34a' : '#d91f26',
                            backgroundColor: kvkkAccepted ? '#16a34a' : 'transparent',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            {kvkkAccepted && <Check size={14} color="white" strokeWidth={3} />}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: '#555', fontSize: 13 }}>
                                <Text style={{ color: '#d91f26', fontWeight: 'bold', textDecorationLine: 'underline' }}>
                                    KVKK Aydınlatma Metni
                                </Text>
                                {'\n'}
                                <Text style={{ fontSize: 12, color: '#777' }}>
                                    'ni okudum ve onaylıyorum.
                                </Text>
                            </Text>
                        </View>
                        <Shield size={20} color={kvkkAccepted ? '#16a34a' : '#d91f26'} />
                    </TouchableOpacity>

                    {/* Actions */}
                    <View className="pt-4 border-t border-[#e0c0c0]/50 mt-2">
                        <TouchableOpacity
                            className={`w-full h-14 rounded-xl items-center justify-center shadow-lg active:scale-95 transition-all flex-row gap-2 ${kvkkAccepted ? 'bg-[#a61a1f]' : 'bg-gray-400'}`}
                            onPress={completeProfile}
                            disabled={loading || !kvkkAccepted}
                        >
                            {loading ? (
                                <ActivityIndicator color="white" />
                            ) : (
                                <>
                                    <Check size={20} color="white" strokeWidth={3} />
                                    <Text className="text-white font-bold text-lg">Kaydı Tamamla</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>

                </View>
            </View>

            {/* LOCATION SELECTOR MODAL */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View className="flex-1 justify-end bg-black/50">
                    <View className="bg-white rounded-t-3xl h-[70%] w-full flex flex-col">
                        <View className="flex-row justify-between items-center p-6 border-b border-gray-100">
                            <Text className="text-xl font-bold text-gray-900">
                                {modalType === 'district' ? 'İlçe Seçimi' : 'Mahalle Seçimi'}
                            </Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)} className="p-2 bg-gray-100 rounded-full">
                                <X size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView className="flex-1" contentContainerStyle={{ padding: 24 }}>
                            {modalData.map((item, index) => (
                                <TouchableOpacity
                                    key={index}
                                    className="py-4 border-b border-gray-50 flex-row items-center justify-between"
                                    onPress={() => handleSelect(item)}
                                >
                                    <Text className={`text-lg ${(modalType === 'district' && district === item) || (modalType === 'neighborhood' && neighborhood === item) ? 'font-bold text-[#d91f26]' : 'text-gray-700'}`}>
                                        {item}
                                    </Text>
                                    {((modalType === 'district' && district === item) || (modalType === 'neighborhood' && neighborhood === item)) && (
                                        <Check size={20} color="#d91f26" />
                                    )}
                                </TouchableOpacity>
                            ))}
                            <View className="h-12" />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* KVKK MODAL */}
            <Modal
                visible={showKvkkModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowKvkkModal(false)}
            >
                <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%' }}>
                        {/* Header */}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                                <Shield size={24} color="#d91f26" />
                                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#333' }}>KVKK Aydınlatma Metni</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowKvkkModal(false)} style={{ padding: 8, backgroundColor: '#f3f4f6', borderRadius: 20 }}>
                                <X size={20} color="#666" />
                            </TouchableOpacity>
                        </View>

                        {/* Content */}
                        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında hazırlanmıştır.
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>1. Veri Sorumlusu</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Kişisel verileriniz, veri sorumlusu sıfatıyla Saadet Partisi tarafından işlenmektedir.
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>2. İşlenen Kişisel Veriler</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                • Ad-Soyad{'\n'}
                                • İl, İlçe, Mahalle bilgileri{'\n'}
                                • Konum bilgileri{'\n'}
                                • Uygulama kullanım verileri
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>3. İşleme Amaçları</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Kişisel verileriniz, saha çalışmalarının koordinasyonu, görev dağıtımı ve iletişim amaçlarıyla işlenmektedir.
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>4. Haklarınız</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                KVKK'nın 11. maddesi kapsamında; kişisel verilerinize erişim, düzeltme, silme ve itiraz haklarına sahipsiniz.
                            </Text>

                            <Text style={{ fontSize: 12, color: '#888', marginTop: 16, fontStyle: 'italic' }}>
                                Bu metin daha sonra güncellenecektir. Lütfen güncel metni parti web sitesinden kontrol ediniz.
                            </Text>

                            <View style={{ height: 40 }} />
                        </ScrollView>

                        {/* Footer */}
                        <View style={{ padding: 20, borderTopWidth: 1, borderTopColor: '#eee' }}>
                            <TouchableOpacity
                                onPress={() => {
                                    setKvkkAccepted(true);
                                    setShowKvkkModal(false);
                                }}
                                style={{
                                    backgroundColor: '#16a34a',
                                    paddingVertical: 16,
                                    borderRadius: 12,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: 8
                                }}
                            >
                                <Check size={20} color="white" strokeWidth={3} />
                                <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Okudum, Onaylıyorum</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
