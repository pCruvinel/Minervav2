-- Migration: Adicionar campos de confirmação em registros_presenca
-- Data: 2025-12-03
-- Descrição: Implementar rastreamento de confirmação de presença com auditoria

-- Adicionar coluna confirmed_at (timestamp de confirmação)
ALTER TABLE public.registros_presenca
ADD COLUMN IF NOT EXISTS confirmed_at timestamp NULL,
ADD COLUMN IF NOT EXISTS confirmed_by uuid NULL REFERENCES public.colaboradores(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS confirmed_changes jsonb NULL;

-- Criar índice para performance em queries de confirmação
CREATE INDEX IF NOT EXISTS idx_registros_presenca_confirmed_at 
ON public.registros_presenca(confirmed_at DESC);

CREATE INDEX IF NOT EXISTS idx_registros_presenca_data_confirmed 
ON public.registros_presenca(data, confirmed_at DESC);

-- Comentários para documentação
COMMENT ON COLUMN public.registros_presenca.confirmed_at IS 'Timestamp de quando o registro de presença foi confirmado';
COMMENT ON COLUMN public.registros_presenca.confirmed_by IS 'ID do colaborador que confirmou o registro';
COMMENT ON COLUMN public.registros_presenca.confirmed_changes IS 'JSON com histórico de mudanças após confirmação (auditoria)';

-- Log de execução
SELECT format(
  'Migration executada com sucesso - %s - Campos de confirmação adicionados',
  NOW()::text
);
