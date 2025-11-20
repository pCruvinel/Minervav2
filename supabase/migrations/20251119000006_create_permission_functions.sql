-- ==========================================
-- MIGRATION: Funções de Validação de Permissões
-- Data: 2025-11-19
-- Prioridade: 🟡 MÉDIA
-- Descrição: Criar funções SQL para validar permissões de usuários
-- ==========================================

BEGIN;

-- ==========================================
-- 1. Função: Verificar se usuário pode ver OS
-- ==========================================
CREATE OR REPLACE FUNCTION pode_ver_os(
  p_user_id UUID,
  p_os_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role_nivel;
  v_setor user_setor;
  v_os_setor user_setor;
BEGIN
  -- Buscar role e setor do usuário
  SELECT role_nivel, setor INTO v_role, v_setor
  FROM colaboradores
  WHERE id = p_user_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- MOBRA não vê OS
  IF v_role = 'MOBRA' THEN
    RETURN false;
  END IF;

  -- Diretoria vê tudo
  IF v_role = 'DIRETORIA' THEN
    RETURN true;
  END IF;

  -- Gestor Administrativo vê tudo
  IF v_role = 'GESTOR_ADMINISTRATIVO' THEN
    RETURN true;
  END IF;

  -- Buscar setor da OS
  SELECT t.setor_padrao INTO v_os_setor
  FROM ordens_servico os
  JOIN tipos_os t ON os.tipo_os_id = t.id
  WHERE os.id = p_os_id;

  -- Gestor de Setor vê apenas seu setor
  IF v_role IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN
    RETURN v_setor = v_os_setor;
  END IF;

  -- Colaborador vê se é responsável ou delegado
  IF v_role LIKE 'COLABORADOR_%' THEN
    RETURN EXISTS (
      SELECT 1 FROM ordens_servico
      WHERE id = p_os_id
      AND (
        responsavel_id = p_user_id OR
        EXISTS (
          SELECT 1 FROM delegacoes
          WHERE os_id = p_os_id
          AND delegado_id = p_user_id
          AND status_delegacao NOT IN ('REPROVADA', 'CONCLUIDA')
        )
      )
    );
  END IF;

  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION pode_ver_os IS 'Verifica se usuário tem permissão para visualizar uma OS';

-- ==========================================
-- 2. Função: Verificar se usuário pode editar OS
-- ==========================================
CREATE OR REPLACE FUNCTION pode_editar_os(
  p_user_id UUID,
  p_os_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_role user_role_nivel;
  v_setor user_setor;
  v_os_setor user_setor;
BEGIN
  SELECT role_nivel, setor INTO v_role, v_setor
  FROM colaboradores
  WHERE id = p_user_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN false;
  END IF;

  -- Diretoria pode editar tudo
  IF v_role = 'DIRETORIA' THEN
    RETURN true;
  END IF;

  -- Gestor Administrativo pode editar tudo
  IF v_role = 'GESTOR_ADMINISTRATIVO' THEN
    RETURN true;
  END IF;

  -- Buscar setor da OS
  SELECT t.setor_padrao INTO v_os_setor
  FROM ordens_servico os
  JOIN tipos_os t ON os.tipo_os_id = t.id
  WHERE os.id = p_os_id;

  -- Gestor de Setor pode editar apenas seu setor
  IF v_role IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN
    RETURN v_setor = v_os_setor;
  END IF;

  -- Colaboradores não podem editar OS (apenas etapas)
  RETURN false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION pode_editar_os IS 'Verifica se usuário pode editar uma OS';

-- ==========================================
-- 3. Função: Verificar se pode criar delegação
-- ==========================================
CREATE OR REPLACE FUNCTION pode_criar_delegacao(
  p_delegante_id UUID,
  p_delegado_id UUID,
  p_os_id UUID
)
RETURNS JSONB AS $$
DECLARE
  v_delegante_role user_role_nivel;
  v_delegante_setor user_setor;
  v_delegado_role user_role_nivel;
  v_delegado_setor user_setor;
  v_delegado_ativo boolean;
  v_os_setor user_setor;
BEGIN
  -- Buscar dados do delegante
  SELECT role_nivel, setor INTO v_delegante_role, v_delegante_setor
  FROM colaboradores
  WHERE id = p_delegante_id AND ativo = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Delegante não encontrado ou inativo'
    );
  END IF;

  -- Buscar dados do delegado
  SELECT role_nivel, setor, ativo INTO v_delegado_role, v_delegado_setor, v_delegado_ativo
  FROM colaboradores
  WHERE id = p_delegado_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Delegado não encontrado'
    );
  END IF;

  -- Verificar se delegado está ativo
  IF NOT v_delegado_ativo THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Não é possível delegar para colaborador inativo'
    );
  END IF;

  -- Verificar auto-delegação
  IF p_delegante_id = p_delegado_id THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Não é possível delegar para si mesmo'
    );
  END IF;

  -- MOBRA não pode receber delegações
  IF v_delegado_role = 'MOBRA' THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Não é possível delegar para mão de obra (MOBRA)'
    );
  END IF;

  -- Apenas gestores+ podem delegar
  IF v_delegante_role NOT IN ('DIRETORIA', 'GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN
    RETURN jsonb_build_object(
      'valido', false,
      'mensagem', 'Apenas gestores e diretoria podem delegar tarefas'
    );
  END IF;

  -- Buscar setor da OS
  SELECT t.setor_padrao INTO v_os_setor
  FROM ordens_servico os
  JOIN tipos_os t ON os.tipo_os_id = t.id
  WHERE os.id = p_os_id;

  -- Diretoria e Gestor Administrativo podem delegar para qualquer setor
  IF v_delegante_role IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO') THEN
    RETURN jsonb_build_object('valido', true);
  END IF;

  -- Gestor de Setor só pode delegar dentro do seu setor
  IF v_delegante_role IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS') THEN
    IF v_delegante_setor != v_delegado_setor THEN
      RETURN jsonb_build_object(
        'valido', false,
        'mensagem', 'Gestor de setor só pode delegar dentro do próprio setor'
      );
    END IF;
  END IF;

  RETURN jsonb_build_object('valido', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION pode_criar_delegacao IS 'Valida se uma delegação pode ser criada entre dois colaboradores';

-- ==========================================
-- 4. Função: Obter permissões do usuário
-- ==========================================
CREATE OR REPLACE FUNCTION obter_permissoes_usuario(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
  v_user colaboradores%ROWTYPE;
  v_result JSONB;
BEGIN
  SELECT * INTO v_user
  FROM colaboradores
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  v_result := jsonb_build_object(
    'user_id', v_user.id,
    'nome', v_user.nome_completo,
    'role', v_user.role_nivel,
    'setor', v_user.setor,
    'ativo', v_user.ativo,

    -- Permissões booleanas
    'pode_criar_os', v_user.role_nivel NOT IN ('MOBRA', 'COLABORADOR_ADMINISTRATIVO', 'COLABORADOR_ASSESSORIA', 'COLABORADOR_OBRAS'),
    'pode_delegar', v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS'),
    'pode_aprovar', v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS'),
    'pode_gerenciar_usuarios', v_user.role_nivel = 'DIRETORIA',
    'acesso_financeiro', v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO'),
    'acesso_todos_setores', v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO'),

    -- Nível hierárquico
    'nivel_hierarquico', CASE v_user.role_nivel
      WHEN 'MOBRA' THEN 1
      WHEN 'COLABORADOR_ADMINISTRATIVO' THEN 2
      WHEN 'COLABORADOR_ASSESSORIA' THEN 2
      WHEN 'COLABORADOR_OBRAS' THEN 2
      WHEN 'GESTOR_ADMINISTRATIVO' THEN 3
      WHEN 'GESTOR_ASSESSORIA' THEN 3
      WHEN 'GESTOR_OBRAS' THEN 3
      WHEN 'DIRETORIA' THEN 4
      ELSE 0
    END,

    -- Setores que pode acessar
    'setores_acesso', CASE
      WHEN v_user.role_nivel IN ('DIRETORIA', 'GESTOR_ADMINISTRATIVO') THEN
        jsonb_build_array('ADMINISTRATIVO', 'ASSESSORIA', 'OBRAS')
      WHEN v_user.setor IS NOT NULL THEN
        jsonb_build_array(v_user.setor)
      ELSE
        jsonb_build_array()
    END
  );

  RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION obter_permissoes_usuario IS 'Retorna objeto JSON com todas as permissões do usuário';

-- ==========================================
-- 5. Função: Verificar se usuário é superior hierárquico
-- ==========================================
CREATE OR REPLACE FUNCTION eh_superior_hierarquico(
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
  v_nivel1 INTEGER;
  v_nivel2 INTEGER;
BEGIN
  -- Obter níveis hierárquicos
  SELECT CASE role_nivel
    WHEN 'MOBRA' THEN 1
    WHEN 'COLABORADOR_ADMINISTRATIVO' THEN 2
    WHEN 'COLABORADOR_ASSESSORIA' THEN 2
    WHEN 'COLABORADOR_OBRAS' THEN 2
    WHEN 'GESTOR_ADMINISTRATIVO' THEN 3
    WHEN 'GESTOR_ASSESSORIA' THEN 3
    WHEN 'GESTOR_OBRAS' THEN 3
    WHEN 'DIRETORIA' THEN 4
    ELSE 0
  END INTO v_nivel1
  FROM colaboradores
  WHERE id = p_user1_id;

  SELECT CASE role_nivel
    WHEN 'MOBRA' THEN 1
    WHEN 'COLABORADOR_ADMINISTRATIVO' THEN 2
    WHEN 'COLABORADOR_ASSESSORIA' THEN 2
    WHEN 'COLABORADOR_OBRAS' THEN 2
    WHEN 'GESTOR_ADMINISTRATIVO' THEN 3
    WHEN 'GESTOR_ASSESSORIA' THEN 3
    WHEN 'GESTOR_OBRAS' THEN 3
    WHEN 'DIRETORIA' THEN 4
    ELSE 0
  END INTO v_nivel2
  FROM colaboradores
  WHERE id = p_user2_id;

  RETURN v_nivel1 > v_nivel2;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION eh_superior_hierarquico IS 'Verifica se user1 é superior hierárquico a user2';

COMMIT;

-- ==========================================
-- Testes das Funções
-- ==========================================

-- Teste 1: Obter permissões de um usuário
-- SELECT obter_permissoes_usuario(auth.uid());

-- Teste 2: Verificar se pode ver uma OS
-- SELECT pode_ver_os(auth.uid(), 'uuid-da-os');

-- Teste 3: Verificar se pode editar uma OS
-- SELECT pode_editar_os(auth.uid(), 'uuid-da-os');

-- Teste 4: Validar delegação
-- SELECT pode_criar_delegacao('uuid-delegante', 'uuid-delegado', 'uuid-os');

-- Teste 5: Verificar hierarquia
-- SELECT eh_superior_hierarquico('uuid-user1', 'uuid-user2');

-- ==========================================
-- Grant de permissões
-- ==========================================

GRANT EXECUTE ON FUNCTION pode_ver_os TO authenticated;
GRANT EXECUTE ON FUNCTION pode_editar_os TO authenticated;
GRANT EXECUTE ON FUNCTION pode_criar_delegacao TO authenticated;
GRANT EXECUTE ON FUNCTION obter_permissoes_usuario TO authenticated;
GRANT EXECUTE ON FUNCTION eh_superior_hierarquico TO authenticated;
