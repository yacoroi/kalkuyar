import { Stack } from 'expo-router';
import React from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PrivacyPolicyScreen() {
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f8fafc' }} edges={['bottom']}>
            <Stack.Screen options={{ title: 'Gizlilik Politikası', headerBackTitle: 'Geri' }} />
            <ScrollView contentContainerStyle={{ padding: 20 }}>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1f2937', marginBottom: 20 }}>
                    Gizlilik Politikası
                </Text>

                <Text style={{ fontSize: 12, color: '#6b7280', marginBottom: 20 }}>
                    Son Güncelleme: 29 Aralık 2024
                </Text>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                        1. Toplanan Veriler
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
                        KalkUyar uygulaması aşağıdaki verileri toplamaktadır:{'\n\n'}
                        • Ad Soyad{'\n'}
                        • Telefon Numarası{'\n'}
                        • TC Kimlik Numarası (isteğe bağlı){'\n'}
                        • Konum Bilgisi (İl, İlçe, Mahalle){'\n'}
                        • Profil Fotoğrafı (isteğe bağlı){'\n'}
                        • Uygulama Kullanım Verileri
                    </Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                        2. Verilerin Kullanımı
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
                        Toplanan veriler aşağıdaki amaçlarla kullanılmaktadır:{'\n\n'}
                        • Kullanıcı hesabı oluşturma ve yönetimi{'\n'}
                        • Saha çalışmalarının koordinasyonu{'\n'}
                        • İstatistik ve raporlama{'\n'}
                        • Bildirim gönderimi{'\n'}
                        • Uygulama deneyiminin iyileştirilmesi
                    </Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                        3. Verilerin Paylaşımı
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
                        Kişisel verileriniz üçüncü taraflarla paylaşılmamaktadır.
                        Veriler yalnızca uygulama hizmetlerinin sağlanması amacıyla
                        güvenli sunucularda saklanmaktadır.
                    </Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                        4. Veri Güvenliği
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
                        Verileriniz şifreli bağlantılar (SSL/TLS) üzerinden iletilmekte
                        ve güvenli sunucularda saklanmaktadır. Yetkisiz erişime karşı
                        gerekli teknik ve idari önlemler alınmıştır.
                    </Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                        5. Kullanıcı Hakları
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
                        KVKK kapsamında aşağıdaki haklara sahipsiniz:{'\n\n'}
                        • Verilerinize erişim talep etme{'\n'}
                        • Verilerin düzeltilmesini isteme{'\n'}
                        • Verilerin silinmesini talep etme{'\n'}
                        • Veri işlemeye itiraz etme
                    </Text>
                </View>

                <View style={{ marginBottom: 24 }}>
                    <Text style={{ fontSize: 18, fontWeight: '600', color: '#1f2937', marginBottom: 12 }}>
                        6. İletişim
                    </Text>
                    <Text style={{ fontSize: 14, color: '#374151', lineHeight: 22 }}>
                        Gizlilik politikası ile ilgili sorularınız için uygulama içindeki
                        "Bize Ulaşın" bölümünden iletişime geçebilirsiniz.
                    </Text>
                </View>

                <View style={{ marginBottom: 40, backgroundColor: '#f1f5f9', padding: 16, borderRadius: 12 }}>
                    <Text style={{ fontSize: 12, color: '#64748b', textAlign: 'center' }}>
                        Bu gizlilik politikası, uygulamanın kullanımı sırasında
                        toplanan verilerin nasıl işlendiğini açıklamaktadır.
                    </Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}
