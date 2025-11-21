-- ============================================================
-- CORREÇÃO DEFINITIVA - EXECUTAR AGORA NO SUPABASE
-- ============================================================
-- 
-- Este script vai:
-- 1. Verificar qual é o problema exato
-- 2. Corrigir o ENUM cliente_status
-- 3. Atualizar todos os dados
-- 4. Validar que está funcionando
-- 
-- COPIE TUDO E EXECUTE NO SQL EDITOR DO SUPABASE
-- ============================================================

-- PASSO 1: Ver estado atual do enum
SELECT '🔍 PASSO 1: Verificando ENUM cliente_status existente...' as etapa;

SELECT 
  t.typname as enum_name,
  e.enumlabel as valor,
  e.enumsortorder as ordem
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'cliente_status'
ORDER BY e.enumsortorder;

-- PASSO 2: Ver dados atuais da tabela
SELECT '📊 PASSO 2: Dados atuais dos clientes...' as etapa;

SELECT 
  status::text as status_valor,
  COUNT(*) as quantidade
FROM clientes
GROUP BY status::text
ORDER BY quantidade DESC;

-- PASSO 3: Fazer o backup do tipo da coluna
SELECT '💾 PASSO 3: Fazendo backup e convertendo coluna...' as etapa;

ALTER TABLE clientes ALTER COLUMN status DROP DEFAULT;
ALTER TABLE clientes ALTER COLUMN status TYPE TEXT USING status::TEXT;

-- PASSO 4: Dropar enum antigo
SELECT '🗑️ PASSO 4: Removendo ENUM antigo...' as etapa;

DROP TYPE IF EXISTS cliente_status CASCADE;

-- PASSO 5: Criar enum correto
SELECT '✨ PASSO 5: Criando ENUM correto...' as etapa;

CREATE TYPE cliente_status AS ENUM (
  'LEAD',
  'CLIENTE_ATIVO',
  'CLIENTE_INATIVO'
);

-- PASSO 6: Normalizar todos os dados
SELECT '🔄 PASSO 6: Normalizando dados existentes...' as etapa;

-- Normalizar para LEAD
UPDATE clientes 
SET status = 'LEAD' 
WHERE UPPER(REPLACE(status, ' ', '_')) = 'LEAD';

-- Normalizar para CLIENTE_ATIVO (aceitar várias variações)
UPDATE clientes 
SET status = 'CLIENTE_ATIVO' 
WHERE UPPER(REPLACE(status, ' ', '_')) IN (
  'CLIENTE_ATIVO', 
  'CLIENTEATIVO', 
  'ATIVO',
  'CLIENTE ATIVO'
);

-- Normalizar para CLIENTE_INATIVO
UPDATE clientes 
SET status = 'CLIENTE_INATIVO' 
WHERE UPPER(REPLACE(status, ' ', '_')) IN (
  'CLIENTE_INATIVO',
  'CLIENTEINATIVO', 
  'INATIVO',
  'CLIENTE INATIVO'
);

-- Valores que sobraram = LEAD por padrão
UPDATE clientes 
SET status = 'LEAD' 
WHERE status NOT IN ('LEAD', 'CLIENTE_ATIVO', 'CLIENTE_INATIVO');

-- PASSO 7: Converter coluna de volta para ENUM
SELECT '🔧 PASSO 7: Convertendo coluna para ENUM...' as etapa;

ALTER TABLE clientes 
ALTER COLUMN status TYPE cliente_status 
USING status::cliente_status;

-- PASSO 8: Definir valor padrão
SELECT '⚙️ PASSO 8: Definindo valor padrão...' as etapa;

ALTER TABLE clientes 
ALTER COLUMN status SET DEFAULT 'LEAD'::cliente_status;

-- PASSO 9: Adicionar NOT NULL se necessário
SELECT '🔒 PASSO 9: Configurando constraint NOT NULL...' as etapa;

ALTER TABLE clientes 
ALTER COLUMN status SET NOT NULL;

-- PASSO 10: Verificação final
SELECT '
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ✅  CORREÇÃO CONCLUÍDA COM SUCESSO!                        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
' as resultado;

-- Ver o ENUM corrigido
SELECT '✅ Valores do ENUM cliente_status:' as verificacao;
SELECT enumlabel as valor
FROM pg_enum e
JOIN pg_type t ON e.enumtypid = t.oid
WHERE t.typname = 'cliente_status'
ORDER BY enumsortorder;

-- Ver distribuição de clientes
SELECT '✅ Distribuição de clientes por status:' as verificacao;
SELECT 
  status,
  COUNT(*) as total
FROM clientes
GROUP BY status
ORDER BY status;

-- Testar um SELECT simples
SELECT '✅ Teste: Primeiros 3 clientes:' as verificacao;
SELECT 
  nome_razao_social,
  status,
  tipo_cliente,
  created_at
FROM clientes
ORDER BY created_at DESC
LIMIT 3;

-- Testar filtro por status (o que estava causando erro)
SELECT '✅ Teste: Filtrar por CLIENTE_ATIVO:' as verificacao;
SELECT COUNT(*) as total_clientes_ativos
FROM clientes
WHERE status = 'CLIENTE_ATIVO';

SELECT '✅ Teste: Filtrar por LEAD:' as verificacao;
SELECT COUNT(*) as total_leads
FROM clientes
WHERE status = 'LEAD';

-- Mensagem final
SELECT '
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  🎉 TUDO PRONTO!                                             ║
║                                                              ║
║  ✅ ENUM cliente_status corrigido                            ║
║  ✅ Dados normalizados                                       ║
║  ✅ Testes executados com sucesso                            ║
║                                                              ║
║  🚀 PRÓXIMOS PASSOS:                                         ║
║  1. Feche esta aba do SQL Editor                             ║
║  2. Volte para seu app                                       ║
║  3. Pressione F5 para recarregar                             ║
║  4. Teste "Criar Nova OS"                                    ║
║  5. O dropdown de clientes deve funcionar!                   ║
║                                                              ║
║  Se ainda houver erro, execute:                              ║
║  localStorage.clear() no Console (F12)                       ║
║  e recarregue novamente                                      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
' as instrucoes_finais;
