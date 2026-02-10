-- =============================================================================
-- MIGRATION: Centro de Custo Phase 2 - Logic & Automation
-- Data: 2026-02-02
-- Objetivo: Implementar automação de Impostos/Comissões e Overhead
-- =============================================================================

-- 1. Seed Pricing Config for OS-13 (Construction) and others if missing
-- Note: Using default values as per CC.md
INSERT INTO public.precificacao_config (tipo_os_codigo, campo_nome, valor_padrao, campo_editavel, ativo)
VALUES 
  ('OS-13', 'percentual_imposto', 17.00, false, true),
  ('OS-13', 'percentual_comissao', 1.50, true, true),
  ('OS-11', 'percentual_imposto', 17.00, false, true),
  ('OS-11', 'percentual_comissao', 1.50, true, true),
  ('OS-12', 'percentual_imposto', 17.00, false, true),
  ('OS-12', 'percentual_comissao', 1.50, true, true)
ON CONFLICT (tipo_os_codigo, campo_nome) DO NOTHING;

-- 2. Function to Generate Initial Costs (Taxes + Commission)
CREATE OR REPLACE FUNCTION gerar_custos_iniciais_cc()
RETURNS TRIGGER AS $$
DECLARE
  v_tipo_os_codigo text;
  v_pct_imposto numeric := 0;
  v_pct_comissao numeric := 0;
  v_cat_imposto_id uuid;
  v_cat_comissao_id uuid;
  v_valor_imposto numeric;
  v_valor_comissao numeric;
BEGIN
  -- Only proceed if we have a contract value
  IF NEW.valor_global IS NULL OR NEW.valor_global <= 0 THEN
    RETURN NEW;
  END IF;

  -- Get OS Type Code (e.g., 'OS-13')
  SELECT codigo INTO v_tipo_os_codigo
  FROM public.tipos_os
  WHERE id = NEW.tipo_os_id;

  -- Get Pricing Configs for this Type
  -- Imposto
  SELECT valor_padrao INTO v_pct_imposto
  FROM public.precificacao_config
  WHERE tipo_os_codigo = v_tipo_os_codigo 
  AND campo_nome = 'percentual_imposto'
  AND ativo = true;

  -- Comissao
  SELECT valor_padrao INTO v_pct_comissao
  FROM public.precificacao_config
  WHERE tipo_os_codigo = v_tipo_os_codigo 
  AND campo_nome = 'percentual_comissao'
  AND ativo = true;

  -- Defaulting if not found (Safety net)
  v_pct_imposto := COALESCE(v_pct_imposto, 0);
  v_pct_comissao := COALESCE(v_pct_comissao, 0);

  -- Get Categories IDs
  SELECT id INTO v_cat_imposto_id FROM public.categorias_financeiras WHERE codigo = 'CAT-IMPOSTO';
  SELECT id INTO v_cat_comissao_id FROM public.categorias_financeiras WHERE codigo = 'CAT-COMISSAO';

  -- Calculate Values
  v_valor_imposto := ROUND((NEW.valor_global * v_pct_imposto) / 100, 2);
  v_valor_comissao := ROUND((NEW.valor_global * v_pct_comissao) / 100, 2);

  -- Insert Imposto (if > 0)
  IF v_valor_imposto > 0 AND v_cat_imposto_id IS NOT NULL THEN
    INSERT INTO public.contas_pagar (
      descricao, valor, vencimento, status, tipo, 
      cc_id, categoria_id, origem, favorecido_fornecedor
    ) VALUES (
      'Provisão de Impostos (NF) - ' || v_pct_imposto || '%',
      v_valor_imposto,
      (NEW.data_inicio + interval '30 days')::date,
      'em_aberto',
      'variavel', -- ENUM: fixa/variavel
      NEW.id,
      v_cat_imposto_id,
      'sistema',
      'Governo / Receita Federal'
    );
  END IF;

  -- Insert Comissao (if > 0)
  IF v_valor_comissao > 0 AND v_cat_comissao_id IS NOT NULL THEN
    INSERT INTO public.contas_pagar (
      descricao, valor, vencimento, status, tipo, 
      cc_id, categoria_id, origem, favorecido_fornecedor
    ) VALUES (
      'Comissão Comercial - ' || v_pct_comissao || '%',
      v_valor_comissao,
      (NEW.data_inicio + interval '30 days')::date,
      'em_aberto',
      'variavel',
      NEW.id,
      v_cat_comissao_id,
      'sistema',
      'Comercial'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Trigger Definition
DROP TRIGGER IF EXISTS trigger_gerar_custos_iniciais ON public.centros_custo;
CREATE TRIGGER trigger_gerar_custos_iniciais
  AFTER INSERT ON public.centros_custo
  FOR EACH ROW
  EXECUTE FUNCTION gerar_custos_iniciais_cc();


-- 4. Overhead Calculation Function
CREATE OR REPLACE FUNCTION calcular_overhead_mensal(
  p_mes_referencia date,
  p_custo_adm numeric,
  p_custo_obras numeric,
  p_custo_assessoria numeric
)
RETURNS TABLE (
    ccs_processados integer,
    valor_por_cc numeric
) AS $$
DECLARE
  v_qtd_ccs integer;
  v_custo_total numeric;
  v_rateio numeric;
  v_cc_record RECORD;
BEGIN
  -- Validate date (ensure turned to 1st of month)
  p_mes_referencia := date_trunc('month', p_mes_referencia)::date;

  -- Count Active CCs in that month
  -- Active = data_inicio <= last_day_of_month AND (data_fim IS NULL OR data_fim >= first_day_of_month)
  -- Simplified: Active now or active during that month
  SELECT COUNT(*) INTO v_qtd_ccs
  FROM public.centros_custo
  WHERE ativo = true 
  AND data_inicio <= (p_mes_referencia + interval '1 month - 1 day')::date;

  IF v_qtd_ccs = 0 THEN
    RETURN QUERY SELECT 0, 0::numeric;
    RETURN;
  END IF;

  -- Total Cost to Distribute
  v_custo_total := p_custo_adm + p_custo_obras + p_custo_assessoria;
  v_rateio := ROUND(v_custo_total / v_qtd_ccs, 2);

  -- Insert Allocations
  FOR v_cc_record IN 
    SELECT id FROM public.centros_custo 
    WHERE ativo = true 
    AND data_inicio <= (p_mes_referencia + interval '1 month - 1 day')::date
  LOOP
    INSERT INTO public.custos_overhead_mensal (
      cc_id, mes_referencia, custo_escritorio_rateado, custo_setor_rateado
    ) VALUES (
      v_cc_record.id, 
      p_mes_referencia, 
      ROUND(p_custo_adm / v_qtd_ccs, 2), -- Split Adm part
      ROUND((p_custo_obras + p_custo_assessoria) / v_qtd_ccs, 2) -- Split Sector part based on type? 
      -- Simplification: For now, distributing evenly. 
      -- Ideally, we'd split Obras cost to Obras CCs and Assessoria to Assessoria CCs.
      -- FIXME: Future improvement: split by CC Type.
    )
    ON CONFLICT (cc_id, mes_referencia) 
    DO UPDATE SET 
      custo_escritorio_rateado = EXCLUDED.custo_escritorio_rateado,
      custo_setor_rateado = EXCLUDED.custo_setor_rateado,
      updated_at = now();
  END LOOP;

  RETURN QUERY SELECT v_qtd_ccs, v_rateio;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
