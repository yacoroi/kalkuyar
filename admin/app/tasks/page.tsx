import DeleteTaskPackButton from "@/components/DeleteTaskPackButton";
import { supabase } from "@/lib/supabase";
import { Calendar, CheckCircle, ClipboardList, Plus, Users } from "lucide-react";
import Link from "next/link";

export const revalidate = 60; // Cache for 60 seconds

export default async function TasksPage() {
    // Fetch content packs and the associated tasks to calculate stats
    const { data: packs, error } = await supabase
        .from("content_packs")
        .select(`
      *,
      tasks (
        id,
        status
      )
    `)
        .order("week_number", { ascending: false });

    if (error) {
        return <div className="p-4 text-red-500 bg-red-50 rounded-lg">Hata: {error.message}</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Görev Paketleri</h1>
                    <p className="text-gray-500 text-sm mt-1">Haftalık içerik paketleri ve tamamlanma durumları.</p>
                </div>
                <Link href="/tasks/new" className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-md hover:shadow-lg flex items-center gap-2">
                    <Plus size={18} />
                    Yeni Paket Oluştur
                </Link>
            </div>

            <div className="grid grid-cols-1 gap-6">
                {packs?.map((pack) => {
                    // Calculate Stats
                    const totalAssigned = pack.tasks?.length || 0;
                    const completed = pack.tasks?.filter((t: any) => t.status === 'completed').length || 0;
                    const completionRate = totalAssigned > 0 ? Math.round((completed / totalAssigned) * 100) : 0;

                    return (
                        <div key={pack.id} className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col lg:flex-row gap-6 lg:items-center justify-between group hover:border-gray-200 transition-colors">

                            {/* Left: Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 mb-2">
                                    <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wide">
                                        Hafta {pack.week_number}
                                    </span>
                                    <span className="bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg text-xs font-medium uppercase tracking-wide">
                                        {pack.topic}
                                    </span>
                                    <span className="text-gray-400 text-xs flex items-center gap-1 ml-1">
                                        <Calendar size={12} />
                                        {new Date(pack.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                </div>
                                <h3 className="font-bold text-xl text-gray-900 mb-2">{pack.title}</h3>
                                <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed max-w-2xl">{pack.message_framework}</p>
                                <div className="mt-3 flex gap-2">
                                    <Link
                                        href={`/tasks/${pack.id}`}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                        title="Düzenle"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
                                    </Link>
                                    <DeleteTaskPackButton packId={pack.id} />
                                </div>
                            </div>

                            {/* Center: Progress Bar */}
                            <div className="w-full lg:w-1/4 shrink-0">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-600 font-medium">Tamamlanma</span>
                                    <span className="font-bold text-gray-900">{completionRate}%</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                                    <div
                                        className={`h-full rounded-full duration-1000 ease-out ${completionRate >= 80 ? 'bg-green-500' :
                                            completionRate >= 40 ? 'bg-blue-500' :
                                                'bg-orange-500'
                                            }`}
                                        style={{ width: `${completionRate}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Right: Stats */}
                            <div className="flex items-center gap-8 shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:ml-4 lg:pl-8">
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-gray-400 text-xs font-medium mb-1 uppercase tracking-wide">
                                        <Users size={14} /> Atanan
                                    </div>
                                    <span className="text-2xl font-bold text-gray-900">{totalAssigned}</span>
                                </div>
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1.5 text-green-600/80 text-xs font-medium mb-1 uppercase tracking-wide">
                                        <CheckCircle size={14} /> Biten
                                    </div>
                                    <span className="text-2xl font-bold text-green-600">{completed}</span>
                                </div>
                            </div>

                        </div>
                    );
                })}

                {packs?.length === 0 && (
                    <div className="text-center py-24 bg-white rounded-2xl border border-gray-100 border-dashed">
                        <div className="inline-flex bg-gray-50 p-4 rounded-full mb-4">
                            <ClipboardList size={32} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Paket Bulunamadı</h3>
                        <p className="text-gray-500 mb-6 max-w-sm mx-auto mt-2">Henüz hiç görev paketi oluşturulmamış. Yeni bir paket oluşturarak başlayın.</p>
                        <Link href="/tasks/new" className="inline-flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-gray-800 transition-colors">
                            <Plus size={18} />
                            İlk Paketi Oluştur
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
