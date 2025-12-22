import { supabase } from "@/lib/supabase";
import { ArrowLeft, Calendar, Clock, FileText, Frown, MapPin, Meh, Smile, User } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function TaskReportsPage({ params }: { params: Promise<{ packId: string }> }) {
    const { packId } = await params;

    // 1. Fetch Pack Info
    const { data: pack } = await supabase
        .from('content_packs')
        .select('title, week_number')
        .eq('id', packId)
        .single();

    if (!pack) return notFound();

    // 2. Fetch Reports for this Pack
    // Relation: Report -> Task -> Content Pack
    const { data: reports, error } = await supabase
        .from("reports")
        .select(`
            *,
            profiles:user_id (full_name, city, district, avatar_url),
            tasks!inner (
                content_pack_id
            )
        `)
        .eq('tasks.content_pack_id', packId)
        .order("created_at", { ascending: false });


    if (error) {
        return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Hata: {error.message}</div>;
    }

    return (
        <div className="space-y-6 pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/reports" className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded text-xs font-bold uppercase">HAFTA {pack.week_number}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{pack.title} - Raporları</h1>
                    <p className="text-gray-500 text-sm mt-1">Bu göreve ait sahadan gelen tüm raporlar.</p>
                </div>
                <div className="ml-auto bg-white px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 shadow-sm">
                    Toplam: <span className="text-gray-900 font-bold ml-1">{reports?.length || 0}</span>
                </div>
            </div>

            {/* Table Card */}
            <div className="bg-white rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-gray-900">Rapor Tarihi</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Raporlayan Üye</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Konum</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Muhatap</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Tepki</th>
                                <th className="px-6 py-4 font-semibold text-gray-900 text-center">Kişi</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Üyelik Daveti</th>
                                <th className="px-6 py-4 font-semibold text-gray-900">Notlar</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reports?.map((report) => (
                                <tr key={report.id} className="hover:bg-gray-50/80 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col">
                                            <span className="text-gray-900 font-medium flex items-center gap-2">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(report.created_at).toLocaleDateString("tr-TR")}
                                            </span>
                                            <span className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                                                <Clock size={14} />
                                                {new Date(report.created_at).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 overflow-hidden">
                                                {report.profiles?.avatar_url ? (
                                                    <img src={report.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User size={16} />
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{report.profiles?.full_name || "Bilinmiyor"}</p>
                                                <p className="text-xs text-gray-400">Üye</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-gray-600">
                                            <MapPin size={16} className="text-gray-400" />
                                            {report.profiles?.district || '-'}, {report.profiles?.city || '-'}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${report.contact_type === 'Esnaf' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                            report.contact_type === 'Seçmen' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                'bg-purple-50 text-purple-700 border-purple-100'
                                            }`}>
                                            {report.contact_type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {report.reaction === "Olumlu" && <Smile className="inline text-green-500" strokeWidth={2} />}
                                        {report.reaction === "Nötr" && <Meh className="inline text-yellow-500" strokeWidth={2} />}
                                        {report.reaction === "Olumsuz" && <Frown className="inline text-red-500" strokeWidth={2} />}
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-700">
                                        {report.people_count || 1}
                                    </td>
                                    <td className="px-6 py-4">
                                        {report.membership_counts && Object.keys(report.membership_counts).length > 0 ? (
                                            <div className="flex flex-wrap gap-1">
                                                {Object.entries(report.membership_counts as Record<string, string>).map(([status, count]) => (
                                                    <span key={status} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${status === 'üye_oldu' ? 'bg-green-50 text-green-700 border-green-100' :
                                                            status === 'gönüllü' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                                status === 'kararsız' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                                    'bg-red-50 text-red-700 border-red-100'
                                                        }`}>
                                                        {status === 'üye_oldu' ? 'Üye' :
                                                            status === 'gönüllü' ? 'Gönüllü' :
                                                                status === 'kararsız' ? 'Kararsız' : 'İstemiyor'}: {count}
                                                    </span>
                                                ))}
                                            </div>
                                        ) : report.membership_status ? (
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${report.membership_status === 'üye_oldu' ? 'bg-green-50 text-green-700 border-green-100' :
                                                report.membership_status === 'gönüllü' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                                    report.membership_status === 'kararsız' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                        'bg-red-50 text-red-700 border-red-100'
                                                }`}>
                                                {report.membership_status === 'üye_oldu' ? 'Üye Oldu' :
                                                    report.membership_status === 'gönüllü' ? 'Gönüllü' :
                                                        report.membership_status === 'kararsız' ? 'Kararsız' : 'İstemiyor'}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 max-w-xs">
                                        <p className="truncate text-gray-600" title={report.feedback_note || ''}>
                                            {report.feedback_note || <span className="text-gray-300 italic">-</span>}
                                        </p>
                                    </td>
                                </tr>
                            ))}
                            {reports?.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="text-center py-24">
                                        <div className="flex flex-col items-center justify-center text-gray-400">
                                            <FileText size={48} className="mb-4 text-gray-200" />
                                            <p className="text-lg font-medium text-gray-900">Henüz bu görev için rapor girilmemiş</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
