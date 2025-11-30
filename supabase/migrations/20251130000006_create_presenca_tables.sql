-- Migration: Create Presence Tables
-- Data: 2025-11-30
-- Descrição: Cria tabela para registros de presença diária de colaboradores

-- 0. Função Helper para updated_at (Garante que existe)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 1. Tabela de Registros de Presença
CREATE TABLE IF NOT EXISTS public.registros_presenca (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  colaborador_id UUID NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  data DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('OK', 'ATRASADO', 'FALTA', 'FALTA_JUSTIFICADA')),
  minutos_atraso INTEGER,
  justificativa TEXT,
  performance TEXT NOT NULL CHECK (performance IN ('OTIMA', 'BOA', 'REGULAR', 'RUIM', 'PESSIMA')),
  performance_justificativa TEXT,
  centros_custo JSONB DEFAULT '[]'::JSONB,
  anexo_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Garante apenas um registro por colaborador por dia
  UNIQUE(colaborador_id, data)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_registros_presenca_colaborador_id ON public.registros_presenca(colaborador_id);
CREATE INDEX IF NOT EXISTS idx_registros_presenca_data ON public.registros_presenca(data);

-- RLS Policies
ALTER TABLE public.registros_presenca ENABLE ROW LEVEL SECURITY;

-- Policy: Leitura (Todos autenticados podem ver)
DROP POLICY IF EXISTS "Todos podem ver registros de presença" ON public.registros_presenca;
CREATE POLICY "Todos podem ver registros de presença"
  ON public.registros_presenca FOR SELECT
  USING (auth.role() = 'authenticated');

-- Policy: Escrita (Apenas gestores e admins)
DROP POLICY IF EXISTS "Gestores podem criar/editar registros de presença" ON public.registros_presenca;
CREATE POLICY "Gestores podem criar/editar registros de presença"
  ON public.registros_presenca FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Trigger para updated_at
DROP TRIGGER IF EXISTS update_registros_presenca_updated_at ON public.registros_presenca;
CREATE TRIGGER update_registros_presenca_updated_at
  BEFORE UPDATE ON public.registros_presenca
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
