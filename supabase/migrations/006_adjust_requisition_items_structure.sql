-- ============================================================
-- Migration 6: Ajustar estrutura de os_requisition_items
-- Data: 2025-12-04
-- Descrição: Remover campos de endereço e prazo (movidos para nível da OS)
-- ============================================================

BEGIN;

-- Remover campos de endereço de entrega (agora são da OS, não do item)
ALTER TABLE os_requisition_items
  DROP COLUMN IF EXISTS cep,
  DROP COLUMN IF EXISTS logradouro,
  DROP COLUMN IF EXISTS numero,
  DROP COLUMN IF EXISTS complemento,
  DROP COLUMN IF EXISTS bairro,
  DROP COLUMN IF EXISTS cidade,
  DROP COLUMN IF EXISTS uf;

-- Remover campo de prazo (agora é da OS, não do item)
ALTER TABLE os_requisition_items
  DROP COLUMN IF EXISTS prazo_necessidade;

-- Remover tipo ENUM de prazo (não será mais usado)
DROP TYPE IF EXISTS prazo_necessidade;

-- Observação: o campo observacao permanece pois é específico de cada item

COMMIT;
