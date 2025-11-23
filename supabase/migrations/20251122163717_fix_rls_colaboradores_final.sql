-- =====================================================
-- Migration: Fix RLS Recursion in Colaboradores (Final)
-- Data: 2025-11-22
-- Descrição: Corrige recursão infinita/lentidão causada pela função check_colaborador_access
--            Substitui por uma policy simples e eficiente sem recursão
-- =====================================================

-- 1. REMOVER policy e função problemáticas
DROP POLICY IF EXISTS "Usuarios podem ver colaboradores" ON colaboradores;
DROP FUNCTION IF EXISTS public.check_colaborador_access(uuid);

-- 2. CRIAR policy simplificada e eficiente
-- Estratégia: Evitar SELECT recursivo em colaboradores dentro da própria policy
CREATE POLICY "colaboradores_read_v3"
ON colaboradores FOR SELECT
TO authenticated
USING (
  -- REGRA 1: Usuário sempre vê o próprio perfil (sem subquery)
  id = auth.uid()

  OR

  -- REGRA 2: Gestores (nivel_acesso >= 5) veem TODOS os colaboradores
  -- Subquery simples: pega o nivel_acesso do cargo do usuário logado
  EXISTS (
    SELECT 1 FROM cargos
    WHERE cargos.id = (
      -- Subquery isolada: busca apenas o cargo_id do usuário logado
      SELECT cargo_id FROM colaboradores WHERE id = auth.uid() LIMIT 1
    )
    AND cargos.nivel_acesso >= 5
  )

  OR

  -- REGRA 3: Colaboradores veem colegas do mesmo setor
  -- Compara setor_id diretamente
  setor_id = (
    -- Subquery isolada: busca apenas o setor_id do usuário logado
    SELECT setor_id FROM colaboradores WHERE id = auth.uid() LIMIT 1
  )
);

-- 3. Adicionar comentário explicativo
COMMENT ON POLICY "colaboradores_read_v3" ON colaboradores IS
'Policy de leitura para colaboradores sem recursão. Regras:
1. Próprio perfil (direto),
2. Gestores veem todos (via nivel_acesso >= 5),
3. Mesmo setor (via setor_id)';

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
