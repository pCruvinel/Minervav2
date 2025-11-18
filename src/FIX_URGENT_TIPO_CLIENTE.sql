-- ============================================================
-- CORREÇÃO URGENTE: ENUM tipo_cliente
-- ============================================================
-- Este script corrige o ENUM tipo_cliente
-- Execução: Copie TUDO e cole no Supabase SQL Editor
-- ============================================================

-- PASSO 1: Verificar estado atual
DO $$
DECLARE
  enum_exists BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'tipo_cliente'
  ) INTO enum_exists;
  
  IF enum_exists THEN
    RAISE NOTICE '⚠️ ENUM tipo_cliente existe - será corrigido';
  ELSE
    RAISE NOTICE '❌ ENUM tipo_cliente NÃO existe - será criado';
  END IF;
END $$;

-- PASSO 2: Remover constraint e converter para TEXT
ALTER TABLE clientes ALTER COLUMN tipo_cliente DROP DEFAULT;
ALTER TABLE clientes ALTER COLUMN tipo_cliente TYPE TEXT USING tipo_cliente::TEXT;

-- PASSO 3: Dropar ENUM antigo (se existir)
DROP TYPE IF EXISTS tipo_cliente CASCADE;

-- PASSO 4: Criar ENUM correto
CREATE TYPE tipo_cliente AS ENUM (
  'PESSOA_FISICA',
  'CONDOMINIO',
  'CONSTRUTORA',
  'INCORPORADORA',
  'INDUSTRIA',
  'COMERCIO',
  'OUTRO'
);

-- PASSO 5: Atualizar dados existentes para o novo padrão
UPDATE clientes SET tipo_cliente = 'PESSOA_FISICA'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) IN ('PESSOA_FISICA', 'PESSOAFISICA', 'PF');

UPDATE clientes SET tipo_cliente = 'CONDOMINIO'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'CONDOMINIO';

UPDATE clientes SET tipo_cliente = 'CONSTRUTORA'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'CONSTRUTORA';

UPDATE clientes SET tipo_cliente = 'INCORPORADORA'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'INCORPORADORA';

UPDATE clientes SET tipo_cliente = 'INDUSTRIA'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'INDUSTRIA';

UPDATE clientes SET tipo_cliente = 'COMERCIO'
WHERE UPPER(REPLACE(tipo_cliente, ' ', '_')) = 'COMERCIO';

UPDATE clientes SET tipo_cliente = 'OUTRO'
WHERE tipo_cliente IS NULL OR UPPER(REPLACE(tipo_cliente, ' ', '_')) NOT IN (
  'PESSOA_FISICA', 'CONDOMINIO', 'CONSTRUTORA', 'INCORPORADORA', 'INDUSTRIA', 'COMERCIO'
);

-- PASSO 6: Converter coluna de volta para ENUM
ALTER TABLE clientes 
ALTER COLUMN tipo_cliente TYPE tipo_cliente 
USING tipo_cliente::tipo_cliente;

-- PASSO 7: Verificar resultado
SELECT '✅ Valores do ENUM tipo_cliente:' as resultado;
SELECT enumlabel as valor, enumsortorder as ordem
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'tipo_cliente'
ORDER BY enumsortorder;

-- PASSO 8: Verificar dados dos clientes
SELECT '✅ Distribuição de tipos de clientes:' as resultado;
SELECT 
  tipo_cliente,
  COUNT(*) as quantidade
FROM clientes
GROUP BY tipo_cliente
ORDER BY tipo_cliente;

-- Mensagem final
SELECT '
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ✅  ENUM tipo_cliente CORRIGIDO COM SUCESSO!               ║
║                                                              ║
║  Valores corretos:                                           ║
║  • PESSOA_FISICA                                             ║
║  • CONDOMINIO                                                ║
║  • CONSTRUTORA                                               ║
║  • INCORPORADORA                                             ║
║  • INDUSTRIA                                                 ║
║  • COMERCIO                                                  ║
║  • OUTRO                                                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
' as mensagem_final;
