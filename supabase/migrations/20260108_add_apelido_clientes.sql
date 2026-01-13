-- Migration: Adiciona coluna 'apelido' na tabela clientes
-- Data: 2026-01-08
-- Descrição: Campo opcional para armazenar apelido/nome fantasia do cliente/lead

ALTER TABLE public.clientes
ADD COLUMN IF NOT EXISTS apelido TEXT;

-- Comentário na coluna
COMMENT ON COLUMN public.clientes.apelido IS 'Apelido ou nome fantasia do cliente/lead (opcional)';
