'use client';

import { supabase } from '@/lib/supabase';
import { Eye, Loader2, Plus, Trash2, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Story {
    id: string;
    media_url: string;
    media_type: 'image' | 'video';
    caption: string | null;
    created_at: string;
    expires_at: string;
    view_count?: number;
}

export default function StoriesPage() {
    const [stories, setStories] = useState<Story[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
    }, []);

    async function fetchStories() {
        try {
            // Fetch stories
            const { data, error } = await supabase
                .from('stories')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch view counts for each story
            const storiesWithViews = await Promise.all((data || []).map(async (story) => {
                const { count } = await supabase
                    .from('story_views')
                    .select('*', { count: 'exact', head: true })
                    .eq('story_id', story.id);
                return { ...story, view_count: count || 0 };
            }));

            setStories(storiesWithViews);
        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Bu hikayeyi silmek istediğinize emin misiniz?')) return;

        try {
            const { error } = await supabase.from('stories').delete().eq('id', id);
            if (error) throw error;
            setStories(stories.filter(s => s.id !== id));
        } catch (error) {
            console.error('Error deleting story:', error);
            alert('Silme işlemi başarısız.');
        }
    };

    const isExpired = (dateString: string) => {
        return new Date(dateString) < new Date();
    };

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Hikayeler</h1>
                    <p className="text-gray-500 text-sm">Uygulamada paylaşılacak 24 saatlik hikayeleri yönetin.</p>
                </div>
                <Link href="/stories/new" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors text-sm">
                    <Plus size={18} />
                    Yeni Hikaye Paylaş
                </Link>
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
            ) : stories.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <Video size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Hikaye bulunamadı</h3>
                    <p className="text-gray-500 mb-6">Henüz hiç hikaye paylaşılmamış.</p>
                    <Link href="/stories/new" className="text-red-600 font-bold hover:underline">
                        İlk hikayeyi paylaş →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {stories.map((story) => {
                        const expired = isExpired(story.expires_at);
                        return (
                            <div key={story.id} className={`bg-white rounded-xl border overflow-hidden group flex flex-col ${expired ? 'border-gray-200 opacity-60' : 'border-gray-200 shadow-sm hover:shadow-md transition-shadow'}`}>
                                {/* Media Preview */}
                                <div className="aspect-[9/16] bg-gray-100 relative group-hover:bg-gray-200 transition-colors">
                                    {story.media_type === 'video' ? (
                                        <div className="w-full h-full flex items-center justify-center relative">
                                            <video src={story.media_url} className="w-full h-full object-cover" muted />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                                                <Video className="text-white drop-shadow-md" size={32} />
                                            </div>
                                        </div>
                                    ) : (
                                        <img src={story.media_url} alt="Story" className="w-full h-full object-cover" />
                                    )}

                                    {/* Overlay Status */}
                                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                                        {expired && (
                                            <span className="bg-gray-800/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                                SÜRESİ DOLDU
                                            </span>
                                        )}
                                    </div>

                                    {/* Delete Overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => handleDelete(story.id)}
                                            className="bg-white text-red-600 p-3 rounded-full hover:bg-gray-100 transition-colors shadow-lg"
                                            title="Hikayeyi Sil"
                                        >
                                            <Trash2 size={24} />
                                        </button>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-1.5 text-gray-600" title="Görüntülenme">
                                            <Eye size={14} />
                                            <span className="text-xs font-bold">{story.view_count}</span>
                                        </div>
                                        <span className="text-[10px] text-gray-400">
                                            {new Date(story.created_at).toLocaleDateString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {story.caption && (
                                        <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
                                            {story.caption}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
