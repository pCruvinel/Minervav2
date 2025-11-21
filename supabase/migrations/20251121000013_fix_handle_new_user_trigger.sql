-- =====================================================
-- MIGRATION: Fix handle_new_user Trigger
-- Data: 2025-11-21
-- Descrição: Corrige trigger que causa erro ao criar usuários no Dashboard
--
-- PROBLEMA IDENTIFICADO:
-- Ao criar usuário no Dashboard Supabase, o trigger on_auth_user_created
-- tenta inserir em colaboradores sem nome_completo, causando:
-- "null value in column 'nome_completo' of relation 'colaboradores' violates not-null constraint"
--
-- CAUSA:
-- O trigger usa raw_user_meta_data->>'nome_completo' que é NULL quando
-- usuário é criado via Dashboard sem metadata customizado.
--
-- SOLUÇÃO:
-- Opção escolhida: DESABILITAR o trigger automático e usar sync manual.
-- Motivo: Permite controle total sobre quando sincronizar e com quais dados.
-- =====================================================

BEGIN;

-- =====================================================
-- PARTE 1: Desabilitar Trigger Automático
-- =====================================================

-- Remover trigger que causa o problema
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Manter a função handle_new_user() caso seja útil no futuro,
-- mas ela não será mais executada automaticamente
COMMENT ON FUNCTION public.handle_new_user IS
  'DESABILITADA: Função não é mais chamada automaticamente. Use sync_all_test_users() para sincronização manual.';

-- =====================================================
-- PARTE 2: Melhorar Função de Sincronização Manual
-- =====================================================

-- A função sync_all_test_users() já existe da migration anterior
-- e é a forma recomendada de sincronizar usuários.

-- Criar função adicional para sincronizar UM usuário específico
CREATE OR REPLACE FUNCTION public.sync_single_user(p_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_nome_completo TEXT;
    v_result TEXT;
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

    RETURN 'OK: Usuário ' || p_email || ' sincronizado como colaborador (UUID: ' || v_user_id || ', Nome: ' || v_nome_completo || ')';
END;
$$;

COMMENT ON FUNCTION public.sync_single_user IS
    'Sincroniza um único usuário do auth.users para colaboradores. Útil para usuários criados manualmente no Dashboard.';

COMMIT;

-- =====================================================
-- PARTE 3: Instruções de Uso
-- =====================================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '=== Trigger Automático DESABILITADO ===';
    RAISE NOTICE '';
    RAISE NOTICE '✅ O trigger on_auth_user_created foi removido.';
    RAISE NOTICE '✅ Agora você pode criar usuários no Dashboard sem erros.';
    RAISE NOTICE '';
    RAISE NOTICE '📝 IMPORTANTE: Após criar usuários, sincronize manualmente:';
    RAISE NOTICE '';
    RAISE NOTICE '   Opção 1 - Sincronizar TODOS os usuários de teste:';
    RAISE NOTICE '   SELECT * FROM public.sync_all_test_users();';
    RAISE NOTICE '';
    RAISE NOTICE '   Opção 2 - Sincronizar usuário específico:';
    RAISE NOTICE '   SELECT public.sync_single_user(''diretor@minerva.com'');';
    RAISE NOTICE '';
    RAISE NOTICE '💡 A função sync_single_user() usa dados padrão:';
    RAISE NOTICE '   - nome_completo: Extraído do email';
    RAISE NOTICE '   - role_nivel: COLABORADOR_ADMINISTRATIVO';
    RAISE NOTICE '   - setor: ADMINISTRATIVO';
    RAISE NOTICE '   - ativo: true';
    RAISE NOTICE '';
    RAISE NOTICE '   Depois você pode atualizar manualmente com os dados corretos.';
    RAISE NOTICE '';
END $$;
