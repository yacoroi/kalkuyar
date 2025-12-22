'use client';

import { supabase } from '@/lib/supabase';
import { Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ContactMessage {
    id: string;
    user_id: string;
    subject: string;
    message: string;
    status: 'unread' | 'read' | 'replied';
    created_at: string;
    profiles: {
        full_name: string | null;
    } | null;
}

export default function ContactMessagesPage() {
    const [messages, setMessages] = useState<ContactMessage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('contact_messages')
            .select(`
                *,
                profiles (full_name)
            `)
            .order('created_at', { ascending: false });

        if (!error && data) {
            setMessages(data);
        }
        setLoading(false);
    };

    const updateStatus = async (id: string, status: string) => {
        await supabase
            .from('contact_messages')
            .update({ status })
            .eq('id', id);
        fetchMessages();
    };

    const deleteMessage = async (id: string) => {
        if (!window.confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
        await supabase
            .from('contact_messages')
            .delete()
            .eq('id', id);
        fetchMessages();
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
                <h1 className="text-2xl font-bold text-gray-900">Geri Bildirim Kutusu</h1>
                <p className="text-gray-500">Kullanıcılardan gelen görüş ve öneriler.</p>
            </div>

            <div className="grid gap-4">
                {messages.length === 0 ? (
                    <div className="bg-white p-12 rounded-2xl border border-gray-100 text-center">
                        <Mail className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Henüz mesaj yok</h3>
                        <p className="text-gray-500">Gelen kutunuz boş görünüyor.</p>
                    </div>
                ) : (
                    messages.map((msg) => (
                        <Link
                            href={`/contact/${msg.id}`}
                            key={msg.id}
                            className={`block bg-white rounded-xl border p-6 transition-all hover:border-red-200 hover:shadow-sm ${msg.status === 'unread' ? 'border-red-100 shadow-sm ring-1 ring-red-50' : 'border-gray-100'}`}
                        >
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center transition-colors ${msg.status === 'unread' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-400'}`}>
                                        <Mail size={24} />
                                    </div>
                                    <div>
                                        <h3 className={`font-bold text-lg mb-1 ${msg.status === 'unread' ? 'text-gray-900' : 'text-gray-600'}`}>
                                            {msg.subject}
                                        </h3>
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <span className="font-medium text-gray-900">{msg.profiles?.full_name}</span>
                                            <span className="text-gray-300">•</span>
                                            <span>{new Date(msg.created_at).toLocaleDateString('tr-TR')}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    {msg.status === 'unread' && (
                                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full">Okunmadı</span>
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
