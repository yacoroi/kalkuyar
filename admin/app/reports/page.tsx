import ReportsTabs from "@/components/ReportsTabs";
import { supabase } from "@/lib/supabase";

export const revalidate = 0;

export default async function ReportsIndexPage() {
    const { data: packs, error } = await supabase
        .from("content_packs")
        .select(`
            id,
            week_number,
            title,
            topic,
            created_at
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
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Raporlar & Analiz</h1>
                    <p className="text-gray-500 text-sm mt-1">Gelen saha raporlarını görev veya konu bazlı inceleyin.</p>
                </div>
            </div>

            <ReportsTabs packs={packs || []} />
        </div>
    );
}
