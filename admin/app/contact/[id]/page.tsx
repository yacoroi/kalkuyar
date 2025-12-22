'use client';

import { supabase } from '@/lib/supabase';
import { ArrowLeft, Calendar, FileText, MapPin, Phone, Trash2, User } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MessageDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [message, setMessage] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Profile Modal or Expanded View State
    // We can just show profile info directly in a card on the side or top

    useEffect(() => {
        if (id) fetchMessage();
    }, [id]);

    const fetchMessage = async () => {
        try {
            const { data, error } = await supabase
                .from('contact_messages')
                .select(`
                    *,
                    profiles (
                        full_name,
                        city,
                        district,
                        neighborhood,
                        role,
                        points,
                        avatar_url,
                        phone
                    )
                `)
                .eq('id', id)
                .single();

            if (error) throw error;
            setMessage(data);

            // Mark as read if unread
            if (data && data.status === 'unread') {
                await supabase.from('contact_messages').update({ status: 'read' }).eq('id', id);
            }
        } catch (error) {
            console.error(error);
            alert('Mesaj bulunamadı.');
            router.push('/contact');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;

        const { error } = await supabase.from('contact_messages').delete().eq('id', id);
        if (!error) {
            router.push('/contact');
        } else {
            alert('Silme işlemi başarısız.');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
        </div>
    );

    if (!message) return null;

    return (
        <div className="max-w-5xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <Link href="/contact" className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mesaj Detayı</h1>
                        <p className="text-gray-500 text-sm">Geri bildirim detayları görüntüleniyor.</p>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    className="text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors border border-transparent hover:border-red-100"
                >
                    <Trash2 size={18} />
                    Mesajı Sil
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Message Content */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-600">
                                <FileText size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">{message.subject}</h2>
                                <span className="text-sm text-gray-500 flex items-center gap-2">
                                    <Calendar size={14} />
                                    {new Date(message.created_at).toLocaleString('tr-TR')}
                                </span>
                            </div>
                        </div>

                        <div className="prose prose-red max-w-none">
                            <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-lg">
                                {message.message}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sender Profile */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm sticky top-8">
                        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-6">Gönderen Bilgileri</h3>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 overflow-hidden border-2 border-white shadow-sm">
                                {message.profiles?.avatar_url ? (
                                    <img src={message.profiles.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={32} />
                                )}
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-gray-900">{message.profiles?.full_name || 'Bilinmeyen Kullanıcı'}</h4>
                                <span className="inline-flex items-center px-2 py-1 rounded bg-red-50 text-red-700 text-xs font-bold capitalize">
                                    {message.profiles?.role === 'member' ? 'Kullanıcı' : message.profiles?.role || 'Üye'}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                                <MapPin size={20} className="text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500 font-bold uppercase">Lokasyon</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {message.profiles?.district}/{message.profiles?.city}
                                    </p>
                                    <p className="text-xs text-gray-500">{message.profiles?.neighborhood}</p>
                                </div>
                            </div>

                            {/* Phone Info */}
                            <div className="flex items-center gap-3 p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                                <div className="text-blue-600 font-bold text-lg w-8 text-center flex justify-center">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs text-blue-700 font-bold uppercase">Telefon</p>
                                    <a href={`tel:${message.profiles?.phone}`} className="text-sm font-medium text-blue-900 hover:underline">
                                        {message.profiles?.phone || 'Belirtilmemiş'}
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
