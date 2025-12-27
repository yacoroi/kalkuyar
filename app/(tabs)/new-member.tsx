import React, { useState } from 'react';
import { ActivityIndicator, Alert, Platform, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '../../lib/supabase';
import { useAuthStore } from '../../stores/useAuthStore';

// Conditionally import WebView only for native
const WebView = Platform.OS !== 'web' ? require('react-native-webview').WebView : null;

// JavaScript to inject for detecting success messages
const INJECTED_JS = `
(function() {
    // Keywords for successful NEW member registration
    const successKeywords = [
        'başarılı', 'başarıyla', 'tamamlandı', 'kaydedildi', 'kayıt oluşturuldu',
        'teşekkür', 'teşekkürler', 'hoş geldiniz', 'hoşgeldiniz',
        'üyelik alındı', 'kayıt alındı', 'başvuru alındı', 'başvurunuz alındı',
        'üyeliğiniz oluşturuldu', 'successful', 'completed', 'registered'
    ];
    
    // Keywords for already existing member
    const alreadyMemberKeywords = [
        'zaten üye', 'zaten kayıtlı', 'mevcut üye', 'kayıtlı üye',
        'daha önce', 'already registered', 'already member', 'already exists'
    ];
    
    let detected = false;
    
    function checkForSuccess() {
        if (detected) return;
        
        const pageText = document.body.innerText.toLowerCase();
        
        // First check if already member
        for (const keyword of alreadyMemberKeywords) {
            if (pageText.includes(keyword.toLowerCase())) {
                detected = true;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'ALREADY_MEMBER',
                    keyword: keyword
                }));
                return;
            }
        }
        
        // Then check for new success
        for (const keyword of successKeywords) {
            if (pageText.includes(keyword.toLowerCase())) {
                detected = true;
                window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'NEW_MEMBER_SUCCESS',
                    keyword: keyword
                }));
                return;
            }
        }
    }
    
    // Check on DOM changes
    const observer = new MutationObserver(function() {
        checkForSuccess();
    });
    
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    
    // Check every 2 seconds as backup
    setInterval(checkForSuccess, 2000);
})();
true;
`;

export default function NewMemberScreen() {
    const profile = useAuthStore(state => state.profile);
    const fetchProfile = useAuthStore(state => state.fetchProfile);
    const [processed, setProcessed] = useState(false);

    // Kişiselleştirilmiş üyelik URL'i
    const membershipUrl = profile?.referans_kodu
        ? `https://uyelik.saadet.org.tr?ref=${profile.referans_kodu}`
        : 'https://uyelik.saadet.org.tr';

    const handleWebViewMessage = async (event: any) => {
        if (processed) return;

        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === 'NEW_MEMBER_SUCCESS') {
                setProcessed(true);

                // Award 15 points and record registration
                if (profile?.id) {
                    // Update points
                    const { error: pointsError } = await supabase
                        .from('profiles')
                        .update({ points: (profile.points || 0) + 15 })
                        .eq('id', profile.id);

                    // Record member registration
                    await supabase
                        .from('member_registrations')
                        .insert({ user_id: profile.id });

                    if (!pointsError) {
                        fetchProfile();
                        Alert.alert(
                            '🎉 Harika!',
                            'Yeni bir üye kazandırdınız! Saadet ailesine katkınız için teşekkür ederiz. +15 puan hesabınıza eklendi.',
                            [{ text: 'Devam' }]
                        );
                    }
                }
            } else if (data.type === 'ALREADY_MEMBER') {
                setProcessed(true);
                Alert.alert(
                    'Bilgi',
                    'Bu kişi zaten Saadet Partisi üyesi. Yeni üye kaydetmek için farklı bir kişinin bilgilerini giriniz.',
                    [{ text: 'Tamam' }]
                );
            }
        } catch (e) {
            // Ignore parse errors
        }
    };

    // Web: Use iframe (no JS injection possible)
    if (Platform.OS === 'web') {
        return (
            <View style={{ flex: 1, backgroundColor: '#ea2a33' }}>
                <StatusBar barStyle="light-content" backgroundColor="#ea2a33" />
                <iframe
                    src={membershipUrl}
                    style={{
                        flex: 1,
                        width: '100%',
                        height: '100%',
                        border: 'none',
                    }}
                    title="Saadet Üyelik"
                />
            </View>
        );
    }

    // Native: Use WebView with JS injection
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ea2a33' }} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#ea2a33" />
            {WebView && (
                <WebView
                    source={{ uri: membershipUrl }}
                    style={{ flex: 1 }}
                    injectedJavaScript={INJECTED_JS}
                    onMessage={handleWebViewMessage}
                    javaScriptEnabled={true}
                    startInLoadingState={true}
                    renderLoading={() => (
                        <View style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ea2a33' }}>
                            <ActivityIndicator size="large" color="white" />
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    );
}
