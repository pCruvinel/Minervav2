-- =============================================================================
-- MIGRATION: Centro de Custo Phase 1
-- Data: 2026-02-02
-- Objetivo: Criar tabela de Overhead e garantir categorias para automação
-- =============================================================================

-- 1. Create Overhead Table
CREATE TABLE IF NOT EXISTS public.custos_overhead_mensal (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cc_id uuid REFERENCES public.centros_custo(id) ON DELETE CASCADE,
  mes_referencia date NOT NULL, -- Primeiro dia do mês (ex: 2026-02-01)
  custo_escritorio_rateado numeric(10,2) DEFAULT 0,
  custo_setor_rateado numeric(10,2) DEFAULT 0,
  valor_total_alocado numeric(10,2) GENERATED ALWAYS AS (custo_escritorio_rateado + custo_setor_rateado) STORED,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Prevent duplicates for same month/CC
  CONSTRAINT custos_overhead_mensal_unique UNIQUE (cc_id, mes_referencia)
);

COMMENT ON TABLE public.custos_overhead_mensal IS 'Rateio mensal de custos indereitos (Overhead) por Centro de Custo.';

-- RLS
ALTER TABLE public.custos_overhead_mensal ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read overhead" ON public.custos_overhead_mensal
  FOR SELECT TO authenticated USING (true);

-- Fix: Updated `users_roles` -> `user_roles` AND `r.name` -> `r.nome`
CREATE POLICY "Admins/Finance can manage overhead" ON public.custos_overhead_mensal
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON r.id = ur.role_id 
      WHERE ur.user_id = auth.uid() 
      AND r.nome IN ('admin', 'financeiro', 'diretoria', 'gestor') 
    )
  );

-- 2. Seed Categorias Financeiras
-- Ensure required categories exist for automation
INSERT INTO public.categorias_financeiras (nome, codigo, tipo, ativo)
VALUES 
  ('Impostos (NF)', 'CAT-IMPOSTO', 'pagar', true),
  ('Comissão Comercial', 'CAT-COMISSAO', 'pagar', true),
  ('Custos Indiretos (Overhead)', 'CAT-OVERHEAD', 'pagar', true),
  ('Materiais', 'CAT-MATERIAL', 'pagar', true),
  ('Equipamentos - Locação', 'CAT-EQUIP-LOC', 'pagar', true),
  ('Equipamentos - Aquisição', 'CAT-EQUIP-AQ', 'pagar', true),
  ('Segurança', 'CAT-SEGURANCA', 'pagar', true),
  ('Logística', 'CAT-LOGISTICA', 'pagar', true),
  ('Documentação', 'CAT-DOCS', 'pagar', true),
  ('Prejuízo Operacional', 'CAT-PREJUIZO', 'pagar', true)
ON CONFLICT (codigo) DO UPDATE 
SET ativo = true; -- Ensure it's active if it already exists
