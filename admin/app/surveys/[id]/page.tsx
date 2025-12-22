'use client';

import { supabase } from '@/lib/supabase';
import { ArrowLeft, Star, User } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface SurveyQuestion {
    id: string;
    question: string;
    type: 'text' | 'rating';
}

interface SurveyResponse {
    id: string;
    user_id: string;
    training_id: number;
    responses: Record<string, string | number>;
    completed_at: string;
    profiles: {
        full_name: string;
    } | null;
    trainings: {
        title: string;
        topic: string;
        survey_questions: SurveyQuestion[];
    } | null;
}

export default function SurveyDetailPage() {
    const params = useParams();
    const id = params.id;
    const [response, setResponse] = useState<SurveyResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchResponse();
    }, [id]);

    async function fetchResponse() {
        try {
            const { data, error } = await supabase
                .from('training_survey_responses')
                .select(`
                    id,
                    user_id,
                    training_id,
                    responses,
                    completed_at,
                    profiles (
                        full_name
                    ),
                    trainings (
                        title,
                        topic,
                        survey_questions
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setResponse(data as any);
        } catch (error) {
            console.error('Error fetching response:', error);
        } finally {
            setLoading(false);
        }
    }

    const renderStars = (rating: number) => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={20}
                        className={star <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
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
    }

    if (!response) {
        return (
            <div className="p-8">
                <p className="text-gray-500">Yanıt bulunamadı.</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-8">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/surveys" className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                    <ArrowLeft size={20} />
                </Link>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Anket Yanıtı</h1>
                    <p className="text-gray-500 text-sm">{response.trainings?.title}</p>
                </div>
            </div>

            {/* User Info Card */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center">
                        <User size={28} className="text-red-600" />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg text-gray-900">{response.profiles?.full_name || 'Anonim'}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            {response.trainings?.topic && (
                                <>
                                    <span className="bg-red-50 text-red-600 px-2 py-0.5 rounded font-medium">{response.trainings.topic}</span>
                                    <span className="text-gray-300">•</span>
                                </>
                            )}
                            <span>{new Date(response.completed_at).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Answers */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h3 className="font-bold text-gray-900">Yanıtlar</h3>
                </div>
                <div className="divide-y divide-gray-100">
                    {response.trainings?.survey_questions?.map((question, index) => {
                        const answer = response.responses[question.id];
                        return (
                            <div key={question.id} className="p-6">
                                <p className="text-sm font-medium text-gray-500 mb-2">
                                    {index + 1}. {question.question}
                                </p>
                                {question.type === 'rating' ? (
                                    <div className="flex items-center gap-3">
                                        {renderStars(answer as number)}
                                        <span className="text-gray-400">({answer}/5)</span>
                                    </div>
                                ) : (
                                    <p className="text-gray-900 text-lg">
                                        {answer || <span className="text-gray-400 italic">Cevap verilmedi</span>}
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
