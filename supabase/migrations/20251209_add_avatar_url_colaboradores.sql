-- Migration: Adicionar coluna avatar_url na tabela colaboradores
-- Criado em: 2025-12-09
-- Objetivo: Permitir sincronização de avatares entre Auth metadata e tabela colaboradores
--           para exibição em componentes que consultam a tabela colaboradores (ex: data tables)

-- 1. Adicionar coluna avatar_url se não existir
ALTER TABLE public.colaboradores 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Adicionar comentário explicativo
COMMENT ON COLUMN colaboradores.avatar_url IS 'URL pública do avatar do colaborador no bucket storage.avatars';

-- 3. Criar função para sincronizar avatar do Auth metadata para a tabela colaboradores
-- Isso é útil para manter os dados sincronizados automaticamente
CREATE OR REPLACE FUNCTION public.sync_avatar_from_auth()
RETURNS trigger AS $$
BEGIN
  -- Quando o user metadata é atualizado, sincroniza o avatar_url na tabela colaboradores
  UPDATE public.colaboradores
  SET avatar_url = NEW.raw_user_meta_data->>'avatar_url'
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Criar trigger para sincronização automática (opcional, pode falhar se não tiver permissão)
-- Este trigger atualiza o avatar_url na tabela colaboradores quando o auth.users é atualizado
-- DO $$
-- BEGIN
--   CREATE TRIGGER on_auth_user_updated
--     AFTER UPDATE OF raw_user_meta_data ON auth.users
--     FOR EACH ROW
--     WHEN (OLD.raw_user_meta_data->>'avatar_url' IS DISTINCT FROM NEW.raw_user_meta_data->>'avatar_url')
--     EXECUTE FUNCTION public.sync_avatar_from_auth();
-- EXCEPTION WHEN OTHERS THEN
--   RAISE NOTICE 'Trigger não criado: %', SQLERRM;
-- END $$;

-- 5. Sincronização inicial: copiar avatares existentes do auth.users para colaboradores
-- Isso atualiza os colaboradores que já têm avatar no auth.users mas não na tabela colaboradores
UPDATE public.colaboradores c
SET avatar_url = u.raw_user_meta_data->>'avatar_url'
FROM auth.users u
WHERE c.id = u.id 
  AND c.avatar_url IS NULL 
  AND u.raw_user_meta_data->>'avatar_url' IS NOT NULL;
