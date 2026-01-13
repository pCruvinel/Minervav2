-- Migration: fix_validar_cc_cliente_os_null_check.sql
-- Data: 2026-01-07
-- Descrição: Corrige trigger para permitir CCs departamentais sem cliente

-- PROBLEMA:
-- O trigger comparava `cc.cliente_id = NEW.cliente_id`
-- Quando ambos são NULL (CC departamental + OS sem cliente), 
-- a comparação `NULL = NULL` retorna FALSE em SQL, causando erro.

-- SOLUÇÃO:
-- 1. Se a OS não tem cliente (NULL), permite qualquer CC
-- 2. Se o CC é departamental (cliente_id NULL), permite qualquer OS
-- 3. Se ambos têm cliente, os clientes devem coincidir

CREATE OR REPLACE FUNCTION public.validar_cc_cliente_os()
RETURNS trigger
LANGUAGE plpgsql
AS $function$
BEGIN
  -- Se cc_id é NULL, permite (será criado depois ou não é necessário)
  IF NEW.cc_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Se cliente_id é NULL na OS, permite (CCs departamentais podem ser usados sem cliente)
  IF NEW.cliente_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Verificar se o CC pertence ao cliente da OS
  -- Permite se o CC também não tem cliente (departamental) ou se os clientes coincidem
  IF NOT EXISTS (
    SELECT 1 FROM centros_custo cc
    WHERE cc.id = NEW.cc_id
    AND (
      cc.cliente_id IS NULL  -- CC departamental: permite qualquer OS
      OR cc.cliente_id = NEW.cliente_id  -- CC do cliente: deve coincidir
    )
  ) THEN
    RAISE EXCEPTION 'Centro de Custo % não pertence ao cliente da OS %', NEW.cc_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$function$;

-- OS-09 (Requisição de Compras) pode ser usada para compras internas sem cliente
-- Quando o CC é departamental (Escritório, Dept. Assessoria, etc), não há cliente associado
ALTER TABLE public.ordens_servico 
ALTER COLUMN cliente_id DROP NOT NULL;
