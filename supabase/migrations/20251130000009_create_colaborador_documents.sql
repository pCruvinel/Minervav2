-- Migration: Create Documents Table and Storage for Collaborators
-- Data: 2025-11-30

-- 1. Create Table
CREATE TABLE IF NOT EXISTS colaboradores_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  url TEXT NOT NULL,
  tipo TEXT, -- 'pdf', 'image', etc.
  tamanho BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Enable RLS
ALTER TABLE colaboradores_documentos ENABLE ROW LEVEL SECURITY;

-- 3. Policies for Table
CREATE POLICY "Leitura para autenticados" ON colaboradores_documentos
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Escrita para autenticados" ON colaboradores_documentos
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. Create Storage Bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-colaboradores', 'documentos-colaboradores', true)
ON CONFLICT (id) DO NOTHING;

-- 5. Policies for Storage
CREATE POLICY "Leitura storage autenticados"
ON storage.objects FOR SELECT
USING ( bucket_id = 'documentos-colaboradores' AND auth.role() = 'authenticated' );

CREATE POLICY "Upload storage autenticados"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'documentos-colaboradores' AND auth.role() = 'authenticated' );

CREATE POLICY "Delete storage autenticados"
ON storage.objects FOR DELETE
USING ( bucket_id = 'documentos-colaboradores' AND auth.role() = 'authenticated' );
