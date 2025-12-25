'use client';

import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, ClipboardList, MapPin, Phone, Star, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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
        city: string | null;
        district: string | null;
        neighborhood: string | null;
        role: string | null;
        avatar_url: string | null;
        phone: string | null;
    } | null;
    trainings: {
        title: string;
        topic: string;
        survey_questions: SurveyQuestion[];
    } | null;
}

export default function SurveyDetailPage() {
    const params = useParams();
    const router = useRouter();
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
                        full_name,
                        city,
                        district,
                        neighborhood,
                        role,
                        avatar_url,
                        phone
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
            router.push('/surveys');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async () => {
        if (!confirm('Bu anket yanıtını silmek istediğinize emin misiniz?')) return;

        const { error } = await supabase.from('training_survey_responses').delete().eq('id', id);
        if (!error) {
            router.push('/surveys');
        } else {
            alert('Silme işlemi başarısız.');
        }
    };

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
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!response) return null;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/surveys" className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Anket Yanıtı</h1>
                        <p className="text-gray-500 text-sm">Anket yanıt detayları görüntüleniyor.</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors border border-transparent hover:border-red-100"
                >
                    <Trash2 size={18} />
                    Yanıtı Sil
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Survey Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                <ClipboardList size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{response.trainings?.title}</h2>
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(response.completed_at).toLocaleString('tr-TR')}
                                </span>
                            </div>
                        </div>

                        {response.trainings?.topic && (
                            <div className="mb-6">
                                <span className="bg-red-50 text-red-600 px-3 py-1 rounded-lg font-medium text-sm">
                                    {response.trainings.topic}
                                </span>
                            </div>
                        )}

                        {/* Answers */}
                        <div className="space-y-6">
                            {response.trainings?.survey_questions?.map((question, index) => {
                                const answer = response.responses[question.id];
                                return (
                                    <div key={question.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                                        <p className="text-sm font-medium text-gray-500 mb-3">
                                            {index + 1}. {question.question}
                                        </p>
                                        {question.type === 'rating' ? (
                                            <div className="flex items-center gap-3">
                                                {renderStars(answer as number)}
                                                <span className="text-gray-400">({answer}/5)</span>
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                                                {answer || <span className="text-gray-400 italic">Cevap verilmedi</span>}
                                            </p>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Column: Respondent Profile */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Yanıtlayan Bilgileri</h3>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border-2 border-white shadow-sm">
                                {response.profiles?.avatar_url ? (
                                    <img src={response.profiles.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">{response.profiles?.full_name || 'Anonim'}</h4>
                                <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-bold capitalize">
                                    {response.profiles?.role === 'member' ? 'Kullanıcı' : response.profiles?.role || 'Üye'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <MapPin size={20} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Lokasyon</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {response.profiles?.district}/{response.profiles?.city}
                                    </p>
                                    <p className="text-xs text-gray-500">{response.profiles?.neighborhood}</p>
                                </div>
                            </div>

                            {/* Phone Info */}
                            <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                <div className="text-blue-600 font-bold text-lg w-8 text-center flex justify-center">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 font-bold uppercase">Telefon</p>
                                    <a href={`tel:${response.profiles?.phone}`} className="text-sm font-medium text-blue-900 hover:underline">
                                        {response.profiles?.phone || 'Belirtilmemiş'}
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
