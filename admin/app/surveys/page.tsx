'use client';

import { supabase } from '@/lib/supabase';
import { ClipboardList } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface SurveyResponse {
    id: string;
    user_id: string;
    training_id: number;
    completed_at: string;
    profiles: {
        full_name: string;
    } | null;
    trainings: {
        title: string;
        topic: string;
    } | null;
}

export default function SurveyResponsesPage() {
    const [responses, setResponses] = useState<SurveyResponse[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResponses();
    }, []);

    async function fetchResponses() {
        try {
            const { data, error } = await supabase
                .from('training_survey_responses')
                .select(`
                    id,
                    user_id,
                    training_id,
                    completed_at,
                    profiles (
                        full_name
                    ),
                    trainings (
                        title,
                        topic
                    )
                `)
                .order('completed_at', { ascending: false });

            if (error) {
                console.error('Query error:', error);
                throw error;
            }
            setResponses(data as any[] || []);
        } catch (error) {
            console.error('Error fetching responses:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="p-8">
            <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Anket Yanıtları</h1>
                <p className="text-gray-500">Kullanıcıların içerik anketlerine verdikleri yanıtlar.</p>
            </div>

            <div className="grid gap-4">
                {responses.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                        <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Henüz yanıt yok</h3>
                        <p className="text-gray-500">Anket yanıtları burada görünecek.</p>
                    </div>
                ) : (
                    responses.map((response) => (
                        <Link
                            href={`/surveys/${response.id}`}
                            key={response.id}
                            className="block bg-white rounded-xl border border-gray-100 p-6 transition-all hover:border-red-200 hover:shadow-sm"
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center bg-red-50 text-red-600">
                                        <ClipboardList size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg mb-1 text-gray-900">
                                            {response.trainings?.title || 'İçerik'}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="font-medium text-gray-900">{response.profiles?.full_name || 'Anonim'}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{new Date(response.completed_at).toLocaleDateString('tr-TR', {
                                                day: 'numeric',
                                                month: 'short',
                                                year: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {response.trainings?.topic && (
                                        <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full">
                                            {response.trainings.topic}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
