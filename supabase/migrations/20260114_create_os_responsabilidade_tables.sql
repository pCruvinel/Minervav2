-- ============================================================================
-- SISTEMA DE RESPONSABILIDADE POR SETOR E PARTICIPANTES
-- ============================================================================
-- Data: 2026-01-14
-- Descrição: Cria tabelas para gestão de participantes e delegação de etapas
-- ============================================================================

-- 1. Tabela de Participantes da OS
-- Armazena colaboradores que participam de uma OS específica
CREATE TABLE IF NOT EXISTS os_participantes (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ordem_servico_id uuid NOT NULL REFERENCES ordens_servico(id) ON DELETE CASCADE,
    colaborador_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    papel text NOT NULL DEFAULT 'participante' CHECK (papel IN ('responsavel', 'participante', 'observador')),
    setor_id uuid REFERENCES setores(id),
    etapas_permitidas integer[], -- NULL = todas as etapas do setor
    adicionado_por_id uuid REFERENCES colaboradores(id),
    adicionado_em timestamptz DEFAULT now(),
    observacao text,
    
    -- Garantir unicidade: um colaborador só pode ter um registro por OS
    CONSTRAINT unique_participante_os UNIQUE (ordem_servico_id, colaborador_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_os_participantes_os ON os_participantes(ordem_servico_id);
CREATE INDEX IF NOT EXISTS idx_os_participantes_colaborador ON os_participantes(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_os_participantes_setor ON os_participantes(setor_id);
CREATE INDEX IF NOT EXISTS idx_os_participantes_papel ON os_participantes(papel);

-- Comentários
COMMENT ON TABLE os_participantes IS 'Participantes de uma Ordem de Serviço com seus papéis e permissões';
COMMENT ON COLUMN os_participantes.papel IS 'Papel do participante: responsavel (pode editar), participante (pode editar etapas permitidas), observador (apenas visualização)';
COMMENT ON COLUMN os_participantes.etapas_permitidas IS 'Array de números das etapas que o participante pode editar. NULL significa todas as etapas do setor.';

-- 2. Tabela de Responsável por Etapa (Delegação)
-- Quando um coordenador delega uma etapa específica para outro colaborador
CREATE TABLE IF NOT EXISTS os_etapas_responsavel (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    etapa_id uuid NOT NULL REFERENCES os_etapas(id) ON DELETE CASCADE,
    responsavel_id uuid NOT NULL REFERENCES colaboradores(id) ON DELETE CASCADE,
    delegado_por_id uuid REFERENCES colaboradores(id),
    delegado_em timestamptz DEFAULT now(),
    motivo text,
    ativo boolean DEFAULT true
);

-- Índice parcial único para garantir apenas um responsável ativo por etapa
CREATE UNIQUE INDEX IF NOT EXISTS idx_os_etapas_responsavel_unico_ativo 
ON os_etapas_responsavel(etapa_id) WHERE ativo = true;

-- Índices adicionais
CREATE INDEX IF NOT EXISTS idx_os_etapas_responsavel_etapa ON os_etapas_responsavel(etapa_id);
CREATE INDEX IF NOT EXISTS idx_os_etapas_responsavel_responsavel ON os_etapas_responsavel(responsavel_id);

-- Comentários
COMMENT ON TABLE os_etapas_responsavel IS 'Registro de delegação de responsabilidade por etapa específica';
COMMENT ON COLUMN os_etapas_responsavel.motivo IS 'Motivo da delegação (opcional)';
COMMENT ON COLUMN os_etapas_responsavel.ativo IS 'Se a delegação está ativa. Apenas uma delegação ativa por etapa.';

-- 3. Adicionar campo responsaveis_setores na tabela ordens_servico
-- Armazena os coordenadores responsáveis por cada setor nesta OS
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ordens_servico' 
        AND column_name = 'responsaveis_setores'
    ) THEN
        ALTER TABLE ordens_servico 
        ADD COLUMN responsaveis_setores jsonb DEFAULT '{}';
        
        COMMENT ON COLUMN ordens_servico.responsaveis_setores IS 'JSON com coordenadores responsáveis por setor: {"administrativo": {"coordenador_id": "uuid"}, ...}';
    END IF;
END $$;

-- 4. Habilitar RLS nas novas tabelas
ALTER TABLE os_participantes ENABLE ROW LEVEL SECURITY;
ALTER TABLE os_etapas_responsavel ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para os_participantes
-- SELECT: Todos autenticados podem ver participantes
CREATE POLICY "os_participantes_select_authenticated"
ON os_participantes FOR SELECT
TO authenticated
USING (true);

-- INSERT: Coordenadores e admin podem adicionar participantes
CREATE POLICY "os_participantes_insert_coord_admin"
ON os_participantes FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM colaboradores c
        WHERE c.id = auth.uid()
        AND c.funcao IN ('admin', 'diretor', 'coord_administrativo', 'coord_obras', 'coord_assessoria')
    )
);

-- UPDATE: Quem adicionou ou coordenadores podem atualizar
CREATE POLICY "os_participantes_update_owner_coord"
ON os_participantes FOR UPDATE
TO authenticated
USING (
    adicionado_por_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM colaboradores c
        WHERE c.id = auth.uid()
        AND c.funcao IN ('admin', 'diretor', 'coord_administrativo', 'coord_obras', 'coord_assessoria')
    )
);

-- DELETE: Quem adicionou ou coordenadores podem remover
CREATE POLICY "os_participantes_delete_owner_coord"
ON os_participantes FOR DELETE
TO authenticated
USING (
    adicionado_por_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM colaboradores c
        WHERE c.id = auth.uid()
        AND c.funcao IN ('admin', 'diretor', 'coord_administrativo', 'coord_obras', 'coord_assessoria')
    )
);

-- 6. Políticas RLS para os_etapas_responsavel
-- SELECT: Todos autenticados podem ver
CREATE POLICY "os_etapas_responsavel_select_authenticated"
ON os_etapas_responsavel FOR SELECT
TO authenticated
USING (true);

-- INSERT: Apenas coordenadores podem delegar
CREATE POLICY "os_etapas_responsavel_insert_coord"
ON os_etapas_responsavel FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (
        SELECT 1 FROM colaboradores c
        WHERE c.id = auth.uid()
        AND c.funcao IN ('admin', 'diretor', 'coord_administrativo', 'coord_obras', 'coord_assessoria')
    )
);

-- UPDATE: Quem delegou ou admin pode atualizar
CREATE POLICY "os_etapas_responsavel_update_delegador"
ON os_etapas_responsavel FOR UPDATE
TO authenticated
USING (
    delegado_por_id = auth.uid()
    OR EXISTS (
        SELECT 1 FROM colaboradores c
        WHERE c.id = auth.uid()
        AND c.funcao IN ('admin', 'diretor')
    )
);
