-- =====================================================
-- Migration: Fix RLS Recursion usando SECURITY DEFINER
-- Data: 2025-11-22
-- Descrição: Corrige recursão infinita usando funções que bypassam RLS
-- =====================================================

-- 1. REMOVER policy problemática anterior
DROP POLICY IF EXISTS "colaboradores_read_v3" ON colaboradores;
DROP POLICY IF EXISTS "Usuarios podem ver colaboradores" ON colaboradores;
DROP FUNCTION IF EXISTS public.check_colaborador_access(uuid);

-- =====================================================
-- 2. CRIAR FUNÇÕES SECURITY DEFINER (Bypassam RLS)
-- =====================================================

-- Função: Retorna o nivel_acesso do cargo do usuário logado
CREATE OR REPLACE FUNCTION public.get_my_cargo_nivel()
RETURNS INTEGER
LANGUAGE SQL
SECURITY DEFINER  -- ← Roda com permissões do owner, BYPASSA RLS!
SET search_path = public
STABLE
AS $$
  SELECT COALESCE(cargos.nivel_acesso, 0)
  FROM colaboradores
  LEFT JOIN cargos ON cargos.id = colaboradores.cargo_id
  WHERE colaboradores.id = auth.uid()
  LIMIT 1;
$$;

-- Função: Retorna o setor_id do usuário logado
CREATE OR REPLACE FUNCTION public.get_my_setor_id()
RETURNS UUID
LANGUAGE SQL
SECURITY DEFINER  -- ← Roda com permissões do owner, BYPASSA RLS!
SET search_path = public
STABLE
AS $$
  SELECT colaboradores.setor_id
  FROM colaboradores
  WHERE colaboradores.id = auth.uid()
  LIMIT 1;
$$;

-- Comentários nas funções
COMMENT ON FUNCTION public.get_my_cargo_nivel() IS
'Retorna o nivel_acesso do cargo do usuário logado (bypassa RLS)';

COMMENT ON FUNCTION public.get_my_setor_id() IS
'Retorna o setor_id do usuário logado (bypassa RLS)';

-- =====================================================
-- 3. CRIAR POLICY FINAL (SEM RECURSÃO)
-- =====================================================

CREATE POLICY "colaboradores_read_final"
ON colaboradores FOR SELECT
TO authenticated
USING (
  -- REGRA 1: Próprio perfil (direto, sem subquery)
  id = auth.uid()

  OR

  -- REGRA 2: Gestores (nivel >= 5) veem todos
  -- Usa função SECURITY DEFINER (não causa recursão!)
  get_my_cargo_nivel() >= 5

  OR

  -- REGRA 3: Mesmo setor
  -- Usa função SECURITY DEFINER (não causa recursão!)
  setor_id = get_my_setor_id()
);

-- Comentário na policy
COMMENT ON POLICY "colaboradores_read_final" ON colaboradores IS
'Policy de leitura sem recursão usando SECURITY DEFINER functions. Regras:
1. Próprio perfil (direto),
2. Gestores (nivel >= 5) veem todos,
3. Mesmo setor';

-- =====================================================
-- 4. GRANTS (Permitir execução das funções)
-- =====================================================

GRANT EXECUTE ON FUNCTION public.get_my_cargo_nivel() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_setor_id() TO authenticated;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
