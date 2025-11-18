-- ==========================================
-- SEED: Usuários de Desenvolvimento para Auth
-- Data: 18/11/2025
-- Descrição: Popular auth.users e sincronizar com colaboradores
-- ==========================================

-- IMPORTANTE: Este script usa a extension pgcrypto para hash de senhas
-- A senha de desenvolvimento para todos os usuários é: "minerva123"

-- 1. Habilitar extensão para gerar UUIDs e hash de senhas
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Criar função para sincronizar auth.users → colaboradores
-- Esta função é executada automaticamente após signup/update
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se já existe um colaborador com este email
  IF NOT EXISTS (
    SELECT 1 FROM public.colaboradores WHERE email = NEW.email
  ) THEN
    -- Se não existe, criar novo colaborador
    -- Nota: Campos adicionais devem ser preenchidos manualmente ou via API
    INSERT INTO public.colaboradores (
      id,
      email,
      nome_completo,
      status_colaborador,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'nome_completo', 'Usuário Novo'),
      'ativo',
      NOW(),
      NOW()
    );
  ELSE
    -- Se já existe, apenas atualizar o ID para sincronizar
    UPDATE public.colaboradores
    SET id = NEW.id,
        updated_at = NOW()
    WHERE email = NEW.email;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar trigger para executar a função após insert/update em auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Seed de usuários de desenvolvimento
-- Estes usuários correspondem aos mockUsers do frontend

DO $$
DECLARE
  -- IDs dos colaboradores existentes (devem corresponder aos mockUsers)
  v_diretoria_id UUID := 'user-dir-001';
  v_gestor_com_id UUID := 'user-gcom-001';
  v_gestor_ass_id UUID := 'user-gass-001';
  v_gestor_obr_id UUID := 'user-gobr-001';
  v_colab_com_id UUID := 'user-ccom-001';
  v_colab_ass_id UUID := 'user-cass-001';

  -- Senha padrão: "minerva123" (hash bcrypt)
  v_senha_hash TEXT;
BEGIN
  -- Gerar hash da senha "minerva123"
  v_senha_hash := crypt('minerva123', gen_salt('bf'));

  -- Usuario 1: Diretoria
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    v_diretoria_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'carlos.diretor@minervaestrutura.com.br',
    v_senha_hash,
    NOW(),
    jsonb_build_object(
      'nome_completo', 'Carlos Diretor',
      'role_nivel', 'DIRETORIA'
    ),
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = v_senha_hash,
    email_confirmed_at = NOW(),
    updated_at = NOW();

  -- Usuario 2: Gestor Comercial
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    v_gestor_com_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'pedro.gestorcomercial@minervaestrutura.com.br',
    v_senha_hash,
    NOW(),
    jsonb_build_object(
      'nome_completo', 'Pedro Gestor Comercial',
      'role_nivel', 'GESTOR_COMERCIAL'
    ),
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = v_senha_hash,
    email_confirmed_at = NOW(),
    updated_at = NOW();

  -- Usuario 3: Gestor Assessoria
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    v_gestor_ass_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'maria.gestorassessoria@minervaestrutura.com.br',
    v_senha_hash,
    NOW(),
    jsonb_build_object(
      'nome_completo', 'Maria Gestora Assessoria',
      'role_nivel', 'GESTOR_ASSESSORIA'
    ),
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = v_senha_hash,
    email_confirmed_at = NOW(),
    updated_at = NOW();

  -- Usuario 4: Gestor Obras
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    v_gestor_obr_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'joao.gestorobras@minervaestrutura.com.br',
    v_senha_hash,
    NOW(),
    jsonb_build_object(
      'nome_completo', 'João Gestor Obras',
      'role_nivel', 'GESTOR_OBRAS'
    ),
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = v_senha_hash,
    email_confirmed_at = NOW(),
    updated_at = NOW();

  -- Usuario 5: Colaborador Comercial
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    v_colab_com_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'ana.colabc@minervaestrutura.com.br',
    v_senha_hash,
    NOW(),
    jsonb_build_object(
      'nome_completo', 'Ana Colaboradora Comercial',
      'role_nivel', 'COLABORADOR_COMERCIAL'
    ),
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = v_senha_hash,
    email_confirmed_at = NOW(),
    updated_at = NOW();

  -- Usuario 6: Colaborador Assessoria
  INSERT INTO auth.users (
    id,
    instance_id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
  )
  VALUES (
    v_colab_ass_id,
    '00000000-0000-0000-0000-000000000000',
    'authenticated',
    'authenticated',
    'bruno.colaba@minervaestrutura.com.br',
    v_senha_hash,
    NOW(),
    jsonb_build_object(
      'nome_completo', 'Bruno Colaborador Assessoria',
      'role_nivel', 'COLABORADOR_ASSESSORIA'
    ),
    NOW(),
    NOW(),
    '',
    ''
  )
  ON CONFLICT (id) DO UPDATE
  SET
    encrypted_password = v_senha_hash,
    email_confirmed_at = NOW(),
    updated_at = NOW();

  RAISE NOTICE '✅ Seed de usuários concluído com sucesso!';
  RAISE NOTICE '📧 Emails criados: 6';
  RAISE NOTICE '🔑 Senha padrão: minerva123';
END $$;

-- 5. Atualizar colaboradores para usar os mesmos IDs
-- Isso garante sincronização entre auth.users e colaboradores

UPDATE public.colaboradores
SET id = 'user-dir-001'
WHERE email = 'carlos.diretor@minervaestrutura.com.br';

UPDATE public.colaboradores
SET id = 'user-gcom-001'
WHERE email = 'pedro.gestorcomercial@minervaestrutura.com.br';

UPDATE public.colaboradores
SET id = 'user-gass-001'
WHERE email = 'maria.gestorassessoria@minervaestrutura.com.br';

UPDATE public.colaboradores
SET id = 'user-gobr-001'
WHERE email = 'joao.gestorobras@minervaestrutura.com.br';

UPDATE public.colaboradores
SET id = 'user-ccom-001'
WHERE email = 'ana.colabc@minervaestrutura.com.br';

UPDATE public.colaboradores
SET id = 'user-cass-001'
WHERE email = 'bruno.colaba@minervaestrutura.com.br';

-- 6. Verificação final
SELECT
  u.id,
  u.email,
  c.nome_completo,
  c.role_nivel,
  c.setor,
  c.status_colaborador
FROM auth.users u
INNER JOIN public.colaboradores c ON c.id = u.id
WHERE u.email LIKE '%@minervaestrutura.com.br'
ORDER BY c.role_nivel DESC;

-- ==========================================
-- FIM DO SEED
-- ==========================================

-- INSTRUÇÕES DE USO:
-- 1. Execute este script no SQL Editor do Supabase
-- 2. Aguarde confirmação: "✅ Seed de usuários concluído com sucesso!"
-- 3. Teste login com qualquer email acima
-- 4. Senha para todos: minerva123
--
-- EXEMPLOS DE LOGIN:
-- - carlos.diretor@minervaestrutura.com.br / minerva123
-- - pedro.gestorcomercial@minervaestrutura.com.br / minerva123
-- - maria.gestorassessoria@minervaestrutura.com.br / minerva123
