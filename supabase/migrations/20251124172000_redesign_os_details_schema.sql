-- Migration: Redesign OS Details - Schema Updates
-- Description: Adds new tables and columns for the redesigned OS details page
-- Date: 2025-11-24 17:20:00

-- =====================================================
-- STEP 1: UPDATE EXISTING TABLES
-- =====================================================

-- Add new columns to ordens_servico table
ALTER TABLE ordens_servico
ADD COLUMN IF NOT EXISTS criado_por_id UUID REFERENCES colaboradores(id),
ADD COLUMN IF NOT EXISTS data_abertura TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS status_detalhado JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add new columns to os_etapas table
ALTER TABLE os_etapas
ADD COLUMN IF NOT EXISTS ultima_atualizacao TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS dados_snapshot JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS comentarios_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS documentos_count INTEGER DEFAULT 0;

-- =====================================================
-- STEP 2: CREATE NEW TABLES
-- =====================================================

-- Table: os_comentarios
-- Purpose: Internal chat system for OS comments
CREATE TABLE IF NOT EXISTS os_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES os_etapas(id) ON DELETE SET NULL,
  usuario_id UUID NOT NULL REFERENCES colaboradores(id),
  comentario TEXT NOT NULL,
  tipo VARCHAR(50) DEFAULT 'comentario',
  metadados JSONB DEFAULT '{}',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for os_comentarios
CREATE INDEX IF NOT EXISTS idx_os_comentarios_os_id ON os_comentarios(os_id);
CREATE INDEX IF NOT EXISTS idx_os_comentarios_etapa_id ON os_comentarios(etapa_id);
CREATE INDEX IF NOT EXISTS idx_os_comentarios_criado_em ON os_comentarios(criado_em DESC);

-- RLS for os_comentarios
ALTER TABLE os_comentarios ENABLE ROW LEVEL SECURITY;

-- Policy: Comments visible to involved parties
CREATE POLICY "Comentários visíveis por envolvidos na OS" ON os_comentarios
  FOR ALL USING (
    os_id IN (
      SELECT id FROM ordens_servico
      WHERE responsavel_id = auth.uid() OR criado_por_id = auth.uid()
    )
  );

-- Table: os_atividades
-- Purpose: Complete activity timeline for OS
CREATE TABLE IF NOT EXISTS os_atividades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES os_etapas(id) ON DELETE SET NULL,
  usuario_id UUID NOT NULL REFERENCES colaboradores(id),
  tipo VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  dados_antigos JSONB,
  dados_novos JSONB,
  metadados JSONB DEFAULT '{}',
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for os_atividades
CREATE INDEX IF NOT EXISTS idx_os_atividades_os_id ON os_atividades(os_id);
CREATE INDEX IF NOT EXISTS idx_os_atividades_tipo ON os_atividades(tipo);
CREATE INDEX IF NOT EXISTS idx_os_atividades_criado_em ON os_atividades(criado_em DESC);

-- RLS for os_atividades
ALTER TABLE os_atividades ENABLE ROW LEVEL SECURITY;

-- Policy: Activities visible to involved parties
CREATE POLICY "Atividades visíveis por envolvidos na OS" ON os_atividades
  FOR SELECT USING (
    os_id IN (
      SELECT id FROM ordens_servico
      WHERE responsavel_id = auth.uid() OR criado_por_id = auth.uid()
    )
  );

-- Table: os_documentos
-- Purpose: Intelligent document management for OS
CREATE TABLE IF NOT EXISTS os_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  etapa_id UUID REFERENCES os_etapas(id) ON DELETE SET NULL,
  nome VARCHAR(255) NOT NULL,
  tipo VARCHAR(100),
  caminho_arquivo TEXT NOT NULL,
  tamanho_bytes INTEGER,
  mime_type VARCHAR(100),
  metadados JSONB DEFAULT '{}',
  uploaded_by UUID NOT NULL REFERENCES colaboradores(id),
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for os_documentos
CREATE INDEX IF NOT EXISTS idx_os_documentos_os_id ON os_documentos(os_id);
CREATE INDEX IF NOT EXISTS idx_os_documentos_tipo ON os_documentos(tipo);
CREATE INDEX IF NOT EXISTS idx_os_documentos_criado_em ON os_documentos(criado_em DESC);

-- RLS for os_documentos
ALTER TABLE os_documentos ENABLE ROW LEVEL SECURITY;

-- Policy: Documents visible to involved parties
CREATE POLICY "Documentos visíveis por envolvidos na OS" ON os_documentos
  FOR ALL USING (
    os_id IN (
      SELECT id FROM ordens_servico
      WHERE responsavel_id = auth.uid() OR criado_por_id = auth.uid()
    )
  );

-- Table: os_logs
-- Purpose: Technical audit logs for OS
CREATE TABLE IF NOT EXISTS os_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_id UUID NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES colaboradores(id),
  nivel VARCHAR(20) DEFAULT 'info',
  categoria VARCHAR(100),
  mensagem TEXT NOT NULL,
  dados_contexto JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for os_logs
CREATE INDEX IF NOT EXISTS idx_os_logs_os_id ON os_logs(os_id);
CREATE INDEX IF NOT EXISTS idx_os_logs_nivel ON os_logs(nivel);
CREATE INDEX IF NOT EXISTS idx_os_logs_categoria ON os_logs(categoria);
CREATE INDEX IF NOT EXISTS idx_os_logs_criado_em ON os_logs(criado_em DESC);

-- RLS for os_logs (read-only for authorized users)
ALTER TABLE os_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Logs visible only to managers and admin
CREATE POLICY "Logs visíveis apenas para gestores e admin" ON os_logs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM colaboradores c
      WHERE c.id = auth.uid()
      AND c.cargo_id IN (
        SELECT id FROM cargos WHERE nivel_acesso >= 5
      )
    )
  );

-- =====================================================
-- STEP 3: CREATE VIEWS
-- =====================================================

-- View: os_detalhes_completos
-- Purpose: Complete OS details with all related information
CREATE OR REPLACE VIEW os_detalhes_completos AS
SELECT
  os.*,
  c.nome_razao_social as cliente_nome,
  c.email as cliente_email,
  c.telefone as cliente_telefone,
  c.endereco as cliente_endereco,
  tos.nome as tipo_os_nome,
  resp.nome_completo as responsavel_nome,
  criador.nome_completo as criado_por_nome,
  (
    SELECT COUNT(*) FROM os_comentarios oc
    WHERE oc.os_id = os.id
  ) as comentarios_count,
  (
    SELECT COUNT(*) FROM os_documentos od
    WHERE od.os_id = os.id
  ) as documentos_count,
  (
    SELECT COUNT(*) FROM os_etapas oe
    WHERE oe.os_id = os.id AND oe.status = 'concluida'
  ) as etapas_concluidas_count,
  (
    SELECT COUNT(*) FROM os_etapas oe
    WHERE oe.os_id = os.id
  ) as etapas_total_count
FROM ordens_servico os
LEFT JOIN clientes c ON os.cliente_id = c.id
LEFT JOIN tipos_os tos ON os.tipo_os_id = tos.id
LEFT JOIN colaboradores resp ON os.responsavel_id = resp.id
LEFT JOIN colaboradores criador ON os.criado_por_id = criador.id;

-- =====================================================
-- STEP 4: CREATE FUNCTIONS
-- =====================================================

-- Function: atualizar_contadores_os
-- Purpose: Update comment and document counters
CREATE OR REPLACE FUNCTION atualizar_contadores_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Update comment count
  UPDATE os_etapas
  SET comentarios_count = (
    SELECT COUNT(*) FROM os_comentarios
    WHERE etapa_id = COALESCE(NEW.etapa_id, OLD.etapa_id)
  )
  WHERE id = COALESCE(NEW.etapa_id, OLD.etapa_id);

  -- Update document count
  UPDATE os_etapas
  SET documentos_count = (
    SELECT COUNT(*) FROM os_documentos
    WHERE etapa_id = COALESCE(NEW.etapa_id, OLD.etapa_id)
  )
  WHERE id = COALESCE(NEW.etapa_id, OLD.etapa_id);

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Triggers for counter updates
CREATE OR REPLACE TRIGGER trigger_atualizar_contadores_comentarios
  AFTER INSERT OR UPDATE OR DELETE ON os_comentarios
  FOR EACH ROW EXECUTE FUNCTION atualizar_contadores_os();

CREATE OR REPLACE TRIGGER trigger_atualizar_contadores_documentos
  AFTER INSERT OR UPDATE OR DELETE ON os_documentos
  FOR EACH ROW EXECUTE FUNCTION atualizar_contadores_os();

-- Function: registrar_atividade_os
-- Purpose: Automatically log OS activities
CREATE OR REPLACE FUNCTION registrar_atividade_os(
  p_os_id UUID,
  p_etapa_id UUID DEFAULT NULL,
  p_usuario_id UUID,
  p_tipo VARCHAR(100),
  p_descricao TEXT,
  p_dados_antigos JSONB DEFAULT NULL,
  p_dados_novos JSONB DEFAULT NULL,
  p_metadados JSONB DEFAULT '{}'
)
RETURNS UUID AS $$
DECLARE
  atividade_id UUID;
BEGIN
  INSERT INTO os_atividades (
    os_id, etapa_id, usuario_id, tipo, descricao,
    dados_antigos, dados_novos, metadados
  ) VALUES (
    p_os_id, p_etapa_id, p_usuario_id, p_tipo, p_descricao,
    p_dados_antigos, p_dados_novos, p_metadados
  )
  RETURNING id INTO atividade_id;

  RETURN atividade_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- STEP 5: INSERT INITIAL DATA
-- =====================================================

-- Insert sample data for testing (optional - remove in production)
-- This will be populated by the application

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

-- Add comment to track migration
COMMENT ON TABLE os_comentarios IS 'Sistema de comentários internos da OS - Parte do redesign 2025';
COMMENT ON TABLE os_atividades IS 'Timeline completa de atividades da OS - Parte do redesign 2025';
COMMENT ON TABLE os_documentos IS 'Gestão inteligente de documentos da OS - Parte do redesign 2025';
COMMENT ON TABLE os_logs IS 'Logs técnicos de auditoria da OS - Parte do redesign 2025';