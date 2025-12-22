"use client";

import { ArrowRight, Calendar, FileText, Layers, LayoutList, MessageSquare } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import TopicReports from "./TopicReports";

interface ContentPackSummary {
    id: number;
    week_number: number | null;
    title: string | null;
    topic: string | null;
    created_at: string;
}

export default function ReportsTabs({ packs }: { packs: ContentPackSummary[] }) {
    const [activeTab, setActiveTab] = useState<'tasks' | 'topics'>('topics');

    return (
        <div className="space-y-6">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('topics')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'topics'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <Layers size={18} />
                    Konu Raporları
                </button>
                <button
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'tasks'
                        ? 'border-red-600 text-red-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                        }`}
                >
                    <LayoutList size={18} />
                    Görev Raporları
                </button>
            </div>

            {/* Content */}
            {activeTab === 'tasks' ? (
                <div className="grid grid-cols-1 gap-4">
                    {packs?.map((pack) => (
                        <Link
                            key={pack.id}
                            href={`/reports/${pack.id}`}
                            className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 hover:border-red-200 hover:shadow-md transition-all group flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg group-hover:scale-110 transition-transform">
                                    {pack.week_number}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-1">
                                        <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 uppercase tracking-wide">{pack.topic}</span>
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(pack.created_at).toLocaleDateString("tr-TR")}</span>
                                    </div>
                                    <h3 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">{pack.title}</h3>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="text-sm font-medium text-gray-400 flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-white group-hover:text-red-600 transition-colors">
                                    <MessageSquare size={16} />
                                    <span>Raporları İncele</span>
                                </div>
                                <ArrowRight size={20} className="text-gray-300 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
                            </div>
                        </Link>
                    ))}

                    {packs?.length === 0 && (
                        <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
                            <FileText size={48} className="mx-auto mb-4 text-gray-200" />
                            <h3 className="text-lg font-bold text-gray-900">Görev Paketi Bulunamadı</h3>
                            <p className="text-gray-500">Raporları görüntülemek için önce görev paketi oluşturmalısınız.</p>
                        </div>
                    )}
                </div>
            ) : (
                <TopicReports />
            )}
        </div>
    );
}
