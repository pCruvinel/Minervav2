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
      agendamentos: {
        Row: {
          id: string
          turno_id: string
          data: string
          horario_inicio: string
          horario_fim: string
          duracao_horas: number
          categoria: string
          setor: string
          solicitante_nome: string | null
          solicitante_contato: string | null
          solicitante_observacoes: string | null
          os_id: string | null
          status: Database["public"]["Enums"]["agendamento_status"]
          criado_por: string | null
          criado_em: string
          atualizado_em: string
          cancelado_em: string | null
          cancelado_motivo: string | null
        }
        Insert: {
          id?: string
          turno_id: string
          data: string
          horario_inicio: string
          horario_fim: string
          duracao_horas?: number
          categoria: string
          setor: string
          solicitante_nome?: string | null
          solicitante_contato?: string | null
          solicitante_observacoes?: string | null
          os_id?: string | null
          status?: Database["public"]["Enums"]["agendamento_status"]
          criado_por?: string | null
          criado_em?: string
          atualizado_em?: string
          cancelado_em?: string | null
          cancelado_motivo?: string | null
        }
        Update: {
          id?: string
          turno_id?: string
          data?: string
          horario_inicio?: string
          horario_fim?: string
          duracao_horas?: number
          categoria?: string
          setor?: string
          solicitante_nome?: string | null
          solicitante_contato?: string | null
          solicitante_observacoes?: string | null
          os_id?: string | null
          status?: Database["public"]["Enums"]["agendamento_status"]
          criado_por?: string | null
          criado_em?: string
          atualizado_em?: string
          cancelado_em?: string | null
          cancelado_motivo?: string | null
        }
      }
      audit_log: {
        Row: {
          id: string
          usuario_id: string | null
          acao: string
          tabela_afetada: string
          registro_id_afetado: string
          dados_antigos: Json | null
          dados_novos: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          usuario_id?: string | null
          acao: string
          tabela_afetada: string
          registro_id_afetado: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          usuario_id?: string | null
          acao?: string
          tabela_afetada?: string
          registro_id_afetado?: string
          dados_antigos?: Json | null
          dados_novos?: Json | null
          created_at?: string
        }
      }
      cargos: {
        Row: {
          id: string
          nome: string
          slug: string
          nivel_acesso: number
          descricao: string | null
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          nivel_acesso?: number
          descricao?: string | null
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          nivel_acesso?: number
          descricao?: string | null
          ativo?: boolean
          created_at?: string
        }
      }
      centros_custo: {
        Row: {
          id: string
          nome: string
          tipo: Database["public"]["Enums"]["cc_tipo"]
          cliente_id: string | null
          valor_global: number | null
          status_cc: Database["public"]["Enums"]["os_status_geral"] | null
        }
        Insert: {
          id?: string
          nome: string
          tipo: Database["public"]["Enums"]["cc_tipo"]
          cliente_id?: string | null
          valor_global?: number | null
          status_cc?: Database["public"]["Enums"]["os_status_geral"] | null
        }
        Update: {
          id?: string
          nome?: string
          tipo?: Database["public"]["Enums"]["cc_tipo"]
          cliente_id?: string | null
          valor_global?: number | null
          status_cc?: Database["public"]["Enums"]["os_status_geral"] | null
        }
      }
      clientes: {
        Row: {
          id: string
          nome_razao_social: string
          cpf_cnpj: string | null
          email: string | null
          telefone: string | null
          status: Database["public"]["Enums"]["cliente_status"]
          responsavel_id: string | null
          endereco: Json | null
          observacoes: string | null
          tipo_cliente: Database["public"]["Enums"]["tipo_cliente"] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome_razao_social: string
          cpf_cnpj?: string | null
          email?: string | null
          telefone?: string | null
          status?: Database["public"]["Enums"]["cliente_status"]
          responsavel_id?: string | null
          endereco?: Json | null
          observacoes?: string | null
          tipo_cliente?: Database["public"]["Enums"]["tipo_cliente"] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_razao_social?: string
          cpf_cnpj?: string | null
          email?: string | null
          telefone?: string | null
          status?: Database["public"]["Enums"]["cliente_status"]
          responsavel_id?: string | null
          endereco?: Json | null
          observacoes?: string | null
          tipo_cliente?: Database["public"]["Enums"]["tipo_cliente"] | null
          created_at?: string
          updated_at?: string
        }
      }
      colaboradores: {
        Row: {
          id: string
          nome_completo: string
          email: string | null
          cpf: string | null
          telefone: string | null
          cargo_id: string | null
          setor_id: string | null
          ativo: boolean
          data_admissao: string | null
          data_demissao: string | null
          custo_mensal: number | null
          role_nivel: Database["public"]["Enums"]["user_role_nivel"]
          setor: Database["public"]["Enums"]["user_setor"] | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          nome_completo: string
          email?: string | null
          cpf?: string | null
          telefone?: string | null
          cargo_id?: string | null
          setor_id?: string | null
          ativo?: boolean
          data_admissao?: string | null
          data_demissao?: string | null
          custo_mensal?: number | null
          role_nivel?: Database["public"]["Enums"]["user_role_nivel"]
          setor?: Database["public"]["Enums"]["user_setor"] | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_completo?: string
          email?: string | null
          cpf?: string | null
          telefone?: string | null
          cargo_id?: string | null
          setor_id?: string | null
          ativo?: boolean
          data_admissao?: string | null
          data_demissao?: string | null
          custo_mensal?: number | null
          role_nivel?: Database["public"]["Enums"]["user_role_nivel"]
          setor?: Database["public"]["Enums"]["user_setor"] | null
          created_at?: string
          updated_at?: string
        }
      }
      delegacoes: {
        Row: {
          id: string
          os_id: string
          delegante_id: string
          delegado_id: string
          status_delegacao: Database["public"]["Enums"]["delegacao_status"]
          descricao_tarefa: string
          observacoes: string | null
          data_prazo: string | null
          delegante_nome: string | null
          delegado_nome: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          os_id: string
          delegante_id: string
          delegado_id: string
          status_delegacao?: Database["public"]["Enums"]["delegacao_status"]
          descricao_tarefa: string
          observacoes?: string | null
          data_prazo?: string | null
          delegante_nome?: string | null
          delegado_nome?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          os_id?: string
          delegante_id?: string
          delegado_id?: string
          status_delegacao?: Database["public"]["Enums"]["delegacao_status"]
          descricao_tarefa?: string
          observacoes?: string | null
          data_prazo?: string | null
          delegante_nome?: string | null
          delegado_nome?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      financeiro_lancamentos: {
        Row: {
          id: string
          descricao: string
          valor: number
          tipo: Database["public"]["Enums"]["financeiro_tipo"]
          data_vencimento: string
          data_pagamento: string | null
          conciliado: boolean
          cc_id: string | null
          cliente_id: string | null
          criado_por_id: string | null
          recorrencia: Json | null
          url_nota_fiscal: string | null
          created_at: string
        }
        Insert: {
          id?: string
          descricao: string
          valor: number
          tipo?: Database["public"]["Enums"]["financeiro_tipo"]
          data_vencimento: string
          data_pagamento?: string | null
          conciliado?: boolean
          cc_id?: string | null
          cliente_id?: string | null
          criado_por_id?: string | null
          recorrencia?: Json | null
          url_nota_fiscal?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          descricao?: string
          valor?: number
          tipo?: Database["public"]["Enums"]["financeiro_tipo"]
          data_vencimento?: string
          data_pagamento?: string | null
          conciliado?: boolean
          cc_id?: string | null
          cliente_id?: string | null
          criado_por_id?: string | null
          recorrencia?: Json | null
          url_nota_fiscal?: string | null
          created_at?: string
        }
      }
      ordens_servico: {
        Row: {
          id: string
          codigo_os: string | null
          cliente_id: string
          tipo_os_id: string
          responsavel_id: string | null
          criado_por_id: string | null
          cc_id: string | null
          status_geral: Database["public"]["Enums"]["os_status_geral"]
          data_entrada: string
          data_prazo: string | null
          data_conclusao: string | null
          valor_proposta: number | null
          valor_contrato: number | null
          descricao: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          codigo_os?: string | null
          cliente_id: string
          tipo_os_id: string
          responsavel_id?: string | null
          criado_por_id?: string | null
          cc_id?: string | null
          status_geral?: Database["public"]["Enums"]["os_status_geral"]
          data_entrada?: string
          data_prazo?: string | null
          data_conclusao?: string | null
          valor_proposta?: number | null
          valor_contrato?: number | null
          descricao?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          codigo_os?: string | null
          cliente_id?: string
          tipo_os_id?: string
          responsavel_id?: string | null
          criado_por_id?: string | null
          cc_id?: string | null
          status_geral?: Database["public"]["Enums"]["os_status_geral"]
          data_entrada?: string
          data_prazo?: string | null
          data_conclusao?: string | null
          valor_proposta?: number | null
          valor_contrato?: number | null
          descricao?: string | null
          updated_at?: string
        }
      }
      os_etapas: {
        Row: {
          id: string
          os_id: string
          nome_etapa: string
          status: Database["public"]["Enums"]["os_etapa_status"]
          ordem: number | null
          dados_etapa: Json | null
          responsavel_id: string | null
          aprovador_id: string | null
          comentarios_aprovacao: string | null
          data_inicio: string | null
          data_conclusao: string | null
        }
        Insert: {
          id?: string
          os_id: string
          nome_etapa: string
          status?: Database["public"]["Enums"]["os_etapa_status"]
          ordem?: number | null
          dados_etapa?: Json | null
          responsavel_id?: string | null
          aprovador_id?: string | null
          comentarios_aprovacao?: string | null
          data_inicio?: string | null
          data_conclusao?: string | null
        }
        Update: {
          id?: string
          os_id?: string
          nome_etapa?: string
          status?: Database["public"]["Enums"]["os_etapa_status"]
          ordem?: number | null
          dados_etapa?: Json | null
          responsavel_id?: string | null
          aprovador_id?: string | null
          comentarios_aprovacao?: string | null
          data_inicio?: string | null
          data_conclusao?: string | null
        }
      }
      os_historico_status: {
        Row: {
          id: string
          os_id: string | null
          status_anterior: Database["public"]["Enums"]["os_status_geral"] | null
          status_novo: Database["public"]["Enums"]["os_status_geral"] | null
          alterado_por_id: string | null
          observacoes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          os_id?: string | null
          status_anterior?: Database["public"]["Enums"]["os_status_geral"] | null
          status_novo?: Database["public"]["Enums"]["os_status_geral"] | null
          alterado_por_id?: string | null
          observacoes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          os_id?: string | null
          status_anterior?: Database["public"]["Enums"]["os_status_geral"] | null
          status_novo?: Database["public"]["Enums"]["os_status_geral"] | null
          alterado_por_id?: string | null
          observacoes?: string | null
          created_at?: string
        }
      }
      setores: {
        Row: {
          id: string
          nome: string
          slug: string
          descricao: string | null
          ativo: boolean
          created_at: string
        }
        Insert: {
          id?: string
          nome: string
          slug: string
          descricao?: string | null
          ativo?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          nome?: string
          slug?: string
          descricao?: string | null
          ativo?: boolean
          created_at?: string
        }
      }
      tipos_os: {
        Row: {
          id: string
          nome: string
          codigo: string | null
          setor_padrao_id: string | null
          ativo: boolean | null
          categoria: string | null
          descricao: string | null
          fluxo_especial: boolean | null
          requer_cliente: boolean | null
          etapas_padrao: Json | null
          campos_customizados: Json | null
          setor_padrao: Database["public"]["Enums"]["user_setor"] | null
        }
        Insert: {
          id?: string
          nome: string
          codigo?: string | null
          setor_padrao_id?: string | null
          ativo?: boolean | null
          categoria?: string | null
          descricao?: string | null
          fluxo_especial?: boolean | null
          requer_cliente?: boolean | null
          etapas_padrao?: Json | null
          campos_customizados?: Json | null
          setor_padrao?: Database["public"]["Enums"]["user_setor"] | null
        }
        Update: {
          id?: string
          nome?: string
          codigo?: string | null
          setor_padrao_id?: string | null
          ativo?: boolean | null
          categoria?: string | null
          descricao?: string | null
          fluxo_especial?: boolean | null
          requer_cliente?: boolean | null
          etapas_padrao?: Json | null
          campos_customizados?: Json | null
          setor_padrao?: Database["public"]["Enums"]["user_setor"] | null
        }
      }
      turnos: {
        Row: {
          id: string
          hora_inicio: string
          hora_fim: string
          vagas_total: number
          setores: Json
          cor: string
          ativo: boolean
          tipo_recorrencia: string
          data_inicio: string | null
          data_fim: string | null
          dias_semana: number[] | null
          criado_por: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          hora_inicio: string
          hora_fim: string
          vagas_total?: number
          setores?: Json
          cor?: string
          ativo?: boolean
          tipo_recorrencia?: string
          data_inicio?: string | null
          data_fim?: string | null
          dias_semana?: number[] | null
          criado_por?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          hora_inicio?: string
          hora_fim?: string
          vagas_total?: number
          setores?: Json
          cor?: string
          ativo?: boolean
          tipo_recorrencia?: string
          data_inicio?: string | null
          data_fim?: string | null
          dias_semana?: number[] | null
          criado_por?: string | null
          criado_em?: string
          atualizado_em?: string
        }
      }
    }
    Views: {
      v_dashboard_diretoria: {
        Row: {
          total_os_geral: number | null
          total_os_ativas: number | null
          total_os_concluidas: number | null
          total_os_atrasadas: number | null
          valor_total_contratos: number | null
          total_clientes_ativos: number | null
          total_colaboradores_ativos: number | null
          total_delegacoes_pendentes: number | null
        }
      }
      v_os_por_status: {
        Row: {
          status_geral: Database["public"]["Enums"]["os_status_geral"] | null
          total: number | null
          atrasadas: number | null
          urgentes: number | null
          valor_total_contratos: number | null
        }
      }
      v_performance_colaboradores: {
        Row: {
          id: string | null
          nome_completo: string | null
          role_nivel: Database["public"]["Enums"]["user_role_nivel"] | null
          setor: Database["public"]["Enums"]["user_setor"] | null
          ativo: boolean | null
          total_os_responsavel: number | null
          os_concluidas: number | null
          total_delegacoes_recebidas: number | null
          delegacoes_concluidas: number | null
        }
      }
    }
    Functions: {
      get_user_role_nivel: {
        Args: never
        Returns: Database["public"]["Enums"]["user_role_nivel"]
      }
      eh_superior_hierarquico: {
        Args: {
          p_user1_id: string
          p_user2_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agendamento_status: "agendado" | "confirmado" | "realizado" | "cancelado"
      cc_tipo: "assessoria" | "obra" | "interno" | "administrativo" | "laboratorio" | "comercial" | "geral"
      cliente_status: "lead" | "ativo" | "inativo"
      tipo_cliente: "pessoa_fisica" | "condominio" | "construtora" | "incorporadora" | "industria" | "comercio" | "outro"
      delegacao_status: "pendente" | "em_progresso" | "concluida" | "recusada"
      financeiro_tipo: "receita" | "despesa"
      os_etapa_status: "pendente" | "em_andamento" | "aguardando_aprovacao" | "aprovada" | "rejeitada"
      os_status_geral: "em_triagem" | "aguardando_informacoes" | "em_andamento" | "em_validacao" | "atrasada" | "concluida" | "cancelada" | "pausada" | "aguardando_cliente"
      performance_avaliacao: "excelente" | "bom" | "regular" | "insatisfatorio"
      presenca_status: "presente" | "atraso" | "falta_justificada" | "falta_injustificada" | "ferias" | "folga" | "atestado" | "licenca"
      user_role_nivel: "admin" | "diretoria" | "gestor_administrativo" | "gestor_obras" | "gestor_assessoria" | "gestor_comercial" | "colaborador" | "colaborador_comercial" | "colaborador_obras" | "colaborador_assessoria" | "mao_de_obra"
      user_setor: "administrativo" | "assessoria" | "obras" | "comercial"
    }
  }
}