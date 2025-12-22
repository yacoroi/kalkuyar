'use client';

import { supabase } from "@/lib/supabase";
import { ArrowLeft, Award, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface HistoryItem {
    id: string;
    period_name: string;
    archived_at: string;
    full_name: string;
    rank: number;
    points: number;
    avatar_url: string | null;
    district: string | null;
    neighborhood: string | null;
}

export default function HistoryDetailPage() {
    const params = useParams();
    // Decode the period name from URL
    const periodName = typeof params.period === 'string' ? decodeURIComponent(params.period) : "";

    const [items, setItems] = useState<HistoryItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (periodName) {
            fetchPeriodDetails();
        }
    }, [periodName]);

    async function fetchPeriodDetails() {
        try {
            const { data, error } = await supabase
                .from("leaderboard_history")
                .select("*")
                .eq("period_name", periodName)
                .order("rank", { ascending: true });

            if (error) throw error;
            setItems(data || []);
        } catch (error) {
            console.error("Error fetching detail:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                <Link href="/leaderboard/history" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-1" />
                    Tüm Dönemlere Dön
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{periodName}</h1>
                        <p className="text-gray-500 text-sm mt-1">Dönem sonu sıralaması.</p>
                    </div>
                    {items.length > 0 && (
                        <div className="text-sm bg-gray-100 px-3 py-1 rounded-full text-gray-600 font-medium">
                            {new Date(items[0].archived_at).toLocaleDateString("tr-TR")} tarihinde arşivlendi
                        </div>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : items.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <p className="text-gray-500">Bu döneme ait kayıt bulunamadı.</p>
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
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 text-center font-bold text-lg text-gray-600">
                                            {item.rank}.
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden border border-gray-200">
                                                    {item.avatar_url ? (
                                                        <img src={item.avatar_url} alt={item.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{item.full_name || 'İsimsiz'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.district || '-'} / {item.neighborhood || '-'}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full font-bold border border-yellow-100">
                                                <Award size={14} className="text-yellow-600" />
                                                {item.points}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
