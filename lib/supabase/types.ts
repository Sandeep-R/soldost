/**
 * IMPORTANT: This file is auto-generated from Supabase schema.
 *
 * To regenerate after schema changes:
 *   supabase gen types typescript --schema public > lib/supabase/types.ts
 *
 * For now, this is a stub with common types. Run the command above to populate.
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          user_id: string;
          auth_id: string | null;
          whatsapp_phone_number: string;
          display_name: string;
          base_language: string;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      groups: {
        Row: {
          group_id: string;
          whatsapp_group_id: string;
          learner_id: string;
          teacher_id: string;
          target_language: string;
          base_language: string;
          difficulty_level: 'beginner' | 'intermediate' | 'advanced';
          daily_delivery_time: string;
          status: 'onboarding' | 'active' | 'paused' | 'completed';
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['groups']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['groups']['Insert']>;
      };
      words: {
        Row: {
          word_id: string;
          language: string;
          word_text_roman: string;
          meaning: string;
          part_of_speech: 'noun' | 'verb' | 'adjective';
          difficulty_level: 'beginner' | 'intermediate' | 'advanced';
          example_sentence: string | null;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['words']['Row'], 'created_at'>;
        Update: Partial<Database['public']['Tables']['words']['Insert']>;
      };
      learning_loops: {
        Row: {
          loop_id: string;
          group_id: string;
          daily_word_set_id: string;
          date: string;
          status:
            | 'pending_sentence'
            | 'pending_teacher_reply'
            | 'pending_translation'
            | 'evaluating_translation'
            | 'pending_learner_reply'
            | 'evaluating_reply'
            | 'completed'
            | 'expired';
          streak_counted: boolean;
          started_at: string;
          completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['learning_loops']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['learning_loops']['Insert']>;
      };
      streaks: {
        Row: {
          streak_id: string;
          group_id: string;
          current_streak: number;
          longest_streak: number;
          last_completed_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['streaks']['Row'], 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['streaks']['Insert']>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      execute_sql: {
        Args: {
          sql: string;
        };
        Returns: unknown;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}

/**
 * Helper types for common queries
 */
export type User = Database['public']['Tables']['users']['Row'];
export type Group = Database['public']['Tables']['groups']['Row'];
export type Word = Database['public']['Tables']['words']['Row'];
export type LearningLoop = Database['public']['Tables']['learning_loops']['Row'];
export type Streak = Database['public']['Tables']['streaks']['Row'];
