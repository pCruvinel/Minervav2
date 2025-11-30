-- Migration: Create Storage Bucket for Attendance Proofs
-- Data: 2025-11-30
-- Descrição: Cria bucket 'comprovantes-presenca' e define policies de acesso

-- 1. Criar Bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-presenca', 'comprovantes-presenca', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Policies de Segurança (RLS)

-- Permitir leitura pública (ou apenas autenticada, dependendo do requisito. Aqui deixamos autenticada para segurança)
CREATE POLICY "Permitir leitura para usuários autenticados"
ON storage.objects FOR SELECT
USING ( bucket_id = 'comprovantes-presenca' AND auth.role() = 'authenticated' );

-- Permitir upload para usuários autenticados
CREATE POLICY "Permitir upload para usuários autenticados"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'comprovantes-presenca' AND auth.role() = 'authenticated' );

-- Permitir update/delete (opcional, para correções)
CREATE POLICY "Permitir update para usuários autenticados"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'comprovantes-presenca' AND auth.role() = 'authenticated' );

CREATE POLICY "Permitir delete para usuários autenticados"
ON storage.objects FOR DELETE
USING ( bucket_id = 'comprovantes-presenca' AND auth.role() = 'authenticated' );
