-- =====================================================
-- Migration: Funções RPC do Sistema de Calendário
-- Descrição: Cria funções para consultar disponibilidade de turnos
-- Data: 2025-11-22
-- =====================================================

-- =====================================================
-- 1. FUNÇÃO: obter_turnos_disponiveis
-- =====================================================
-- Retorna turnos disponíveis para uma data específica
-- com informações de vagas ocupadas

CREATE OR REPLACE FUNCTION public.obter_turnos_disponiveis(
  p_data DATE
)
RETURNS TABLE (
  turno_id UUID,
  hora_inicio TIME,
  hora_fim TIME,
  vagas_total INTEGER,
  vagas_ocupadas BIGINT,
  setores JSONB,
  cor VARCHAR
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_dia_semana INTEGER;
BEGIN
  -- Calcular dia da semana (0=Domingo, 1=Segunda, ..., 6=Sábado)
  v_dia_semana := EXTRACT(DOW FROM p_data);

  RETURN QUERY
  SELECT
    t.id AS turno_id,
    t.hora_inicio,
    t.hora_fim,
    t.vagas_total,
    COUNT(a.id)::BIGINT AS vagas_ocupadas,
    t.setores,
    t.cor
  FROM public.turnos t
  LEFT JOIN public.agendamentos a
    ON a.turno_id = t.id
    AND a.data = p_data
    AND a.status IN ('confirmado', 'realizado')
  WHERE t.ativo = true
    -- Verificar se o turno é válido para esta data
    AND (
      -- Turno sem data de início/fim OU dentro do período
      (t.data_inicio IS NULL OR p_data >= t.data_inicio)
      AND (t.data_fim IS NULL OR p_data <= t.data_fim)
    )
    AND (
      -- Tipo de recorrência
      t.tipo_recorrencia = 'todos'
      OR (t.tipo_recorrencia = 'uteis' AND v_dia_semana BETWEEN 1 AND 5)
      OR (t.tipo_recorrencia = 'custom' AND v_dia_semana = ANY(t.dias_semana))
    )
  GROUP BY t.id, t.hora_inicio, t.hora_fim, t.vagas_total, t.setores, t.cor
  ORDER BY t.hora_inicio;
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.obter_turnos_disponiveis(DATE) IS
'Retorna turnos disponíveis para uma data com contagem de vagas ocupadas';

-- =====================================================
-- 2. FUNÇÃO: verificar_vagas_turno
-- =====================================================
-- Verifica se há vagas disponíveis em um turno específico

CREATE OR REPLACE FUNCTION public.verificar_vagas_turno(
  p_turno_id UUID,
  p_data DATE,
  p_horario_inicio TIME DEFAULT NULL,
  p_horario_fim TIME DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_vagas_total INTEGER;
  v_vagas_ocupadas BIGINT;
  v_disponivel BOOLEAN;
BEGIN
  -- Buscar total de vagas do turno
  SELECT vagas_total
  INTO v_vagas_total
  FROM public.turnos
  WHERE id = p_turno_id AND ativo = true;

  -- Se turno não existe ou está inativo, retorna false
  IF v_vagas_total IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Contar agendamentos confirmados neste turno/data
  SELECT COUNT(*)
  INTO v_vagas_ocupadas
  FROM public.agendamentos
  WHERE turno_id = p_turno_id
    AND data = p_data
    AND status IN ('confirmado', 'realizado')
    -- Se horário específico foi fornecido, verificar conflito
    AND (
      p_horario_inicio IS NULL
      OR (
        -- Verifica sobreposição de horários
        NOT (
          p_horario_fim <= horario_inicio
          OR p_horario_inicio >= horario_fim
        )
      )
    );

  -- Há vagas disponíveis se ocupadas < total
  v_disponivel := v_vagas_ocupadas < v_vagas_total;

  RETURN v_disponivel;
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.verificar_vagas_turno(UUID, DATE, TIME, TIME) IS
'Verifica disponibilidade de vagas em um turno, considerando conflitos de horário';

-- =====================================================
-- 3. FUNÇÃO: obter_estatisticas_turno
-- =====================================================
-- Retorna estatísticas de um turno em um período

CREATE OR REPLACE FUNCTION public.obter_estatisticas_turno(
  p_turno_id UUID,
  p_data_inicio DATE,
  p_data_fim DATE
)
RETURNS TABLE (
  total_agendamentos BIGINT,
  agendamentos_confirmados BIGINT,
  agendamentos_realizados BIGINT,
  agendamentos_cancelados BIGINT,
  agendamentos_ausentes BIGINT,
  taxa_ocupacao NUMERIC
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  WITH stats AS (
    SELECT
      COUNT(*) FILTER (WHERE status = 'confirmado') AS confirmados,
      COUNT(*) FILTER (WHERE status = 'realizado') AS realizados,
      COUNT(*) FILTER (WHERE status = 'cancelado') AS cancelados,
      COUNT(*) FILTER (WHERE status = 'ausente') AS ausentes,
      COUNT(*) AS total
    FROM public.agendamentos
    WHERE turno_id = p_turno_id
      AND data BETWEEN p_data_inicio AND p_data_fim
  ),
  turno_info AS (
    SELECT vagas_total
    FROM public.turnos
    WHERE id = p_turno_id
  ),
  dias_periodo AS (
    SELECT COUNT(DISTINCT data) AS dias
    FROM public.agendamentos
    WHERE turno_id = p_turno_id
      AND data BETWEEN p_data_inicio AND p_data_fim
      AND status IN ('confirmado', 'realizado')
  )
  SELECT
    s.total::BIGINT AS total_agendamentos,
    s.confirmados::BIGINT AS agendamentos_confirmados,
    s.realizados::BIGINT AS agendamentos_realizados,
    s.cancelados::BIGINT AS agendamentos_cancelados,
    s.ausentes::BIGINT AS agendamentos_ausentes,
    CASE
      WHEN t.vagas_total > 0 AND d.dias > 0 THEN
        ROUND(
          (s.confirmados + s.realizados)::NUMERIC / (t.vagas_total * d.dias) * 100,
          2
        )
      ELSE 0
    END AS taxa_ocupacao
  FROM stats s
  CROSS JOIN turno_info t
  CROSS JOIN dias_periodo d;
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.obter_estatisticas_turno(UUID, DATE, DATE) IS
'Retorna estatísticas de uso de um turno em um período (taxa de ocupação, cancelamentos, etc)';

-- =====================================================
-- 4. PERMISSÕES
-- =====================================================

-- Permitir que usuários autenticados executem as funções
GRANT EXECUTE ON FUNCTION public.obter_turnos_disponiveis(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_vagas_turno(UUID, DATE, TIME, TIME) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obter_estatisticas_turno(UUID, DATE, DATE) TO authenticated;
