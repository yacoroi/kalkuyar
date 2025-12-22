'use client';

import { supabase } from '@/lib/supabase';
import { ExternalLink, Eye, Loader2, RefreshCw, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface NewsItem {
    id: string;
    title: string;
    url: string;
    image_url: string | null;
    summary: string | null;
    content: string | null;
    published_at: string;
    created_at: string;
    is_active: boolean;
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);
    const [loading, setLoading] = useState(true);
    const [fetching, setFetching] = useState(false);

    useEffect(() => {
        fetchNews();
    }, []);

    async function fetchNews() {
        try {
            const { data, error } = await supabase
                .from('news')
                .select('*')
                .order('published_at', { ascending: false });

            if (error) throw error;
            setNews(data || []);
        } catch (error) {
            console.error('Error fetching news:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleFetchFromSource() {
        setFetching(true);
        try {
            // Call the Next.js API Route (Puppeteer)
            const response = await fetch('/api/scrape', { method: 'POST' });
            const result = await response.json();

            if (!result.success) throw new Error(result.error);

            alert(result.message || 'Haberler başarıyla güncellendi.');
            fetchNews();
        } catch (error) {
            console.error('Fetch error:', error);
            alert('Haber çekme sırasında bir hata oluştu: ' + (error instanceof Error ? error.message : JSON.stringify(error)));
        } finally {
            setFetching(false);
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Haber Yönetimi</h1>
                    <p className="text-gray-500 text-sm">Saadet.org.tr üzerinden çekilen haberler.</p>
                </div>
                <button
                    onClick={handleFetchFromSource}
                    disabled={fetching}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors text-sm disabled:opacity-50"
                >
                    {fetching ? <Loader2 className="animate-spin" size={18} /> : <RefreshCw size={18} />}
                    {fetching ? 'Çekiliyor...' : 'Kaynaktan Güncelle'}
                </button>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
            ) : news.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <ExternalLink size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Haber bulunamadı</h3>
                    <p className="text-gray-500 mb-6">
                        Henüz veri tabanında haber yok.
                    </p>
                    <button
                        onClick={handleFetchFromSource}
                        className="text-red-600 font-bold hover:underline"
                    >
                        İlk güncellemeyi yap →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {news.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                            {/* Thumbnail */}
                            <div className="h-48 bg-gray-100 relative shrink-0">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <ExternalLink size={48} />
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                                    <a href={item.url} target="_blank" rel="noopener noreferrer">
                                        {item.title}
                                    </a>
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                    {item.summary || 'Özet bulunmuyor.'}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <button
                                        onClick={() => setSelectedNews(item)}
                                        className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-1"
                                    >
                                        <Eye size={16} /> İçeriği Oku
                                    </button>

                                    <Link href={item.url} target="_blank" className="text-sm font-bold text-gray-500 hover:text-gray-700 flex items-center gap-1">
                                        Kaynağa Git <ExternalLink size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {selectedNews && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedNews(null)}>
                    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-2xl z-10">
                            <h3 className="font-bold text-xl text-gray-900 line-clamp-1 pr-4">{selectedNews.title}</h3>
                            <button onClick={() => setSelectedNews(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            {selectedNews.image_url && (
                                <img src={selectedNews.image_url} alt="" className="w-full h-64 object-cover rounded-xl mb-6" />
                            )}
                            <div className="prose prose-red max-w-none">
                                {selectedNews.content ? (
                                    selectedNews.content.split('\n').map((paragraph: string, idx: number) => (
                                        paragraph.trim() && <p key={idx} className="mb-4 text-gray-700 leading-relaxed">{paragraph}</p>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">İçerik henüz çekilmemiş veya bulunamamış.</p>
                                )}
                            </div>
                        </div>
                        <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
                            <span className="text-xs text-gray-400">
                                {new Date(selectedNews.published_at || selectedNews.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <a href={selectedNews.url} target="_blank" rel="noreferrer" className="text-sm font-bold text-red-600 hover:text-red-700 flex items-center gap-2">
                                Kaynağında Oku <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
