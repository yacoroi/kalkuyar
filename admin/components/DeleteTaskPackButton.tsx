'use client';

import { supabase } from '@/lib/supabase';
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function DeleteTaskPackButton({ packId }: { packId: string }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        if (!confirm('Bu görev paketini ve ilişkili tüm atamaları silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) {
            return;
        }

        setLoading(true);
        try {
            // 1. Delete associated reports (if any - cascading might handle this but better safe)
            // Ideally rely on CASACADE DELETE in DB, but if not set up:
            // For now, let's assume partial constraints. We try to delete the pack.
            // If tasks have foreign key to pack with cascade, tasks go.

            // First delete tasks explicitly to be safe if no cascade
            const { error: tasksError } = await supabase
                .from('tasks')
                .delete()
                .eq('content_pack_id', packId);

            if (tasksError) throw tasksError;

            // Then delete the pack
            const { error } = await supabase
                .from('content_packs')
                .delete()
                .eq('id', packId);

            if (error) throw error;

            router.refresh();
        } catch (error: any) {
            alert('Silme işlemi başarısız: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={loading}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Paketi Sil"
        >
            <Trash2 size={20} />
        </button>
    );
}
