-- ============================================================
-- Migration: Home Widgets - Tabela de Avisos do Sistema
-- Data: 2025-12-05
-- Descrição: Cria tabela para quadro de avisos na home
-- Nota: colaboradores.id = auth.users.id (FK direta)
-- ============================================================

BEGIN;

-- Tabela de Avisos do Sistema
CREATE TABLE IF NOT EXISTS public.sistema_avisos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    titulo text NOT NULL,
    mensagem text NOT NULL,
    tipo text DEFAULT 'info' CHECK (tipo IN ('info', 'alert', 'warning', 'success')),
    ativo boolean DEFAULT true,
    validade date,
    created_at timestamptz DEFAULT now(),
    created_by uuid REFERENCES colaboradores(id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_sistema_avisos_ativo ON sistema_avisos(ativo);
CREATE INDEX IF NOT EXISTS idx_sistema_avisos_validade ON sistema_avisos(validade);
CREATE INDEX IF NOT EXISTS idx_sistema_avisos_created_at ON sistema_avisos(created_at DESC);

-- Comentário
COMMENT ON TABLE sistema_avisos IS 'Quadro de avisos do sistema exibido na home';

-- Habilitar RLS
ALTER TABLE sistema_avisos ENABLE ROW LEVEL SECURITY;

-- Policy: Todos autenticados podem VER avisos ativos e válidos
CREATE POLICY "select_avisos_ativos"
    ON sistema_avisos
    FOR SELECT
    TO authenticated
    USING (
        ativo = true 
        AND (validade IS NULL OR validade >= CURRENT_DATE)
    );

-- Policy: Apenas admins/diretores podem GERENCIAR avisos
-- Nota: colaboradores.id = auth.uid() (FK direta para auth.users)
CREATE POLICY "manage_avisos_admin"
    ON sistema_avisos
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM colaboradores c
            INNER JOIN cargos ca ON c.cargo_id = ca.id
            WHERE c.id = auth.uid()
            AND ca.slug IN ('admin', 'diretor', 'diretoria')
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 
            FROM colaboradores c
            INNER JOIN cargos ca ON c.cargo_id = ca.id
            WHERE c.id = auth.uid()
            AND ca.slug IN ('admin', 'diretor', 'diretoria')
        )
    );

-- Inserir aviso de boas-vindas
INSERT INTO sistema_avisos (titulo, mensagem, tipo) 
VALUES ('Bem-vindo ao Minerva ERP', 'Sistema atualizado com nova home unificada!', 'success');

COMMIT;
