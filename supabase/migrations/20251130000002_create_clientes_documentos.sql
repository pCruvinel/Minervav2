-- Migration: Criar tabela clientes_documentos
-- Data: 2025-11-30
-- Descrição: Tabela para armazenar documentos vinculados aos clientes
--            (RG/CNH, Comprovante Residência, Contrato Social, Logo)

CREATE TABLE IF NOT EXISTS public.clientes_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  tipo_documento VARCHAR(50) NOT NULL CHECK (tipo_documento IN (
    'contrato_social',
    'comprovante_residencia',
    'documento_foto',
    'logo_cliente'
  )),
  nome_arquivo VARCHAR(255) NOT NULL,
  caminho_storage TEXT NOT NULL,
  mime_type VARCHAR(100),
  tamanho_bytes INTEGER,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES public.colaboradores(id)
);

-- Índices para performance
CREATE INDEX idx_clientes_documentos_cliente ON public.clientes_documentos(cliente_id);
CREATE INDEX idx_clientes_documentos_tipo ON public.clientes_documentos(tipo_documento);
CREATE INDEX idx_clientes_documentos_uploaded_at ON public.clientes_documentos(uploaded_at DESC);

-- Comentários
COMMENT ON TABLE public.clientes_documentos IS
  'Armazena documentos vinculados aos clientes (RG, Comprovante, Contrato Social, Logo)';

COMMENT ON COLUMN public.clientes_documentos.tipo_documento IS
  'Tipo do documento: contrato_social, comprovante_residencia, documento_foto, logo_cliente';

COMMENT ON COLUMN public.clientes_documentos.caminho_storage IS
  'Caminho completo do arquivo no Supabase Storage (bucket: uploads)';
