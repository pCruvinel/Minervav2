-- =============================================================================
-- MIGRATION: Seed Centros de Custo Fixos de Sistema
-- Data: 2026-03-05
-- Objetivo: Criar os 3 CCs fixos que representam custos administrativos
-- Regra: Colaboradores "sem divisão" alocam 100% em seu CC fixo
-- =============================================================================

-- 1. Inserir CCs fixos de sistema (idempotente)
INSERT INTO public.centros_custo (nome, tipo, is_sistema, ativo, descricao, created_at, updated_at)
VALUES 
  ('CC-ESCRITORIO', 'fixo', true, true, 'Centro de custo fixo — Escritório / Administrativo / Diretoria', now(), now()),
  ('CC-SETOR_OBRAS', 'fixo', true, true, 'Centro de custo fixo — Setor de Obras (coordenação)', now(), now()),
  ('CC-SETOR_ASSESSORIA', 'fixo', true, true, 'Centro de custo fixo — Setor de Assessoria Técnica (coordenação)', now(), now())
ON CONFLICT (nome) DO NOTHING;

-- 2. Adicionar colunas de abono à tabela registros_presenca (Passo 5 preparação)
ALTER TABLE public.registros_presenca
ADD COLUMN IF NOT EXISTS abono_anexo_url text,
ADD COLUMN IF NOT EXISTS abono_editado_por uuid REFERENCES public.colaboradores(id),
ADD COLUMN IF NOT EXISTS abono_editado_em timestamptz;

COMMENT ON COLUMN public.registros_presenca.abono_anexo_url IS 'URL do anexo (ex: atestado médico) associado ao abono de falta';
COMMENT ON COLUMN public.registros_presenca.abono_editado_por IS 'ID do colaborador (diretoria) que editou/reverteu o abono';
COMMENT ON COLUMN public.registros_presenca.abono_editado_em IS 'Timestamp de quando o abono foi editado/revertido';

-- 3. Migrar valores existentes de rateio_fixo para códigos padronizados
UPDATE public.colaboradores SET rateio_fixo = 'CC-ESCRITORIO' 
WHERE rateio_fixo IN ('Escritorio', 'Escritório', 'escritorio');

UPDATE public.colaboradores SET rateio_fixo = 'CC-SETOR_OBRAS' 
WHERE rateio_fixo IN ('Setor Obras', 'Setor de Obras', 'setor obras');

UPDATE public.colaboradores SET rateio_fixo = 'CC-SETOR_ASSESSORIA' 
WHERE rateio_fixo IN ('Setor Assessoria Tecnica', 'Setor Assessoria', 'Setor Assessoria Técnica', 'setor assessoria');

-- 4. Popular rateio_fixo_id com FK para centros_custo.id
UPDATE public.colaboradores c
SET rateio_fixo_id = cc.id
FROM public.centros_custo cc
WHERE cc.nome = c.rateio_fixo 
  AND cc.is_sistema = true
  AND c.rateio_fixo IS NOT NULL
  AND c.rateio_fixo_id IS NULL;

-- =============================================================================
-- FIM DA MIGRATION
-- =============================================================================
