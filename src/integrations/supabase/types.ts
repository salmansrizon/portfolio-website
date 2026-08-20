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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      assessment_attempts: {
        Row: {
          id: string
          journey_id: string
          passed: boolean | null
          question_ids: string[]
          score: number | null
          started_at: string
          submitted_at: string | null
          total: number | null
          user_id: string
        }
        Insert: {
          id?: string
          journey_id: string
          passed?: boolean | null
          question_ids: string[]
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          total?: number | null
          user_id: string
        }
        Update: {
          id?: string
          journey_id?: string
          passed?: boolean | null
          question_ids?: string[]
          score?: number | null
          started_at?: string
          submitted_at?: string | null
          total?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_attempts_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      availability_settings: {
        Row: {
          available_weekdays: number[]
          created_at: string
          id: string
          time_slots: string[]
          updated_at: string
        }
        Insert: {
          available_weekdays?: number[]
          created_at?: string
          id?: string
          time_slots?: string[]
          updated_at?: string
        }
        Update: {
          available_weekdays?: number[]
          created_at?: string
          id?: string
          time_slots?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      blogs: {
        Row: {
          banner_url: string | null
          categories: string[] | null
          content: string | null
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
          banner_url?: string | null
          categories?: string[] | null
          content?: string | null
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
          banner_url?: string | null
          categories?: string[] | null
          content?: string | null
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
      brand_logos: {
        Row: {
          created_at: string
          hover_text: string | null
          id: string
          is_visible: boolean
          logo_url: string
          name: string
          order_index: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          hover_text?: string | null
          id?: string
          is_visible?: boolean
          logo_url: string
          name: string
          order_index?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          hover_text?: string | null
          id?: string
          is_visible?: boolean
          logo_url?: string
          name?: string
          order_index?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      career_prep: {
        Row: {
          content: Json | null
          created_at: string | null
          description: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      careerprep_guests: {
        Row: {
          created_at: string | null
          email: string
          id: string
          last_active_at: string | null
          level: number | null
          streak: number | null
          whatsapp: string
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          last_active_at?: string | null
          level?: number | null
          streak?: number | null
          whatsapp: string
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          last_active_at?: string | null
          level?: number | null
          streak?: number | null
          whatsapp?: string
          xp?: number | null
        }
        Relationships: []
      }
      careerprep_questions: {
        Row: {
          category: string | null
          content_md: string
          correct_option: string | null
          created_at: string | null
          difficulty: string | null
          hints: Json | null
          id: string
          industry: string
          initial_sql: string
          is_assessment_only: boolean
          is_generated: boolean
          options: Json | null
          order_index: number | null
          parent_id: string | null
          question_type: Database["public"]["Enums"]["careerprep_question_type"]
          roadmap_id: string | null
          schema_sql: string
          slug: string
          solution_sql: string
          step_slug: string | null
          success_rate: number | null
          tags: string[] | null
          time_limit_secs: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content_md: string
          correct_option?: string | null
          created_at?: string | null
          difficulty?: string | null
          hints?: Json | null
          id?: string
          industry: string
          initial_sql: string
          is_assessment_only?: boolean
          is_generated?: boolean
          options?: Json | null
          order_index?: number | null
          parent_id?: string | null
          question_type?: Database["public"]["Enums"]["careerprep_question_type"]
          roadmap_id?: string | null
          schema_sql: string
          slug: string
          solution_sql: string
          step_slug?: string | null
          success_rate?: number | null
          tags?: string[] | null
          time_limit_secs?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content_md?: string
          correct_option?: string | null
          created_at?: string | null
          difficulty?: string | null
          hints?: Json | null
          id?: string
          industry?: string
          initial_sql?: string
          is_assessment_only?: boolean
          is_generated?: boolean
          options?: Json | null
          order_index?: number | null
          parent_id?: string | null
          question_type?: Database["public"]["Enums"]["careerprep_question_type"]
          roadmap_id?: string | null
          schema_sql?: string
          slug?: string
          solution_sql?: string
          step_slug?: string | null
          success_rate?: number | null
          tags?: string[] | null
          time_limit_secs?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "careerprep_questions_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "careerprep_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "careerprep_questions_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      careerprep_submissions: {
        Row: {
          created_at: string | null
          execution_time: number | null
          guest_email: string | null
          guest_whatsapp: string | null
          id: string
          is_correct: boolean
          question_id: string | null
          session_id: string | null
          student_id: string | null
          submitted_code: string
        }
        Insert: {
          created_at?: string | null
          execution_time?: number | null
          guest_email?: string | null
          guest_whatsapp?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string | null
          session_id?: string | null
          student_id?: string | null
          submitted_code: string
        }
        Update: {
          created_at?: string | null
          execution_time?: number | null
          guest_email?: string | null
          guest_whatsapp?: string | null
          id?: string
          is_correct?: boolean
          question_id?: string | null
          session_id?: string | null
          student_id?: string | null
          submitted_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "careerprep_submissions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "careerprep_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          assessed_summary: Json | null
          credential_title: string
          holder_name: string
          id: string
          issued_at: string
          journey_id: string | null
          revoke_reason: string | null
          revoked_at: string | null
          status: string
          user_id: string
        }
        Insert: {
          assessed_summary?: Json | null
          credential_title: string
          holder_name: string
          id?: string
          issued_at?: string
          journey_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          status?: string
          user_id: string
        }
        Update: {
          assessed_summary?: Json | null
          credential_title?: string
          holder_name?: string
          id?: string
          issued_at?: string
          journey_id?: string | null
          revoke_reason?: string | null
          revoked_at?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          certificate_url: string | null
          created_at: string | null
          credential_id: string | null
          earned_date: string | null
          id: string
          image_url: string | null
          issue_date: string | null
          issuer: string | null
          title: string
          verification_url: string | null
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string | null
          credential_id?: string | null
          earned_date?: string | null
          id?: string
          image_url?: string | null
          issue_date?: string | null
          issuer?: string | null
          title: string
          verification_url?: string | null
        }
        Update: {
          certificate_url?: string | null
          created_at?: string | null
          credential_id?: string | null
          earned_date?: string | null
          id?: string
          image_url?: string | null
          issue_date?: string | null
          issuer?: string | null
          title?: string
          verification_url?: string | null
        }
        Relationships: []
      }
      checkpoint_results: {
        Row: {
          created_at: string
          first_try: boolean
          id: string
          is_correct: boolean
          question_id: string | null
          roadmap_id: string | null
          step_slug: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          first_try?: boolean
          id?: string
          is_correct: boolean
          question_id?: string | null
          roadmap_id?: string | null
          step_slug?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          first_try?: boolean
          id?: string
          is_correct?: boolean
          question_id?: string | null
          roadmap_id?: string | null
          step_slug?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checkpoint_results_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "careerprep_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checkpoint_results_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      course_categories: {
        Row: {
          created_at: string
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
        ]
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
          topics: string[] | null
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
          topics?: string[] | null
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
          topics?: string[] | null
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
          discount_amount: number | null
          enrolled_at: string
          id: string
          institute_name: string | null
          payment_method: string | null
          profession: string | null
          progress: Json | null
          promo_code: string | null
          status: string
          transaction_id: string | null
          updated_at: string
          user_email: string
          user_name: string
          whatsapp_number: string | null
        }
        Insert: {
          course_id: string
          created_at?: string
          discount_amount?: number | null
          enrolled_at?: string
          id?: string
          institute_name?: string | null
          payment_method?: string | null
          profession?: string | null
          progress?: Json | null
          promo_code?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
          user_email: string
          user_name: string
          whatsapp_number?: string | null
        }
        Update: {
          course_id?: string
          created_at?: string
          discount_amount?: number | null
          enrolled_at?: string
          id?: string
          institute_name?: string | null
          payment_method?: string | null
          profession?: string | null
          progress?: Json | null
          promo_code?: string | null
          status?: string
          transaction_id?: string | null
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
      course_reviews: {
        Row: {
          course_id: string
          created_at: string | null
          id: string
          is_approved: boolean | null
          rating: number
          review_text: string | null
          student_email: string
          student_name: string
        }
        Insert: {
          course_id: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating: number
          review_text?: string | null
          student_email: string
          student_name: string
        }
        Update: {
          course_id?: string
          created_at?: string | null
          id?: string
          is_approved?: boolean | null
          rating?: number
          review_text?: string | null
          student_email?: string
          student_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_reviews_course_id_fkey"
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
        Relationships: [
          {
            foreignKeyName: "course_sections_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          banner_image: string | null
          category_id: string | null
          course_includes: string[] | null
          course_type: string | null
          created_at: string
          description: string
          difficulty_level: string | null
          discount_percentage: number | null
          discounted_price: number | null
          duration_hours: number | null
          faqs: Json | null
          id: string
          instructor_id: string | null
          is_free: boolean
          learning_outcomes: string[] | null
          price: number | null
          promo_only: boolean
          rating: number | null
          requirements: string[] | null
          short_description: string | null
          start_date: string | null
          status: string
          student_count: number | null
          target_audience: string[] | null
          technologies: string[]
          title: string
          updated_at: string
          video_url: string | null
          what_you_will_learn: Json | null
        }
        Insert: {
          banner_image?: string | null
          category_id?: string | null
          course_includes?: string[] | null
          course_type?: string | null
          created_at?: string
          description: string
          difficulty_level?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          duration_hours?: number | null
          faqs?: Json | null
          id?: string
          instructor_id?: string | null
          is_free?: boolean
          learning_outcomes?: string[] | null
          price?: number | null
          promo_only?: boolean
          rating?: number | null
          requirements?: string[] | null
          short_description?: string | null
          start_date?: string | null
          status?: string
          student_count?: number | null
          target_audience?: string[] | null
          technologies?: string[]
          title: string
          updated_at?: string
          video_url?: string | null
          what_you_will_learn?: Json | null
        }
        Update: {
          banner_image?: string | null
          category_id?: string | null
          course_includes?: string[] | null
          course_type?: string | null
          created_at?: string
          description?: string
          difficulty_level?: string | null
          discount_percentage?: number | null
          discounted_price?: number | null
          duration_hours?: number | null
          faqs?: Json | null
          id?: string
          instructor_id?: string | null
          is_free?: boolean
          learning_outcomes?: string[] | null
          price?: number | null
          promo_only?: boolean
          rating?: number | null
          requirements?: string[] | null
          short_description?: string | null
          start_date?: string | null
          status?: string
          student_count?: number | null
          target_audience?: string[] | null
          technologies?: string[]
          title?: string
          updated_at?: string
          video_url?: string | null
          what_you_will_learn?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "courses_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "course_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "instructors"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_challenges: {
        Row: {
          for_date: string
          question_id: string
        }
        Insert: {
          for_date: string
          question_id: string
        }
        Update: {
          for_date?: string
          question_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_challenges_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "careerprep_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      ebook_unlocks: {
        Row: {
          created_at: string
          delivered_at: string | null
          ebook_id: string
          email: string
          id: string
          phone: string | null
          surface: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          ebook_id: string
          email: string
          id?: string
          phone?: string | null
          surface?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          ebook_id?: string
          email?: string
          id?: string
          phone?: string | null
          surface?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ebook_unlocks_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
        ]
      }
      ebooks: {
        Row: {
          cover_image: string | null
          created_at: string
          description: string | null
          id: string
          slug: string
          status: string
          storage_path: string | null
          title: string
        }
        Insert: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug: string
          status?: string
          storage_path?: string | null
          title: string
        }
        Update: {
          cover_image?: string | null
          created_at?: string
          description?: string | null
          id?: string
          slug?: string
          status?: string
          storage_path?: string | null
          title?: string
        }
        Relationships: []
      }
      enrolments: {
        Row: {
          archived_at: string | null
          id: string
          journey_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          archived_at?: string | null
          id?: string
          journey_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          archived_at?: string | null
          id?: string
          journey_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrolments_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events: {
        Row: {
          created_at: string
          event: string
          id: string
          journey_id: string | null
          metadata: Json | null
          session_id: string | null
          subject_id: string | null
          subject_type: string | null
          surface: string | null
          user_id: string | null
          visitor_id: string
        }
        Insert: {
          created_at?: string
          event: string
          id?: string
          journey_id?: string | null
          metadata?: Json | null
          session_id?: string | null
          subject_id?: string | null
          subject_type?: string | null
          surface?: string | null
          user_id?: string | null
          visitor_id: string
        }
        Update: {
          created_at?: string
          event?: string
          id?: string
          journey_id?: string | null
          metadata?: Json | null
          session_id?: string | null
          subject_id?: string | null
          subject_type?: string | null
          surface?: string | null
          user_id?: string | null
          visitor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "funnel_events_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
        ]
      }
      funnel_events_daily: {
        Row: {
          day: string
          event: string
          n: number
          surface: string
        }
        Insert: {
          day: string
          event: string
          n: number
          surface?: string
        }
        Update: {
          day?: string
          event?: string
          n?: number
          surface?: string
        }
        Relationships: []
      }
      instructors: {
        Row: {
          assigned_courses: string[] | null
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean
          linkedin_url: string | null
          name: string
          phone: string | null
          specialization: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          assigned_courses?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          assigned_courses?: string[] | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name?: string
          phone?: string | null
          specialization?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      journey_roadmaps: {
        Row: {
          duration_weeks: number
          id: string
          is_assessable: boolean
          journey_id: string
          label: string | null
          order_index: number
          roadmap_id: string | null
        }
        Insert: {
          duration_weeks?: number
          id?: string
          is_assessable?: boolean
          journey_id: string
          label?: string | null
          order_index?: number
          roadmap_id?: string | null
        }
        Update: {
          duration_weeks?: number
          id?: string
          is_assessable?: boolean
          journey_id?: string
          label?: string | null
          order_index?: number
          roadmap_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journey_roadmaps_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_roadmaps_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      journey_stages: {
        Row: {
          created_at: string
          description: string | null
          duration_weeks: number
          id: string
          is_assessable: boolean
          journey_id: string
          order_index: number
          roadmap_id: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_weeks?: number
          id?: string
          is_assessable?: boolean
          journey_id: string
          order_index?: number
          roadmap_id?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_weeks?: number
          id?: string
          is_assessable?: boolean
          journey_id?: string
          order_index?: number
          roadmap_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "journey_stages_journey_id_fkey"
            columns: ["journey_id"]
            isOneToOne: false
            referencedRelation: "journeys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journey_stages_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      journeys: {
        Row: {
          course_id: string | null
          created_at: string
          description: string | null
          ebook_id: string | null
          goal: string
          id: string
          order_index: number
          slug: string
          status: string
          title: string
          updated_at: string
          webinar_id: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          ebook_id?: string | null
          goal: string
          id?: string
          order_index?: number
          slug: string
          status?: string
          title: string
          updated_at?: string
          webinar_id?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string
          description?: string | null
          ebook_id?: string | null
          goal?: string
          id?: string
          order_index?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "journeys_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "journeys_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          page_path: string
          visitor_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_path: string
          visitor_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_path?: string
          visitor_id?: string
        }
        Relationships: []
      }
      payment_settings: {
        Row: {
          additional_instructions: string | null
          bkash_number: string | null
          bkash_qr_code: string | null
          id: string
          nagad_number: string | null
          nagad_qr_code: string | null
          payment_window_minutes: number
          updated_at: string
        }
        Insert: {
          additional_instructions?: string | null
          bkash_number?: string | null
          bkash_qr_code?: string | null
          id?: string
          nagad_number?: string | null
          nagad_qr_code?: string | null
          payment_window_minutes?: number
          updated_at?: string
        }
        Update: {
          additional_instructions?: string | null
          bkash_number?: string | null
          bkash_qr_code?: string | null
          id?: string
          nagad_number?: string | null
          nagad_qr_code?: string | null
          payment_window_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      portfolio_sections: {
        Row: {
          content: Json | null
          custom_fields: Json | null
          id: string
          order_index: number
          section_name: string
          section_type: string
          status: string
          updated_at: string | null
        }
        Insert: {
          content?: Json | null
          custom_fields?: Json | null
          id?: string
          order_index?: number
          section_name: string
          section_type?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          content?: Json | null
          custom_fields?: Json | null
          id?: string
          order_index?: number
          section_name?: string
          section_type?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          is_public: boolean
          target_industry: string | null
          timezone: string
          username: string | null
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id: string
          is_public?: boolean
          target_industry?: string | null
          timezone?: string
          username?: string | null
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          is_public?: boolean
          target_industry?: string | null
          timezone?: string
          username?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string | null
          demo_url: string | null
          description: string | null
          github_url: string | null
          id: string
          image_url: string | null
          link: string | null
          technologies: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          technologies?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          demo_url?: string | null
          description?: string | null
          github_url?: string | null
          id?: string
          image_url?: string | null
          link?: string | null
          technologies?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          course_id: string | null
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          id: string
          is_active: boolean
          max_uses: number | null
          scope: string
          updated_at: string
          used_count: number
          valid_from: string
          valid_until: string | null
          webinar_id: string | null
        }
        Insert: {
          code: string
          course_id?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          scope?: string
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_until?: string | null
          webinar_id?: string | null
        }
        Update: {
          code?: string
          course_id?: string | null
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          id?: string
          is_active?: boolean
          max_uses?: number | null
          scope?: string
          updated_at?: string
          used_count?: number
          valid_from?: string
          valid_until?: string | null
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_codes_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      roadmaps: {
        Row: {
          banner_image: string | null
          created_at: string
          description: string | null
          goal: string | null
          icon: string | null
          id: string
          level: string | null
          markdown_content: string
          order_index: number
          slug: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          banner_image?: string | null
          created_at?: string
          description?: string | null
          goal?: string | null
          icon?: string | null
          id?: string
          level?: string | null
          markdown_content?: string
          order_index?: number
          slug: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          banner_image?: string | null
          created_at?: string
          description?: string | null
          goal?: string | null
          icon?: string | null
          id?: string
          level?: string | null
          markdown_content?: string
          order_index?: number
          slug?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          features: string[] | null
          icon: string | null
          id: string
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          icon?: string | null
          id?: string
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: string[] | null
          icon?: string | null
          id?: string
          title?: string
        }
        Relationships: []
      }
      session_bookings: {
        Row: {
          booking_date: string
          booking_status: string
          created_at: string
          fee_amount: number
          id: string
          payment_deadline: string | null
          payment_method: string
          payment_status: string
          phone_number: string | null
          session_type_id: string
          time_slot: string
          transaction_id: string | null
          updated_at: string
          user_email: string
          user_name: string
          whatsapp_number: string | null
        }
        Insert: {
          booking_date: string
          booking_status?: string
          created_at?: string
          fee_amount?: number
          id?: string
          payment_deadline?: string | null
          payment_method: string
          payment_status?: string
          phone_number?: string | null
          session_type_id: string
          time_slot: string
          transaction_id?: string | null
          updated_at?: string
          user_email: string
          user_name: string
          whatsapp_number?: string | null
        }
        Update: {
          booking_date?: string
          booking_status?: string
          created_at?: string
          fee_amount?: number
          id?: string
          payment_deadline?: string | null
          payment_method?: string
          payment_status?: string
          phone_number?: string | null
          session_type_id?: string
          time_slot?: string
          transaction_id?: string | null
          updated_at?: string
          user_email?: string
          user_name?: string
          whatsapp_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "session_bookings_session_type_id_fkey"
            columns: ["session_type_id"]
            isOneToOne: false
            referencedRelation: "session_types"
            referencedColumns: ["id"]
          },
        ]
      }
      session_types: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          fee: number
          id: string
          is_active: boolean
          is_paid: boolean
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          fee?: number
          id?: string
          is_active?: boolean
          is_paid?: boolean
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          fee?: number
          id?: string
          is_active?: boolean
          is_paid?: boolean
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      stage_topics: {
        Row: {
          created_at: string
          id: string
          order_index: number
          stage_id: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          stage_id: string
          topic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          stage_id?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stage_topics_stage_id_fkey"
            columns: ["stage_id"]
            isOneToOne: false
            referencedRelation: "journey_stages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_topics_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      step_progress: {
        Row: {
          id: string
          passed_at: string
          roadmap_id: string
          step_slug: string
          user_id: string
        }
        Insert: {
          id?: string
          passed_at?: string
          roadmap_id: string
          step_slug: string
          user_id: string
        }
        Update: {
          id?: string
          passed_at?: string
          roadmap_id?: string
          step_slug?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_progress_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      step_resources: {
        Row: {
          course_id: string | null
          course_section_id: string | null
          created_at: string
          id: string
          label: string | null
          note: string | null
          order_index: number
          roadmap_id: string
          step_slug: string
        }
        Insert: {
          course_id?: string | null
          course_section_id?: string | null
          created_at?: string
          id?: string
          label?: string | null
          note?: string | null
          order_index?: number
          roadmap_id: string
          step_slug: string
        }
        Update: {
          course_id?: string | null
          course_section_id?: string | null
          created_at?: string
          id?: string
          label?: string | null
          note?: string | null
          order_index?: number
          roadmap_id?: string
          step_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "step_resources_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_resources_course_section_id_fkey"
            columns: ["course_section_id"]
            isOneToOne: false
            referencedRelation: "course_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "step_resources_roadmap_id_fkey"
            columns: ["roadmap_id"]
            isOneToOne: false
            referencedRelation: "roadmaps"
            referencedColumns: ["id"]
          },
        ]
      }
      students: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          enrolled_courses: string[] | null
          id: string
          institution: string | null
          is_active: boolean
          name: string
          phone: string | null
          streak: number | null
          updated_at: string | null
          xp: number | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          enrolled_courses?: string[] | null
          id?: string
          institution?: string | null
          is_active?: boolean
          name: string
          phone?: string | null
          streak?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          enrolled_courses?: string[] | null
          id?: string
          institution?: string | null
          is_active?: boolean
          name?: string
          phone?: string | null
          streak?: number | null
          updated_at?: string | null
          xp?: number | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          avatar_url: string | null
          client_name: string
          client_role: string | null
          company: string | null
          content: string | null
          created_at: string | null
          id: string
          rating: number | null
          testimonial: string | null
        }
        Insert: {
          avatar_url?: string | null
          client_name: string
          client_role?: string | null
          company?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          testimonial?: string | null
        }
        Update: {
          avatar_url?: string | null
          client_name?: string
          client_role?: string | null
          company?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          rating?: number | null
          testimonial?: string | null
        }
        Relationships: []
      }
      topic_progress: {
        Row: {
          passed_at: string
          topic_id: string
          user_id: string
        }
        Insert: {
          passed_at?: string
          topic_id: string
          user_id: string
        }
        Update: {
          passed_at?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topic_progress_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      topic_questions: {
        Row: {
          created_at: string
          id: string
          order_index: number
          question_id: string
          role: string
          topic_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          question_id: string
          role?: string
          topic_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          question_id?: string
          role?: string
          topic_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "concept_questions_concept_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "concept_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "careerprep_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      topics: {
        Row: {
          analogy: string
          course_id: string | null
          created_at: string
          ebook_id: string | null
          how_it_works: string
          id: string
          language: string
          slug: string
          status: string
          title: string
          updated_at: string
          webinar_id: string | null
          what_it_is: string
          why_it_matters: string
        }
        Insert: {
          analogy: string
          course_id?: string | null
          created_at?: string
          ebook_id?: string | null
          how_it_works: string
          id?: string
          language?: string
          slug: string
          status?: string
          title: string
          updated_at?: string
          webinar_id?: string | null
          what_it_is: string
          why_it_matters: string
        }
        Update: {
          analogy?: string
          course_id?: string | null
          created_at?: string
          ebook_id?: string | null
          how_it_works?: string
          id?: string
          language?: string
          slug?: string
          status?: string
          title?: string
          updated_at?: string
          webinar_id?: string | null
          what_it_is?: string
          why_it_matters?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_ebook_id_fkey"
            columns: ["ebook_id"]
            isOneToOne: false
            referencedRelation: "ebooks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "topics_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
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
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webinar_bookings: {
        Row: {
          booking_date: string | null
          discount_amount: number | null
          id: string
          payment_method: string | null
          payment_status: string | null
          payment_transaction_id: string | null
          promo_code: string | null
          student_email: string
          student_name: string
          student_role: string | null
          student_whatsapp: string
          webinar_id: string | null
        }
        Insert: {
          booking_date?: string | null
          discount_amount?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          promo_code?: string | null
          student_email: string
          student_name: string
          student_role?: string | null
          student_whatsapp: string
          webinar_id?: string | null
        }
        Update: {
          booking_date?: string | null
          discount_amount?: number | null
          id?: string
          payment_method?: string | null
          payment_status?: string | null
          payment_transaction_id?: string | null
          promo_code?: string | null
          student_email?: string
          student_name?: string
          student_role?: string | null
          student_whatsapp?: string
          webinar_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webinar_bookings_webinar_id_fkey"
            columns: ["webinar_id"]
            isOneToOne: false
            referencedRelation: "webinars"
            referencedColumns: ["id"]
          },
        ]
      }
      webinars: {
        Row: {
          banner_url: string | null
          booked_count: number | null
          content_blocks: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_free: boolean | null
          price: number | null
          status: string | null
          title: string
          updated_at: string | null
          webinar_date: string
        }
        Insert: {
          banner_url?: string | null
          booked_count?: number | null
          content_blocks?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_free?: boolean | null
          price?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          webinar_date: string
        }
        Update: {
          banner_url?: string | null
          booked_count?: number | null
          content_blocks?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_free?: boolean | null
          price?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          webinar_date?: string
        }
        Relationships: []
      }
      xp_events: {
        Row: {
          amount: number
          created_at: string
          id: string
          question_id: string | null
          reason: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          question_id?: string | null
          reason: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          question_id?: string | null
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "xp_events_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "careerprep_questions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      course_content_outline: {
        Row: {
          content_category:
            | Database["public"]["Enums"]["content_type_enum"]
            | null
          content_type: string | null
          course_id: string | null
          description: string | null
          duration_minutes: number | null
          id: string | null
          is_free: boolean | null
          order_index: number | null
          section_id: string | null
          title: string | null
          topics: string[] | null
        }
        Insert: {
          content_category?:
            | Database["public"]["Enums"]["content_type_enum"]
            | null
          content_type?: string | null
          course_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string | null
          is_free?: boolean | null
          order_index?: number | null
          section_id?: string | null
          title?: string | null
          topics?: string[] | null
        }
        Update: {
          content_category?:
            | Database["public"]["Enums"]["content_type_enum"]
            | null
          content_type?: string | null
          course_id?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string | null
          is_free?: boolean | null
          order_index?: number | null
          section_id?: string | null
          title?: string | null
          topics?: string[] | null
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
    }
    Functions: {
      assessment_paper: {
        Args: { p_attempt_id: string }
        Returns: {
          content_md: string
          difficulty: string
          id: string
          industry: string
          options: Json
          title: string
        }[]
      }
      careerprep_retention_sweep: { Args: never; Returns: Json }
      funnel_summary: { Args: { p_days?: number }; Returns: Json }
      grade_checkpoint: {
        Args: {
          p_choice: string
          p_first_try: boolean
          p_question_id: string
          p_roadmap_id: string
          p_step_slug: string
        }
        Returns: {
          correct_option: string
          is_correct: boolean
        }[]
      }
      grade_topic_checkpoint: {
        Args: {
          p_choice: string
          p_first_try: boolean
          p_question_id: string
          p_topic_id: string
        }
        Returns: {
          correct_option: string
          is_correct: boolean
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_promo_code_usage: {
        Args: { code_input: string }
        Returns: undefined
      }
      is_admin: { Args: never; Returns: boolean }
      next_up: { Args: { p_limit?: number }; Returns: Json }
      public_profile: { Args: { p_username: string }; Returns: Json }
      start_assessment: {
        Args: { p_journey_id: string }
        Returns: {
          attempt_id: string
          question_ids: string[]
        }[]
      }
      submit_assessment: {
        Args: { p_answers: Json; p_attempt_id: string }
        Returns: {
          certificate_id: string
          passed: boolean
          score: number
          total: number
        }[]
      }
      sync_assessment_pool: { Args: never; Returns: number }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      careerprep_question_type: "root" | "code" | "mcq" | "case_study"
      content_type_enum:
        | "video"
        | "text"
        | "quiz"
        | "lesson"
        | "assignment"
        | "lecture"
        | "project"
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      careerprep_question_type: ["root", "code", "mcq", "case_study"],
      content_type_enum: [
        "video",
        "text",
        "quiz",
        "lesson",
        "assignment",
        "lecture",
        "project",
      ],
    },
  },
} as const
