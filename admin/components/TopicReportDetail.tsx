"use client";

import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Report {
    id: number;
    description: string;
    created_at: string;
    user_id: string;
    people_count: number;
    reaction: string;
    contact_type: string;
    feedback_note: string;
    membership_status: string | null;
    profiles: {
        full_name: string;
    } | null;
}

export default function TopicReportDetail({ topic }: { topic: string }) {
    const decodedTopic = decodeURIComponent(topic);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    async function fetchReports() {
        setLoading(true);
        let query = supabase
            .from("reports")
            .select(`
                *,
                profiles (full_name)
            `)
            .eq("topic", decodedTopic)
            .is("task_id", null) // Free reports only
            .order("created_at", { ascending: false });

        if (startDate) {
            query = query.gte("created_at", startDate);
        }
        if (endDate) {
            query = query.lte("created_at", endDate + " 23:59:59");
        }

        const { data, error } = await query;
        if (data) {
            setReports(data as any);
        }
        setLoading(false);
    }

    useEffect(() => {
        fetchReports();
    }, [startDate, endDate]);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4">
                <Link
                    href="/reports"
                    className="flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors self-start"
                >
                    <ArrowLeft size={16} />
                    Raporlara Dön
                </Link>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
                            <span className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg">
                                {decodedTopic.charAt(0)}
                            </span>
                            {decodedTopic} Raporları
                        </h1>
                        <p className="text-gray-500 text-sm mt-1 ml-14">Bu konu başlığı altındaki tüm serbest raporlar.</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Placeholder for export button if needed */}
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Başlangıç:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-500">Bitiş:</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    />
                </div>
                <div className="ml-auto text-sm text-gray-400">
                    Toplam <strong>{reports.length}</strong> rapor görüntüleniyor
                </div>
            </div>

            {/* List */}
            {loading ? (
                <div className="text-center py-24">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-400 mt-4">Raporlar yükleniyor...</p>
                </div>
            ) : reports.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-gray-100 border-dashed">
                    <p className="text-gray-500 font-medium">Bu kriterlere uygun rapor bulunamadı.</p>
                    <p className="text-gray-400 text-sm mt-1">Filtreleri değiştirmeyi deneyin.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {reports.map((report) => (
                        <div key={report.id} className="bg-white p-5 rounded-xl border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                                        <User size={16} />
                                    </div>
                                    <div>
                                        <div className="font-semibold text-gray-900 text-sm">{report.profiles?.full_name || "İsimsiz"}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-1">
                                            <Calendar size={10} /> {new Date(report.created_at).toLocaleString("tr-TR")}
                                        </div>
                                    </div>
                                </div>
                                <div className={`px-3 py-1 rounded-full text-xs font-bold ${report.reaction === 'Olumlu' ? 'bg-green-100 text-green-700' :
                                    report.reaction === 'Olumsuz' ? 'bg-red-100 text-red-700' :
                                        'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {report.reaction}
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100 mb-3">
                                <div>
                                    <span className="text-gray-400 text-xs block mb-0.5">Muhatap Tipi</span>
                                    <span className="font-medium text-gray-700">{report.contact_type}</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs block mb-0.5">Temas Edilen Kişi Sayısı</span>
                                    <span className="font-medium text-gray-700">{report.people_count} Kişi</span>
                                </div>
                                <div>
                                    <span className="text-gray-400 text-xs block mb-0.5">Üyelik Daveti</span>
                                    {report.membership_status ? (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${report.membership_status === 'üye_oldu' ? 'bg-green-100 text-green-700' :
                                                report.membership_status === 'gönüllü' ? 'bg-blue-100 text-blue-700' :
                                                    report.membership_status === 'kararsız' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-red-100 text-red-700'
                                            }`}>
                                            {report.membership_status === 'üye_oldu' ? 'Üye Oldu' :
                                                report.membership_status === 'gönüllü' ? 'Gönüllü' :
                                                    report.membership_status === 'kararsız' ? 'Kararsız' : 'İstemiyor'}
                                        </span>
                                    ) : (
                                        <span className="font-medium text-gray-400">-</span>
                                    )}
                                </div>
                            </div>

                            {report.feedback_note && (
                                <div className="text-gray-600 text-sm leading-relaxed border-l-2 border-gray-200 pl-3 italic">
                                    "{report.feedback_note}"
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
