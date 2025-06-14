import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export type Database = {
  public: {
    Tables: {
      lost_found_posts: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: 'lost' | 'found';
          location: string | null;
          contact_info: string | null;
          image_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: 'lost' | 'found';
          location?: string | null;
          contact_info?: string | null;
          image_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: 'lost' | 'found';
          location?: string | null;
          contact_info?: string | null;
          image_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      job_posts: {
        Row: {
          id: string;
          title: string;
          description: string;
          type: 'offer' | 'request';
          location: string | null;
          contact_info: string | null;
          salary_range: string | null;
          image_url: string | null;
          user_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description: string;
          type: 'offer' | 'request';
          location?: string | null;
          contact_info?: string | null;
          salary_range?: string | null;
          image_url?: string | null;
          user_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string;
          type?: 'offer' | 'request';
          location?: string | null;
          contact_info?: string | null;
          salary_range?: string | null;
          image_url?: string | null;
          user_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      news_posts: {
        Row: {
          id: string;
          title: string;
          content: string;
          image_url: string | null;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          content: string;
          image_url?: string | null;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          content?: string;
          image_url?: string | null;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
