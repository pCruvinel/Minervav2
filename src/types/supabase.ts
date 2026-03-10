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
          atualizado_em: string
          atualizado_por: string | null
          cancelado_em: string | null
          cancelado_motivo: string | null
          categoria: string
          criado_em: string
          criado_por: string | null
          data: string
          descricao: string | null
          duracao_horas: number
          etapa_id: string | null
          horario_fim: string
          horario_inicio: string
          id: string
          os_id: string | null
          responsavel_id: string | null
          setor: string
          solicitante_contato: string | null
          solicitante_nome: string | null
          solicitante_observacoes: string | null
          status: string
          turno_id: string
        }
        Insert: {
          atualizado_em?: string
          atualizado_por?: string | null
          cancelado_em?: string | null
          cancelado_motivo?: string | null
          categoria: string
          criado_em?: string
          criado_por?: string | null
          data: string
          descricao?: string | null
          duracao_horas: number
          etapa_id?: string | null
          horario_fim: string
          horario_inicio: string
          id?: string
          os_id?: string | null
          responsavel_id?: string | null
          setor: string
          solicitante_contato?: string | null
          solicitante_nome?: string | null
          solicitante_observacoes?: string | null
          status?: string
          turno_id: string
        }
        Update: {
          atualizado_em?: string
          atualizado_por?: string | null
          cancelado_em?: string | null
          cancelado_motivo?: string | null
          categoria?: string
          criado_em?: string
          criado_por?: string | null
          data?: string
          descricao?: string | null
          duracao_horas?: number
          etapa_id?: string | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          os_id?: string | null
          responsavel_id?: string | null
          setor?: string
          solicitante_contato?: string | null
          solicitante_nome?: string | null
          solicitante_observacoes?: string | null
          status?: string
          turno_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agendamentos_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_atualizado_por_fkey"
            columns: ["atualizado_por"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "agendamentos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "agendamentos_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "os_etapas"
            referencedColumns: ["id"]
          },
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
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agendamentos_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
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
      alocacao_horas_cc: {
        Row: {
          cc_id: string
          created_at: string | null
          id: string
          observacao: string | null
          percentual: number
          registro_presenca_id: string
          valor_calculado: number | null
        }
        Insert: {
          cc_id: string
          created_at?: string | null
          id?: string
          observacao?: string | null
          percentual: number
          registro_presenca_id: string
          valor_calculado?: number | null
        }
        Update: {
          cc_id?: string
          created_at?: string | null
          id?: string
          observacao?: string | null
          percentual?: number
          registro_presenca_id?: string
          valor_calculado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alocacao_horas_cc_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alocacao_horas_cc_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
          {
            foreignKeyName: "alocacao_horas_cc_registro_presenca_id_fkey"
            columns: ["registro_presenca_id"]
            isOneToOne: false
            referencedRelation: "registros_presenca"
            referencedColumns: ["id"]
          },
        ]
      }
      app_settings: {
        Row: {
          created_at: string | null
          description: string | null
          is_secret: boolean | null
          key: string
          updated_at: string | null
          value: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          is_secret?: boolean | null
          key: string
          updated_at?: string | null
          value: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          is_secret?: boolean | null
          key?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          acao: string
          created_at: string | null
          dados_antigos: Json | null
          dados_novos: Json | null
          id: string
          registro_id_afetado: string | null
          tabela_afetada: string | null
          usuario_id: string | null
        }
        Insert: {
          acao: string
          created_at?: string | null
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id_afetado?: string | null
          tabela_afetada?: string | null
          usuario_id?: string | null
        }
        Update: {
          acao?: string
          created_at?: string | null
          dados_antigos?: Json | null
          dados_novos?: Json | null
          id?: string
          registro_id_afetado?: string | null
          tabela_afetada?: string | null
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      calendario_bloqueios: {
        Row: {
          ativo: boolean | null
          cor: string | null
          created_at: string | null
          criado_por: string | null
          data_fim: string
          data_inicio: string
          descricao: string | null
          dia_inteiro: boolean | null
          hora_fim: string | null
          hora_inicio: string | null
          id: string
          motivo: string
          setor_id: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_fim: string
          data_inicio: string
          descricao?: string | null
          dia_inteiro?: boolean | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          motivo: string
          setor_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          cor?: string | null
          created_at?: string | null
          criado_por?: string | null
          data_fim?: string
          data_inicio?: string
          descricao?: string | null
          dia_inteiro?: boolean | null
          hora_fim?: string | null
          hora_inicio?: string | null
          id?: string
          motivo?: string
          setor_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendario_bloqueios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "calendario_bloqueios_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "calendario_bloqueios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      cargos: {
        Row: {
          acesso_financeiro: boolean | null
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          escopo_visao: string | null
          id: string
          nivel_acesso: number | null
          nome: string
          setor_id: string | null
          slug: string
        }
        Insert: {
          acesso_financeiro?: boolean | null
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          escopo_visao?: string | null
          id?: string
          nivel_acesso?: number | null
          nome: string
          setor_id?: string | null
          slug: string
        }
        Update: {
          acesso_financeiro?: boolean | null
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          escopo_visao?: string | null
          id?: string
          nivel_acesso?: number | null
          nome?: string
          setor_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "cargos_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      categorias_financeiras: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          tipo: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          tipo: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          tipo?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      centros_custo: {
        Row: {
          ativo: boolean | null
          cliente_id: string | null
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          descricao: string | null
          id: string
          is_sistema: boolean | null
          nome: string
          os_id: string | null
          setor_id: string | null
          tipo: string | null
          tipo_os_id: string | null
          updated_at: string | null
          valor_global: number | null
        }
        Insert: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          is_sistema?: boolean | null
          nome: string
          os_id?: string | null
          setor_id?: string | null
          tipo?: string | null
          tipo_os_id?: string | null
          updated_at?: string | null
          valor_global?: number | null
        }
        Update: {
          ativo?: boolean | null
          cliente_id?: string | null
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          descricao?: string | null
          id?: string
          is_sistema?: boolean | null
          nome?: string
          os_id?: string | null
          setor_id?: string | null
          tipo?: string | null
          tipo_os_id?: string | null
          updated_at?: string | null
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
          {
            foreignKeyName: "centros_custo_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: true
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: true
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: true
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: true
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "centros_custo_tipo_os_id_fkey"
            columns: ["tipo_os_id"]
            isOneToOne: false
            referencedRelation: "tipos_os"
            referencedColumns: ["id"]
          },
        ]
      }
      cliente_pagadores_conhecidos: {
        Row: {
          cliente_id: string
          criado_em: string | null
          criado_por_id: string | null
          documento: string
          id: string
          nome_pagador: string | null
          observacoes: string | null
          relacao: string | null
        }
        Insert: {
          cliente_id: string
          criado_em?: string | null
          criado_por_id?: string | null
          documento: string
          id?: string
          nome_pagador?: string | null
          observacoes?: string | null
          relacao?: string | null
        }
        Update: {
          cliente_id?: string
          criado_em?: string | null
          criado_por_id?: string | null
          documento?: string
          id?: string
          nome_pagador?: string | null
          observacoes?: string | null
          relacao?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cliente_pagadores_conhecidos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_pagadores_conhecidos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cliente_pagadores_conhecidos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      clientes: {
        Row: {
          aniversario_gestor: string | null
          apelido: string | null
          auth_user_id: string | null
          cpf_cnpj: string | null
          created_at: string | null
          email: string | null
          endereco: Json | null
          id: string
          nome_razao_social: string
          nome_responsavel: string | null
          observacoes: string | null
          portal_ativo: boolean | null
          portal_convidado_em: string | null
          responsavel_id: string | null
          senha_acesso: string | null
          status: Database["public"]["Enums"]["cliente_status"]
          telefone: string | null
          tipo_cliente: Database["public"]["Enums"]["tipo_cliente"] | null
          tipo_empresa: Database["public"]["Enums"]["tipo_empresa"] | null
          updated_at: string | null
        }
        Insert: {
          aniversario_gestor?: string | null
          apelido?: string | null
          auth_user_id?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          nome_razao_social: string
          nome_responsavel?: string | null
          observacoes?: string | null
          portal_ativo?: boolean | null
          portal_convidado_em?: string | null
          responsavel_id?: string | null
          senha_acesso?: string | null
          status?: Database["public"]["Enums"]["cliente_status"]
          telefone?: string | null
          tipo_cliente?: Database["public"]["Enums"]["tipo_cliente"] | null
          tipo_empresa?: Database["public"]["Enums"]["tipo_empresa"] | null
          updated_at?: string | null
        }
        Update: {
          aniversario_gestor?: string | null
          apelido?: string | null
          auth_user_id?: string | null
          cpf_cnpj?: string | null
          created_at?: string | null
          email?: string | null
          endereco?: Json | null
          id?: string
          nome_razao_social?: string
          nome_responsavel?: string | null
          observacoes?: string | null
          portal_ativo?: boolean | null
          portal_convidado_em?: string | null
          responsavel_id?: string | null
          senha_acesso?: string | null
          status?: Database["public"]["Enums"]["cliente_status"]
          telefone?: string | null
          tipo_cliente?: Database["public"]["Enums"]["tipo_cliente"] | null
          tipo_empresa?: Database["public"]["Enums"]["tipo_empresa"] | null
          updated_at?: string | null
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      clientes_documentos: {
        Row: {
          caminho_storage: string
          cliente_id: string
          id: string
          mime_type: string | null
          nome_arquivo: string
          tamanho_bytes: number | null
          tipo_documento: string
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          caminho_storage: string
          cliente_id: string
          id?: string
          mime_type?: string | null
          nome_arquivo: string
          tamanho_bytes?: number | null
          tipo_documento: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          caminho_storage?: string
          cliente_id?: string
          id?: string
          mime_type?: string | null
          nome_arquivo?: string
          tamanho_bytes?: number | null
          tipo_documento?: string
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clientes_documentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_documentos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clientes_documentos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      colaboradores: {
        Row: {
          agencia: string | null
          ativo: boolean | null
          auth_user_id: string | null
          avatar_url: string | null
          bairro: string | null
          banco: string | null
          bloqueado_sistema: boolean | null
          cargo_id: string | null
          cep: string | null
          chave_pix: string | null
          cidade: string | null
          complemento: string | null
          conta: string | null
          contato_emergencia_nome: string | null
          contato_emergencia_telefone: string | null
          cpf: string | null
          created_at: string | null
          custo_dia: number | null
          custo_mensal: number | null
          data_admissao: string | null
          data_nascimento: string | null
          dia_vencimento: number | null
          disponibilidade_dias: Json | null
          documentos_obrigatorios: Json | null
          email: string | null
          email_pessoal: string | null
          email_profissional: string | null
          endereco: string | null
          funcao: string | null
          gestor: string | null
          id: string
          logradouro: string | null
          nome_completo: string | null
          numero: string | null
          qualificacao: string | null
          rateio_fixo_id: string | null
          remuneracao_contratual: number | null
          role_id: string | null
          salario_base: number | null
          setor_id: string | null
          status_convite: string | null
          telefone: string | null
          telefone_pessoal: string | null
          telefone_profissional: string | null
          tipo_contratacao: string | null
          turno: Json | null
          uf: string | null
          updated_at: string | null
        }
        Insert: {
          agencia?: string | null
          ativo?: boolean | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          bloqueado_sistema?: boolean | null
          cargo_id?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          complemento?: string | null
          conta?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          cpf?: string | null
          created_at?: string | null
          custo_dia?: number | null
          custo_mensal?: number | null
          data_admissao?: string | null
          data_nascimento?: string | null
          dia_vencimento?: number | null
          disponibilidade_dias?: Json | null
          documentos_obrigatorios?: Json | null
          email?: string | null
          email_pessoal?: string | null
          email_profissional?: string | null
          endereco?: string | null
          funcao?: string | null
          gestor?: string | null
          id: string
          logradouro?: string | null
          nome_completo?: string | null
          numero?: string | null
          qualificacao?: string | null
          rateio_fixo_id?: string | null
          remuneracao_contratual?: number | null
          role_id?: string | null
          salario_base?: number | null
          setor_id?: string | null
          status_convite?: string | null
          telefone?: string | null
          telefone_pessoal?: string | null
          telefone_profissional?: string | null
          tipo_contratacao?: string | null
          turno?: Json | null
          uf?: string | null
          updated_at?: string | null
        }
        Update: {
          agencia?: string | null
          ativo?: boolean | null
          auth_user_id?: string | null
          avatar_url?: string | null
          bairro?: string | null
          banco?: string | null
          bloqueado_sistema?: boolean | null
          cargo_id?: string | null
          cep?: string | null
          chave_pix?: string | null
          cidade?: string | null
          complemento?: string | null
          conta?: string | null
          contato_emergencia_nome?: string | null
          contato_emergencia_telefone?: string | null
          cpf?: string | null
          created_at?: string | null
          custo_dia?: number | null
          custo_mensal?: number | null
          data_admissao?: string | null
          data_nascimento?: string | null
          dia_vencimento?: number | null
          disponibilidade_dias?: Json | null
          documentos_obrigatorios?: Json | null
          email?: string | null
          email_pessoal?: string | null
          email_profissional?: string | null
          endereco?: string | null
          funcao?: string | null
          gestor?: string | null
          id?: string
          logradouro?: string | null
          nome_completo?: string | null
          numero?: string | null
          qualificacao?: string | null
          rateio_fixo_id?: string | null
          remuneracao_contratual?: number | null
          role_id?: string | null
          salario_base?: number | null
          setor_id?: string | null
          status_convite?: string | null
          telefone?: string | null
          telefone_pessoal?: string | null
          telefone_profissional?: string | null
          tipo_contratacao?: string | null
          turno?: Json | null
          uf?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_cargo_id_fkey"
            columns: ["cargo_id"]
            isOneToOne: false
            referencedRelation: "cargos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_rateio_fixo_id_fkey"
            columns: ["rateio_fixo_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_rateio_fixo_id_fkey"
            columns: ["rateio_fixo_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
          {
            foreignKeyName: "colaboradores_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      colaboradores_documentos: {
        Row: {
          colaborador_id: string
          created_at: string | null
          id: string
          nome: string
          tamanho: number | null
          tipo: string | null
          tipo_documento: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          colaborador_id: string
          created_at?: string | null
          id?: string
          nome: string
          tamanho?: number | null
          tipo?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          colaborador_id?: string
          created_at?: string | null
          id?: string
          nome?: string
          tamanho?: number | null
          tipo?: string | null
          tipo_documento?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "colaboradores_documentos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "colaboradores_documentos_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      configuracoes_rh: {
        Row: {
          chave: string
          descricao: string | null
          id: string
          updated_at: string | null
          valor: number
        }
        Insert: {
          chave: string
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor: number
        }
        Update: {
          chave?: string
          descricao?: string | null
          id?: string
          updated_at?: string | null
          valor?: number
        }
        Relationships: []
      }
      contas_pagar: {
        Row: {
          boleto_id: string | null
          categoria_id: string | null
          cc_id: string | null
          comprovante_url: string | null
          created_at: string | null
          criado_por_id: string | null
          data_pagamento: string | null
          descricao: string
          dia_vencimento: number | null
          favorecido_colaborador_id: string | null
          favorecido_fornecedor: string | null
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          origem: string | null
          os_id: string | null
          rateio: Json | null
          recorrencia_fim: string | null
          recorrencia_frequencia: string | null
          recorrente: boolean | null
          status: string
          tipo: Database["public"]["Enums"]["tipo_despesa"]
          updated_at: string | null
          valor: number
          vencimento: string
        }
        Insert: {
          boleto_id?: string | null
          categoria_id?: string | null
          cc_id?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          criado_por_id?: string | null
          data_pagamento?: string | null
          descricao: string
          dia_vencimento?: number | null
          favorecido_colaborador_id?: string | null
          favorecido_fornecedor?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          origem?: string | null
          os_id?: string | null
          rateio?: Json | null
          recorrencia_fim?: string | null
          recorrencia_frequencia?: string | null
          recorrente?: boolean | null
          status?: string
          tipo?: Database["public"]["Enums"]["tipo_despesa"]
          updated_at?: string | null
          valor: number
          vencimento: string
        }
        Update: {
          boleto_id?: string | null
          categoria_id?: string | null
          cc_id?: string | null
          comprovante_url?: string | null
          created_at?: string | null
          criado_por_id?: string | null
          data_pagamento?: string | null
          descricao?: string
          dia_vencimento?: number | null
          favorecido_colaborador_id?: string | null
          favorecido_fornecedor?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          origem?: string | null
          os_id?: string | null
          rateio?: Json | null
          recorrencia_fim?: string | null
          recorrencia_frequencia?: string | null
          recorrente?: boolean | null
          status?: string
          tipo?: Database["public"]["Enums"]["tipo_despesa"]
          updated_at?: string | null
          valor?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_boleto_id_fkey"
            columns: ["boleto_id"]
            isOneToOne: false
            referencedRelation: "cora_boletos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
          {
            foreignKeyName: "contas_pagar_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "contas_pagar_favorecido_colaborador_id_fkey"
            columns: ["favorecido_colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_favorecido_colaborador_id_fkey"
            columns: ["favorecido_colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "contas_pagar_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      contas_receber: {
        Row: {
          boleto_id: string | null
          categoria_id: string | null
          cc_id: string | null
          cliente_id: string
          comprovante_url: string | null
          contrato_id: string | null
          contrato_numero: string | null
          created_at: string | null
          data_recebimento: string | null
          forma_pagamento: string | null
          id: string
          observacoes: string | null
          os_id: string | null
          parcela: string
          parcela_num: number
          status: string
          total_parcelas: number
          updated_at: string | null
          valor_previsto: number
          valor_recebido: number | null
          vencimento: string
        }
        Insert: {
          boleto_id?: string | null
          categoria_id?: string | null
          cc_id?: string | null
          cliente_id: string
          comprovante_url?: string | null
          contrato_id?: string | null
          contrato_numero?: string | null
          created_at?: string | null
          data_recebimento?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          os_id?: string | null
          parcela: string
          parcela_num: number
          status?: string
          total_parcelas: number
          updated_at?: string | null
          valor_previsto: number
          valor_recebido?: number | null
          vencimento: string
        }
        Update: {
          boleto_id?: string | null
          categoria_id?: string | null
          cc_id?: string | null
          cliente_id?: string
          comprovante_url?: string | null
          contrato_id?: string | null
          contrato_numero?: string | null
          created_at?: string | null
          data_recebimento?: string | null
          forma_pagamento?: string | null
          id?: string
          observacoes?: string | null
          os_id?: string | null
          parcela?: string
          parcela_num?: number
          status?: string
          total_parcelas?: number
          updated_at?: string | null
          valor_previsto?: number
          valor_recebido?: number | null
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_boleto_id_fkey"
            columns: ["boleto_id"]
            isOneToOne: false
            referencedRelation: "cora_boletos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
          {
            foreignKeyName: "contas_receber_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      contratos: {
        Row: {
          arquivo_url: string | null
          cc_id: string | null
          cliente_id: string
          condicoes_pagamento: Json | null
          created_at: string | null
          criado_por_id: string | null
          data_fim: string | null
          data_inicio: string
          dia_vencimento: number | null
          id: string
          numero_contrato: string
          observacoes: string | null
          os_id: string | null
          parcelas_total: number
          status: string
          tipo: string
          updated_at: string | null
          valor_entrada: number | null
          valor_mensal: number | null
          valor_total: number
        }
        Insert: {
          arquivo_url?: string | null
          cc_id?: string | null
          cliente_id: string
          condicoes_pagamento?: Json | null
          created_at?: string | null
          criado_por_id?: string | null
          data_fim?: string | null
          data_inicio: string
          dia_vencimento?: number | null
          id?: string
          numero_contrato: string
          observacoes?: string | null
          os_id?: string | null
          parcelas_total?: number
          status?: string
          tipo: string
          updated_at?: string | null
          valor_entrada?: number | null
          valor_mensal?: number | null
          valor_total: number
        }
        Update: {
          arquivo_url?: string | null
          cc_id?: string | null
          cliente_id?: string
          condicoes_pagamento?: Json | null
          created_at?: string | null
          criado_por_id?: string | null
          data_fim?: string | null
          data_inicio?: string
          dia_vencimento?: number | null
          id?: string
          numero_contrato?: string
          observacoes?: string | null
          os_id?: string | null
          parcelas_total?: number
          status?: string
          tipo?: string
          updated_at?: string | null
          valor_entrada?: number | null
          valor_mensal?: number | null
          valor_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "contratos_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
          {
            foreignKeyName: "contratos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "contratos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contratos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      cora_boletos: {
        Row: {
          cliente_id: string | null
          codigo_barras: string
          conta_receber_id: string | null
          cora_boleto_id: string
          created_at: string | null
          data_pagamento: string | null
          desconto: Json | null
          id: string
          instrucoes: string[] | null
          juros: Json | null
          linha_digitavel: string
          multa: Json | null
          nosso_numero: string
          numero_documento: string
          os_id: string | null
          pagador_cpf_cnpj: string
          pagador_endereco: Json | null
          pagador_nome: string
          qr_code: string | null
          status: string
          updated_at: string | null
          url_boleto: string | null
          valor: number
          valor_pago: number | null
          vencimento: string
        }
        Insert: {
          cliente_id?: string | null
          codigo_barras: string
          conta_receber_id?: string | null
          cora_boleto_id: string
          created_at?: string | null
          data_pagamento?: string | null
          desconto?: Json | null
          id?: string
          instrucoes?: string[] | null
          juros?: Json | null
          linha_digitavel: string
          multa?: Json | null
          nosso_numero: string
          numero_documento: string
          os_id?: string | null
          pagador_cpf_cnpj: string
          pagador_endereco?: Json | null
          pagador_nome: string
          qr_code?: string | null
          status?: string
          updated_at?: string | null
          url_boleto?: string | null
          valor: number
          valor_pago?: number | null
          vencimento: string
        }
        Update: {
          cliente_id?: string | null
          codigo_barras?: string
          conta_receber_id?: string | null
          cora_boleto_id?: string
          created_at?: string | null
          data_pagamento?: string | null
          desconto?: Json | null
          id?: string
          instrucoes?: string[] | null
          juros?: Json | null
          linha_digitavel?: string
          multa?: Json | null
          nosso_numero?: string
          numero_documento?: string
          os_id?: string | null
          pagador_cpf_cnpj?: string
          pagador_endereco?: Json | null
          pagador_nome?: string
          qr_code?: string | null
          status?: string
          updated_at?: string | null
          url_boleto?: string | null
          valor?: number
          valor_pago?: number | null
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "cora_boletos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cora_boletos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cora_boletos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cora_boletos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cora_boletos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_boleto_conta_receber"
            columns: ["conta_receber_id"]
            isOneToOne: false
            referencedRelation: "contas_receber"
            referencedColumns: ["id"]
          },
        ]
      }
      cora_sync_logs: {
        Row: {
          created_at: string | null
          data_fim: string | null
          data_inicio: string | null
          duplicados: number | null
          erros: number | null
          executado_por: string | null
          id: string
          importados: number | null
          tipo: string
          total_transacoes: number | null
        }
        Insert: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          duplicados?: number | null
          erros?: number | null
          executado_por?: string | null
          id?: string
          importados?: number | null
          tipo: string
          total_transacoes?: number | null
        }
        Update: {
          created_at?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          duplicados?: number | null
          erros?: number | null
          executado_por?: string | null
          id?: string
          importados?: number | null
          tipo?: string
          total_transacoes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cora_sync_logs_executado_por_fkey"
            columns: ["executado_por"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cora_sync_logs_executado_por_fkey"
            columns: ["executado_por"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      cora_webhook_events: {
        Row: {
          event_data: Json
          event_id: string
          event_type: string
          id: string
          processed: boolean | null
          processed_at: string | null
          processing_error: string | null
          received_at: string | null
          retry_count: number | null
          signature: string | null
        }
        Insert: {
          event_data: Json
          event_id: string
          event_type: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string | null
          retry_count?: number | null
          signature?: string | null
        }
        Update: {
          event_data?: Json
          event_id?: string
          event_type?: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
          processing_error?: string | null
          received_at?: string | null
          retry_count?: number | null
          signature?: string | null
        }
        Relationships: []
      }
      custos_overhead_mensal: {
        Row: {
          cc_id: string | null
          created_at: string | null
          custo_escritorio_rateado: number | null
          custo_setor_rateado: number | null
          id: string
          mes_referencia: string
          updated_at: string | null
          valor_total_alocado: number | null
        }
        Insert: {
          cc_id?: string | null
          created_at?: string | null
          custo_escritorio_rateado?: number | null
          custo_setor_rateado?: number | null
          id?: string
          mes_referencia: string
          updated_at?: string | null
          valor_total_alocado?: number | null
        }
        Update: {
          cc_id?: string | null
          created_at?: string | null
          custo_escritorio_rateado?: number | null
          custo_setor_rateado?: number | null
          id?: string
          mes_referencia?: string
          updated_at?: string | null
          valor_total_alocado?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custos_overhead_mensal_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custos_overhead_mensal_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
        ]
      }
      custos_variaveis_colaborador: {
        Row: {
          anexo_url: string | null
          colaborador_id: string
          created_at: string | null
          created_by: string | null
          descricao: string
          id: string
          lancamento_bancario_id: string | null
          mes_referencia: string
          rateio_origem: boolean | null
          tipo_custo: string
          total_colaboradores: number | null
          valor: number
          valor_original: number | null
        }
        Insert: {
          anexo_url?: string | null
          colaborador_id: string
          created_at?: string | null
          created_by?: string | null
          descricao: string
          id?: string
          lancamento_bancario_id?: string | null
          mes_referencia: string
          rateio_origem?: boolean | null
          tipo_custo: string
          total_colaboradores?: number | null
          valor: number
          valor_original?: number | null
        }
        Update: {
          anexo_url?: string | null
          colaborador_id?: string
          created_at?: string | null
          created_by?: string | null
          descricao?: string
          id?: string
          lancamento_bancario_id?: string | null
          mes_referencia?: string
          rateio_origem?: boolean | null
          tipo_custo?: string
          total_colaboradores?: number | null
          valor?: number
          valor_original?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custos_variaveis_colaborador_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custos_variaveis_colaborador_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "custos_variaveis_colaborador_lancamento_bancario_id_fkey"
            columns: ["lancamento_bancario_id"]
            isOneToOne: false
            referencedRelation: "lancamentos_bancarios"
            referencedColumns: ["id"]
          },
        ]
      }
      delegacoes: {
        Row: {
          created_at: string | null
          data_prazo: string | null
          delegado_id: string
          delegado_nome: string | null
          delegante_id: string
          delegante_nome: string | null
          descricao_tarefa: string
          id: string
          observacoes: string | null
          os_id: string
          status_delegacao: Database["public"]["Enums"]["delegacao_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          data_prazo?: string | null
          delegado_id: string
          delegado_nome?: string | null
          delegante_id: string
          delegante_nome?: string | null
          descricao_tarefa: string
          id?: string
          observacoes?: string | null
          os_id: string
          status_delegacao?: Database["public"]["Enums"]["delegacao_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          data_prazo?: string | null
          delegado_id?: string
          delegado_nome?: string | null
          delegante_id?: string
          delegante_nome?: string | null
          descricao_tarefa?: string
          id?: string
          observacoes?: string | null
          os_id?: string
          status_delegacao?: Database["public"]["Enums"]["delegacao_status"]
          updated_at?: string | null
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
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
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegacoes_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "delegacoes_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      faturas: {
        Row: {
          boleto_id: string | null
          cliente_id: string
          codigo_barras: string | null
          contrato_id: string
          created_at: string | null
          data_pagamento: string | null
          id: string
          linha_digitavel: string | null
          notificacao_enviada: boolean | null
          notificacao_enviada_em: string | null
          numero_fatura: string
          observacoes: string | null
          parcela_descricao: string | null
          parcela_num: number
          pix_copia_cola: string | null
          pix_qrcode: string | null
          status: string
          updated_at: string | null
          url_boleto: string | null
          valor_desconto: number | null
          valor_final: number | null
          valor_juros: number | null
          valor_multa: number | null
          valor_original: number
          vencimento: string
        }
        Insert: {
          boleto_id?: string | null
          cliente_id: string
          codigo_barras?: string | null
          contrato_id: string
          created_at?: string | null
          data_pagamento?: string | null
          id?: string
          linha_digitavel?: string | null
          notificacao_enviada?: boolean | null
          notificacao_enviada_em?: string | null
          numero_fatura: string
          observacoes?: string | null
          parcela_descricao?: string | null
          parcela_num: number
          pix_copia_cola?: string | null
          pix_qrcode?: string | null
          status?: string
          updated_at?: string | null
          url_boleto?: string | null
          valor_desconto?: number | null
          valor_final?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original: number
          vencimento: string
        }
        Update: {
          boleto_id?: string | null
          cliente_id?: string
          codigo_barras?: string | null
          contrato_id?: string
          created_at?: string | null
          data_pagamento?: string | null
          id?: string
          linha_digitavel?: string | null
          notificacao_enviada?: boolean | null
          notificacao_enviada_em?: string | null
          numero_fatura?: string
          observacoes?: string | null
          parcela_descricao?: string | null
          parcela_num?: number
          pix_copia_cola?: string | null
          pix_qrcode?: string | null
          status?: string
          updated_at?: string | null
          url_boleto?: string | null
          valor_desconto?: number | null
          valor_final?: number | null
          valor_juros?: number | null
          valor_multa?: number | null
          valor_original?: number
          vencimento?: string
        }
        Relationships: [
          {
            foreignKeyName: "faturas_boleto_id_fkey"
            columns: ["boleto_id"]
            isOneToOne: false
            referencedRelation: "cora_boletos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "faturas_contrato_id_fkey"
            columns: ["contrato_id"]
            isOneToOne: false
            referencedRelation: "contratos"
            referencedColumns: ["id"]
          },
        ]
      }
      integracoes_bancarias: {
        Row: {
          ambiente: string
          ativo: boolean | null
          banco: string
          certificado_url: string | null
          certificate: string | null
          chave_url: string | null
          client_id: string
          client_secret: string | null
          created_at: string | null
          id: string
          private_key: string | null
          ultima_sincronizacao: string | null
          updated_at: string | null
          webhook_secret: string | null
        }
        Insert: {
          ambiente?: string
          ativo?: boolean | null
          banco?: string
          certificado_url?: string | null
          certificate?: string | null
          chave_url?: string | null
          client_id: string
          client_secret?: string | null
          created_at?: string | null
          id?: string
          private_key?: string | null
          ultima_sincronizacao?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Update: {
          ambiente?: string
          ativo?: boolean | null
          banco?: string
          certificado_url?: string | null
          certificate?: string | null
          chave_url?: string | null
          client_id?: string
          client_secret?: string | null
          created_at?: string | null
          id?: string
          private_key?: string | null
          ultima_sincronizacao?: string | null
          updated_at?: string | null
          webhook_secret?: string | null
        }
        Relationships: []
      }
      lancamentos_bancarios: {
        Row: {
          arquivo_origem: string | null
          banco: string | null
          categoria_id: string | null
          cc_id: string | null
          classificado_em: string | null
          classificado_por_id: string | null
          cliente_id: string | null
          colaborador_ids: string[] | null
          comprovante_url: string | null
          conta_bancaria: string | null
          conta_pagar_id: string | null
          conta_receber_id: string | null
          contraparte_documento: string | null
          contraparte_nome: string | null
          cora_entry_id: string | null
          created_at: string | null
          data: string
          descricao: string
          entrada: number | null
          hash_linha: string | null
          historico_classificacao: Json | null
          id: string
          is_aplicacao: boolean | null
          is_rateio_colaboradores: boolean | null
          linha_origem: number | null
          match_type: string | null
          metodo_transacao:
            | Database["public"]["Enums"]["metodo_transacao"]
            | null
          nota_fiscal_url: string | null
          observacoes: string | null
          rateios: Json | null
          saida: number | null
          saldo_apos: number | null
          setor_id: string | null
          status: string
          tipo_custo_mo: string | null
          tipo_lancamento: Database["public"]["Enums"]["tipo_lancamento"] | null
          updated_at: string | null
          vinculado_em: string | null
          vinculado_por_id: string | null
        }
        Insert: {
          arquivo_origem?: string | null
          banco?: string | null
          categoria_id?: string | null
          cc_id?: string | null
          classificado_em?: string | null
          classificado_por_id?: string | null
          cliente_id?: string | null
          colaborador_ids?: string[] | null
          comprovante_url?: string | null
          conta_bancaria?: string | null
          conta_pagar_id?: string | null
          conta_receber_id?: string | null
          contraparte_documento?: string | null
          contraparte_nome?: string | null
          cora_entry_id?: string | null
          created_at?: string | null
          data: string
          descricao: string
          entrada?: number | null
          hash_linha?: string | null
          historico_classificacao?: Json | null
          id?: string
          is_aplicacao?: boolean | null
          is_rateio_colaboradores?: boolean | null
          linha_origem?: number | null
          match_type?: string | null
          metodo_transacao?:
            | Database["public"]["Enums"]["metodo_transacao"]
            | null
          nota_fiscal_url?: string | null
          observacoes?: string | null
          rateios?: Json | null
          saida?: number | null
          saldo_apos?: number | null
          setor_id?: string | null
          status?: string
          tipo_custo_mo?: string | null
          tipo_lancamento?:
            | Database["public"]["Enums"]["tipo_lancamento"]
            | null
          updated_at?: string | null
          vinculado_em?: string | null
          vinculado_por_id?: string | null
        }
        Update: {
          arquivo_origem?: string | null
          banco?: string | null
          categoria_id?: string | null
          cc_id?: string | null
          classificado_em?: string | null
          classificado_por_id?: string | null
          cliente_id?: string | null
          colaborador_ids?: string[] | null
          comprovante_url?: string | null
          conta_bancaria?: string | null
          conta_pagar_id?: string | null
          conta_receber_id?: string | null
          contraparte_documento?: string | null
          contraparte_nome?: string | null
          cora_entry_id?: string | null
          created_at?: string | null
          data?: string
          descricao?: string
          entrada?: number | null
          hash_linha?: string | null
          historico_classificacao?: Json | null
          id?: string
          is_aplicacao?: boolean | null
          is_rateio_colaboradores?: boolean | null
          linha_origem?: number | null
          match_type?: string | null
          metodo_transacao?:
            | Database["public"]["Enums"]["metodo_transacao"]
            | null
          nota_fiscal_url?: string | null
          observacoes?: string | null
          rateios?: Json | null
          saida?: number | null
          saldo_apos?: number | null
          setor_id?: string | null
          status?: string
          tipo_custo_mo?: string | null
          tipo_lancamento?:
            | Database["public"]["Enums"]["tipo_lancamento"]
            | null
          updated_at?: string | null
          vinculado_em?: string | null
          vinculado_por_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "lancamentos_bancarios_categoria_id_fkey"
            columns: ["categoria_id"]
            isOneToOne: false
            referencedRelation: "categorias_financeiras"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_classificado_por_id_fkey"
            columns: ["classificado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_classificado_por_id_fkey"
            columns: ["classificado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_conta_pagar_id_fkey"
            columns: ["conta_pagar_id"]
            isOneToOne: false
            referencedRelation: "contas_pagar"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_conta_receber_id_fkey"
            columns: ["conta_receber_id"]
            isOneToOne: false
            referencedRelation: "contas_receber"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_vinculado_por_id_fkey"
            columns: ["vinculado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lancamentos_bancarios_vinculado_por_id_fkey"
            columns: ["vinculado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      mensagem_templates: {
        Row: {
          assunto_email: string | null
          ativo: boolean | null
          canal: string
          categoria: string | null
          corpo: string
          created_at: string | null
          criado_por: string | null
          id: string
          nome: string
          slug: string
          updated_at: string | null
          variaveis_disponiveis: string[] | null
        }
        Insert: {
          assunto_email?: string | null
          ativo?: boolean | null
          canal: string
          categoria?: string | null
          corpo: string
          created_at?: string | null
          criado_por?: string | null
          id?: string
          nome: string
          slug: string
          updated_at?: string | null
          variaveis_disponiveis?: string[] | null
        }
        Update: {
          assunto_email?: string | null
          ativo?: boolean | null
          canal?: string
          categoria?: string | null
          corpo?: string
          created_at?: string | null
          criado_por?: string | null
          id?: string
          nome?: string
          slug?: string
          updated_at?: string | null
          variaveis_disponiveis?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagem_templates_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagem_templates_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      mensagens_enviadas: {
        Row: {
          anexos: Json | null
          assunto: string | null
          canal: string
          contexto_codigo: string | null
          contexto_id: string | null
          contexto_tipo: string | null
          corpo: string
          created_at: string | null
          destinatario_contato: string
          destinatario_id: string | null
          destinatario_nome: string | null
          destinatario_tipo: string
          entregue_em: string | null
          enviado_em: string | null
          enviado_por: string
          erro_mensagem: string | null
          external_id: string | null
          external_response: Json | null
          id: string
          lido_em: string | null
          status: string
          template_id: string | null
          tentativas: number | null
          variaveis_usadas: Json | null
        }
        Insert: {
          anexos?: Json | null
          assunto?: string | null
          canal: string
          contexto_codigo?: string | null
          contexto_id?: string | null
          contexto_tipo?: string | null
          corpo: string
          created_at?: string | null
          destinatario_contato: string
          destinatario_id?: string | null
          destinatario_nome?: string | null
          destinatario_tipo: string
          entregue_em?: string | null
          enviado_em?: string | null
          enviado_por: string
          erro_mensagem?: string | null
          external_id?: string | null
          external_response?: Json | null
          id?: string
          lido_em?: string | null
          status?: string
          template_id?: string | null
          tentativas?: number | null
          variaveis_usadas?: Json | null
        }
        Update: {
          anexos?: Json | null
          assunto?: string | null
          canal?: string
          contexto_codigo?: string | null
          contexto_id?: string | null
          contexto_tipo?: string | null
          corpo?: string
          created_at?: string | null
          destinatario_contato?: string
          destinatario_id?: string | null
          destinatario_nome?: string | null
          destinatario_tipo?: string
          entregue_em?: string | null
          enviado_em?: string | null
          enviado_por?: string
          erro_mensagem?: string | null
          external_id?: string | null
          external_response?: Json | null
          id?: string
          lido_em?: string | null
          status?: string
          template_id?: string | null
          tentativas?: number | null
          variaveis_usadas?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "mensagens_enviadas_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mensagens_enviadas_enviado_por_fkey"
            columns: ["enviado_por"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "mensagens_enviadas_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "mensagem_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          active: boolean | null
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          active?: boolean | null
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          active?: boolean | null
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      notificacoes: {
        Row: {
          created_at: string | null
          id: string
          lida: boolean | null
          link_acao: string | null
          mensagem: string | null
          tipo: string | null
          titulo: string
          usuario_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link_acao?: string | null
          mensagem?: string | null
          tipo?: string | null
          titulo: string
          usuario_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          lida?: boolean | null
          link_acao?: string | null
          mensagem?: string | null
          tipo?: string | null
          titulo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      ordens_servico: {
        Row: {
          cc_id: string | null
          cliente_id: string | null
          codigo_os: string | null
          criado_por_id: string | null
          dados_publicos: Json | null
          data_abertura: string | null
          data_conclusao: string | null
          data_entrada: string | null
          data_prazo: string | null
          descricao: string | null
          etapa_atual_ordem: number | null
          id: string
          is_contract_active: boolean | null
          metadata: Json | null
          parent_os_id: string | null
          responsaveis_setores: Json | null
          responsavel_id: string | null
          setor_atual_id: string | null
          setor_solicitante_id: string | null
          status_detalhado: Json | null
          status_geral: Database["public"]["Enums"]["os_status_geral"]
          status_situacao:
            | Database["public"]["Enums"]["os_status_situacao"]
            | null
          tipo_os_id: string
          updated_at: string | null
          valor_contrato: number | null
          valor_proposta: number | null
        }
        Insert: {
          cc_id?: string | null
          cliente_id?: string | null
          codigo_os?: string | null
          criado_por_id?: string | null
          dados_publicos?: Json | null
          data_abertura?: string | null
          data_conclusao?: string | null
          data_entrada?: string | null
          data_prazo?: string | null
          descricao?: string | null
          etapa_atual_ordem?: number | null
          id?: string
          is_contract_active?: boolean | null
          metadata?: Json | null
          parent_os_id?: string | null
          responsaveis_setores?: Json | null
          responsavel_id?: string | null
          setor_atual_id?: string | null
          setor_solicitante_id?: string | null
          status_detalhado?: Json | null
          status_geral?: Database["public"]["Enums"]["os_status_geral"]
          status_situacao?:
            | Database["public"]["Enums"]["os_status_situacao"]
            | null
          tipo_os_id: string
          updated_at?: string | null
          valor_contrato?: number | null
          valor_proposta?: number | null
        }
        Update: {
          cc_id?: string | null
          cliente_id?: string | null
          codigo_os?: string | null
          criado_por_id?: string | null
          dados_publicos?: Json | null
          data_abertura?: string | null
          data_conclusao?: string | null
          data_entrada?: string | null
          data_prazo?: string | null
          descricao?: string | null
          etapa_atual_ordem?: number | null
          id?: string
          is_contract_active?: boolean | null
          metadata?: Json | null
          parent_os_id?: string | null
          responsaveis_setores?: Json | null
          responsavel_id?: string | null
          setor_atual_id?: string | null
          setor_solicitante_id?: string | null
          status_detalhado?: Json | null
          status_geral?: Database["public"]["Enums"]["os_status_geral"]
          status_situacao?:
            | Database["public"]["Enums"]["os_status_situacao"]
            | null
          tipo_os_id?: string
          updated_at?: string | null
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
            foreignKeyName: "ordens_servico_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "ordens_servico_setor_atual_id_fkey"
            columns: ["setor_atual_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_setor_solicitante_id_fkey"
            columns: ["setor_solicitante_id"]
            isOneToOne: false
            referencedRelation: "setores"
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
      os_atividades: {
        Row: {
          criado_em: string | null
          dados_antigos: Json | null
          dados_novos: Json | null
          descricao: string
          etapa_id: string | null
          id: string
          metadados: Json | null
          os_id: string
          tipo: string
          usuario_id: string
        }
        Insert: {
          criado_em?: string | null
          dados_antigos?: Json | null
          dados_novos?: Json | null
          descricao: string
          etapa_id?: string | null
          id?: string
          metadados?: Json | null
          os_id: string
          tipo: string
          usuario_id: string
        }
        Update: {
          criado_em?: string | null
          dados_antigos?: Json | null
          dados_novos?: Json | null
          descricao?: string
          etapa_id?: string | null
          id?: string
          metadados?: Json | null
          os_id?: string
          tipo?: string
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_atividades_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "os_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_atividades_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_atividades_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_atividades_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_atividades_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_atividades_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_atividades_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      os_comentarios: {
        Row: {
          atualizado_em: string | null
          comentario: string
          criado_em: string | null
          etapa_id: string | null
          id: string
          metadados: Json | null
          os_id: string
          tipo: string | null
          usuario_id: string
        }
        Insert: {
          atualizado_em?: string | null
          comentario: string
          criado_em?: string | null
          etapa_id?: string | null
          id?: string
          metadados?: Json | null
          os_id: string
          tipo?: string | null
          usuario_id: string
        }
        Update: {
          atualizado_em?: string | null
          comentario?: string
          criado_em?: string | null
          etapa_id?: string | null
          id?: string
          metadados?: Json | null
          os_id?: string
          tipo?: string | null
          usuario_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_comentarios_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "os_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_comentarios_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_comentarios_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_comentarios_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_comentarios_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_comentarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_comentarios_usuario_id_fkey"
            columns: ["usuario_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      os_documentos: {
        Row: {
          caminho_arquivo: string
          criado_em: string | null
          descricao: string | null
          etapa_id: string | null
          id: string
          metadados: Json | null
          mime_type: string | null
          nome: string
          os_id: string
          tamanho_bytes: number | null
          tipo: string | null
          uploaded_by: string
          visibilidade:
            | Database["public"]["Enums"]["visibilidade_documento"]
            | null
        }
        Insert: {
          caminho_arquivo: string
          criado_em?: string | null
          descricao?: string | null
          etapa_id?: string | null
          id?: string
          metadados?: Json | null
          mime_type?: string | null
          nome: string
          os_id: string
          tamanho_bytes?: number | null
          tipo?: string | null
          uploaded_by: string
          visibilidade?:
            | Database["public"]["Enums"]["visibilidade_documento"]
            | null
        }
        Update: {
          caminho_arquivo?: string
          criado_em?: string | null
          descricao?: string | null
          etapa_id?: string | null
          id?: string
          metadados?: Json | null
          mime_type?: string | null
          nome?: string
          os_id?: string
          tamanho_bytes?: number | null
          tipo?: string | null
          uploaded_by?: string
          visibilidade?:
            | Database["public"]["Enums"]["visibilidade_documento"]
            | null
        }
        Relationships: [
          {
            foreignKeyName: "os_documentos_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "os_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_documentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_documentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_documentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_documentos_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_documentos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_documentos_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      os_etapas: {
        Row: {
          comentarios_count: number | null
          dados_etapa: Json | null
          dados_snapshot: Json | null
          data_conclusao: string | null
          data_inicio: string | null
          documentos_count: number | null
          id: string
          nome_etapa: string
          ordem: number | null
          os_id: string
          requer_aprovacao: boolean | null
          responsavel_id: string | null
          status: Database["public"]["Enums"]["os_etapa_status"]
          ultima_atualizacao: string | null
        }
        Insert: {
          comentarios_count?: number | null
          dados_etapa?: Json | null
          dados_snapshot?: Json | null
          data_conclusao?: string | null
          data_inicio?: string | null
          documentos_count?: number | null
          id?: string
          nome_etapa: string
          ordem?: number | null
          os_id: string
          requer_aprovacao?: boolean | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["os_etapa_status"]
          ultima_atualizacao?: string | null
        }
        Update: {
          comentarios_count?: number | null
          dados_etapa?: Json | null
          dados_snapshot?: Json | null
          data_conclusao?: string | null
          data_inicio?: string | null
          documentos_count?: number | null
          id?: string
          nome_etapa?: string
          ordem?: number | null
          os_id?: string
          requer_aprovacao?: boolean | null
          responsavel_id?: string | null
          status?: Database["public"]["Enums"]["os_etapa_status"]
          ultima_atualizacao?: string | null
        }
        Relationships: [
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
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      os_etapas_adendos: {
        Row: {
          campo_referencia: string
          conteudo: string
          criado_em: string
          criado_por_id: string
          etapa_id: string
          id: string
        }
        Insert: {
          campo_referencia: string
          conteudo: string
          criado_em?: string
          criado_por_id: string
          etapa_id: string
          id?: string
        }
        Update: {
          campo_referencia?: string
          conteudo?: string
          criado_em?: string
          criado_por_id?: string
          etapa_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_etapas_adendos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_adendos_criado_por_id_fkey"
            columns: ["criado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "os_etapas_adendos_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "os_etapas"
            referencedColumns: ["id"]
          },
        ]
      }
      os_etapas_config: {
        Row: {
          ativo: boolean | null
          campos_obrigatorios: Json | null
          configuracoes_extras: Json | null
          created_at: string | null
          etapa_nome: string
          etapa_nome_curto: string | null
          etapa_numero: number
          id: string
          prazo_dias_uteis: number
          requer_aprovacao: boolean | null
          setor_responsavel_id: string | null
          tipo_os_id: string
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          campos_obrigatorios?: Json | null
          configuracoes_extras?: Json | null
          created_at?: string | null
          etapa_nome: string
          etapa_nome_curto?: string | null
          etapa_numero: number
          id?: string
          prazo_dias_uteis?: number
          requer_aprovacao?: boolean | null
          setor_responsavel_id?: string | null
          tipo_os_id: string
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          campos_obrigatorios?: Json | null
          configuracoes_extras?: Json | null
          created_at?: string | null
          etapa_nome?: string
          etapa_nome_curto?: string | null
          etapa_numero?: number
          id?: string
          prazo_dias_uteis?: number
          requer_aprovacao?: boolean | null
          setor_responsavel_id?: string | null
          tipo_os_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_etapas_config_setor_responsavel_id_fkey"
            columns: ["setor_responsavel_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_config_tipo_os_id_fkey"
            columns: ["tipo_os_id"]
            isOneToOne: false
            referencedRelation: "tipos_os"
            referencedColumns: ["id"]
          },
        ]
      }
      os_etapas_config_audit: {
        Row: {
          alterado_em: string | null
          alterado_por_id: string | null
          campo_alterado: string
          config_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string | null
          alterado_por_id?: string | null
          campo_alterado: string
          config_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string | null
          alterado_por_id?: string | null
          campo_alterado?: string
          config_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_etapas_config_audit_alterado_por_id_fkey"
            columns: ["alterado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_config_audit_alterado_por_id_fkey"
            columns: ["alterado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "os_etapas_config_audit_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "os_etapas_config"
            referencedColumns: ["id"]
          },
        ]
      }
      os_etapas_responsavel: {
        Row: {
          ativo: boolean | null
          delegado_em: string | null
          delegado_por_id: string | null
          etapa_id: string
          id: string
          motivo: string | null
          responsavel_id: string
        }
        Insert: {
          ativo?: boolean | null
          delegado_em?: string | null
          delegado_por_id?: string | null
          etapa_id: string
          id?: string
          motivo?: string | null
          responsavel_id: string
        }
        Update: {
          ativo?: boolean | null
          delegado_em?: string | null
          delegado_por_id?: string | null
          etapa_id?: string
          id?: string
          motivo?: string | null
          responsavel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_etapas_responsavel_delegado_por_id_fkey"
            columns: ["delegado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_responsavel_delegado_por_id_fkey"
            columns: ["delegado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "os_etapas_responsavel_etapa_id_fkey"
            columns: ["etapa_id"]
            isOneToOne: false
            referencedRelation: "os_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_responsavel_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_responsavel_responsavel_id_fkey"
            columns: ["responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      os_participantes: {
        Row: {
          adicionado_em: string | null
          adicionado_por_id: string | null
          colaborador_id: string
          etapas_permitidas: number[] | null
          id: string
          observacao: string | null
          ordem_servico_id: string
          papel: string
          setor_id: string | null
        }
        Insert: {
          adicionado_em?: string | null
          adicionado_por_id?: string | null
          colaborador_id: string
          etapas_permitidas?: number[] | null
          id?: string
          observacao?: string | null
          ordem_servico_id: string
          papel?: string
          setor_id?: string | null
        }
        Update: {
          adicionado_em?: string | null
          adicionado_por_id?: string | null
          colaborador_id?: string
          etapas_permitidas?: number[] | null
          id?: string
          observacao?: string | null
          ordem_servico_id?: string
          papel?: string
          setor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_participantes_adicionado_por_id_fkey"
            columns: ["adicionado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_participantes_adicionado_por_id_fkey"
            columns: ["adicionado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "os_participantes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_participantes_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "os_participantes_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_participantes_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_participantes_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_participantes_ordem_servico_id_fkey"
            columns: ["ordem_servico_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_participantes_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      os_requisition_items: {
        Row: {
          created_at: string | null
          descricao: string
          id: string
          link_produto: string | null
          observacao: string | null
          os_etapa_id: string | null
          os_id: string | null
          preco_unitario: number
          quantidade: number
          sub_tipo: Database["public"]["Enums"]["item_subtipo"] | null
          tipo: Database["public"]["Enums"]["item_tipo"]
          unidade_medida: Database["public"]["Enums"]["unidade_medida"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          descricao: string
          id?: string
          link_produto?: string | null
          observacao?: string | null
          os_etapa_id?: string | null
          os_id?: string | null
          preco_unitario: number
          quantidade: number
          sub_tipo?: Database["public"]["Enums"]["item_subtipo"] | null
          tipo: Database["public"]["Enums"]["item_tipo"]
          unidade_medida: Database["public"]["Enums"]["unidade_medida"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          descricao?: string
          id?: string
          link_produto?: string | null
          observacao?: string | null
          os_etapa_id?: string | null
          os_id?: string | null
          preco_unitario?: number
          quantidade?: number
          sub_tipo?: Database["public"]["Enums"]["item_subtipo"] | null
          tipo?: Database["public"]["Enums"]["item_tipo"]
          unidade_medida?: Database["public"]["Enums"]["unidade_medida"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_requisition_items_os_etapa_id_fkey"
            columns: ["os_etapa_id"]
            isOneToOne: false
            referencedRelation: "os_etapas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_requisition_items_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_requisition_items_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_requisition_items_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_requisition_items_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      os_sequences: {
        Row: {
          current_value: number | null
          tipo_os_id: string
          updated_at: string | null
        }
        Insert: {
          current_value?: number | null
          tipo_os_id: string
          updated_at?: string | null
        }
        Update: {
          current_value?: number | null
          tipo_os_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_sequences_tipo_os_id_fkey"
            columns: ["tipo_os_id"]
            isOneToOne: true
            referencedRelation: "tipos_os"
            referencedColumns: ["id"]
          },
        ]
      }
      os_transferencias: {
        Row: {
          coordenador_notificado_id: string | null
          etapa_destino: number
          etapa_origem: number
          id: string
          metadados: Json | null
          motivo: string | null
          os_id: string
          setor_destino_id: string | null
          setor_origem_id: string | null
          transferido_em: string
          transferido_por_id: string
        }
        Insert: {
          coordenador_notificado_id?: string | null
          etapa_destino: number
          etapa_origem: number
          id?: string
          metadados?: Json | null
          motivo?: string | null
          os_id: string
          setor_destino_id?: string | null
          setor_origem_id?: string | null
          transferido_em?: string
          transferido_por_id: string
        }
        Update: {
          coordenador_notificado_id?: string | null
          etapa_destino?: number
          etapa_origem?: number
          id?: string
          metadados?: Json | null
          motivo?: string | null
          os_id?: string
          setor_destino_id?: string | null
          setor_origem_id?: string | null
          transferido_em?: string
          transferido_por_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "os_transferencias_coordenador_notificado_id_fkey"
            columns: ["coordenador_notificado_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_transferencias_coordenador_notificado_id_fkey"
            columns: ["coordenador_notificado_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "os_transferencias_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_transferencias_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_transferencias_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_transferencias_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_transferencias_setor_destino_id_fkey"
            columns: ["setor_destino_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_transferencias_setor_origem_id_fkey"
            columns: ["setor_origem_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_transferencias_transferido_por_id_fkey"
            columns: ["transferido_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_transferencias_transferido_por_id_fkey"
            columns: ["transferido_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      os_vagas_recrutamento: {
        Row: {
          cargo_funcao: string
          created_at: string | null
          data_limite_contratacao: string | null
          escolaridade_minima: string | null
          experiencia_minima: string | null
          habilidades_necessarias: string | null
          id: string
          os_id: string
          perfil_comportamental: string | null
          quantidade: number | null
          salario_base: number | null
          status: string | null
          updated_at: string | null
          urgencia: string | null
        }
        Insert: {
          cargo_funcao: string
          created_at?: string | null
          data_limite_contratacao?: string | null
          escolaridade_minima?: string | null
          experiencia_minima?: string | null
          habilidades_necessarias?: string | null
          id?: string
          os_id: string
          perfil_comportamental?: string | null
          quantidade?: number | null
          salario_base?: number | null
          status?: string | null
          updated_at?: string | null
          urgencia?: string | null
        }
        Update: {
          cargo_funcao?: string
          created_at?: string | null
          data_limite_contratacao?: string | null
          escolaridade_minima?: string | null
          experiencia_minima?: string | null
          habilidades_necessarias?: string | null
          id?: string
          os_id?: string
          perfil_comportamental?: string | null
          quantidade?: number | null
          salario_base?: number | null
          status?: string | null
          updated_at?: string | null
          urgencia?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "os_vagas_recrutamento_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_vagas_recrutamento_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_vagas_recrutamento_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_vagas_recrutamento_os_id_fkey"
            columns: ["os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
            referencedColumns: ["id"]
          },
        ]
      }
      pagamentos: {
        Row: {
          cliente_id: string
          comprovante_url: string | null
          cora_transaction_id: string | null
          created_at: string | null
          dados_cora: Json | null
          data_pagamento: string
          fatura_id: string
          forma_pagamento: string
          id: string
          registrado_por_id: string | null
          valor_desconto_aplicado: number | null
          valor_juros_pago: number | null
          valor_multa_pago: number | null
          valor_pago: number
        }
        Insert: {
          cliente_id: string
          comprovante_url?: string | null
          cora_transaction_id?: string | null
          created_at?: string | null
          dados_cora?: Json | null
          data_pagamento: string
          fatura_id: string
          forma_pagamento: string
          id?: string
          registrado_por_id?: string | null
          valor_desconto_aplicado?: number | null
          valor_juros_pago?: number | null
          valor_multa_pago?: number | null
          valor_pago: number
        }
        Update: {
          cliente_id?: string
          comprovante_url?: string | null
          cora_transaction_id?: string | null
          created_at?: string | null
          dados_cora?: Json | null
          data_pagamento?: string
          fatura_id?: string
          forma_pagamento?: string
          id?: string
          registrado_por_id?: string | null
          valor_desconto_aplicado?: number | null
          valor_juros_pago?: number | null
          valor_multa_pago?: number | null
          valor_pago?: number
        }
        Relationships: [
          {
            foreignKeyName: "pagamentos_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_fatura_id_fkey"
            columns: ["fatura_id"]
            isOneToOne: false
            referencedRelation: "faturas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_registrado_por_id_fkey"
            columns: ["registrado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pagamentos_registrado_por_id_fkey"
            columns: ["registrado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      permission_actions: {
        Row: {
          code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      precificacao_config: {
        Row: {
          ativo: boolean
          campo_editavel: boolean
          campo_nome: string
          created_at: string | null
          id: string
          tipo_os_codigo: string
          updated_at: string | null
          valor_padrao: number
        }
        Insert: {
          ativo?: boolean
          campo_editavel?: boolean
          campo_nome: string
          created_at?: string | null
          id?: string
          tipo_os_codigo: string
          updated_at?: string | null
          valor_padrao?: number
        }
        Update: {
          ativo?: boolean
          campo_editavel?: boolean
          campo_nome?: string
          created_at?: string | null
          id?: string
          tipo_os_codigo?: string
          updated_at?: string | null
          valor_padrao?: number
        }
        Relationships: []
      }
      precificacao_config_audit: {
        Row: {
          alterado_em: string | null
          alterado_por_id: string | null
          campo_alterado: string
          config_id: string
          id: string
          valor_anterior: string | null
          valor_novo: string | null
        }
        Insert: {
          alterado_em?: string | null
          alterado_por_id?: string | null
          campo_alterado: string
          config_id: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Update: {
          alterado_em?: string | null
          alterado_por_id?: string | null
          campo_alterado?: string
          config_id?: string
          id?: string
          valor_anterior?: string | null
          valor_novo?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "precificacao_config_audit_alterado_por_id_fkey"
            columns: ["alterado_por_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "precificacao_config_audit_alterado_por_id_fkey"
            columns: ["alterado_por_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "precificacao_config_audit_config_id_fkey"
            columns: ["config_id"]
            isOneToOne: false
            referencedRelation: "precificacao_config"
            referencedColumns: ["id"]
          },
        ]
      }
      registros_presenca: {
        Row: {
          anexo_url: string | null
          centros_custo: Json | null
          colaborador_id: string
          confirmed_at: string | null
          confirmed_by: string | null
          confirmed_changes: Json | null
          created_at: string | null
          data: string
          id: string
          is_abonada: boolean | null
          justificativa: string | null
          minutos_atraso: number | null
          motivo_abono: string | null
          performance: string
          performance_justificativa: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          anexo_url?: string | null
          centros_custo?: Json | null
          colaborador_id: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_changes?: Json | null
          created_at?: string | null
          data: string
          id?: string
          is_abonada?: boolean | null
          justificativa?: string | null
          minutos_atraso?: number | null
          motivo_abono?: string | null
          performance: string
          performance_justificativa?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          anexo_url?: string | null
          centros_custo?: Json | null
          colaborador_id?: string
          confirmed_at?: string | null
          confirmed_by?: string | null
          confirmed_changes?: Json | null
          created_at?: string | null
          data?: string
          id?: string
          is_abonada?: boolean | null
          justificativa?: string | null
          minutos_atraso?: number | null
          motivo_abono?: string | null
          performance?: string
          performance_justificativa?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registros_presenca_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_presenca_colaborador_id_fkey"
            columns: ["colaborador_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "registros_presenca_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registros_presenca_confirmed_by_fkey"
            columns: ["confirmed_by"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      role_module_permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          created_at: string | null
          id: string
          module_id: string
          role_id: string
          updated_at: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          module_id: string
          role_id: string
          updated_at?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          created_at?: string | null
          id?: string
          module_id?: string
          role_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "role_module_permissions_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "role_module_permissions_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          acesso_financeiro: boolean | null
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          descricao_detalhada: string | null
          escopo_visao: string | null
          id: string
          nivel: number
          nome: string
          pode_aprovar: boolean | null
          pode_delegar: boolean | null
          pode_gerenciar_usuarios: boolean | null
          setor_id: string | null
          slug: string | null
        }
        Insert: {
          acesso_financeiro?: boolean | null
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          descricao_detalhada?: string | null
          escopo_visao?: string | null
          id?: string
          nivel?: number
          nome: string
          pode_aprovar?: boolean | null
          pode_delegar?: boolean | null
          pode_gerenciar_usuarios?: boolean | null
          setor_id?: string | null
          slug?: string | null
        }
        Update: {
          acesso_financeiro?: boolean | null
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          descricao_detalhada?: string | null
          escopo_visao?: string | null
          id?: string
          nivel?: number
          nome?: string
          pode_aprovar?: boolean | null
          pode_delegar?: boolean | null
          pode_gerenciar_usuarios?: boolean | null
          setor_id?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "roles_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      setores: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          descricao: string | null
          id: string
          nome: string
          slug: string
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome: string
          slug: string
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          descricao?: string | null
          id?: string
          nome?: string
          slug?: string
        }
        Relationships: []
      }
      sistema_avisos: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          mensagem: string
          tipo: string | null
          titulo: string
          validade: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mensagem: string
          tipo?: string | null
          titulo: string
          validade?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mensagem?: string
          tipo?: string | null
          titulo?: string
          validade?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sistema_avisos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sistema_avisos_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      tipos_os: {
        Row: {
          ativo: boolean | null
          codigo: string | null
          id: string
          nome: string
          setor_padrao_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo?: string | null
          id?: string
          nome: string
          setor_padrao_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string | null
          id?: string
          nome?: string
          setor_padrao_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tipos_os_setor_padrao_id_fkey"
            columns: ["setor_padrao_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      turnos: {
        Row: {
          ativo: boolean
          atualizado_em: string
          cor: string
          criado_em: string
          criado_por: string | null
          data_fim: string | null
          data_inicio: string | null
          dias_semana: number[] | null
          hora_fim: string
          hora_inicio: string
          id: string
          setores: Json
          tipo_recorrencia: string
          vagas_por_setor: Json | null
          vagas_total: number
        }
        Insert: {
          ativo?: boolean
          atualizado_em?: string
          cor?: string
          criado_em?: string
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias_semana?: number[] | null
          hora_fim: string
          hora_inicio: string
          id?: string
          setores?: Json
          tipo_recorrencia?: string
          vagas_por_setor?: Json | null
          vagas_total?: number
        }
        Update: {
          ativo?: boolean
          atualizado_em?: string
          cor?: string
          criado_em?: string
          criado_por?: string | null
          data_fim?: string | null
          data_inicio?: string | null
          dias_semana?: number[] | null
          hora_fim?: string
          hora_inicio?: string
          id?: string
          setores?: Json
          tipo_recorrencia?: string
          vagas_por_setor?: Json | null
          vagas_total?: number
        }
        Relationships: [
          {
            foreignKeyName: "turnos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "turnos_criado_por_fkey"
            columns: ["criado_por"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          role_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      os_detalhes_completos: {
        Row: {
          cc_id: string | null
          cliente_email: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_telefone: string | null
          cliente_tipo: Database["public"]["Enums"]["tipo_cliente"] | null
          codigo_os: string | null
          comentarios_count: number | null
          criado_por_id: string | null
          criado_por_nome: string | null
          data_conclusao: string | null
          data_entrada: string | null
          data_prazo: string | null
          descricao: string | null
          documentos_count: number | null
          etapas_concluidas_count: number | null
          etapas_total_count: number | null
          id: string | null
          metadata: Json | null
          parent_os_id: string | null
          responsavel_avatar_url: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          status_detalhado: Json | null
          status_geral: Database["public"]["Enums"]["os_status_geral"] | null
          tipo_os_id: string | null
          tipo_os_nome: string | null
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
            foreignKeyName: "ordens_servico_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
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
      v_requisicoes_com_valor: {
        Row: {
          cc_id: string | null
          centro_custo: Json | null
          cliente_id: string | null
          codigo_os: string | null
          criado_por: Json | null
          criado_por_id: string | null
          dados_publicos: Json | null
          data_abertura: string | null
          data_conclusao: string | null
          data_entrada: string | null
          data_prazo: string | null
          descricao: string | null
          etapa_atual_ordem: number | null
          id: string | null
          is_contract_active: boolean | null
          metadata: Json | null
          parent_os_id: string | null
          qtdItens: number | null
          responsaveis_setores: Json | null
          responsavel: Json | null
          responsavel_id: string | null
          setor_atual_id: string | null
          setor_solicitante_id: string | null
          status_detalhado: Json | null
          status_geral: Database["public"]["Enums"]["os_status_geral"] | null
          status_situacao:
            | Database["public"]["Enums"]["os_status_situacao"]
            | null
          tipo_os: Json | null
          tipo_os_id: string | null
          updated_at: string | null
          valor_contrato: number | null
          valor_proposta: number | null
          valorTotal: number | null
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
            foreignKeyName: "ordens_servico_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "ordens_servico_setor_atual_id_fkey"
            columns: ["setor_atual_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_setor_solicitante_id_fkey"
            columns: ["setor_solicitante_id"]
            isOneToOne: false
            referencedRelation: "setores"
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
      vw_custo_total_colaborador_mensal: {
        Row: {
          colaborador_id: string | null
          custo_dia_calculado: number | null
          custo_fixo: number | null
          custo_total: number | null
          custo_variavel: number | null
          mes: string | null
          nome_completo: string | null
        }
        Relationships: []
      }
      vw_custos_mo_por_cc: {
        Row: {
          cc_id: string | null
          custo_mo_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "alocacao_horas_cc_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "alocacao_horas_cc_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
        ]
      }
      vw_custos_operacionais_por_cc: {
        Row: {
          cc_id: string | null
          custo_previsto: number | null
          custo_realizado: number | null
          qtd_lancamentos: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_pagar_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_pagar_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
        ]
      }
      vw_distribuicao_custos_departamentais: {
        Row: {
          custo_distribuido_por_cliente: number | null
          custo_escritorio: number | null
          custo_setor: number | null
          metade_escritorio: number | null
          periodo: string | null
          qtd_clientes_ativos: number | null
          setor_id: string | null
          setor_nome: string | null
        }
        Relationships: [
          {
            foreignKeyName: "centros_custo_setor_id_fkey"
            columns: ["setor_id"]
            isOneToOne: false
            referencedRelation: "setores"
            referencedColumns: ["id"]
          },
        ]
      }
      vw_lucratividade_cc: {
        Row: {
          cc_id: string | null
          contrato_global: number | null
          custo_mo_total: number | null
          custo_op_previsto: number | null
          custo_op_realizado: number | null
          custo_overhead_total: number | null
          custo_total_previsto: number | null
          custo_total_realizado: number | null
          lucro_previsto: number | null
          lucro_realizado: number | null
          margem_realizada_pct: number | null
          nome: string | null
          receita_prevista: number | null
          receita_realizada: number | null
        }
        Relationships: []
      }
      vw_os_status_completo: {
        Row: {
          cliente_cidade: string | null
          cliente_id: string | null
          cliente_nome: string | null
          cliente_tipo: Database["public"]["Enums"]["tipo_cliente"] | null
          cliente_uf: string | null
          codigo_os: string | null
          data_conclusao: string | null
          data_entrada: string | null
          data_prazo: string | null
          descricao: string | null
          etapa_ativa_nome: string | null
          etapa_ativa_ordem: number | null
          etapa_atual_ordem: number | null
          etapa_responsavel_id: string | null
          etapa_responsavel_nome: string | null
          etapa_status: Database["public"]["Enums"]["os_etapa_status"] | null
          id: string | null
          is_alerta_prazo: boolean | null
          is_atrasado: boolean | null
          is_em_validacao: boolean | null
          parent_os_id: string | null
          parent_os_setor_slug: string | null
          responsavel_avatar_url: string | null
          responsavel_id: string | null
          responsavel_nome: string | null
          setor_nome: string | null
          setor_slug: string | null
          status_geral: Database["public"]["Enums"]["os_status_geral"] | null
          status_situacao:
            | Database["public"]["Enums"]["os_status_situacao"]
            | null
          tipo_os_codigo: string | null
          tipo_os_id: string | null
          tipo_os_nome: string | null
          total_etapas: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ordens_servico_cliente_id_fkey"
            columns: ["cliente_id"]
            isOneToOne: false
            referencedRelation: "clientes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "ordens_servico"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "os_detalhes_completos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "v_requisicoes_com_valor"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ordens_servico_parent_os_id_fkey"
            columns: ["parent_os_id"]
            isOneToOne: false
            referencedRelation: "vw_os_status_completo"
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
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
          {
            foreignKeyName: "ordens_servico_tipo_os_id_fkey"
            columns: ["tipo_os_id"]
            isOneToOne: false
            referencedRelation: "tipos_os"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_responsavel_id_fkey"
            columns: ["etapa_responsavel_id"]
            isOneToOne: false
            referencedRelation: "colaboradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "os_etapas_responsavel_id_fkey"
            columns: ["etapa_responsavel_id"]
            isOneToOne: false
            referencedRelation: "vw_custo_total_colaborador_mensal"
            referencedColumns: ["colaborador_id"]
          },
        ]
      }
      vw_overhead_por_cc: {
        Row: {
          cc_id: string | null
          custo_overhead_total: number | null
        }
        Relationships: [
          {
            foreignKeyName: "custos_overhead_mensal_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custos_overhead_mensal_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
        ]
      }
      vw_receitas_por_cc: {
        Row: {
          cc_id: string | null
          qtd_titulos: number | null
          receita_prevista: number | null
          receita_realizada: number | null
        }
        Relationships: [
          {
            foreignKeyName: "contas_receber_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "centros_custo"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contas_receber_cc_id_fkey"
            columns: ["cc_id"]
            isOneToOne: false
            referencedRelation: "vw_lucratividade_cc"
            referencedColumns: ["cc_id"]
          },
        ]
      }
    }
    Functions: {
      add_business_days: {
        Args: { num_days: number; start_date: string }
        Returns: string
      }
      aprovar_requisicao_compra: {
        Args: {
          p_documento_id?: string
          p_observacao?: string
          p_os_id: string
        }
        Returns: string
      }
      calcular_custo_dia: {
        Args: {
          p_ano?: number
          p_custo_dia_manual?: number
          p_mes?: number
          p_salario_base: number
          p_tipo_contratacao: string
        }
        Returns: number
      }
      calcular_custo_dia_colaborador: {
        Args: { p_colaborador_id: string }
        Returns: number
      }
      calcular_overhead_mensal: {
        Args: {
          p_custo_adm: number
          p_custo_assessoria: number
          p_custo_obras: number
          p_mes_referencia: string
        }
        Returns: {
          ccs_processados: number
          valor_por_cc: number
        }[]
      }
      calculate_os_deadline: {
        Args: { p_start_date: string; p_tipo_os_id: string }
        Returns: string
      }
      check_colaborador_access: {
        Args: { target_setor_id: string }
        Returns: boolean
      }
      classificar_transacao_bancaria: {
        Args: {
          p_categoria_id: string
          p_cc_id: string
          p_comprovante_url?: string
          p_lancamento_id: string
          p_nota_fiscal_url?: string
          p_observacoes?: string
          p_rateios?: Json
          p_setor_id: string
          p_user_id?: string
        }
        Returns: Json
      }
      confirmar_aprovacao: {
        Args: { p_etapa_ordem: number; p_os_id: string }
        Returns: Json
      }
      contar_dias_uteis_mes: {
        Args: { p_ano: number; p_mes: number }
        Returns: number
      }
      find_auth_user_by_email: {
        Args: { user_email: string }
        Returns: {
          email: string
          id: string
        }[]
      }
      fn_atualizar_faturas_atrasadas: { Args: never; Returns: number }
      fn_atualizar_inadimplencia: { Args: never; Returns: number }
      fn_calcular_encargos_fatura: {
        Args: {
          p_fatura_id: string
          p_juros_dia_percentual?: number
          p_multa_percentual?: number
        }
        Returns: number
      }
      gerar_centro_custo: {
        Args: {
          p_cliente_id: string
          p_descricao?: string
          p_tipo_os_id: string
        }
        Returns: {
          cc_id: string
          cc_nome: string
        }[]
      }
      gerar_codigo_os: { Args: { p_tipo_os_id: string }; Returns: string }
      gerar_parcelas_contrato: {
        Args: { p_contrato_id: string }
        Returns: number
      }
      get_auth_user_cargo_slug: { Args: never; Returns: string }
      get_auth_user_nivel: { Args: never; Returns: number }
      get_auth_user_setor_id: { Args: never; Returns: string }
      get_current_cliente_id: { Args: never; Returns: string }
      get_despesas_kpis: { Args: { p_month?: string }; Returns: Json }
      get_lucratividade_cc: {
        Args: { p_cc_id: string }
        Returns: {
          cc_id: string
          cc_nome: string
          codigo_os: string
          custo_mo_total: number
          custo_operacional_total: number
          custo_total: number
          lucro_previsto: number
          lucro_realizado: number
          margem_prevista_pct: number
          margem_realizada_pct: number
          os_id: string
          receita_prevista: number
          receita_realizada: number
          status_financeiro: string
          valor_contrato: number
        }[]
      }
      get_my_cargo_nivel: { Args: never; Returns: number }
      get_my_cargo_nivel_from_meta: { Args: never; Returns: number }
      get_my_cargo_slug_from_meta: { Args: never; Returns: string }
      get_my_setor_id: { Args: never; Returns: string }
      get_my_setor_slug_from_meta: { Args: never; Returns: string }
      get_portal_cliente_id: { Args: never; Returns: string }
      incrementar_sequencia_cc: {
        Args: { p_tipo_os_id: string }
        Returns: number
      }
      is_business_day: { Args: { check_date: string }; Returns: boolean }
      is_os_contrato: { Args: { p_tipo_os_codigo: string }; Returns: boolean }
      is_staff: { Args: never; Returns: boolean }
      migrar_centros_custo_para_alocacao: { Args: never; Returns: undefined }
      obter_estatisticas_turno: {
        Args: { p_data_fim: string; p_data_inicio: string; p_turno_id: string }
        Returns: {
          agendamentos_ausentes: number
          agendamentos_cancelados: number
          agendamentos_confirmados: number
          agendamentos_realizados: number
          taxa_ocupacao: number
          total_agendamentos: number
        }[]
      }
      obter_turnos_disponiveis: {
        Args: { p_data: string }
        Returns: {
          cor: string
          hora_fim: string
          hora_inicio: string
          setores: Json
          turno_id: string
          vagas_ocupadas: number
          vagas_total: number
        }[]
      }
      registrar_atividade_os: {
        Args: {
          p_dados_antigos?: Json
          p_dados_novos?: Json
          p_descricao: string
          p_etapa_id?: string
          p_metadados?: Json
          p_os_id: string
          p_tipo: string
          p_usuario_id: string
        }
        Returns: string
      }
      rejeitar_aprovacao: {
        Args: { p_etapa_ordem: number; p_motivo: string; p_os_id: string }
        Returns: Json
      }
      solicitar_aprovacao: {
        Args: {
          p_etapa_ordem: number
          p_justificativa?: string
          p_os_id: string
        }
        Returns: Json
      }
      validar_fechamento_centro_custo: {
        Args: { p_cc_id: string }
        Returns: {
          pendencias: Json
          pendencias_count: number
          pode_fechar: boolean
        }[]
      }
      verificar_aprovacao_etapa: {
        Args: { p_etapa_ordem: number; p_os_id: string }
        Returns: {
          aprovado_em: string
          aprovador_id: string
          aprovador_nome: string
          motivo_rejeicao: string
          requer_aprovacao: boolean
          solicitado_em: string
          solicitante_id: string
          solicitante_nome: string
          status_aprovacao: string
        }[]
      }
      verificar_bloqueio: {
        Args: {
          p_data: string
          p_hora_fim?: string
          p_hora_inicio?: string
          p_setor_slug?: string
        }
        Returns: boolean
      }
      verificar_limite_envios_diario: {
        Args: { p_usuario_id: string }
        Returns: {
          envios_hoje: number
          limite_diario: number
          mensagem: string
          pode_enviar: boolean
        }[]
      }
      verificar_vagas_setor: {
        Args: {
          p_data: string
          p_horario_fim?: string
          p_horario_inicio?: string
          p_setor: string
          p_turno_id: string
        }
        Returns: number
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
      agendamento_status: "agendado" | "confirmado" | "realizado" | "cancelado"
      cliente_status: "lead" | "ativo" | "inativo" | "blacklist"
      delegacao_status: "pendente" | "aceita" | "recusada" | "concluida"
      financeiro_tipo: "receita" | "despesa"
      item_subtipo: "Locação" | "Aquisição"
      item_tipo:
        | "Material"
        | "Ferramenta"
        | "Equipamento"
        | "Logística"
        | "Documentação"
      metodo_transacao: "PIX" | "BOLETO" | "TRANSFER" | "OTHER"
      os_etapa_status:
        | "pendente"
        | "em_andamento"
        | "concluida"
        | "bloqueada"
        | "cancelada"
      os_status_geral:
        | "em_triagem"
        | "em_andamento"
        | "aguardando_info"
        | "concluido"
        | "cancelado"
        | "aguardando_aprovacao"
      os_status_situacao:
        | "acao_pendente"
        | "aguardando_aprovacao"
        | "aguardando_info"
        | "atrasado"
        | "alerta_prazo"
        | "finalizado"
      tipo_cliente: "PESSOA_FISICA" | "PESSOA_JURIDICA"
      tipo_despesa: "fixa" | "variavel"
      tipo_empresa:
        | "ADMINISTRADORA"
        | "CONDOMINIO"
        | "CONSTRUTORA"
        | "INCORPORADORA"
        | "INDUSTRIA"
        | "COMERCIO"
        | "OUTROS"
      tipo_lancamento: "CREDIT" | "DEBIT"
      unidade_medida: "UN" | "KG" | "M" | "L" | "CX" | "M2" | "M3" | "TON"
      visibilidade_documento: "interno" | "publico" | "cliente"
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
      agendamento_status: ["agendado", "confirmado", "realizado", "cancelado"],
      cliente_status: ["lead", "ativo", "inativo", "blacklist"],
      delegacao_status: ["pendente", "aceita", "recusada", "concluida"],
      financeiro_tipo: ["receita", "despesa"],
      item_subtipo: ["Locação", "Aquisição"],
      item_tipo: [
        "Material",
        "Ferramenta",
        "Equipamento",
        "Logística",
        "Documentação",
      ],
      metodo_transacao: ["PIX", "BOLETO", "TRANSFER", "OTHER"],
      os_etapa_status: [
        "pendente",
        "em_andamento",
        "concluida",
        "bloqueada",
        "cancelada",
      ],
      os_status_geral: [
        "em_triagem",
        "em_andamento",
        "aguardando_info",
        "concluido",
        "cancelado",
        "aguardando_aprovacao",
      ],
      os_status_situacao: [
        "acao_pendente",
        "aguardando_aprovacao",
        "aguardando_info",
        "atrasado",
        "alerta_prazo",
        "finalizado",
      ],
      tipo_cliente: ["PESSOA_FISICA", "PESSOA_JURIDICA"],
      tipo_despesa: ["fixa", "variavel"],
      tipo_empresa: [
        "ADMINISTRADORA",
        "CONDOMINIO",
        "CONSTRUTORA",
        "INCORPORADORA",
        "INDUSTRIA",
        "COMERCIO",
        "OUTROS",
      ],
      tipo_lancamento: ["CREDIT", "DEBIT"],
      unidade_medida: ["UN", "KG", "M", "L", "CX", "M2", "M3", "TON"],
      visibilidade_documento: ["interno", "publico", "cliente"],
    },
  },
} as const
