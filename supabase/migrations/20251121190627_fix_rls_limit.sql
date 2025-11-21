-- Migration: Fix insecure RLS policy (LIMIT 1) and ensure UNIQUE constraint
-- Created at: 2025-11-21 19:06:27

-- 1. Drop the insecure policy
DROP POLICY IF EXISTS "Usuarios podem ver colaboradores" ON colaboradores;

-- 2. Recreate the policy without LIMIT 1 in the subquery
-- Using a more standard EXISTS clause which is secure and efficient
CREATE POLICY "Usuarios podem ver colaboradores"
ON colaboradores FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND (
      -- Admin and Gestor can see everyone
      c.role_nivel IN ('admin', 'gestor')
      OR 
      -- Others can only see colleagues in the same sector
      c.setor = colaboradores.setor
    )
  )
);

-- 3. Ensure UNIQUE constraint on id (if not already PK)
-- This is a safety measure requested by the audit
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'colaboradores_id_key') THEN
        -- Only add if it doesn't exist (and assuming 'id' is not already a PK with a different constraint name)
        -- If 'id' is PK, it already has a unique index, but adding a specific constraint ensures compliance with the request.
        -- However, usually PKs are named 'colaboradores_pkey'. 
        -- We will try to add a unique constraint if 'id' is not the PK or if we want to be explicit.
        -- A safer approach is to check if there's already a unique index on 'id'.
        
        IF NOT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'colaboradores' 
            AND indexdef LIKE '%(id)%'
        ) THEN
             ALTER TABLE colaboradores ADD CONSTRAINT colaboradores_id_key UNIQUE (id);
        END IF;
    END IF;
END $$;
