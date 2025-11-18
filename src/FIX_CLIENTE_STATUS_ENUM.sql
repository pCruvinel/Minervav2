-- ============================================================
-- FIX: Criar/Corrigir ENUM cliente_status
-- ============================================================
-- 
-- PROBLEMA: O enum cliente_status não existe ou está incorreto
-- SOLUÇÃO: Criar o enum com os valores corretos
--
-- INSTRUÇÕES:
-- 1. Acesse: Supabase Dashboard → SQL Editor
-- 2. Cole este script
-- 3. Execute (Run)
-- ============================================================

-- Verificar se o enum existe
DO $$ 
BEGIN
  -- Se o enum não existe, criar
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'cliente_status') THEN
    CREATE TYPE cliente_status AS ENUM (
      'LEAD',
      'CLIENTE_ATIVO',
      'CLIENTE_INATIVO'
    );
    RAISE NOTICE '✅ ENUM cliente_status criado com sucesso!';
  ELSE
    RAISE NOTICE '⚠️ ENUM cliente_status já existe. Verificando valores...';
    
    -- Verificar se os valores estão corretos
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      WHERE t.typname = 'cliente_status' AND e.enumlabel = 'CLIENTE_ATIVO'
    ) THEN
      RAISE NOTICE '❌ ENUM cliente_status existe mas está INCORRETO!';
      RAISE NOTICE '📋 Execute o bloco de correção abaixo manualmente...';
    ELSE
      RAISE NOTICE '✅ ENUM cliente_status está correto!';
    END IF;
  END IF;
END $$;

-- ============================================================
-- CORREÇÃO MANUAL (se necessário)
-- ============================================================
-- Se o enum existe mas está incorreto, você precisa:
-- 1. Remover a constraint da coluna
-- 2. Dropar o enum
-- 3. Recriar o enum
-- 4. Recriar a constraint
--
-- ATENÇÃO: Isso só funciona se não houver dados na tabela
-- ou se você converter os dados antes!
-- ============================================================

-- DESCOMENTAR E EXECUTAR APENAS SE O ENUM ESTIVER ERRADO:
/*
-- Passo 1: Alterar tipo da coluna para TEXT temporariamente
ALTER TABLE clientes ALTER COLUMN status TYPE TEXT;

-- Passo 2: Dropar o enum antigo
DROP TYPE IF EXISTS cliente_status CASCADE;

-- Passo 3: Criar o enum correto
CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);

-- Passo 4: Restaurar o tipo da coluna
ALTER TABLE clientes ALTER COLUMN status TYPE cliente_status USING status::cliente_status;

-- Passo 5: Definir valor padrão
ALTER TABLE clientes ALTER COLUMN status SET DEFAULT 'LEAD'::cliente_status;

-- Passo 6: Verificar valores existentes
SELECT DISTINCT status FROM clientes;
*/

-- ============================================================
-- VERIFICAÇÃO FINAL
-- ============================================================

SELECT '✅ Verificação dos valores do ENUM cliente_status:' as titulo;

SELECT enumlabel as valor, enumsortorder as ordem
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'cliente_status'
ORDER BY enumsortorder;

-- Verificar clientes existentes
SELECT '✅ Clientes existentes no banco:' as titulo;

SELECT 
  COUNT(*) FILTER (WHERE status::text = 'LEAD') as total_leads,
  COUNT(*) FILTER (WHERE status::text = 'CLIENTE_ATIVO') as total_ativos,
  COUNT(*) FILTER (WHERE status::text = 'CLIENTE_INATIVO') as total_inativos,
  COUNT(*) as total_geral
FROM clientes;

-- ============================================================
-- MENSAGEM FINAL
-- ============================================================

SELECT '
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ✅  VERIFICAÇÃO CONCLUÍDA                                  ║
║                                                              ║
║  Se o ENUM estava correto, tudo OK!                          ║
║  Se estava incorreto, descomente o bloco de CORREÇÃO MANUAL  ║
║  e execute novamente.                                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
' as mensagem;
