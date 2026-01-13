-- Migration: Fix Schema Issues (Aniversário e Sequência CC)
-- Data: 2026-01-08

-- 1. Adicionar coluna 'aniversario_gestor' na tabela clientes
ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS aniversario_gestor DATE;

COMMENT ON COLUMN public.clientes.aniversario_gestor IS 'Data de aniversário do gestor/síndico para lembretes';

-- 2. Criar função para incrementar sequência de Centro de Custo
-- Esta função calcula o próximo número sequencial para um tipo de OS
CREATE OR REPLACE FUNCTION public.incrementar_sequencia_cc(p_tipo_os_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_next_seq INTEGER;
BEGIN
  -- Conta quantos CCs existem para este tipo de OS e soma 1
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO v_next_seq
  FROM public.centros_custo
  WHERE tipo_os_id = p_tipo_os_id;
  
  RETURN v_next_seq;
END;
$$;

COMMENT ON FUNCTION public.incrementar_sequencia_cc IS 'Retorna o próximo número sequencial para criação de Centro de Custo baseado no Tipo de OS';
