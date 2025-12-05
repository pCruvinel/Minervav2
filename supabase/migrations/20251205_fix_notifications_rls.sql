-- Migration: Corrigir política RLS da tabela notificacoes
-- Data: 2025-12-05
-- Descrição: Ajustar política de INSERT para usar auth.uid() ao invés de auth.role()

BEGIN;

-- Remover política antiga
DROP POLICY IF EXISTS "Users can create notifications" ON public.notificacoes;

-- Criar nova política mais robusta
CREATE POLICY "Users can create notifications"
  ON public.notificacoes FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

COMMIT;