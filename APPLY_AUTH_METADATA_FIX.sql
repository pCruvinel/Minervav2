-- =====================================================
-- SCRIPT: Correção de Sincronização de Cargo no Login
-- =====================================================
-- INSTRUÇÕES:
-- 1. Abra o Supabase Dashboard
-- 2. Vá em: SQL Editor
-- 3. Cole TODO este script
-- 4. Clique em "Run" (ou Ctrl+Enter)
-- 5. Aguarde a mensagem de sucesso
-- =====================================================

-- STEP 1: Função de Sincronização
-- =====================================================

CREATE OR REPLACE FUNCTION sync_colaborador_to_auth_metadata()
RETURNS TRIGGER AS $$
DECLARE
  v_cargo_slug text;
  v_cargo_nivel int;
  v_setor_slug text;
BEGIN
  -- Buscar dados do cargo
  SELECT slug, nivel_acesso
  INTO v_cargo_slug, v_cargo_nivel
  FROM cargos
  WHERE id = NEW.cargo_id;

  -- Buscar slug do setor
  SELECT slug
  INTO v_setor_slug
  FROM setores
  WHERE id = NEW.setor_id;

  -- Atualizar metadata no auth.users
  UPDATE auth.users
  SET raw_user_meta_data = jsonb_build_object(
    'cargo_slug', COALESCE(v_cargo_slug, 'colaborador'),
    'cargo_nivel', COALESCE(v_cargo_nivel, 1),
    'setor_slug', COALESCE(v_setor_slug, 'obras'),
    'nome_completo', NEW.nome_completo,
    'ativo', COALESCE(NEW.ativo, true)
  )
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 2: Criar Trigger
-- =====================================================

DROP TRIGGER IF EXISTS trigger_sync_colaborador_metadata ON colaboradores;

CREATE TRIGGER trigger_sync_colaborador_metadata
  AFTER INSERT OR UPDATE ON colaboradores
  FOR EACH ROW
  EXECUTE FUNCTION sync_colaborador_to_auth_metadata();

-- STEP 3: Funções Helper para RLS
-- =====================================================

-- Função: Obter cargo_slug do metadata
CREATE OR REPLACE FUNCTION get_my_cargo_slug_from_meta()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'cargo_slug',
    'colaborador'
  );
$$ LANGUAGE sql STABLE;

-- Função: Obter cargo_nivel do metadata
CREATE OR REPLACE FUNCTION get_my_cargo_nivel_from_meta()
RETURNS INTEGER AS $$
  SELECT COALESCE(
    (auth.jwt() -> 'user_metadata' ->> 'cargo_nivel')::int,
    1
  );
$$ LANGUAGE sql STABLE;

-- Função: Obter setor_slug do metadata
CREATE OR REPLACE FUNCTION get_my_setor_slug_from_meta()
RETURNS TEXT AS $$
  SELECT COALESCE(
    auth.jwt() -> 'user_metadata' ->> 'setor_slug',
    'obras'
  );
$$ LANGUAGE sql STABLE;

-- STEP 4: Grants
-- =====================================================

GRANT EXECUTE ON FUNCTION get_my_cargo_slug_from_meta() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_cargo_nivel_from_meta() TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_setor_slug_from_meta() TO authenticated;

-- STEP 5: Migração de Dados Existentes
-- =====================================================

-- Popula metadata de TODOS os usuários existentes
-- O trigger vai executar e sincronizar automaticamente
DO $$
DECLARE
  v_count int;
BEGIN
  -- Força update em todos colaboradores
  UPDATE colaboradores
  SET ativo = COALESCE(ativo, true);

  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Sincronizados % colaboradores para auth.users metadata', v_count;
END $$;

-- =====================================================
-- VERIFICAÇÃO: Execute esta query separadamente DEPOIS
-- =====================================================
/*
SELECT
  c.email,
  c.nome_completo,
  ca.slug as cargo_atual,
  s.slug as setor_atual,
  au.raw_user_meta_data->>'cargo_slug' as metadata_cargo,
  au.raw_user_meta_data->>'setor_slug' as metadata_setor,
  au.raw_user_meta_data->>'cargo_nivel' as metadata_nivel
FROM colaboradores c
LEFT JOIN cargos ca ON c.cargo_id = ca.id
LEFT JOIN setores s ON c.setor_id = s.id
LEFT JOIN auth.users au ON c.id = au.id
WHERE c.email = 'SEU_EMAIL@minerva.com';
-- Substitua 'SEU_EMAIL@minerva.com' pelo seu email real
*/
