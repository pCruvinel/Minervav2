-- =============================================================================
-- MIGRATION: Centro de Custo Phase 2.1 - Financial Views
-- Data: 2026-02-02
-- Objetivo: Criar Views de agregação financeira (Receita, Custo, Overhead, Lucro)
-- =============================================================================

-- 1. View Receitas (Contas a Receber)
CREATE OR REPLACE VIEW vw_receitas_por_cc AS
SELECT 
  cc_id,
  COUNT(*) as qtd_titulos,
  COALESCE(SUM(valor_previsto) FILTER (WHERE status != 'cancelado'), 0) as receita_prevista,
  COALESCE(SUM(valor_recebido) FILTER (WHERE status = 'pago' OR status = 'recebido'), 0) as receita_realizada
FROM public.contas_receber
WHERE cc_id IS NOT NULL
GROUP BY cc_id;

-- 2. View Custos Operacionais (Contas a Pagar - Inclui Impostos/Comissões gerados)
CREATE OR REPLACE VIEW vw_custos_operacionais_por_cc AS
SELECT 
  cc_id,
  COUNT(*) as qtd_lancamentos,
  -- Previsto: All active
  COALESCE(SUM(valor) FILTER (WHERE status != 'cancelado'), 0) as custo_previsto,
  -- Realizado: Paid
  COALESCE(SUM(valor) FILTER (WHERE status = 'pago'), 0) as custo_realizado
FROM public.contas_pagar
WHERE cc_id IS NOT NULL
GROUP BY cc_id;

-- 3. View Custos MO (Alocação de Horas)
CREATE OR REPLACE VIEW vw_custos_mo_por_cc AS
SELECT 
  cc_id,
  COALESCE(SUM(valor_calculado), 0) as custo_mo_total
FROM public.alocacao_horas_cc
GROUP BY cc_id;

-- 4. View Overhead (Rateio Mensal)
CREATE OR REPLACE VIEW vw_overhead_por_cc AS
SELECT 
  cc_id,
  COALESCE(SUM(valor_total_alocado), 0) as custo_overhead_total
FROM public.custos_overhead_mensal
GROUP BY cc_id;

-- 5. View Lucratividade Consolidada
CREATE OR REPLACE VIEW vw_lucratividade_cc AS
SELECT 
  cc.id as cc_id,
  cc.nome,
  cc.valor_global as contrato_global,
  
  -- Receitas
  COALESCE(r.receita_prevista, 0) as receita_prevista,
  COALESCE(r.receita_realizada, 0) as receita_realizada,
  
  -- Custos
  COALESCE(cp.custo_previsto, 0) as custo_op_previsto,
  COALESCE(cp.custo_realizado, 0) as custo_op_realizado,
  
  COALESCE(mo.custo_mo_total, 0) as custo_mo_total,
  
  COALESCE(ov.custo_overhead_total, 0) as custo_overhead_total,
  
  -- Totais
  (COALESCE(cp.custo_previsto, 0) + COALESCE(mo.custo_mo_total, 0) + COALESCE(ov.custo_overhead_total, 0)) as custo_total_previsto,
  
  (COALESCE(cp.custo_realizado, 0) + COALESCE(mo.custo_mo_total, 0) + COALESCE(ov.custo_overhead_total, 0)) as custo_total_realizado,
  
  -- Lucro (Previsto vs Realizado)
  (COALESCE(r.receita_prevista, 0) - (COALESCE(cp.custo_previsto, 0) + COALESCE(mo.custo_mo_total, 0) + COALESCE(ov.custo_overhead_total, 0))) as lucro_previsto,
  
  (COALESCE(r.receita_realizada, 0) - (COALESCE(cp.custo_realizado, 0) + COALESCE(mo.custo_mo_total, 0) + COALESCE(ov.custo_overhead_total, 0))) as lucro_realizado,
  
  -- Margem % (Realizada)
  CASE 
    WHEN COALESCE(r.receita_realizada, 0) > 0 THEN 
      ROUND((
        (COALESCE(r.receita_realizada, 0) - (COALESCE(cp.custo_realizado, 0) + COALESCE(mo.custo_mo_total, 0) + COALESCE(ov.custo_overhead_total, 0))) 
        / COALESCE(r.receita_realizada, 0)
      ) * 100, 2)
    ELSE 0 
  END as margem_realizada_pct

FROM public.centros_custo cc
LEFT JOIN vw_receitas_por_cc r ON r.cc_id = cc.id
LEFT JOIN vw_custos_operacionais_por_cc cp ON cp.cc_id = cc.id
LEFT JOIN vw_custos_mo_por_cc mo ON mo.cc_id = cc.id
LEFT JOIN vw_overhead_por_cc ov ON ov.cc_id = cc.id;
