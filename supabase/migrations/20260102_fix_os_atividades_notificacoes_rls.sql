-- ============================================================
-- Migration: Adicionar RLS Policy de INSERT para os_atividades
-- Data: 2026-01-02
-- Descrição: 
--   A tabela os_atividades existe mas não tem policy de INSERT,
--   causando erro 403/400 ao tentar registrar atividades.
--   
--   Estrutura real da tabela (verificada via MCP):
--   - id, os_id, etapa_id, usuario_id, tipo, descricao, 
--     dados_antigos, dados_novos, metadados, criado_em
--
--   Policy atual: apenas SELECT (para envolvidos na OS)
--   Faltando: Policy de INSERT para usuários autenticados
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ADICIONAR RLS POLICY DE INSERT PARA os_atividades
-- ============================================================

-- Remover policy antiga se existir (para permitir re-execução)
DROP POLICY IF EXISTS "Authenticated users can insert activities" ON public.os_atividades;

-- Criar policy de INSERT para usuários autenticados
-- Permite que qualquer usuário autenticado registre atividades em OSs
CREATE POLICY "Authenticated users can insert activities"
  ON public.os_atividades
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 2. LOG DE AUDITORIA
-- ============================================================

COMMENT ON POLICY "Authenticated users can insert activities" ON public.os_atividades 
  IS 'Permite INSERT de atividades por usuários autenticados. Necessário para sistema de transferência de OS. Criado em 2026-01-02.';

COMMIT;
