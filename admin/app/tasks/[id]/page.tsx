'use client';

import { supabase } from '@/lib/supabase';
import { ArrowLeft, CheckCircle2, ListChecks, Loader2, Megaphone, Plus, Save, Trash2, Upload } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function EditTaskPackPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        week_number: '',
        start_date: '',
        end_date: '',
        topic: 'Genel',
        title: '',
        message_framework: '',
        media_url: '',
        image_url: '',
        key_sentences: '',
        survey_questions: ['']
    });

    useEffect(() => {
        async function loadPack() {
            setLoading(true);
            const { data, error } = await supabase
                .from('content_packs')
                .select('*')
                .eq('id', id)
                .single();

            if (error) {
                alert('Görev paketi bulunamadı: ' + error.message);
                router.push('/tasks');
                return;
            }

            if (data) {
                setFormData({
                    week_number: data.week_number.toString(),
                    start_date: data.start_date || '',
                    end_date: data.end_date || '',
                    topic: data.topic || 'Genel',
                    title: data.title || '',
                    message_framework: data.message_framework || '',
                    media_url: data.media_url || '',
                    image_url: data.image_url || '',
                    key_sentences: Array.isArray(data.key_sentences) ? data.key_sentences.join('\n') : (data.key_sentences || ''),
                    survey_questions: Array.isArray(data.survey_questions)
                        ? (data.survey_questions as any[]).map(q => q.q || '')
                        : ['']
                });
            }
            setLoading(false);
        }

        if (id) {
            loadPack();
        }
    }, [id, router]);

    const addQuestion = () => {
        setFormData(prev => ({
            ...prev,
            survey_questions: [...prev.survey_questions, '']
        }));
    };

    const removeQuestion = (index: number) => {
        setFormData(prev => ({
            ...prev,
            survey_questions: prev.survey_questions.filter((_, i) => i !== index)
        }));
    };

    const updateQuestion = (index: number, value: string) => {
        const newQuestions = [...formData.survey_questions];
        newQuestions[index] = value;
        setFormData(prev => ({ ...prev, survey_questions: newQuestions }));
    };

    const uploadFile = async (file: File, bucket: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${uuidv4()}.${fileExt} `;
        const filePath = `${fileName} `;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return data.publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (saving) return;
        setSaving(true);

        try {
            // Upload Files
            let mediaUrl = formData.media_url;
            let imageUrl = formData.image_url;

            if (mediaFile) {
                mediaUrl = await uploadFile(mediaFile, 'content_media');
            }
            if (imageFile) {
                imageUrl = await uploadFile(imageFile, 'content_images');
            }

            const keySentencesArray = formData.key_sentences
                .split('\n')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            const questionsJson = formData.survey_questions
                .filter(q => q.trim().length > 0)
                .map(q => ({ q: q.trim() }));

            const { error: packError } = await supabase
                .from('content_packs')
                .update({
                    week_number: Number(formData.week_number),
                    start_date: formData.start_date,
                    end_date: formData.end_date,
                    topic: formData.topic,
                    title: formData.title,
                    message_framework: formData.message_framework,
                    key_sentences: keySentencesArray,
                    survey_questions: questionsJson,
                    media_url: mediaUrl,
                    image_url: imageUrl,
                })
                .eq('id', id);

            if (packError) throw packError;

            alert('Paket başarıyla güncellendi.');
            router.push('/tasks');
            router.refresh();

        } catch (error: any) {
            alert('Hata: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center p-24">
                <Loader2 className="animate-spin text-red-600" size={32} />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/tasks" className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Görevi Düzenle</h1>
                    <p className="text-gray-500 text-sm">Mevcut paketi güncelleyin.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Section 1: Basic Info */}
                <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Megaphone size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Genel Bilgiler</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Hafta No</label>
                            <input
                                type="number" required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-gray-900 bg-gray-50/30 focus:bg-white"
                                placeholder="42"
                                value={formData.week_number}
                                onChange={e => setFormData({ ...formData, week_number: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Başlangıç</label>
                            <input
                                type="date" required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-gray-900 bg-gray-50/30 focus:bg-white"
                                value={formData.start_date}
                                onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Bitiş</label>
                            <input
                                type="date" required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-gray-900 bg-gray-50/30 focus:bg-white"
                                value={formData.end_date}
                                onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Konu</label>
                            <div className="relative">
                                <select
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-gray-900 bg-gray-50/30 focus:bg-white appearance-none"
                                    value={formData.topic}
                                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                >
                                    <option>Genel</option>
                                    <option>Ekonomi</option>
                                    <option>Adalet</option>
                                    <option>Gençlik</option>
                                    <option>Eğitim</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                            </div>
                        </div>
                        <div className="md:col-span-4">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Paket Başlığı</label>
                            <input
                                type="text" required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-gray-900 bg-gray-50/30 focus:bg-white"
                                placeholder="Örn: Esnaf Ziyaretleri ve Ekonomi Konuşmaları"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">İçerik Medyası (PDF/Video)</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="video/*,application/pdf"
                                    className="hidden"
                                    id="media-upload"
                                    onChange={e => e.target.files && setMediaFile(e.target.files[0])}
                                />
                                <label
                                    htmlFor="media-upload"
                                    className="flex items-center gap-3 w-full border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-red-50 text-red-600 rounded-lg flex items-center justify-center">
                                        <Upload size={20} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {mediaFile ? mediaFile.name : (formData.media_url ? 'Mevcut Dosya (Değiştirmek için tıklayın)' : 'Dosya Seçin')}
                                        </p>
                                        <p className="text-xs text-gray-500">Video veya PDF yükleyin</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                        <div className="md:col-span-1">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kapak Görseli</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="image-upload"
                                    onChange={e => e.target.files && setImageFile(e.target.files[0])}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="flex items-center gap-3 w-full border border-dashed border-gray-300 rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                                        <Upload size={20} />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {imageFile ? imageFile.name : (formData.image_url ? 'Mevcut Görsel (Değiştirmek için tıklayın)' : 'Görsel Seçin')}
                                        </p>
                                        <p className="text-xs text-gray-500">Kapak fotoğrafı yükleyin</p>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2: Communication */}
                <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                            <ListChecks size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Söylem ve İçerik</h2>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Söylem Çerçevesi (Ana Metin)</label>
                            <textarea
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none min-h-[120px] transition-all text-sm leading-relaxed text-gray-700 bg-gray-50/30 focus:bg-white resize-y"
                                placeholder="Sahada kullanılacak temel mesaj ve giriş metni..."
                                value={formData.message_framework}
                                onChange={e => setFormData({ ...formData, message_framework: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Anahtar Cümleler (Satır Satır)</label>
                            <textarea
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none min-h-[120px] transition-all text-sm leading-relaxed text-gray-700 bg-gray-50/30 focus:bg-white resize-y font-mono"
                                placeholder="Örn:&#10;> Ekonomideki bu gidişata dur diyeceğiz.&#10;> Gençler için özel istihdam paketlerimiz hazır."
                                value={formData.key_sentences}
                                onChange={e => setFormData({ ...formData, key_sentences: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3: Interaction */}
                <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="flex items-center gap-3 mb-6 border-b border-gray-50 pb-4">
                        <div className="w-8 h-8 rounded-lg bg-green-50 text-green-600 flex items-center justify-center">
                            <CheckCircle2 size={18} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Saha Soruları</h2>
                    </div>

                    <div className="space-y-3">
                        {formData.survey_questions.map((q, idx) => (
                            <div key={idx} className="flex gap-2 group">
                                <div className="w-8 flex items-center justify-center font-bold text-gray-300 text-sm">#{idx + 1}</div>
                                <input
                                    type="text"
                                    className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all text-gray-700 bg-gray-50/30 focus:bg-white"
                                    placeholder={`Soru metnini giriniz...`}
                                    value={q}
                                    onChange={e => updateQuestion(idx, e.target.value)}
                                />
                                {formData.survey_questions.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeQuestion(idx)}
                                        className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                            </div>
                        ))}
                        <div className="pl-10 mt-2">
                            <button
                                type="button"
                                onClick={addQuestion}
                                className="text-sm bg-gray-50 text-gray-600 font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition-colors border border-gray-200"
                            >
                                <Plus size={16} /> Başka Soru Ekle
                            </button>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <Link href="/tasks" className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                        Vazgeç
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Kaydet
                    </button>
                </div>

            </form>
        </div>
    );
}
