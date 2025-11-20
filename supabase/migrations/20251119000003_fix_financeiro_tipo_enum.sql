-- ==========================================
-- MIGRATION: Corrigir ENUM financeiro_tipo
-- Data: 2025-11-19
-- Prioridade: 🔴 ALTA
-- Descrição: Alinhar nomenclatura financeira (ENTRADA/SAIDA → RECEITA/DESPESA)
-- ==========================================

-- Decisão: Usar RECEITA/DESPESA (mais comum contabilmente)

BEGIN;

ALTER TYPE financeiro_tipo RENAME TO financeiro_tipo_old;

CREATE TYPE financeiro_tipo AS ENUM (
  'RECEITA',
  'DESPESA'
);

-- Atualizar tabela (verificar se há dados primeiro)
ALTER TABLE financeiro_lancamentos
  ALTER COLUMN tipo TYPE financeiro_tipo
  USING (
    CASE tipo::text
      WHEN 'ENTRADA' THEN 'RECEITA'::financeiro_tipo
      WHEN 'SAIDA' THEN 'DESPESA'::financeiro_tipo
      ELSE 'DESPESA'::financeiro_tipo -- Default para dados inválidos
    END
  );

DROP TYPE financeiro_tipo_old;

COMMENT ON TYPE financeiro_tipo IS 'Tipos de lançamento financeiro: RECEITA ou DESPESA';

COMMIT;

-- ==========================================
-- Verificação Pós-Migration
-- ==========================================

SELECT
  tipo,
  COUNT(*) as total,
  SUM(valor) as total_valor
FROM financeiro_lancamentos
GROUP BY tipo;

-- ==========================================
-- ⚠️ IMPORTANTE: Atualizar código TypeScript!
--
-- Arquivo: src/lib/types.ts
-- Já usa 'RECEITA' e 'DESPESA', então está OK!
-- Verificar se há referências a 'ENTRADA' ou 'SAIDA' no código
-- ==========================================
