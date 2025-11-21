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
      agendamentos: {
        Row: {
          atualizado_em: string | null
          cancelado_em: string | null
          cancelado_motivo: string | null
          categoria: string
          criado_em: string | null
          criado_por: string | null
          data: string
          duracao_horas: number
          horario_fim: string
          horario_inicio: string
          id: string
          os_id: string | null
          setor: string
          solicitante_contato: string | null
          solicitante_nome: string | null
          solicitante_observacoes: string | null
          status: string
          turno_id: string
        }
        Insert: {
          atualizado_em?: string | null
          cancelado_em?: string | null
          cancelado_motivo?: string | null
          categoria: string
          criado_em?: string | null
          criado_por?: string | null
          data: string
          duracao_horas?: number
          horario_fim: string
          horario_inicio: string
          id?: string
          os_id?: string | null
          setor: string
          solicitante_contato?: string | null
          solicitante_nome?: string | null
          solicitante_observacoes?: string | null
          status?: string
          turno_id: string
        }
        Update: {
          atualizado_em?: string | null
          cancelado_em?: string | null
          cancelado_motivo?: string | null
          categoria?: string
          criado_em?: string | null
          criado_por?: string | null
          data?: string
          duracao_horas?: number
          horario_fim?: string
          horario_inicio?: string
          id?: string
          os_id?: string | null
          setor?: string
          solicitante_contato?: string | null
          solicitante_nome?: string | null
          solicitante_observacoes?: string | null
          status?: string
          turno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_etapas_pendentes_aprovacao"
            referencedColumns: ["os_id"]
          },
          {
            foreignKeyName: "agendamentos_turno_id_fkey"
            columns: ["turno_id"]
            isOneToOne: false
            referencedRelation: "turnos"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          acao: string
          created_at: string
          dados_antigos: Json | null
          dados_novos: Json | null
          id: string
          registro_id_afetado: string
          tabela_afetada: string
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id_afetado: string
          tabela_afetada: string
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id_afetado?: string
          tabela_afetada?: string
          usuario_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "audit_log_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      centros_custo: {
        Row: {
          cliente_id: string | null
          id: string
          nome: string
          status_cc: Database["public"]["Enums"]["os_status_geral"] | null
          tipo: Database["public"]["Enums"]["cc_tipo"]
          valor_global: number | null
        }
        Insert: {
          cliente_id?: string | null
          id?: string
          nome: string
          status_cc?: Database["public"]["Enums"]["os_status_geral"] | null
          tipo: Database["public"]["Enums"]["cc_tipo"]
          valor_global?: number | null
        }
        Update: {
          cliente_id?: string | null
          id?: string
          nome?: string
          status_cc?: Database["public"]["Enums"]["os_status_geral"] | null
          tipo?: Database["public"]["Enums"]["cc_tipo"]
          valor_global?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "centros_custo_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
        ]
      }
      clientes: {
        Row: {
          cpf_cnpj: string | null
          created_at: string
          email: string | null
          endereco: Json | null
          id: string
          nome_razao_social: string
          nome_responsavel: string | null
          observacoes: string | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["cliente_status"]
          telefone: string | null
          tipo_cliente: Database["public"]["Enums"]["cliente_tipo"] | null
        }
        Insert: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: Json | null
          id?: string
          nome_razao_social: string
          nome_responsavel?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["cliente_status"]
          telefone?: string | null
          tipo_cliente?: Database["public"]["Enums"]["cliente_tipo"] | null
        }
        Update: {
          cpf_cnpj?: string | null
          created_at?: string
          email?: string | null
          endereco?: Json | null
          id?: string
          nome_razao_social?: string
          nome_responsavel?: string | null
          observacoes?: string | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["cliente_status"]
          telefone?: string | null
          tipo_cliente?: Database["public"]["Enums"]["cliente_tipo"] | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      colaborador_alocacoes_cc: {
        Row: {
          cc_id: string
          colaborador_id: string
          percentual_alocado: number
        }
        Insert: {
          cc_id: string
          colaborador_id: string
          percentual_alocado: number
        }
        Update: {
          cc_id?: string
          colaborador_id?: string
          percentual_alocado?: number
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_alocacoes_cc_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_alocacoes_cc_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_alocacoes_cc_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      colaborador_performance: {
        Row: {
          avaliacao: Database["public"]["Enums"]["performance_avaliacao"]
          avaliador_id: string
          colaborador_id: string
          data_avaliacao: string
          id: string
          justificativa: string | null
        }
        Insert: {
          avaliacao: Database["public"]["Enums"]["performance_avaliacao"]
          avaliador_id: string
          colaborador_id: string
          data_avaliacao?: string
          id?: string
          justificativa?: string | null
        }
        Update: {
          avaliacao?: Database["public"]["Enums"]["performance_avaliacao"]
          avaliador_id?: string
          colaborador_id?: string
          data_avaliacao?: string
          id?: string
          justificativa?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_performance_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_performance_avaliador_id_fkey"
            columns: ["avaliador_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_performance_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_performance_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      colaborador_presenca: {
        Row: {
          colaborador_id: string
          data: string
          id: string
          justificativa: string | null
          registrado_por_id: string | null
          status: Database["public"]["Enums"]["presenca_status"]
        }
        Insert: {
          colaborador_id: string
          data: string
          id?: string
          justificativa?: string | null
          registrado_por_id?: string | null
          status: Database["public"]["Enums"]["presenca_status"]
        }
        Update: {
          colaborador_id?: string
          data?: string
          id?: string
          justificativa?: string | null
          registrado_por_id?: string | null
          status?: Database["public"]["Enums"]["presenca_status"]
        }
        Relationships: [
          {
            foreignKeyName: "colaborador_presenca_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_presenca_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_presenca_registrado_por_id_fkey"
            columns: ["registrado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaborador_presenca_registrado_por_id_fkey"
            columns: ["registrado_por_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          ativo: boolean | null
          cpf: string | null
          custo_mensal: number | null
          data_admissao: string | null
          data_demissao: string | null
          email: string | null
          id: string
          nome_completo: string
          role_nivel: Database["public"]["Enums"]["user_role_nivel"]
          setor: Database["public"]["Enums"]["user_setor"] | null
          telefone: string | null
        }
        Insert: {
          ativo?: boolean | null
          cpf?: string | null
          custo_mensal?: number | null
          data_admissao?: string | null
          data_demissao?: string | null
          email?: string | null
          id: string
          nome_completo: string
          role_nivel?: Database["public"]["Enums"]["user_role_nivel"]
          setor?: Database["public"]["Enums"]["user_setor"] | null
          telefone?: string | null
        }
        Update: {
          ativo?: boolean | null
          cpf?: string | null
          custo_mensal?: number | null
          data_admissao?: string | null
          data_demissao?: string | null
          email?: string | null
          id?: string
          nome_completo?: string
          role_nivel?: Database["public"]["Enums"]["user_role_nivel"]
          setor?: Database["public"]["Enums"]["user_setor"] | null
          telefone?: string | null
        }
        Relationships: []
      }
      delegacoes: {
        Row: {
          created_at: string
          data_prazo: string | null
          delegado_id: string
          delegado_nome: string
          delegante_id: string
          delegante_nome: string
          descricao_tarefa: string
          id: string
          observacoes: string | null
          os_id: string
          status_delegacao: Database["public"]["Enums"]["delegacao_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_prazo?: string | null
          delegado_id: string
          delegado_nome: string
          delegante_id: string
          delegante_nome: string
          descricao_tarefa: string
          id?: string
          observacoes?: string | null
          os_id: string
          status_delegacao?: Database["public"]["Enums"]["delegacao_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_prazo?: string | null
          delegado_id?: string
          delegado_nome?: string
          delegante_id?: string
          delegante_nome?: string
          descricao_tarefa?: string
          id?: string
          observacoes?: string | null
          os_id?: string
          status_delegacao?: Database["public"]["Enums"]["delegacao_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "delegacoes_delegado_id_fkey"
            columns: ["delegado_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegacoes_delegado_id_fkey"
            columns: ["delegado_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegacoes_delegante_id_fkey"
            columns: ["delegante_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegacoes_delegante_id_fkey"
            columns: ["delegante_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegacoes_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegacoes_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_etapas_pendentes_aprovacao"
            referencedColumns: ["os_id"]
          },
        ]
      }
      financeiro_lancamentos: {
        Row: {
          cc_id: string | null
          cliente_id: string | null
          conciliado: boolean
          criado_por_id: string
          data_pagamento: string | null
          data_vencimento: string
          descricao: string
          id: string
          recorrencia: Json | null
          tipo: Database["public"]["Enums"]["financeiro_tipo"]
          url_nota_fiscal: string | null
          valor: number
        }
        Insert: {
          cc_id?: string | null
          cliente_id?: string | null
          conciliado?: boolean
          criado_por_id: string
          data_pagamento?: string | null
          data_vencimento: string
          descricao: string
          id?: string
          recorrencia?: Json | null
          tipo?: Database["public"]["Enums"]["financeiro_tipo"]
          url_nota_fiscal?: string | null
          valor: number
        }
        Update: {
          cc_id?: string | null
          cliente_id?: string | null
          conciliado?: boolean
          criado_por_id?: string
          data_pagamento?: string | null
          data_vencimento?: string
          descricao?: string
          id?: string
          recorrencia?: Json | null
          tipo?: Database["public"]["Enums"]["financeiro_tipo"]
          url_nota_fiscal?: string | null
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "financeiro_lancamentos_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "financeiro_lancamentos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      kv_store_02355049: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      kv_store_5ad7fd2c: {
        Row: {
          key: string
          value: Json
        }
        Insert: {
          key: string
          value: Json
        }
        Update: {
          key?: string
          value?: Json
        }
        Relationships: []
      }
      ordens_servico: {
        Row: {
          cc_id: string | null
          cliente_id: string
          codigo_os: string | null
          criado_por_id: string
          data_conclusao: string | null
          data_entrada: string
          data_prazo: string | null
          descricao: string | null
          id: string
          responsavel_id: string | null
          status_geral: Database["public"]["Enums"]["os_status_geral"]
          tipo_os_id: string
          valor_contrato: number | null
          valor_proposta: number | null
        }
        Insert: {
          cc_id?: string | null
          cliente_id: string
          codigo_os?: string | null
          criado_por_id: string
          data_conclusao?: string | null
          data_entrada?: string
          data_prazo?: string | null
          descricao?: string | null
          id?: string
          responsavel_id?: string | null
          status_geral?: Database["public"]["Enums"]["os_status_geral"]
          tipo_os_id: string
          valor_contrato?: number | null
          valor_proposta?: number | null
        }
        Update: {
          cc_id?: string | null
          cliente_id?: string
          codigo_os?: string | null
          criado_por_id?: string
          data_conclusao?: string | null
          data_entrada?: string
          data_prazo?: string | null
          descricao?: string | null
          id?: string
          responsavel_id?: string | null
          status_geral?: Database["public"]["Enums"]["os_status_geral"]
          tipo_os_id?: string
          valor_contrato?: number | null
          valor_proposta?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_tipo_os_id_fkey"
            columns: ["tipo_os_id"]
            isOneToOne: false
            referencedRelation: "tipos_os"
            referencedColumns: ["id"]
          },
        ]
      }
      os_anexos: {
        Row: {
          comentarios: string | null
          created_at: string
          etapa_id: string | null
          id: string
          nome_arquivo: string
          os_id: string
          path_storage: string
          tipo_anexo: string | null
        }
        Insert: {
          comentarios?: string | null
          created_at?: string
          etapa_id?: string | null
          id?: string
          nome_arquivo: string
          os_id: string
          path_storage: string
          tipo_anexo?: string | null
        }
        Update: {
          comentarios?: string | null
          created_at?: string
          etapa_id?: string | null
          id?: string
          nome_arquivo?: string
          os_id?: string
          path_storage?: string
          tipo_anexo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_anexos_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "os_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_anexos_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "v_etapas_pendentes_aprovacao"
            referencedColumns: ["etapa_id"]
          },
          {
            foreignKeyName: "os_anexos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_anexos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_etapas_pendentes_aprovacao"
            referencedColumns: ["os_id"]
          },
        ]
      }
      os_etapas: {
        Row: {
          aprovador_id: string | null
          comentarios_aprovacao: string | null
          dados_etapa: Json | null
          data_conclusao: string | null
          data_inicio: string | null
          id: string
          nome_etapa: string
          ordem: number | null
          os_id: string
          responsavel_id: string | null
          status: Database["public"]["Enums"]["os_etapa_status"]
        }
        Insert: {
          aprovador_id?: string | null
          comentarios_aprovacao?: string | null
          dados_etapa?: Json | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          nome_etapa: string
          ordem?: number | null
          os_id: string
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["os_etapa_status"]
        }
        Update: {
          aprovador_id?: string | null
          comentarios_aprovacao?: string | null
          dados_etapa?: Json | null
          data_conclusao?: string | null
          data_inicio?: string | null
          id?: string
          nome_etapa?: string
          ordem?: number | null
          os_id?: string
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["os_etapa_status"]
        }
        Relationships: [
          {
            foreignKeyName: "os_etapas_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_aprovador_id_fkey"
            columns: ["aprovador_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_etapas_pendentes_aprovacao"
            referencedColumns: ["os_id"]
          },
          {
            foreignKeyName: "os_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
        ]
      }
      os_historico_status: {
        Row: {
          alterado_por_id: string | null
          created_at: string
          id: string
          observacoes: string | null
          os_id: string
          status_anterior: Database["public"]["Enums"]["os_status_geral"] | null
          status_novo: Database["public"]["Enums"]["os_status_geral"]
        }
        Insert: {
          alterado_por_id?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          os_id: string
          status_anterior?:
            | Database["public"]["Enums"]["os_status_geral"]
            | null
          status_novo: Database["public"]["Enums"]["os_status_geral"]
        }
        Update: {
          alterado_por_id?: string | null
          created_at?: string
          id?: string
          observacoes?: string | null
          os_id?: string
          status_anterior?:
            | Database["public"]["Enums"]["os_status_geral"]
            | null
          status_novo?: Database["public"]["Enums"]["os_status_geral"]
        }
        Relationships: [
          {
            foreignKeyName: "os_historico_status_alterado_por_id_fkey"
            columns: ["alterado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_historico_status_alterado_por_id_fkey"
            columns: ["alterado_por_id"]
            isOneToOne: false
            referencedRelation: "v_performance_colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_historico_status_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_historico_status_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_etapas_pendentes_aprovacao"
            referencedColumns: ["os_id"]
          },
        ]
      }
      tipos_os: {
        Row: {
          ativo: boolean | null
          campos_customizados: Json | null
          categoria: string | null
          codigo: string
          descricao: string | null
          etapas_padrao: Json | null
          fluxo_especial: boolean | null
          id: string
          nome: string
          requer_cliente: boolean | null
          setor_padrao: Database["public"]["Enums"]["user_setor"]
        }
        Insert: {
          ativo?: boolean | null
          campos_customizados?: Json | null
          categoria?: string | null
          codigo: string
          descricao?: string | null
          etapas_padrao?: Json | null
          fluxo_especial?: boolean | null
          id?: string
          nome: string
          requer_cliente?: boolean | null
          setor_padrao: Database["public"]["Enums"]["user_setor"]
        }
        Update: {
          ativo?: boolean | null
          campos_customizados?: Json | null
          categoria?: string | null
          codigo?: string
          descricao?: string | null
          etapas_padrao?: Json | null
          fluxo_especial?: boolean | null
          id?: string
          nome?: string
          requer_cliente?: boolean | null
          setor_padrao?: Database["public"]["Enums"]["user_setor"]
        }
        Relationships: []
      }
      turnos: {
        Row: {
          ativo: boolean
          atualizado_em: string | null
          cor: string
          criado_em: string | null
          criado_por: string | null
          data_fim: string | null
          data_inicio: string | null
          dias_semana: number[] | null
          hora_fim: string
          hora_inicio: string
          id: string
          setores: string[]
          tipo_recorrencia: string
          vagas_total: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string | null
          cor?: string
          criado_em?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias_semana?: number[] | null
          hora_fim: string
          hora_inicio: string
          id?: string
          setores?: string[]
          tipo_recorrencia?: string
          vagas_total?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string | null
          cor?: string
          criado_em?: string | null
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias_semana?: number[] | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          setores?: string[]
          tipo_recorrencia?: string
          vagas_total?: number
        }
        Relationships: []
      }
    }
    Views: {
      v_dashboard_diretoria: {
        Row: {
          total_clientes_ativos: number | null
          total_colaboradores_ativos: number | null
          total_delegacoes_pendentes: number | null
          total_os_ativas: number | null
          total_os_atrasadas: number | null
          total_os_concluidas: number | null
          total_os_geral: number | null
          valor_total_contratos: number | null
        }
        Relationships: []
      }
      v_etapas_pendentes_aprovacao: {
        Row: {
          cliente_nome: string | null
          codigo_os: string | null
          etapa_id: string | null
          etapa_status: Database["public"]["Enums"]["os_etapa_status"] | null
          nome_etapa: string | null
          ordem: number | null
          os_id: string | null
          os_status: Database["public"]["Enums"]["os_status_geral"] | null
          responsavel_nome: string | null
          setor: Database["public"]["Enums"]["user_setor"] | null
          tipo_os_nome: string | null
        }
        Relationships: []
      }
      v_os_por_status: {
        Row: {
          atrasadas: number | null
          status_geral: Database["public"]["Enums"]["os_status_geral"] | null
          total: number | null
          urgentes: number | null
          valor_total_contratos: number | null
        }
        Relationships: []
      }
      v_performance_colaboradores: {
        Row: {
          ativo: boolean | null
          delegacoes_concluidas: number | null
          id: string | null
          nome_completo: string | null
          os_concluidas: number | null
          role_nivel: Database["public"]["Enums"]["user_role_nivel"] | null
          setor: Database["public"]["Enums"]["user_setor"] | null
          total_delegacoes_recebidas: number | null
          total_os_responsavel: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_rls_policy_if_not_exists: {
        Args: {
          p_command: string
          p_policy_name: string
          p_table_name: string
          p_using: string
          p_with_check?: string
        }
        Returns: undefined
      }
      eh_superior_hierarquico: {
        Args: { p_user1_id: string; p_user2_id: string }
        Returns: boolean
      }
      get_user_role_nivel: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role_nivel"]
      }
      obter_permissoes_usuario: { Args: { p_user_id: string }; Returns: Json }
      obter_turnos_disponiveis: {
        Args: { p_data: string }
        Returns: {
          cor: string
          hora_fim: string
          hora_inicio: string
          setores: string[]
          turno_id: string
          vagas_ocupadas: number
          vagas_total: number
        }[]
      }
      pode_criar_delegacao: {
        Args: { p_delegado_id: string; p_delegante_id: string; p_os_id: string }
        Returns: Json
      }
      pode_editar_os: {
        Args: { p_os_id: string; p_user_id: string }
        Returns: boolean
      }
      pode_ver_os: {
        Args: { p_os_id: string; p_user_id: string }
        Returns: boolean
      }
      verificar_vagas_turno: {
        Args: {
          p_data: string
          p_horario_fim: string
          p_horario_inicio: string
          p_turno_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agendamento_status: "AGENDADO" | "CONFIRMADO" | "REALIZADO" | "CANCELADO"
      cc_tipo:
        | "ASSESSORIA"
        | "OBRA"
        | "INTERNO"
        | "ADMINISTRATIVO"
        | "LABORATORIO"
        | "COMERCIAL"
        | "GERAL"
      cliente_status: "LEAD" | "ATIVO" | "INATIVO"
      cliente_tipo:
        | "PESSOA_FISICA"
        | "CONDOMINIO"
        | "EMPRESA"
        | "CONSTRUTORA"
        | "INCORPORADORA"
        | "INDUSTRIA"
        | "COMERCIO"
        | "OUTRO"
      delegacao_status: "PENDENTE" | "EM_PROGRESSO" | "CONCLUIDA" | "REPROVADA"
      financeiro_tipo: "RECEITA" | "DESPESA"
      lancamento_tipo: "RECEITA" | "DESPESA"
      os_etapa_status:
        | "PENDENTE"
        | "EM_ANDAMENTO"
        | "AGUARDANDO_APROVACAO"
        | "APROVADA"
        | "REJEITADA"
      os_status_geral:
        | "EM_TRIAGEM"
        | "AGUARDANDO_INFORMACOES"
        | "EM_ANDAMENTO"
        | "EM_VALIDACAO"
        | "ATRASADA"
        | "CONCLUIDA"
        | "CANCELADA"
        | "PAUSADA"
        | "AGUARDANDO_CLIENTE"
      performance_avaliacao: "EXCELENTE" | "BOM" | "REGULAR" | "INSATISFATORIO"
      presenca_status:
        | "PRESENTE"
        | "ATRASO"
        | "FALTA_JUSTIFICADA"
        | "FALTA_INJUSTIFICADA"
        | "FERIAS"
        | "FOLGA"
        | "ATESTADO"
        | "LICENCA"
      setor_tipo: "OBR" | "COM" | "ASS" | "JUR" | "PER" | "ADM" | "FIN"
      tipo_cliente:
        | "PESSOA_FISICA"
        | "CONDOMINIO"
        | "CONSTRUTORA"
        | "INCORPORADORA"
        | "INDUSTRIA"
        | "COMERCIO"
        | "OUTRO"
      user_role_nivel:
        | "MOBRA"
        | "COLABORADOR_COMERCIAL"
        | "COLABORADOR_ASSESSORIA"
        | "COLABORADOR_OBRAS"
        | "GESTOR_COMERCIAL"
        | "GESTOR_ASSESSORIA"
        | "GESTOR_OBRAS"
        | "DIRETORIA"
        | "GESTOR_ADMINISTRATIVO"
        | "COLABORADOR_ADMINISTRATIVO"
      user_setor: "COMERCIAL" | "ASSESSORIA" | "OBRAS" | "ADMINISTRATIVO"
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
      agendamento_status: ["AGENDADO", "CONFIRMADO", "REALIZADO", "CANCELADO"],
      cc_tipo: [
        "ASSESSORIA",
        "OBRA",
        "INTERNO",
        "ADMINISTRATIVO",
        "LABORATORIO",
        "COMERCIAL",
        "GERAL",
      ],
      cliente_status: ["LEAD", "ATIVO", "INATIVO"],
      cliente_tipo: [
        "PESSOA_FISICA",
        "CONDOMINIO",
        "EMPRESA",
        "CONSTRUTORA",
        "INCORPORADORA",
        "INDUSTRIA",
        "COMERCIO",
        "OUTRO",
      ],
      delegacao_status: ["PENDENTE", "EM_PROGRESSO", "CONCLUIDA", "REPROVADA"],
      financeiro_tipo: ["RECEITA", "DESPESA"],
      lancamento_tipo: ["RECEITA", "DESPESA"],
      os_etapa_status: [
        "PENDENTE",
        "EM_ANDAMENTO",
        "AGUARDANDO_APROVACAO",
        "APROVADA",
        "REJEITADA",
      ],
      os_status_geral: [
        "EM_TRIAGEM",
        "AGUARDANDO_INFORMACOES",
        "EM_ANDAMENTO",
        "EM_VALIDACAO",
        "ATRASADA",
        "CONCLUIDA",
        "CANCELADA",
        "PAUSADA",
        "AGUARDANDO_CLIENTE",
      ],
      performance_avaliacao: ["EXCELENTE", "BOM", "REGULAR", "INSATISFATORIO"],
      presenca_status: [
        "PRESENTE",
        "ATRASO",
        "FALTA_JUSTIFICADA",
        "FALTA_INJUSTIFICADA",
        "FERIAS",
        "FOLGA",
        "ATESTADO",
        "LICENCA",
      ],
      setor_tipo: ["OBR", "COM", "ASS", "JUR", "PER", "ADM", "FIN"],
      tipo_cliente: [
        "PESSOA_FISICA",
        "CONDOMINIO",
        "CONSTRUTORA",
        "INCORPORADORA",
        "INDUSTRIA",
        "COMERCIO",
        "OUTRO",
      ],
      user_role_nivel: [
        "MOBRA",
        "COLABORADOR_COMERCIAL",
        "COLABORADOR_ASSESSORIA",
        "COLABORADOR_OBRAS",
        "GESTOR_COMERCIAL",
        "GESTOR_ASSESSORIA",
        "GESTOR_OBRAS",
        "DIRETORIA",
        "GESTOR_ADMINISTRATIVO",
        "COLABORADOR_ADMINISTRATIVO",
      ],
      user_setor: ["COMERCIAL", "ASSESSORIA", "OBRAS", "ADMINISTRATIVO"],
    },
  },
} as const
