-- ==========================================
-- SEED CORRIGIDO: Usuários de Desenvolvimento
-- Data: 18/11/2025
-- Descrição: Versão que funciona com limitações do Supabase
-- ==========================================

-- IMPORTANTE:
-- Este script NÃO pode criar usuários em auth.users via SQL público
-- Isso deve ser feito via Dashboard ou Management API
-- Este script apenas PREPARA os colaboradores para sincronização

-- ==========================================
-- PARTE 1: PREPARAR COLABORADORES
-- ==========================================

-- 1. Habilitar extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Atualizar IDs dos colaboradores para corresponder aos que serão criados no auth
-- Isso garante que quando os usuários forem criados, já haverá colaboradores com IDs corretos

DO $$
BEGIN
  -- Verificar se colaboradores existem antes de atualizar

  -- 1. Diretoria
  IF EXISTS (SELECT 1 FROM public.colaboradores WHERE email = 'carlos.diretor@minervaestrutura.com.br') THEN
    UPDATE public.colaboradores
    SET id = 'user-dir-001',
        updated_at = NOW()
    WHERE email = 'carlos.diretor@minervaestrutura.com.br';
    RAISE NOTICE '✅ Colaborador Diretoria atualizado';
  ELSE
    RAISE NOTICE '⚠️  Colaborador Diretoria não encontrado';
  END IF;

  -- 2. Gestor Comercial
  IF EXISTS (SELECT 1 FROM public.colaboradores WHERE email = 'pedro.gestorcomercial@minervaestrutura.com.br') THEN
    UPDATE public.colaboradores
    SET id = 'user-gcom-001',
        updated_at = NOW()
    WHERE email = 'pedro.gestorcomercial@minervaestrutura.com.br';
    RAISE NOTICE '✅ Gestor Administrativo atualizado';
  ELSE
    RAISE NOTICE '⚠️  Gestor Administrativo não encontrado';
  END IF;

  -- 3. Gestor Assessoria
  IF EXISTS (SELECT 1 FROM public.colaboradores WHERE email = 'maria.gestorassessoria@minervaestrutura.com.br') THEN
    UPDATE public.colaboradores
    SET id = 'user-gass-001',
        updated_at = NOW()
    WHERE email = 'maria.gestorassessoria@minervaestrutura.com.br';
    RAISE NOTICE '✅ Gestor Assessoria atualizado';
  ELSE
    RAISE NOTICE '⚠️  Gestor Assessoria não encontrado';
  END IF;

  -- 4. Gestor Obras
  IF EXISTS (SELECT 1 FROM public.colaboradores WHERE email = 'joao.gestorobras@minervaestrutura.com.br') THEN
    UPDATE public.colaboradores
    SET id = 'user-gobr-001',
        updated_at = NOW()
    WHERE email = 'joao.gestorobras@minervaestrutura.com.br';
    RAISE NOTICE '✅ Gestor Obras atualizado';
  ELSE
    RAISE NOTICE '⚠️  Gestor Obras não encontrado';
  END IF;

  -- 5. Colaborador Comercial
  IF EXISTS (SELECT 1 FROM public.colaboradores WHERE email = 'ana.colabc@minervaestrutura.com.br') THEN
    UPDATE public.colaboradores
    SET id = 'user-ccom-001',
        updated_at = NOW()
    WHERE email = 'ana.colabc@minervaestrutura.com.br';
    RAISE NOTICE '✅ Colaborador Administrativo atualizado';
  ELSE
    RAISE NOTICE '⚠️  Colaborador Administrativo não encontrado';
  END IF;

  -- 6. Colaborador Assessoria
  IF EXISTS (SELECT 1 FROM public.colaboradores WHERE email = 'bruno.colaba@minervaestrutura.com.br') THEN
    UPDATE public.colaboradores
    SET id = 'user-cass-001',
        updated_at = NOW()
    WHERE email = 'bruno.colaba@minervaestrutura.com.br';
    RAISE NOTICE '✅ Colaborador Assessoria atualizado';
  ELSE
    RAISE NOTICE '⚠️  Colaborador Assessoria não encontrado';
  END IF;

  RAISE NOTICE '';
  RAISE NOTICE '📋 IDs dos colaboradores atualizados!';
  RAISE NOTICE '';
END $$;

-- ==========================================
-- PARTE 2: VERIFICAÇÃO
-- ==========================================

-- Listar colaboradores atualizados
SELECT
  id,
  email,
  nome_completo,
  role_nivel,
  setor,
  status_colaborador
FROM public.colaboradores
WHERE email LIKE '%@minervaestrutura.com.br'
ORDER BY role_nivel DESC;

-- ==========================================
-- INSTRUÇÕES PARA CRIAR USUÁRIOS NO AUTH
-- ==========================================

/*

⚠️ IMPORTANTE: Usuários auth.users devem ser criados via Supabase Dashboard

Como criar os usuários:

1. Acesse: https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/auth/users

2. Clique em "Add user" → "Create new user"

3. Crie cada usuário com os seguintes dados:

USUÁRIO 1:
- Email: carlos.diretor@minervaestrutura.com.br
- Password: minerva123
- User ID: user-dir-001
- Confirm email: SIM

USUÁRIO 2:
- Email: pedro.gestorcomercial@minervaestrutura.com.br
- Password: minerva123
- User ID: user-gcom-001
- Confirm email: SIM

USUÁRIO 3:
- Email: maria.gestorassessoria@minervaestrutura.com.br
- Password: minerva123
- User ID: user-gass-001
- Confirm email: SIM

USUÁRIO 4:
- Email: joao.gestorobras@minervaestrutura.com.br
- Password: minerva123
- User ID: user-gobr-001
- Confirm email: SIM

USUÁRIO 5:
- Email: ana.colabc@minervaestrutura.com.br
- Password: minerva123
- User ID: user-ccom-001
- Confirm email: SIM

USUÁRIO 6:
- Email: bruno.colaba@minervaestrutura.com.br
- Password: minerva123
- User ID: user-cass-001
- Confirm email: SIM

4. Após criar todos, execute o SQL de verificação abaixo

*/

-- ==========================================
-- VERIFICAÇÃO FINAL
-- ==========================================

/*

Execute este SQL após criar os usuários no Dashboard:

SELECT
  u.id,
  u.email,
  u.email_confirmed_at,
  c.nome_completo,
  c.role_nivel,
  c.setor
FROM auth.users u
INNER JOIN public.colaboradores c ON c.id = u.id
WHERE u.email LIKE '%@minervaestrutura.com.br'
ORDER BY c.role_nivel DESC;

Se retornar 6 linhas, significa que tudo funcionou! ✅

*/

-- ==========================================
-- FIM DO SCRIPT
-- ==========================================
