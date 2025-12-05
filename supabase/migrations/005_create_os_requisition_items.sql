-- ============================================================
-- Migration 5: Criar tabela os_requisition_items
-- Data: 2025-12-03
-- Descrição: Armazenamento de itens individuais de requisição de compra (OS-09)
-- ============================================================

BEGIN;

-- Criar tipo ENUM para tipos de item
CREATE TYPE item_tipo AS ENUM (
  'Material',
  'Ferramenta',
  'Equipamento',
  'Logística',
  'Documentação'
);

-- Criar tipo ENUM para sub-tipos (Ferramenta/Equipamento)
CREATE TYPE item_subtipo AS ENUM (
  'Locação',
  'Aquisição'
);

-- Criar tipo ENUM para unidades de medida
CREATE TYPE unidade_medida AS ENUM (
  'UN',
  'KG',
  'M',
  'L',
  'CX',
  'M2',
  'M3',
  'TON'
);

-- Criar tipo ENUM para prazos de necessidade
CREATE TYPE prazo_necessidade AS ENUM (
  'Imediato',
  '2 dias',
  '7 dias',
  '15 dias',
  '30 dias'
);

-- Criar tabela de itens de requisição
CREATE TABLE os_requisition_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  os_etapa_id UUID NOT NULL REFERENCES os_etapas(id) ON DELETE CASCADE,

  -- Tipo do item
  tipo item_tipo NOT NULL,
  sub_tipo item_subtipo, -- Apenas para Ferramenta/Equipamento

  -- Detalhes do item
  descricao TEXT NOT NULL,
  quantidade NUMERIC(10, 2) NOT NULL CHECK (quantidade > 0),
  unidade_medida unidade_medida NOT NULL,
  preco_unitario NUMERIC(12, 2) NOT NULL CHECK (preco_unitario >= 0),
  link_produto TEXT,

  -- Endereço de entrega (ViaCEP)
  cep VARCHAR(9) NOT NULL,
  logradouro VARCHAR(255) NOT NULL,
  numero VARCHAR(20) NOT NULL,
  complemento VARCHAR(255),
  bairro VARCHAR(100) NOT NULL,
  cidade VARCHAR(100) NOT NULL,
  uf CHAR(2) NOT NULL,

  -- Prazo e observações
  prazo_necessidade prazo_necessidade NOT NULL,
  observacao TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_requisition_items_etapa ON os_requisition_items(os_etapa_id);
CREATE INDEX idx_requisition_items_tipo ON os_requisition_items(tipo);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_os_requisition_items_updated_at
  BEFORE UPDATE ON os_requisition_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS Policies
ALTER TABLE os_requisition_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read requisition items from their OS"
  ON os_requisition_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM os_etapas oe
      JOIN ordens_servico os ON oe.os_id = os.id
      WHERE oe.id = os_etapa_id
    )
  );

CREATE POLICY "Users can insert requisition items"
  ON os_requisition_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM os_etapas oe
      WHERE oe.id = os_etapa_id
    )
  );

CREATE POLICY "Users can update requisition items"
  ON os_requisition_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM os_etapas oe
      WHERE oe.id = os_etapa_id
    )
  );

CREATE POLICY "Users can delete requisition items"
  ON os_requisition_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM os_etapas oe
      WHERE oe.id = os_etapa_id
    )
  );

COMMIT;
