import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Image, View } from 'react-native';

import DesktopSidebar from '@/components/DesktopSidebar';
import { useClientOnlyValue } from '@/components/useClientOnlyValue';
import { useColorScheme } from '@/components/useColorScheme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../hooks/useResponsiveLayout';
import { useUiStore } from '../../stores/useUiStore';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isDesktop } = useResponsiveLayout();

  // Track menu state from store to safer avoid router context issues
  const isPlusMenuOpen = useUiStore(s => s.isPlusMenuOpen);
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(rotateAnim, {
      toValue: isPlusMenuOpen ? 1 : 0,
      useNativeDriver: true,
      friction: 5,
      tension: 40
    }).start();
  }, [isPlusMenuOpen]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '45deg']
  });

  const tabsContent = (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#ea2a33',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarShowLabel: true,
        tabBarStyle: isDesktop ? { display: 'none' } : {
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          height: 60 + (insets.bottom > 0 ? insets.bottom : 10),
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#ffffff',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#333333',
        // Disable the static render of the header on web
        // to prevent a hydration error in React Navigation v6.
        headerShown: isDesktop ? false : useClientOnlyValue(false, true),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Anasayfa',
          headerTitle: () => (
            <Image
              source={require('../../assets/images/kalkuyar-logo.png')}
              style={{ width: 140, height: 40 }}
              resizeMode="contain"
            />
          ),
          headerTitleAlign: 'center',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="trainings"
        options={{
          title: 'Konularım',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="book" color={color} />,
        }}
      />
      <Tabs.Screen
        name="new-member"
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.push('/plus-menu');
          },
        }}
        options={{
          title: '', // No label for center button
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <View style={{
              width: 54,
              height: 54,
              borderRadius: 27,
              backgroundColor: '#ea2a33',
              marginBottom: 40,
              alignItems: 'center',
              justifyContent: 'center',
              elevation: 5,
              shadowColor: '#ea2a33',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 4,
            }}>
              <Animated.View style={{ transform: [{ rotate }] }}>
                <FontAwesome name="plus" size={24} color="#ffffff" />
              </Animated.View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: 'Sıralama',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="trophy" color={color} />,
        }}
      />
      <Tabs.Screen
        name="two"
        options={{
          title: 'Profil',
          headerShown: false,
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
        }}
      />
    </Tabs>
  );

  // Desktop layout: Sidebar + Content
  if (isDesktop) {
    return (
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <DesktopSidebar />
        <View style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
          {tabsContent}
        </View>
      </View>
    );
  }

  // Mobile layout: Standard tabs
  return tabsContent;
}
