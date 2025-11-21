-- =====================================================
-- MIGRATION: Setup Test Users for Development
-- Data: 2025-11-21
-- Descrição: Corrige ENUMs e prepara estrutura para usuários de teste
--
-- IMPORTANTE:
-- Esta migration prepara a estrutura do banco.
-- Os usuários em auth.users devem ser criados manualmente no Dashboard:
-- Supabase Dashboard → Authentication → Users → Add User
-- =====================================================

-- =====================================================
-- PARTE 1: Corrigir ENUMs Desatualizados
-- =====================================================

BEGIN;

-- Corrigir enum de setores: COMERCIAL → ADMINISTRATIVO
-- Isso alinha o banco com o frontend que espera 'ADMINISTRATIVO'
DO $$
BEGIN
    -- Verificar se o valor COMERCIAL existe antes de renomear
    IF EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_setor'::regtype
        AND enumlabel = 'COMERCIAL'
    ) THEN
        ALTER TYPE user_setor RENAME VALUE 'COMERCIAL' TO 'ADMINISTRATIVO';
        RAISE NOTICE 'Enum user_setor: COMERCIAL renomeado para ADMINISTRATIVO';
    ELSE
        RAISE NOTICE 'Enum user_setor: COMERCIAL já foi renomeado ou não existe';
    END IF;
END $$;

-- Corrigir enum de roles: *_COMERCIAL → *_ADMINISTRATIVO
DO $$
BEGIN
    -- GESTOR_COMERCIAL → GESTOR_ADMINISTRATIVO
    IF EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_role_nivel'::regtype
        AND enumlabel = 'GESTOR_COMERCIAL'
    ) THEN
        ALTER TYPE user_role_nivel RENAME VALUE 'GESTOR_COMERCIAL' TO 'GESTOR_ADMINISTRATIVO';
        RAISE NOTICE 'Enum user_role_nivel: GESTOR_COMERCIAL renomeado para GESTOR_ADMINISTRATIVO';
    ELSE
        RAISE NOTICE 'Enum user_role_nivel: GESTOR_COMERCIAL já foi renomeado ou não existe';
    END IF;

    -- COLABORADOR_COMERCIAL → COLABORADOR_ADMINISTRATIVO
    IF EXISTS (
        SELECT 1 FROM pg_enum
        WHERE enumtypid = 'user_role_nivel'::regtype
        AND enumlabel = 'COLABORADOR_COMERCIAL'
    ) THEN
        ALTER TYPE user_role_nivel RENAME VALUE 'COLABORADOR_COMERCIAL' TO 'COLABORADOR_ADMINISTRATIVO';
        RAISE NOTICE 'Enum user_role_nivel: COLABORADOR_COMERCIAL renomeado para COLABORADOR_ADMINISTRATIVO';
    ELSE
        RAISE NOTICE 'Enum user_role_nivel: COLABORADOR_COMERCIAL já foi renomeado ou não existe';
    END IF;
END $$;

COMMIT;

-- =====================================================
-- PARTE 2: Função Auxiliar para Inserir Colaboradores
-- =====================================================

-- Função para inserir/atualizar colaborador apenas se o usuário existir em auth.users
CREATE OR REPLACE FUNCTION public.upsert_colaborador_if_auth_exists(
    p_email TEXT,
    p_nome_completo TEXT,
    p_role_nivel user_role_nivel,
    p_setor user_setor,
    p_cpf TEXT DEFAULT NULL,
    p_telefone TEXT DEFAULT NULL
)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_result TEXT;
BEGIN
    -- Buscar UUID do usuário em auth.users pelo email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email
    LIMIT 1;

    -- Se o usuário não existe em auth.users, retornar aviso
    IF v_user_id IS NULL THEN
        RETURN 'SKIP: Usuário ' || p_email || ' não encontrado em auth.users. Crie primeiro no Dashboard.';
    END IF;

    -- Se existe, fazer upsert na tabela colaboradores
    INSERT INTO public.colaboradores (
        id,
        email,
        nome_completo,
        role_nivel,
        setor,
        ativo,
        cpf,
        telefone,
        data_cadastro,
        atualizado_em
    )
    VALUES (
        v_user_id,
        p_email,
        p_nome_completo,
        p_role_nivel,
        p_setor,
        true,
        p_cpf,
        p_telefone,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        nome_completo = EXCLUDED.nome_completo,
        role_nivel = EXCLUDED.role_nivel,
        setor = EXCLUDED.setor,
        cpf = EXCLUDED.cpf,
        telefone = EXCLUDED.telefone,
        atualizado_em = NOW();

    RETURN 'OK: Colaborador ' || p_email || ' inserido/atualizado com sucesso (UUID: ' || v_user_id || ')';
END;
$$;

COMMENT ON FUNCTION public.upsert_colaborador_if_auth_exists IS
    'Insere ou atualiza colaborador apenas se o usuário já existe em auth.users. Retorna mensagem de sucesso ou aviso se usuário não existe.';

-- =====================================================
-- PARTE 3: Tentar Inserir Colaboradores de Teste
-- =====================================================

-- IMPORTANTE: Estes usuários devem ser criados PRIMEIRO no Supabase Dashboard
-- Caminho: Authentication → Users → Add User
--
-- Credenciais a criar:
-- 1. diretor@minerva.com / minerva123
-- 2. assesoria@minerva.com / minerva123  (ou assessoria@minerva.com se preferir)
-- 3. administrativo@minerva.com / minerva123
-- 4. obras@minerva.com / minerva123
-- 5. colaborador@minerva.com / minerva123

DO $$
DECLARE
    v_result TEXT;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== Tentando criar colaboradores de teste ===';
    RAISE NOTICE '';

    -- Usuário 1: Diretor
    SELECT public.upsert_colaborador_if_auth_exists(
        'diretor@minerva.com',
        'Diretor Sistema Minerva',
        'DIRETORIA',
        'ADMINISTRATIVO',
        '111.111.111-11',
        '(11) 91111-1111'
    ) INTO v_result;
    RAISE NOTICE '%', v_result;

    -- Usuário 2: Assessoria (com typo 'assesoria' como fornecido)
    SELECT public.upsert_colaborador_if_auth_exists(
        'assesoria@minerva.com',
        'Gestor Assessoria Técnica',
        'GESTOR_ASSESSORIA',
        'ASSESSORIA',
        '222.222.222-22',
        '(11) 92222-2222'
    ) INTO v_result;
    RAISE NOTICE '%', v_result;

    -- Usuário 3: Administrativo
    SELECT public.upsert_colaborador_if_auth_exists(
        'administrativo@minerva.com',
        'Gestor Administrativo',
        'GESTOR_ADMINISTRATIVO',
        'ADMINISTRATIVO',
        '333.333.333-33',
        '(11) 93333-3333'
    ) INTO v_result;
    RAISE NOTICE '%', v_result;

    -- Usuário 4: Obras
    SELECT public.upsert_colaborador_if_auth_exists(
        'obras@minerva.com',
        'Gestor de Obras',
        'GESTOR_OBRAS',
        'OBRAS',
        '444.444.444-44',
        '(11) 94444-4444'
    ) INTO v_result;
    RAISE NOTICE '%', v_result;

    -- Usuário 5: Colaborador
    SELECT public.upsert_colaborador_if_auth_exists(
        'colaborador@minerva.com',
        'Colaborador Administrativo',
        'COLABORADOR_ADMINISTRATIVO',
        'ADMINISTRATIVO',
        '555.555.555-55',
        '(11) 95555-5555'
    ) INTO v_result;
    RAISE NOTICE '%', v_result;

    RAISE NOTICE '';
    RAISE NOTICE '=== Resumo ===';
    RAISE NOTICE 'Se viu mensagens SKIP acima, crie os usuários no Dashboard primeiro.';
    RAISE NOTICE 'Depois execute: SELECT public.sync_all_test_users();';
    RAISE NOTICE '';
END $$;

-- =====================================================
-- PARTE 4: Função de Sincronização Manual
-- =====================================================

-- Função para re-executar a sincronização após criar usuários no Dashboard
CREATE OR REPLACE FUNCTION public.sync_all_test_users()
RETURNS TABLE(resultado TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT public.upsert_colaborador_if_auth_exists(
        'diretor@minerva.com',
        'Diretor Sistema Minerva',
        'DIRETORIA',
        'ADMINISTRATIVO',
        '111.111.111-11',
        '(11) 91111-1111'
    );

    RETURN QUERY
    SELECT public.upsert_colaborador_if_auth_exists(
        'assesoria@minerva.com',
        'Gestor Assessoria Técnica',
        'GESTOR_ASSESSORIA',
        'ASSESSORIA',
        '222.222.222-22',
        '(11) 92222-2222'
    );

    RETURN QUERY
    SELECT public.upsert_colaborador_if_auth_exists(
        'administrativo@minerva.com',
        'Gestor Administrativo',
        'GESTOR_ADMINISTRATIVO',
        'ADMINISTRATIVO',
        '333.333.333-33',
        '(11) 93333-3333'
    );

    RETURN QUERY
    SELECT public.upsert_colaborador_if_auth_exists(
        'obras@minerva.com',
        'Gestor de Obras',
        'GESTOR_OBRAS',
        'OBRAS',
        '444.444.444-44',
        '(11) 94444-4444'
    );

    RETURN QUERY
    SELECT public.upsert_colaborador_if_auth_exists(
        'colaborador@minerva.com',
        'Colaborador Administrativo',
        'COLABORADOR_ADMINISTRATIVO',
        'ADMINISTRATIVO',
        '555.555.555-55',
        '(11) 95555-5555'
    );
END;
$$;

COMMENT ON FUNCTION public.sync_all_test_users IS
    'Re-executa a sincronização de todos os usuários de teste. Execute após criar os usuários no Supabase Dashboard.';

-- =====================================================
-- PARTE 5: Verificação
-- =====================================================

-- Query para verificar sincronização entre auth.users e colaboradores
DO $$
DECLARE
    v_count_auth INTEGER;
    v_count_sync INTEGER;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== Verificação de Usuários ===';
    RAISE NOTICE '';

    -- Contar usuários em auth.users com email @minerva.com
    SELECT COUNT(*) INTO v_count_auth
    FROM auth.users
    WHERE email LIKE '%@minerva.com';

    -- Contar colaboradores sincronizados
    SELECT COUNT(*) INTO v_count_sync
    FROM auth.users u
    INNER JOIN public.colaboradores c ON c.id = u.id
    WHERE u.email LIKE '%@minerva.com';

    RAISE NOTICE 'Usuários em auth.users (@minerva.com): %', v_count_auth;
    RAISE NOTICE 'Colaboradores sincronizados: %', v_count_sync;
    RAISE NOTICE '';

    IF v_count_auth = 0 THEN
        RAISE NOTICE '⚠️  AÇÃO NECESSÁRIA:';
        RAISE NOTICE '   1. Acesse Supabase Dashboard';
        RAISE NOTICE '   2. Vá em Authentication → Users';
        RAISE NOTICE '   3. Clique em "Add User"';
        RAISE NOTICE '   4. Crie os 5 usuários com emails @minerva.com e senha minerva123';
        RAISE NOTICE '   5. Execute: SELECT public.sync_all_test_users();';
    ELSIF v_count_sync < v_count_auth THEN
        RAISE NOTICE '⚠️  Alguns usuários não foram sincronizados.';
        RAISE NOTICE '   Execute: SELECT public.sync_all_test_users();';
    ELSE
        RAISE NOTICE '✅ Todos os usuários estão sincronizados!';
    END IF;

    RAISE NOTICE '';
END $$;
