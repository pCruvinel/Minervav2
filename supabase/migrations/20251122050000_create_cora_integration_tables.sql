-- =====================================================
-- Migration: Tabelas para Integração Banco Cora
-- Criado em: 2025-11-22
-- Descrição: Cria tabelas para armazenar boletos e eventos webhook do Banco Cora
-- =====================================================

-- Tabela: cora_boletos
-- Armazena informações de boletos emitidos via Banco Cora
CREATE TABLE IF NOT EXISTS cora_boletos (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cora_boleto_id TEXT UNIQUE NOT NULL,

  -- Dados do boleto
  nosso_numero TEXT NOT NULL,
  linha_digitavel TEXT NOT NULL,
  codigo_barras TEXT NOT NULL,
  qr_code TEXT, -- PIX Copia e Cola (opcional)
  url_boleto TEXT, -- URL para download do PDF

  -- Valores e datas
  valor INTEGER NOT NULL CHECK (valor > 0), -- Valor em centavos
  vencimento DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pendente', 'pago', 'cancelado', 'expirado')),

  -- Informações do documento
  numero_documento TEXT NOT NULL, -- Ex: OS-2024-001

  -- Dados do pagador
  pagador_nome TEXT NOT NULL,
  pagador_cpf_cnpj TEXT NOT NULL,

  -- Dados de pagamento (preenchidos quando status = PAGO)
  valor_pago INTEGER CHECK (valor_pago IS NULL OR valor_pago > 0),
  data_pagamento TIMESTAMPTZ,

  -- Relacionamento com OS (opcional)
  os_id UUID REFERENCES ordens_servico(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB, -- Dados adicionais (multa, juros, desconto, instruções, etc.)

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_cora_boletos_status ON cora_boletos(status);
CREATE INDEX idx_cora_boletos_vencimento ON cora_boletos(vencimento);
CREATE INDEX idx_cora_boletos_numero_doc ON cora_boletos(numero_documento);
CREATE INDEX idx_cora_boletos_os_id ON cora_boletos(os_id);
CREATE INDEX idx_cora_boletos_created_at ON cora_boletos(created_at DESC);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_cora_boletos_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cora_boletos_updated_at
  BEFORE UPDATE ON cora_boletos
  FOR EACH ROW
  EXECUTE FUNCTION update_cora_boletos_updated_at();

-- =====================================================

-- Tabela: cora_webhook_events
-- Armazena todos os eventos de webhook recebidos do Banco Cora para auditoria
CREATE TABLE IF NOT EXISTS cora_webhook_events (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL, -- ID do evento fornecido pelo Cora

  -- Dados do evento
  event_type TEXT NOT NULL, -- BOLETO_PAGO, PIX_RECEBIDO, etc.
  event_data JSONB NOT NULL, -- Payload completo do evento

  -- Processamento
  processed_at TIMESTAMPTZ NOT NULL,
  processing_status TEXT DEFAULT 'success' CHECK (processing_status IN ('success', 'failed', 'pending')),
  processing_error TEXT, -- Mensagem de erro se falhou

  -- Relacionamento (se aplicável)
  boleto_id UUID REFERENCES cora_boletos(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para auditoria e consultas
CREATE INDEX idx_cora_webhook_events_type ON cora_webhook_events(event_type);
CREATE INDEX idx_cora_webhook_events_created_at ON cora_webhook_events(created_at DESC);
CREATE INDEX idx_cora_webhook_events_boleto_id ON cora_webhook_events(boleto_id);
CREATE INDEX idx_cora_webhook_events_status ON cora_webhook_events(processing_status);

-- =====================================================

-- Tabela: cora_extrato_cache (opcional - para cache de extratos)
-- Armazena transações do extrato para consultas rápidas
CREATE TABLE IF NOT EXISTS cora_extrato_cache (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transacao_id TEXT UNIQUE NOT NULL, -- ID da transação no Cora

  -- Dados da transação
  data TIMESTAMPTZ NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  descricao TEXT NOT NULL,
  valor INTEGER NOT NULL, -- Valor em centavos
  saldo INTEGER NOT NULL, -- Saldo após a transação

  -- Origem
  categoria TEXT,
  origem_tipo TEXT, -- BOLETO, PIX, TED, DOC, TRANSFERENCIA
  origem_identificador TEXT,

  -- Relacionamento (se aplicável)
  boleto_id UUID REFERENCES cora_boletos(id) ON DELETE SET NULL,

  -- Metadata
  metadata JSONB,

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para consultas de extrato
CREATE INDEX idx_cora_extrato_cache_data ON cora_extrato_cache(data DESC);
CREATE INDEX idx_cora_extrato_cache_tipo ON cora_extrato_cache(tipo);
CREATE INDEX idx_cora_extrato_cache_boleto_id ON cora_extrato_cache(boleto_id);

-- =====================================================

-- RLS (Row Level Security) Policies
-- Apenas usuários autenticados podem acessar

ALTER TABLE cora_boletos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cora_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cora_extrato_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Colaboradores podem ver todos os boletos
CREATE POLICY "Colaboradores podem ver boletos"
  ON cora_boletos
  FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Service role pode fazer tudo (para Edge Functions)
CREATE POLICY "Service role tem acesso total a boletos"
  ON cora_boletos
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role tem acesso total a webhook events"
  ON cora_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role tem acesso total a extrato cache"
  ON cora_extrato_cache
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Policy: Gestores e diretoria podem ver eventos
CREATE POLICY "Gestores podem ver webhook events"
  ON cora_webhook_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM colaboradores
      WHERE colaboradores.id = auth.uid()
      AND colaboradores.role_nivel IN ('GESTOR_ADM', 'GESTOR_SETOR', 'DIRETORIA')
    )
  );

-- Policy: Colaboradores podem ver extrato
CREATE POLICY "Colaboradores podem ver extrato cache"
  ON cora_extrato_cache
  FOR SELECT
  TO authenticated
  USING (true);

-- =====================================================

-- Comentários nas tabelas
COMMENT ON TABLE cora_boletos IS 'Armazena boletos emitidos via integração com Banco Cora';
COMMENT ON TABLE cora_webhook_events IS 'Registro de todos os eventos webhook recebidos do Banco Cora';
COMMENT ON TABLE cora_extrato_cache IS 'Cache de transações do extrato bancário do Cora';

COMMENT ON COLUMN cora_boletos.valor IS 'Valor do boleto em centavos (ex: 10000 = R$ 100,00)';
COMMENT ON COLUMN cora_boletos.qr_code IS 'QR Code PIX Copia e Cola (se habilitado no Cora)';
COMMENT ON COLUMN cora_boletos.metadata IS 'JSON com dados adicionais: multa, juros, desconto, instruções';

-- =====================================================

-- View: Resumo de boletos por status
CREATE OR REPLACE VIEW vw_cora_boletos_resumo AS
SELECT
  status,
  COUNT(*) as total_boletos,
  SUM(valor) as valor_total,
  SUM(CASE WHEN status = 'PAGO' THEN valor_pago ELSE 0 END) as valor_recebido,
  COUNT(CASE WHEN vencimento < CURRENT_DATE AND status = 'PENDENTE' THEN 1 END) as vencidos
FROM cora_boletos
GROUP BY status;

COMMENT ON VIEW vw_cora_boletos_resumo IS 'Resumo estatístico de boletos por status';

-- =====================================================

-- Função: Buscar boleto por número de documento
CREATE OR REPLACE FUNCTION buscar_boleto_por_documento(p_numero_documento TEXT)
RETURNS SETOF cora_boletos AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM cora_boletos
  WHERE numero_documento = p_numero_documento
  ORDER BY created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION buscar_boleto_por_documento IS 'Busca boletos pelo número do documento (ex: OS-2024-001)';

-- =====================================================

-- Trigger: Associar boleto à OS automaticamente pelo número do documento
CREATE OR REPLACE FUNCTION auto_associar_boleto_os()
RETURNS TRIGGER AS $$
DECLARE
  v_os_id UUID;
BEGIN
  -- Tentar encontrar OS pelo código (ex: OS-2024-001)
  SELECT id INTO v_os_id
  FROM ordens_servico
  WHERE codigo_os = NEW.numero_documento
  LIMIT 1;

  IF v_os_id IS NOT NULL THEN
    NEW.os_id = v_os_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_associar_boleto_os
  BEFORE INSERT ON cora_boletos
  FOR EACH ROW
  EXECUTE FUNCTION auto_associar_boleto_os();

COMMENT ON FUNCTION auto_associar_boleto_os IS 'Associa automaticamente boleto à OS pelo código no campo numero_documento';

-- =====================================================

-- Grants
GRANT SELECT ON vw_cora_boletos_resumo TO authenticated;
GRANT EXECUTE ON FUNCTION buscar_boleto_por_documento TO authenticated;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
