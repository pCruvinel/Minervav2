-- =====================================================
-- MIGRATION: Fix Calendario RPC Security
-- Data: 2025-11-21
-- Descrição: Adicionar SECURITY DEFINER às funções RPC do calendário
--
-- CONTEXTO:
-- Esta migração documenta a correção aplicada no commit 11f6392.
-- As funções RPC estavam causando erro 500 porque usavam SECURITY INVOKER (padrão),
-- herdando as restrições de RLS do usuário que as chamava.
--
-- SOLUÇÃO:
-- Adicionar SECURITY DEFINER para que as funções executem com permissões do owner,
-- fazendo bypass das políticas RLS e retornando dados públicos corretamente.
-- =====================================================

-- =====================================================
-- FUNÇÃO: obter_turnos_disponiveis
-- Descrição: Retorna turnos disponíveis para uma data específica
-- =====================================================

CREATE OR REPLACE FUNCTION obter_turnos_disponiveis(p_data DATE)
RETURNS TABLE (
  turno_id UUID,
  hora_inicio TIME,
  hora_fim TIME,
  vagas_total INTEGER,
  vagas_ocupadas BIGINT,
  setores TEXT[],
  cor VARCHAR(7)
)
LANGUAGE plpgsql
SECURITY DEFINER  -- Executa com permissões do owner (bypass RLS)
SET search_path = public  -- Previne ataques de search_path
AS $$
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
      -- Turno válido todos os dias
      t.tipo_recorrencia = 'todos'
      OR
      -- Turno válido apenas em dias úteis (segunda a sexta)
      (t.tipo_recorrencia = 'uteis' AND EXTRACT(DOW FROM p_data) BETWEEN 1 AND 5)
      OR
      -- Turno com recorrência customizada
      (
        t.tipo_recorrencia = 'custom'
        AND p_data BETWEEN t.data_inicio AND t.data_fim
        AND (
          t.dias_semana IS NULL
          OR EXTRACT(DOW FROM p_data)::INTEGER = ANY(t.dias_semana)
        )
      )
    )
  GROUP BY t.id, t.hora_inicio, t.hora_fim, t.vagas_total, t.setores, t.cor
  ORDER BY t.hora_inicio;
END;
$$;

-- =====================================================
-- FUNÇÃO: verificar_vagas_turno
-- Descrição: Verifica se há vagas disponíveis em um turno
-- =====================================================

CREATE OR REPLACE FUNCTION verificar_vagas_turno(
  p_turno_id UUID,
  p_data DATE,
  p_horario_inicio TIME,
  p_horario_fim TIME
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER  -- Executa com permissões do owner (bypass RLS)
SET search_path = public  -- Previne ataques de search_path
AS $$
DECLARE
  v_vagas_total INTEGER;
  v_vagas_ocupadas INTEGER;
BEGIN
  -- Buscar total de vagas do turno
  SELECT vagas_total INTO v_vagas_total
  FROM turnos
  WHERE id = p_turno_id AND ativo = true;

  -- Se turno não existe ou está inativo, retornar false
  IF v_vagas_total IS NULL THEN
    RETURN false;
  END IF;

  -- Contar vagas já ocupadas no horário solicitado
  -- Considera overlap de horários: novo horário conflita se:
  -- - Começa antes do fim de um agendamento existente, E
  -- - Termina depois do início de um agendamento existente
  SELECT COUNT(*) INTO v_vagas_ocupadas
  FROM agendamentos
  WHERE turno_id = p_turno_id
    AND data = p_data
    AND status IN ('confirmado', 'realizado')
    AND (
      -- Verifica overlap de horários
      horario_inicio < p_horario_fim
      AND horario_fim > p_horario_inicio
    );

  -- Retorna true se ainda há vagas disponíveis
  RETURN v_vagas_ocupadas < v_vagas_total;
END;
$$;

-- =====================================================
-- PERMISSÕES
-- Conceder permissões de execução para usuários autenticados e anônimos
-- =====================================================

GRANT EXECUTE ON FUNCTION obter_turnos_disponiveis(DATE) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION verificar_vagas_turno(UUID, DATE, TIME, TIME) TO authenticated, anon;

-- =====================================================
-- COMENTÁRIOS (Documentação)
-- =====================================================

COMMENT ON FUNCTION obter_turnos_disponiveis IS
  'Retorna turnos disponíveis para uma data com bypass de RLS usando SECURITY DEFINER. ' ||
  'Calcula vagas ocupadas baseado em agendamentos confirmados/realizados. ' ||
  'Usa lógica de recorrência para filtrar turnos válidos na data.';

COMMENT ON FUNCTION verificar_vagas_turno IS
  'Verifica disponibilidade de vagas em um turno com bypass de RLS usando SECURITY DEFINER. ' ||
  'Considera overlap de horários ao contar vagas ocupadas. ' ||
  'Retorna false se turno não existe ou está inativo.';

-- =====================================================
-- VALIDAÇÃO (Opcional - descomentar para testar)
-- =====================================================

-- SELECT * FROM obter_turnos_disponiveis('2025-11-23'::DATE);
-- SELECT verificar_vagas_turno('uuid-do-turno'::UUID, '2025-11-23'::DATE, '08:00'::TIME, '10:00'::TIME);
