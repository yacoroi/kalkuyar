'use client';

import { supabase } from "@/lib/supabase";
import { AlertTriangle, Archive, Award, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface LeaderboardUser {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    district: string | null;
    neighborhood: string | null;
    role: 'member' | 'admin' | 'district_head';
    points: number;
}

export default function LeaderboardPage() {
    const [users, setUsers] = useState<LeaderboardUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [showEndSeasonModal, setShowEndSeasonModal] = useState(false);
    const [periodName, setPeriodName] = useState("");
    const [target, setTarget] = useState(15);
    const [resetting, setResetting] = useState(false);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    async function fetchLeaderboard() {
        try {
            const { data, error } = await supabase
                .from("profiles")
                .select("*")
                .order("points", { ascending: false })
                .limit(100); // Fetch top 100 for performance, or more if needed

            if (error) throw error;
            setUsers(data || []);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function handleEndSeason() {
        if (!periodName.trim()) return;
        setResetting(true);
        try {
            const { error } = await supabase.rpc('archive_and_reset_season', {
                p_period_name: periodName,
                p_season_target: target
            });
            if (error) throw error;
            setShowEndSeasonModal(false);
            setPeriodName("");
            fetchLeaderboard(); // Refresh to see empty list
            alert("Sezon başarıyla sonlandırıldı ve puanlar sıfırlandı.");
        } catch (error) {
            console.error("End Season Error:", JSON.stringify(error, null, 2));
            alert("Bir hata oluştu.");
        } finally {
            setResetting(false);
        }
    }

    const getRank = (index: number) => {
        let i = index;
        while (i > 0 && users[i - 1]?.points === users[index]?.points) {
            i--;
        }
        return i + 1;
    };

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Puan Sıralaması</h1>
                    <p className="text-gray-500 text-sm mt-1">En yüksek puana sahip kullanıcılar ve performans sıralaması.</p>
                </div>
                <div className="flex gap-2">
                    <Link href="/leaderboard/history" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 font-medium transition-colors">
                        <Archive size={18} />
                        Geçmiş
                    </Link>
                    <button
                        onClick={() => setShowEndSeasonModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-medium transition-colors border border-red-100"
                    >
                        <AlertTriangle size={18} />
                        Sezonu Bitir
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4 font-bold text-gray-900 w-24 text-center">Sıra</th>
                                    <th className="px-6 py-4 font-bold text-gray-900">Kullanıcı</th>
                                    <th className="px-6 py-4 font-bold text-gray-900">İlçe / Mahalle</th>
                                    <th className="px-6 py-4 font-bold text-gray-900 text-right">Puan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {users.map((user, index) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4 text-center font-bold text-lg text-gray-600">
                                            {getRank(index)}.
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                                                    {user.avatar_url ? (
                                                        <img src={user.avatar_url} alt={user.full_name || 'Kullanıcı'} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{user.full_name || 'İsimsiz'}</p>
                                                    <p className="text-xs text-gray-500">{user.role === 'district_head' ? 'İlçe Başkanı' : 'Kullanıcı'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {user.district || '-'} / {user.neighborhood || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-bold border border-yellow-100">
                                                <Award size={14} className="text-yellow-600" />
                                                {user.points}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-12 text-center text-gray-500">
                                            Henüz sıralama verisi bulunmuyor.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Reset Modal */}
            {showEndSeasonModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl">
                        <div className="flex flex-col items-center text-center mb-6">
                            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                                <AlertTriangle size={24} />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Sezonu Bitir</h3>
                            <p className="text-gray-500 text-sm mt-2">
                                Bu işlem mevcut sıralamayı arşivleyecek ve <strong>herkesin puanını sıfırlayacaktır</strong>. Bu işlem geri alınamaz.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Dönem İsmi</label>
                                <input
                                    type="text"
                                    value={periodName}
                                    onChange={(e) => setPeriodName(e.target.value)}
                                    placeholder="Örn: Aralık 2025"
                                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                />
                            </div>

                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase">Yeni Sezon Hedefi</label>
                                <input
                                    type="number"
                                    value={target}
                                    onChange={(e) => setTarget(parseInt(e.target.value) || 0)}
                                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                                />
                                <p className="text-xs text-gray-400 mt-1">Her kullanıcıya atanacak temas hedefi.</p>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button
                                    onClick={() => setShowEndSeasonModal(false)}
                                    className="flex-1 px-4 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleEndSeason}
                                    disabled={!periodName.trim() || resetting}
                                    className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {resetting ? 'İşleniyor...' : 'Onayla ve Bitir'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
