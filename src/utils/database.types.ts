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
      groups: {
        Row: {
          competition_id: number | null
          cube_type_id: number | null
          id: number
          name: string
          round_id: number | null
          scramble: string
        }
        Insert: {
          competition_id?: number | null
          cube_type_id?: number | null
          id?: number
          name: string
          round_id?: number | null
          scramble: string
        }
        Update: {
          competition_id?: number | null
          cube_type_id?: number | null
          id?: number
          name?: string
          round_id?: number | null
          scramble?: string
        }
        Relationships: [
          {
            foreignKeyName: "groups_competition_id_nomad_competition_competitions_id_fk"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_cube_type_id_nomad_competition_cube_types_id_fk"
            columns: ["cube_type_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_cube_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "groups_round_id_nomad_competition_rounds_id_fk"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_account: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id_token: string | null
          provider: string
          providerAccountId: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          userId: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id_token?: string | null
          provider: string
          providerAccountId: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          userId: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id_token?: string | null
          provider?: string
          providerAccountId?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_account_userId_nomad_competition_user_id_fk"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "nomad_competition_user"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_age_groups: {
        Row: {
          competition_id: number
          cube_type_id: number
          end: number | null
          id: number
          name: string
          order: number
          start: number
        }
        Insert: {
          competition_id: number
          cube_type_id: number
          end?: number | null
          id?: number
          name: string
          order?: number
          start: number
        }
        Update: {
          competition_id?: number
          cube_type_id?: number
          end?: number | null
          id?: number
          name?: string
          order?: number
          start?: number
        }
        Relationships: [
          {
            foreignKeyName: "age_groups_cube_type_id_cube_types_id_fk"
            columns: ["cube_type_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_cube_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_age_groups_competition_id_nomad_competition_c"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_age_groups_cube_type_id_nomad_competition_cub"
            columns: ["cube_type_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_cube_types"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_competitions: {
        Row: {
          address: string
          address_link: string | null
          base_fee: number
          contact: string | null
          end_date: string
          free_guests: number
          guest_fee: number
          id: number
          image: string | null
          max_competitors: number
          name: string
          register_end_date: string | null
          register_start_date: string | null
          registration_requirments: string | null
          slug: string
          start_date: string
        }
        Insert: {
          address: string
          address_link?: string | null
          base_fee?: number
          contact?: string | null
          end_date: string
          free_guests?: number
          guest_fee?: number
          id?: number
          image?: string | null
          max_competitors: number
          name: string
          register_end_date?: string | null
          register_start_date?: string | null
          registration_requirments?: string | null
          slug: string
          start_date: string
        }
        Update: {
          address?: string
          address_link?: string | null
          base_fee?: number
          contact?: string | null
          end_date?: string
          free_guests?: number
          guest_fee?: number
          id?: number
          image?: string | null
          max_competitors?: number
          name?: string
          register_end_date?: string | null
          register_start_date?: string | null
          registration_requirments?: string | null
          slug?: string
          start_date?: string
        }
        Relationships: []
      }
      nomad_competition_competitions_to_cube_type: {
        Row: {
          competition_id: number
          cube_type_id: number
        }
        Insert: {
          competition_id: number
          cube_type_id: number
        }
        Update: {
          competition_id?: number
          cube_type_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_competitions_to_cube_type_competition_id_noma"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_competitions_to_cube_type_cube_type_id_nomad_"
            columns: ["cube_type_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_cube_types"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_competitors: {
        Row: {
          competition_id: number
          description: string | null
          guest_count: number
          id: number
          requested_at: string
          status: Database["public"]["Enums"]["competitor_status"]
          user_id: string
          verified_at: string | null
        }
        Insert: {
          competition_id: number
          description?: string | null
          guest_count?: number
          id?: number
          requested_at?: string
          status?: Database["public"]["Enums"]["competitor_status"]
          user_id: string
          verified_at?: string | null
        }
        Update: {
          competition_id?: number
          description?: string | null
          guest_count?: number
          id?: number
          requested_at?: string
          status?: Database["public"]["Enums"]["competitor_status"]
          user_id?: string
          verified_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_competitors_competition_id_nomad_competition_"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_competitors_user_id_nomad_competition_user_id"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_user"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_competitors_to_cube_types: {
        Row: {
          competitor_id: number
          cube_type_id: number
          status: Database["public"]["Enums"]["competitor_cube_type_status"]
        }
        Insert: {
          competitor_id: number
          cube_type_id: number
          status?: Database["public"]["Enums"]["competitor_cube_type_status"]
        }
        Update: {
          competitor_id?: number
          cube_type_id?: number
          status?: Database["public"]["Enums"]["competitor_cube_type_status"]
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_competitors_to_cube_types_competitor_id_nomad"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_competitors_to_cube_types_cube_type_id_nomad_"
            columns: ["cube_type_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_cube_types"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_cube_types: {
        Row: {
          id: number
          image: string | null
          name: string
          order: number
          scramble_mapper: string | null
          type: Database["public"]["Enums"]["result_type"]
        }
        Insert: {
          id?: number
          image?: string | null
          name: string
          order?: number
          scramble_mapper?: string | null
          type?: Database["public"]["Enums"]["result_type"]
        }
        Update: {
          id?: number
          image?: string | null
          name?: string
          order?: number
          scramble_mapper?: string | null
          type?: Database["public"]["Enums"]["result_type"]
        }
        Relationships: []
      }
      nomad_competition_fees: {
        Row: {
          amount: number
          competition_id: number | null
          cube_type_id: number
          id: number
        }
        Insert: {
          amount?: number
          competition_id?: number | null
          cube_type_id: number
          id?: number
        }
        Update: {
          amount?: number
          competition_id?: number | null
          cube_type_id?: number
          id?: number
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_fees_competition_id_nomad_competition_competi"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_fees_cube_type_id_nomad_competition_cube_type"
            columns: ["cube_type_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_cube_types"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_invoices: {
        Row: {
          amount: number
          competitor_id: number
          created_at: string
          cube_type_ids: number[] | null
          guest_count: number
          has_competition_fee: boolean
          id: number
          invoice_code: string | null
          is_paid: boolean
          payment_result: Json | null
          user_id: string
        }
        Insert: {
          amount: number
          competitor_id: number
          created_at?: string
          cube_type_ids?: number[] | null
          guest_count?: number
          has_competition_fee?: boolean
          id?: number
          invoice_code?: string | null
          is_paid?: boolean
          payment_result?: Json | null
          user_id: string
        }
        Update: {
          amount?: number
          competitor_id?: number
          created_at?: string
          cube_type_ids?: number[] | null
          guest_count?: number
          has_competition_fee?: boolean
          id?: number
          invoice_code?: string | null
          is_paid?: boolean
          payment_result?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_invoices_competitor_id_nomad_competition_comp"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_invoices_user_id_nomad_competition_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_user"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_qpay: {
        Row: {
          access_expires_at: string
          access_token: string
          refresh_expires_at: string
          refresh_token: string
          type: Database["public"]["Enums"]["payment_type"]
        }
        Insert: {
          access_expires_at: string
          access_token: string
          refresh_expires_at: string
          refresh_token: string
          type: Database["public"]["Enums"]["payment_type"]
        }
        Update: {
          access_expires_at?: string
          access_token?: string
          refresh_expires_at?: string
          refresh_token?: string
          type?: Database["public"]["Enums"]["payment_type"]
        }
        Relationships: []
      }
      nomad_competition_results: {
        Row: {
          average: number | null
          best: number | null
          competition_id: number
          competitor_id: number
          created_user_id: string
          cube_type_id: number
          group: string
          id: number
          round_id: number
          solve1: number | null
          solve2: number | null
          solve3: number | null
          solve4: number | null
          solve5: number | null
          type: Database["public"]["Enums"]["result_type"]
          updated_user_id: string
        }
        Insert: {
          average?: number | null
          best?: number | null
          competition_id: number
          competitor_id: number
          created_user_id: string
          cube_type_id: number
          group: string
          id?: number
          round_id: number
          solve1?: number | null
          solve2?: number | null
          solve3?: number | null
          solve4?: number | null
          solve5?: number | null
          type: Database["public"]["Enums"]["result_type"]
          updated_user_id: string
        }
        Update: {
          average?: number | null
          best?: number | null
          competition_id?: number
          competitor_id?: number
          created_user_id?: string
          cube_type_id?: number
          group?: string
          id?: number
          round_id?: number
          solve1?: number | null
          solve2?: number | null
          solve3?: number | null
          solve4?: number | null
          solve5?: number | null
          type?: Database["public"]["Enums"]["result_type"]
          updated_user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_results_competition_id_nomad_competition_comp"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_results_competitor_id_nomad_competition_compe"
            columns: ["competitor_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_results_created_user_id_nomad_competition_use"
            columns: ["created_user_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_user"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_results_cube_type_id_nomad_competition_cube_t"
            columns: ["cube_type_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_cube_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_results_round_id_nomad_competition_rounds_id_"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_rounds"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_results_updated_user_id_nomad_competition_use"
            columns: ["updated_user_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_user"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_rounds: {
        Row: {
          competition_id: number
          cube_type_id: number
          id: number
          is_duel: boolean | null
          name: string
          next_competitor: number
          per_group_count: number
        }
        Insert: {
          competition_id: number
          cube_type_id: number
          id?: number
          is_duel?: boolean | null
          name: string
          next_competitor: number
          per_group_count: number
        }
        Update: {
          competition_id?: number
          cube_type_id?: number
          id?: number
          is_duel?: boolean | null
          name?: string
          next_competitor?: number
          per_group_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_rounds_competition_id_nomad_competition_compe"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_rounds_cube_type_id_nomad_competition_cube_ty"
            columns: ["cube_type_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_cube_types"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_schedules: {
        Row: {
          competition_id: number
          competitor_limit: number | null
          cut_off: string | null
          date: string
          end_time: string
          id: number
          name: string
          round_id: number | null
          start_time: string
          time_limit: string | null
        }
        Insert: {
          competition_id: number
          competitor_limit?: number | null
          cut_off?: string | null
          date: string
          end_time: string
          id?: number
          name: string
          round_id?: number | null
          start_time: string
          time_limit?: string | null
        }
        Update: {
          competition_id?: number
          competitor_limit?: number | null
          cut_off?: string | null
          date?: string
          end_time?: string
          id?: number
          name?: string
          round_id?: number | null
          start_time?: string
          time_limit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_schedules_competition_id_nomad_competition_co"
            columns: ["competition_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_competitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nomad_competition_schedules_round_id_nomad_competition_rounds_i"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "nomad_competition_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_session: {
        Row: {
          expires: string
          sessionToken: string
          userId: string
        }
        Insert: {
          expires: string
          sessionToken: string
          userId: string
        }
        Update: {
          expires?: string
          sessionToken?: string
          userId?: string
        }
        Relationships: [
          {
            foreignKeyName: "nomad_competition_session_userId_nomad_competition_user_id_fk"
            columns: ["userId"]
            isOneToOne: false
            referencedRelation: "nomad_competition_user"
            referencedColumns: ["id"]
          },
        ]
      }
      nomad_competition_user: {
        Row: {
          birth_date: string
          email: string
          emailVerified: string | null
          firstname: string
          id: string
          image: string | null
          is_admin: boolean
          is_male: boolean
          lastname: string
          password: string
          phone: number
          wca_id: string | null
        }
        Insert: {
          birth_date: string
          email: string
          emailVerified?: string | null
          firstname: string
          id: string
          image?: string | null
          is_admin?: boolean
          is_male?: boolean
          lastname: string
          password: string
          phone: number
          wca_id?: string | null
        }
        Update: {
          birth_date?: string
          email?: string
          emailVerified?: string | null
          firstname?: string
          id?: string
          image?: string | null
          is_admin?: boolean
          is_male?: boolean
          lastname?: string
          password?: string
          phone?: number
          wca_id?: string | null
        }
        Relationships: []
      }
      nomad_competition_verificationToken: {
        Row: {
          expires: string
          identifier: string
          token: string
        }
        Insert: {
          expires: string
          identifier: string
          token: string
        }
        Update: {
          expires?: string
          identifier?: string
          token?: string
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
      competitor_cube_type_status: "Created" | "Paid" | "Cancelled"
      competitor_status: "Created" | "Verified" | "Cancelled"
      payment_type: "qpay"
      result_type: "ao5" | "ao3"
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
