-- ============================================================
-- CORREÇÃO URGENTE: ENUM cliente_status
-- ============================================================
-- Este script corrige o ENUM cliente_status que está causando erro
-- Execução: Copie TUDO e cole no Supabase SQL Editor
-- ============================================================

-- PASSO 1: Verificar estado atual
DO $$
DECLARE
  enum_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'cliente_status'
  ) INTO enum_exists;
  
  IF enum_exists THEN
    RAISE NOTICE '⚠️ ENUM cliente_status existe - será corrigido';
  ELSE
    RAISE NOTICE '❌ ENUM cliente_status NÃO existe - será criado';
  END IF;
END $$;

-- PASSO 2: Remover constraint e converter para TEXT
ALTER TABLE clientes ALTER COLUMN status DROP DEFAULT;
ALTER TABLE clientes ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- PASSO 3: Dropar ENUM antigo (se existir)
DROP TYPE IF EXISTS cliente_status CASCADE;

-- PASSO 4: Criar ENUM correto
CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);

-- PASSO 5: Atualizar dados existentes para o novo padrão
UPDATE clientes SET status = 'LEAD' 
WHERE UPPER(REPLACE(status, ' ', '_')) = 'LEAD';

UPDATE clientes SET status = 'CLIENTE_ATIVO' 
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('CLIENTE_ATIVO', 'CLIENTEATIVO', 'ATIVO');

UPDATE clientes SET status = 'CLIENTE_INATIVO' 
WHERE UPPER(REPLACE(status, ' ', '_')) IN ('CLIENTE_INATIVO', 'CLIENTEINATIVO', 'INATIVO');

-- PASSO 6: Converter coluna de volta para ENUM
ALTER TABLE clientes 
ALTER COLUMN status TYPE cliente_status 
USING status::cliente_status;

-- PASSO 7: Definir valor padrão
ALTER TABLE clientes 
ALTER COLUMN status SET DEFAULT 'LEAD'::cliente_status;

-- PASSO 8: Verificar resultado
SELECT '✅ Valores do ENUM cliente_status:' as resultado;
SELECT enumlabel as valor, enumsortorder as ordem
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'cliente_status'
ORDER BY enumsortorder;

-- PASSO 9: Verificar dados dos clientes
SELECT '✅ Distribuição de status dos clientes:' as resultado;
SELECT 
  status,
  COUNT(*) as quantidade
FROM clientes
GROUP BY status
ORDER BY status;

-- PASSO 10: Testar um SELECT
SELECT '✅ Teste de SELECT (primeiros 3 clientes):' as resultado;
SELECT 
  id,
  nome_razao_social,
  status,
  tipo_cliente
FROM clientes
LIMIT 3;

-- Mensagem final
SELECT '
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ✅  ENUM cliente_status CORRIGIDO COM SUCESSO!             ║
║                                                              ║
║  Valores corretos:                                           ║
║  • LEAD                                                      ║
║  • CLIENTE_ATIVO                                             ║
║  • CLIENTE_INATIVO                                           ║
║                                                              ║
║  🚀 Recarregue seu app (F5) e teste novamente!              ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
' as mensagem_final;
