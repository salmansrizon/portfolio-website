export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      blogs: {
        Row: {
          categories: string[] | null
          content: Json
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean | null
          slug: string
          source_type: string | null
          source_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          categories?: string[] | null
          content: Json
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          slug: string
          source_type?: string | null
          source_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          categories?: string[] | null
          content?: Json
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean | null
          slug?: string
          source_type?: string | null
          source_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      certifications: {
        Row: {
          created_at: string
          credential_id: string | null
          earned_date: string | null
          id: string
          image_url: string | null
          issuer: string
          title: string
          verification_url: string | null
        }
        Insert: {
          created_at?: string
          credential_id?: string | null
          earned_date?: string | null
          id?: string
          image_url?: string | null
          issuer: string
          title: string
          verification_url?: string | null
        }
        Update: {
          created_at?: string
          credential_id?: string | null
          earned_date?: string | null
          id?: string
          image_url?: string | null
          issuer?: string
          title?: string
          verification_url?: string | null
        }
        Relationships: []
      }
      course_content: {
        Row: {
          content_category:
            | Database["public"]["Enums"]["content_type_enum"]
            | null
          content_data: Json
          content_type: string
          course_id: string
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_free: boolean
          order_index: number
          section_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          content_category?:
            | Database["public"]["Enums"]["content_type_enum"]
            | null
          content_data: Json
          content_type: string
          course_id: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          order_index?: number
          section_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          content_category?:
            | Database["public"]["Enums"]["content_type_enum"]
            | null
          content_data?: Json
          content_type?: string
          course_id?: string
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_free?: boolean
          order_index?: number
          section_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_content_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_content_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          course_id: string
          created_at: string
          enrolled_at: string
          id: string
          institute_name: string | null
          profession: string | null
          progress: Json | null
          status: string
          updated_at: string
          user_email: string
          user_name: string
          whatsapp_number: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          enrolled_at?: string
          id?: string
          institute_name?: string | null
          profession?: string | null
          progress?: Json | null
          status?: string
          updated_at?: string
          user_email: string
          user_name: string
          whatsapp_number?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          enrolled_at?: string
          id?: string
          institute_name?: string | null
          profession?: string | null
          progress?: Json | null
          status?: string
          updated_at?: string
          user_email?: string
          user_name?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_sections: {
        Row: {
          content: Json
          course_id: string
          created_at: string
          id: string
          is_visible: boolean
          order_index: number
          section_type: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: Json
          course_id: string
          created_at?: string
          id?: string
          is_visible?: boolean
          order_index?: number
          section_type: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: Json
          course_id?: string
          created_at?: string
          id?: string
          is_visible?: boolean
          order_index?: number
          section_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      courses: {
        Row: {
          banner_image: string | null
          created_at: string
          description: string
          difficulty_level: string | null
          discount_percentage: number | null
          discounted_price: number | null
          duration_hours: number | null
          id: string
          is_free: boolean
          price: number | null
          rating: number | null
          status: string
          student_count: number | null
          technologies: string[]
          title: string
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          description: string
          difficulty_level?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          duration_hours?: number | null
          id?: string
          is_free?: boolean
          price?: number | null
          rating?: number | null
          status?: string
          student_count?: number | null
          technologies?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          description?: string
          difficulty_level?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          duration_hours?: number | null
          id?: string
          is_free?: boolean
          price?: number | null
          rating?: number | null
          status?: string
          student_count?: number | null
          technologies?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_sections: {
        Row: {
          content: Json
          id: string
          section_name: string
          updated_at: string
        }
        Insert: {
          content: Json
          id?: string
          section_name: string
          updated_at?: string
        }
        Update: {
          content?: Json
          id?: string
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          demo_url: string | null
          description: string
          github_url: string | null
          id: string
          image_url: string | null
          technologies: string[]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          demo_url?: string | null
          description: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          technologies: string[]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          demo_url?: string | null
          description?: string
          github_url?: string | null
          id?: string
          image_url?: string | null
          technologies?: string[]
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string
          description: string
          features: string[]
          icon: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          features?: string[]
          icon?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          features?: string[]
          icon?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          client_name: string
          company: string | null
          content: string
          created_at: string
          id: string
          rating: number | null
        }
        Insert: {
          client_name: string
          company?: string | null
          content: string
          created_at?: string
          id?: string
          rating?: number | null
        }
        Update: {
          client_name?: string
          company?: string | null
          content?: string
          created_at?: string
          id?: string
          rating?: number | null
        }
        Relationships: []
      }
      unavailable_slots: {
        Row: {
          created_at: string
          date: string
          id: string
          reason: string | null
          time_slot: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          reason?: string | null
          time_slot?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          reason?: string | null
          time_slot?: string | null
          updated_at?: string
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
      content_type_enum:
        | "lesson"
        | "quiz"
        | "project"
        | "assignment"
        | "text"
        | "video"
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
    Enums: {
      content_type_enum: [
        "lesson",
        "quiz",
        "project",
        "assignment",
        "text",
        "video",
      ],
    },
  },
} as const
