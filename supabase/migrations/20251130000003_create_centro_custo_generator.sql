-- Migration: Função PL/pgSQL para gerar Centro de Custo automaticamente
-- Data: 2025-11-30
-- Descrição: Gera Centro de Custo com naming convention CC{NUMERO_TIPO_OS}{SEQUENCIAL}
--            Exemplo: OS-13 -> CC1300001, CC1300002, etc.
--            Garante atomicidade através de ON CONFLICT

-- 1. Adicionar campos necessários na tabela centros_custo
ALTER TABLE public.centros_custo
ADD COLUMN IF NOT EXISTS tipo_os_id UUID REFERENCES public.tipos_os(id),
ADD COLUMN IF NOT EXISTS descricao TEXT;

COMMENT ON COLUMN public.centros_custo.tipo_os_id IS
  'Tipo de OS que originou este Centro de Custo';

COMMENT ON COLUMN public.centros_custo.descricao IS
  'Descrição opcional do Centro de Custo';

-- 2. Criar função para gerar Centro de Custo atomicamente
CREATE OR REPLACE FUNCTION public.gerar_centro_custo(
  p_tipo_os_id UUID,
  p_cliente_id UUID,
  p_descricao TEXT DEFAULT NULL
)
RETURNS TABLE(cc_id UUID, cc_nome TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_codigo_tipo_os VARCHAR(10);
  v_numero_tipo VARCHAR(5);
  v_sequencial INTEGER;
  v_cc_nome TEXT;
  v_cc_id UUID;
BEGIN
  -- 1. Buscar código do tipo_os (ex: "OS-13")
  SELECT codigo INTO v_codigo_tipo_os
  FROM tipos_os
  WHERE id = p_tipo_os_id;

  IF v_codigo_tipo_os IS NULL THEN
    RAISE EXCEPTION 'Tipo de OS não encontrado: %', p_tipo_os_id;
  END IF;

  -- 2. Extrair número após hífen (ex: "OS-13" -> "13")
  v_numero_tipo := SPLIT_PART(v_codigo_tipo_os, '-', 2);

  IF v_numero_tipo IS NULL OR v_numero_tipo = '' THEN
    RAISE EXCEPTION 'Código do tipo de OS inválido: %', v_codigo_tipo_os;
  END IF;

  -- 3. Incrementar sequência atomicamente usando UPSERT
  INSERT INTO os_sequences (tipo_os_id, current_value, updated_at)
  VALUES (p_tipo_os_id, 1, NOW())
  ON CONFLICT (tipo_os_id)
  DO UPDATE SET
    current_value = os_sequences.current_value + 1,
    updated_at = NOW()
  RETURNING current_value INTO v_sequencial;

  -- 4. Formatar nome: CC + numero_tipo + sequencial (5 dígitos com zero-padding)
  v_cc_nome := 'CC' || v_numero_tipo || LPAD(v_sequencial::TEXT, 5, '0');

  -- 5. Criar registro em centros_custo
  INSERT INTO centros_custo (nome, cliente_id, tipo_os_id, descricao, ativo, valor_global)
  VALUES (v_cc_nome, p_cliente_id, p_tipo_os_id, p_descricao, true, 0)
  RETURNING id INTO v_cc_id;

  -- 6. Retornar resultado como tabela
  RETURN QUERY SELECT v_cc_id, v_cc_nome;
END;
$$;

-- Comentário da função
COMMENT ON FUNCTION public.gerar_centro_custo IS
  'Gera Centro de Custo automaticamente com naming convention CC{NUMERO_TIPO_OS}{SEQUENCIAL}. Exemplo: CC1300001';

-- Grant de execução para authenticated users
GRANT EXECUTE ON FUNCTION public.gerar_centro_custo TO authenticated;
