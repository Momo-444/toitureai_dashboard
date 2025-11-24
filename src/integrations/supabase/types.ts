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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      chantiers: {
        Row: {
          adresse: string | null
          avancement_pct: number | null
          created_at: string
          date_debut: string | null
          date_fin_prevue: string | null
          date_fin_reelle: string | null
          devis_id: string | null
          id: string
          lead_id: string | null
          nom_client: string
          notes: string | null
          statut: string
          type_projet: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          avancement_pct?: number | null
          created_at?: string
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          devis_id?: string | null
          id?: string
          lead_id?: string | null
          nom_client: string
          notes?: string | null
          statut?: string
          type_projet?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          avancement_pct?: number | null
          created_at?: string
          date_debut?: string | null
          date_fin_prevue?: string | null
          date_fin_reelle?: string | null
          devis_id?: string | null
          id?: string
          lead_id?: string | null
          nom_client?: string
          notes?: string | null
          statut?: string
          type_projet?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chantiers_devis_id_fkey"
            columns: ["devis_id"]
            isOneToOne: false
            referencedRelation: "devis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chantiers_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      configuration: {
        Row: {
          adresse: string | null
          created_at: string
          email: string | null
          id: string
          logo_url: string | null
          nom_entreprise: string
          siret: string | null
          telephone: string | null
          tva_numero: string | null
          updated_at: string
        }
        Insert: {
          adresse?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nom_entreprise?: string
          siret?: string | null
          telephone?: string | null
          tva_numero?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string | null
          created_at?: string
          email?: string | null
          id?: string
          logo_url?: string | null
          nom_entreprise?: string
          siret?: string | null
          telephone?: string | null
          tva_numero?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      devis: {
        Row: {
          client_adresse: string | null
          client_email: string | null
          client_nom: string
          client_telephone: string | null
          created_at: string
          date_creation: string
          date_validite: string | null
          id: string
          lead_id: string | null
          montant_ht: number
          montant_ttc: number
          notes: string | null
          numero: string
          statut: string
          tva_pct: number
          updated_at: string
          url_pdf: string | null
        }
        Insert: {
          client_adresse?: string | null
          client_email?: string | null
          client_nom: string
          client_telephone?: string | null
          created_at?: string
          date_creation?: string
          date_validite?: string | null
          id?: string
          lead_id?: string | null
          montant_ht?: number
          montant_ttc?: number
          notes?: string | null
          numero: string
          statut?: string
          tva_pct?: number
          updated_at?: string
          url_pdf?: string | null
        }
        Update: {
          client_adresse?: string | null
          client_email?: string | null
          client_nom?: string
          client_telephone?: string | null
          created_at?: string
          date_creation?: string
          date_validite?: string | null
          id?: string
          lead_id?: string | null
          montant_ht?: number
          montant_ttc?: number
          notes?: string | null
          numero?: string
          statut?: string
          tva_pct?: number
          updated_at?: string
          url_pdf?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devis_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          adresse: string | null
          ai_notes: string | null
          ai_raw: string | null
          ai_segments: string | null
          budget_estime: number | null
          clique: string | null
          code_postal: string | null
          created_at: string
          delai: string | null
          derniere_interaction: string | null
          description: string | null
          email: string | null
          id: string
          ip_address: string | null
          lead_chaud: string | null
          nom: string
          ouvert: string | null
          prenom: string | null
          score_qualification: number | null
          source: string | null
          statut: string
          surface: number | null
          telephone: string | null
          type_projet: string | null
          updated_at: string
          urgence: string | null
          user_agent: string | null
          ville: string | null
        }
        Insert: {
          adresse?: string | null
          ai_notes?: string | null
          ai_raw?: string | null
          ai_segments?: string | null
          budget_estime?: number | null
          clique?: string | null
          code_postal?: string | null
          created_at?: string
          delai?: string | null
          derniere_interaction?: string | null
          description?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          lead_chaud?: string | null
          nom: string
          ouvert?: string | null
          prenom?: string | null
          score_qualification?: number | null
          source?: string | null
          statut?: string
          surface?: number | null
          telephone?: string | null
          type_projet?: string | null
          updated_at?: string
          urgence?: string | null
          user_agent?: string | null
          ville?: string | null
        }
        Update: {
          adresse?: string | null
          ai_notes?: string | null
          ai_raw?: string | null
          ai_segments?: string | null
          budget_estime?: number | null
          clique?: string | null
          code_postal?: string | null
          created_at?: string
          delai?: string | null
          derniere_interaction?: string | null
          description?: string | null
          email?: string | null
          id?: string
          ip_address?: string | null
          lead_chaud?: string | null
          nom?: string
          ouvert?: string | null
          prenom?: string | null
          score_qualification?: number | null
          source?: string | null
          statut?: string
          surface?: number | null
          telephone?: string | null
          type_projet?: string | null
          updated_at?: string
          urgence?: string | null
          user_agent?: string | null
          ville?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "secretaire" | "lecteur"
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
      app_role: ["admin", "secretaire", "lecteur"],
    },
  },
} as const
