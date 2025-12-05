-- ============================================================================
-- Migration: Adicionar responsavel_id à tabela agendamentos
-- Objetivo: Separar criado_por (audit) de responsavel_id (executor/dono da agenda)
-- Data: 2025-12-05
-- ============================================================================

-- 1. Adicionar coluna responsavel_id (FK para colaboradores)
ALTER TABLE public.agendamentos 
ADD COLUMN IF NOT EXISTS responsavel_id UUID REFERENCES public.colaboradores(id);

-- 2. Migrar dados existentes: responsavel_id = criado_por (backward compatibility)
UPDATE public.agendamentos 
SET responsavel_id = criado_por 
WHERE responsavel_id IS NULL AND criado_por IS NOT NULL;

-- 3. Criar índice para buscas por responsável (performance)
CREATE INDEX IF NOT EXISTS idx_agendamentos_responsavel_id 
ON public.agendamentos(responsavel_id);

-- 4. Adicionar comentários semânticos para documentação
COMMENT ON COLUMN public.agendamentos.responsavel_id IS 'Colaborador responsável pela execução (dono da agenda que será bloqueada)';
COMMENT ON COLUMN public.agendamentos.criado_por IS 'Colaborador que criou o agendamento (audit/rastreabilidade)';
