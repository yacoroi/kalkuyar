'use client';

import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PeriodSummary {
    period_name: string;
    archived_at: string;
    total_users: number; // calculated client side
}

export default function HistoryListPage() {
    const [periods, setPeriods] = useState<PeriodSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPeriods();
    }, []);

    async function fetchPeriods() {
        try {
            // Fetch all history metadata. 
            // Optimally we'd have a view for this, but distinct on client is fine for now.
            const { data, error } = await supabase
                .from("leaderboard_history")
                .select("period_name, archived_at")
                .order("archived_at", { ascending: false });

            if (error) throw error;

            // Group by period_name to get unique list and counts
            const periodMap = new Map<string, PeriodSummary>();

            (data || []).forEach((row: any) => {
                if (!periodMap.has(row.period_name)) {
                    periodMap.set(row.period_name, {
                        period_name: row.period_name,
                        archived_at: row.archived_at,
                        total_users: 0
                    });
                }
                const p = periodMap.get(row.period_name)!;
                p.total_users++;
            });

            setPeriods(Array.from(periodMap.values()));

        } catch (error) {
            console.error("Error fetching periods:", error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="mb-8">
                <Link href="/leaderboard" className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 mb-4 transition-colors">
                    <ArrowLeft size={16} className="mr-1" />
                    Güncel Sıralamaya Dön
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Geçmiş Dönemler</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        Arşivlenmiş tüm dönemlerin listesi. İncelemek istediğiniz döneme tıklayın.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
                </div>
            ) : periods.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
                    <Calendar size={48} className="mx-auto text-gray-200 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900">Henüz arşivlenmiş bir dönem yok</h3>
                    <p className="text-gray-500 mt-2">Dönemleri bitirdiğinizde burada listelenecektir.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {periods.map((period) => (
                        <Link
                            key={period.period_name}
                            href={`/leaderboard/history/${encodeURIComponent(period.period_name)}`}
                            className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-red-200 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                                        <Calendar size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                                            {period.period_name}
                                        </h3>
                                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                                            <div className="flex items-center gap-1">
                                                <Clock size={14} />
                                                {new Date(period.archived_at).toLocaleDateString('tr-TR')}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                {period.total_users} Kayıt
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={20} className="text-gray-300 group-hover:text-red-500 transition-colors" />
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
