import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import PwaInstallPrompt from '../components/PwaInstallPrompt';
import '../global.css'; // Import NativeWind global styles
import { supabase } from '../lib/supabase';
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

  const { session, setSession, loading: authLoading, profile } = useAuthStore();
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
      if (profile && (!profile.topics || profile.topics.length === 0)) {
        // Profile loaded but no topics, redirect to topics if not already there
        if (segments[1] !== 'topics') {
          router.replace('/(auth)/topics');
        }
      } else if (inAuthGroup) {
        if (profile?.topics && profile.topics.length > 0) {
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
