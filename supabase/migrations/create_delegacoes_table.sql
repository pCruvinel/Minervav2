-- ==========================================
-- MIGRATION: Criar Tabela de Delegações
-- Data: 18/11/2025
-- Descrição: Tabela para gerenciar delegações de tarefas em Ordens de Serviço
-- ==========================================

-- 1. Criar ENUM para status de delegação
DO $$ BEGIN
    CREATE TYPE delegacao_status AS ENUM (
        'PENDENTE',
        'EM_PROGRESSO',
        'CONCLUIDA',
        'REPROVADA'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. Criar tabela delegacoes
CREATE TABLE IF NOT EXISTS delegacoes (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Referências (Foreign Keys)
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  delegante_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,
  delegado_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE RESTRICT,

  -- Dados da delegação
  status_delegacao delegacao_status NOT NULL DEFAULT 'PENDENTE',
  descricao_tarefa TEXT NOT NULL,
  observacoes TEXT,
  data_prazo DATE,

  -- Metadados (desnormalizados para performance)
  delegante_nome TEXT NOT NULL,
  delegado_nome TEXT NOT NULL,

  -- Constraints de integridade
  CONSTRAINT delegacoes_no_self_delegation CHECK (delegante_id != delegado_id),
  CONSTRAINT delegacoes_descricao_min_length CHECK (char_length(descricao_tarefa) >= 10),
  CONSTRAINT delegacoes_nomes_not_empty CHECK (
    char_length(delegante_nome) > 0 AND
    char_length(delegado_nome) > 0
  )
);

-- 3. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_delegacoes_os_id
  ON delegacoes(os_id);

CREATE INDEX IF NOT EXISTS idx_delegacoes_delegado_id
  ON delegacoes(delegado_id);

CREATE INDEX IF NOT EXISTS idx_delegacoes_delegante_id
  ON delegacoes(delegante_id);

CREATE INDEX IF NOT EXISTS idx_delegacoes_status
  ON delegacoes(status_delegacao);

CREATE INDEX IF NOT EXISTS idx_delegacoes_created_at
  ON delegacoes(created_at DESC);

-- 4. Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_delegacoes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_delegacoes_updated_at ON delegacoes;

CREATE TRIGGER trigger_update_delegacoes_updated_at
    BEFORE UPDATE ON delegacoes
    FOR EACH ROW
    EXECUTE FUNCTION update_delegacoes_updated_at();

-- 5. Habilitar Row Level Security (RLS)
ALTER TABLE delegacoes ENABLE ROW LEVEL SECURITY;

-- 6. Políticas RLS

-- Policy 1: Delegante e delegado podem visualizar suas delegações
DROP POLICY IF EXISTS "delegacao_view_own" ON delegacoes;
CREATE POLICY "delegacao_view_own"
ON delegacoes FOR SELECT
USING (
  auth.uid() = delegante_id OR
  auth.uid() = delegado_id
);

-- Policy 2: Diretoria pode visualizar todas as delegações
DROP POLICY IF EXISTS "delegacao_view_diretoria" ON delegacoes;
CREATE POLICY "delegacao_view_diretoria"
ON delegacoes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'DIRETORIA'
  )
);

-- Policy 3: Apenas gestores+ podem criar delegações
DROP POLICY IF EXISTS "delegacao_create_managers" ON delegacoes;
CREATE POLICY "delegacao_create_managers"
ON delegacoes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS', 'DIRETORIA')
  )
);

-- Policy 4: Delegante pode atualizar suas delegações
DROP POLICY IF EXISTS "delegacao_update_delegante" ON delegacoes;
CREATE POLICY "delegacao_update_delegante"
ON delegacoes FOR UPDATE
USING (auth.uid() = delegante_id);

-- Policy 5: Delegado pode atualizar status e observações
DROP POLICY IF EXISTS "delegacao_update_delegado" ON delegacoes;
CREATE POLICY "delegacao_update_delegado"
ON delegacoes FOR UPDATE
USING (auth.uid() = delegado_id)
WITH CHECK (
  -- Delegado só pode mudar status e observações
  OLD.os_id = NEW.os_id AND
  OLD.delegante_id = NEW.delegante_id AND
  OLD.delegado_id = NEW.delegado_id AND
  OLD.descricao_tarefa = NEW.descricao_tarefa AND
  OLD.data_prazo = NEW.data_prazo
);

-- Policy 6: Diretoria pode atualizar todas as delegações
DROP POLICY IF EXISTS "delegacao_update_diretoria" ON delegacoes;
CREATE POLICY "delegacao_update_diretoria"
ON delegacoes FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'DIRETORIA'
  )
);

-- Policy 7: Delegante pode deletar suas delegações (apenas se PENDENTE)
DROP POLICY IF EXISTS "delegacao_delete_delegante" ON delegacoes;
CREATE POLICY "delegacao_delete_delegante"
ON delegacoes FOR DELETE
USING (
  auth.uid() = delegante_id AND
  status_delegacao = 'PENDENTE'
);

-- 7. Comentários para documentação
COMMENT ON TABLE delegacoes IS 'Tabela de delegações de tarefas em Ordens de Serviço';
COMMENT ON COLUMN delegacoes.os_id IS 'ID da Ordem de Serviço delegada';
COMMENT ON COLUMN delegacoes.delegante_id IS 'ID do colaborador que delegou (gestor)';
COMMENT ON COLUMN delegacoes.delegado_id IS 'ID do colaborador que recebeu a delegação';
COMMENT ON COLUMN delegacoes.status_delegacao IS 'Status atual da delegação (PENDENTE, EM_PROGRESSO, CONCLUIDA, REPROVADA)';
COMMENT ON COLUMN delegacoes.descricao_tarefa IS 'Descrição detalhada da tarefa delegada (mínimo 10 caracteres)';
COMMENT ON COLUMN delegacoes.observacoes IS 'Observações adicionais sobre a delegação';
COMMENT ON COLUMN delegacoes.data_prazo IS 'Data limite para conclusão da tarefa';
COMMENT ON COLUMN delegacoes.delegante_nome IS 'Nome do delegante (cache para performance)';
COMMENT ON COLUMN delegacoes.delegado_nome IS 'Nome do delegado (cache para performance)';

-- 8. Grant de permissões
GRANT SELECT, INSERT, UPDATE, DELETE ON delegacoes TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ==========================================
-- FIM DA MIGRATION
-- ==========================================
