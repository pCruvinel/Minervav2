-- ==========================================
-- MIGRATION: Corrigir ENUMs Menores
-- Data: 2025-11-19
-- Prioridade: 🟢 BAIXA
-- Descrição: Expandir e corrigir ENUMs secundários do sistema
-- ==========================================

BEGIN;

-- ==========================================
-- 1. Expandir cliente_tipo (adicionar tipos faltantes)
-- ==========================================

-- Adicionar novos tipos se não existirem
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CONSTRUTORA' AND enumtypid = 'cliente_tipo'::regtype) THEN
    ALTER TYPE cliente_tipo ADD VALUE 'CONSTRUTORA';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INCORPORADORA' AND enumtypid = 'cliente_tipo'::regtype) THEN
    ALTER TYPE cliente_tipo ADD VALUE 'INCORPORADORA';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'INDUSTRIA' AND enumtypid = 'cliente_tipo'::regtype) THEN
    ALTER TYPE cliente_tipo ADD VALUE 'INDUSTRIA';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'COMERCIO' AND enumtypid = 'cliente_tipo'::regtype) THEN
    ALTER TYPE cliente_tipo ADD VALUE 'COMERCIO';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'OUTRO' AND enumtypid = 'cliente_tipo'::regtype) THEN
    ALTER TYPE cliente_tipo ADD VALUE 'OUTRO';
  END IF;
END $$;

COMMENT ON TYPE cliente_tipo IS 'Tipos de cliente: PESSOA_FISICA, CONDOMINIO, EMPRESA, CONSTRUTORA, INCORPORADORA, INDUSTRIA, COMERCIO, OUTRO';

-- ==========================================
-- 2. Expandir cc_tipo (adicionar tipos administrativos)
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ADMINISTRATIVO' AND enumtypid = 'cc_tipo'::regtype) THEN
    ALTER TYPE cc_tipo ADD VALUE 'ADMINISTRATIVO';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LABORATORIO' AND enumtypid = 'cc_tipo'::regtype) THEN
    ALTER TYPE cc_tipo ADD VALUE 'LABORATORIO';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'COMERCIAL' AND enumtypid = 'cc_tipo'::regtype) THEN
    ALTER TYPE cc_tipo ADD VALUE 'COMERCIAL';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'GERAL' AND enumtypid = 'cc_tipo'::regtype) THEN
    ALTER TYPE cc_tipo ADD VALUE 'GERAL';
  END IF;
END $$;

COMMENT ON TYPE cc_tipo IS 'Tipos de Centro de Custo: ASSESSORIA, OBRA, INTERNO, ADMINISTRATIVO, LABORATORIO, COMERCIAL, GERAL';

-- ==========================================
-- 3. Expandir presenca_status (adicionar ATESTADO)
-- ==========================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'ATESTADO' AND enumtypid = 'presenca_status'::regtype) THEN
    ALTER TYPE presenca_status ADD VALUE 'ATESTADO';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'LICENCA' AND enumtypid = 'presenca_status'::regtype) THEN
    ALTER TYPE presenca_status ADD VALUE 'LICENCA';
  END IF;
END $$;

COMMENT ON TYPE presenca_status IS 'Status de presença: PRESENTE, ATRASO, FALTA_JUSTIFICADA, FALTA_INJUSTIFICADA, ATESTADO, FERIAS, FOLGA, LICENCA';

-- ==========================================
-- 4. Melhorar performance_avaliacao (mais granular)
-- ==========================================

-- Renomear enum antigo
ALTER TYPE performance_avaliacao RENAME TO performance_avaliacao_old;

-- Criar novo enum com mais granularidade
CREATE TYPE performance_avaliacao AS ENUM (
  'EXCELENTE',
  'BOM',
  'REGULAR',
  'INSATISFATORIO'
);

-- Atualizar tabela com mapeamento
ALTER TABLE colaborador_performance
  ALTER COLUMN avaliacao TYPE performance_avaliacao
  USING (
    CASE avaliacao::text
      WHEN 'OTIMA' THEN 'EXCELENTE'::performance_avaliacao
      WHEN 'BOA' THEN 'BOM'::performance_avaliacao
      WHEN 'RUIM' THEN 'INSATISFATORIO'::performance_avaliacao
      ELSE 'REGULAR'::performance_avaliacao
    END
  );

-- Remover enum antigo
DROP TYPE performance_avaliacao_old;

COMMENT ON TYPE performance_avaliacao IS 'Avaliação de performance: EXCELENTE, BOM, REGULAR, INSATISFATORIO';

-- ==========================================
-- 5. Adicionar 'CONCLUIDA' ao os_etapa_status (se necessário)
-- ==========================================

DO $$
BEGIN
  -- Verificar se CONCLUIDA já existe
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'CONCLUIDA' AND enumtypid = 'os_etapa_status'::regtype) THEN
    -- CONCLUIDA é sinônimo de APROVADA, então não vamos adicionar
    -- Mas documentar que APROVADA = etapa concluída
    NULL;
  END IF;
END $$;

COMMENT ON TYPE os_etapa_status IS 'Status de etapa: PENDENTE, EM_ANDAMENTO, AGUARDANDO_APROVACAO, APROVADA (concluída), REJEITADA';

-- ==========================================
-- 6. Adicionar status extra para OS (opcional)
-- ==========================================

-- Se quiser adicionar status como 'PAUSADA' ou 'AGUARDANDO_CLIENTE'
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'PAUSADA' AND enumtypid = 'os_status_geral'::regtype) THEN
    ALTER TYPE os_status_geral ADD VALUE 'PAUSADA';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'AGUARDANDO_CLIENTE' AND enumtypid = 'os_status_geral'::regtype) THEN
    ALTER TYPE os_status_geral ADD VALUE 'AGUARDANDO_CLIENTE';
  END IF;
END $$;

COMMENT ON TYPE os_status_geral IS 'Status geral de OS: EM_TRIAGEM, AGUARDANDO_INFORMACOES, AGUARDANDO_CLIENTE, EM_ANDAMENTO, PAUSADA, EM_VALIDACAO, ATRASADA, CONCLUIDA, CANCELADA';

COMMIT;

-- ==========================================
-- Verificação Pós-Migration
-- ==========================================

-- Ver todos os ENUMs e seus valores
SELECT
  t.typname AS enum_name,
  e.enumlabel AS enum_value,
  e.enumsortorder AS sort_order
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname IN (
  'user_role_nivel',
  'user_setor',
  'cliente_status',
  'cliente_tipo',
  'os_status_geral',
  'os_etapa_status',
  'cc_tipo',
  'delegacao_status',
  'presenca_status',
  'performance_avaliacao',
  'financeiro_tipo'
)
ORDER BY t.typname, e.enumsortorder;

-- Verificar distribuição de valores nas tabelas

-- Cliente tipos
SELECT tipo_cliente, COUNT(*)
FROM clientes
WHERE tipo_cliente IS NOT NULL
GROUP BY tipo_cliente;

-- CC tipos
SELECT tipo, COUNT(*)
FROM centros_custo
GROUP BY tipo;

-- Performance avaliações
SELECT avaliacao, COUNT(*)
FROM colaborador_performance
GROUP BY avaliacao;

-- ==========================================
-- NOTAS:
-- - ENUMs não podem ter valores removidos facilmente
-- - Valores adicionados ficam no final da ordenação
-- - Se precisar reordenar, necessário recriar o ENUM
-- ==========================================
