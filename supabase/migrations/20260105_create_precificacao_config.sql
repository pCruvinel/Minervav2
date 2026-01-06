-- Tabela de configuração de precificação
CREATE TABLE IF NOT EXISTS precificacao_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_os_codigo TEXT NOT NULL, -- OS-01-04, OS-05-06, etc.
  campo_nome TEXT NOT NULL,     -- percentual_imprevisto, percentual_lucro, percentual_imposto
  valor_padrao NUMERIC(5,2) NOT NULL DEFAULT 0,
  campo_editavel BOOLEAN NOT NULL DEFAULT true,
  ativo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(tipo_os_codigo, campo_nome)
);

-- Tabela de auditoria
CREATE TABLE IF NOT EXISTS precificacao_config_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  config_id UUID NOT NULL REFERENCES precificacao_config(id) ON DELETE CASCADE,
  campo_alterado TEXT NOT NULL,
  valor_anterior TEXT,
  valor_novo TEXT,
  alterado_por_id UUID REFERENCES colaboradores(id),
  alterado_em TIMESTAMPTZ DEFAULT now()
);

-- RLS
ALTER TABLE precificacao_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE precificacao_config_audit ENABLE ROW LEVEL SECURITY;

-- Políticas: admin/diretor pode ler e editar
DROP POLICY IF EXISTS "precificacao_config_read" ON precificacao_config;
CREATE POLICY "precificacao_config_read" ON precificacao_config
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "precificacao_config_update" ON precificacao_config;
CREATE POLICY "precificacao_config_update" ON precificacao_config
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM colaboradores c
      JOIN cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid()
      AND cg.slug IN ('admin', 'diretor', 'diretoria')
    )
  );

DROP POLICY IF EXISTS "precificacao_config_audit_read" ON precificacao_config_audit;
CREATE POLICY "precificacao_config_audit_read" ON precificacao_config_audit
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "precificacao_config_audit_insert" ON precificacao_config_audit;
CREATE POLICY "precificacao_config_audit_insert" ON precificacao_config_audit
  FOR INSERT WITH CHECK (true);

-- Dados iniciais (UPSERT para não duplicar)
INSERT INTO precificacao_config (tipo_os_codigo, campo_nome, valor_padrao, campo_editavel)
VALUES
  ('OS-01-04', 'percentual_imprevisto', 10, true),
  ('OS-01-04', 'percentual_lucro', 40, true),
  ('OS-01-04', 'percentual_imposto', 15, true),
  ('OS-05-06', 'percentual_imposto', 15, true),
  ('OS-05-06', 'percentual_lucro', 40, true),
  ('OS-05-06', 'percentual_imprevisto', 10, true)
ON CONFLICT (tipo_os_codigo, campo_nome) 
DO UPDATE SET 
  valor_padrao = EXCLUDED.valor_padrao,
  campo_editavel = EXCLUDED.campo_editavel;

-- Índices
CREATE INDEX IF NOT EXISTS idx_precificacao_config_tipo ON precificacao_config(tipo_os_codigo);
CREATE INDEX IF NOT EXISTS idx_precificacao_audit_config ON precificacao_config_audit(config_id);
