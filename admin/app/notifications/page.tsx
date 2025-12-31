'use client';

import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface User {
    id: string;
    full_name: string;
    push_token: string | null;
    last_active_at: string | null;
    city: string | null;
    district: string | null;
}

export default function NotificationsPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectAll, setSelectAll] = useState(false);
    const [title, setTitle] = useState('');
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<{ success: number; failed: number } | null>(null);
    const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, [filter]);

    async function fetchUsers() {
        setLoading(true);
        let query = supabase
            .from('profiles')
            .select('id, full_name, push_token, last_active_at, city, district')
            .not('push_token', 'is', null);

        if (filter === 'active') {
            // Active in last 2 days
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            query = query.gte('last_active_at', twoDaysAgo.toISOString());
        } else if (filter === 'inactive') {
            // Inactive for more than 2 days
            const twoDaysAgo = new Date();
            twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
            query = query.lt('last_active_at', twoDaysAgo.toISOString());
        }

        const { data, error } = await query.order('last_active_at', { ascending: false });

        if (error) {
            console.error('Error fetching users:', error);
        } else {
            setUsers(data || []);
        }
        setLoading(false);
    }

    function toggleSelectAll() {
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
        setSelectAll(!selectAll);
    }

    function toggleUser(userId: string) {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    }

    async function sendNotifications() {
        if (!title || !body) {
            alert('Başlık ve içerik zorunludur!');
            return;
        }

        if (selectedUsers.length === 0) {
            alert('En az bir kullanıcı seçmelisiniz!');
            return;
        }

        setSending(true);
        setResult(null);

        try {
            // Get push tokens for selected users
            const selectedUserData = users.filter(u => selectedUsers.includes(u.id));
            const tokens = selectedUserData.map(u => u.push_token).filter(Boolean) as string[];

            if (tokens.length === 0) {
                alert('Seçili kullanıcıların push token\'ı yok!');
                setSending(false);
                return;
            }

            // Send via API route
            const response = await fetch('/api/send-push', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tokens,
                    title,
                    body,
                }),
            });

            const data = await response.json();
            setResult({ success: data.success || 0, failed: data.failed || 0 });
        } catch (error) {
            console.error('Error sending notifications:', error);
            alert('Bildirim gönderilirken hata oluştu!');
        } finally {
            setSending(false);
        }
    }

    function formatDate(dateString: string | null) {
        if (!dateString) return 'Bilinmiyor';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMins < 60) return `${diffMins} dakika önce`;
        if (diffHours < 24) return `${diffHours} saat önce`;
        if (diffDays < 7) return `${diffDays} gün önce`;
        return date.toLocaleDateString('tr-TR');
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Push Bildirimler</h1>

            {/* Notification Form */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Yeni Bildirim</h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Başlık
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Bildirim başlığı..."
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        İçerik
                    </label>
                    <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Bildirim içeriği..."
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={sendNotifications}
                        disabled={sending || selectedUsers.length === 0}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 hover:bg-red-700"
                    >
                        {sending ? 'Gönderiliyor...' : `${selectedUsers.length} Kişiye Gönder`}
                    </button>

                    {result && (
                        <span className="text-sm text-gray-600">
                            ✅ {result.success} başarılı, ❌ {result.failed} başarısız
                        </span>
                    )}
                </div>
            </div>

            {/* User Selection */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Kullanıcılar ({users.length})</h2>

                    <div className="flex items-center gap-4">
                        {/* Filter */}
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value as any)}
                            className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm"
                        >
                            <option value="all">Tümü</option>
                            <option value="active">Aktif (son 2 gün)</option>
                            <option value="inactive">Pasif (2+ gün)</option>
                        </select>

                        {/* Select All */}
                        <label className="flex items-center gap-2 text-sm">
                            <input
                                type="checkbox"
                                checked={selectAll}
                                onChange={toggleSelectAll}
                                className="w-4 h-4"
                            />
                            Tümünü Seç
                        </label>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
                ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        Push token'ı olan kullanıcı bulunamadı.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Seç
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Ad Soyad
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Konum
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                        Son Aktiflik
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedUsers.includes(user.id)}
                                                onChange={() => toggleUser(user.id)}
                                                className="w-4 h-4"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-medium">
                                            {user.full_name || 'İsimsiz'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 text-sm">
                                            {user.district && user.city
                                                ? `${user.district}, ${user.city}`
                                                : user.city || '-'}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-500">
                                            {formatDate(user.last_active_at)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
