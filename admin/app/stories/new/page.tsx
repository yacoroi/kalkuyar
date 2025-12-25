'use client';

import { supabase } from '@/lib/supabase';
import { ArrowLeft, Loader2, Upload, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';

export default function NewStoryPage() {
    const router = useRouter();
    const [uploading, setUploading] = useState(false);
    const [mediaFile, setMediaFile] = useState<File | null>(null);
    const [mediaPreview, setMediaPreview] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [caption, setCaption] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        const type = file.type.startsWith('video/') ? 'video' : 'image';

        // Validate size (e.g. max 50MB for video, 10MB for image) - Optional check
        if (file.size > 50 * 1024 * 1024) {
            alert('Dosya boyutu çok büyük (Maks 50MB).');
            return;
        }

        setMediaFile(file);
        setMediaType(type);
        setMediaPreview(URL.createObjectURL(file));
    };

    const clearSelection = () => {
        setMediaFile(null);
        setMediaPreview(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mediaFile) return;

        setUploading(true);
        try {
            // 1. Upload File
            const fileExt = mediaFile.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('stories')
                .upload(filePath, mediaFile);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('stories')
                .getPublicUrl(filePath);

            // 3. Insert into Database
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Oturum bulunamadı');

            const { error: insertError } = await supabase
                .from('stories')
                .insert({
                    user_id: user.id,
                    media_url: publicUrl,
                    media_type: mediaType,
                    caption: caption || null,
                    // expires_at is default 24h
                });

            if (insertError) throw insertError;

            router.push('/stories');

        } catch (error) {
            console.error('Error uploading story:', error);
            alert('Hikaye yüklenirken bir hata oluştu.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto pb-12">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/stories" className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors shadow-sm text-gray-600">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Yeni Hikaye Paylaş</h1>
                    <p className="text-gray-500 text-sm">Resim veya video yükleyin.</p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Media Upload Area */}
                    {!mediaPreview ? (
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer hover:border-red-300 hover:bg-red-50/30 transition-all group aspect-[9/16] max-w-[320px] mx-auto bg-gray-50"
                        >
                            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-red-600">
                                <Upload size={32} />
                            </div>
                            <p className="font-bold text-gray-900 mb-2">Medya Seçin</p>
                            <p className="text-sm text-gray-500 text-center px-4">
                                Dokunarak veya sürükleyerek fotoğraf veya video yükleyin
                            </p>
                        </div>
                    ) : (
                        <div className="relative aspect-[9/16] max-w-[320px] mx-auto rounded-2xl overflow-hidden shadow-lg bg-black group">
                            {mediaType === 'video' ? (
                                <video src={mediaPreview} className="w-full h-full object-cover" controls />
                            ) : (
                                <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                            )}
                            <button
                                type="button"
                                onClick={clearSelection}
                                className="absolute top-4 right-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>
                    )}

                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*,video/*"
                        onChange={handleFileSelect}
                    />

                    {/* Caption Input */}
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                            Açıklama (Opsiyonel)
                        </label>
                        <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Hikayeniz için kısa bir açıklama..."
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all resize-none h-24"
                        />
                    </div>

                    <div className="pt-4 flex justify-end">
                        <button
                            type="submit"
                            disabled={!mediaFile || uploading}
                            className={`px-8 py-3 rounded-xl font-bold text-white flex items-center gap-2 transition-all ${!mediaFile || uploading
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-red-500/30'
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 size={20} className="animate-spin" />
                                    Paylaşılıyor...
                                </>
                            ) : (
                                <>
                                    <Upload size={20} />
                                    Hikayeyi Paylaş
                                </>
                            )}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
