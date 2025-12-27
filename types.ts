export interface Profile {
    id: string;
    full_name: string | null;
    city: string | null;
    district: string | null;
    neighborhood: string | null;
    topics: string[] | null;
    role: 'member' | 'admin' | 'district_head';
    points: number;
    streak_days: number;
    last_report_date: string | null;
    avatar_url: string | null;
    created_at: string;
    season_contacts?: number;
    season_target?: number;
    tc_kimlik: string | null;
    referans_kodu: string | null;
}

export interface SurveyQuestion {
    q: string;
    type: 'text' | 'boolean' | 'multiple_choice';
    options?: string[];
}

export interface ContentPack {
    id: number;
    week_number: number | null;
    topic: string | null;
    title: string | null;
    message_framework: string | null;
    key_sentences: string[] | null;
    survey_questions: SurveyQuestion[] | null;
    media_url: string | null;
    image_url: string | null;
    audio_url?: string | null;
    start_date: string | null;
    end_date: string | null;
    is_active: boolean;
    created_at: string;
}

export interface Task {
    id: number;
    user_id: string;
    content_pack_id: number;
    status: 'pending' | 'completed';
    assigned_at: string;
    completed_at: string | null;
}

export interface Report {
    id: number;
    task_id: number;
    user_id: string;
    contact_type: string | null;
    reaction: string | null;
    feedback_note: string | null;
    location_lat: number | null;
    location_lng: number | null;
    created_at: string;
}

export interface News {
    id: string;
    title: string;
    url: string;
    image_url: string | null;
    summary: string | null;
    content: string | null;
    published_at: string;
    created_at: string;
    is_active: boolean;
}
