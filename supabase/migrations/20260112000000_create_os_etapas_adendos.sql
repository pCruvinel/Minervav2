-- Migration: Create os_etapas_adendos table
-- Description: Sistema de adendos (append-only) para complementar dados de etapas concluídas
-- Date: 2026-01-12

-- Nova tabela para adendos (imutável após inserção)
CREATE TABLE IF NOT EXISTS os_etapas_adendos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relacionamento com a etapa
  etapa_id uuid NOT NULL REFERENCES os_etapas(id) ON DELETE CASCADE,
  
  -- Qual campo está sendo complementado (ex: 'motivoProcura', 'observacoes')
  campo_referencia text NOT NULL,
  
  -- Conteúdo do adendo
  conteudo text NOT NULL,
  
  -- Auditoria
  criado_por_id uuid NOT NULL REFERENCES colaboradores(id),
  criado_em timestamptz NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT adendo_conteudo_not_empty CHECK (length(trim(conteudo)) > 0)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_os_etapas_adendos_etapa_id ON os_etapas_adendos(etapa_id);
CREATE INDEX IF NOT EXISTS idx_os_etapas_adendos_campo ON os_etapas_adendos(etapa_id, campo_referencia);
CREATE INDEX IF NOT EXISTS idx_os_etapas_adendos_criado_em ON os_etapas_adendos(criado_em DESC);

-- Comentários
COMMENT ON TABLE os_etapas_adendos IS 'Adendos (complementos) append-only para dados de etapas já concluídas';
COMMENT ON COLUMN os_etapas_adendos.campo_referencia IS 'Chave do campo que está sendo complementado (ex: motivoProcura)';
COMMENT ON COLUMN os_etapas_adendos.conteudo IS 'Texto do adendo - imutável após inserção';

-- Row Level Security
ALTER TABLE os_etapas_adendos ENABLE ROW LEVEL SECURITY;

-- Policy: Todos autenticados podem ver adendos
CREATE POLICY "adendos_select_authenticated" ON os_etapas_adendos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Colaboradores podem adicionar adendos
CREATE POLICY "adendos_insert_authenticated" ON os_etapas_adendos
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Verificar se o usuário logado é o criador
    auth.uid()::text = criado_por_id::text
    OR 
    -- OU se o criado_por_id é o colaborador.id do usuário logado
    EXISTS (
      SELECT 1 FROM colaboradores c 
      WHERE c.id = criado_por_id 
      AND c.auth_user_id = auth.uid()
    )
  );

-- IMPORTANTE: NÃO criar policies de UPDATE ou DELETE
-- Isso garante que adendos são IMUTÁVEIS após inserção (append-only)
