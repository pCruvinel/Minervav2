-- ============================================================
-- Migration 4: Popular códigos em tipos_os (se necessário)
-- Data: 2025-12-02
-- Descrição: Garante que todos os tipos_os têm código de 2 dígitos
-- ============================================================

BEGIN;

-- Verificar quais tipos_os não têm código
SELECT id, nome, codigo
FROM tipos_os
WHERE codigo IS NULL OR codigo = '' OR LENGTH(codigo) != 2;

-- Popular códigos conhecidos (ajustar conforme sua base)
-- Exemplo de códigos padrão:

UPDATE tipos_os 
SET codigo = '01' 
WHERE (nome ILIKE '%obras%' OR nome ILIKE '%1-4%')
  AND (codigo IS NULL OR codigo = '');

UPDATE tipos_os 
SET codigo = '02' 
WHERE (nome ILIKE '%assessoria%' AND nome ILIKE '%lead%')
  AND (codigo IS NULL OR codigo = '');

UPDATE tipos_os 
SET codigo = '05' 
WHERE (nome ILIKE '%assessoria%' AND nome ILIKE '%recorrente%')
  AND (codigo IS NULL OR codigo = '');

UPDATE tipos_os 
SET codigo = '13' 
WHERE (nome ILIKE '%contrato%' AND nome ILIKE '%start%')
  AND (codigo IS NULL OR codigo = '');

-- Adicionar outros tipos conforme necessário
-- UPDATE tipos_os SET codigo = '10' WHERE nome ILIKE '%compras%';
-- UPDATE tipos_os SET codigo = '11' WHERE nome ILIKE '%contratação%';

-- Verificar se ainda há tipos sem código
SELECT id, nome, codigo
FROM tipos_os
WHERE codigo IS NULL OR codigo = ''
ORDER BY nome;

COMMIT;

-- ============================================================
-- IMPORTANTE: Revisar e ajustar manualmente
-- ============================================================
-- Os UPDATEs acima são exemplos baseados em nomes.
-- EXECUTE este script e depois VERIFIQUE a tabela tipos_os.
-- Se houver tipos sem código, atualize manualmente:
-- UPDATE tipos_os SET codigo = 'XX' WHERE id = 'uuid-do-tipo';
