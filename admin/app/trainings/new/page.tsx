'use client';

import { supabase } from '@/lib/supabase';
import { ArrowLeft, FileAudio, FileText, ImageIcon, Loader2, Plus, Save, Trash2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface SurveyQuestion {
    id: string;
    question: string;
    type: 'text' | 'rating';
}

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
    'Teknoloji'
];

export default function NewTrainingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
    });
    const [topic, setTopic] = useState('');

    // File States
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);

    // Survey Questions State
    const [surveyQuestions, setSurveyQuestions] = useState<SurveyQuestion[]>([]);

    const addSurveyQuestion = () => {
        setSurveyQuestions([
            ...surveyQuestions,
            { id: `q${Date.now()}`, question: '', type: 'text' }
        ]);
    };

    const updateSurveyQuestion = (index: number, field: keyof SurveyQuestion, value: string) => {
        const updated = [...surveyQuestions];
        updated[index] = { ...updated[index], [field]: value };
        setSurveyQuestions(updated);
    };

    const removeSurveyQuestion = (index: number) => {
        setSurveyQuestions(surveyQuestions.filter((_, i) => i !== index));
    };

    const uploadFile = async (file: File, bucket: string) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
            .from(bucket)
            .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from(bucket)
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!topic) {
            alert('Lütfen bir kategori seçiniz.');
            return;
        }


        setLoading(true);

        try {
            // Upload Files
            const mediaUrl = mediaFile ? await uploadFile(mediaFile, 'content_media') : null;
            const imageUrl = imageFile ? await uploadFile(imageFile, 'content_images') : null;
            const audioUrl = audioFile ? await uploadFile(audioFile, 'content_audio') : null;

            // Insert Record
            const { error } = await supabase
                .from('trainings')
                .insert({
                    title: formData.title,
                    topic: topic,
                    description: formData.description,
                    media_url: mediaUrl,
                    image_url: imageUrl,
                    audio_url: audioUrl,
                    survey_questions: surveyQuestions.length > 0 ? surveyQuestions.filter(q => q.question.trim()) : null,
                    is_active: true
                });

            // Note: If you have a separate 'trainings' table, use that. 
            // Based on previous files, 'content_packs' seems to be the main content table.

            if (error) throw error;

            alert('İçerik başarıyla yüklendi.');
            router.push('/trainings');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            alert('Hata: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/trainings" className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Yeni İçerik Ekle</h1>
                    <p className="text-gray-500 text-sm">Eğitim materyali, video, görsel ve ses kaydı ekleyin.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="bg-white p-8 rounded-2xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border border-gray-100">
                    <div className="grid grid-cols-1 gap-6">

                        {/* Title */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Başlık</label>
                            <input
                                type="text" required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all font-medium text-gray-900 bg-gray-50/30 focus:bg-white"
                                placeholder="Örn: Etkili İletişim Teknikleri"
                                value={formData.title}
                                onChange={e => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Category Selection */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Kategori</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                {AVAILABLE_TOPICS.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setTopic(t)}
                                        className={`px-3 py-2 rounded-lg text-sm font-medium transition-all border ${topic === t
                                            ? 'bg-red-50 border-red-200 text-red-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Açıklama / Mesaj Çerçevesi</label>
                            <textarea
                                required
                                className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none min-h-[100px] transition-all text-sm leading-relaxed text-gray-700 bg-gray-50/30 focus:bg-white resize-y"
                                placeholder="İçerik hakkında kısa bilgi..."
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        {/* FILE UPLOADS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            {/* Media (PDF/Video) */}
                            <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-200 transition-colors bg-gray-50/50">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FileText size={16} /> Döküman / Video (Opsiyonel)
                                </label>
                                {mediaFile ? (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                                        <span className="text-sm text-gray-700 truncate">{mediaFile.name}</span>
                                        <button type="button" onClick={() => setMediaFile(null)} className="text-red-500 hover:text-red-700">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-24 cursor-pointer">
                                        <Upload size={24} className="text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Dosya Seç (PDF, MP4)</span>
                                        <input type="file" className="hidden" accept=".pdf,video/*" onChange={e => e.target.files?.[0] && setMediaFile(e.target.files[0])} />
                                    </label>
                                )}
                            </div>

                            {/* Cover Image */}
                            <div className="p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-200 transition-colors bg-gray-50/50">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <ImageIcon size={16} /> Kapak Görseli
                                </label>
                                {imageFile ? (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                                        <span className="text-sm text-gray-700 truncate">{imageFile.name}</span>
                                        <button type="button" onClick={() => setImageFile(null)} className="text-red-500 hover:text-red-700">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-24 cursor-pointer">
                                        <Upload size={24} className="text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Görsel Seç (PNG, JPG)</span>
                                        <input type="file" className="hidden" accept="image/*" onChange={e => e.target.files?.[0] && setImageFile(e.target.files[0])} />
                                    </label>
                                )}
                            </div>

                            {/* Audio File */}
                            <div className="col-span-1 md:col-span-2 p-4 rounded-xl border-2 border-dashed border-gray-200 hover:border-red-200 transition-colors bg-gray-50/50">
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                                    <FileAudio size={16} /> Ses Kaydı (Opsiyonel)
                                </label>
                                {audioFile ? (
                                    <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-red-100">
                                        <span className="text-sm text-gray-700 truncate">{audioFile.name}</span>
                                        <button type="button" onClick={() => setAudioFile(null)} className="text-red-500 hover:text-red-700">
                                            <X size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center h-24 cursor-pointer">
                                        <Upload size={24} className="text-gray-400 mb-2" />
                                        <span className="text-xs text-gray-500">Ses Dosyası Seç (MP3, WAV)</span>
                                        <input type="file" className="hidden" accept="audio/*" onChange={e => e.target.files?.[0] && setAudioFile(e.target.files[0])} />
                                    </label>
                                )}
                            </div>
                        </div>

                        {/* SURVEY QUESTIONS */}
                        <div className="border-t border-gray-100 pt-6 mt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider">Anket Soruları</label>
                                    <p className="text-xs text-gray-400 mt-1">İçerik okunduktan sonra kullanıcıya sorulacak sorular (opsiyonel)</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={addSurveyQuestion}
                                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors"
                                >
                                    <Plus size={16} />
                                    Soru Ekle
                                </button>
                            </div>

                            {surveyQuestions.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    Henüz soru eklenmedi. &quot;Soru Ekle&quot; butonuna tıklayarak başlayın.
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {surveyQuestions.map((q, index) => (
                                        <div key={q.id} className="flex gap-4 items-start p-4 bg-gray-50 rounded-xl border border-gray-100">
                                            <div className="flex-1 space-y-3">
                                                <input
                                                    type="text"
                                                    placeholder="Soru metnini yazın..."
                                                    value={q.question}
                                                    onChange={(e) => updateSurveyQuestion(index, 'question', e.target.value)}
                                                    className="w-full border border-gray-200 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                                />
                                                <select
                                                    value={q.type}
                                                    onChange={(e) => updateSurveyQuestion(index, 'type', e.target.value)}
                                                    className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none"
                                                >
                                                    <option value="text">Açık Uçlu (Yazı)</option>
                                                    <option value="rating">Puanlama (1-5 Yıldız)</option>
                                                </select>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => removeSurveyQuestion(index)}
                                                className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                <div className="pt-4 flex justify-end gap-4">
                    <Link href="/trainings" className="px-6 py-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors">
                        Vazgeç
                    </Link>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-red-600 text-white px-8 py-4 rounded-xl font-bold flex items-center gap-2 hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg hover:shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        İçeriği Kaydet
                    </button>
                </div>
            </form>
        </div>
    );
}
