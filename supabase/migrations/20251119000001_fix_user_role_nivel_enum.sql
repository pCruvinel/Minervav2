-- ==========================================
-- MIGRATION: Corrigir ENUM user_role_nivel
-- Data: 2025-11-19
-- Prioridade: 🔴 CRÍTICA
-- Descrição: Alinhar roles do banco com código TypeScript
-- ==========================================

-- ⚠️ ATENÇÃO: Fazer backup completo antes de executar!
-- supabase db dump -f backup_before_role_fix.sql

BEGIN;

-- Renomear enum antigo
ALTER TYPE user_role_nivel RENAME TO user_role_nivel_old;

-- Criar novo enum com todos os valores
CREATE TYPE user_role_nivel AS ENUM (
  'MOBRA',                    -- Nível 1 - Sem acesso ao sistema
  'COLABORADOR_COMERCIAL',    -- Nível 2 - Colaborador setor comercial
  'COLABORADOR_ASSESSORIA',   -- Nível 2 - Colaborador assessoria
  'COLABORADOR_OBRAS',        -- Nível 2 - Colaborador obras
  'GESTOR_COMERCIAL',         -- Nível 3 - Gestor comercial
  'GESTOR_ASSESSORIA',        -- Nível 3 - Gestor assessoria
  'GESTOR_OBRAS',             -- Nível 3 - Gestor obras
  'DIRETORIA'                 -- Nível 4 - Diretoria
);

-- Mapeamento de valores antigos para novos
-- COLABORADOR → COLABORADOR_COMERCIAL (padrão)
-- GESTOR_ADM → GESTOR_COMERCIAL
-- GESTOR_SETOR → GESTOR_ASSESSORIA (precisa análise manual dos dados!)
-- DIRETORIA → DIRETORIA (mantém)

-- Atualizar coluna com conversão
ALTER TABLE colaboradores
  ALTER COLUMN role_nivel TYPE user_role_nivel
  USING (
    CASE role_nivel::text
      WHEN 'COLABORADOR' THEN 'COLABORADOR_COMERCIAL'::user_role_nivel
      WHEN 'GESTOR_ADM' THEN 'GESTOR_COMERCIAL'::user_role_nivel
      WHEN 'GESTOR_SETOR' THEN 'GESTOR_ASSESSORIA'::user_role_nivel
      WHEN 'DIRETORIA' THEN 'DIRETORIA'::user_role_nivel
      ELSE 'COLABORADOR_COMERCIAL'::user_role_nivel
    END
  );

-- Atualizar default
ALTER TABLE colaboradores
  ALTER COLUMN role_nivel SET DEFAULT 'COLABORADOR_COMERCIAL'::user_role_nivel;

-- Remover enum antigo
DROP TYPE user_role_nivel_old;

-- Comentários
COMMENT ON TYPE user_role_nivel IS 'Níveis hierárquicos de usuários: MOBRA (1), COLABORADOR_* (2), GESTOR_* (3), DIRETORIA (4)';

COMMIT;

-- ==========================================
-- Verificação Pós-Migration
-- ==========================================

-- Verificar distribuição de roles
SELECT
  role_nivel,
  COUNT(*) as total,
  array_agg(nome_completo) as usuarios
FROM colaboradores
GROUP BY role_nivel
ORDER BY role_nivel;

-- ==========================================
-- AÇÕES MANUAIS NECESSÁRIAS:
-- 1. ✅ Verificar se usuários com GESTOR_SETOR foram corretamente mapeados
-- 2. ✅ Ajustar manualmente se algum GESTOR_SETOR deveria ser GESTOR_OBRAS
-- 3. ✅ Testar login de cada tipo de usuário
-- 4. ✅ Verificar permissões no frontend
-- ==========================================
