-- ============================================================
-- Migration: Adicionar campos faltantes em colaboradores
-- Data: 2025-12-05
-- Descrição: Campos bancários, endereço detalhado e documentos
-- ============================================================

-- Campos de Endereço Detalhado
ALTER TABLE public.colaboradores 
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS logradouro text,
ADD COLUMN IF NOT EXISTS numero text,
ADD COLUMN IF NOT EXISTS complemento text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS uf varchar(2);

-- Dados Bancários
ALTER TABLE public.colaboradores 
ADD COLUMN IF NOT EXISTS banco text,
ADD COLUMN IF NOT EXISTS agencia text,
ADD COLUMN IF NOT EXISTS conta text,
ADD COLUMN IF NOT EXISTS chave_pix text;

-- Documentos
ALTER TABLE public.colaboradores 
ADD COLUMN IF NOT EXISTS documentos_obrigatorios jsonb DEFAULT '[]'::jsonb;

-- Comentários
COMMENT ON COLUMN colaboradores.banco IS 'Código ou nome do banco';
COMMENT ON COLUMN colaboradores.agencia IS 'Número da agência bancária';
COMMENT ON COLUMN colaboradores.conta IS 'Número da conta bancária';
COMMENT ON COLUMN colaboradores.chave_pix IS 'Chave PIX preferencial';
COMMENT ON COLUMN colaboradores.documentos_obrigatorios IS 'Lista de documentos obrigatórios por função';
