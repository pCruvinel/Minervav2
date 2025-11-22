-- =====================================================
-- Migration: Correção de Tabelas de Calendário
-- Descrição: Dropa e recria tabelas para garantir estrutura correta
-- Data: 2025-11-22
-- =====================================================

-- Dropar funções antigas se existirem
DROP FUNCTION IF EXISTS public.obter_turnos_disponiveis(DATE);
DROP FUNCTION IF EXISTS public.verificar_vagas_turno(UUID, DATE, TIME, TIME);
DROP FUNCTION IF EXISTS public.obter_estatisticas_turno(UUID, DATE, DATE);

-- Dropar tabelas antigas se existirem (em ordem correta por FK)
DROP TABLE IF EXISTS public.agendamentos CASCADE;
DROP TABLE IF EXISTS public.turnos CASCADE;

-- Recriar tudo do zero usando o conteúdo da migration anterior
-- Isso está duplicado propositalmente para garantir que funcione

-- =====================================================
-- TABELA: turnos
-- =====================================================

CREATE TABLE public.turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,
  vagas_total INTEGER NOT NULL DEFAULT 1,
  setores JSONB NOT NULL DEFAULT '[]'::jsonb,
  cor VARCHAR(7) NOT NULL DEFAULT '#3B82F6',
  ativo BOOLEAN NOT NULL DEFAULT true,
  tipo_recorrencia VARCHAR(20) NOT NULL DEFAULT 'todos',
  data_inicio DATE,
  data_fim DATE,
  dias_semana INTEGER[],
  criado_por UUID REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT turnos_hora_valida CHECK (hora_fim > hora_inicio),
  CONSTRAINT turnos_vagas_positivas CHECK (vagas_total > 0),
  CONSTRAINT turnos_tipo_recorrencia_valido CHECK (tipo_recorrencia IN ('todos', 'uteis', 'custom'))
);

CREATE INDEX idx_turnos_ativo ON public.turnos(ativo);
CREATE INDEX idx_turnos_hora_inicio ON public.turnos(hora_inicio);
CREATE INDEX idx_turnos_recorrencia ON public.turnos(tipo_recorrencia);

-- =====================================================
-- TABELA: agendamentos
-- =====================================================

CREATE TABLE public.agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  turno_id UUID NOT NULL REFERENCES public.turnos(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  duracao_horas NUMERIC(4,2) NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  setor VARCHAR(50) NOT NULL,
  solicitante_nome VARCHAR(255),
  solicitante_contato VARCHAR(100),
  solicitante_observacoes TEXT,
  os_id UUID REFERENCES public.ordens_servico(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'confirmado',
  cancelado_em TIMESTAMP WITH TIME ZONE,
  cancelado_motivo TEXT,
  criado_por UUID REFERENCES public.colaboradores(id) ON DELETE SET NULL,
  criado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),

  CONSTRAINT agendamentos_horario_valido CHECK (horario_fim > horario_inicio),
  CONSTRAINT agendamentos_duracao_positiva CHECK (duracao_horas > 0),
  CONSTRAINT agendamentos_status_valido CHECK (status IN ('confirmado', 'cancelado', 'realizado', 'ausente'))
);

CREATE INDEX idx_agendamentos_turno_id ON public.agendamentos(turno_id);
CREATE INDEX idx_agendamentos_data ON public.agendamentos(data);
CREATE INDEX idx_agendamentos_status ON public.agendamentos(status);
CREATE INDEX idx_agendamentos_setor ON public.agendamentos(setor);
CREATE INDEX idx_agendamentos_os_id ON public.agendamentos(os_id);
CREATE INDEX idx_agendamentos_turno_data ON public.agendamentos(turno_id, data);

-- =====================================================
-- TRIGGERS
-- =====================================================

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
-- RLS
-- =====================================================

ALTER TABLE public.turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas TURNOS
CREATE POLICY "turnos_admin_full_access" ON public.turnos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid() AND cg.slug IN ('admin', 'diretoria')
    )
  );

CREATE POLICY "turnos_gestor_read" ON public.turnos FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid() AND cg.nivel_acesso >= 5
    )
  );

CREATE POLICY "turnos_colaborador_read" ON public.turnos FOR SELECT TO authenticated
  USING (
    ativo = true AND EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid() AND c.ativo = true
    )
  );

-- Políticas AGENDAMENTOS
CREATE POLICY "agendamentos_admin_full_access" ON public.agendamentos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid() AND cg.slug IN ('admin', 'diretoria')
    )
  );

CREATE POLICY "agendamentos_gestor_setor" ON public.agendamentos FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      JOIN public.setores s ON c.setor_id = s.id
      WHERE c.id = auth.uid() AND cg.nivel_acesso >= 5
      AND (agendamentos.setor = s.slug OR cg.slug = 'gestor_administrativo')
    )
  );

CREATE POLICY "agendamentos_colaborador_create" ON public.agendamentos FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid() AND c.ativo = true
    )
  );

CREATE POLICY "agendamentos_colaborador_read" ON public.agendamentos FOR SELECT TO authenticated
  USING (
    criado_por = auth.uid() OR EXISTS (
      SELECT 1 FROM public.colaboradores c
      JOIN public.cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid() AND cg.nivel_acesso >= 5
    )
  );

-- Comentários
COMMENT ON TABLE public.turnos IS 'Turnos de atendimento/agendamento com recorrência configurável';
COMMENT ON TABLE public.agendamentos IS 'Agendamentos de usuários em turnos específicos';
