import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';

export default function LoginScreen() {
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { scaleFont } = useScaleFont();
    const { isDesktop } = useResponsiveLayout();

    async function sendOtp() {
        if (phone.length < 10) {
            Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz.');
            return;
        }

        setLoading(true);
        // Clean phone number and add +90 if missing
        let formattedPhone = phone.replace(/\D/g, ''); // Remove non-digits
        if (formattedPhone.startsWith('90')) {
            formattedPhone = '+' + formattedPhone;
        } else if (formattedPhone.startsWith('0')) {
            formattedPhone = '+90' + formattedPhone.substring(1);
        } else {
            formattedPhone = '+90' + formattedPhone;
        }

        const { error } = await supabase.auth.signInWithOtp({
            phone: formattedPhone,
        });

        setLoading(false);

        if (error) {
            Alert.alert('Hata', error.message);
        } else {
            // Navigate to Verify screen pass phone as param
            router.push(`/verify?phone=${encodeURIComponent(formattedPhone)}`);
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#d91f26]"
        >
            {/* MAIN CONTENT CENTERED */}
            <View className="flex-1 justify-center px-4" style={isDesktop ? { alignItems: 'center' } : undefined}>

                {/* CARD */}
                <View
                    className="bg-[#fcdcdc] rounded-3xl p-6 shadow-xl items-center"
                    style={isDesktop ? { maxWidth: 420, width: '100%' } : undefined}
                >

                    {/* LOGO */}
                    <View className="items-center justify-center mb-6 w-full">
                        <Image
                            source={require('../../assets/images/saadet-logo.png')}
                            style={{ width: 200, height: 50 }}
                            resizeMode="contain"
                        />
                    </View>

                    <Text className="font-bold text-[#333333] mb-8" style={{ fontSize: scaleFont(24) }} allowFontScaling={false}>KalkUyar</Text>

                    {/* PHONE INPUT */}
                    <View className="w-full mb-6">
                        <Text className="text-[#555] font-semibold mb-2 ml-1" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>Telefon Numarası</Text>
                        <View className="w-full h-14 bg-[#faecec] rounded-xl border border-[#e0c0c0] flex-row items-center px-4 focus:border-[#d91f26]">
                            <Text className="text-[#333] font-bold mr-2" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>+90</Text>
                            <View className="h-6 w-[1px] bg-[#ccc] mr-3" />
                            <TextInput
                                className="flex-1 text-[#333] font-medium h-full"
                                style={{ fontSize: scaleFont(18) }}
                                allowFontScaling={false}
                                placeholder="5xx xxx xx xx"
                                placeholderTextColor="#999"
                                value={phone}
                                onChangeText={setPhone}
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        </View>
                    </View>

                    {/* BUTTON */}
                    <TouchableOpacity
                        className="w-full h-14 bg-[#a61a1f] rounded-xl items-center justify-center shadow-lg active:scale-95 transition-all"
                        onPress={sendOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>Giriş Yap</Text>
                        )}
                    </TouchableOpacity>

                </View>

            </View>
        </KeyboardAvoidingView>
    );
}
