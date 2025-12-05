-- ============================================================
-- Migration 008: Arquitetura OS Pai/Filha (Contrato/Satélite)
-- Data: 2025-12-04
-- Descrição: Implementa estruturas para suportar hierarquia de OS
--            - Flags de contrato na tabela mestre
--            - Refatoração de os_requisition_items para vínculo direto com OS
--            - Nova tabela de vagas para OS-10 (RH)
-- ============================================================

BEGIN;

-- ============================================================
-- PASSO 1: Ajuste na Tabela Mestre (ordens_servico)
-- Adiciona flags para identificar contratos ativos e dados públicos
-- ============================================================

ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS is_contract_active boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS dados_publicos jsonb DEFAULT '{}'::jsonb;

COMMENT ON COLUMN public.ordens_servico.is_contract_active IS 
  'Indica se esta OS é um contrato faturável (OS-12, OS-13). Usado para distinguir contratos de leads.';

COMMENT ON COLUMN public.ordens_servico.dados_publicos IS 
  'Dados públicos para formulários externos (OS-07). Estrutura livre em JSON.';

-- ============================================================
-- PASSO 2: Refatoração da Tabela de Itens (os_requisition_items)
-- Permite vincular itens diretamente a uma OS (além de etapas)
-- ============================================================

-- 2.1 Adicionar coluna os_id (nullable FK para ordens_servico)
ALTER TABLE public.os_requisition_items
ADD COLUMN IF NOT EXISTS os_id uuid REFERENCES public.ordens_servico(id) ON DELETE CASCADE;

-- 2.2 Alterar os_etapa_id para nullable (antes era NOT NULL)
ALTER TABLE public.os_requisition_items
ALTER COLUMN os_etapa_id DROP NOT NULL;

-- 2.3 Adicionar constraint CHECK para garantir pelo menos um vínculo
-- (ou os_id OU os_etapa_id deve estar preenchido)
ALTER TABLE public.os_requisition_items
DROP CONSTRAINT IF EXISTS chk_requisition_item_vinculo;

ALTER TABLE public.os_requisition_items
ADD CONSTRAINT chk_requisition_item_vinculo 
CHECK (os_id IS NOT NULL OR os_etapa_id IS NOT NULL);

-- 2.4 Criar índice para os_id
CREATE INDEX IF NOT EXISTS idx_requisition_items_os ON public.os_requisition_items(os_id);

COMMENT ON COLUMN public.os_requisition_items.os_id IS 
  'Vínculo direto com OS (para OS-09 satélite). Alternativo ao vínculo via os_etapa_id.';

-- ============================================================
-- PASSO 3: Criação da Tabela de Vagas (os_vagas_recrutamento)
-- Para OS-10 (Requisição de Mão de Obra)
-- ============================================================

CREATE TABLE IF NOT EXISTS public.os_vagas_recrutamento (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  os_id uuid NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  
  -- Detalhes da vaga
  cargo_funcao text NOT NULL,
  quantidade integer DEFAULT 1 CHECK (quantidade > 0),
  salario_base numeric(12, 2),
  
  -- Requisitos
  habilidades_necessarias text,
  perfil_comportamental text,
  experiencia_minima text,
  escolaridade_minima text,
  
  -- Status e controle
  status text DEFAULT 'aberta' CHECK (status IN ('aberta', 'em_selecao', 'preenchida', 'cancelada')),
  urgencia text DEFAULT 'normal' CHECK (urgencia IN ('baixa', 'normal', 'alta', 'critica')),
  
  -- Datas
  data_limite_contratacao date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_vagas_os ON public.os_vagas_recrutamento(os_id);
CREATE INDEX IF NOT EXISTS idx_vagas_status ON public.os_vagas_recrutamento(status);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_vagas_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_os_vagas_updated_at ON public.os_vagas_recrutamento;
CREATE TRIGGER update_os_vagas_updated_at
  BEFORE UPDATE ON public.os_vagas_recrutamento
  FOR EACH ROW
  EXECUTE FUNCTION update_vagas_updated_at();

-- Comentários descritivos
COMMENT ON TABLE public.os_vagas_recrutamento IS 
  'Vagas de recrutamento vinculadas à OS-10 (Requisição de Mão de Obra).';

COMMENT ON COLUMN public.os_vagas_recrutamento.os_id IS 
  'Vínculo com a OS-10 (satélite de RH). FK para ordens_servico.';

COMMENT ON COLUMN public.os_vagas_recrutamento.cargo_funcao IS 
  'Nome do cargo ou função. Ex: Pedreiro, Servente, Mestre de Obras.';

COMMIT;
