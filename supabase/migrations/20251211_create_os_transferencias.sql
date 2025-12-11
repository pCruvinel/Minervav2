-- ============================================================================
-- MIGRATION: Sistema de Transferência Automática de Setor
-- Data: 2025-12-11
-- Descrição: Cria infraestrutura para transferência automática de setor entre
--            etapas de OS, substituindo o sistema manual de delegação.
-- ============================================================================

BEGIN;

-- ============================================================================
-- PARTE 1: TABELA DE TRANSFERÊNCIAS DE SETOR
-- Registra histórico de todas as transferências entre setores
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.os_transferencias (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Referências principais
  os_id uuid NOT NULL REFERENCES public.ordens_servico(id) ON DELETE CASCADE,
  
  -- Etapas (número, não FK para permitir flexibilidade)
  etapa_origem integer NOT NULL,
  etapa_destino integer NOT NULL,
  
  -- Setores envolvidos
  setor_origem_id uuid REFERENCES public.setores(id),
  setor_destino_id uuid REFERENCES public.setores(id),
  
  -- Quem executou a transferência
  transferido_por_id uuid NOT NULL REFERENCES public.colaboradores(id),
  
  -- Coordenador notificado
  coordenador_notificado_id uuid REFERENCES public.colaboradores(id),
  
  -- Metadados
  transferido_em timestamptz DEFAULT now() NOT NULL,
  motivo text DEFAULT 'avanço_etapa' CHECK (motivo IN ('avanço_etapa', 'retorno_etapa', 'manual')),
  metadados jsonb DEFAULT '{}'::jsonb,
  
  -- Constraint: etapa destino deve ser diferente da origem
  CONSTRAINT chk_etapas_diferentes CHECK (etapa_origem != etapa_destino)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_os_transferencias_os_id ON public.os_transferencias(os_id);
CREATE INDEX IF NOT EXISTS idx_os_transferencias_setor_destino ON public.os_transferencias(setor_destino_id);
CREATE INDEX IF NOT EXISTS idx_os_transferencias_transferido_em ON public.os_transferencias(transferido_em DESC);

-- Comentários
COMMENT ON TABLE public.os_transferencias IS 
  'Histórico de transferências de setor entre etapas de OS (substitui delegações manuais)';
COMMENT ON COLUMN public.os_transferencias.motivo IS 
  'Motivo da transferência: avanço_etapa (normal), retorno_etapa (retrabalho), manual (exceção)';

-- ============================================================================
-- PARTE 2: NOVOS CAMPOS EM ORDENS_SERVICO
-- Adiciona campos para rastrear setor atual e solicitante
-- ============================================================================

-- Campo: Setor que atualmente tem responsabilidade sobre a OS
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS setor_atual_id uuid REFERENCES public.setores(id);

-- Campo: Setor que solicitou a OS (importante para OS-09 e OS-10)
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS setor_solicitante_id uuid REFERENCES public.setores(id);

-- Campo: Ordem da etapa atual (duplica info para queries mais simples)
ALTER TABLE public.ordens_servico 
ADD COLUMN IF NOT EXISTS etapa_atual_ordem integer DEFAULT 1;

-- Índice para filtrar OS por setor atual
CREATE INDEX IF NOT EXISTS idx_ordens_servico_setor_atual ON public.ordens_servico(setor_atual_id);

-- Comentários
COMMENT ON COLUMN public.ordens_servico.setor_atual_id IS 
  'Setor que atualmente tem responsabilidade sobre a OS (calculado com base na etapa)';
COMMENT ON COLUMN public.ordens_servico.setor_solicitante_id IS 
  'Setor que originou/solicitou a OS (usado para notificações quando OS filha é concluída)';
COMMENT ON COLUMN public.ordens_servico.etapa_atual_ordem IS 
  'Número da etapa atual para queries rápidas (sincronizado via trigger)';

-- ============================================================================
-- PARTE 3: RLS POLICIES
-- ============================================================================

ALTER TABLE public.os_transferencias ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ver transferências
CREATE POLICY "Usuarios autenticados podem ver transferencias"
  ON public.os_transferencias
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Usuários autenticados podem inserir transferências
CREATE POLICY "Usuarios autenticados podem inserir transferencias"
  ON public.os_transferencias
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- ============================================================================
-- PARTE 4: GRANTS
-- ============================================================================

GRANT SELECT, INSERT ON public.os_transferencias TO authenticated;
GRANT ALL ON public.os_transferencias TO service_role;

-- ============================================================================
-- PARTE 5: DEPRECAR TABELA DELEGACOES (Comentário)
-- ============================================================================

COMMENT ON TABLE public.delegacoes IS 
  '[DEPRECATED 2025-12-11] Substituída por os_transferencias. Manter para histórico.';

COMMIT;
