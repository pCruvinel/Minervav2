-- ============================================================
-- Migration: Criar tabela os_atividades para log de ações
-- Data: 2025-12-05
-- Descrição: Registra atividades realizadas em ordens de serviço
-- ============================================================

BEGIN;

-- Criar tabela de atividades de OS
CREATE TABLE IF NOT EXISTS os_atividades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id uuid NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  usuario_id uuid REFERENCES colaboradores(id),
  tipo_atividade text NOT NULL,
  descricao text,
  dados_adicionais jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_os_atividades_os_id ON os_atividades(os_id);
CREATE INDEX IF NOT EXISTS idx_os_atividades_usuario_id ON os_atividades(usuario_id);
CREATE INDEX IF NOT EXISTS idx_os_atividades_created_at ON os_atividades(created_at DESC);

-- Comentário
COMMENT ON TABLE os_atividades IS 'Log de atividades realizadas em ordens de serviço';

-- Habilitar RLS
ALTER TABLE os_atividades ENABLE ROW LEVEL SECURITY;

-- Policy: Usuários autenticados podem ver todas as atividades
CREATE POLICY "Usuarios autenticados podem ver atividades"
  ON os_atividades
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Usuários autenticados podem inserir atividades
CREATE POLICY "Usuarios autenticados podem inserir atividades"
  ON os_atividades
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

COMMIT;
