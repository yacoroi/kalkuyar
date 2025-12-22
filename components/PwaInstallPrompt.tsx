import { Download } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { useScaleFont } from '../hooks/useScaleFont';

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showButton, setShowButton] = useState(false);
    const { scaleFont } = useScaleFont();

    useEffect(() => {
        if (Platform.OS !== 'web') return;

        const handler = (e: any) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault();
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e);
            // Update UI notify the user they can install the PWA
            setShowButton(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setShowButton(false);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;

        // Show the install prompt
        deferredPrompt.prompt();

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null);
        setShowButton(false);
    };

    if (!showButton) return null;

    return (
        <View className="absolute bottom-6 right-6 z-50 shadow-xl">
            <Pressable
                onPress={handleInstallClick}
                className="bg-[#ea2a33] flex-row items-center gap-3 px-6 py-4 rounded-xl border-2 border-white shadow-lg active:opacity-90 transition-opacity"
            >
                <Download size={24} color="white" />
                <Text className="text-white font-bold" style={{ fontSize: scaleFont(16) }}>
                    Uygulamayı Yükle
                </Text>
            </Pressable>
        </View>
    );
}
