-- =====================================================
-- Migration: Recriar Funções RPC do Sistema de Calendário
-- Descrição: Recria funções após dropar/recriar tabelas
-- Data: 2025-11-22
-- =====================================================

-- =====================================================
-- 1. FUNÇÃO: obter_turnos_disponiveis
-- =====================================================

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
    AND (
      (t.data_inicio IS NULL OR p_data >= t.data_inicio)
      AND (t.data_fim IS NULL OR p_data <= t.data_fim)
    )
    AND (
      t.tipo_recorrencia = 'todos'
      OR (t.tipo_recorrencia = 'uteis' AND v_dia_semana BETWEEN 1 AND 5)
      OR (t.tipo_recorrencia = 'custom' AND v_dia_semana = ANY(t.dias_semana))
    )
  GROUP BY t.id, t.hora_inicio, t.hora_fim, t.vagas_total, t.setores, t.cor
  ORDER BY t.hora_inicio;
END;
$$;

-- =====================================================
-- 2. FUNÇÃO: verificar_vagas_turno
-- =====================================================

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
  SELECT vagas_total
  INTO v_vagas_total
  FROM public.turnos
  WHERE id = p_turno_id AND ativo = true;

  IF v_vagas_total IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT COUNT(*)
  INTO v_vagas_ocupadas
  FROM public.agendamentos
  WHERE turno_id = p_turno_id
    AND data = p_data
    AND status IN ('confirmado', 'realizado')
    AND (
      p_horario_inicio IS NULL
      OR (
        NOT (
          p_horario_fim <= horario_inicio
          OR p_horario_inicio >= horario_fim
        )
      )
    );

  v_disponivel := v_vagas_ocupadas < v_vagas_total;

  RETURN v_disponivel;
END;
$$;

-- =====================================================
-- 3. FUNÇÃO: obter_estatisticas_turno
-- =====================================================

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

-- =====================================================
-- 4. PERMISSÕES
-- =====================================================

GRANT EXECUTE ON FUNCTION public.obter_turnos_disponiveis(DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verificar_vagas_turno(UUID, DATE, TIME, TIME) TO authenticated;
GRANT EXECUTE ON FUNCTION public.obter_estatisticas_turno(UUID, DATE, DATE) TO authenticated;

-- Comentários
COMMENT ON FUNCTION public.obter_turnos_disponiveis(DATE) IS 'Retorna turnos disponíveis para uma data com contagem de vagas ocupadas';
COMMENT ON FUNCTION public.verificar_vagas_turno(UUID, DATE, TIME, TIME) IS 'Verifica disponibilidade de vagas em um turno, considerando conflitos de horário';
COMMENT ON FUNCTION public.obter_estatisticas_turno(UUID, DATE, DATE) IS 'Retorna estatísticas de uso de um turno em um período';
