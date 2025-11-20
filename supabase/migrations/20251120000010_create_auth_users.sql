-- Script para criar usuários no Supabase Auth
-- ATENÇÃO: Este script deve ser executado no SQL Editor do Supabase Dashboard

-- Usuário 1: Diretoria
INSERT INTO auth.users (id, email, email_confirmed_at, encrypted_password, created_at, updated_at, last_sign_in_at, aud, role, instance_id)
VALUES (
  'a0000000-0000-4000-a000-000000000001'::uuid,
  'carlos.diretor@minervaestrutura.com.br',
  NOW(),
  crypt('minerva123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'::uuid
) ON CONFLICT DO NOTHING;

-- Sincronizar com tabela de colaboradores (atualizar user_id)
UPDATE colaboradores SET user_id = 'a0000000-0000-4000-a000-000000000001'::uuid 
WHERE email = 'carlos.diretor@minervaestrutura.com.br';

-- Usuário 2: Gestor Comercial
INSERT INTO auth.users (id, email, email_confirmed_at, encrypted_password, created_at, updated_at, last_sign_in_at, aud, role, instance_id)
VALUES (
  'a0000000-0000-4000-a000-000000000002'::uuid,
  'pedro.gestorcomercial@minervaestrutura.com.br',
  NOW(),
  crypt('minerva123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'::uuid
) ON CONFLICT DO NOTHING;

UPDATE colaboradores SET user_id = 'a0000000-0000-4000-a000-000000000002'::uuid 
WHERE email = 'pedro.gestorcomercial@minervaestrutura.com.br';

-- Usuário 3: Gestor Assessoria
INSERT INTO auth.users (id, email, email_confirmed_at, encrypted_password, created_at, updated_at, last_sign_in_at, aud, role, instance_id)
VALUES (
  'a0000000-0000-4000-a000-000000000003'::uuid,
  'maria.gestorassessoria@minervaestrutura.com.br',
  NOW(),
  crypt('minerva123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'::uuid
) ON CONFLICT DO NOTHING;

UPDATE colaboradores SET user_id = 'a0000000-0000-4000-a000-000000000003'::uuid 
WHERE email = 'maria.gestorassessoria@minervaestrutura.com.br';

-- Usuário 4: Gestor Obras
INSERT INTO auth.users (id, email, email_confirmed_at, encrypted_password, created_at, updated_at, last_sign_in_at, aud, role, instance_id)
VALUES (
  'a0000000-0000-4000-a000-000000000004'::uuid,
  'joao.gestorobras@minervaestrutura.com.br',
  NOW(),
  crypt('minerva123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'::uuid
) ON CONFLICT DO NOTHING;

UPDATE colaboradores SET user_id = 'a0000000-0000-4000-a000-000000000004'::uuid 
WHERE email = 'joao.gestorobras@minervaestrutura.com.br';

-- Usuário 5: Colaborador Comercial
INSERT INTO auth.users (id, email, email_confirmed_at, encrypted_password, created_at, updated_at, last_sign_in_at, aud, role, instance_id)
VALUES (
  'a0000000-0000-4000-a000-000000000005'::uuid,
  'ana.colabc@minervaestrutura.com.br',
  NOW(),
  crypt('minerva123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'::uuid
) ON CONFLICT DO NOTHING;

UPDATE colaboradores SET user_id = 'a0000000-0000-4000-a000-000000000005'::uuid 
WHERE email = 'ana.colabc@minervaestrutura.com.br';

-- Usuário 6: Colaborador Assessoria
INSERT INTO auth.users (id, email, email_confirmed_at, encrypted_password, created_at, updated_at, last_sign_in_at, aud, role, instance_id)
VALUES (
  'a0000000-0000-4000-a000-000000000006'::uuid,
  'bruno.colaba@minervaestrutura.com.br',
  NOW(),
  crypt('minerva123', gen_salt('bf')),
  NOW(),
  NOW(),
  NOW(),
  'authenticated',
  'authenticated',
  '00000000-0000-0000-0000-000000000000'::uuid
) ON CONFLICT DO NOTHING;

UPDATE colaboradores SET user_id = 'a0000000-0000-4000-a000-000000000006'::uuid 
WHERE email = 'bruno.colaba@minervaestrutura.com.br';

-- Verificação final
SELECT COUNT(*) as total_usuarios FROM auth.users WHERE email LIKE '%minervaestrutura.com.br';
SELECT email, role_nivel, setor FROM colaboradores WHERE email LIKE '%minervaestrutura.com.br' ORDER BY created_at;
