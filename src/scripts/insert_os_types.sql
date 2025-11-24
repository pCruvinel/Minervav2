-- Script para inserir Tipos de OS
-- Executar no Editor SQL do Supabase

-- Obras
INSERT INTO public.tipos_os (id, nome, codigo, setor_padrao_id, ativo)
VALUES
  (gen_random_uuid(), 'Perícia de Fachada', 'OS-01', (SELECT id FROM public.setores WHERE slug = 'obras'), true),
  (gen_random_uuid(), 'Revitalização de Fachada', 'OS-02', (SELECT id FROM public.setores WHERE slug = 'obras'), true),
  (gen_random_uuid(), 'Reforço Estrutural', 'OS-03', (SELECT id FROM public.setores WHERE slug = 'obras'), true),
  (gen_random_uuid(), 'Outros (Obras)', 'OS-04', (SELECT id FROM public.setores WHERE slug = 'obras'), true),
  (gen_random_uuid(), 'Start de Contrato de Obra', 'OS-13', (SELECT id FROM public.setores WHERE slug = 'obras'), true)
ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  setor_padrao_id = EXCLUDED.setor_padrao_id,
  ativo = EXCLUDED.ativo;

-- Assessoria
INSERT INTO public.tipos_os (id, nome, codigo, setor_padrao_id, ativo)
VALUES
  (gen_random_uuid(), 'Assessoria Mensal (Lead)', 'OS-05', (SELECT id FROM public.setores WHERE slug = 'assessoria'), true),
  (gen_random_uuid(), 'Assessoria Avulsa (Lead)', 'OS-06', (SELECT id FROM public.setores WHERE slug = 'assessoria'), true),
  (gen_random_uuid(), 'Solicitação de Reforma', 'OS-07', (SELECT id FROM public.setores WHERE slug = 'assessoria'), true),
  (gen_random_uuid(), 'Visita Técnica / Parecer Técnico', 'OS-08', (SELECT id FROM public.setores WHERE slug = 'assessoria'), true),
  (gen_random_uuid(), 'Start Contrato Assessoria Mensal', 'OS-11', (SELECT id FROM public.setores WHERE slug = 'assessoria'), true),
  (gen_random_uuid(), 'Start Contrato Assessoria Avulsa', 'OS-12', (SELECT id FROM public.setores WHERE slug = 'assessoria'), true)
ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  setor_padrao_id = EXCLUDED.setor_padrao_id,
  ativo = EXCLUDED.ativo;

-- Financeiro
INSERT INTO public.tipos_os (id, nome, codigo, setor_padrao_id, ativo)
VALUES
  (gen_random_uuid(), 'Requisição de Compras', 'OS-09', (SELECT id FROM public.setores WHERE slug = 'financeiro'), true)
ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  setor_padrao_id = EXCLUDED.setor_padrao_id,
  ativo = EXCLUDED.ativo;

-- RH
INSERT INTO public.tipos_os (id, nome, codigo, setor_padrao_id, ativo)
VALUES
  (gen_random_uuid(), 'Requisição de Mão de Obra', 'OS-10', (SELECT id FROM public.setores WHERE slug = 'rh'), true)
ON CONFLICT (codigo) DO UPDATE SET
  nome = EXCLUDED.nome,
  setor_padrao_id = EXCLUDED.setor_padrao_id,
  ativo = EXCLUDED.ativo;
