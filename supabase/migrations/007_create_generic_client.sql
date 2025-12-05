-- Migration: Criar cliente genérico para requisições sem cliente inicial
-- Necessário porque cliente_id é NOT NULL na tabela ordens_servico

-- Criar cliente genérico do sistema
INSERT INTO clientes (
  id,
  nome_razao_social,
  cpf_cnpj,
  status
)
VALUES (
  'c0000000-0000-0000-0000-000000000001', -- UUID fixo para fácil referência
  'Sistema - Requisições em Andamento',
  '00.000.000/0000-00',
  'ativo'
)
ON CONFLICT (id) DO NOTHING; -- Idempotente: não falha se já existe

-- Adicionar comentário explicativo
COMMENT ON TABLE clientes IS 'Tabela de clientes. Cliente com ID c0000000-0000-0000-0000-000000000001 é usado para OSs criadas automaticamente antes de definir cliente real.';
