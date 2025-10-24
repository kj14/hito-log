export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      goal_logs: {
        Row: {
          id: string;
          goal_id: string;
          logged_at: string;
          minutes: number;
          note: string | null;
        };
        Insert: {
          id?: string;
          goal_id: string;
          logged_at?: string;
          minutes: number;
          note?: string | null;
        };
        Update: {
          id?: string;
          goal_id?: string;
          logged_at?: string;
          minutes?: number;
          note?: string | null;
        };
      };
      goals: {
        Row: {
          id: string;
          profile_id: string;
          title: string;
          category: string | null;
          target_effort_hours: number;
          target_date: string;
          motivation_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          title: string;
          category?: string | null;
          target_effort_hours: number;
          target_date: string;
          motivation_note?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          title?: string;
          category?: string | null;
          target_effort_hours?: number;
          target_date?: string;
          motivation_note?: string | null;
        };
      };
      life_profiles: {
        Row: {
          id: string;
          profile_token: string;
          name: string;
          birth_date: string;
          life_expectancy_years: number;
          sex: 'male' | 'female' | 'other' | 'unspecified';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_token: string;
          name: string;
          birth_date: string;
          life_expectancy_years: number;
          sex?: 'male' | 'female' | 'other' | 'unspecified';
        };
        Update: {
          id?: string;
          profile_token?: string;
          name?: string;
          birth_date?: string;
          life_expectancy_years?: number;
          sex?: 'male' | 'female' | 'other' | 'unspecified';
        };
      };
      relationships: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          birth_date: string;
          life_expectancy_years: number;
          meeting_interval_days: number;
          average_session_minutes: number;
          note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          birth_date: string;
          life_expectancy_years: number;
          meeting_interval_days: number;
          average_session_minutes: number;
          note?: string | null;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          birth_date?: string;
          life_expectancy_years?: number;
          meeting_interval_days?: number;
          average_session_minutes?: number;
          note?: string | null;
        };
      };
    };
  };
}
