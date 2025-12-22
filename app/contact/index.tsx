import { Stack, useRouter } from 'expo-router';
import { Mail, Send } from 'lucide-react-native';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

const showAlert = (title: string, message: string, onOk?: () => void) => {
    if (Platform.OS === 'web') {
        window.alert(`${title}\n\n${message}`);
        if (onOk) onOk();
    } else {
        Alert.alert(title, message, onOk ? [{ text: 'Tamam', onPress: onOk }] : undefined);
    }
};

export default function ContactScreen() {
    const router = useRouter();
    const { user } = useAuthStore();
    const { scaleFont } = useScaleFont();
    const { isDesktop } = useResponsiveLayout();

    const [subject, setSubject] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ subject?: boolean; message?: boolean }>({});

    async function sendMessage() {
        const newErrors: typeof errors = {};

        if (!subject.trim()) {
            newErrors.subject = true;
        }
        if (!message.trim()) {
            newErrors.message = true;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            showAlert('Hata', 'Lütfen konu ve mesaj alanlarını doldurunuz.');
            return;
        }

        setErrors({});
        setLoading(true);
        try {
            const { error } = await supabase
                .from('contact_messages')
                .insert({
                    user_id: user?.id,
                    subject: subject.trim(),
                    message: message.trim(),
                });

            if (error) throw error;

            showAlert('Başarılı ✅', 'Mesajınız başarıyla gönderildi. En kısa sürede size dönüş yapılacaktır.', () => router.back());
        } catch (error: any) {
            showAlert('Hata', 'Mesaj gönderilemedi: ' + error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View className="flex-1 bg-white">
            <Stack.Screen
                options={{
                    title: 'Bize Ulaşın',
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
                        paddingBottom: 100,
                        ...(isDesktop ? { maxWidth: 600, alignSelf: 'center', width: '100%' } : {})
                    }}
                >
                    <View className="items-center mb-8">
                        <View className="w-16 h-16 bg-red-50 rounded-full items-center justify-center mb-4">
                            <Mail size={32} color="#ea2a33" />
                        </View>
                        <Text className="font-bold text-center text-gray-900 mb-2" style={{ fontSize: scaleFont(20) }} allowFontScaling={false}>
                            İletişim Formu
                        </Text>
                        <Text className="text-gray-500 text-center leading-6" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>
                            Görüş, öneri ve şikayetlerinizi bizimle paylaşabilirsiniz.
                        </Text>
                    </View>

                    {/* Subject Input */}
                    <View className="mb-6">
                        <Text className="font-medium text-gray-700 mb-2" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                            Konu {errors.subject && <Text style={{ color: '#ef4444' }}>*</Text>}
                        </Text>
                        <TextInput
                            className="w-full bg-gray-50 rounded-xl px-4 h-12 text-gray-900"
                            style={[
                                { fontSize: scaleFont(16), borderWidth: 1, borderColor: errors.subject ? '#ef4444' : '#e5e7eb' },
                                errors.subject && { backgroundColor: 'rgba(239, 68, 68, 0.05)' }
                            ]}
                            allowFontScaling={false}
                            placeholder="Mesajınızın konusu nedir?"
                            value={subject}
                            onChangeText={(text) => {
                                setSubject(text);
                                if (errors.subject && text.trim()) {
                                    setErrors({ ...errors, subject: false });
                                }
                            }}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Message Input */}
                    <View className="mb-8">
                        <Text className="font-medium text-gray-700 mb-2" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                            Mesajınız {errors.message && <Text style={{ color: '#ef4444' }}>*</Text>}
                        </Text>
                        <TextInput
                            className="w-full bg-gray-50 rounded-xl p-4 text-gray-900 min-h-[160px]"
                            style={[
                                { fontSize: scaleFont(16), borderWidth: 1, borderColor: errors.message ? '#ef4444' : '#e5e7eb' },
                                errors.message && { backgroundColor: 'rgba(239, 68, 68, 0.05)' }
                            ]}
                            allowFontScaling={false}
                            placeholder="Buraya yazın..."
                            multiline
                            textAlignVertical="top"
                            value={message}
                            onChangeText={(text) => {
                                setMessage(text);
                                if (errors.message && text.trim()) {
                                    setErrors({ ...errors, message: false });
                                }
                            }}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Submit Button */}
                    <TouchableOpacity
                        onPress={sendMessage}
                        disabled={loading}
                        className={`w-full py-4 rounded-xl flex-row items-center justify-center gap-3 shadow-md shadow-red-200 ${loading ? 'bg-red-300' : 'bg-[#ea2a33]'}`}
                        activeOpacity={0.8}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <>
                                <Text className="text-white font-bold" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>
                                    Gönder
                                </Text>
                                <Send size={20} color="white" />
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    );
}
