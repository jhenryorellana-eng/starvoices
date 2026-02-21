export interface Pack {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  category: string;
  audio_count: number;
  is_featured: boolean;
  is_published: boolean;
  sort_order: number;
  created_at: string;
}

export interface Audio {
  id: string;
  pack_id: string;
  title: string;
  description: string | null;
  audio_url: string;
  cover_url: string | null;
  duration_seconds: number;
  tags: string[];
  sort_order: number;
  is_preview: boolean;
  is_published: boolean;
  created_at: string;
  pack?: Pack;
}

export interface Favorite {
  id: string;
  user_id: string;
  audio_id: string;
  created_at: string;
  audio?: Audio;
}

export interface ListenProgress {
  id: string;
  user_id: string;
  audio_id: string;
  progress_seconds: number;
  completed: boolean;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  code: string;
  familyId: string;
}

export type PackCategory = 'comunicacion' | 'tecnologia' | 'emocional' | 'educacion' | 'relaciones' | 'bienestar';
