-- =====================================================
-- Migration: Sync Cargo/Setor to Auth Metadata
-- Data: 2025-11-23
-- Descrição: Arquitetura de Longo Prazo - Armazena permissões no auth.users.raw_user_meta_data
--            Elimina necessidade de JOINs complexos em toda autenticação
-- =====================================================

-- =====================================================
-- 1. FUNÇÃO: Sincronizar metadata do colaborador para auth.users
-- =====================================================

CREATE OR REPLACE FUNCTION public.sync_colaborador_to_auth_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Necessário para acessar auth.users
SET search_path = public, auth
AS $$
DECLARE
  v_cargo_slug text;
  v_cargo_nivel integer;
  v_setor_slug text;
  v_metadata jsonb;
BEGIN
  -- Buscar dados do cargo e setor (se existirem)
  SELECT
    cargos.slug,
    cargos.nivel_acesso,
    setores.slug
  INTO
    v_cargo_slug,
    v_cargo_nivel,
    v_setor_slug
  FROM colaboradores
  LEFT JOIN cargos ON colaboradores.cargo_id = cargos.id
  LEFT JOIN setores ON colaboradores.setor_id = setores.id
  WHERE colaboradores.id = NEW.id;

  -- Construir objeto de metadata
  v_metadata := jsonb_build_object(
    'cargo_slug', COALESCE(v_cargo_slug, 'colaborador'),
    'cargo_nivel', COALESCE(v_cargo_nivel, 1),
    'setor_slug', COALESCE(v_setor_slug, 'obras'),
    'nome_completo', NEW.nome_completo,
    'email', NEW.email,
    'ativo', NEW.ativo,
    'synced_at', NOW()
  );

  -- Atualizar auth.users.raw_user_meta_data
  UPDATE auth.users
  SET raw_user_meta_data = raw_user_meta_data || v_metadata
  WHERE id = NEW.id;

  -- Log para debug
  RAISE NOTICE 'Metadata sincronizada para usuário %: cargo=%, setor=%',
    NEW.email, v_cargo_slug, v_setor_slug;

  RETURN NEW;
END;
$$;

-- Comentário
COMMENT ON FUNCTION public.sync_colaborador_to_auth_metadata() IS
'Sincroniza automaticamente cargo_slug, setor_slug e nivel_acesso para auth.users.raw_user_meta_data.
Executado via trigger em INSERT/UPDATE de colaboradores.';

-- =====================================================
-- 2. TRIGGERS: Executar sincronização automaticamente
-- =====================================================

-- Remover trigger antigo se existir
DROP TRIGGER IF EXISTS trigger_sync_colaborador_metadata ON colaboradores;

-- Trigger AFTER INSERT OR UPDATE
CREATE TRIGGER trigger_sync_colaborador_metadata
AFTER INSERT OR UPDATE OF cargo_id, setor_id, nome_completo, email, ativo
ON colaboradores
FOR EACH ROW
EXECUTE FUNCTION sync_colaborador_to_auth_metadata();

COMMENT ON TRIGGER trigger_sync_colaborador_metadata ON colaboradores IS
'Dispara sincronização de metadata sempre que cargo, setor ou dados básicos mudam.';

-- =====================================================
-- 3. FUNÇÕES HELPER: Ler metadata facilmente (para RLS)
-- =====================================================

-- Função: Retorna cargo_slug do usuário logado (via metadata)
CREATE OR REPLACE FUNCTION public.get_my_cargo_slug_from_meta()
RETURNS TEXT
LANGUAGE SQL
SECURITY INVOKER -- Roda com permissões do usuário (mais seguro que DEFINER aqui)
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'cargo_slug')::text,
    'colaborador'
  );
$$;

-- Função: Retorna cargo_nivel do usuário logado (via metadata)
CREATE OR REPLACE FUNCTION public.get_my_cargo_nivel_from_meta()
RETURNS INTEGER
LANGUAGE SQL
SECURITY INVOKER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'cargo_nivel')::integer,
    1
  );
$$;

-- Função: Retorna setor_slug do usuário logado (via metadata)
CREATE OR REPLACE FUNCTION public.get_my_setor_slug_from_meta()
RETURNS TEXT
LANGUAGE SQL
SECURITY INVOKER
STABLE
AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'setor_slug')::text,
    'obras'
  );
$$;

-- Comentários
COMMENT ON FUNCTION public.get_my_cargo_slug_from_meta() IS
'Retorna cargo_slug do JWT (user_metadata). Usado em policies RLS. Sem JOIN!';

COMMENT ON FUNCTION public.get_my_cargo_nivel_from_meta() IS
'Retorna cargo_nivel do JWT (user_metadata). Usado em policies RLS. Sem JOIN!';

COMMENT ON FUNCTION public.get_my_setor_slug_from_meta() IS
'Retorna setor_slug do JWT (user_metadata). Usado em policies RLS. Sem JOIN!';

-- =====================================================
-- 4. GRANTS
-- =====================================================

GRANT EXECUTE ON FUNCTION public.get_my_cargo_slug_from_meta() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_cargo_nivel_from_meta() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_my_setor_slug_from_meta() TO authenticated;

-- =====================================================
-- 5. MIGRAÇÃO DE DADOS EXISTENTES (Executar uma vez)
-- =====================================================

-- Atualizar metadata de todos os usuários existentes
DO $$
DECLARE
  v_user RECORD;
  v_count INTEGER := 0;
BEGIN
  FOR v_user IN
    SELECT id FROM colaboradores WHERE ativo = true
  LOOP
    -- Dispara o trigger manualmente via UPDATE
    UPDATE colaboradores
    SET updated_at = NOW()
    WHERE id = v_user.id;

    v_count := v_count + 1;
  END LOOP;

  RAISE NOTICE 'Metadata sincronizada para % usuários', v_count;
END $$;

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
