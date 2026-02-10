-- Migration: 20260202160000_fix_lancamentos_data.sql
-- Description: Change data column type from DATE to TIMESTAMPTZ in lancamentos_bancarios table

-- 1. Alter column type (using USING to convert existing dates to timestamp at start of day)
ALTER TABLE lancamentos_bancarios
ALTER COLUMN data TYPE TIMESTAMPTZ USING data::TIMESTAMPTZ;

-- 2. Update existing comment or add one
COMMENT ON COLUMN lancamentos_bancarios.data IS 'Data e hora da transação (TIMESTAMPTZ)';
