export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      daily_plans: {
        Row: {
          created_at: string
          id: string
          locked: boolean
          occasion: string
          outfit_id: string | null
          plan_date: string
          updated_at: string
          user_id: string
          weekly_plan_id: string
          worn: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          locked?: boolean
          occasion?: string
          outfit_id?: string | null
          plan_date: string
          updated_at?: string
          user_id: string
          weekly_plan_id: string
          worn?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          locked?: boolean
          occasion?: string
          outfit_id?: string | null
          plan_date?: string
          updated_at?: string
          user_id?: string
          weekly_plan_id?: string
          worn?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "daily_plans_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_plans_weekly_plan_id_fkey"
            columns: ["weekly_plan_id"]
            isOneToOne: false
            referencedRelation: "weekly_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          analysis_id: string | null
          created_at: string
          id: string
          item_id: string | null
          kind: string
          outfit_id: string | null
          try_on_id: string | null
          user_id: string
        }
        Insert: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          kind: string
          outfit_id?: string | null
          try_on_id?: string | null
          user_id: string
        }
        Update: {
          analysis_id?: string | null
          created_at?: string
          id?: string
          item_id?: string | null
          kind?: string
          outfit_id?: string | null
          try_on_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "shopping_analyses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_try_on_id_fkey"
            columns: ["try_on_id"]
            isOneToOne: false
            referencedRelation: "try_on_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      outfit_feedback: {
        Row: {
          context: Json
          created_at: string
          id: string
          outfit_id: string | null
          signal: string
          user_id: string
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          outfit_id?: string | null
          signal: string
          user_id: string
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          outfit_id?: string | null
          signal?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_feedback_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfit_items: {
        Row: {
          created_at: string
          id: string
          item_id: string
          outfit_id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          outfit_id: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          outfit_id?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "outfit_items_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "wardrobe_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "outfit_items_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      outfits: {
        Row: {
          created_at: string
          id: string
          match_score: number
          notes: string | null
          occasion: string
          source: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number
          notes?: string | null
          occasion?: string
          source?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number
          notes?: string | null
          occasion?: string
          source?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          city: string | null
          created_at: string
          display_name: string | null
          id: string
          notification_time: string
          notifications_enabled: boolean
          onboarding_completed: boolean
          personal_photo_url: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          notification_time?: string
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          personal_photo_url?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          notification_time?: string
          notifications_enabled?: boolean
          onboarding_completed?: boolean
          personal_photo_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      shopping_analyses: {
        Row: {
          category: string | null
          color: string | null
          compatibility: string
          concerns: string[]
          created_at: string
          id: string
          image_url: string | null
          new_combinations: number
          occasions: string[]
          overlap: string
          pairings: Json
          product_name: string
          product_url: string | null
          reasons: string[]
          style_compatibility: string
          user_id: string
        }
        Insert: {
          category?: string | null
          color?: string | null
          compatibility?: string
          concerns?: string[]
          created_at?: string
          id?: string
          image_url?: string | null
          new_combinations?: number
          occasions?: string[]
          overlap?: string
          pairings?: Json
          product_name: string
          product_url?: string | null
          reasons?: string[]
          style_compatibility?: string
          user_id: string
        }
        Update: {
          category?: string | null
          color?: string | null
          compatibility?: string
          concerns?: string[]
          created_at?: string
          id?: string
          image_url?: string | null
          new_combinations?: number
          occasions?: string[]
          overlap?: string
          pairings?: Json
          product_name?: string
          product_url?: string | null
          reasons?: string[]
          style_compatibility?: string
          user_id?: string
        }
        Relationships: []
      }
      style_preferences: {
        Row: {
          colors: string[]
          created_at: string
          fit: string
          occasions: string[]
          routine: Json
          styles: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          colors?: string[]
          created_at?: string
          fit?: string
          occasions?: string[]
          routine?: Json
          styles?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          colors?: string[]
          created_at?: string
          fit?: string
          occasions?: string[]
          routine?: Json
          styles?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      try_on_requests: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          item_ids: string[]
          outfit_id: string | null
          result_url: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          item_ids?: string[]
          outfit_id?: string | null
          result_url?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          item_ids?: string[]
          outfit_id?: string | null
          result_url?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "try_on_requests_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      wardrobe_items: {
        Row: {
          category: string
          color: string
          created_at: string
          fit: string
          formality: number
          id: string
          image_url: string | null
          in_laundry: boolean
          last_worn_at: string | null
          name: string
          pattern: string
          season: string
          secondary_color: string | null
          sleeve: string | null
          style: string
          times_worn: number
          updated_at: string
          user_id: string
        }
        Insert: {
          category: string
          color?: string
          created_at?: string
          fit?: string
          formality?: number
          id?: string
          image_url?: string | null
          in_laundry?: boolean
          last_worn_at?: string | null
          name: string
          pattern?: string
          season?: string
          secondary_color?: string | null
          sleeve?: string | null
          style?: string
          times_worn?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          color?: string
          created_at?: string
          fit?: string
          formality?: number
          id?: string
          image_url?: string | null
          in_laundry?: boolean
          last_worn_at?: string | null
          name?: string
          pattern?: string
          season?: string
          secondary_color?: string | null
          sleeve?: string | null
          style?: string
          times_worn?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wear_history: {
        Row: {
          created_at: string
          id: string
          item_ids: string[]
          occasion: string | null
          outfit_id: string | null
          user_id: string
          worn_on: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_ids?: string[]
          occasion?: string | null
          outfit_id?: string | null
          user_id: string
          worn_on?: string
        }
        Update: {
          created_at?: string
          id?: string
          item_ids?: string[]
          occasion?: string | null
          outfit_id?: string | null
          user_id?: string
          worn_on?: string
        }
        Relationships: [
          {
            foreignKeyName: "wear_history_outfit_id_fkey"
            columns: ["outfit_id"]
            isOneToOne: false
            referencedRelation: "outfits"
            referencedColumns: ["id"]
          },
        ]
      }
      weekly_plans: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
