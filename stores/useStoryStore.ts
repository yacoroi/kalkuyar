import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Story {
    id: string;
    user_id: string;
    media_url: string;
    media_type: 'image' | 'video';
    caption: string | null;
    created_at: string;
    expires_at: string;
    duration?: number;
}

interface StoryGroup {
    user_id: string;
    username: string;
    avatar_url: string | null;
    items: Story[];
    allViewed: boolean;
}

interface StoryState {
    storyGroups: StoryGroup[];
    loading: boolean;
    viewedStoryIds: Set<string>;
    fetchStories: () => Promise<void>;
    markAsViewed: (storyId: string) => Promise<void>;
}

export const useStoryStore = create<StoryState>((set, get) => ({
    storyGroups: [],
    loading: false,
    viewedStoryIds: new Set(),

    fetchStories: async () => {
        set({ loading: true });
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data: stories, error } = await supabase
                .from('stories')
                .select('*')
                .gt('expires_at', new Date().toISOString())
                .order('created_at', { ascending: false }); // En yeni en solda

            if (error) throw error;

            if (!stories || stories.length === 0) {
                set({ storyGroups: [], loading: false });
                return;
            }

            const { data: views } = await supabase
                .from('story_views')
                .select('story_id')
                .eq('viewer_id', user.id);

            const viewedIds = new Set(views?.map(v => v.story_id) || []);
            set({ viewedStoryIds: viewedIds });

            // Her hikaye için ayrı bir grup oluştur (tek bir daire olarak gösterilecek)
            const groups: StoryGroup[] = stories.map(story => {
                return {
                    user_id: story.id, // Unique identifier olarak story id kullan
                    username: '',
                    avatar_url: null,
                    items: [story], // Her grupta sadece 1 hikaye
                    allViewed: viewedIds.has(story.id)
                };
            });

            set({ storyGroups: groups });

        } catch (error) {
            console.error('Error fetching stories:', error);
        } finally {
            set({ loading: false });
        }
    },

    markAsViewed: async (storyId: string) => {
        const { viewedStoryIds, storyGroups } = get();
        if (viewedStoryIds.has(storyId)) return;

        const newViewedIds = new Set(viewedStoryIds);
        newViewedIds.add(storyId);

        const newGroups = storyGroups.map(group => ({
            ...group,
            allViewed: group.items.every(item => newViewedIds.has(item.id))
        }));

        set({ viewedStoryIds: newViewedIds, storyGroups: newGroups });

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase.from('story_views').insert({
                    story_id: storyId,
                    viewer_id: user.id
                });

                if (error && error.code !== '23505') {
                    console.error('Error inserting view:', error);
                }
            }
        } catch (error) {
            console.error('Error marking story as viewed:', error);
        }
    }
}));
