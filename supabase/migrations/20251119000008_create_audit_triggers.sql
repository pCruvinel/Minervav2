-- ==========================================
-- MIGRATION: Criar Triggers de Auditoria
-- Data: 2025-11-19
-- Prioridade: 🟡 MÉDIA
-- Descrição: Criar triggers automáticos para auditoria e validações
-- ==========================================

BEGIN;

-- ==========================================
-- 1. Trigger: Auditoria de mudanças de role
-- ==========================================
CREATE OR REPLACE FUNCTION audit_role_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.role_nivel IS DISTINCT FROM NEW.role_nivel OR
     OLD.setor IS DISTINCT FROM NEW.setor OR
     OLD.ativo IS DISTINCT FROM NEW.ativo THEN

    INSERT INTO audit_log (
      usuario_id,
      acao,
      tabela_afetada,
      registro_id_afetado,
      dados_antigos,
      dados_novos
    ) VALUES (
      auth.uid(),
      'UPDATE_COLABORADOR',
      'colaboradores',
      NEW.id::text,
      jsonb_build_object(
        'role_nivel', OLD.role_nivel,
        'setor', OLD.setor,
        'ativo', OLD.ativo,
        'nome_completo', OLD.nome_completo
      ),
      jsonb_build_object(
        'role_nivel', NEW.role_nivel,
        'setor', NEW.setor,
        'ativo', NEW.ativo,
        'nome_completo', NEW.nome_completo
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_role_change ON colaboradores;

CREATE TRIGGER trigger_audit_role_change
  AFTER UPDATE ON colaboradores
  FOR EACH ROW
  WHEN (
    OLD.role_nivel IS DISTINCT FROM NEW.role_nivel OR
    OLD.setor IS DISTINCT FROM NEW.setor OR
    OLD.ativo IS DISTINCT FROM NEW.ativo
  )
  EXECUTE FUNCTION audit_role_change();

COMMENT ON FUNCTION audit_role_change IS 'Registra mudanças importantes em colaboradores no audit_log';

-- ==========================================
-- 2. Trigger: Auditoria de criação de OS
-- ==========================================
CREATE OR REPLACE FUNCTION audit_os_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    usuario_id,
    acao,
    tabela_afetada,
    registro_id_afetado,
    dados_novos
  ) VALUES (
    auth.uid(),
    'CREATE_OS',
    'ordens_servico',
    NEW.id::text,
    jsonb_build_object(
      'codigo_os', NEW.codigo_os,
      'cliente_id', NEW.cliente_id,
      'tipo_os_id', NEW.tipo_os_id,
      'responsavel_id', NEW.responsavel_id,
      'status_geral', NEW.status_geral
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_os_creation ON ordens_servico;

CREATE TRIGGER trigger_audit_os_creation
  AFTER INSERT ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION audit_os_creation();

-- ==========================================
-- 3. Trigger: Auto-gerar código de OS
-- ==========================================
CREATE OR REPLACE FUNCTION gerar_codigo_os()
RETURNS TRIGGER AS $$
DECLARE
  v_ano INTEGER;
  v_contador INTEGER;
  v_codigo TEXT;
BEGIN
  -- Se já tiver código, não gera novamente
  IF NEW.codigo_os IS NOT NULL AND NEW.codigo_os != '' THEN
    RETURN NEW;
  END IF;

  v_ano := EXTRACT(YEAR FROM NEW.data_entrada);

  -- Buscar último código do ano
  SELECT COALESCE(
    MAX(
      NULLIF(
        SUBSTRING(codigo_os FROM 'OS-' || v_ano::text || '-(\d+)'),
        ''
      )::INTEGER
    ), 0
  ) + 1 INTO v_contador
  FROM ordens_servico
  WHERE codigo_os LIKE 'OS-' || v_ano::text || '-%';

  -- Gerar código: OS-2025-0001
  NEW.codigo_os := 'OS-' || v_ano || '-' || LPAD(v_contador::TEXT, 4, '0');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_gerar_codigo_os ON ordens_servico;

CREATE TRIGGER trigger_gerar_codigo_os
  BEFORE INSERT ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION gerar_codigo_os();

COMMENT ON FUNCTION gerar_codigo_os IS 'Gera código automático para OS no formato OS-YYYY-NNNN';

-- ==========================================
-- 4. Trigger: Validar soma de alocação de CC
-- ==========================================
CREATE OR REPLACE FUNCTION validar_alocacao_cc()
RETURNS TRIGGER AS $$
DECLARE
  v_total_alocado NUMERIC;
  v_nome_colaborador TEXT;
BEGIN
  -- Calcular total já alocado (excluindo o registro atual se for UPDATE)
  SELECT COALESCE(SUM(percentual_alocado), 0) INTO v_total_alocado
  FROM colaborador_alocacoes_cc
  WHERE colaborador_id = NEW.colaborador_id
    AND (TG_OP = 'INSERT' OR cc_id != NEW.cc_id);

  -- Verificar se ultrapassa 100%
  IF v_total_alocado + NEW.percentual_alocado > 100 THEN
    -- Buscar nome do colaborador para mensagem mais clara
    SELECT nome_completo INTO v_nome_colaborador
    FROM colaboradores
    WHERE id = NEW.colaborador_id;

    RAISE EXCEPTION 'A soma das alocações do colaborador % (%) não pode exceder 100%%. Atual: %%, Tentando adicionar: %%',
      v_nome_colaborador,
      NEW.colaborador_id,
      v_total_alocado,
      NEW.percentual_alocado;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_alocacao_cc ON colaborador_alocacoes_cc;

CREATE TRIGGER trigger_validar_alocacao_cc
  BEFORE INSERT OR UPDATE ON colaborador_alocacoes_cc
  FOR EACH ROW
  EXECUTE FUNCTION validar_alocacao_cc();

COMMENT ON FUNCTION validar_alocacao_cc IS 'Valida que soma de alocações de um colaborador não excede 100%';

-- ==========================================
-- 5. Trigger: Auditoria de mudança de status de OS
-- ==========================================
CREATE OR REPLACE FUNCTION audit_os_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status_geral IS DISTINCT FROM NEW.status_geral THEN
    -- Inserir no histórico de status
    INSERT INTO os_historico_status (
      os_id,
      status_anterior,
      status_novo,
      alterado_por_id,
      observacoes
    ) VALUES (
      NEW.id,
      OLD.status_geral,
      NEW.status_geral,
      auth.uid(),
      NULL  -- Pode ser preenchido pela aplicação se necessário
    );

    -- Inserir no audit_log
    INSERT INTO audit_log (
      usuario_id,
      acao,
      tabela_afetada,
      registro_id_afetado,
      dados_antigos,
      dados_novos
    ) VALUES (
      auth.uid(),
      'UPDATE_OS_STATUS',
      'ordens_servico',
      NEW.id::text,
      jsonb_build_object(
        'status_geral', OLD.status_geral,
        'codigo_os', OLD.codigo_os
      ),
      jsonb_build_object(
        'status_geral', NEW.status_geral,
        'codigo_os', NEW.codigo_os
      )
    );

    -- Se status mudou para CONCLUIDA, preencher data_conclusao
    IF NEW.status_geral = 'CONCLUIDA' AND OLD.status_geral != 'CONCLUIDA' THEN
      NEW.data_conclusao := NOW();
    END IF;

    -- Se saiu de CONCLUIDA, limpar data_conclusao
    IF OLD.status_geral = 'CONCLUIDA' AND NEW.status_geral != 'CONCLUIDA' THEN
      NEW.data_conclusao := NULL;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_os_status_change ON ordens_servico;

CREATE TRIGGER trigger_audit_os_status_change
  BEFORE UPDATE ON ordens_servico
  FOR EACH ROW
  WHEN (OLD.status_geral IS DISTINCT FROM NEW.status_geral)
  EXECUTE FUNCTION audit_os_status_change();

COMMENT ON FUNCTION audit_os_status_change IS 'Audita mudanças de status e atualiza data_conclusao automaticamente';

-- ==========================================
-- 6. Trigger: Auditoria de criação de delegações
-- ==========================================
CREATE OR REPLACE FUNCTION audit_delegacao_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_log (
    usuario_id,
    acao,
    tabela_afetada,
    registro_id_afetado,
    dados_novos
  ) VALUES (
    auth.uid(),
    'CREATE_DELEGACAO',
    'delegacoes',
    NEW.id::text,
    jsonb_build_object(
      'os_id', NEW.os_id,
      'delegante_nome', NEW.delegante_nome,
      'delegado_nome', NEW.delegado_nome,
      'descricao_tarefa', NEW.descricao_tarefa,
      'status_delegacao', NEW.status_delegacao
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_delegacao_creation ON delegacoes;

CREATE TRIGGER trigger_audit_delegacao_creation
  AFTER INSERT ON delegacoes
  FOR EACH ROW
  EXECUTE FUNCTION audit_delegacao_creation();

-- ==========================================
-- 7. Trigger: Auditoria de mudança de status de delegação
-- ==========================================
CREATE OR REPLACE FUNCTION audit_delegacao_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status_delegacao IS DISTINCT FROM NEW.status_delegacao THEN
    INSERT INTO audit_log (
      usuario_id,
      acao,
      tabela_afetada,
      registro_id_afetado,
      dados_antigos,
      dados_novos
    ) VALUES (
      auth.uid(),
      'UPDATE_DELEGACAO_STATUS',
      'delegacoes',
      NEW.id::text,
      jsonb_build_object(
        'status_delegacao', OLD.status_delegacao,
        'observacoes', OLD.observacoes
      ),
      jsonb_build_object(
        'status_delegacao', NEW.status_delegacao,
        'observacoes', NEW.observacoes
      )
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_audit_delegacao_status_change ON delegacoes;

CREATE TRIGGER trigger_audit_delegacao_status_change
  AFTER UPDATE ON delegacoes
  FOR EACH ROW
  WHEN (OLD.status_delegacao IS DISTINCT FROM NEW.status_delegacao)
  EXECUTE FUNCTION audit_delegacao_status_change();

-- ==========================================
-- 8. Trigger: Validar data de conclusão de OS
-- ==========================================
CREATE OR REPLACE FUNCTION validar_data_conclusao_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Se status não for CONCLUIDA, data_conclusao deve ser NULL
  IF NEW.status_geral != 'CONCLUIDA' AND NEW.data_conclusao IS NOT NULL THEN
    RAISE EXCEPTION 'data_conclusao só pode ser preenchida quando status_geral = CONCLUIDA';
  END IF;

  -- Se status for CONCLUIDA, data_conclusao deve estar preenchida
  IF NEW.status_geral = 'CONCLUIDA' AND NEW.data_conclusao IS NULL THEN
    NEW.data_conclusao := NOW();
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_validar_data_conclusao_os ON ordens_servico;

CREATE TRIGGER trigger_validar_data_conclusao_os
  BEFORE INSERT OR UPDATE ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION validar_data_conclusao_os();

COMMIT;

-- ==========================================
-- Verificação Pós-Migration
-- ==========================================

-- Listar todos os triggers criados
SELECT
  event_object_table AS table_name,
  trigger_name,
  event_manipulation AS event,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name LIKE 'trigger_%'
ORDER BY event_object_table, trigger_name;

-- Testar audit_log (executar algumas ações e verificar)
-- SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10;

-- ==========================================
-- IMPORTANTE:
-- - Todos os triggers estão usando SECURITY DEFINER
-- - auth.uid() captura o usuário autenticado
-- - Audit_log registra todas as ações importantes
-- - Triggers de validação previnem dados inconsistentes
-- ==========================================
