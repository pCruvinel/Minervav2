-- Migration: Adicionar campo senha_acesso na tabela clientes
-- Data: 2025-11-30
-- Descrição: Campo para armazenar senha de acesso do cliente ao portal
--            Reutilizável entre múltiplos contratos do mesmo cliente

ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS senha_acesso VARCHAR(255);

COMMENT ON COLUMN public.clientes.senha_acesso IS
  'Senha de acesso do cliente ao portal (reutilizável entre contratos)';
