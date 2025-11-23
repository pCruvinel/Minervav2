-- =====================================================
-- HOTFIX: Corrigir RLS Recursivo em Colaboradores (DEFINITIVO)
-- EXECUTAR ESTE SCRIPT NO SUPABASE STUDIO (SQL Editor)
-- =====================================================
-- Problema: Recursão infinita ao fazer login (erro 42P17)
-- Solução: SECURITY DEFINER functions que bypassam RLS
-- =====================================================

-- 1. REMOVER policies problemáticas anteriores
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
SECURITY DEFINER  -- ← BYPASSA RLS!
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
SECURITY DEFINER  -- ← BYPASSA RLS!
SET search_path = public
STABLE
AS $$
  SELECT colaboradores.setor_id
  FROM colaboradores
  WHERE colaboradores.id = auth.uid()
  LIMIT 1;
$$;

-- =====================================================
-- 3. CRIAR POLICY DEFINITIVA (SEM RECURSÃO!)
-- =====================================================

CREATE POLICY "colaboradores_read_final"
ON colaboradores FOR SELECT
TO authenticated
USING (
  -- REGRA 1: Próprio perfil
  id = auth.uid()

  OR

  -- REGRA 2: Gestores (nivel >= 5) veem todos
  get_my_cargo_nivel() >= 5  -- ✅ Usa função, não causa recursão!

  OR

  -- REGRA 3: Mesmo setor
  setor_id = get_my_setor_id()  -- ✅ Usa função, não causa recursão!
);

-- 4. GRANTS
GRANT EXECUTE ON FUNCTION public.get_my_cargo_nivel() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_setor_id() TO authenticated;

-- =====================================================
-- APÓS EXECUTAR:
-- 1. Limpe localStorage: localStorage.clear() no console
-- 2. Recarregue a página: location.reload()
-- 3. Faça login novamente
-- =====================================================
