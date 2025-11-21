-- Fix infinite recursion in RLS policy for colaboradores using SECURITY DEFINER function
-- This definitively breaks the recursion loop by bypassing RLS for the permission check

-- 1. Create a secure function to check permissions
CREATE OR REPLACE FUNCTION public.check_colaborador_access(target_setor_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with owner permissions, bypassing RLS
SET search_path = public -- Security best practice
AS $$
DECLARE
  v_cargo_slug text;
  v_setor_id uuid;
BEGIN
  -- Fetch current user's details directly (bypassing RLS due to SECURITY DEFINER)
  SELECT cg.slug, col.setor_id
  INTO v_cargo_slug, v_setor_id
  FROM colaboradores col
  LEFT JOIN cargos cg ON col.cargo_id = cg.id
  WHERE col.id = auth.uid();

  -- If user not found, deny access
  IF v_cargo_slug IS NULL THEN
    RETURN false;
  END IF;

  -- 1. Admin/Gestor/Diretoria access (can see everyone)
  IF v_cargo_slug IN (
    'admin', 'diretoria', 'gestor_obras', 'gestor_assessoria', 'gestor_administrativo',
    'DIRETORIA', 'GESTOR_ADM', 'GESTOR_OBRAS', 'GESTOR_ASSESSORIA'
  ) THEN
    RETURN true;
  END IF;

  -- 2. Same sector access
  -- If target has no sector, only admins can see (already handled above)
  IF target_setor_id IS NULL THEN
    RETURN false;
  END IF;

  IF v_setor_id = target_setor_id THEN
    RETURN true;
  END IF;

  RETURN false;
END;
$$;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "Usuarios podem ver colaboradores" ON colaboradores;

-- 3. Create new policy using the function
CREATE POLICY "Usuarios podem ver colaboradores"
ON colaboradores FOR SELECT
TO authenticated
USING (
  -- Base case: User can always see their own profile
  auth.uid() = id
  OR
  -- Use the secure function for other checks
  check_colaborador_access(setor_id)
);
