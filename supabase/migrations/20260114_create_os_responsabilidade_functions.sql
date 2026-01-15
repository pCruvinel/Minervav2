-- ============================================================================
-- FUNÇÕES RPC PARA SISTEMA DE RESPONSABILIDADE
-- ============================================================================
-- Data: 2026-01-14
-- Descrição: Funções para gestão de delegação e permissões de etapas
-- ============================================================================

-- 1. Função RPC para obter responsável de uma etapa
CREATE OR REPLACE FUNCTION get_etapa_responsavel(p_etapa_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
    v_delegado record;
    v_etapa record;
BEGIN
    -- Buscar informações da etapa
    SELECT e.*, os.tipo_os, os.responsaveis_setores
    INTO v_etapa
    FROM os_etapas e
    JOIN ordens_servico os ON os.id = e.os_id
    WHERE e.id = p_etapa_id;
    
    IF v_etapa IS NULL THEN
        RETURN jsonb_build_object('error', 'Etapa não encontrada');
    END IF;
    
    -- Verificar se há delegação ativa
    SELECT er.*, c.nome as responsavel_nome, c.funcao as responsavel_funcao
    INTO v_delegado
    FROM os_etapas_responsavel er
    JOIN colaboradores c ON c.id = er.responsavel_id
    WHERE er.etapa_id = p_etapa_id
    AND er.ativo = true
    LIMIT 1;
    
    IF v_delegado IS NOT NULL THEN
        -- Retornar o delegado como responsável
        RETURN jsonb_build_object(
            'tipo', 'delegado',
            'responsavel_id', v_delegado.responsavel_id,
            'responsavel_nome', v_delegado.responsavel_nome,
            'responsavel_funcao', v_delegado.responsavel_funcao,
            'delegado_por_id', v_delegado.delegado_por_id,
            'delegado_em', v_delegado.delegado_em,
            'motivo', v_delegado.motivo
        );
    END IF;
    
    -- Se não há delegação, retornar info do setor (será preenchido pelo frontend)
    RETURN jsonb_build_object(
        'tipo', 'setor',
        'responsaveis_setores', v_etapa.responsaveis_setores,
        'etapa_ordem', v_etapa.ordem,
        'mensagem', 'Responsabilidade determinada pelo setor da etapa'
    );
END;
$$;

-- 2. Função RPC para delegar etapa
CREATE OR REPLACE FUNCTION delegar_etapa(
    p_etapa_id uuid,
    p_colaborador_id uuid,
    p_motivo text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_user_funcao text;
    v_etapa_ordem integer;
    v_os_id uuid;
BEGIN
    -- Obter usuário atual
    v_user_id := auth.uid();
    
    -- Verificar se é coordenador ou admin
    SELECT funcao INTO v_user_funcao
    FROM colaboradores
    WHERE id = v_user_id;
    
    IF v_user_funcao NOT IN ('admin', 'diretor', 'coord_administrativo', 'coord_obras', 'coord_assessoria') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Apenas coordenadores podem delegar etapas');
    END IF;
    
    -- Buscar informações da etapa
    SELECT ordem, os_id INTO v_etapa_ordem, v_os_id
    FROM os_etapas
    WHERE id = p_etapa_id;
    
    IF v_os_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'Etapa não encontrada');
    END IF;
    
    -- Desativar delegações anteriores desta etapa
    UPDATE os_etapas_responsavel
    SET ativo = false
    WHERE etapa_id = p_etapa_id AND ativo = true;
    
    -- Criar nova delegação
    INSERT INTO os_etapas_responsavel (etapa_id, responsavel_id, delegado_por_id, motivo)
    VALUES (p_etapa_id, p_colaborador_id, v_user_id, p_motivo);
    
    -- Registrar atividade
    INSERT INTO os_atividades (os_id, tipo_atividade, descricao, usuario_id, dados_adicionais)
    VALUES (
        v_os_id,
        'delegacao',
        format('Etapa %s delegada', v_etapa_ordem),
        v_user_id,
        jsonb_build_object(
            'etapa_id', p_etapa_id,
            'etapa_ordem', v_etapa_ordem,
            'delegado_para_id', p_colaborador_id,
            'motivo', p_motivo
        )
    );
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Etapa delegada com sucesso'
    );
END;
$$;

-- 3. Função RPC para revogar delegação
CREATE OR REPLACE FUNCTION revogar_delegacao(p_etapa_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_user_funcao text;
    v_etapa_ordem integer;
    v_os_id uuid;
    v_delegacao_existente boolean;
BEGIN
    v_user_id := auth.uid();
    
    -- Verificar permissão
    SELECT funcao INTO v_user_funcao
    FROM colaboradores
    WHERE id = v_user_id;
    
    IF v_user_funcao NOT IN ('admin', 'diretor', 'coord_administrativo', 'coord_obras', 'coord_assessoria') THEN
        RETURN jsonb_build_object('success', false, 'error', 'Sem permissão para revogar delegação');
    END IF;
    
    -- Verificar se existe delegação ativa
    SELECT EXISTS (
        SELECT 1 FROM os_etapas_responsavel
        WHERE etapa_id = p_etapa_id AND ativo = true
    ) INTO v_delegacao_existente;
    
    IF NOT v_delegacao_existente THEN
        RETURN jsonb_build_object('success', false, 'error', 'Não há delegação ativa para esta etapa');
    END IF;
    
    -- Buscar info da etapa
    SELECT ordem, os_id INTO v_etapa_ordem, v_os_id
    FROM os_etapas
    WHERE id = p_etapa_id;
    
    -- Desativar delegação
    UPDATE os_etapas_responsavel
    SET ativo = false
    WHERE etapa_id = p_etapa_id AND ativo = true;
    
    -- Registrar atividade
    INSERT INTO os_atividades (os_id, tipo_atividade, descricao, usuario_id, dados_adicionais)
    VALUES (
        v_os_id,
        'delegacao_revogada',
        format('Delegação da Etapa %s revogada', v_etapa_ordem),
        v_user_id,
        jsonb_build_object('etapa_id', p_etapa_id, 'etapa_ordem', v_etapa_ordem)
    );
    
    RETURN jsonb_build_object('success', true, 'message', 'Delegação revogada com sucesso');
END;
$$;

-- 4. Função RPC para verificar se usuário pode editar etapa
CREATE OR REPLACE FUNCTION pode_editar_etapa(p_etapa_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id uuid;
    v_user_funcao text;
    v_is_delegado boolean;
    v_is_participante boolean;
BEGIN
    v_user_id := auth.uid();
    
    -- Buscar função do usuário
    SELECT funcao INTO v_user_funcao
    FROM colaboradores
    WHERE id = v_user_id;
    
    -- Admin e diretor sempre podem editar
    IF v_user_funcao IN ('admin', 'diretor') THEN
        RETURN true;
    END IF;
    
    -- Verificar se é o responsável delegado
    SELECT EXISTS (
        SELECT 1 FROM os_etapas_responsavel
        WHERE etapa_id = p_etapa_id
        AND responsavel_id = v_user_id
        AND ativo = true
    ) INTO v_is_delegado;
    
    IF v_is_delegado THEN
        RETURN true;
    END IF;
    
    -- Verificar se é participante com permissão
    SELECT EXISTS (
        SELECT 1 FROM os_participantes p
        JOIN os_etapas e ON e.os_id = p.ordem_servico_id
        WHERE e.id = p_etapa_id
        AND p.colaborador_id = v_user_id
        AND p.papel IN ('responsavel', 'participante')
        AND (p.etapas_permitidas IS NULL OR e.ordem = ANY(p.etapas_permitidas))
    ) INTO v_is_participante;
    
    IF v_is_participante THEN
        RETURN true;
    END IF;
    
    -- Coordenadores podem editar etapas do seu setor
    -- (A verificação de setor será feita no frontend via os-ownership-rules)
    IF v_user_funcao IN ('coord_administrativo', 'coord_obras', 'coord_assessoria') THEN
        RETURN true; -- Frontend fará validação adicional de setor
    END IF;
    
    RETURN false;
END;
$$;

-- 5. Função para listar participantes de uma OS
CREATE OR REPLACE FUNCTION listar_participantes_os(p_os_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_result jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', p.id,
            'colaborador_id', p.colaborador_id,
            'colaborador_nome', c.nome,
            'colaborador_funcao', c.funcao,
            'papel', p.papel,
            'setor_id', p.setor_id,
            'setor_nome', s.nome,
            'etapas_permitidas', p.etapas_permitidas,
            'adicionado_em', p.adicionado_em,
            'observacao', p.observacao
        )
    )
    INTO v_result
    FROM os_participantes p
    JOIN colaboradores c ON c.id = p.colaborador_id
    LEFT JOIN setores s ON s.id = p.setor_id
    WHERE p.ordem_servico_id = p_os_id;
    
    RETURN COALESCE(v_result, '[]'::jsonb);
END;
$$;

-- 6. Conceder permissões
GRANT EXECUTE ON FUNCTION get_etapa_responsavel(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION delegar_etapa(uuid, uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION revogar_delegacao(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION pode_editar_etapa(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION listar_participantes_os(uuid) TO authenticated;
