-- ============================================================
-- Migration 2: Function para gerar código automático de OS
-- Data: 2025-12-02
-- Descrição: Cria function que gera códigos no padrão OS[Tipo][DDMMYY]-[Seq]
-- Exemplo: OS01021225-001
-- ============================================================

BEGIN;

CREATE OR REPLACE FUNCTION generate_codigo_os(tipo_os_codigo VARCHAR)
RETURNS VARCHAR
LANGUAGE plpgsql
AS $$
DECLARE
  data_hoje TEXT;
  sequencial INTEGER;
  novo_codigo VARCHAR;
BEGIN
  -- Formatar data atual como DDMMYY
  data_hoje := TO_CHAR(CURRENT_DATE, 'DDMMYY');
  
  -- Buscar próximo sequencial do dia para este tipo de OS
  -- O sequencial reinicia todo dia às 00:00
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(codigo_os FROM '\d{3}$') AS INTEGER)
  ), 0) + 1
  INTO sequencial
  FROM ordens_servico
  WHERE codigo_os LIKE 'OS' || tipo_os_codigo || data_hoje || '-%'
    AND DATE(data_entrada) = CURRENT_DATE;
  
  -- Montar código: OS + TipoCodigo + DataDDMMYY + '-' + Sequencial3Digitos
  novo_codigo := 'OS' || tipo_os_codigo || data_hoje || '-' || LPAD(sequencial::TEXT, 3, '0');
  
  RETURN novo_codigo;
END;
$$;

-- Adicionar comentário de documentação
COMMENT ON FUNCTION generate_codigo_os(VARCHAR) IS 
  'Gera código único de OS no padrão OS[Tipo][DDMMYY]-[Seq]. Sequencial reinicia diariamente.';

COMMIT;

-- ============================================================
-- Testes: Executar para validar
-- ============================================================
-- SELECT generate_codigo_os('01'); -- Exemplo: OS01021225-001
-- SELECT generate_codigo_os('02'); -- Exemplo: OS02021225-001
-- SELECT generate_codigo_os('13'); -- Exemplo: OS13021225-001
