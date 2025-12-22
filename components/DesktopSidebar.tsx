import { useRouter, useSegments } from 'expo-router';
import { BookOpen, Home, LogOut, Plus, Trophy, User } from 'lucide-react-native';
import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';

interface NavItem {
    name: string;
    icon: typeof Home;
    route: string;
    segment: string;
}

const navItems: NavItem[] = [
    { name: 'Anasayfa', icon: Home, route: '/(tabs)', segment: 'index' },
    { name: 'Kütüphane', icon: BookOpen, route: '/(tabs)/trainings', segment: 'trainings' },
    { name: 'Sıralama', icon: Trophy, route: '/(tabs)/leaderboard', segment: 'leaderboard' },
    { name: 'Profil', icon: User, route: '/(tabs)/two', segment: 'two' },
];

export default function DesktopSidebar() {
    const router = useRouter();
    const segments = useSegments();
    const { profile } = useAuthStore();

    // Get current active segment
    const currentSegment = segments[1] || 'index';

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <View
            style={{
                width: 260,
                backgroundColor: '#ffffff',
                borderRightWidth: 1,
                borderRightColor: '#f3f4f6',
                paddingTop: 24,
                paddingBottom: 24,
                paddingHorizontal: 16,
                justifyContent: 'space-between',
                height: '100%',
            }}
        >
            {/* Top Section */}
            <View>
                {/* Logo */}
                <View style={{ marginBottom: 32, paddingHorizontal: 8 }}>
                    <Image
                        source={require('../assets/images/kalkuyar-logo.png')}
                        style={{ width: 160, height: 48 }}
                        resizeMode="contain"
                    />
                </View>

                {/* User Info Card */}
                <Pressable
                    onPress={() => router.push('/(tabs)/two')}
                    style={{
                        backgroundColor: '#fef2f2',
                        padding: 16,
                        borderRadius: 16,
                        marginBottom: 24,
                        borderWidth: 1,
                        borderColor: '#fee2e2',
                    }}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                        <View
                            style={{
                                width: 44,
                                height: 44,
                                borderRadius: 22,
                                backgroundColor: '#ffffff',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden',
                            }}
                        >
                            {profile?.avatar_url ? (
                                <Image
                                    source={{ uri: profile.avatar_url }}
                                    style={{ width: 44, height: 44 }}
                                />
                            ) : (
                                <User size={24} color="#ea2a33" />
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontWeight: '700', color: '#1f2937', fontSize: 14 }}>
                                {profile?.full_name || 'Kullanıcı'}
                            </Text>
                            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                                {profile?.points || 0} Puan
                            </Text>
                        </View>
                    </View>
                </Pressable>

                {/* Navigation Items */}
                <View style={{ gap: 4 }}>
                    {navItems.map((item) => {
                        const isActive = currentSegment === item.segment;
                        const IconComponent = item.icon;

                        return (
                            <Pressable
                                key={item.segment}
                                onPress={() => router.push(item.route as any)}
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    gap: 12,
                                    paddingVertical: 12,
                                    paddingHorizontal: 16,
                                    borderRadius: 12,
                                    backgroundColor: isActive ? '#fef2f2' : 'transparent',
                                }}
                            >
                                <IconComponent
                                    size={20}
                                    color={isActive ? '#ea2a33' : '#6b7280'}
                                />
                                <Text
                                    style={{
                                        fontSize: 14,
                                        fontWeight: isActive ? '600' : '500',
                                        color: isActive ? '#ea2a33' : '#374151',
                                    }}
                                >
                                    {item.name}
                                </Text>
                            </Pressable>
                        );
                    })}
                </View>

                {/* Create Report Button */}
                <Pressable
                    onPress={() => router.push('/report/create')}
                    style={{
                        marginTop: 24,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        backgroundColor: '#ea2a33',
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        shadowColor: '#ea2a33',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                    }}
                >
                    <Plus size={20} color="#ffffff" />
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
                        Rapor Oluştur
                    </Text>
                </Pressable>

                {/* New Member Button */}
                <Pressable
                    onPress={() => router.push('/(tabs)/new-member')}
                    style={{
                        marginTop: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 8,
                        backgroundColor: '#2563eb',
                        paddingVertical: 14,
                        paddingHorizontal: 20,
                        borderRadius: 12,
                        shadowColor: '#2563eb',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.2,
                        shadowRadius: 8,
                    }}
                >
                    <Plus size={20} color="#ffffff" />
                    <Text style={{ color: '#ffffff', fontWeight: '700', fontSize: 14 }}>
                        Yeni Üye
                    </Text>
                </Pressable>
            </View>

            {/* Bottom Section - Logout */}
            <Pressable
                onPress={handleLogout}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    paddingVertical: 12,
                    paddingHorizontal: 16,
                    borderRadius: 12,
                    backgroundColor: '#fef2f2',
                    borderWidth: 1,
                    borderColor: '#fee2e2',
                }}
            >
                <LogOut size={18} color="#dc2626" />
                <Text style={{ fontSize: 14, fontWeight: '500', color: '#dc2626' }}>
                    Çıkış Yap
                </Text>
            </Pressable>
        </View>
    );
}
