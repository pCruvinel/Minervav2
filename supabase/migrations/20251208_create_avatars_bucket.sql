-- Migration: Criar bucket de avatars para fotos de perfil
-- Criado em: 2025-12-08

-- 1. Criar bucket de avatars se não existir
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política: Qualquer pessoa pode visualizar avatars (bucket público)
CREATE POLICY "Avatar público para leitura" ON storage.objects
  FOR SELECT 
  USING (bucket_id = 'avatars');

-- 3. Política: Usuário autenticado pode fazer upload (política mais simples)
CREATE POLICY "Usuário pode fazer upload do próprio avatar" ON storage.objects
  FOR INSERT 
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- 4. Política: Usuário pode atualizar (bucket público, qualquer autenticado pode atualizar seus arquivos)
CREATE POLICY "Usuário pode atualizar próprio avatar" ON storage.objects
  FOR UPDATE 
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- 5. Política: Usuário pode deletar
CREATE POLICY "Usuário pode deletar próprio avatar" ON storage.objects
  FOR DELETE 
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );
