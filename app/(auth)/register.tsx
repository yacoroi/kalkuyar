import { useRouter } from 'expo-router';
import { Check, ChevronDown, CreditCard, MapPin, Shield, User, X } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { DISTRICTS, getNeighborhoods } from '../../constants/locations';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

export default function RegisterScreen() {
    const router = useRouter();
    const session = useAuthStore(state => state.session);
    const profile = useAuthStore(state => state.profile);
    const { isDesktop } = useResponsiveLayout();

    const [fullName, setFullName] = useState('');
    const [tcKimlik, setTcKimlik] = useState('');
    const [city] = useState('İstanbul'); // Fixed City
    const [district, setDistrict] = useState('');
    const [neighborhood, setNeighborhood] = useState('');
    const [loading, setLoading] = useState(false);
    const [kvkkAccepted, setKvkkAccepted] = useState(false);
    const [showKvkkModal, setShowKvkkModal] = useState(false);

    // Pre-fill from existing profile (for returning users without TC)
    useEffect(() => {
        if (profile) {
            if (profile.full_name) setFullName(profile.full_name);
            if (profile.district) setDistrict(profile.district);
            if (profile.neighborhood) setNeighborhood(profile.neighborhood);
            if (profile.tc_kimlik) setTcKimlik(profile.tc_kimlik);
            // If user already has profile data, assume KVKK was accepted
            if (profile.full_name && profile.district) setKvkkAccepted(true);
        }
    }, [profile]);

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


    // TC Kimlik validasyonu (11 haneli rakam)
    const isValidTcKimlik = (tc: string) => /^\d{11}$/.test(tc);

    async function completeProfile() {
        if (!fullName || !tcKimlik || !city || !district || !neighborhood) {
            const message = 'Lütfen tüm alanları doldurunuz.';
            if (Platform.OS === 'web') {
                window.alert(message);
            } else {
                Alert.alert('Hata', message);
            }
            return;
        }

        if (!isValidTcKimlik(tcKimlik)) {
            const message = 'TC Kimlik numarası 11 haneli olmalıdır.';
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

        // TC Kimlik ile referans kodu lookup
        let referansKodu: string | null = null;
        try {
            const { data: tcData } = await supabase
                .from('tc_referans')
                .select('referans_kodu')
                .eq('tc_kimlik', tcKimlik)
                .limit(1);

            if (tcData && tcData.length > 0) {
                referansKodu = tcData[0].referans_kodu;
            }
        } catch (e) {
            // TC not found in lookup table, continue without referans
            console.log('TC lookup failed:', e);
        }

        const { error } = await supabase
            .from('profiles')
            .upsert({
                id: session.user.id,
                full_name: fullName,
                tc_kimlik: tcKimlik,
                referans_kodu: referansKodu,
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

                            {/* TC Kimlik */}
                            <View>
                                <Text className="text-[#555] font-semibold mb-2 ml-1 text-sm">TC Kimlik No</Text>
                                <View className={`flex-row items-center bg-[#faecec] rounded-xl border h-12 ${tcKimlik && !isValidTcKimlik(tcKimlik) ? 'border-red-500' : 'border-[#e0c0c0]'}`}>
                                    <TextInput
                                        className="flex-1 px-4 text-[#333] text-base h-full"
                                        placeholder="11 Haneli TC Kimlik No"
                                        placeholderTextColor="#999"
                                        value={tcKimlik}
                                        onChangeText={(text) => setTcKimlik(text.replace(/[^0-9]/g, '').slice(0, 11))}
                                        keyboardType="numeric"
                                        maxLength={11}
                                    />
                                    <View className="px-3">
                                        <CreditCard size={18} color={tcKimlik && !isValidTcKimlik(tcKimlik) ? '#ef4444' : '#d91f26'} />
                                    </View>
                                </View>
                                {tcKimlik && !isValidTcKimlik(tcKimlik) && (
                                    <Text className="text-red-500 text-xs mt-1 ml-1">TC Kimlik 11 haneli olmalıdır</Text>
                                )}
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
                                6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") uyarınca, Saadet Partisi İstanbul İl Başkanlığı olarak kişisel verilerinizin güvenliği ve gizliliği konusundaki yükümlülüklerimizi yerine getirmek amacıyla işbu Aydınlatma Metni'ni hazırlamış bulunmaktayız. Uygulamayı kullanmaya başlamadan önce bu metni dikkatle okumanızı rica ederiz.
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>1. Veri Sorumlusu</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında "Veri Sorumlusu" sıfatıyla hareket eden:{'\n\n'}
                                <Text style={{ fontWeight: 'bold' }}>Saadet Partisi İstanbul İl Başkanlığı</Text>{'\n'}
                                Adres: SAADET PLAZA, Maltepe, Mevlevihane Yolu Cd. No:13, 34010 Zeytinburnu/İstanbul{'\n'}
                                Telefon: (0212) 483 51 77
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>2. İşlenen Kişisel Veriler ve Kategorileri</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Tarafınızdan talep edilen ve/veya uygulama kullanımı sırasında otomatik olarak elde edilen kişisel verileriniz aşağıda kategorilendirilmiştir:{'\n\n'}
                                <Text style={{ fontWeight: 'bold' }}>Kimlik Verileri:</Text> Ad, soyad, T.C. kimlik numarası{'\n'}
                                <Text style={{ fontWeight: 'bold' }}>İletişim Verileri:</Text> Telefon numarası{'\n'}
                                <Text style={{ fontWeight: 'bold' }}>Lokasyon Verileri:</Text> İl, ilçe, mahalle bilgileri{'\n'}
                                <Text style={{ fontWeight: 'bold' }}>Performans ve Aktivite Verileri:</Text> Görev tamamlama bilgileri, saha çalışması raporları, uygulama içi etkileşimler
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>3. Kişisel Verilerin İşlenme Amaçları</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Toplanan kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:{'\n\n'}
                                • Parti üyelik süreçlerinin yürütülmesi ve takibi{'\n'}
                                • Saha çalışmaları ve vatandaş ziyaretlerinin koordinasyonu{'\n'}
                                • Görev dağıtımı, takibi ve performans değerlendirmesi{'\n'}
                                • Parti içi iletişim ve bilgilendirme faaliyetleri{'\n'}
                                • Etkinlik, toplantı ve miting organizasyonları{'\n'}
                                • İstatistiksel analizler ve raporlama{'\n'}
                                • Yasal düzenlemeler kapsamında zorunlu bildirimler{'\n'}
                                • Kullanıcı deneyiminin iyileştirilmesi{'\n'}
                                • Bilgi güvenliği süreçlerinin yürütülmesi
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>4. Kişisel Verilerin Toplanma Yöntemi ve Hukuki Sebebi</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Kişisel verileriniz, mobil uygulama üzerinden elektronik ortamda, tamamen veya kısmen otomatik yöntemlerle toplanmaktadır.{'\n\n'}
                                <Text style={{ fontWeight: 'bold' }}>Hukuki Sebepler:</Text>{'\n'}
                                • KVKK md. 5/1: Açık rızanız{'\n'}
                                • KVKK md. 5/2-c: Sözleşmenin ifası{'\n'}
                                • KVKK md. 5/2-ç: Hukuki yükümlülüğün yerine getirilmesi{'\n'}
                                • KVKK md. 5/2-f: Veri sorumlusunun meşru menfaati
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>5. Kişisel Verilerin Aktarılması</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Kişisel verileriniz, yukarıda belirtilen amaçlarla sınırlı olmak ve KVKK'nın 8. ve 9. maddelerinde belirtilen şartlara uygun olarak aşağıdaki taraflara aktarılabilecektir:{'\n\n'}
                                <Text style={{ fontWeight: 'bold' }}>Yurt İçi Aktarımlar:</Text>{'\n'}
                                • Saadet Partisi Genel Merkezi ve ilçe teşkilatları{'\n'}
                                • Yasal zorunluluk halinde yetkili kamu kurum ve kuruluşları{'\n'}
                                • Teknik altyapı hizmeti veren iş ortaklarımız{'\n\n'}
                                <Text style={{ fontWeight: 'bold' }}>Yurt Dışı Aktarımlar:</Text>{'\n'}
                                Kişisel verileriniz yurt dışına aktarılmamaktadır. Ancak bulut tabanlı hizmetler kullanılması halinde, KVKK'nın 9. maddesi kapsamında gerekli güvenceler sağlanacaktır.
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>6. Kişisel Verilerin Saklanma Süresi</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Kişisel verileriniz, işleme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri boyunca saklanacaktır:{'\n\n'}
                                • Üyelik verileri: Üyelik süresince ve sonrasında 10 yıl{'\n'}
                                • Saha çalışması raporları: 5 yıl{'\n'}
                                • İşlem güvenliği verileri: 2 yıl{'\n'}
                                • Konum verileri: 1 yıl{'\n\n'}
                                Saklama süresinin sona ermesi halinde verileriniz KVKK'nın 7. maddesi ve Kişisel Verilerin Silinmesi, Yok Edilmesi veya Anonim Hale Getirilmesi Hakkında Yönetmelik hükümlerine uygun olarak imha edilecektir.
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>7. Veri Güvenliği Tedbirleri</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Kişisel verilerinizin güvenliği için aşağıdaki teknik ve idari tedbirler alınmaktadır:{'\n\n'}
                                <Text style={{ fontWeight: 'bold' }}>Teknik Tedbirler:</Text>{'\n'}
                                • SSL/TLS şifreleme protokolleri{'\n'}
                                • Güvenli sunucu altyapısı{'\n'}
                                • Erişim loglarının tutulması{'\n'}
                                • Güvenlik duvarı ve saldırı tespit sistemleri{'\n\n'}
                                <Text style={{ fontWeight: 'bold' }}>İdari Tedbirler:</Text>{'\n'}
                                • Erişim yetki matrisi uygulaması{'\n'}
                                • Çalışan gizlilik taahhütnameleri{'\n'}
                                • Periyodik güvenlik denetimleri
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>8. İlgili Kişi Olarak Haklarınız</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                KVKK'nın 11. maddesi uyarınca aşağıdaki haklara sahipsiniz:{'\n\n'}
                                a) Kişisel verilerinizin işlenip işlenmediğini öğrenme,{'\n'}
                                b) Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,{'\n'}
                                c) Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,{'\n'}
                                d) Yurt içinde veya yurt dışında kişisel verilerinizin aktarıldığı üçüncü kişileri bilme,{'\n'}
                                e) Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,{'\n'}
                                f) KVKK'nın 7. maddesinde öngörülen şartlar çerçevesinde kişisel verilerinizin silinmesini veya yok edilmesini isteme,{'\n'}
                                g) (e) ve (f) bentleri uyarınca yapılan işlemlerin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,{'\n'}
                                h) İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme,{'\n'}
                                i) Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme.
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>9. Haklarınızı Kullanma Yöntemi</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                Yukarıda belirtilen haklarınızı kullanmak için kimliğinizi tespit edici belgeler ile birlikte ıslak imzalı dilekçenizi Saadet Partisi İstanbul İl Başkanlığı adresine bizzat veya noter aracılığıyla iletebilirsiniz.{'\n\n'}
                                Başvurularınız en geç 30 (otuz) gün içinde sonuçlandırılacaktır. İşlemin ayrıca bir maliyeti gerektirmesi hâlinde, Kişisel Verileri Koruma Kurulu tarafından belirlenen tarifedeki ücret alınabilir.
                            </Text>

                            <Text style={{ fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 8 }}>10. Aydınlatma Metninde Yapılacak Değişiklikler</Text>
                            <Text style={{ fontSize: 14, lineHeight: 22, color: '#444', marginBottom: 16 }}>
                                İşbu Aydınlatma Metni, yasal düzenlemeler ve kurumsal ihtiyaçlar doğrultusunda güncellenebilir. Güncellemeler, uygulama üzerinden veya resmi iletişim kanalları aracılığıyla tarafınıza bildirilecektir. Uygulamayı kullanmaya devam etmeniz, güncellenmiş metni kabul ettiğiniz anlamına gelecektir.
                            </Text>

                            <View style={{ backgroundColor: '#f0f0f0', padding: 12, borderRadius: 8, marginTop: 8 }}>
                                <Text style={{ fontSize: 12, color: '#666', textAlign: 'center', lineHeight: 18 }}>
                                    Bu Aydınlatma Metni'ni okuduğunuzu ve kişisel verilerinizin yukarıda belirtilen şekilde işlenmesini kabul ettiğinizi beyan etmektesiniz.
                                </Text>
                            </View>

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
