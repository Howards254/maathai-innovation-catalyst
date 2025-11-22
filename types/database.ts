export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string
          avatar_url: string | null
          bio: string | null
          impact_points: number
          role: 'user' | 'admin' | 'moderator'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name: string
          avatar_url?: string | null
          bio?: string | null
          impact_points?: number
          role?: 'user' | 'admin' | 'moderator'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string
          avatar_url?: string | null
          bio?: string | null
          impact_points?: number
          role?: 'user' | 'admin' | 'moderator'
          created_at?: string
          updated_at?: string
        }
      }
      badges: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          points_required: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          points_required?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          points_required?: number
          created_at?: string
        }
      }
      campaigns: {
        Row: {
          id: string
          title: string
          description: string
          target_trees: number
          planted_trees: number
          image_url: string | null
          organizer_id: string
          location: string
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          target_trees: number
          planted_trees?: number
          image_url?: string | null
          organizer_id: string
          location: string
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          target_trees?: number
          planted_trees?: number
          image_url?: string | null
          organizer_id?: string
          location?: string
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      discussions: {
        Row: {
          id: string
          title: string
          content: string
          author_id: string
          category: 'general' | 'help' | 'success_story' | 'tech'
          upvotes: number
          downvotes: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          author_id: string
          category?: 'general' | 'help' | 'success_story' | 'tech'
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          author_id?: string
          category?: 'general' | 'help' | 'success_story' | 'tech'
          upvotes?: number
          downvotes?: number
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          event_date: string
          location: string
          type: 'online' | 'in_person'
          image_url: string | null
          organizer_id: string
          max_attendees: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          event_date: string
          location: string
          type: 'online' | 'in_person'
          image_url?: string | null
          organizer_id: string
          max_attendees?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          event_date?: string
          location?: string
          type?: 'online' | 'in_person'
          image_url?: string | null
          organizer_id?: string
          max_attendees?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      resources: {
        Row: {
          id: string
          title: string
          type: 'pdf' | 'video' | 'article'
          category: string
          url: string
          description: string | null
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          type: 'pdf' | 'video' | 'article'
          category: string
          url: string
          description?: string | null
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          type?: 'pdf' | 'video' | 'article'
          category?: string
          url?: string
          description?: string | null
          created_by?: string
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_leaderboard: {
        Args: {
          limit_count?: number
        }
        Returns: {
          rank: number
          user_id: string
          username: string
          full_name: string
          avatar_url: string | null
          impact_points: number
          badges: string[] | null
        }[]
      }
      award_points: {
        Args: {
          user_id: string
          points: number
          action_type: string
          entity_type?: string
          entity_id?: string
        }
        Returns: void
      }
    }
    Enums: {
      user_role: 'user' | 'admin' | 'moderator'
      campaign_status: 'active' | 'completed' | 'paused' | 'cancelled'
      event_type: 'online' | 'in_person'
      resource_type: 'pdf' | 'video' | 'article'
      discussion_category: 'general' | 'help' | 'success_story' | 'tech'
    }
  }
}