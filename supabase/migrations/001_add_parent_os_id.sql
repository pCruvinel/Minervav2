-- ============================================================
-- Migration 1: Adicionar campo parent_os_id
-- Data: 2025-12-02
-- Descrição: Adiciona suporte para relacionamentos hierárquicos entre OSs
-- ============================================================

BEGIN;

-- Adicionar coluna parent_os_id
ALTER TABLE ordens_servico
  ADD COLUMN IF NOT EXISTS parent_os_id UUID REFERENCES ordens_servico(id) ON DELETE SET NULL;

-- Índice para performance em queries de hierarquia
CREATE INDEX IF NOT EXISTS idx_os_parent ON ordens_servico(parent_os_id);

-- Comentário de documentação
COMMENT ON COLUMN ordens_servico.parent_os_id IS 
  'ID da OS origem/pai. Exemplo: OS-02 (Assessoria Lead) gera OS-13 (Contrato Start), então OS-13.parent_os_id = id da OS-02';

COMMIT;

-- ============================================================
-- Verificação: Executar após aplicar migration
-- ============================================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'ordens_servico' AND column_name = 'parent_os_id';
