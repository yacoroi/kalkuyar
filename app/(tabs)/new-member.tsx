import React from 'react';
import { ActivityIndicator, Platform, StatusBar, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Conditionally import WebView only for native
const WebView = Platform.OS !== 'web' ? require('react-native-webview').WebView : null;

export default function NewMemberScreen() {
    const membershipUrl = 'https://uyelik.saadet.org.tr/';

    // Web: Use iframe
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

    // Native: Use WebView
    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ea2a33' }} edges={['top']}>
            <StatusBar barStyle="light-content" backgroundColor="#ea2a33" />
            {WebView && (
                <WebView
                    source={{ uri: membershipUrl }}
                    style={{ flex: 1 }}
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
