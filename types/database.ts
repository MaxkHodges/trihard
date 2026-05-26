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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      adaptations: {
        Row: {
          affected_session_ids: string[]
          after_snapshot: Json
          before_snapshot: Json
          change_type: Database["public"]["Enums"]["adaptation_change"]
          created_at: string
          id: string
          plan_id: string
          rationale_text: string
          triggered_by: Database["public"]["Enums"]["adaptation_trigger"]
        }
        Insert: {
          affected_session_ids?: string[]
          after_snapshot?: Json
          before_snapshot?: Json
          change_type: Database["public"]["Enums"]["adaptation_change"]
          created_at?: string
          id?: string
          plan_id: string
          rationale_text: string
          triggered_by: Database["public"]["Enums"]["adaptation_trigger"]
        }
        Update: {
          affected_session_ids?: string[]
          after_snapshot?: Json
          before_snapshot?: Json
          change_type?: Database["public"]["Enums"]["adaptation_change"]
          created_at?: string
          id?: string
          plan_id?: string
          rationale_text?: string
          triggered_by?: Database["public"]["Enums"]["adaptation_trigger"]
        }
        Relationships: [
          {
            foreignKeyName: "adaptations_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      athlete_profile: {
        Row: {
          created_at: string
          date_of_birth: string | null
          experience_level: Database["public"]["Enums"]["experience_level"]
          has_turbo: boolean
          open_water_access: boolean
          open_water_season_months: number[] | null
          pool_length_m: number | null
          preferred_long_day_bike: number | null
          preferred_long_day_run: number | null
          preferred_long_day_swim: number | null
          updated_at: string
          user_id: string
          weekly_hours_target: number
        }
        Insert: {
          created_at?: string
          date_of_birth?: string | null
          experience_level?: Database["public"]["Enums"]["experience_level"]
          has_turbo?: boolean
          open_water_access?: boolean
          open_water_season_months?: number[] | null
          pool_length_m?: number | null
          preferred_long_day_bike?: number | null
          preferred_long_day_run?: number | null
          preferred_long_day_swim?: number | null
          updated_at?: string
          user_id: string
          weekly_hours_target?: number
        }
        Update: {
          created_at?: string
          date_of_birth?: string | null
          experience_level?: Database["public"]["Enums"]["experience_level"]
          has_turbo?: boolean
          open_water_access?: boolean
          open_water_season_months?: number[] | null
          pool_length_m?: number | null
          preferred_long_day_bike?: number | null
          preferred_long_day_run?: number | null
          preferred_long_day_swim?: number | null
          updated_at?: string
          user_id?: string
          weekly_hours_target?: number
        }
        Relationships: []
      }
      completed_activities: {
        Row: {
          avg_hr: number | null
          avg_pace: number | null
          avg_power: number | null
          created_at: string
          discipline: Database["public"]["Enums"]["discipline"]
          distance_meters: number | null
          duration_seconds: number
          external_id: string | null
          id: string
          notes: string | null
          perceived_effort: number | null
          raw_data: Json | null
          session_id: string | null
          source: Database["public"]["Enums"]["activity_source"]
          started_at: string
          tss_computed: number | null
          user_id: string
        }
        Insert: {
          avg_hr?: number | null
          avg_pace?: number | null
          avg_power?: number | null
          created_at?: string
          discipline: Database["public"]["Enums"]["discipline"]
          distance_meters?: number | null
          duration_seconds: number
          external_id?: string | null
          id?: string
          notes?: string | null
          perceived_effort?: number | null
          raw_data?: Json | null
          session_id?: string | null
          source?: Database["public"]["Enums"]["activity_source"]
          started_at: string
          tss_computed?: number | null
          user_id: string
        }
        Update: {
          avg_hr?: number | null
          avg_pace?: number | null
          avg_power?: number | null
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline"]
          distance_meters?: number | null
          duration_seconds?: number
          external_id?: string | null
          id?: string
          notes?: string | null
          perceived_effort?: number | null
          raw_data?: Json | null
          session_id?: string | null
          source?: Database["public"]["Enums"]["activity_source"]
          started_at?: string
          tss_computed?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "completed_activities_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_check_ins: {
        Row: {
          available_time_today_minutes: number | null
          check_in_date: string
          created_at: string
          fatigue: number
          id: string
          life_stress: number
          motivation: number
          sleep_quality: number
          soreness_areas: string[] | null
          user_id: string
        }
        Insert: {
          available_time_today_minutes?: number | null
          check_in_date: string
          created_at?: string
          fatigue: number
          id?: string
          life_stress: number
          motivation: number
          sleep_quality: number
          soreness_areas?: string[] | null
          user_id: string
        }
        Update: {
          available_time_today_minutes?: number | null
          check_in_date?: string
          created_at?: string
          fatigue?: number
          id?: string
          life_stress?: number
          motivation?: number
          sleep_quality?: number
          soreness_areas?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      equipment: {
        Row: {
          active: boolean
          created_at: string
          details: Json
          equipment_type: Database["public"]["Enums"]["equipment_type"]
          id: string
          user_id: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          details?: Json
          equipment_type: Database["public"]["Enums"]["equipment_type"]
          id?: string
          user_id: string
        }
        Update: {
          active?: boolean
          created_at?: string
          details?: Json
          equipment_type?: Database["public"]["Enums"]["equipment_type"]
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      fitness_metrics: {
        Row: {
          created_at: string
          discipline: Database["public"]["Enums"]["discipline"]
          id: string
          metric_type: Database["public"]["Enums"]["metric_type"]
          recorded_at: string
          source: Database["public"]["Enums"]["metric_source"]
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          discipline: Database["public"]["Enums"]["discipline"]
          id?: string
          metric_type: Database["public"]["Enums"]["metric_type"]
          recorded_at?: string
          source?: Database["public"]["Enums"]["metric_source"]
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline"]
          id?: string
          metric_type?: Database["public"]["Enums"]["metric_type"]
          recorded_at?: string
          source?: Database["public"]["Enums"]["metric_source"]
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      plan_blocks: {
        Row: {
          block_type: Database["public"]["Enums"]["block_type"]
          created_at: string
          end_date: string
          focus: string | null
          id: string
          plan_id: string
          sequence: number
          start_date: string
          weekly_hours: number | null
        }
        Insert: {
          block_type: Database["public"]["Enums"]["block_type"]
          created_at?: string
          end_date: string
          focus?: string | null
          id?: string
          plan_id: string
          sequence: number
          start_date: string
          weekly_hours?: number | null
        }
        Update: {
          block_type?: Database["public"]["Enums"]["block_type"]
          created_at?: string
          end_date?: string
          focus?: string | null
          id?: string
          plan_id?: string
          sequence?: number
          start_date?: string
          weekly_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_blocks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          created_at: string
          end_date: string
          generated_at: string
          generator_version: string
          id: string
          parent_plan_id: string | null
          plan_type: Database["public"]["Enums"]["plan_type"]
          start_date: string
          status: Database["public"]["Enums"]["plan_status"]
          target_race_id: string | null
          user_id: string
          weekly_hours_target: number
        }
        Insert: {
          created_at?: string
          end_date: string
          generated_at?: string
          generator_version: string
          id?: string
          parent_plan_id?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          start_date: string
          status?: Database["public"]["Enums"]["plan_status"]
          target_race_id?: string | null
          user_id: string
          weekly_hours_target: number
        }
        Update: {
          created_at?: string
          end_date?: string
          generated_at?: string
          generator_version?: string
          id?: string
          parent_plan_id?: string | null
          plan_type?: Database["public"]["Enums"]["plan_type"]
          start_date?: string
          status?: Database["public"]["Enums"]["plan_status"]
          target_race_id?: string | null
          user_id?: string
          weekly_hours_target?: number
        }
        Relationships: [
          {
            foreignKeyName: "plans_parent_plan_id_fkey"
            columns: ["parent_plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plans_target_race_id_fkey"
            columns: ["target_race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      race_plans: {
        Row: {
          bike_power_targets: Json | null
          confidence: Database["public"]["Enums"]["race_confidence"]
          created_at: string
          id: string
          nutrition_plan: Json | null
          predicted_finish_seconds: number | null
          race_id: string
          run_pacing: Json | null
          swim_pacing_strategy: string | null
          transition_checklist: Json | null
          updated_at: string
        }
        Insert: {
          bike_power_targets?: Json | null
          confidence?: Database["public"]["Enums"]["race_confidence"]
          created_at?: string
          id?: string
          nutrition_plan?: Json | null
          predicted_finish_seconds?: number | null
          race_id: string
          run_pacing?: Json | null
          swim_pacing_strategy?: string | null
          transition_checklist?: Json | null
          updated_at?: string
        }
        Update: {
          bike_power_targets?: Json | null
          confidence?: Database["public"]["Enums"]["race_confidence"]
          created_at?: string
          id?: string
          nutrition_plan?: Json | null
          predicted_finish_seconds?: number | null
          race_id?: string
          run_pacing?: Json | null
          swim_pacing_strategy?: string | null
          transition_checklist?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "race_plans_race_id_fkey"
            columns: ["race_id"]
            isOneToOne: false
            referencedRelation: "races"
            referencedColumns: ["id"]
          },
        ]
      }
      races: {
        Row: {
          course_profile: Database["public"]["Enums"]["course_profile"]
          created_at: string
          distance: Database["public"]["Enums"]["race_distance"]
          id: string
          name: string
          notes: string | null
          priority: Database["public"]["Enums"]["race_priority"]
          race_date: string
          swim_type: Database["public"]["Enums"]["swim_type"]
          updated_at: string
          user_id: string
          wetsuit_likely: boolean
        }
        Insert: {
          course_profile?: Database["public"]["Enums"]["course_profile"]
          created_at?: string
          distance: Database["public"]["Enums"]["race_distance"]
          id?: string
          name: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["race_priority"]
          race_date: string
          swim_type?: Database["public"]["Enums"]["swim_type"]
          updated_at?: string
          user_id: string
          wetsuit_likely?: boolean
        }
        Update: {
          course_profile?: Database["public"]["Enums"]["course_profile"]
          created_at?: string
          distance?: Database["public"]["Enums"]["race_distance"]
          id?: string
          name?: string
          notes?: string | null
          priority?: Database["public"]["Enums"]["race_priority"]
          race_date?: string
          swim_type?: Database["public"]["Enums"]["swim_type"]
          updated_at?: string
          user_id?: string
          wetsuit_likely?: boolean
        }
        Relationships: []
      }
      readiness_scores: {
        Row: {
          created_at: string
          id: string
          inputs: Json
          rationale_text: string
          recommendation: Database["public"]["Enums"]["readiness_recommendation"]
          score: number
          score_date: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          inputs?: Json
          rationale_text: string
          recommendation: Database["public"]["Enums"]["readiness_recommendation"]
          score: number
          score_date: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          inputs?: Json
          rationale_text?: string
          recommendation?: Database["public"]["Enums"]["readiness_recommendation"]
          score?: number
          score_date?: string
          user_id?: string
        }
        Relationships: []
      }
      sessions: {
        Row: {
          block_id: string
          created_at: string
          discipline: Database["public"]["Enums"]["discipline"]
          duration_minutes: number
          environment: Database["public"]["Enums"]["session_environment"]
          fueling_notes: string | null
          id: string
          moved_from_date: string | null
          plan_id: string
          purpose_text: string | null
          scheduled_date: string
          session_type: Database["public"]["Enums"]["session_type"]
          status: Database["public"]["Enums"]["session_status"]
          structured_workout: Json | null
          target_tss: number | null
          updated_at: string
        }
        Insert: {
          block_id: string
          created_at?: string
          discipline: Database["public"]["Enums"]["discipline"]
          duration_minutes: number
          environment?: Database["public"]["Enums"]["session_environment"]
          fueling_notes?: string | null
          id?: string
          moved_from_date?: string | null
          plan_id: string
          purpose_text?: string | null
          scheduled_date: string
          session_type: Database["public"]["Enums"]["session_type"]
          status?: Database["public"]["Enums"]["session_status"]
          structured_workout?: Json | null
          target_tss?: number | null
          updated_at?: string
        }
        Update: {
          block_id?: string
          created_at?: string
          discipline?: Database["public"]["Enums"]["discipline"]
          duration_minutes?: number
          environment?: Database["public"]["Enums"]["session_environment"]
          fueling_notes?: string | null
          id?: string
          moved_from_date?: string | null
          plan_id?: string
          purpose_text?: string | null
          scheduled_date?: string
          session_type?: Database["public"]["Enums"]["session_type"]
          status?: Database["public"]["Enums"]["session_status"]
          structured_workout?: Json | null
          target_tss?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sessions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "plan_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      training_load: {
        Row: {
          atl: number
          created_at: string
          ctl: number
          discipline: Database["public"]["Enums"]["discipline"] | null
          id: string
          load_date: string
          tsb: number
          user_id: string
        }
        Insert: {
          atl: number
          created_at?: string
          ctl: number
          discipline?: Database["public"]["Enums"]["discipline"] | null
          id?: string
          load_date: string
          tsb: number
          user_id: string
        }
        Update: {
          atl?: number
          created_at?: string
          ctl?: number
          discipline?: Database["public"]["Enums"]["discipline"] | null
          id?: string
          load_date?: string
          tsb?: number
          user_id?: string
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
      activity_source: "manual" | "strava" | "garmin" | "healthkit"
      adaptation_change:
        | "reschedule"
        | "reduce_volume"
        | "replace_session"
        | "insert_recovery"
      adaptation_trigger:
        | "user_skip"
        | "readiness"
        | "life_event"
        | "illness"
        | "injury"
        | "missed_streak"
      block_type: "base" | "build" | "peak" | "taper" | "race_week" | "recovery"
      course_profile: "flat" | "rolling" | "hilly" | "very_hilly"
      discipline:
        | "swim"
        | "bike"
        | "run"
        | "brick"
        | "strength"
        | "mobility"
        | "rest"
      equipment_type:
        | "bike"
        | "wetsuit"
        | "running_shoes"
        | "trainer"
        | "power_meter"
      experience_level: "new" | "developing" | "experienced" | "advanced"
      metric_source: "manual" | "test" | "device_estimated" | "inferred"
      metric_type: "ftp" | "threshold_pace" | "css" | "threshold_hr" | "max_hr"
      plan_status: "active" | "superseded" | "paused" | "completed"
      plan_type: "race_build" | "base" | "off_season" | "return_from_injury"
      race_confidence: "low" | "medium" | "high"
      race_distance:
        | "sprint"
        | "olympic"
        | "half_ironman"
        | "ironman"
        | "custom"
      race_priority: "A" | "B" | "C"
      readiness_recommendation: "green" | "yellow" | "red" | "rest"
      session_environment: "outdoor" | "indoor" | "pool" | "open_water"
      session_status:
        | "scheduled"
        | "completed"
        | "skipped"
        | "moved"
        | "modified"
      session_type:
        | "easy"
        | "tempo"
        | "threshold"
        | "vo2"
        | "long"
        | "race_pace"
        | "recovery"
        | "open_water"
        | "brick"
      swim_type: "pool" | "lake" | "sea" | "river"
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
      activity_source: ["manual", "strava", "garmin", "healthkit"],
      adaptation_change: [
        "reschedule",
        "reduce_volume",
        "replace_session",
        "insert_recovery",
      ],
      adaptation_trigger: [
        "user_skip",
        "readiness",
        "life_event",
        "illness",
        "injury",
        "missed_streak",
      ],
      block_type: ["base", "build", "peak", "taper", "race_week", "recovery"],
      course_profile: ["flat", "rolling", "hilly", "very_hilly"],
      discipline: [
        "swim",
        "bike",
        "run",
        "brick",
        "strength",
        "mobility",
        "rest",
      ],
      equipment_type: [
        "bike",
        "wetsuit",
        "running_shoes",
        "trainer",
        "power_meter",
      ],
      experience_level: ["new", "developing", "experienced", "advanced"],
      metric_source: ["manual", "test", "device_estimated", "inferred"],
      metric_type: ["ftp", "threshold_pace", "css", "threshold_hr", "max_hr"],
      plan_status: ["active", "superseded", "paused", "completed"],
      plan_type: ["race_build", "base", "off_season", "return_from_injury"],
      race_confidence: ["low", "medium", "high"],
      race_distance: ["sprint", "olympic", "half_ironman", "ironman", "custom"],
      race_priority: ["A", "B", "C"],
      readiness_recommendation: ["green", "yellow", "red", "rest"],
      session_environment: ["outdoor", "indoor", "pool", "open_water"],
      session_status: [
        "scheduled",
        "completed",
        "skipped",
        "moved",
        "modified",
      ],
      session_type: [
        "easy",
        "tempo",
        "threshold",
        "vo2",
        "long",
        "race_pace",
        "recovery",
        "open_water",
        "brick",
      ],
      swim_type: ["pool", "lake", "sea", "river"],
    },
  },
} as const
