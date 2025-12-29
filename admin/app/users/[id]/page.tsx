'use client';

import { supabase } from "@/lib/supabase";
import { ArrowLeft, Award, Calendar, FileText, MapPin, MessageSquare, Phone, Trophy, User } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface UserProfile {
    id: string;
    full_name: string | null;
    phone: string | null;
    city: string | null;
    district: string | null;
    neighborhood: string | null;
    topics: string[] | null;
    role: 'member' | 'admin' | 'district_head';
    points: number;
    avatar_url: string | null;
    season_contacts: number;
    season_target: number;
    created_at: string;
}

interface Report {
    id: string;
    topic: string;
    contact_type: string;
    reaction: string;
    people_count: number;
    feedback_note: string | null;
    created_at: string;
}

interface SurveyResponse {
    id: string;
    training_id: number;
    answers: Record<string, any>;
    created_at: string;
    training: {
        title: string;
        topic: string;
    };
}

interface RankingInfo {
    neighborhood_rank: number | null;
    district_rank: number | null;
    city_rank: number | null;
}

export default function UserDetailPage() {
    const params = useParams();
    const userId = params.id as string;

    const [user, setUser] = useState<UserProfile | null>(null);
    const [reports, setReports] = useState<Report[]>([]);
    const [surveys, setSurveys] = useState<SurveyResponse[]>([]);
    const [rankings, setRankings] = useState<RankingInfo>({ neighborhood_rank: null, district_rank: null, city_rank: null });
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'reports' | 'surveys'>('reports');

    useEffect(() => {
        if (userId) {
            fetchUserData();
        }
    }, [userId]);

    async function fetchUserData() {
        setLoading(true);
        try {
            // Fetch user profile
            const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (userError) throw userError;
            setUser(userData);

            // Fetch reports
            const { data: reportsData } = await supabase
                .from('reports')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            setReports(reportsData || []);

            // Fetch survey responses with training info
            const { data: surveysData } = await supabase
                .from('survey_responses')
                .select(`
                    id,
                    training_id,
                    answers,
                    created_at,
                    trainings!inner (
                        title,
                        topic
                    )
                `)
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // Transform the data
            const transformedSurveys = (surveysData || []).map((s: any) => ({
                ...s,
                training: s.trainings
            }));
            setSurveys(transformedSurveys);

            // Calculate rankings
            if (userData) {
                await calculateRankings(userData);
            }

        } catch (error) {
            console.error('Error fetching user data:', error);
        } finally {
            setLoading(false);
        }
    }

    async function calculateRankings(userData: UserProfile) {
        try {
            // City rank
            const { data: cityData } = await supabase
                .from('profiles')
                .select('id')
                .eq('city', userData.city)
                .gt('points', userData.points);

            const cityRank = (cityData?.length || 0) + 1;

            // District rank
            const { data: districtData } = await supabase
                .from('profiles')
                .select('id')
                .eq('district', userData.district)
                .gt('points', userData.points);

            const districtRank = (districtData?.length || 0) + 1;

            // Neighborhood rank
            const { data: neighborhoodData } = await supabase
                .from('profiles')
                .select('id')
                .eq('neighborhood', userData.neighborhood)
                .gt('points', userData.points);

            const neighborhoodRank = (neighborhoodData?.length || 0) + 1;

            setRankings({
                neighborhood_rank: neighborhoodRank,
                district_rank: districtRank,
                city_rank: cityRank
            });
        } catch (error) {
            console.error('Error calculating rankings:', error);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="text-center py-20">
                <p className="text-gray-500">Kullanıcı bulunamadı.</p>
                <Link href="/users" className="text-red-600 hover:underline mt-4 inline-block">
                    ← Kullanıcılara Dön
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Back Button */}
            <Link href="/users" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft size={20} />
                <span>Kullanıcılara Dön</span>
            </Link>

            {/* User Profile Card */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Avatar */}
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                        {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name || 'Kullanıcı'} className="w-full h-full object-cover" />
                        ) : (
                            <User size={40} className="text-gray-400" />
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 space-y-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{user.full_name || 'İsimsiz Kullanıcı'}</h1>
                            <p className="text-gray-500">{user.role === 'district_head' ? 'İlçe Başkanı' : user.role === 'admin' ? 'Admin' : 'Kullanıcı'}</p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                                <Phone size={16} />
                                <span>{user.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <MapPin size={16} />
                                <span>{user.district}, {user.neighborhood}</span>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600">
                                <Calendar size={16} />
                                <span>Kayıt: {new Date(user.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </div>

                        {/* Topics */}
                        <div className="flex flex-wrap gap-2">
                            {user.topics?.map((t) => (
                                <span key={t} className="bg-red-50 text-red-600 px-3 py-1 rounded-full text-xs font-medium">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100">
                    <div className="flex items-center gap-2 text-yellow-700 mb-2">
                        <Trophy size={18} />
                        <span className="text-sm font-medium">Puan</span>
                    </div>
                    <p className="text-2xl font-bold text-yellow-800">{user.points}</p>
                </div>

                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <div className="flex items-center gap-2 text-green-700 mb-2">
                        <FileText size={18} />
                        <span className="text-sm font-medium">Rapor</span>
                    </div>
                    <p className="text-2xl font-bold text-green-800">{reports.length}</p>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <div className="flex items-center gap-2 text-blue-700 mb-2">
                        <Award size={18} />
                        <span className="text-sm font-medium">Mahalle Sırası</span>
                    </div>
                    <p className="text-2xl font-bold text-blue-800">#{rankings.neighborhood_rank || '-'}</p>
                </div>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                        <Award size={18} />
                        <span className="text-sm font-medium">İlçe Sırası</span>
                    </div>
                    <p className="text-2xl font-bold text-purple-800">#{rankings.district_rank || '-'}</p>
                </div>

                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-700 mb-2">
                        <Award size={18} />
                        <span className="text-sm font-medium">İl Sırası</span>
                    </div>
                    <p className="text-2xl font-bold text-orange-800">#{rankings.city_rank || '-'}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'reports'
                                ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <FileText size={16} className="inline mr-2" />
                        Raporlar ({reports.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('surveys')}
                        className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${activeTab === 'surveys'
                                ? 'text-red-600 border-b-2 border-red-600 bg-red-50/50'
                                : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <MessageSquare size={16} className="inline mr-2" />
                        Anket Yanıtları ({surveys.length})
                    </button>
                </div>

                <div className="p-6">
                    {activeTab === 'reports' && (
                        <div className="space-y-4">
                            {reports.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Henüz rapor yok.</p>
                            ) : (
                                reports.map((report) => (
                                    <div key={report.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-md text-xs font-medium">
                                                {report.topic}
                                            </span>
                                            <span className="text-xs text-gray-400">
                                                {new Date(report.created_at).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mt-3">
                                            <div>
                                                <span className="text-gray-400">Muhatap:</span> {report.contact_type}
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Tepki:</span> {report.reaction}
                                            </div>
                                            <div>
                                                <span className="text-gray-400">Kişi:</span> {report.people_count}
                                            </div>
                                        </div>
                                        {report.feedback_note && (
                                            <p className="text-sm text-gray-500 mt-3 italic">"{report.feedback_note}"</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === 'surveys' && (
                        <div className="space-y-4">
                            {surveys.length === 0 ? (
                                <p className="text-gray-500 text-center py-8">Henüz anket yanıtı yok.</p>
                            ) : (
                                surveys.map((survey) => (
                                    <div key={survey.id} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <h4 className="font-medium text-gray-900">{survey.training?.title || 'Eğitim'}</h4>
                                                <span className="text-xs text-gray-500">{survey.training?.topic}</span>
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {new Date(survey.created_at).toLocaleDateString('tr-TR')}
                                            </span>
                                        </div>
                                        <div className="mt-3 space-y-2">
                                            {Object.entries(survey.answers || {}).map(([question, answer]) => (
                                                <div key={question} className="text-sm">
                                                    <span className="text-gray-400">{question}:</span>{' '}
                                                    <span className="text-gray-700">{String(answer)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
