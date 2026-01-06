-- Migration: allow_same_step_transfers.sql
-- Descrição: Remove a constraint que impede transferências na mesma etapa
-- Necessário para o fluxo de Solicitação de Aprovação (9->9) onde muda o responsável mas não a etapa.

ALTER TABLE os_transferencias
DROP CONSTRAINT IF EXISTS chk_etapas_diferentes;

-- Opcional: Adicionar comentário explicando
COMMENT ON TABLE os_transferencias IS 'Tabela de histórico de transferências entre setores (permite mesma etapa)';
