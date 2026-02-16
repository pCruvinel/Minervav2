-- ============================================================
-- Migration: Pagadores Conhecidos & Auto-Match de Clientes
-- Cria tabela de mapeamento de pagadores terceiros e adiciona
-- campos de vínculo em lancamentos_bancarios.
-- ============================================================

-- 1. Nova tabela: cliente_pagadores_conhecidos
-- Mapeia CPF/CNPJ de pagadores terceiros → clientes do sistema.
-- Quando um sócio (CPF X) paga um boleto da empresa (CNPJ Y),
-- o operador vincula X→Y e o sistema "aprende" para o futuro.
CREATE TABLE IF NOT EXISTS cliente_pagadores_conhecidos (
  id             UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cliente_id     UUID NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  documento      TEXT NOT NULL,           -- CPF/CNPJ do pagador terceiro (normalizado)
  nome_pagador   TEXT,                    -- Nome do pagador (para exibição)
  relacao        TEXT DEFAULT 'terceiro', -- 'titular' | 'socio' | 'familiar' | 'terceiro'
  criado_por_id  UUID REFERENCES colaboradores(id),
  criado_em      TIMESTAMPTZ DEFAULT now(),
  observacoes    TEXT,
  
  UNIQUE(documento)  -- Um documento mapeia para UM cliente
);

-- 2. Novos campos em lancamentos_bancarios
ALTER TABLE lancamentos_bancarios
  ADD COLUMN IF NOT EXISTS cliente_id UUID REFERENCES clientes(id),
  ADD COLUMN IF NOT EXISTS match_type TEXT,
  ADD COLUMN IF NOT EXISTS vinculado_por_id UUID REFERENCES colaboradores(id),
  ADD COLUMN IF NOT EXISTS vinculado_em TIMESTAMPTZ;

-- Validar match_type
ALTER TABLE lancamentos_bancarios
  DROP CONSTRAINT IF EXISTS chk_match_type;
ALTER TABLE lancamentos_bancarios
  ADD CONSTRAINT chk_match_type
  CHECK (match_type IS NULL OR match_type IN ('auto_direto', 'auto_terceiro', 'manual'));

-- 3. Índices para performance
CREATE INDEX IF NOT EXISTS idx_pagadores_conhecidos_documento 
  ON cliente_pagadores_conhecidos(documento);

CREATE INDEX IF NOT EXISTS idx_pagadores_conhecidos_cliente_id 
  ON cliente_pagadores_conhecidos(cliente_id);

CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente_id 
  ON lancamentos_bancarios(cliente_id);

CREATE INDEX IF NOT EXISTS idx_lancamentos_contraparte_doc 
  ON lancamentos_bancarios(contraparte_documento)
  WHERE contraparte_documento IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lancamentos_sem_vinculo
  ON lancamentos_bancarios(contraparte_documento)
  WHERE cliente_id IS NULL AND contraparte_documento IS NOT NULL;

-- 4. RLS para cliente_pagadores_conhecidos
ALTER TABLE cliente_pagadores_conhecidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow authenticated full access on pagadores_conhecidos" 
  ON cliente_pagadores_conhecidos;
CREATE POLICY "Allow authenticated full access on pagadores_conhecidos" 
  ON cliente_pagadores_conhecidos 
  FOR ALL 
  USING (auth.role() = 'authenticated');

-- 5. Comentários de documentação
COMMENT ON TABLE cliente_pagadores_conhecidos IS 
  'Mapeia CPF/CNPJ de pagadores terceiros para clientes do sistema. Usado para auto-match em conciliação bancária.';
COMMENT ON COLUMN cliente_pagadores_conhecidos.documento IS 
  'CPF ou CNPJ do pagador terceiro (só números). Ex: sócio que paga boleto da empresa.';
COMMENT ON COLUMN cliente_pagadores_conhecidos.relacao IS 
  'Tipo de relação: titular, socio, familiar, terceiro';
COMMENT ON COLUMN lancamentos_bancarios.cliente_id IS 
  'Cliente vinculado à transação (direto ou via pagador terceiro)';
COMMENT ON COLUMN lancamentos_bancarios.match_type IS 
  'Tipo de match: auto_direto (cpf_cnpj do cliente), auto_terceiro (pagador conhecido), manual (operador), null (sem match)';
