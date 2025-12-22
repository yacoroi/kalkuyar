import { createClient } from "@/lib/supabase/server";
import { Activity, CheckSquare, FileText, TrendingUp, Users } from "lucide-react";

export const revalidate = 60; // Cache for 60 seconds, then revalidate

export default async function Home() {
  const supabase = await createClient();

  // Parallel Data Fetching
  const [
    { count: memberCount },
    { count: taskCount },
    { count: reportCount },
    { count: completedTaskCount },
    { data: latestContentPacks },
    { data: recentReports }
  ] = await Promise.all([
    // 1. Total Members
    supabase.from("profiles").select("*", { count: "exact", head: true }),

    // 2. Pending Tasks
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "pending"),

    // 3. Total Reports
    supabase.from("reports").select("*", { count: "exact", head: true }),

    // 4. Completed Tasks
    supabase.from("tasks").select("*", { count: "exact", head: true }).eq("status", "completed"),

    // 5. Recent Content Packs (Notifications)
    supabase.from("content_packs")
      .select("id, title, topic, created_at")
      .order("created_at", { ascending: false })
      .limit(5),

    // 6. Reports Activity (Last 7 Days)
    supabase.from("reports")
      .select("created_at")
      .gte("created_at", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
  ]);

  // Process Chart Data (Group Reports by Day)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().split('T')[0];
  });

  const chartData = last7Days.map(date => {
    const count = recentReports?.filter(r => {
      const reportDate = r.created_at.split('T')[0]; // Extract YYYY-MM-DD from timestamp
      return reportDate === date;
    }).length || 0;
    return { date, count };
  });

  // Calculate Max for Scaling
  const maxCount = Math.max(...chartData.map(d => d.count), 1);

  // Helper for relative time
  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} gün önce`;
    if (hours > 0) return `${hours} saat önce`;
    return 'Az önce';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Genel Bakış</h1>
          <p className="text-gray-500 mt-1">Teşkilat operasyon durumu ve özet istatistikler.</p>
        </div>
        <div className="text-sm font-medium text-gray-500 bg-white px-4 py-2 rounded-lg border border-gray-100 shadow-sm">
          Bugün: {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Members */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
              <Users size={24} />
            </div>
            {/* <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">+12%</span> */}
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{memberCount || 0}</p>
            <p className="text-sm font-medium text-gray-500">Toplam Üye</p>
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
              <Activity size={24} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{taskCount || 0}</p>
            <p className="text-sm font-medium text-gray-500">Bekleyen Görev</p>
          </div>
        </div>

        {/* Completed Tasks */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-green-50 rounded-xl text-green-600">
              <CheckSquare size={24} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{completedTaskCount || 0}</p>
            <p className="text-sm font-medium text-gray-500">Tamamlanan Görev</p>
          </div>
        </div>

        {/* Reports */}
        <div className="bg-white p-6 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
              <FileText size={24} />
            </div>
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{reportCount || 0}</p>
            <p className="text-sm font-medium text-gray-500">Gelen Rapor</p>
          </div>
        </div>
      </div>

      {/* CHARTS & ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Performance Chart */}
        <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100 min-h-[400px]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Saha Rapor Performansı</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <TrendingUp size={16} />
              <span>Son 7 Gün</span>
            </div>
          </div>

          <div className="h-64 flex items-end justify-between gap-2">
            {chartData.map((item) => (
              <div key={item.date} className="flex-1 flex flex-col items-center gap-2 group">
                <div
                  className="w-full bg-red-100 rounded-t-lg group-hover:bg-red-200 transition-all relative"
                  style={{ height: `${(item.count / maxCount) * 100}%`, minHeight: '4px' }}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {item.count} Rapor
                  </div>
                </div>
                <span className="text-xs text-gray-400 font-medium">
                  {new Date(item.date).toLocaleDateString('tr-TR', { weekday: 'short' })}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Notifications (Content Packs) */}
        <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Son Aksiyonlar</h2>
          <div className="space-y-4">
            {latestContentPacks && latestContentPacks.length > 0 ? (
              latestContentPacks.map((pack) => (
                <div key={pack.id} className="flex gap-3 pb-4 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      <span className="font-bold text-blue-600">{pack.topic || 'Genel'}:</span> {pack.title}
                    </p>
                    <p className="text-xs text-gray-400">{timeAgo(pack.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-400">Henüz bir aktivite yok.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
