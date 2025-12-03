-- ============================================================
-- Migration 3: Trigger para auto-gerar código de OS
-- Data: 2025-12-02
-- Descrição: Cria trigger que popula codigo_os automaticamente ao inserir OS
-- ============================================================

BEGIN;

-- Criar/substituir function do trigger
CREATE OR REPLACE FUNCTION trigger_gerar_codigo_os()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  tipo_codigo VARCHAR;
BEGIN
  -- Apenas gerar código se codigo_os estiver vazio/null
  IF NEW.codigo_os IS NULL OR NEW.codigo_os = '' THEN
    
    -- Buscar código do tipo_os (2 dígitos)
    SELECT codigo INTO tipo_codigo
    FROM tipos_os
    WHERE id = NEW.tipo_os_id;
    
    -- Validar se tipo_os existe e tem código
    IF tipo_codigo IS NULL OR tipo_codigo = '' THEN
      RAISE EXCEPTION 'Erro: tipo_os_id inválido ou tipo_os sem código definido. Certifique-se de que tipos_os.codigo está preenchido.';
    END IF;
    
    -- Gerar novo código usando a function
    NEW.codigo_os := generate_codigo_os(tipo_codigo);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remover trigger anterior se existir (para evitar duplicação)
DROP TRIGGER IF EXISTS before_insert_gerar_codigo_os ON ordens_servico;

-- Criar trigger BEFORE INSERT
CREATE TRIGGER before_insert_gerar_codigo_os
  BEFORE INSERT ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION trigger_gerar_codigo_os();

-- Adicionar comentário
COMMENT ON TRIGGER before_insert_gerar_codigo_os ON ordens_servico IS 
  'Auto-gera codigo_os ao inserir nova OS se o campo estiver vazio';

COMMIT;

-- ============================================================
-- Teste: Criar OS e verificar código gerado
-- ============================================================
/*
INSERT INTO ordens_servico (
  tipo_os_id,
  cliente_id,
  responsavel_id,
  criado_por_id,
  cc_id,
  status_geral,
  data_entrada
)
SELECT
  (SELECT id FROM tipos_os WHERE codigo = '01' LIMIT 1),
  (SELECT id FROM clientes LIMIT 1),
  (SELECT id FROM colaboradores LIMIT 1),
  (SELECT id FROM colaboradores LIMIT 1),
  (SELECT id FROM centros_custo LIMIT 1),
  'em_triagem',
  NOW()
RETURNING id, codigo_os, tipo_os_id;
-- Deve retornar algo como: codigo_os = 'OS01021225-001'
*/
