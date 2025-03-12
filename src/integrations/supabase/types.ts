export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          address: string | null
          company: string
          created_at: string | null
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          company: string
          created_at?: string | null
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          company?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment: {
        Row: {
          acquisition_date: string | null
          brand: string | null
          category: string | null
          created_at: string | null
          id: string
          image_url: string | null
          model: string | null
          name: string
          notes: string | null
          serial_number: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          acquisition_date?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          name: string
          notes?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          acquisition_date?: string | null
          brand?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          image_url?: string | null
          model?: string | null
          name?: string
          notes?: string | null
          serial_number?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      equipment_schedules: {
        Row: {
          created_at: string | null
          end_date: string
          equipment_id: string
          id: string
          notes: string | null
          production_id: string | null
          start_date: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          end_date: string
          equipment_id: string
          id?: string
          notes?: string | null
          production_id?: string | null
          start_date: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          end_date?: string
          equipment_id?: string
          id?: string
          notes?: string | null
          production_id?: string | null
          start_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "equipment_schedules_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_schedules_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "productions"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment_withdrawals: {
        Row: {
          equipment_id: string
          expected_return_date: string
          id: string
          is_personal_use: boolean | null
          notes: string | null
          production_id: string | null
          return_notes: string | null
          returned_date: string | null
          status: string
          updated_at: string | null
          user_id: string
          user_profile_id: string | null
          withdrawal_date: string | null
        }
        Insert: {
          equipment_id: string
          expected_return_date: string
          id?: string
          is_personal_use?: boolean | null
          notes?: string | null
          production_id?: string | null
          return_notes?: string | null
          returned_date?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
          user_profile_id?: string | null
          withdrawal_date?: string | null
        }
        Update: {
          equipment_id?: string
          expected_return_date?: string
          id?: string
          is_personal_use?: boolean | null
          notes?: string | null
          production_id?: string | null
          return_notes?: string | null
          returned_date?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
          user_profile_id?: string | null
          withdrawal_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "equipment_withdrawals_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_withdrawals_production_id_fkey"
            columns: ["production_id"]
            isOneToOne: false
            referencedRelation: "productions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "equipment_withdrawals_user_profile_id_fkey"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_user_profile"
            columns: ["user_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      productions: {
        Row: {
          briefing_file: string | null
          budget: number | null
          client_id: string | null
          client_name: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          id: string
          location: string | null
          start_date: string | null
          start_time: string | null
          status: string | null
          team_members: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          briefing_file?: string | null
          budget?: number | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string | null
          team_members?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          briefing_file?: string | null
          budget?: number | null
          client_id?: string | null
          client_name?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          start_date?: string | null
          start_time?: string | null
          status?: string | null
          team_members?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
