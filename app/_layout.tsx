import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';
import PwaInstallPrompt from '../components/PwaInstallPrompt';
import '../global.css'; // Import NativeWind global styles
import { supabase } from '../lib/supabase';
import {
  registerForPushNotificationsAsync,
  savePushToken,
  setupAndroidChannel,
  setupNotificationListeners,
  updateLastActive
} from '../services/notifications';
import { useAuthStore } from '../stores/useAuthStore';

import { useColorScheme } from '@/components/useColorScheme';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary
} from 'expo-router';

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="plus-menu"
            options={{
              presentation: 'transparentModal',
              headerShown: false,
              animation: 'fade',
            }}
          />
        </Stack>
        <PwaInstallPrompt />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  const { session, setSession, loading: authLoading, profile, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session initialization error:', error.message);
        setSession(null);
      } else {
        setSession(session);
      }
    }).catch((err) => {
      console.error('Unexpected session error:', err);
      setSession(null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Setup push notifications
  useEffect(() => {
    if (Platform.OS === 'web') return; // Skip on web

    // Setup Android notification channel
    setupAndroidChannel();

    // Setup notification listeners
    const cleanup = setupNotificationListeners(
      (notification) => {
        console.log('Received notification:', notification.request.content.title);
      },
      (response) => {
        // Handle notification tap - can navigate to specific screen based on data
        const data = response.notification.request.content.data;
        if (data?.screen) {
          router.push(data.screen as any);
        }
      }
    );

    return cleanup;
  }, []);

  // Register push token when user is authenticated
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!user?.id || !profile) return;

    async function setupPushToken() {
      const token = await registerForPushNotificationsAsync();
      if (token && user?.id) {
        await savePushToken(user.id, token);
      }
    }

    setupPushToken();
  }, [user?.id, profile]);

  // Update last_active_at periodically
  useEffect(() => {
    if (Platform.OS === 'web') return;
    if (!user?.id) return;

    // Update on app start
    updateLastActive(user.id);

    // Update every 5 minutes while app is open
    const interval = setInterval(() => {
      updateLastActive(user.id);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user?.id]);

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    if (authLoading || !loaded) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!session && !inAuthGroup) {
      // No session, redirect to login
      router.replace('/(auth)/login');
    } else if (session) {
      // We have a session
      if (profile && !profile.tc_kimlik) {
        // Profile loaded but no TC Kimlik, redirect to register to complete
        if (segments[1] !== 'register') {
          router.replace('/(auth)/register');
        }
      } else if (profile && (!profile.topics || profile.topics.length === 0)) {
        // Profile loaded but no topics, redirect to topics if not already there
        if (segments[1] !== 'topics') {
          router.replace('/(auth)/topics');
        }
      } else if (inAuthGroup) {
        if (profile?.topics && profile.topics.length > 0 && profile?.tc_kimlik) {
          router.replace('/(tabs)');
        }
      }
    }
  }, [session, segments, authLoading, loaded, profile]);

  if (!loaded || authLoading) {
    return null;
  }

  return <RootLayoutNav />;
}
