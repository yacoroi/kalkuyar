'use client';

import { supabase } from '@/lib/supabase';
import { BookOpen, Loader2, Plus, Video } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const AVAILABLE_TOPICS = [
    'Ekonomi',
    'Gençlik',
    'Aile',
    'Adalet',
    'Eğitim',
    'Tarım',
    'Şehircilik',
    'Dış Politika',
    'Sağlık',
    'Teknoloji',
    'D-8'
];

interface Training {
    id: string;
    title: string;
    description: string | null;
    topic: string | null;
    image_url: string | null;
    video_url: string | null;
    is_active: boolean;
    created_at: string;
}

export default function TrainingsPage() {
    const [trainings, setTrainings] = useState<Training[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState('Tümü');

    useEffect(() => {
        fetchTrainings();
    }, []);

    async function fetchTrainings() {
        try {
            const { data, error } = await supabase
                .from('trainings')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setTrainings(data || []);
        } catch (error) {
            console.error('Error fetching trainings:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredTrainings = activeFilter === 'Tümü'
        ? trainings
        : trainings.filter(t => t.topic === activeFilter);

    return (
        <div className="max-w-6xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">İçerik Kütüphanesi</h1>
                    <p className="text-gray-500 text-sm">Teşkilat üyeleri için eğitim ve bilgilendirme materyalleri.</p>
                </div>
                <Link href="/trainings/new" className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-red-700 transition-colors text-sm">
                    <Plus size={18} />
                    Yeni İçerik Ekle
                </Link>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 overflow-x-auto pb-6 scrollbar-hide mb-2">
                <button
                    onClick={() => setActiveFilter('Tümü')}
                    className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeFilter === 'Tümü'
                        ? 'bg-red-600 border-red-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                        }`}
                >
                    Tümü
                </button>
                {AVAILABLE_TOPICS.map(topic => (
                    <button
                        key={topic}
                        onClick={() => setActiveFilter(topic)}
                        className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${activeFilter === topic
                            ? 'bg-red-600 border-red-600 text-white shadow-sm'
                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                    >
                        {topic}
                    </button>
                ))}
            </div>

            {/* List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="animate-spin text-red-600" size={32} />
                </div>
            ) : filteredTrainings.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                        <BookOpen size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">İçerik bulunamadı</h3>
                    <p className="text-gray-500 mb-6">
                        {activeFilter === 'Tümü'
                            ? 'Henüz eğitim eklenmemiş.'
                            : `"${activeFilter}" kategorisinde içerik bulunmuyor.`}
                    </p>
                    {activeFilter === 'Tümü' && (
                        <Link
                            href="/trainings/new"
                            className="text-red-600 font-bold hover:underline"
                        >
                            İlk eğitimi ekle →
                        </Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredTrainings.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group flex flex-col h-full">
                            {/* Thumbnail or Placeholder */}
                            <div className="h-48 bg-gray-100 relative shrink-0">
                                {item.image_url ? (
                                    <img
                                        src={item.image_url}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Video size={48} />
                                    </div>
                                )}
                            </div>

                            <div className="p-5 flex flex-col flex-1">
                                {item.topic && (
                                    <div className="mb-2">
                                        <span className="inline-block px-2 py-1 bg-red-50 text-red-700 rounded text-xs font-bold uppercase tracking-wider">
                                            {item.topic}
                                        </span>
                                    </div>
                                )}
                                <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 leading-tight group-hover:text-red-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-500 text-sm line-clamp-3 mb-4">
                                    {item.description}
                                </p>
                                <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
                                    <span className="text-xs text-gray-400">
                                        {new Date(item.created_at).toLocaleDateString('tr-TR')}
                                    </span>
                                    <Link href={`/trainings/${item.id}`} className="text-sm font-bold text-gray-600 hover:text-red-600">
                                        Düzenle
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
