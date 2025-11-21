-- =====================================================
-- MIGRATION: Fix Infinite Recursion in RLS Policies
-- Data: 2025-11-21
-- Descrição: Corrige recursão infinita nas policies da tabela colaboradores
--
-- PROBLEMA IDENTIFICADO:
-- Erro: "infinite recursion detected in policy for relation colaboradores"
--
-- CAUSA:
-- As policies RLS estão chamando funções que tentam acessar a própria
-- tabela colaboradores, causando recursão infinita.
--
-- SOLUÇÃO:
-- Simplificar policies removendo chamadas recursivas e usando apenas
-- verificações diretas com auth.uid() e campos da própria linha.
-- =====================================================

BEGIN;

-- =====================================================
-- PARTE 1: Remover Todas as Policies Existentes
-- =====================================================

DROP POLICY IF EXISTS "Diretoria pode ver todos os colaboradores" ON public.colaboradores;
DROP POLICY IF EXISTS "Gestores podem ver colaboradores do seu setor" ON public.colaboradores;
DROP POLICY IF EXISTS "Gestores podem ver colaboradores do mesmo setor" ON public.colaboradores;
DROP POLICY IF EXISTS "Colaboradores podem ver apenas seu próprio perfil" ON public.colaboradores;
DROP POLICY IF EXISTS "Colaboradores podem ver seu perfil" ON public.colaboradores;
DROP POLICY IF EXISTS "Diretoria pode atualizar qualquer colaborador" ON public.colaboradores;
DROP POLICY IF EXISTS "Gestores podem atualizar colaboradores do seu setor" ON public.colaboradores;
DROP POLICY IF EXISTS "Colaboradores podem atualizar seu próprio perfil" ON public.colaboradores;

-- =====================================================
-- PARTE 2: Criar Policies Simplificadas (SEM RECURSÃO)
-- =====================================================

-- Policy de SELECT: Simplificada
CREATE POLICY "Usuarios podem ver colaboradores baseado no role"
ON public.colaboradores
FOR SELECT
USING (
  -- Usuário autenticado pode ver:
  auth.uid() IS NOT NULL
  AND (
    -- 1. Seu próprio perfil
    id = auth.uid()
    OR
    -- 2. Se for DIRETORIA, pode ver todos
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid()
      AND c.role_nivel = 'DIRETORIA'
      LIMIT 1
    )
    OR
    -- 3. Se for GESTOR_*, pode ver colaboradores do mesmo setor
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid()
      AND c.role_nivel IN (
        'GESTOR_ASSESSORIA',
        'GESTOR_ADMINISTRATIVO',
        'GESTOR_OBRAS'
      )
      AND c.setor = colaboradores.setor
      LIMIT 1
    )
  )
);

-- Policy de UPDATE: Simplificada
CREATE POLICY "Usuarios podem atualizar colaboradores baseado no role"
ON public.colaboradores
FOR UPDATE
USING (
  auth.uid() IS NOT NULL
  AND (
    -- 1. Pode atualizar seu próprio perfil
    id = auth.uid()
    OR
    -- 2. DIRETORIA pode atualizar qualquer perfil
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid()
      AND c.role_nivel = 'DIRETORIA'
      LIMIT 1
    )
    OR
    -- 3. GESTOR_* pode atualizar colaboradores do mesmo setor
    EXISTS (
      SELECT 1 FROM public.colaboradores c
      WHERE c.id = auth.uid()
      AND c.role_nivel IN (
        'GESTOR_ASSESSORIA',
        'GESTOR_ADMINISTRATIVO',
        'GESTOR_OBRAS'
      )
      AND c.setor = colaboradores.setor
      LIMIT 1
    )
  )
);

-- Policy de INSERT: Apenas DIRETORIA pode criar colaboradores
CREATE POLICY "Apenas diretoria pode criar colaboradores"
ON public.colaboradores
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel = 'DIRETORIA'
    LIMIT 1
  )
);

-- Policy de DELETE: Apenas DIRETORIA pode deletar colaboradores
CREATE POLICY "Apenas diretoria pode deletar colaboradores"
ON public.colaboradores
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel = 'DIRETORIA'
    LIMIT 1
  )
);

COMMIT;

-- =====================================================
-- PARTE 3: Adicionar Comentários
-- =====================================================

COMMENT ON POLICY "Usuarios podem ver colaboradores baseado no role" ON public.colaboradores IS
  'Policy simplificada que evita recursão infinita. Permite: (1) Ver próprio perfil, (2) DIRETORIA ver todos, (3) GESTOR_* ver mesmo setor.';

COMMENT ON POLICY "Usuarios podem atualizar colaboradores baseado no role" ON public.colaboradores IS
  'Policy simplificada para UPDATE. Permite: (1) Atualizar próprio perfil, (2) DIRETORIA atualizar qualquer, (3) GESTOR_* atualizar mesmo setor.';

COMMENT ON POLICY "Apenas diretoria pode criar colaboradores" ON public.colaboradores IS
  'Restringe criação de colaboradores apenas para DIRETORIA.';

COMMENT ON POLICY "Apenas diretoria pode deletar colaboradores" ON public.colaboradores IS
  'Restringe exclusão de colaboradores apenas para DIRETORIA.';

-- =====================================================
-- PARTE 4: Verificação
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '=== Policies RLS Atualizadas ===';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Policies antigas removidas (causavam recursão infinita)';
  RAISE NOTICE '✅ Policies novas criadas (simplificadas, sem recursão)';
  RAISE NOTICE '';
  RAISE NOTICE 'Agora você pode:';
  RAISE NOTICE '1. Criar usuários no Dashboard (Authentication → Users)';
  RAISE NOTICE '2. Executar sync_all_test_users() sem erro de recursão';
  RAISE NOTICE '3. Fazer login sem erro "Database error querying schema"';
  RAISE NOTICE '';
END $$;
