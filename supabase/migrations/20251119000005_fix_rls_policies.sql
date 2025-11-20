-- ==========================================
-- MIGRATION: Corrigir Políticas RLS
-- Data: 2025-11-19
-- Prioridade: 🔴 ALTA (Segurança)
-- Descrição: Corrigir referências a campos inexistentes e adicionar políticas faltantes
-- ==========================================

BEGIN;

-- ==========================================
-- 1. CORRIGIR POLÍTICAS DE TURNOS
-- ==========================================

-- Remover políticas antigas que usam campo errado
DROP POLICY IF EXISTS "Apenas admins podem gerenciar turnos" ON turnos;
DROP POLICY IF EXISTS "Turnos ativos são visíveis para todos" ON turnos;

-- Criar políticas corrigidas
CREATE POLICY "turnos_view_all"
ON turnos FOR SELECT
USING (ativo = true);

CREATE POLICY "turnos_manage_admin"
ON turnos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE colaboradores.id = auth.uid()
    AND colaboradores.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL')
  )
);

COMMENT ON POLICY "turnos_view_all" ON turnos IS 'Todos usuários autenticados podem ver turnos ativos';
COMMENT ON POLICY "turnos_manage_admin" ON turnos IS 'Apenas Diretoria e Gestor Comercial podem gerenciar turnos';

-- ==========================================
-- 2. CORRIGIR POLÍTICAS DE AGENDAMENTOS
-- ==========================================

DROP POLICY IF EXISTS "Admins podem gerenciar todos agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Agendamentos confirmados são visíveis para todos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem criar agendamentos" ON agendamentos;
DROP POLICY IF EXISTS "Usuários podem gerenciar seus agendamentos" ON agendamentos;

-- Visualização de agendamentos confirmados
CREATE POLICY "agendamentos_view_confirmed"
ON agendamentos FOR SELECT
USING (status IN ('confirmado', 'realizado'));

-- Usuários podem criar seus próprios agendamentos
CREATE POLICY "agendamentos_create_own"
ON agendamentos FOR INSERT
WITH CHECK (auth.uid() = criado_por);

-- Usuários podem atualizar/cancelar seus próprios agendamentos
CREATE POLICY "agendamentos_update_own"
ON agendamentos FOR UPDATE
USING (auth.uid() = criado_por);

-- Admins podem gerenciar todos os agendamentos
CREATE POLICY "agendamentos_manage_admin"
ON agendamentos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE colaboradores.id = auth.uid()
    AND colaboradores.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL')
  )
);

-- ==========================================
-- 3. ADICIONAR/CORRIGIR POLÍTICAS DE COLABORADORES
-- ==========================================

-- Remover políticas antigas se existirem
DROP POLICY IF EXISTS "colaboradores_view_all" ON colaboradores;
DROP POLICY IF EXISTS "colaboradores_update_self" ON colaboradores;
DROP POLICY IF EXISTS "colaboradores_manage_admin" ON colaboradores;

-- Diretoria vê todos
CREATE POLICY "colaboradores_view_diretoria"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel = 'DIRETORIA'
  )
);

-- Gestor Comercial vê todos
CREATE POLICY "colaboradores_view_gestor_comercial"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel = 'GESTOR_COMERCIAL'
  )
);

-- Gestor de Setor vê apenas seu setor
CREATE POLICY "colaboradores_view_gestor_setor"
ON colaboradores FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
    AND colaboradores.setor = c.setor
  )
);

-- Usuário vê a si mesmo
CREATE POLICY "colaboradores_view_self"
ON colaboradores FOR SELECT
USING (id = auth.uid());

-- Apenas Diretoria pode gerenciar colaboradores
CREATE POLICY "colaboradores_manage_diretoria"
ON colaboradores FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'DIRETORIA'
  )
);

-- ==========================================
-- 4. ADICIONAR/CORRIGIR POLÍTICAS DE ORDENS_SERVICO
-- ==========================================

DROP POLICY IF EXISTS "os_view_all" ON ordens_servico;
DROP POLICY IF EXISTS "os_manage_all" ON ordens_servico;

-- Diretoria vê todas
CREATE POLICY "os_view_diretoria"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'DIRETORIA'
  )
);

-- Gestor Comercial vê todas
CREATE POLICY "os_view_gestor_comercial"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel = 'GESTOR_COMERCIAL'
  )
);

-- Gestor de Setor vê apenas seu setor
CREATE POLICY "os_view_gestor_setor"
ON ordens_servico FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    JOIN tipos_os t ON ordens_servico.tipo_os_id = t.id
    WHERE c.id = auth.uid()
    AND c.role_nivel IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
    AND t.setor_padrao = c.setor
  )
);

-- Colaborador vê se é responsável ou delegado
CREATE POLICY "os_view_colaborador"
ON ordens_servico FOR SELECT
USING (
  responsavel_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM delegacoes
    WHERE delegacoes.os_id = ordens_servico.id
    AND delegacoes.delegado_id = auth.uid()
    AND delegacoes.status_delegacao NOT IN ('REPROVADA', 'CONCLUIDA')
  )
);

-- Gestores+ podem criar OS
CREATE POLICY "os_create_managers"
ON ordens_servico FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
  )
);

-- Gestores+ podem editar OS do seu escopo
CREATE POLICY "os_update_managers"
ON ordens_servico FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND (
      c.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL') OR
      (
        c.role_nivel IN ('GESTOR_ASSESSORIA', 'GESTOR_OBRAS') AND
        EXISTS (
          SELECT 1 FROM tipos_os t
          WHERE t.id = ordens_servico.tipo_os_id
          AND t.setor_padrao = c.setor
        )
      )
    )
  )
);

-- ==========================================
-- 5. ADICIONAR/CORRIGIR POLÍTICAS DE CLIENTES
-- ==========================================

DROP POLICY IF EXISTS "clientes_view_all" ON clientes;
DROP POLICY IF EXISTS "clientes_manage_all" ON clientes;

-- Gestores+ podem ver todos os clientes
CREATE POLICY "clientes_view_managers"
ON clientes FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
  )
);

-- Colaborador vê se é responsável
CREATE POLICY "clientes_view_responsible"
ON clientes FOR SELECT
USING (responsavel_id = auth.uid());

-- Gestores+ podem gerenciar clientes
CREATE POLICY "clientes_manage_managers"
ON clientes FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
  )
);

-- ==========================================
-- 6. ADICIONAR/CORRIGIR POLÍTICAS DE FINANCEIRO
-- ==========================================

DROP POLICY IF EXISTS "financeiro_view_all" ON financeiro_lancamentos;
DROP POLICY IF EXISTS "financeiro_manage_all" ON financeiro_lancamentos;

-- Apenas Diretoria e Gestor Comercial têm acesso ao financeiro
CREATE POLICY "financeiro_view_authorized"
ON financeiro_lancamentos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL')
  )
);

CREATE POLICY "financeiro_manage_authorized"
ON financeiro_lancamentos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM colaboradores
    WHERE id = auth.uid()
    AND role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL')
  )
);

-- ==========================================
-- 7. ADICIONAR/CORRIGIR POLÍTICAS DE OS_ETAPAS
-- ==========================================

DROP POLICY IF EXISTS "etapas_view_all" ON os_etapas;
DROP POLICY IF EXISTS "etapas_manage_all" ON os_etapas;

-- Ver etapas se pode ver a OS
CREATE POLICY "etapas_view_if_can_view_os"
ON os_etapas FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ordens_servico os
    WHERE os.id = os_etapas.os_id
    -- Reutiliza lógica das políticas de OS
    AND (
      -- Diretoria
      EXISTS (SELECT 1 FROM colaboradores WHERE id = auth.uid() AND role_nivel = 'DIRETORIA') OR
      -- Gestor Comercial
      EXISTS (SELECT 1 FROM colaboradores WHERE id = auth.uid() AND role_nivel = 'GESTOR_COMERCIAL') OR
      -- Responsável
      os.responsavel_id = auth.uid() OR
      -- Delegado
      EXISTS (SELECT 1 FROM delegacoes WHERE delegacoes.os_id = os.id AND delegacoes.delegado_id = auth.uid())
    )
  )
);

-- Atualizar etapas se pode editar a OS ou é responsável pela etapa
CREATE POLICY "etapas_update_authorized"
ON os_etapas FOR UPDATE
USING (
  responsavel_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM colaboradores c
    WHERE c.id = auth.uid()
    AND c.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
  )
);

-- ==========================================
-- 8. ADICIONAR/CORRIGIR POLÍTICAS DE OS_ANEXOS
-- ==========================================

DROP POLICY IF EXISTS "anexos_view_all" ON os_anexos;
DROP POLICY IF EXISTS "anexos_manage_all" ON os_anexos;

-- Ver anexos se pode ver a OS
CREATE POLICY "anexos_view_if_can_view_os"
ON os_anexos FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM ordens_servico os
    WHERE os.id = os_anexos.os_id
    AND (
      EXISTS (SELECT 1 FROM colaboradores WHERE id = auth.uid() AND role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL')) OR
      os.responsavel_id = auth.uid() OR
      EXISTS (SELECT 1 FROM delegacoes WHERE delegacoes.os_id = os.id AND delegacoes.delegado_id = auth.uid())
    )
  )
);

-- Criar/deletar anexos se pode editar a OS
CREATE POLICY "anexos_manage_if_can_edit_os"
ON os_anexos FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM ordens_servico os
    JOIN colaboradores c ON c.id = auth.uid()
    WHERE os.id = os_anexos.os_id
    AND c.role_nivel IN ('DIRETORIA', 'GESTOR_COMERCIAL', 'GESTOR_ASSESSORIA', 'GESTOR_OBRAS')
  )
);

COMMIT;

-- ==========================================
-- Verificação Pós-Migration
-- ==========================================

-- Listar todas as políticas RLS
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Verificar tabelas com RLS habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND rowsecurity = true
ORDER BY tablename;

-- ==========================================
-- TESTES RECOMENDADOS:
-- 1. ✅ Testar login como cada tipo de usuário
-- 2. ✅ Verificar se Diretoria vê tudo
-- 3. ✅ Verificar se Gestor Comercial vê tudo
-- 4. ✅ Verificar se Gestor de Setor vê apenas seu setor
-- 5. ✅ Verificar se Colaborador vê apenas suas tarefas
-- 6. ✅ Verificar se MOBRA não acessa nada (se implementado)
-- 7. ✅ Testar criação/edição/exclusão com cada role
-- ==========================================
