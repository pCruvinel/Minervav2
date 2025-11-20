-- ==========================================
-- MIGRATION: Criar Views de Dashboard
-- Data: 2025-11-19
-- Prioridade: 🟢 BAIXA
-- Descrição: Criar views otimizadas para dashboards e relatórios
-- ==========================================

BEGIN;

-- ==========================================
-- 1. View: Resumo de OS por Status
-- ==========================================
CREATE OR REPLACE VIEW v_os_por_status AS
SELECT
  status_geral,
  COUNT(*) AS total,
  COUNT(*) FILTER (WHERE data_prazo < NOW()) AS atrasadas,
  COUNT(*) FILTER (WHERE data_prazo BETWEEN NOW() AND NOW() + INTERVAL '7 days') AS urgentes,
  COUNT(*) FILTER (WHERE data_prazo BETWEEN NOW() + INTERVAL '7 days' AND NOW() + INTERVAL '30 days') AS proximas,
  SUM(valor_contrato) FILTER (WHERE valor_contrato IS NOT NULL) AS valor_total_contratos,
  SUM(valor_proposta) FILTER (WHERE valor_proposta IS NOT NULL) AS valor_total_propostas
FROM ordens_servico
WHERE status_geral NOT IN ('CONCLUIDA', 'CANCELADA')
GROUP BY status_geral
ORDER BY
  CASE status_geral
    WHEN 'ATRASADA' THEN 1
    WHEN 'EM_VALIDACAO' THEN 2
    WHEN 'EM_ANDAMENTO' THEN 3
    WHEN 'AGUARDANDO_INFORMACOES' THEN 4
    WHEN 'EM_TRIAGEM' THEN 5
    ELSE 6
  END;

COMMENT ON VIEW v_os_por_status IS 'Resumo de OS ativas agrupadas por status com métricas de prazo e valores';

-- ==========================================
-- 2. View: Performance de Colaboradores
-- ==========================================
CREATE OR REPLACE VIEW v_performance_colaboradores AS
SELECT
  c.id,
  c.nome_completo,
  c.role_nivel,
  c.setor,
  c.ativo,

  -- OS como responsável
  COUNT(DISTINCT os.id) AS total_os_responsavel,
  COUNT(DISTINCT os.id) FILTER (WHERE os.status_geral = 'CONCLUIDA') AS os_concluidas,
  COUNT(DISTINCT os.id) FILTER (WHERE os.status_geral = 'ATRASADA') AS os_atrasadas,

  -- Delegações recebidas
  COUNT(DISTINCT d.id) AS total_delegacoes_recebidas,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status_delegacao = 'CONCLUIDA') AS delegacoes_concluidas,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status_delegacao = 'PENDENTE') AS delegacoes_pendentes,
  COUNT(DISTINCT d.id) FILTER (WHERE d.status_delegacao = 'EM_PROGRESSO') AS delegacoes_em_progresso,

  -- Taxa de conclusão
  ROUND(
    COUNT(DISTINCT d.id) FILTER (WHERE d.status_delegacao = 'CONCLUIDA')::NUMERIC /
    NULLIF(COUNT(DISTINCT d.id), 0) * 100,
    2
  ) AS taxa_conclusao_delegacoes_percent,

  -- Última avaliação
  (
    SELECT avaliacao
    FROM colaborador_performance cp
    WHERE cp.colaborador_id = c.id
    ORDER BY data_avaliacao DESC
    LIMIT 1
  ) AS ultima_avaliacao

FROM colaboradores c
LEFT JOIN ordens_servico os ON os.responsavel_id = c.id
LEFT JOIN delegacoes d ON d.delegado_id = c.id
WHERE c.ativo = true
  AND c.role_nivel != 'MOBRA'
GROUP BY c.id, c.nome_completo, c.role_nivel, c.setor, c.ativo
ORDER BY c.role_nivel, c.nome_completo;

COMMENT ON VIEW v_performance_colaboradores IS 'Métricas de performance e produtividade dos colaboradores';

-- ==========================================
-- 3. View: OS Completa (dados consolidados)
-- ==========================================
CREATE OR REPLACE VIEW v_os_completa AS
SELECT
  -- Dados principais da OS
  os.id,
  os.codigo_os,
  os.status_geral,
  os.data_entrada,
  os.data_prazo,
  os.data_conclusao,
  os.valor_proposta,
  os.valor_contrato,
  os.descricao,

  -- Cliente
  cli.id AS cliente_id,
  cli.nome_razao_social AS cliente_nome,
  cli.status AS cliente_status,
  cli.cpf_cnpj AS cliente_cpf_cnpj,
  cli.telefone AS cliente_telefone,
  cli.email AS cliente_email,

  -- Tipo OS
  t.id AS tipo_os_id,
  t.codigo AS tipo_codigo,
  t.nome AS tipo_nome,
  t.setor_padrao AS setor,
  t.categoria AS tipo_categoria,

  -- Responsável
  resp.id AS responsavel_id,
  resp.nome_completo AS responsavel_nome,
  resp.role_nivel AS responsavel_role,
  resp.setor AS responsavel_setor,

  -- Criador
  cria.id AS criado_por_id,
  cria.nome_completo AS criado_por_nome,

  -- Centro de Custo
  cc.id AS cc_id,
  cc.nome AS cc_nome,
  cc.tipo AS cc_tipo,

  -- Métricas calculadas
  (
    SELECT COUNT(*)
    FROM os_etapas e
    WHERE e.os_id = os.id
  ) AS total_etapas,

  (
    SELECT COUNT(*)
    FROM os_etapas e
    WHERE e.os_id = os.id
    AND e.status = 'APROVADA'
  ) AS etapas_aprovadas,

  (
    SELECT COUNT(*)
    FROM os_etapas e
    WHERE e.os_id = os.id
    AND e.status IN ('PENDENTE', 'EM_ANDAMENTO')
  ) AS etapas_pendentes,

  (
    SELECT COUNT(*)
    FROM os_anexos a
    WHERE a.os_id = os.id
  ) AS total_anexos,

  (
    SELECT COUNT(*)
    FROM delegacoes d
    WHERE d.os_id = os.id
  ) AS total_delegacoes,

  (
    SELECT COUNT(*)
    FROM delegacoes d
    WHERE d.os_id = os.id
    AND d.status_delegacao IN ('PENDENTE', 'EM_PROGRESSO')
  ) AS delegacoes_pendentes,

  -- Status calculado
  CASE
    WHEN os.data_prazo < NOW() AND os.status_geral NOT IN ('CONCLUIDA', 'CANCELADA') THEN true
    ELSE false
  END AS esta_atrasada,

  CASE
    WHEN os.data_prazo BETWEEN NOW() AND NOW() + INTERVAL '7 days' THEN true
    ELSE false
  END AS esta_urgente

FROM ordens_servico os
INNER JOIN clientes cli ON cli.id = os.cliente_id
INNER JOIN tipos_os t ON t.id = os.tipo_os_id
LEFT JOIN colaboradores resp ON resp.id = os.responsavel_id
LEFT JOIN colaboradores cria ON cria.id = os.criado_por_id
LEFT JOIN centros_custo cc ON cc.id = os.cc_id;

COMMENT ON VIEW v_os_completa IS 'View com dados completos de OS incluindo relacionamentos e métricas calculadas';

-- ==========================================
-- 4. View: Resumo Financeiro Mensal
-- ==========================================
CREATE OR REPLACE VIEW v_resumo_financeiro_mensal AS
SELECT
  DATE_TRUNC('month', data_vencimento)::DATE AS mes,
  tipo,

  -- Contagens
  COUNT(*) AS total_lancamentos,
  COUNT(*) FILTER (WHERE conciliado = true) AS total_conciliados,
  COUNT(*) FILTER (WHERE conciliado = false) AS total_pendentes,
  COUNT(*) FILTER (WHERE data_pagamento IS NULL AND data_vencimento < CURRENT_DATE) AS total_atrasados,

  -- Valores
  SUM(valor) AS valor_total,
  SUM(valor) FILTER (WHERE conciliado = true) AS valor_conciliado,
  SUM(valor) FILTER (WHERE conciliado = false) AS valor_pendente,
  SUM(valor) FILTER (WHERE data_pagamento IS NULL AND data_vencimento < CURRENT_DATE) AS valor_atrasado,

  -- Médias
  ROUND(AVG(valor), 2) AS valor_medio,

  -- Por CC
  COUNT(DISTINCT cc_id) FILTER (WHERE cc_id IS NOT NULL) AS total_ccs_vinculados

FROM financeiro_lancamentos
GROUP BY DATE_TRUNC('month', data_vencimento)::DATE, tipo
ORDER BY mes DESC, tipo;

COMMENT ON VIEW v_resumo_financeiro_mensal IS 'Resumo financeiro agrupado por mês e tipo (RECEITA/DESPESA)';

-- ==========================================
-- 5. View: Calendário de Agendamentos (próximos 30 dias)
-- ==========================================
CREATE OR REPLACE VIEW v_calendario_proximo_mes AS
SELECT
  data_serie AS data,
  t.id AS turno_id,
  t.hora_inicio,
  t.hora_fim,
  t.vagas_total,
  t.setores AS setores_permitidos,
  t.cor,

  -- Agendamentos nesta data/turno
  COUNT(a.id) FILTER (WHERE a.status = 'confirmado') AS vagas_ocupadas,
  t.vagas_total - COUNT(a.id) FILTER (WHERE a.status = 'confirmado') AS vagas_disponiveis,

  -- Lista de categorias agendadas
  array_agg(DISTINCT a.categoria) FILTER (WHERE a.status = 'confirmado' AND a.categoria IS NOT NULL) AS categorias_agendadas,

  -- Há OS vinculadas?
  COUNT(DISTINCT a.os_id) FILTER (WHERE a.os_id IS NOT NULL) AS total_os_vinculadas

FROM (
  SELECT generate_series(
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    INTERVAL '1 day'
  )::DATE AS data_serie
) datas
CROSS JOIN turnos t
LEFT JOIN agendamentos a ON
  a.turno_id = t.id AND
  a.data = datas.data_serie AND
  a.status IN ('confirmado', 'realizado')
WHERE t.ativo = true
  AND (
    -- Verificar recorrência
    t.tipo_recorrencia = 'todos'
    OR (t.tipo_recorrencia = 'uteis' AND EXTRACT(DOW FROM datas.data_serie) BETWEEN 1 AND 5)
    OR (
      t.tipo_recorrencia = 'custom'
      AND datas.data_serie BETWEEN t.data_inicio AND COALESCE(t.data_fim, '2099-12-31')
      AND (t.dias_semana IS NULL OR EXTRACT(DOW FROM datas.data_serie)::INTEGER = ANY(t.dias_semana))
    )
  )
GROUP BY datas.data_serie, t.id, t.hora_inicio, t.hora_fim, t.vagas_total, t.setores, t.cor
ORDER BY data_serie, t.hora_inicio;

COMMENT ON VIEW v_calendario_proximo_mes IS 'Calendário com disponibilidade de turnos e agendamentos para os próximos 30 dias';

-- ==========================================
-- 6. View: Dashboard Diretoria (visão executiva)
-- ==========================================
CREATE OR REPLACE VIEW v_dashboard_diretoria AS
SELECT
  -- Total de OS
  (SELECT COUNT(*) FROM ordens_servico) AS total_os_geral,
  (SELECT COUNT(*) FROM ordens_servico WHERE status_geral NOT IN ('CONCLUIDA', 'CANCELADA')) AS total_os_ativas,
  (SELECT COUNT(*) FROM ordens_servico WHERE status_geral = 'CONCLUIDA') AS total_os_concluidas,
  (SELECT COUNT(*) FROM ordens_servico WHERE status_geral = 'ATRASADA') AS total_os_atrasadas,

  -- Valores
  (SELECT SUM(valor_contrato) FROM ordens_servico WHERE valor_contrato IS NOT NULL) AS valor_total_contratos,
  (SELECT SUM(valor_proposta) FROM ordens_servico WHERE status_geral IN ('EM_TRIAGEM', 'AGUARDANDO_INFORMACOES')) AS valor_total_propostas_pendentes,

  -- Clientes
  (SELECT COUNT(*) FROM clientes WHERE status = 'ATIVO') AS total_clientes_ativos,
  (SELECT COUNT(*) FROM clientes WHERE status = 'LEAD') AS total_leads,

  -- Colaboradores
  (SELECT COUNT(*) FROM colaboradores WHERE ativo = true) AS total_colaboradores_ativos,
  (SELECT COUNT(*) FROM colaboradores WHERE ativo = true AND role_nivel LIKE 'GESTOR_%') AS total_gestores,

  -- Delegações
  (SELECT COUNT(*) FROM delegacoes WHERE status_delegacao = 'PENDENTE') AS total_delegacoes_pendentes,
  (SELECT COUNT(*) FROM delegacoes WHERE status_delegacao = 'CONCLUIDA') AS total_delegacoes_concluidas,

  -- Financeiro
  (SELECT SUM(valor) FROM financeiro_lancamentos WHERE tipo = 'RECEITA') AS total_receitas,
  (SELECT SUM(valor) FROM financeiro_lancamentos WHERE tipo = 'DESPESA') AS total_despesas,
  (SELECT SUM(valor) FROM financeiro_lancamentos WHERE tipo = 'RECEITA') -
  (SELECT SUM(valor) FROM financeiro_lancamentos WHERE tipo = 'DESPESA') AS saldo,

  -- Agendamentos
  (SELECT COUNT(*) FROM agendamentos WHERE data >= CURRENT_DATE AND status = 'confirmado') AS agendamentos_futuros;

COMMENT ON VIEW v_dashboard_diretoria IS 'Visão executiva com KPIs principais do sistema';

-- ==========================================
-- 7. View: Histórico de Atividades (últimas 50)
-- ==========================================
CREATE OR REPLACE VIEW v_atividades_recentes AS
SELECT
  al.created_at,
  al.acao,
  al.tabela_afetada,
  al.registro_id_afetado,
  c.nome_completo AS usuario_nome,
  c.role_nivel AS usuario_role,
  al.dados_novos,
  al.dados_antigos
FROM audit_log al
LEFT JOIN colaboradores c ON c.id = al.usuario_id
ORDER BY al.created_at DESC
LIMIT 50;

COMMENT ON VIEW v_atividades_recentes IS 'Últimas 50 atividades registradas no sistema';

-- ==========================================
-- 8. View: Etapas Pendentes de Aprovação
-- ==========================================
CREATE OR REPLACE VIEW v_etapas_pendentes_aprovacao AS
SELECT
  e.id AS etapa_id,
  e.nome_etapa,
  e.status AS etapa_status,
  e.ordem,
  e.data_inicio,

  -- OS relacionada
  os.id AS os_id,
  os.codigo_os,
  os.status_geral AS os_status,

  -- Cliente
  cli.nome_razao_social AS cliente_nome,

  -- Tipo
  t.nome AS tipo_os_nome,
  t.setor_padrao AS setor,

  -- Responsável pela etapa
  resp.nome_completo AS responsavel_nome,
  resp.role_nivel AS responsavel_role

FROM os_etapas e
INNER JOIN ordens_servico os ON os.id = e.os_id
INNER JOIN clientes cli ON cli.id = os.cliente_id
INNER JOIN tipos_os t ON t.id = os.tipo_os_id
LEFT JOIN colaboradores resp ON resp.id = e.responsavel_id
WHERE e.status = 'AGUARDANDO_APROVACAO'
  AND os.status_geral NOT IN ('CONCLUIDA', 'CANCELADA')
ORDER BY e.data_inicio ASC NULLS LAST, os.data_entrada DESC;

COMMENT ON VIEW v_etapas_pendentes_aprovacao IS 'Etapas aguardando aprovação de gestores';

COMMIT;

-- ==========================================
-- Verificação Pós-Migration
-- ==========================================

-- Listar todas as views criadas
SELECT
  table_name,
  view_definition
FROM information_schema.views
WHERE table_schema = 'public'
  AND table_name LIKE 'v_%'
ORDER BY table_name;

-- Testar performance das views (executar após dados de produção)
-- EXPLAIN ANALYZE SELECT * FROM v_os_completa LIMIT 10;
-- EXPLAIN ANALYZE SELECT * FROM v_performance_colaboradores;

-- ==========================================
-- Grant de permissões para views
-- ==========================================

GRANT SELECT ON v_os_por_status TO authenticated;
GRANT SELECT ON v_performance_colaboradores TO authenticated;
GRANT SELECT ON v_os_completa TO authenticated;
GRANT SELECT ON v_resumo_financeiro_mensal TO authenticated;
GRANT SELECT ON v_calendario_proximo_mes TO authenticated;
GRANT SELECT ON v_dashboard_diretoria TO authenticated;
GRANT SELECT ON v_atividades_recentes TO authenticated;
GRANT SELECT ON v_etapas_pendentes_aprovacao TO authenticated;

-- ==========================================
-- IMPORTANTE:
-- - Views não têm RLS automaticamente
-- - RLS das tabelas base ainda se aplica
-- - Views podem ser usadas para simplificar queries complexas
-- - Considerar materializar views muito pesadas (MATERIALIZED VIEW)
-- ==========================================
