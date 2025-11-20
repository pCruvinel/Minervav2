-- ==========================================
-- MIGRATION: Corrigir ENUM user_setor
-- Data: 2025-11-19
-- Prioridade: 🔴 CRÍTICA
-- Descrição: Normalizar setores do sistema
-- ==========================================

-- Decisão: Usar nomes completos por clareza
-- ADM → COMERCIAL (renomear para melhor clareza)
-- ASSESSORIA → ASSESSORIA (mantém)
-- OBRAS → OBRAS (mantém)

BEGIN;

-- Renomear enum antigo
ALTER TYPE user_setor RENAME TO user_setor_old;

-- Criar novo enum
CREATE TYPE user_setor AS ENUM (
  'COMERCIAL',
  'ASSESSORIA',
  'OBRAS'
);

-- Atualizar tabela colaboradores
ALTER TABLE colaboradores
  ALTER COLUMN setor TYPE user_setor
  USING (
    CASE setor::text
      WHEN 'ADM' THEN 'COMERCIAL'::user_setor
      WHEN 'ASSESSORIA' THEN 'ASSESSORIA'::user_setor
      WHEN 'OBRAS' THEN 'OBRAS'::user_setor
      ELSE NULL::user_setor
    END
  );

-- Atualizar tabela tipos_os
ALTER TABLE tipos_os
  ALTER COLUMN setor_padrao TYPE user_setor
  USING (
    CASE setor_padrao::text
      WHEN 'ADM' THEN 'COMERCIAL'::user_setor
      WHEN 'ASSESSORIA' THEN 'ASSESSORIA'::user_setor
      WHEN 'OBRAS' THEN 'OBRAS'::user_setor
    END
  );

-- Remover enum antigo
DROP TYPE user_setor_old;

-- Comentários
COMMENT ON TYPE user_setor IS 'Setores do sistema: COMERCIAL, ASSESSORIA, OBRAS';

COMMIT;

-- ==========================================
-- Verificação Pós-Migration
-- ==========================================

-- Verificar distribuição de setores
SELECT
  setor,
  COUNT(*) as total_colaboradores
FROM colaboradores
WHERE setor IS NOT NULL
GROUP BY setor;

SELECT
  setor_padrao,
  COUNT(*) as total_tipos_os
FROM tipos_os
GROUP BY setor_padrao;

-- ==========================================
-- ⚠️ IMPORTANTE: Atualizar código TypeScript após executar!
--
-- Arquivo: src/lib/types.ts
-- Mudar:
--   'COM' → 'COMERCIAL'
--   'ASS' → 'ASSESSORIA'
--   'OBR' → 'OBRAS'
--
-- Buscar e substituir em todo o projeto:
--   setor === 'COM'  →  setor === 'COMERCIAL'
--   setor === 'ASS'  →  setor === 'ASSESSORIA'
--   setor === 'OBR'  →  setor === 'OBRAS'
-- ==========================================
