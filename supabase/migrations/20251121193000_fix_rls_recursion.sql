-- Fix infinite recursion in RLS policy for colaboradores
-- This replaces the policy created in 20251121190627_fix_rls_limit.sql

DROP POLICY IF EXISTS "Usuarios podem ver colaboradores" ON colaboradores;

CREATE POLICY "Usuarios podem ver colaboradores"
ON colaboradores FOR SELECT
TO authenticated
USING (
  -- 1. Base case: User can always see their own profile (Breaks recursion)
  auth.uid() = id
  OR
  -- 2. Recursive case: Check permissions via joins
  EXISTS (
    SELECT 1 FROM colaboradores requester
    LEFT JOIN cargos cg ON requester.cargo_id = cg.id
    WHERE requester.id = auth.uid()
    AND (
      -- Check for admin/gestor roles (covering various naming conventions)
      cg.slug IN (
        'admin', 'diretoria', 'gestor_obras', 'gestor_assessoria', 'gestor_administrativo',
        'DIRETORIA', 'GESTOR_ADM', 'GESTOR_OBRAS', 'GESTOR_ASSESSORIA'
      )
      OR 
      -- Check for same sector (comparing IDs directly)
      requester.setor_id = colaboradores.setor_id
    )
  )
);
