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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      documentos: {
        Row: {
          arquivo_path: string | null
          arquivo_url: string | null
          data_upload: string
          id: string
          nome: string
          observacao: string | null
          pasta: string
          processo_id: string
          tipo: string
        }
        Insert: {
          arquivo_path?: string | null
          arquivo_url?: string | null
          data_upload?: string
          id?: string
          nome: string
          observacao?: string | null
          pasta?: string
          processo_id: string
          tipo: string
        }
        Update: {
          arquivo_path?: string | null
          arquivo_url?: string | null
          data_upload?: string
          id?: string
          nome?: string
          observacao?: string | null
          pasta?: string
          processo_id?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "documentos_processo_id_fkey"
            columns: ["processo_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      grupos: {
        Row: {
          id: string
          nome: string
        }
        Insert: {
          id?: string
          nome: string
        }
        Update: {
          id?: string
          nome?: string
        }
        Relationships: []
      }
      processos: {
        Row: {
          atualizado_em: string
          autor: string
          categoria: string
          cliente_escritorio: string
          competencia: string
          criado_em: string
          estado: string
          fase_atual: string
          grupo_id: string | null
          id: string
          numero: string
          origem: string
          primeira_instancia_comarca: string | null
          primeira_instancia_numero: string | null
          primeira_instancia_vara: string | null
          reu: string | null
          segunda_instancia_numero: string | null
          segunda_instancia_tipo_recurso: string | null
          segunda_instancia_tribunal: string | null
          segunda_instancia_turma_camara: string | null
          senha_acesso: string
          sistema_acesso: string
          status: string
          telefone_assessoria: string
          telefone_secretaria: string
          tipo_acao: string
          tribunal_superior_nome: string | null
          tribunal_superior_numero: string | null
          tribunal_superior_turma: string | null
          ultima_movimentacao: string
          vara_camara_turma: string
        }
        Insert: {
          atualizado_em?: string
          autor: string
          categoria: string
          cliente_escritorio: string
          competencia: string
          criado_em?: string
          estado?: string
          fase_atual?: string
          grupo_id?: string | null
          id?: string
          numero: string
          origem?: string
          primeira_instancia_comarca?: string | null
          primeira_instancia_numero?: string | null
          primeira_instancia_vara?: string | null
          reu?: string | null
          segunda_instancia_numero?: string | null
          segunda_instancia_tipo_recurso?: string | null
          segunda_instancia_tribunal?: string | null
          segunda_instancia_turma_camara?: string | null
          senha_acesso?: string
          sistema_acesso?: string
          status?: string
          telefone_assessoria?: string
          telefone_secretaria?: string
          tipo_acao?: string
          tribunal_superior_nome?: string | null
          tribunal_superior_numero?: string | null
          tribunal_superior_turma?: string | null
          ultima_movimentacao?: string
          vara_camara_turma?: string
        }
        Update: {
          atualizado_em?: string
          autor?: string
          categoria?: string
          cliente_escritorio?: string
          competencia?: string
          criado_em?: string
          estado?: string
          fase_atual?: string
          grupo_id?: string | null
          id?: string
          numero?: string
          origem?: string
          primeira_instancia_comarca?: string | null
          primeira_instancia_numero?: string | null
          primeira_instancia_vara?: string | null
          reu?: string | null
          segunda_instancia_numero?: string | null
          segunda_instancia_tipo_recurso?: string | null
          segunda_instancia_tribunal?: string | null
          segunda_instancia_turma_camara?: string | null
          senha_acesso?: string
          sistema_acesso?: string
          status?: string
          telefone_assessoria?: string
          telefone_secretaria?: string
          tipo_acao?: string
          tribunal_superior_nome?: string | null
          tribunal_superior_numero?: string | null
          tribunal_superior_turma?: string | null
          ultima_movimentacao?: string
          vara_camara_turma?: string
        }
        Relationships: [
          {
            foreignKeyName: "processos_grupo_id_fkey"
            columns: ["grupo_id"]
            isOneToOne: false
            referencedRelation: "grupos"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
