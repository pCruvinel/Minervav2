-- =====================================================
-- Migration: Sistema de Calendário (Turnos e Agendamentos)
-- Descrição: Cria tabelas para gerenciar turnos de atendimento e agendamentos
-- Data: 2025-11-22
-- =====================================================

-- =====================================================
-- 1. TABELA: turnos
-- =====================================================
-- Armazena turnos de atendimento com recorrência configurável

CREATE TABLE IF NOT EXISTS public.turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Horários do turno
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,

  -- Capacidade
  vagas_total INTEGER NOT NULL DEFAULT 1,

  -- Setores permitidos (JSONB array de strings)
  setores JSONB NOT NULL DEFAULT '[]'::jsonb,

  -- Estilização visual
  cor VARCHAR(7) NOT NULL DEFAULT '#3B82F6', -- Hex color

  -- Controle
  ativo BOOLEAN NOT NULL DEFAULT true,

  -- Configuração de recorrência
  tipo_recorrencia VARCHAR(20) NOT NULL DEFAULT 'todos', -- 'todos', 'uteis', 'custom'
  data_inicio DATE, -- Início da validade do turno
  data_fim DATE, -- Fim da validade do turno
  dias_semana INTEGER[], -- Array de dias da semana (0=Dom, 1=Seg, ..., 6=Sab)

  -- Auditoria
  criado_por UUID REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Validações
  CONSTRAINT turnos_hora_valida CHECK (hora_fim > hora_inicio),
  CONSTRAINT turnos_vagas_positivas CHECK (vagas_total > 0),
  CONSTRAINT turnos_tipo_recorrencia_valido CHECK (
    tipo_recorrencia IN ('todos', 'uteis', 'custom')
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_turnos_ativo ON public.turnos(ativo);
CREATE INDEX IF NOT EXISTS idx_turnos_hora_inicio ON public.turnos(hora_inicio);
CREATE INDEX IF NOT EXISTS idx_turnos_recorrencia ON public.turnos(tipo_recorrencia);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_turnos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_turnos_timestamp
  BEFORE UPDATE ON public.turnos
  FOR EACH ROW
  EXECUTE FUNCTION update_turnos_timestamp();

-- =====================================================
-- 2. TABELA: agendamentos
-- =====================================================
-- Armazena agendamentos de usuários em turnos específicos

CREATE TABLE IF NOT EXISTS public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relação com turno
  turno_id UUID NOT NULL REFERENCES public.turnos(id) ON DELETE CASCADE,

  -- Data e horário do agendamento
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  duracao_horas NUMERIC(4,2) NOT NULL,

  -- Informações do agendamento
  categoria VARCHAR(100) NOT NULL, -- Ex: "Atendimento", "Reunião", "Consultoria"
  setor VARCHAR(50) NOT NULL, -- Ex: "obras", "assessoria"

  -- Dados do solicitante
  solicitante_nome VARCHAR(255),
  solicitante_contato VARCHAR(100),
  solicitante_observacoes TEXT,

  -- Relação com OS (opcional)
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,

  -- Status do agendamento
  status VARCHAR(20) NOT NULL DEFAULT 'confirmado', -- 'confirmado', 'cancelado', 'realizado', 'ausente'

  -- Cancelamento
  cancelado_em TIMESTAMP WITH TIME ZONE,
  cancelado_motivo TEXT,

  -- Auditoria
  criado_por UUID REFERENCES public.colaboradores(id),
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  -- Validações
  CONSTRAINT agendamentos_horario_valido CHECK (horario_fim > horario_inicio),
  CONSTRAINT agendamentos_duracao_positiva CHECK (duracao_horas > 0),
  CONSTRAINT agendamentos_status_valido CHECK (
    status IN ('confirmado', 'cancelado', 'realizado', 'ausente')
  )
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_agendamentos_turno_id ON public.agendamentos(turno_id);
CREATE INDEX IF NOT EXISTS idx_agendamentos_data ON public.agendamentos(data);
CREATE INDEX IF NOT EXISTS idx_agendamentos_status ON public.agendamentos(status);
CREATE INDEX IF NOT EXISTS idx_agendamentos_setor ON public.agendamentos(setor);
CREATE INDEX IF NOT EXISTS idx_agendamentos_os_id ON public.agendamentos(os_id);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_agendamentos_turno_data ON public.agendamentos(turno_id, data);

-- Trigger para atualizar timestamp
CREATE OR REPLACE FUNCTION update_agendamentos_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_agendamentos_timestamp
  BEFORE UPDATE ON public.agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION update_agendamentos_timestamp();

-- =====================================================
-- 3. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para TURNOS
-- Admin e Diretoria: acesso total
CREATE POLICY "turnos_admin_full_access" ON public.turnos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid()
      AND cg.slug IN ('admin', 'diretoria')
    )
  );

-- Gestores: podem ler todos, mas só editar do próprio setor
CREATE POLICY "turnos_gestor_read" ON public.turnos
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid()
      AND cg.nivel_acesso >= 5
    )
  );

-- Colaboradores: apenas leitura de turnos ativos
CREATE POLICY "turnos_colaborador_read" ON public.turnos
  FOR SELECT
  TO authenticated
  USING (
    ativo = true
    AND EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid()
      AND c.ativo = true
    )
  );

-- Políticas para AGENDAMENTOS
-- Admin e Diretoria: acesso total
CREATE POLICY "agendamentos_admin_full_access" ON public.agendamentos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid()
      AND cg.slug IN ('admin', 'diretoria')
    )
  );

-- Gestores: podem ler e gerenciar agendamentos do seu setor
CREATE POLICY "agendamentos_gestor_setor" ON public.agendamentos
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      JOIN public.setores s ON c.setor_id = s.id
      WHERE c.id = auth.uid()
      AND cg.nivel_acesso >= 5
      AND (
        agendamentos.setor = s.slug
        OR cg.slug = 'gestor_administrativo' -- Gestor Adm vê tudo
      )
    )
  );

-- Colaboradores: podem criar agendamentos e ver os próprios
CREATE POLICY "agendamentos_colaborador_create" ON public.agendamentos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid()
      AND c.ativo = true
    )
  );

CREATE POLICY "agendamentos_colaborador_read" ON public.agendamentos
  FOR SELECT
  TO authenticated
  USING (
    criado_por = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid()
      AND cg.nivel_acesso >= 5
    )
  );

-- =====================================================
-- 4. COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE public.turnos IS 'Turnos de atendimento/agendamento com recorrência configurável';
COMMENT ON COLUMN public.turnos.tipo_recorrencia IS 'todos: todos os dias | uteis: seg-sex | custom: dias_semana específicos';
COMMENT ON COLUMN public.turnos.dias_semana IS 'Array de inteiros: 0=Domingo, 1=Segunda, ..., 6=Sábado';
COMMENT ON COLUMN public.turnos.setores IS 'JSONB array de strings com setores permitidos';

COMMENT ON TABLE public.agendamentos IS 'Agendamentos de usuários em turnos específicos';
COMMENT ON COLUMN public.agendamentos.status IS 'confirmado: ativo | cancelado: cancelado pelo usuário | realizado: atendimento concluído | ausente: não compareceu';
