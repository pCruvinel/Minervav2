-- ============================================================================
-- MIGRATION: Criar Tabela de Delegações
-- ============================================================================
-- Descrição: Tabela para armazenar histórico de delegações de responsabilidade
--            entre etapas de workflow quando há troca de cargo/setor.
-- Data: 2025-12-05
-- Autor: Minerva ERP
-- ============================================================================

-- 1. Criar tabela de delegações
CREATE TABLE IF NOT EXISTS delegacoes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    
    -- Referências
    os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    delegante_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE SET NULL,
    delegado_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE SET NULL,
    
    -- Dados da delegação
    descricao_tarefa TEXT NOT NULL,
    observacoes TEXT,
    data_prazo DATE,
    
    -- Status: 'pendente', 'aceita', 'em_progresso', 'concluida', 'reprovada'
    status_delegacao TEXT DEFAULT 'aceita' NOT NULL,
    
    -- Metadados
    created_by UUID REFERENCES auth.users(id),
    
    -- Constraint para garantir que delegante != delegado
    CONSTRAINT delegacao_nao_pode_ser_para_si_mesmo CHECK (delegante_id != delegado_id)
);

-- 2. Índices para performance
CREATE INDEX IF NOT EXISTS idx_delegacoes_os_id ON delegacoes(os_id);
CREATE INDEX IF NOT EXISTS idx_delegacoes_delegante_id ON delegacoes(delegante_id);
CREATE INDEX IF NOT EXISTS idx_delegacoes_delegado_id ON delegacoes(delegado_id);
CREATE INDEX IF NOT EXISTS idx_delegacoes_status ON delegacoes(status_delegacao);
CREATE INDEX IF NOT EXISTS idx_delegacoes_created_at ON delegacoes(created_at DESC);

-- 3. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_delegacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_delegacoes_updated_at ON delegacoes;
CREATE TRIGGER trigger_delegacoes_updated_at
    BEFORE UPDATE ON delegacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_delegacoes_updated_at();

-- 4. Row Level Security (RLS)
ALTER TABLE delegacoes ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ver delegações
CREATE POLICY "delegacoes_select_policy" ON delegacoes
    FOR SELECT
    USING (
        auth.uid() IS NOT NULL
    );

-- Policy: Inserir delegações (qualquer usuário autenticado)
CREATE POLICY "delegacoes_insert_policy" ON delegacoes
    FOR INSERT
    WITH CHECK (
        auth.uid() IS NOT NULL
    );

-- Policy: Atualizar delegações (delegante ou delegado)
CREATE POLICY "delegacoes_update_policy" ON delegacoes
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM colaboradores c
            WHERE c.user_id = auth.uid()
            AND (c.id = delegacoes.delegante_id OR c.id = delegacoes.delegado_id)
        )
    );

-- 5. Comentários para documentação
COMMENT ON TABLE delegacoes IS 'Histórico de delegações de responsabilidade entre etapas de OS';
COMMENT ON COLUMN delegacoes.os_id IS 'OS à qual a delegação pertence';
COMMENT ON COLUMN delegacoes.delegante_id IS 'Colaborador que delegou a tarefa';
COMMENT ON COLUMN delegacoes.delegado_id IS 'Colaborador que recebeu a delegação';
COMMENT ON COLUMN delegacoes.status_delegacao IS 'Status: pendente, aceita, em_progresso, concluida, reprovada';

-- 6. Grant permissions
GRANT ALL ON delegacoes TO authenticated;
GRANT ALL ON delegacoes TO service_role;

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================
