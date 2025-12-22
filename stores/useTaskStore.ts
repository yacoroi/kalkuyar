import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ContentPack, Task } from '../types';

interface TaskWithContent extends Task {
    content_packs: ContentPack;
}

interface TaskState {
    activeTasks: TaskWithContent[];
    loading: boolean;
    error: string | null;
    fetchActiveTasks: (userId: string, userTopics?: string[] | null) => Promise<void>;
}

export const useTaskStore = create<TaskState>((set) => ({
    activeTasks: [],
    loading: false,
    error: null,
    fetchActiveTasks: async (userId: string, userTopics?: string[] | null) => {
        set({ loading: true, error: null });
        try {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

            // Fetch pending tasks with content packs
            const { data, error } = await supabase
                .from('tasks')
                .select(`
                  *,
                  content_packs (
                    id,
                    title,
                    topic,
                    message_framework,
                    image_url,
                    start_date,
                    end_date
                  )
                `)
                .eq('user_id', userId)
                .eq('status', 'pending');

            if (error) {
                console.error('Error fetching tasks:', error);
                set({ activeTasks: [], error: error.message });
                return;
            }

            if (!data || data.length === 0) {
                set({ activeTasks: [], error: null });
                return;
            }

            // Filter valid tasks by date (nested join filter not supported in Supabase)
            const validByDate = data.filter((task): task is TaskWithContent => {
                const pack = task.content_packs as ContentPack | null;
                if (!pack || !pack.start_date || !pack.end_date) return false;
                return pack.start_date <= today && pack.end_date >= today;
            });

            // Filter by user topics if provided
            const finalTasks = userTopics
                ? validByDate.filter((task) => {
                    const taskTopic = task.content_packs.topic;
                    // If no topic or 'Genel', allow it
                    if (!taskTopic || taskTopic === 'Genel') return true;
                    // Otherwise check if user has this topic
                    return userTopics.includes(taskTopic);
                })
                : validByDate;

            set({ activeTasks: finalTasks, error: null });
        } catch (e) {
            const errorMessage = e instanceof Error ? e.message : 'Bilinmeyen hata';
            console.error('Exception fetching task:', e);
            set({ activeTasks: [], error: errorMessage });
        } finally {
            set({ loading: false });
        }
    },
}));

