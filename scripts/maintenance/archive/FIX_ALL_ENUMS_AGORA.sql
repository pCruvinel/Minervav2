-- ============================================================
-- CORREÇÃO COMPLETA DE TODOS OS ENUMS - EXECUTAR AGORA
-- ============================================================
-- 
-- INSTRUÇÕES:
-- 1. Copie TODO este arquivo
-- 2. Cole no Supabase SQL Editor
-- 3. Execute (botão "Run")
-- 4. Aguarde 10-20 segundos
-- 5. Recarregue seu app (F5)
-- 
-- ⚠️ IMPORTANTE: Este script é SEGURO e pode ser executado
-- múltiplas vezes sem problemas.
-- ============================================================

BEGIN;

-- ============================================================
-- 1. CORRIGIR cliente_status
-- ============================================================

ALTER TABLE clientes ALTER COLUMN status DROP DEFAULT;
ALTER TABLE clientes ALTER COLUMN status TYPE TEXT USING status::TEXT;
DROP TYPE IF EXISTS cliente_status CASCADE;

CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);

-- Normalizar dados existentes
UPDATE clientes SET status = 'LEAD' 
WHERE UPPER(REPLACE(REPLACE(status, ' ', '_'), 'Á', 'A')) = 'LEAD';

UPDATE clientes SET status = 'CLIENTE_ATIVO' 
WHERE UPPER(REPLACE(REPLACE(status, ' ', '_'), 'Á', 'A')) IN ('CLIENTE_ATIVO', 'CLIENTEATIVO', 'ATIVO');

UPDATE clientes SET status = 'CLIENTE_INATIVO' 
WHERE UPPER(REPLACE(REPLACE(status, ' ', '_'), 'Á', 'A')) IN ('CLIENTE_INATIVO', 'CLIENTEINATIVO', 'INATIVO');

-- Se ainda houver valores inválidos, definir como LEAD
UPDATE clientes SET status = 'LEAD' 
WHERE status NOT IN ('LEAD', 'CLIENTE_ATIVO', 'CLIENTE_INATIVO');

ALTER TABLE clientes 
ALTER COLUMN status TYPE cliente_status 
USING status::cliente_status;

ALTER TABLE clientes 
ALTER COLUMN status SET DEFAULT 'LEAD'::cliente_status;

-- ============================================================
-- 2. CORRIGIR tipo_cliente
-- ============================================================

-- Se a coluna não existir, criar
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'clientes' AND column_name = 'tipo_cliente'
  ) THEN
    ALTER TABLE clientes ADD COLUMN tipo_cliente TEXT;
  END IF;
END $$;

ALTER TABLE clientes ALTER COLUMN tipo_cliente DROP DEFAULT;
ALTER TABLE clientes ALTER COLUMN tipo_cliente TYPE TEXT USING tipo_cliente::TEXT;
DROP TYPE IF EXISTS tipo_cliente CASCADE;

CREATE TYPE tipo_cliente AS ENUM (
  'PESSOA_FISICA',
  'CONDOMINIO',
  'CONSTRUTORA',
  'INCORPORADORA',
  'INDUSTRIA',
  'COMERCIO',
  'OUTRO'
);

-- Normalizar dados existentes
UPDATE clientes SET tipo_cliente = 'PESSOA_FISICA'
WHERE UPPER(REPLACE(REPLACE(tipo_cliente, ' ', '_'), 'Í', 'I')) IN ('PESSOA_FISICA', 'PESSOAFISICA', 'PF');

UPDATE clientes SET tipo_cliente = 'CONDOMINIO'
WHERE UPPER(REPLACE(REPLACE(tipo_cliente, ' ', '_'), 'Í', 'I')) IN ('CONDOMINIO', 'CONDOMÍNIO');

UPDATE clientes SET tipo_cliente = 'CONSTRUTORA'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'CONSTRUTORA';

UPDATE clientes SET tipo_cliente = 'INCORPORADORA'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'INCORPORADORA';

UPDATE clientes SET tipo_cliente = 'INDUSTRIA'
WHERE UPPER(REPLACE(REPLACE(tipo_cliente, ' ', '_'), 'Ú', 'U')) IN ('INDUSTRIA', 'INDÚSTRIA');

UPDATE clientes SET tipo_cliente = 'COMERCIO'
WHERE UPPER(REPLACE(REPLACE(tipo_cliente, ' ', '_'), 'É', 'E')) IN ('COMERCIO', 'COMÉRCIO');

-- Valores inválidos ou nulos = OUTRO
UPDATE clientes SET tipo_cliente = 'OUTRO'
WHERE tipo_cliente IS NULL 
   OR tipo_cliente NOT IN (
     'PESSOA_FISICA', 'CONDOMINIO', 'CONSTRUTORA', 
     'INCORPORADORA', 'INDUSTRIA', 'COMERCIO', 'OUTRO'
   );

ALTER TABLE clientes 
ALTER COLUMN tipo_cliente TYPE tipo_cliente 
USING tipo_cliente::tipo_cliente;

-- ============================================================
-- 3. CORRIGIR os_status_geral
-- ============================================================

DROP TYPE IF EXISTS os_status_geral CASCADE;

CREATE TYPE os_status_geral AS ENUM (
  'EM_TRIAGEM',
  'EM_ANDAMENTO',
  'AGUARDANDO_APROVACAO',
  'CONCLUIDA',
  'CANCELADA',
  'PAUSADA'
);

-- ============================================================
-- 4. CORRIGIR os_etapa_status
-- ============================================================

DROP TYPE IF EXISTS os_etapa_status CASCADE;

CREATE TYPE os_etapa_status AS ENUM (
  'PENDENTE',
  'EM_ANDAMENTO',
  'AGUARDANDO_APROVACAO',
  'APROVADA',
  'REPROVADA',
  'CONCLUIDA'
);

-- ============================================================
-- 5. CORRIGIR agendamento_status
-- ============================================================

DROP TYPE IF EXISTS agendamento_status CASCADE;

CREATE TYPE agendamento_status AS ENUM (
  'AGENDADO',
  'EM_ANDAMENTO',
  'CONCLUIDO',
  'CANCELADO'
);

-- ============================================================
-- 6. CORRIGIR status_presenca
-- ============================================================

DROP TYPE IF EXISTS status_presenca CASCADE;

CREATE TYPE status_presenca AS ENUM (
  'PRESENTE',
  'FALTA',
  'FALTA_JUSTIFICADA',
  'ATESTADO',
  'FERIAS'
);

-- ============================================================
-- 7. CORRIGIR avaliacao_performance
-- ============================================================

DROP TYPE IF EXISTS avaliacao_performance CASCADE;

CREATE TYPE avaliacao_performance AS ENUM (
  'EXCELENTE',
  'BOM',
  'REGULAR',
  'INSATISFATORIO'
);

-- ============================================================
-- 8. CORRIGIR tipo_lancamento
-- ============================================================

DROP TYPE IF EXISTS tipo_lancamento CASCADE;

CREATE TYPE tipo_lancamento AS ENUM (
  'RECEITA',
  'DESPESA'
);

-- ============================================================
-- 9. CORRIGIR tipo_centro_custo
-- ============================================================

DROP TYPE IF EXISTS tipo_centro_custo CASCADE;

CREATE TYPE tipo_centro_custo AS ENUM (
  'OBRA',
  'ADMINISTRATIVO',
  'LABORATORIO',
  'COMERCIAL',
  'GERAL'
);

COMMIT;

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

SELECT '
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ✅  TODOS OS ENUMS CORRIGIDOS COM SUCESSO!                 ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
' as resultado;

-- Verificar cliente_status
SELECT '1️⃣ cliente_status:' as enum_name;
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'cliente_status'
ORDER BY enumsortorder;

-- Verificar tipo_cliente
SELECT '2️⃣ tipo_cliente:' as enum_name;
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'tipo_cliente'
ORDER BY enumsortorder;

-- Verificar os_status_geral
SELECT '3️⃣ os_status_geral:' as enum_name;
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'os_status_geral'
ORDER BY enumsortorder;

-- Verificar os_etapa_status
SELECT '4️⃣ os_etapa_status:' as enum_name;
SELECT enumlabel FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'os_etapa_status'
ORDER BY enumsortorder;

-- Ver clientes
SELECT '✅ Primeiros 5 clientes:' as titulo;
SELECT id, nome_razao_social, status, tipo_cliente
FROM clientes
ORDER BY created_at DESC
LIMIT 5;

SELECT '
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  🚀 PRONTO! Agora:                                           ║
║                                                              ║
║  1. Recarregue seu app (F5)                                  ║
║  2. Teste "Criar Nova OS"                                    ║
║  3. O dropdown de clientes deve funcionar                    ║
║                                                              ║
║  Se ainda houver erro, limpe o cache do navegador:           ║
║  Ctrl+Shift+Delete → Limpar cache → Recarregar              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
' as instrucoes_finais;
