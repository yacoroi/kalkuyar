import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useScaleFont } from '../../hooks/useScaleFont';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

const OTP_COOLDOWN_SECONDS = 180; // 3 minutes

export default function VerifyScreen() {
    const { phone } = useLocalSearchParams();
    const router = useRouter();
    const setSession = useAuthStore(state => state.setSession);
    const { scaleFont } = useScaleFont();
    const { isDesktop } = useResponsiveLayout();

    // OTP State 
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [remainingTime, setRemainingTime] = useState(OTP_COOLDOWN_SECONDS);

    // Animation Value
    const offset = useSharedValue(0);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ translateX: offset.value }],
        };
    });

    const triggerShake = () => {
        offset.value = withSequence(
            withTiming(-10, { duration: 50 }),
            withRepeat(withTiming(10, { duration: 100 }), 5, true),
            withTiming(0, { duration: 50 })
        );
    };

    // Fetch sent_at from otp_requests and calculate remaining time
    useEffect(() => {
        async function fetchOtpTime() {
            if (!phone) return;

            const { data } = await supabase
                .from('otp_requests')
                .select('sent_at')
                .eq('phone', phone as string)
                .single();

            if (data?.sent_at) {
                const sentAt = new Date(data.sent_at).getTime();
                const now = Date.now();
                const elapsedSeconds = Math.floor((now - sentAt) / 1000);
                const remaining = Math.max(0, OTP_COOLDOWN_SECONDS - elapsedSeconds);
                setRemainingTime(remaining);
            }
        }

        fetchOtpTime();
    }, [phone]);

    // Countdown timer
    useEffect(() => {
        if (remainingTime <= 0) return;

        const interval = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [remainingTime]);

    // Format remaining time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    async function resendOtp() {
        if (remainingTime > 0) {
            Alert.alert('Bekleyin', `Yeni kod almak için ${formatTime(remainingTime)} bekleyin.`);
            return;
        }

        setResending(true);

        const { error } = await supabase.auth.signInWithOtp({
            phone: phone as string,
        });

        if (!error) {
            // Update sent_at in otp_requests
            await supabase
                .from('otp_requests')
                .upsert(
                    { phone: phone as string, sent_at: new Date().toISOString() },
                    { onConflict: 'phone' }
                );

            setRemainingTime(OTP_COOLDOWN_SECONDS);
            Alert.alert('Başarılı', 'Yeni doğrulama kodu gönderildi.');
        } else {
            Alert.alert('Hata', 'Kod gönderilemedi. Lütfen tekrar deneyin.');
        }

        setResending(false);
    }

    async function verifyOtp() {
        setErrorMsg(''); // Reset error
        if (otp.length !== 6) {
            triggerShake();
            setErrorMsg('Lütfen 6 haneli doğrulama kodunu giriniz.');
            return;
        }

        setLoading(true);

        const { data, error } = await supabase.auth.verifyOtp({
            phone: phone as string,
            token: otp,
            type: 'sms'
        });

        if (error) {
            triggerShake();
            setErrorMsg('Doğrulama kodu hatalı veya süresi dolmuş.');
            setLoading(false);
            return;
        }

        if (data.session) {
            setSession(data.session);

            // Check if profile exists
            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('id', data.session.user.id)
                .single();

            if (profile) {
                // User exists, go to Home
                router.replace('/(tabs)');
            } else {
                // New user, go to Onboarding
                router.replace('/register');
            }
        }
        setLoading(false);
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-[#d91f26]"
        >
            {/* HEADER / BACK BUTTON */}
            <SafeAreaView className="absolute top-4 left-4 z-10 w-full">
                <TouchableOpacity
                    onPress={() => router.back()}
                    className="w-10 h-10 items-center justify-center rounded-full bg-white/20"
                >
                    <ArrowLeft size={24} color="white" />
                </TouchableOpacity>
            </SafeAreaView>

            {/* MAIN CONTENT CENTERED */}
            <View className="flex-1 justify-center px-4" style={isDesktop ? { alignItems: 'center' } : undefined}>

                {/* CARD */}
                <View
                    className="bg-[#fcdcdc] rounded-3xl p-6 shadow-xl items-center"
                    style={isDesktop ? { maxWidth: 420, width: '100%' } : undefined}
                >

                    {/* ICON */}
                    <View className="w-16 h-16 bg-[#d91f26] rounded-full items-center justify-center mb-6 shadow-sm border-2 border-white/20">
                        <Text style={{ fontSize: scaleFont(30) }} allowFontScaling={false}>🔒</Text>
                    </View>

                    <Text className="font-bold text-[#333333] mb-2" style={{ fontSize: scaleFont(24) }} allowFontScaling={false}>Doğrulama</Text>
                    <Text className="text-[#666] text-center mb-4 px-4 leading-5" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>
                        <Text className="font-bold text-[#d91f26]" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>{phone}</Text> numarasına gönderilen 6 haneli kodu giriniz.
                    </Text>

                    {/* COUNTDOWN TIMER */}
                    <View className="mb-6 items-center">
                        {remainingTime > 0 ? (
                            <View className="bg-[#a61a1f]/10 px-4 py-2 rounded-full">
                                <Text className="text-[#a61a1f] font-bold" style={{ fontSize: scaleFont(16) }} allowFontScaling={false}>
                                    Kod geçerlilik: {formatTime(remainingTime)}
                                </Text>
                            </View>
                        ) : (
                            <View className="bg-red-100 px-4 py-2 rounded-full">
                                <Text className="text-red-600 font-bold" style={{ fontSize: scaleFont(14) }} allowFontScaling={false}>
                                    Kodun süresi doldu
                                </Text>
                            </View>
                        )}
                    </View>

                    {/* OTP INPUT */}
                    <View className="w-full mb-8">
                        <Animated.View
                            style={[animatedStyle]}
                            className={`w-full h-16 bg-[#faecec] rounded-xl border flex-row items-center justify-center px-4 transition-colors ${errorMsg ? 'border-red-500 bg-red-50' : 'border-[#e0c0c0] focus:border-[#d91f26]'}`}
                        >
                            <TextInput
                                className="flex-1 text-[#333] font-bold h-full text-center tracking-[8px]"
                                style={{ fontSize: scaleFont(24) }}
                                allowFontScaling={false}
                                placeholder="000000"
                                placeholderTextColor="#ccc"
                                value={otp}
                                onChangeText={(text) => {
                                    setOtp(text);
                                    if (errorMsg) setErrorMsg(''); // Clear error on typing
                                }}
                                keyboardType="number-pad"
                                maxLength={6}
                                autoFocus
                                textContentType="oneTimeCode"
                                autoComplete="sms-otp"
                            />
                        </Animated.View>
                        {/* INLINE ERROR MESSAGE */}
                        {errorMsg ? (
                            <Text className="text-red-500 font-bold mt-2 text-center animate-pulse" style={{ fontSize: scaleFont(12) }} allowFontScaling={false}>
                                {errorMsg}
                            </Text>
                        ) : null}
                    </View>

                    {/* BUTTON */}
                    <TouchableOpacity
                        className="w-full h-14 bg-[#a61a1f] rounded-xl items-center justify-center shadow-lg active:scale-95 transition-all"
                        onPress={verifyOtp}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white font-bold" style={{ fontSize: scaleFont(18) }} allowFontScaling={false}>Doğrula ve Giriş Yap</Text>
                        )}
                    </TouchableOpacity>

                    {/* RESEND LINK */}
                    <TouchableOpacity
                        onPress={resendOtp}
                        disabled={remainingTime > 0 || resending}
                        className="mt-5"
                    >
                        {resending ? (
                            <ActivityIndicator size="small" color="#a61a1f" />
                        ) : (
                            <Text
                                className={`font-medium ${remainingTime > 0 ? 'text-gray-400' : 'text-[#a61a1f]'}`}
                                style={{ fontSize: scaleFont(14) }}
                                allowFontScaling={false}
                            >
                                {remainingTime > 0
                                    ? `Kodu Tekrar Gönder (${formatTime(remainingTime)})`
                                    : 'Kodu Tekrar Gönder'}
                            </Text>
                        )}
                    </TouchableOpacity>

                </View>

            </View>
        </KeyboardAvoidingView>
    );
}
