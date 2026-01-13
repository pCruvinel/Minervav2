-- ============================================================
-- Migration: Sistema de Mensagens (WhatsApp e Email)
-- Data: 2026-01-13
-- Descrição: Cria tabelas para templates de mensagem, 
--            log de mensagens enviadas e configurações de limite
-- ============================================================

BEGIN;

-- ============================================================
-- 1. Tabela de Templates de Mensagem
-- ============================================================

CREATE TABLE IF NOT EXISTS mensagem_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome VARCHAR(100) NOT NULL,
  slug VARCHAR(50) UNIQUE NOT NULL,
  canal TEXT NOT NULL CHECK (canal IN ('whatsapp', 'email', 'ambos')),
  assunto_email VARCHAR(200),               -- Apenas para email
  corpo TEXT NOT NULL,                       -- Suporta variáveis {{variavel}}
  variaveis_disponiveis TEXT[] DEFAULT '{}', -- Lista de variáveis aceitas
  categoria TEXT DEFAULT 'geral',            -- 'comercial', 'financeiro', 'operacional', 'geral'
  ativo BOOLEAN DEFAULT TRUE,
  criado_por uuid REFERENCES colaboradores(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_templates_canal ON mensagem_templates(canal);
CREATE INDEX IF NOT EXISTS idx_templates_ativo ON mensagem_templates(ativo);
CREATE INDEX IF NOT EXISTS idx_templates_categoria ON mensagem_templates(categoria);

-- Comentário
COMMENT ON TABLE mensagem_templates IS 'Templates de mensagem para WhatsApp e Email com suporte a variáveis dinâmicas';

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_mensagem_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_mensagem_templates_updated_at
  BEFORE UPDATE ON mensagem_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_mensagem_templates_updated_at();

-- ============================================================
-- 2. Tabela de Mensagens Enviadas (Histórico + Auditoria)
-- ============================================================

CREATE TABLE IF NOT EXISTS mensagens_enviadas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Canal e destino
  canal TEXT NOT NULL CHECK (canal IN ('whatsapp', 'email')),
  destinatario_tipo TEXT NOT NULL CHECK (destinatario_tipo IN ('cliente', 'colaborador', 'outro')),
  destinatario_id uuid,                      -- FK para cliente ou colaborador (opcional)
  destinatario_contato VARCHAR(255) NOT NULL, -- Email ou telefone
  destinatario_nome VARCHAR(255),
  
  -- Conteúdo
  template_id uuid REFERENCES mensagem_templates(id),
  assunto VARCHAR(200),                      -- Para emails
  corpo TEXT NOT NULL,
  anexos JSONB DEFAULT '[]',                 -- [{nome, url, tipo, tamanho}]
  variaveis_usadas JSONB DEFAULT '{}',       -- Variáveis substituídas
  
  -- Contexto (de onde foi enviado)
  contexto_tipo TEXT,                        -- 'os', 'cliente', 'proposta', 'contrato', etc
  contexto_id uuid,                          -- ID da entidade relacionada
  contexto_codigo VARCHAR(50),               -- Ex: "OS-2026-001"
  
  -- Status de entrega
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (
    status IN ('pendente', 'enviado', 'entregue', 'lido', 'falhou')
  ),
  erro_mensagem TEXT,
  tentativas INTEGER DEFAULT 0,
  enviado_em TIMESTAMPTZ,
  entregue_em TIMESTAMPTZ,
  lido_em TIMESTAMPTZ,
  
  -- Metadados de API externa
  external_id VARCHAR(255),                  -- ID retornado pela Evolution API ou SMTP
  external_response JSONB,                   -- Resposta completa da API
  
  -- Auditoria
  enviado_por uuid REFERENCES colaboradores(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_mensagens_canal ON mensagens_enviadas(canal);
CREATE INDEX IF NOT EXISTS idx_mensagens_status ON mensagens_enviadas(status);
CREATE INDEX IF NOT EXISTS idx_mensagens_destinatario_id ON mensagens_enviadas(destinatario_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_contexto ON mensagens_enviadas(contexto_tipo, contexto_id);
CREATE INDEX IF NOT EXISTS idx_mensagens_data ON mensagens_enviadas(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mensagens_enviado_por ON mensagens_enviadas(enviado_por);

-- Comentário
COMMENT ON TABLE mensagens_enviadas IS 'Histórico de mensagens enviadas por WhatsApp e Email com auditoria completa';

-- ============================================================
-- 3. RLS Policies
-- ============================================================

-- Templates: leitura para todos autenticados, escrita para gestores
ALTER TABLE mensagem_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados podem ver templates ativos"
  ON mensagem_templates
  FOR SELECT
  TO authenticated
  USING (ativo = true OR criado_por = auth.uid());

CREATE POLICY "Gestores podem criar templates"
  ON mensagem_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM colaboradores c 
      JOIN cargos ca ON c.cargo_id = ca.id 
      WHERE c.id = auth.uid() 
      AND ca.nivel_acesso >= 5
    )
  );

CREATE POLICY "Gestores podem atualizar templates"
  ON mensagem_templates
  FOR UPDATE
  TO authenticated
  USING (
    criado_por = auth.uid()
    OR EXISTS (
      SELECT 1 FROM colaboradores c 
      JOIN cargos ca ON c.cargo_id = ca.id 
      WHERE c.id = auth.uid() 
      AND ca.nivel_acesso >= 5
    )
  );

-- Mensagens: usuários veem as que enviaram, gestores veem todas
ALTER TABLE mensagens_enviadas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios podem ver suas mensagens"
  ON mensagens_enviadas
  FOR SELECT
  TO authenticated
  USING (
    enviado_por = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM colaboradores c 
      JOIN cargos ca ON c.cargo_id = ca.id 
      WHERE c.id = auth.uid() 
      AND ca.nivel_acesso >= 5
    )
  );

CREATE POLICY "Usuarios autenticados podem inserir mensagens"
  ON mensagens_enviadas
  FOR INSERT
  TO authenticated
  WITH CHECK (enviado_por = auth.uid());

-- ============================================================
-- 4. Função para verificar limite diário de envios
-- ============================================================

CREATE OR REPLACE FUNCTION verificar_limite_envios_diario(p_usuario_id uuid)
RETURNS TABLE (
  pode_enviar BOOLEAN,
  envios_hoje INTEGER,
  limite_diario INTEGER,
  mensagem TEXT
) AS $$
DECLARE
  v_limite INTEGER;
  v_envios_hoje INTEGER;
BEGIN
  -- Buscar limite configurado (default 30)
  SELECT COALESCE(
    (SELECT value::INTEGER FROM app_settings WHERE key = 'mensagens_limite_diario'),
    30
  ) INTO v_limite;
  
  -- Contar envios de hoje
  SELECT COUNT(*) INTO v_envios_hoje
  FROM mensagens_enviadas
  WHERE enviado_por = p_usuario_id
    AND created_at >= CURRENT_DATE
    AND status != 'falhou';
  
  -- Retornar resultado
  RETURN QUERY SELECT 
    v_envios_hoje < v_limite AS pode_enviar,
    v_envios_hoje AS envios_hoje,
    v_limite AS limite_diario,
    CASE 
      WHEN v_envios_hoje >= v_limite THEN 
        'Limite diário de ' || v_limite || ' mensagens atingido'
      ELSE 
        'OK - ' || (v_limite - v_envios_hoje) || ' envios restantes hoje'
    END AS mensagem;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- 5. Inserir configuração de limite diário
-- ============================================================

INSERT INTO app_settings (key, value, description, is_secret)
VALUES ('mensagens_limite_diario', '30', 'Limite diário de mensagens (WhatsApp + Email) por usuário', false)
ON CONFLICT (key) DO NOTHING;

-- ============================================================
-- 6. Templates padrão do sistema
-- ============================================================

INSERT INTO mensagem_templates (nome, slug, canal, assunto_email, corpo, variaveis_disponiveis, categoria)
VALUES 
  (
    'Envio de Proposta Comercial',
    'proposta_comercial',
    'ambos',
    'Proposta Comercial - {{os_codigo}} - Minerva Engenharia',
    'Olá {{cliente_nome}},

Segue em anexo a proposta comercial referente ao serviço solicitado.

Código: {{os_codigo}}
Valor: {{proposta_valor}}

Ficamos à disposição para esclarecer qualquer dúvida.

Atenciosamente,
Minerva Engenharia',
    ARRAY['cliente_nome', 'os_codigo', 'proposta_valor'],
    'comercial'
  ),
  (
    'Confirmação de Visita Técnica',
    'visita_agendada',
    'whatsapp',
    NULL,
    'Olá {{cliente_nome}}! 👋

Confirmamos sua visita técnica agendada:

📅 Data: {{visita_data}}
🕐 Horário: {{visita_horario}}
📍 Local: {{visita_endereco}}

Qualquer dúvida, estamos à disposição!

Minerva Engenharia 🏗️',
    ARRAY['cliente_nome', 'visita_data', 'visita_horario', 'visita_endereco'],
    'operacional'
  ),
  (
    'Contrato para Assinatura',
    'contrato_assinatura',
    'email',
    'Contrato de Prestação de Serviços - {{os_codigo}}',
    'Prezado(a) {{cliente_nome}},

Segue em anexo o contrato de prestação de serviços para sua análise e assinatura.

Referência: {{os_codigo}}
Tipo de Serviço: {{tipo_servico}}

Após análise, favor retornar assinado.

Cordialmente,
Minerva Engenharia',
    ARRAY['cliente_nome', 'os_codigo', 'tipo_servico'],
    'comercial'
  ),
  (
    'Laudo Técnico Pronto',
    'laudo_pronto',
    'email',
    'Laudo Técnico Disponível - {{os_codigo}}',
    'Prezado(a) {{cliente_nome}},

Informamos que o laudo técnico referente ao serviço {{os_codigo}} foi concluído e está disponível em anexo.

Data de Emissão: {{laudo_data}}

Caso tenha alguma dúvida, entre em contato conosco.

Atenciosamente,
Minerva Engenharia',
    ARRAY['cliente_nome', 'os_codigo', 'laudo_data'],
    'operacional'
  ),
  (
    'Lembrete de Pagamento',
    'lembrete_pagamento',
    'whatsapp',
    NULL,
    'Olá {{cliente_nome}}! 

Gostaríamos de lembrar do pagamento:

💰 Valor: {{valor_parcela}}
📅 Vencimento: {{data_vencimento}}
📋 Ref: {{os_codigo}}

Dados bancários em anexo ou consulte seu extrato no Portal do Cliente.

Minerva Engenharia',
    ARRAY['cliente_nome', 'valor_parcela', 'data_vencimento', 'os_codigo'],
    'financeiro'
  ),
  (
    'Boas-vindas ao Portal',
    'boas_vindas_portal',
    'email',
    'Bem-vindo ao Portal do Cliente - Minerva Engenharia',
    'Olá {{cliente_nome}},

Seja bem-vindo ao Portal do Cliente da Minerva Engenharia!

Você pode acessar o portal através do link abaixo para acompanhar suas obras, visualizar documentos e muito mais.

{{portal_link}}

Se tiver dúvidas, estamos à disposição.

Atenciosamente,
Equipe Minerva',
    ARRAY['cliente_nome', 'portal_link'],
    'geral'
  )
ON CONFLICT (slug) DO NOTHING;

-- ============================================================
-- 7. Habilitar Realtime para mensagens (opcional)
-- ============================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'mensagens_enviadas'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.mensagens_enviadas;
  END IF;
END
$$;

COMMIT;
