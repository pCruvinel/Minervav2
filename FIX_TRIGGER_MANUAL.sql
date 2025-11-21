-- =====================================================
-- SCRIPT MANUAL: Desabilitar Trigger handle_new_user
-- Data: 2025-11-21
-- INSTRUÇÕES: Copie e execute no SQL Editor do Supabase
-- URL: https://supabase.com/dashboard/project/zxfevlkssljndqqhxkjb/sql/new
-- =====================================================

-- PASSO 1: Desabilitar trigger que causa erro
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

RAISE NOTICE '✅ Trigger on_auth_user_created removido';

-- PASSO 2: Criar função para sincronizar usuários individuais
CREATE OR REPLACE FUNCTION public.sync_single_user(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_nome_completo TEXT;
BEGIN
    -- Buscar UUID do usuário em auth.users pelo email
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = p_email
    LIMIT 1;

    -- Se o usuário não existe em auth.users
    IF v_user_id IS NULL THEN
        RETURN 'ERRO: Usuário ' || p_email || ' não encontrado em auth.users.';
    END IF;

    -- Extrair nome do email (parte antes do @)
    v_nome_completo := INITCAP(SPLIT_PART(p_email, '@', 1));

    -- Inserir ou atualizar colaborador com dados mínimos
    INSERT INTO public.colaboradores (
        id,
        email,
        nome_completo,
        role_nivel,
        setor,
        ativo,
        data_cadastro,
        atualizado_em
    )
    VALUES (
        v_user_id,
        p_email,
        v_nome_completo,
        'COLABORADOR_ADMINISTRATIVO',  -- Role padrão
        'ADMINISTRATIVO',               -- Setor padrão
        true,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        atualizado_em = NOW();

    RETURN 'OK: Usuário ' || p_email || ' sincronizado (UUID: ' || v_user_id || ', Nome: ' || v_nome_completo || ')';
END;
$$;

COMMENT ON FUNCTION public.sync_single_user IS
    'Sincroniza um único usuário do auth.users para colaboradores. Útil para usuários criados manualmente no Dashboard.';

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ CORREÇÃO APLICADA COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
    RAISE NOTICE '📝 Próximos passos:';
    RAISE NOTICE '';
    RAISE NOTICE '1. Vá em Authentication → Users no Dashboard';
    RAISE NOTICE '2. Clique em "Add User" e crie os usuários @minerva.com';
    RAISE NOTICE '3. Depois execute uma das opções:';
    RAISE NOTICE '';
    RAISE NOTICE '   Opção A - Sincronizar TODOS os 5 usuários de teste:';
    RAISE NOTICE '   SELECT * FROM public.sync_all_test_users();';
    RAISE NOTICE '';
    RAISE NOTICE '   Opção B - Sincronizar usuário específico:';
    RAISE NOTICE '   SELECT public.sync_single_user(''diretor@minerva.com'');';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE '';
END $$;
