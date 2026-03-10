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
      categorias: {
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
          sistema_acesso: string | null
          status: string
          telefone_assessoria: string | null
          telefone_secretaria: string | null
          tipo_acao: string
          tribunal_primeira_instancia: string | null
          tribunal_superior_nome: string | null
          tribunal_superior_numero: string | null
          tribunal_superior_turma: string | null
          ultima_movimentacao: string
          vara_camara_turma: string | null
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
          sistema_acesso?: string | null
          status?: string
          telefone_assessoria?: string | null
          telefone_secretaria?: string | null
          tipo_acao?: string
          tribunal_primeira_instancia?: string | null
          tribunal_superior_nome?: string | null
          tribunal_superior_numero?: string | null
          tribunal_superior_turma?: string | null
          ultima_movimentacao?: string
          vara_camara_turma?: string | null
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
          sistema_acesso?: string | null
          status?: string
          telefone_assessoria?: string | null
          telefone_secretaria?: string | null
          tipo_acao?: string
          tribunal_primeira_instancia?: string | null
          tribunal_superior_nome?: string | null
          tribunal_superior_numero?: string | null
          tribunal_superior_turma?: string | null
          ultima_movimentacao?: string
          vara_camara_turma?: string | null
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
      processos_vinculados: {
        Row: {
          created_at: string
          id: string
          numero_processo_vinculado: string | null
          processo_origem_id: string
          processo_vinculado_id: string | null
          tipo_vinculo: string
        }
        Insert: {
          created_at?: string
          id?: string
          numero_processo_vinculado?: string | null
          processo_origem_id: string
          processo_vinculado_id?: string | null
          tipo_vinculo: string
        }
        Update: {
          created_at?: string
          id?: string
          numero_processo_vinculado?: string | null
          processo_origem_id?: string
          processo_vinculado_id?: string | null
          tipo_vinculo?: string
        }
        Relationships: [
          {
            foreignKeyName: "processos_vinculados_processo_origem_id_fkey"
            columns: ["processo_origem_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "processos_vinculados_processo_vinculado_id_fkey"
            columns: ["processo_vinculado_id"]
            isOneToOne: false
            referencedRelation: "processos"
            referencedColumns: ["id"]
          },
        ]
      }
      tipos_vinculo: {
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
      tribunais: {
        Row: {
          estado: string | null
          id: string
          nome: string
          sigla: string
        }
        Insert: {
          estado?: string | null
          id?: string
          nome: string
          sigla: string
        }
        Update: {
          estado?: string | null
          id?: string
          nome?: string
          sigla?: string
        }
        Relationships: []
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
