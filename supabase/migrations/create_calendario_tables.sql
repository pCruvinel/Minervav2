-- =====================================================
-- Migration: Sistema de Calendário e Agendamentos
-- Data: 2025-01-18
-- Descrição: Criação de tabelas para gerenciamento de turnos e agendamentos
-- =====================================================

-- =====================================================
-- TABELA: turnos
-- Descrição: Armazena os turnos disponíveis para agendamento
-- =====================================================
CREATE TABLE IF NOT EXISTS turnos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Horário do turno
  hora_inicio TIME NOT NULL,
  hora_fim TIME NOT NULL,

  -- Capacidade
  vagas_total INTEGER NOT NULL DEFAULT 5,

  -- Setores permitidos (array de strings)
  setores TEXT[] NOT NULL DEFAULT '{}',

  -- Cor para identificação visual (hex color)
  cor VARCHAR(7) NOT NULL DEFAULT '#93C5FD',

  -- Recorrência
  tipo_recorrencia VARCHAR(20) NOT NULL DEFAULT 'uteis', -- 'todos', 'uteis', 'custom'
  data_inicio DATE, -- Para recorrência custom
  data_fim DATE,    -- Para recorrência custom
  dias_semana INTEGER[], -- Array de dias (0=Domingo, 1=Segunda, etc) para recorrência custom

  -- Metadados
  ativo BOOLEAN NOT NULL DEFAULT true,
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),

  -- Constraints
  CONSTRAINT hora_valida CHECK (hora_fim > hora_inicio),
  CONSTRAINT vagas_positivas CHECK (vagas_total > 0),
  CONSTRAINT tipo_recorrencia_valido CHECK (tipo_recorrencia IN ('todos', 'uteis', 'custom'))
);

-- =====================================================
-- TABELA: agendamentos
-- Descrição: Armazena os agendamentos realizados em turnos
-- =====================================================
CREATE TABLE IF NOT EXISTS agendamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Relacionamento com turno
  turno_id UUID NOT NULL REFERENCES turnos(id) ON DELETE CASCADE,

  -- Data e horário específico do agendamento
  data DATE NOT NULL,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  duracao_horas INTEGER NOT NULL DEFAULT 1,

  -- Informações do agendamento
  categoria VARCHAR(100) NOT NULL, -- 'Vistoria Inicial', 'Apresentação de Proposta', etc
  setor VARCHAR(50) NOT NULL, -- 'Comercial', 'Obras', 'Assessoria'

  -- Informações do solicitante
  solicitante_nome VARCHAR(200),
  solicitante_contato VARCHAR(50),
  solicitante_observacoes TEXT,

  -- Relacionamento com OS (opcional)
  os_id UUID REFERENCES ordens_servico(id),

  -- Status
  status VARCHAR(20) NOT NULL DEFAULT 'confirmado', -- 'confirmado', 'cancelado', 'realizado', 'ausente'

  -- Metadados
  criado_por UUID REFERENCES auth.users(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  cancelado_em TIMESTAMP WITH TIME ZONE,
  cancelado_motivo TEXT,

  -- Constraints
  CONSTRAINT horario_valido CHECK (horario_fim > horario_inicio),
  CONSTRAINT duracao_positiva CHECK (duracao_horas > 0),
  CONSTRAINT status_valido CHECK (status IN ('confirmado', 'cancelado', 'realizado', 'ausente'))
);

-- =====================================================
-- ÍNDICES para performance
-- =====================================================

-- Índice para buscar turnos ativos
CREATE INDEX idx_turnos_ativos ON turnos(ativo) WHERE ativo = true;

-- Índice para buscar turnos por recorrência
CREATE INDEX idx_turnos_recorrencia ON turnos(tipo_recorrencia);

-- Índice para buscar agendamentos por turno
CREATE INDEX idx_agendamentos_turno ON agendamentos(turno_id);

-- Índice para buscar agendamentos por data
CREATE INDEX idx_agendamentos_data ON agendamentos(data);

-- Índice para buscar agendamentos por status
CREATE INDEX idx_agendamentos_status ON agendamentos(status);

-- Índice para buscar agendamentos por OS
CREATE INDEX idx_agendamentos_os ON agendamentos(os_id) WHERE os_id IS NOT NULL;

-- Índice composto para buscar agendamentos de um turno em uma data específica
CREATE INDEX idx_agendamentos_turno_data ON agendamentos(turno_id, data);

-- =====================================================
-- TRIGGERS para atualização automática de timestamps
-- =====================================================

-- Função para atualizar timestamp
CREATE OR REPLACE FUNCTION atualizar_timestamp_calendario()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para turnos
CREATE TRIGGER trigger_atualizar_turnos
  BEFORE UPDATE ON turnos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_calendario();

-- Trigger para agendamentos
CREATE TRIGGER trigger_atualizar_agendamentos
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW
  EXECUTE FUNCTION atualizar_timestamp_calendario();

-- =====================================================
-- RLS (Row Level Security)
-- =====================================================

-- Habilitar RLS nas tabelas
ALTER TABLE turnos ENABLE ROW LEVEL SECURITY;
ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

-- Políticas para turnos
-- Todos podem visualizar turnos ativos
CREATE POLICY "Turnos ativos são visíveis para todos" ON turnos
  FOR SELECT
  USING (ativo = true);

-- Apenas admins podem criar/editar/deletar turnos
CREATE POLICY "Apenas admins podem gerenciar turnos" ON turnos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE colaboradores.id = auth.uid()
      AND colaboradores.tipo_colaborador IN ('admin', 'gestor_comercial')
    )
  );

-- Políticas para agendamentos
-- Todos podem visualizar agendamentos confirmados
CREATE POLICY "Agendamentos confirmados são visíveis para todos" ON agendamentos
  FOR SELECT
  USING (status IN ('confirmado', 'realizado'));

-- Usuários podem criar seus próprios agendamentos
CREATE POLICY "Usuários podem criar agendamentos" ON agendamentos
  FOR INSERT
  WITH CHECK (auth.uid() = criado_por);

-- Usuários podem atualizar/cancelar seus próprios agendamentos
CREATE POLICY "Usuários podem gerenciar seus agendamentos" ON agendamentos
  FOR UPDATE
  USING (auth.uid() = criado_por);

-- Admins podem gerenciar todos os agendamentos
CREATE POLICY "Admins podem gerenciar todos agendamentos" ON agendamentos
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE colaboradores.id = auth.uid()
      AND colaboradores.tipo_colaborador IN ('admin', 'gestor_comercial')
    )
  );

-- =====================================================
-- FUNÇÕES AUXILIARES
-- =====================================================

-- Função para verificar disponibilidade de vagas em um turno
CREATE OR REPLACE FUNCTION verificar_vagas_turno(
  p_turno_id UUID,
  p_data DATE,
  p_horario_inicio TIME,
  p_horario_fim TIME
)
RETURNS BOOLEAN AS $$
DECLARE
  v_vagas_total INTEGER;
  v_vagas_ocupadas INTEGER;
BEGIN
  -- Buscar total de vagas do turno
  SELECT vagas_total INTO v_vagas_total
  FROM turnos
  WHERE id = p_turno_id AND ativo = true;

  IF v_vagas_total IS NULL THEN
    RETURN false; -- Turno não encontrado ou inativo
  END IF;

  -- Contar agendamentos que se sobrepõem ao horário solicitado
  SELECT COUNT(*) INTO v_vagas_ocupadas
  FROM agendamentos
  WHERE turno_id = p_turno_id
    AND data = p_data
    AND status IN ('confirmado', 'realizado')
    AND (
      -- Verificar sobreposição de horários
      (horario_inicio < p_horario_fim AND horario_fim > p_horario_inicio)
    );

  -- Retornar true se há vagas disponíveis
  RETURN v_vagas_ocupadas < v_vagas_total;
END;
$$ LANGUAGE plpgsql;

-- Função para obter turnos disponíveis em uma data
CREATE OR REPLACE FUNCTION obter_turnos_disponiveis(p_data DATE)
RETURNS TABLE (
  turno_id UUID,
  hora_inicio TIME,
  hora_fim TIME,
  vagas_total INTEGER,
  vagas_ocupadas BIGINT,
  setores TEXT[],
  cor VARCHAR(7)
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    t.id AS turno_id,
    t.hora_inicio,
    t.hora_fim,
    t.vagas_total,
    COALESCE(COUNT(a.id), 0) AS vagas_ocupadas,
    t.setores,
    t.cor
  FROM turnos t
  LEFT JOIN agendamentos a ON a.turno_id = t.id
    AND a.data = p_data
    AND a.status IN ('confirmado', 'realizado')
  WHERE t.ativo = true
    AND (
      -- Verificar se o turno é válido para esta data
      t.tipo_recorrencia = 'todos'
      OR (t.tipo_recorrencia = 'uteis' AND EXTRACT(DOW FROM p_data) BETWEEN 1 AND 5)
      OR (
        t.tipo_recorrencia = 'custom'
        AND p_data BETWEEN t.data_inicio AND t.data_fim
        AND (t.dias_semana IS NULL OR EXTRACT(DOW FROM p_data)::INTEGER = ANY(t.dias_semana))
      )
    )
  GROUP BY t.id, t.hora_inicio, t.hora_fim, t.vagas_total, t.setores, t.cor
  ORDER BY t.hora_inicio;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- COMENTÁRIOS nas tabelas e colunas
-- =====================================================

COMMENT ON TABLE turnos IS 'Armazena os turnos disponíveis para agendamento no calendário';
COMMENT ON TABLE agendamentos IS 'Armazena os agendamentos realizados pelos usuários';

COMMENT ON COLUMN turnos.tipo_recorrencia IS 'Tipo de recorrência: todos (todos os dias), uteis (seg-sex), custom (datas específicas)';
COMMENT ON COLUMN turnos.dias_semana IS 'Array de dias da semana para recorrência custom (0=Domingo, 6=Sábado)';
COMMENT ON COLUMN agendamentos.status IS 'Status do agendamento: confirmado, cancelado, realizado, ausente';
COMMENT ON COLUMN agendamentos.duracao_horas IS 'Duração do agendamento em horas';
