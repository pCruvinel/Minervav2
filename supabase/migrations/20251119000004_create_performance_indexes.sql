-- ==========================================
-- MIGRATION: Criar Índices de Performance
-- Data: 2025-11-19
-- Prioridade: 🟡 ALTA
-- Descrição: Criar índices estratégicos para otimizar queries
-- ==========================================

BEGIN;

-- ==========================================
-- Índices para ordens_servico
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_os_status
  ON ordens_servico(status_geral)
  WHERE status_geral NOT IN ('CONCLUIDA', 'CANCELADA');

CREATE INDEX IF NOT EXISTS idx_os_cliente
  ON ordens_servico(cliente_id);

CREATE INDEX IF NOT EXISTS idx_os_responsavel
  ON ordens_servico(responsavel_id)
  WHERE responsavel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_os_created
  ON ordens_servico(data_entrada DESC);

CREATE INDEX IF NOT EXISTS idx_os_tipo
  ON ordens_servico(tipo_os_id);

CREATE INDEX IF NOT EXISTS idx_os_cc
  ON ordens_servico(cc_id)
  WHERE cc_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_os_prazo
  ON ordens_servico(data_prazo)
  WHERE data_prazo IS NOT NULL AND status_geral NOT IN ('CONCLUIDA', 'CANCELADA');

-- Índice composto para filtros comuns
CREATE INDEX IF NOT EXISTS idx_os_cliente_status
  ON ordens_servico(cliente_id, status_geral);

-- ==========================================
-- Índices para os_etapas
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_etapas_os
  ON os_etapas(os_id);

CREATE INDEX IF NOT EXISTS idx_etapas_status
  ON os_etapas(status)
  WHERE status NOT IN ('APROVADA', 'REJEITADA');

CREATE INDEX IF NOT EXISTS idx_etapas_responsavel
  ON os_etapas(responsavel_id)
  WHERE responsavel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_etapas_ordem
  ON os_etapas(os_id, ordem);

-- Índice composto para queries comuns
CREATE INDEX IF NOT EXISTS idx_etapas_os_status
  ON os_etapas(os_id, status);

-- ==========================================
-- Índices para os_anexos
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_anexos_os
  ON os_anexos(os_id);

CREATE INDEX IF NOT EXISTS idx_anexos_etapa
  ON os_anexos(etapa_id)
  WHERE etapa_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_anexos_tipo
  ON os_anexos(tipo_anexo)
  WHERE tipo_anexo IS NOT NULL;

-- ==========================================
-- Índices para clientes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_clientes_status
  ON clientes(status);

CREATE INDEX IF NOT EXISTS idx_clientes_responsavel
  ON clientes(responsavel_id)
  WHERE responsavel_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_clientes_cpf_cnpj
  ON clientes(cpf_cnpj)
  WHERE cpf_cnpj IS NOT NULL;

-- ==========================================
-- Índices para colaboradores
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_colaboradores_ativo
  ON colaboradores(ativo)
  WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_colaboradores_role
  ON colaboradores(role_nivel);

CREATE INDEX IF NOT EXISTS idx_colaboradores_setor
  ON colaboradores(setor)
  WHERE setor IS NOT NULL;

-- ==========================================
-- Índices para financeiro_lancamentos
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_lancamentos_vencimento
  ON financeiro_lancamentos(data_vencimento DESC);

CREATE INDEX IF NOT EXISTS idx_lancamentos_tipo
  ON financeiro_lancamentos(tipo);

CREATE INDEX IF NOT EXISTS idx_lancamentos_cc
  ON financeiro_lancamentos(cc_id)
  WHERE cc_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lancamentos_cliente
  ON financeiro_lancamentos(cliente_id)
  WHERE cliente_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_lancamentos_conciliado
  ON financeiro_lancamentos(conciliado)
  WHERE conciliado = false;

-- ==========================================
-- Índices para delegacoes
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_delegacoes_status
  ON delegacoes(status_delegacao)
  WHERE status_delegacao NOT IN ('CONCLUIDA', 'REPROVADA');

CREATE INDEX IF NOT EXISTS idx_delegacoes_prazo
  ON delegacoes(data_prazo)
  WHERE data_prazo IS NOT NULL AND status_delegacao IN ('PENDENTE', 'EM_PROGRESSO');

-- ==========================================
-- Índices para agendamentos
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_agendamentos_data
  ON agendamentos(data DESC);

CREATE INDEX IF NOT EXISTS idx_agendamentos_status
  ON agendamentos(status)
  WHERE status = 'confirmado';

CREATE INDEX IF NOT EXISTS idx_agendamentos_os
  ON agendamentos(os_id)
  WHERE os_id IS NOT NULL;

-- ==========================================
-- Índices para audit_log
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_audit_created
  ON audit_log(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_usuario
  ON audit_log(usuario_id)
  WHERE usuario_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_audit_tabela
  ON audit_log(tabela_afetada);

CREATE INDEX IF NOT EXISTS idx_audit_acao
  ON audit_log(acao);

-- ==========================================
-- Índices para os_historico_status
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_historico_os
  ON os_historico_status(os_id);

CREATE INDEX IF NOT EXISTS idx_historico_created
  ON os_historico_status(created_at DESC);

-- ==========================================
-- Comentários
-- ==========================================

COMMENT ON INDEX idx_os_status IS 'Otimiza filtros por status de OS (apenas ativas)';
COMMENT ON INDEX idx_os_prazo IS 'Otimiza busca de OS com prazo próximo';
COMMENT ON INDEX idx_etapas_os_status IS 'Otimiza busca de etapas por OS e status';
COMMENT ON INDEX idx_lancamentos_conciliado IS 'Otimiza busca de lançamentos não conciliados';

COMMIT;

-- ==========================================
-- Verificação Pós-Migration
-- ==========================================

-- Ver todos os índices criados
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- ==========================================
-- Performance Impact Analysis (executar após criar índices)
-- ==========================================

-- Analisar tabelas para atualizar estatísticas
ANALYZE ordens_servico;
ANALYZE os_etapas;
ANALYZE os_anexos;
ANALYZE clientes;
ANALYZE colaboradores;
ANALYZE financeiro_lancamentos;
ANALYZE delegacoes;
ANALYZE agendamentos;
ANALYZE audit_log;

-- ==========================================
-- Próximos passos:
-- 1. Monitorar queries lentas: SELECT * FROM pg_stat_statements ORDER BY total_exec_time DESC;
-- 2. Verificar uso dos índices: SELECT * FROM pg_stat_user_indexes;
-- 3. Identificar índices não usados para possível remoção
-- ==========================================
