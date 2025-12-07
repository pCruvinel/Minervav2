-- =============================================================================
-- MIGRATION: Refatoração da Arquitetura de Centros de Custo
-- Data: 2025-12-06
-- Objetivo: Centro de Custo = Espelho financeiro de uma OS de Contrato Ativa
-- Regra de Ouro: 1 OS de Contrato = 1 Centro de Custo
-- =============================================================================

-- #############################################################################
-- PARTE 1: ALTERAÇÕES NO SCHEMA
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 1.1 Adicionar coluna os_id em centros_custo (vínculo direto com OS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.centros_custo 
ADD COLUMN IF NOT EXISTS os_id uuid REFERENCES public.ordens_servico(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.centros_custo.os_id IS 
'FK para a OS que originou este Centro de Custo. Relação 1:1 com OSs de contrato.';

-- Constraint UNIQUE para garantir 1:1
ALTER TABLE public.centros_custo 
DROP CONSTRAINT IF EXISTS centros_custo_os_id_unique;

ALTER TABLE public.centros_custo 
ADD CONSTRAINT centros_custo_os_id_unique UNIQUE (os_id);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_centros_custo_os_id ON public.centros_custo(os_id);

-- -----------------------------------------------------------------------------
-- 1.2 Adicionar coluna data_inicio em centros_custo
-- -----------------------------------------------------------------------------
ALTER TABLE public.centros_custo 
ADD COLUMN IF NOT EXISTS data_inicio date DEFAULT CURRENT_DATE;

COMMENT ON COLUMN public.centros_custo.data_inicio IS 
'Data de início do Centro de Custo (herdada da criação da OS).';

-- -----------------------------------------------------------------------------
-- 1.3 Adicionar coluna data_fim em centros_custo (para contratos finalizados)
-- -----------------------------------------------------------------------------
ALTER TABLE public.centros_custo 
ADD COLUMN IF NOT EXISTS data_fim date;

COMMENT ON COLUMN public.centros_custo.data_fim IS 
'Data de encerramento do Centro de Custo (quando contrato é finalizado).';

-- -----------------------------------------------------------------------------
-- 1.4 Adicionar coluna created_at e updated_at se não existirem
-- -----------------------------------------------------------------------------
ALTER TABLE public.centros_custo 
ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE public.centros_custo 
ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();


-- #############################################################################
-- PARTE 2: REFATORAR ESTRUTURA DE RATEIO DE MÃO DE OBRA
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 2.1 Criar tabela de alocação de horas por CC (para rateio preciso)
-- Esta tabela permite: "Dia 05/12: João trabalhou 50% no CC-A e 50% no CC-B"
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alocacao_horas_cc (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  registro_presenca_id uuid NOT NULL REFERENCES public.registros_presenca(id) ON DELETE CASCADE,
  cc_id uuid NOT NULL REFERENCES public.centros_custo(id) ON DELETE CASCADE,
  percentual numeric(5,2) NOT NULL CHECK (percentual > 0 AND percentual <= 100),
  valor_calculado numeric(12,2), -- Custo proporcional calculado automaticamente
  observacao text,
  created_at timestamptz DEFAULT now(),
  
  -- Constraint para evitar duplicatas
  CONSTRAINT alocacao_horas_cc_unique UNIQUE (registro_presenca_id, cc_id)
);

COMMENT ON TABLE public.alocacao_horas_cc IS 
'Rateio de custo de mão de obra por Centro de Custo. Permite alocação percentual.';

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_alocacao_horas_cc_registro ON public.alocacao_horas_cc(registro_presenca_id);
CREATE INDEX IF NOT EXISTS idx_alocacao_horas_cc_cc ON public.alocacao_horas_cc(cc_id);

-- RLS
ALTER TABLE public.alocacao_horas_cc ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can manage alocacao_horas_cc" ON public.alocacao_horas_cc
  FOR ALL TO authenticated USING (true) WITH CHECK (true);


-- #############################################################################
-- PARTE 3: REFATORAR TRIGGERS DE GERAÇÃO DE CC
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 3.1 Remover triggers antigos
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_criar_cc_para_os ON public.ordens_servico;

-- -----------------------------------------------------------------------------
-- 3.2 Criar lista de tipos de OS que geram Centro de Custo
-- OS-07: Solicitação de Reforma
-- OS-08: Visita Técnica / Parecer Técnico  
-- OS-11: Start Contrato Assessoria Mensal
-- OS-12: Start Contrato Assessoria Avulsa
-- OS-13: Start de Contrato de Obra
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION is_os_contrato(p_tipo_os_codigo text)
RETURNS boolean AS $$
BEGIN
  RETURN p_tipo_os_codigo IN ('OS-07', 'OS-08', 'OS-11', 'OS-12', 'OS-13');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

COMMENT ON FUNCTION is_os_contrato IS 
'Verifica se o tipo de OS é uma OS de Contrato que deve gerar Centro de Custo.';

-- -----------------------------------------------------------------------------
-- 3.3 Função para gerar CC automaticamente quando Etapa 1 for concluída
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION gerar_cc_on_etapa_concluida()
RETURNS TRIGGER AS $$
DECLARE
  v_os_record RECORD;
  v_tipo_os_codigo text;
  v_cc_id uuid;
  v_cc_nome text;
  v_cliente_nome text;
  v_numero_tipo text;
  v_sequencial integer;
BEGIN
  -- Só processar quando etapa ordem=1 for marcada como 'concluida'
  IF NEW.ordem != 1 OR NEW.status != 'concluida' THEN
    RETURN NEW;
  END IF;
  
  -- Se não houve mudança de status, ignorar
  IF OLD IS NOT NULL AND OLD.status = 'concluida' THEN
    RETURN NEW;
  END IF;

  -- Buscar dados da OS
  SELECT 
    os.id,
    os.cliente_id,
    os.valor_contrato,
    os.codigo_os,
    os.data_entrada,
    os.cc_id,
    tos.codigo as tipo_codigo,
    c.nome_razao_social as cliente_nome
  INTO v_os_record
  FROM public.ordens_servico os
  JOIN public.tipos_os tos ON tos.id = os.tipo_os_id
  JOIN public.clientes c ON c.id = os.cliente_id
  WHERE os.id = NEW.os_id;

  -- Verificar se é uma OS de contrato
  IF NOT is_os_contrato(v_os_record.tipo_codigo) THEN
    RETURN NEW;
  END IF;

  -- Verificar se já tem CC vinculado (evitar duplicatas)
  IF v_os_record.cc_id IS NOT NULL THEN
    -- CC já existe, apenas atualizar o vínculo os_id se necessário
    UPDATE public.centros_custo 
    SET os_id = v_os_record.id, updated_at = now()
    WHERE id = v_os_record.cc_id AND os_id IS NULL;
    
    RETURN NEW;
  END IF;

  -- Extrair número do tipo (ex: "OS-13" -> "13")
  v_numero_tipo := SPLIT_PART(v_os_record.tipo_codigo, '-', 2);

  -- Incrementar sequência
  INSERT INTO public.os_sequences (tipo_os_id, current_value, updated_at)
  SELECT id, 1, NOW() FROM public.tipos_os WHERE codigo = v_os_record.tipo_codigo
  ON CONFLICT (tipo_os_id)
  DO UPDATE SET
    current_value = os_sequences.current_value + 1,
    updated_at = NOW()
  RETURNING current_value INTO v_sequencial;

  -- Formatar nome do CC: "CC - OS1300001 - Nome Cliente"
  v_cc_nome := 'CC - ' || v_os_record.codigo_os || ' - ' || LEFT(v_os_record.cliente_nome, 30);

  -- Criar Centro de Custo
  INSERT INTO public.centros_custo (
    nome,
    os_id,
    cliente_id,
    tipo_os_id,
    valor_global,
    data_inicio,
    descricao,
    ativo,
    created_at,
    updated_at
  )
  SELECT
    v_cc_nome,
    v_os_record.id,
    v_os_record.cliente_id,
    tos.id,
    COALESCE(v_os_record.valor_contrato, 0),
    COALESCE(v_os_record.data_entrada::date, CURRENT_DATE),
    'Gerado automaticamente na conclusão da Etapa 1',
    true,
    now(),
    now()
  FROM public.tipos_os tos
  WHERE tos.codigo = v_os_record.tipo_codigo
  RETURNING id INTO v_cc_id;

  -- Atualizar OS com o CC gerado
  UPDATE public.ordens_servico 
  SET cc_id = v_cc_id, updated_at = now()
  WHERE id = v_os_record.id;

  -- Log da operação
  RAISE NOTICE 'Centro de Custo % criado para OS %', v_cc_nome, v_os_record.codigo_os;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION gerar_cc_on_etapa_concluida IS 
'Gera Centro de Custo automaticamente quando a Etapa 1 de uma OS de Contrato é concluída.';

-- -----------------------------------------------------------------------------
-- 3.4 Criar trigger na tabela os_etapas
-- -----------------------------------------------------------------------------
DROP TRIGGER IF EXISTS trigger_gerar_cc_on_etapa_concluida ON public.os_etapas;

CREATE TRIGGER trigger_gerar_cc_on_etapa_concluida
  AFTER INSERT OR UPDATE OF status ON public.os_etapas
  FOR EACH ROW
  EXECUTE FUNCTION gerar_cc_on_etapa_concluida();


-- #############################################################################
-- PARTE 4: FUNÇÃO DE CÁLCULO DE CUSTO DIÁRIO DO COLABORADOR
-- #############################################################################

CREATE OR REPLACE FUNCTION calcular_custo_dia_colaborador(p_colaborador_id uuid)
RETURNS numeric AS $$
DECLARE
  v_colaborador RECORD;
  v_dias_uteis_mes integer := 22; -- Média de dias úteis
  v_encargos_clt numeric := 1.46; -- 46% de encargos sobre CLT
BEGIN
  SELECT tipo_contratacao, salario_base, custo_dia
  INTO v_colaborador
  FROM public.colaboradores
  WHERE id = p_colaborador_id;

  IF NOT FOUND THEN
    RETURN 0;
  END IF;

  -- CLT: (Salário + 46% encargos) / 22 dias
  IF v_colaborador.tipo_contratacao = 'CLT' THEN
    RETURN ROUND((COALESCE(v_colaborador.salario_base, 0) * v_encargos_clt) / v_dias_uteis_mes, 2);
  END IF;

  -- PJ/Outros: Custo diário direto
  RETURN COALESCE(v_colaborador.custo_dia, 0);
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION calcular_custo_dia_colaborador IS 
'Calcula o custo diário de um colaborador considerando tipo de contratação e encargos.';


-- #############################################################################
-- PARTE 5: VIEWS PARA CÁLCULO DE LUCRATIVIDADE
-- #############################################################################

-- -----------------------------------------------------------------------------
-- 5.1 View: Receitas por Centro de Custo (via contas_receber)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_receitas_por_cc AS
SELECT 
  cc.id as cc_id,
  cc.nome as cc_nome,
  cc.os_id,
  os.codigo_os,
  cc.valor_global as valor_contrato,
  COALESCE(SUM(cr.valor_previsto), 0) as receita_prevista,
  COALESCE(SUM(CASE WHEN cr.status = 'conciliado' THEN cr.valor_recebido ELSE 0 END), 0) as receita_realizada,
  COUNT(cr.id) as total_parcelas,
  COUNT(CASE WHEN cr.status = 'conciliado' THEN 1 END) as parcelas_pagas,
  COUNT(CASE WHEN cr.status = 'inadimplente' THEN 1 END) as parcelas_inadimplentes
FROM public.centros_custo cc
LEFT JOIN public.ordens_servico os ON os.id = cc.os_id
LEFT JOIN public.contas_receber cr ON cr.cc_id = cc.id
WHERE cc.ativo = true
GROUP BY cc.id, cc.nome, cc.os_id, os.codigo_os, cc.valor_global;

COMMENT ON VIEW vw_receitas_por_cc IS 
'Resumo de receitas por Centro de Custo, baseado em contas_receber.';

-- -----------------------------------------------------------------------------
-- 5.2 View: Custos Operacionais por Centro de Custo (via contas_pagar)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_custos_operacionais_por_cc AS
SELECT 
  cc.id as cc_id,
  cc.nome as cc_nome,
  cc.os_id,
  COALESCE(SUM(cp.valor), 0) as custo_total,
  COALESCE(SUM(CASE WHEN cp.status = 'pago' THEN cp.valor ELSE 0 END), 0) as custo_pago,
  COALESCE(SUM(CASE WHEN cp.status = 'em_aberto' THEN cp.valor ELSE 0 END), 0) as custo_a_pagar,
  COUNT(cp.id) as total_lancamentos
FROM public.centros_custo cc
LEFT JOIN public.contas_pagar cp ON cp.cc_id = cc.id
WHERE cc.ativo = true
GROUP BY cc.id, cc.nome, cc.os_id;

COMMENT ON VIEW vw_custos_operacionais_por_cc IS 
'Resumo de custos operacionais por Centro de Custo, baseado em contas_pagar.';

-- -----------------------------------------------------------------------------
-- 5.3 View: Custos de Mão de Obra por Centro de Custo
-- Baseado em registros_presenca + alocacao_horas_cc
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_custos_mo_por_cc AS
SELECT 
  cc.id as cc_id,
  cc.nome as cc_nome,
  cc.os_id,
  COALESCE(SUM(ahc.valor_calculado), 0) as custo_mo_total,
  COUNT(DISTINCT ahc.registro_presenca_id) as total_alocacoes,
  COUNT(DISTINCT rp.colaborador_id) as colaboradores_distintos
FROM public.centros_custo cc
LEFT JOIN public.alocacao_horas_cc ahc ON ahc.cc_id = cc.id
LEFT JOIN public.registros_presenca rp ON rp.id = ahc.registro_presenca_id
WHERE cc.ativo = true
GROUP BY cc.id, cc.nome, cc.os_id;

COMMENT ON VIEW vw_custos_mo_por_cc IS 
'Resumo de custos de mão de obra por Centro de Custo, baseado em alocação de horas.';

-- -----------------------------------------------------------------------------
-- 5.4 View: Lucratividade Consolidada por Centro de Custo
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_lucratividade_cc AS
SELECT 
  r.cc_id,
  r.cc_nome,
  r.os_id,
  r.codigo_os,
  r.valor_contrato,
  
  -- Receitas
  r.receita_prevista,
  r.receita_realizada,
  r.total_parcelas,
  r.parcelas_pagas,
  
  -- Custos Operacionais
  COALESCE(co.custo_total, 0) as custo_operacional_total,
  COALESCE(co.custo_pago, 0) as custo_operacional_pago,
  
  -- Custos de MO
  COALESCE(mo.custo_mo_total, 0) as custo_mo_total,
  COALESCE(mo.colaboradores_distintos, 0) as colaboradores_alocados,
  
  -- Cálculos de Lucratividade
  (COALESCE(co.custo_total, 0) + COALESCE(mo.custo_mo_total, 0)) as custo_total,
  
  -- Lucro Previsto = Receita Prevista - Custos Totais
  (r.receita_prevista - COALESCE(co.custo_total, 0) - COALESCE(mo.custo_mo_total, 0)) as lucro_previsto,
  
  -- Lucro Realizado = Receita Realizada - Custos Pagos - MO
  (r.receita_realizada - COALESCE(co.custo_pago, 0) - COALESCE(mo.custo_mo_total, 0)) as lucro_realizado,
  
  -- Margem (%)
  CASE 
    WHEN r.receita_prevista > 0 
    THEN ROUND(((r.receita_prevista - COALESCE(co.custo_total, 0) - COALESCE(mo.custo_mo_total, 0)) / r.receita_prevista) * 100, 2)
    ELSE 0 
  END as margem_prevista_pct,
  
  CASE 
    WHEN r.receita_realizada > 0 
    THEN ROUND(((r.receita_realizada - COALESCE(co.custo_pago, 0) - COALESCE(mo.custo_mo_total, 0)) / r.receita_realizada) * 100, 2)
    ELSE 0 
  END as margem_realizada_pct

FROM vw_receitas_por_cc r
LEFT JOIN vw_custos_operacionais_por_cc co ON co.cc_id = r.cc_id
LEFT JOIN vw_custos_mo_por_cc mo ON mo.cc_id = r.cc_id;

COMMENT ON VIEW vw_lucratividade_cc IS 
'Visão consolidada de lucratividade por Centro de Custo: Receitas - Custos Operacionais - Custos MO = Lucro.';


-- #############################################################################
-- PARTE 6: FUNÇÃO PARA BUSCAR LUCRATIVIDADE DE UM CC ESPECÍFICO
-- #############################################################################

CREATE OR REPLACE FUNCTION get_lucratividade_cc(p_cc_id uuid)
RETURNS TABLE (
  cc_id uuid,
  cc_nome text,
  os_id uuid,
  codigo_os varchar,
  valor_contrato numeric,
  receita_prevista numeric,
  receita_realizada numeric,
  custo_operacional_total numeric,
  custo_mo_total numeric,
  custo_total numeric,
  lucro_previsto numeric,
  lucro_realizado numeric,
  margem_prevista_pct numeric,
  margem_realizada_pct numeric,
  status_financeiro text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.cc_id,
    v.cc_nome,
    v.os_id,
    v.codigo_os,
    v.valor_contrato,
    v.receita_prevista,
    v.receita_realizada,
    v.custo_operacional_total,
    v.custo_mo_total,
    v.custo_total,
    v.lucro_previsto,
    v.lucro_realizado,
    v.margem_prevista_pct,
    v.margem_realizada_pct,
    CASE 
      WHEN v.lucro_realizado > 0 THEN 'LUCRATIVO'
      WHEN v.lucro_realizado = 0 THEN 'NEUTRO'
      ELSE 'PREJUÍZO'
    END as status_financeiro
  FROM vw_lucratividade_cc v
  WHERE v.cc_id = p_cc_id;
END;
$$ LANGUAGE plpgsql STABLE;

COMMENT ON FUNCTION get_lucratividade_cc IS 
'Retorna análise completa de lucratividade para um Centro de Custo específico.';


-- #############################################################################
-- PARTE 7: TRIGGER PARA CALCULAR VALOR_CALCULADO EM ALOCACAO_HORAS_CC
-- #############################################################################

CREATE OR REPLACE FUNCTION calcular_valor_alocacao_cc()
RETURNS TRIGGER AS $$
DECLARE
  v_custo_dia numeric;
  v_colaborador_id uuid;
BEGIN
  -- Buscar colaborador do registro de presença
  SELECT colaborador_id INTO v_colaborador_id
  FROM public.registros_presenca
  WHERE id = NEW.registro_presenca_id;

  -- Calcular custo diário do colaborador
  v_custo_dia := calcular_custo_dia_colaborador(v_colaborador_id);

  -- Calcular valor proporcional ao percentual
  NEW.valor_calculado := ROUND((v_custo_dia * NEW.percentual) / 100, 2);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calcular_valor_alocacao ON public.alocacao_horas_cc;

CREATE TRIGGER trigger_calcular_valor_alocacao
  BEFORE INSERT OR UPDATE OF percentual ON public.alocacao_horas_cc
  FOR EACH ROW
  EXECUTE FUNCTION calcular_valor_alocacao_cc();


-- #############################################################################
-- PARTE 8: FUNÇÃO PARA MIGRAR DADOS EXISTENTES
-- Converter centros_custo (array de IDs) para alocacao_horas_cc (com %)
-- #############################################################################

CREATE OR REPLACE FUNCTION migrar_centros_custo_para_alocacao()
RETURNS void AS $$
DECLARE
  v_registro RECORD;
  v_cc_id uuid;
  v_qtd_ccs integer;
  v_percentual numeric;
BEGIN
  FOR v_registro IN 
    SELECT id, centros_custo
    FROM public.registros_presenca
    WHERE centros_custo IS NOT NULL 
    AND jsonb_array_length(centros_custo) > 0
  LOOP
    -- Calcular percentual igual para cada CC
    v_qtd_ccs := jsonb_array_length(v_registro.centros_custo);
    v_percentual := ROUND(100.0 / v_qtd_ccs, 2);
    
    -- Inserir cada CC como alocação
    FOR v_cc_id IN SELECT (jsonb_array_elements_text(v_registro.centros_custo))::uuid
    LOOP
      INSERT INTO public.alocacao_horas_cc (registro_presenca_id, cc_id, percentual, observacao)
      VALUES (v_registro.id, v_cc_id, v_percentual, 'Migrado automaticamente - divisão igual')
      ON CONFLICT (registro_presenca_id, cc_id) DO NOTHING;
    END LOOP;
  END LOOP;
  
  RAISE NOTICE 'Migração de alocações concluída!';
END;
$$ LANGUAGE plpgsql;

-- Executar migração (descomente para rodar)
-- SELECT migrar_centros_custo_para_alocacao();


-- #############################################################################
-- PARTE 9: SUPORTE A RATEIO EM CONTAS_PAGAR (para conciliação bancária)
-- O campo rateio já existe como jsonb. Definir estrutura esperada.
-- #############################################################################

COMMENT ON COLUMN public.contas_pagar.rateio IS 
'Rateio entre múltiplos CCs. Estrutura: [{"cc_id": "uuid", "percentual": 50, "valor": 500.00}, ...]';


-- #############################################################################
-- PARTE 10: ÍNDICES ADICIONAIS PARA PERFORMANCE
-- #############################################################################

CREATE INDEX IF NOT EXISTS idx_contas_receber_cc_id ON public.contas_receber(cc_id);
CREATE INDEX IF NOT EXISTS idx_contas_receber_status ON public.contas_receber(status);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_cc_id ON public.contas_pagar(cc_id);
CREATE INDEX IF NOT EXISTS idx_contas_pagar_status ON public.contas_pagar(status);
CREATE INDEX IF NOT EXISTS idx_registros_presenca_data ON public.registros_presenca(data);


-- =============================================================================
-- FIM DA MIGRATION
-- =============================================================================


