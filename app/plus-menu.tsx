import { useRouter } from 'expo-router';
import { FileText, UserPlus } from 'lucide-react-native';
import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUiStore } from '../stores/useUiStore';

export default function PlusMenuModal() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    // Animations for the buttons
    // 1 = New Report (Bottom), 2 = New Member (Top)
    // We animate bottom-up
    const slideAnim1 = useRef(new Animated.Value(50)).current;
    const fadeAnim1 = useRef(new Animated.Value(0)).current;

    const slideAnim2 = useRef(new Animated.Value(50)).current;
    const fadeAnim2 = useRef(new Animated.Value(0)).current;

    const { setPlusMenuOpen } = useUiStore();

    useEffect(() => {
        setPlusMenuOpen(true);

        Animated.parallel([
            // Animate Bottom Button (Report) first
            Animated.timing(slideAnim1, { toValue: 0, duration: 300, useNativeDriver: true }),
            Animated.timing(fadeAnim1, { toValue: 1, duration: 300, useNativeDriver: true }),

            // Animate Top Button (Member) with delay
            Animated.sequence([
                Animated.delay(100),
                Animated.parallel([
                    Animated.timing(slideAnim2, { toValue: 0, duration: 300, useNativeDriver: true }),
                    Animated.timing(fadeAnim2, { toValue: 1, duration: 300, useNativeDriver: true })
                ])
            ])
        ]).start();

        return () => setPlusMenuOpen(false);
    }, []);

    return (
        <View className="flex-1 justify-end items-center" style={{ paddingBottom: (insets.bottom > 0 ? insets.bottom : 10) + 100 }}>
            {/* Backdrop Link to close */}
            <Pressable
                className="absolute inset-0"
                onPress={() => router.back()}
            />

            {/* Floating Menu Items */}
            <View className="items-center gap-4">
                {/* New Member (Top) */}
                <Animated.View style={{ transform: [{ translateY: slideAnim2 }], opacity: fadeAnim2 }}>
                    <Pressable
                        onPress={() => {
                            router.back();
                            setTimeout(() => router.push('/(tabs)/new-member'), 50);
                        }}
                        className="flex-row items-center bg-white pl-4 pr-3 py-3 rounded-full shadow-lg border border-blue-100"
                        style={{ elevation: 5 }}
                    >
                        <Text className="font-bold text-gray-700 mr-3">Yeni Üye</Text>
                        <View className="w-10 h-10 bg-blue-100 rounded-full items-center justify-center">
                            <UserPlus size={20} color="#2563eb" />
                        </View>
                    </Pressable>
                </Animated.View>

                {/* New Report (Bottom) */}
                <Animated.View style={{ transform: [{ translateY: slideAnim1 }], opacity: fadeAnim1 }}>
                    <Pressable
                        onPress={() => {
                            router.back();
                            setTimeout(() => router.push('/report/create'), 50);
                        }}
                        className="flex-row items-center bg-white pl-4 pr-3 py-3 rounded-full shadow-lg border border-red-100"
                        style={{ elevation: 5 }}
                    >
                        <Text className="font-bold text-gray-700 mr-3">Yeni Rapor</Text>
                        <View className="w-10 h-10 bg-red-100 rounded-full items-center justify-center">
                            <FileText size={20} color="#dc2626" />
                        </View>
                    </Pressable>
                </Animated.View>
            </View>
        </View>
    );
}
