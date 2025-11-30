-- Migration: Garantir Centro de Custo por OS (Fase 1)
-- Data: 2025-11-30
-- Descrição: Implementa constraints e triggers para garantir que cada OS tenha exatamente 1 centro de custo
-- conforme regras de negócio: "Um cliente pode ter mais de uma Ordem de Serviço, consequentemente mais de um Centro de Custo"

-- ===========================================
-- 1. ADICIONAR CONSTRAINTS DE INTEGRIDADE
-- ===========================================

-- Garantir que toda OS tenha um centro de custo
ALTER TABLE public.ordens_servico
ADD CONSTRAINT ordens_servico_cc_id_not_null
CHECK (cc_id IS NOT NULL);

-- Índice para performance nas queries de relacionamento OS-CC
CREATE INDEX IF NOT EXISTS idx_ordens_servico_cc_id
ON public.ordens_servico(cc_id);

-- ===========================================
-- 2. CRIAR TABELA DE SEQUENCIAIS POR TIPO OS
-- ===========================================

-- Tabela para controlar sequenciais únicos por tipo de OS
CREATE TABLE IF NOT EXISTS public.os_sequences (
  tipo_os_id UUID PRIMARY KEY REFERENCES public.tipos_os(id) ON DELETE CASCADE,
  current_value INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_os_sequences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_os_sequences_updated_at
  BEFORE UPDATE ON public.os_sequences
  FOR EACH ROW
  EXECUTE FUNCTION update_os_sequences_updated_at();

-- ===========================================
-- 3. ATUALIZAR FUNÇÃO GERAR_CENTRO_CUSTO
-- ===========================================

-- Atualizar função para usar a nova tabela de sequenciais
CREATE OR REPLACE FUNCTION public.gerar_centro_custo(
  p_tipo_os_id UUID,
  p_cliente_id UUID,
  p_descricao TEXT DEFAULT NULL
)
RETURNS TABLE(cc_id UUID, cc_nome TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_codigo_tipo_os VARCHAR(10);
  v_numero_tipo VARCHAR(5);
  v_sequencial INTEGER;
  v_cc_nome TEXT;
  v_cc_id UUID;
BEGIN
  -- 1. Buscar código do tipo_os (ex: "OS-13")
  SELECT codigo INTO v_codigo_tipo_os
  FROM tipos_os
  WHERE id = p_tipo_os_id;

  IF v_codigo_tipo_os IS NULL THEN
    RAISE EXCEPTION 'Tipo de OS não encontrado: %', p_tipo_os_id;
  END IF;

  -- 2. Extrair número após hífen (ex: "OS-13" -> "13")
  v_numero_tipo := SPLIT_PART(v_codigo_tipo_os, '-', 2);

  IF v_numero_tipo IS NULL OR v_numero_tipo = '' THEN
    RAISE EXCEPTION 'Código do tipo de OS inválido: %', v_codigo_tipo_os;
  END IF;

  -- 3. Incrementar sequência atomicamente usando UPSERT
  INSERT INTO os_sequences (tipo_os_id, current_value, updated_at)
  VALUES (p_tipo_os_id, 1, NOW())
  ON CONFLICT (tipo_os_id)
  DO UPDATE SET
    current_value = os_sequences.current_value + 1,
    updated_at = NOW()
  RETURNING current_value INTO v_sequencial;

  -- 4. Formatar nome: CC + numero_tipo + sequencial (5 dígitos com zero-padding)
  v_cc_nome := 'CC' || v_numero_tipo || LPAD(v_sequencial::TEXT, 5, '0');

  -- 5. Criar registro em centros_custo
  INSERT INTO centros_custo (nome, cliente_id, tipo_os_id, descricao, ativo, valor_global)
  VALUES (v_cc_nome, p_cliente_id, p_tipo_os_id, p_descricao, true, 0)
  RETURNING id INTO v_cc_id;

  -- 6. Retornar resultado como tabela
  RETURN QUERY SELECT v_cc_id, v_cc_nome;
END;
$$;

-- Atualizar comentário da função
COMMENT ON FUNCTION public.gerar_centro_custo IS
'Gera Centro de Custo automaticamente com naming convention CC{NUMERO_TIPO_OS}{SEQUENCIAL}. Exemplo: CC1300001. Atualizado para usar tabela os_sequences.';

-- ===========================================
-- 4. CRIAR TRIGGER AUTOMÁTICO PARA CRIAR CC
-- ===========================================

CREATE OR REPLACE FUNCTION criar_centro_custo_para_os()
RETURNS TRIGGER AS $$
DECLARE
  v_cc_record RECORD;
BEGIN
  -- Se cc_id não foi fornecido, criar automaticamente
  IF NEW.cc_id IS NULL THEN
    -- Chamar função gerar_centro_custo
    SELECT cc_id, cc_nome INTO v_cc_record
    FROM gerar_centro_custo(NEW.tipo_os_id, NEW.cliente_id, 'Criado automaticamente para OS ' || COALESCE(NEW.codigo_os, ''));

    NEW.cc_id := v_cc_record.cc_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Aplicar trigger na tabela ordens_servico
CREATE TRIGGER trigger_criar_cc_para_os
  BEFORE INSERT ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION criar_centro_custo_para_os();

-- ===========================================
-- 5. VALIDAÇÃO DE INTEGRIDADE CC-CLIENTE
-- ===========================================

CREATE OR REPLACE FUNCTION validar_cc_cliente_os()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o CC pertence ao cliente da OS
  IF NOT EXISTS (
    SELECT 1 FROM centros_custo cc
    WHERE cc.id = NEW.cc_id
    AND cc.cliente_id = NEW.cliente_id
  ) THEN
    RAISE EXCEPTION 'Centro de Custo % não pertence ao cliente da OS %', NEW.cc_id, NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger de validação
CREATE TRIGGER trigger_validar_cc_cliente_os
  BEFORE INSERT OR UPDATE ON ordens_servico
  FOR EACH ROW
  EXECUTE FUNCTION validar_cc_cliente_os();

-- ===========================================
-- 6. POLÍTICAS RLS PARA CENTROS_CUSTO
-- ===========================================

-- Habilitar RLS na tabela centros_custo se não estiver habilitado
ALTER TABLE public.centros_custo ENABLE ROW LEVEL SECURITY;

-- Política: Usuários podem ver CCs dos próprios clientes
CREATE POLICY "users_can_view_own_client_cc" ON public.centros_custo
  FOR SELECT USING (
    cliente_id IN (
      SELECT DISTINCT os.cliente_id
      FROM ordens_servico os
      WHERE os.responsavel_id = auth.uid()::uuid
         OR os.criado_por_id = auth.uid()::uuid
         OR os.id IN (
           SELECT os_id FROM delegacoes
           WHERE delegado_id = auth.uid()::uuid
           AND status_delegacao = 'aceita'
         )
    )
  );

-- Política: Gestores podem ver todos os CCs
CREATE POLICY "managers_can_view_all_cc" ON public.centros_custo
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM colaboradores c
      JOIN cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid()::uuid
      AND cg.slug IN ('admin', 'diretoria', 'gestor_administrativo', 'gestor_obras', 'gestor_assessoria')
    )
  );

-- Política: Apenas gestores podem criar/editar CCs
CREATE POLICY "only_managers_can_modify_cc" ON public.centros_custo
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM colaboradores c
      JOIN cargos cg ON c.cargo_id = cg.id
      WHERE c.id = auth.uid()::uuid
      AND cg.slug IN ('admin', 'diretoria', 'gestor_administrativo', 'gestor_obras', 'gestor_assessoria')
    )
  );

-- ===========================================
-- 7. MIGRAR DADOS EXISTENTES (SE NECESSÁRIO)
-- ===========================================

-- Script para criar CCs para OSs existentes que não têm CC
-- (Executar apenas se houver dados existentes sem CC)

-- DO $$
-- DECLARE
--   os_record RECORD;
--   cc_record RECORD;
-- BEGIN
--   -- Para cada OS sem CC, criar um automaticamente
--   FOR os_record IN
--     SELECT id, tipo_os_id, cliente_id, codigo_os
--     FROM ordens_servico
--     WHERE cc_id IS NULL
--   LOOP
--     -- Criar CC para esta OS
--     SELECT cc_id INTO cc_record
--     FROM gerar_centro_custo(os_record.tipo_os_id, os_record.cliente_id, 'Migrado automaticamente para OS ' || os_record.codigo_os);
--
--     -- Atualizar OS com o novo CC
--     UPDATE ordens_servico
--     SET cc_id = cc_record.cc_id
--     WHERE id = os_record.id;
--   END LOOP;
-- END $$;

-- ===========================================
-- 8. ÍNDICES DE PERFORMANCE
-- ===========================================

-- Índices adicionais para performance
CREATE INDEX IF NOT EXISTS idx_centros_custo_cliente_tipo
ON public.centros_custo(cliente_id, tipo_os_id);

CREATE INDEX IF NOT EXISTS idx_centros_custo_ativo
ON public.centros_custo(ativo) WHERE ativo = true;

CREATE INDEX IF NOT EXISTS idx_os_sequences_updated_at
ON public.os_sequences(updated_at);

-- ===========================================
-- 9. GRANTS E PERMISSÕES
-- ===========================================

-- Garantir que authenticated users podem executar a função
GRANT EXECUTE ON FUNCTION public.gerar_centro_custo TO authenticated;

-- Garantir acesso à tabela os_sequences
GRANT SELECT, INSERT, UPDATE ON public.os_sequences TO authenticated;

-- ===========================================
-- MIGRATION COMPLETA
-- ===========================================

-- Log da migração
DO $$
BEGIN
  RAISE NOTICE 'Migration 20251130000005_enforce_centro_custo_per_os: Concluída com sucesso';
  RAISE NOTICE '- Constraints de integridade adicionadas';
  RAISE NOTICE '- Triggers automáticos implementados';
  RAISE NOTICE '- Função gerar_centro_custo atualizada';
  RAISE NOTICE '- Políticas RLS configuradas';
  RAISE NOTICE '- Índices de performance criados';
END $$;