-- ============================================================
-- MIGRATION: Reestruturação RBAC - Cargos e Setores
-- Data: 2025-01-05
-- Descrição: Adiciona colunas acesso_financeiro e escopo_visao,
--            e sincroniza setores e cargos com nova estrutura
-- ============================================================

-- ============================================================
-- PARTE 1: ALTERAÇÃO DA TABELA CARGOS
-- ============================================================

-- Adicionar coluna acesso_financeiro (flag explícita para permissão financeira)
ALTER TABLE public.cargos 
ADD COLUMN IF NOT EXISTS acesso_financeiro BOOLEAN DEFAULT FALSE;

-- Adicionar coluna escopo_visao (define o escopo de dados visíveis)
ALTER TABLE public.cargos 
ADD COLUMN IF NOT EXISTS escopo_visao TEXT 
CHECK (escopo_visao IN ('global', 'setorial', 'proprio', 'nenhuma'));

-- ============================================================
-- PARTE 2: SEED/UPSERT DE SETORES (5 setores padronizados)
-- ============================================================

-- Garantir que existem 5 setores no sistema
INSERT INTO public.setores (nome, slug, descricao) 
VALUES 
  ('Diretoria', 'diretoria', 'Setor de Diretoria'),
  ('Administrativo', 'administrativo', 'Setor Administrativo e Comercial'),
  ('Assessoria', 'assessoria', 'Setor de Assessoria Técnica'),
  ('Obras', 'obras', 'Setor de Obras e Execução'),
  ('TI', 'ti', 'Setor de Tecnologia da Informação')
ON CONFLICT (slug) 
DO UPDATE SET 
  nome = EXCLUDED.nome,
  descricao = EXCLUDED.descricao;

-- ============================================================
-- PARTE 3: SEED/UPSERT DE CARGOS (10 cargos padronizados)
-- ============================================================

-- Variáveis para armazenar IDs dos setores
DO $$
DECLARE
  v_setor_diretoria UUID;
  v_setor_administrativo UUID;
  v_setor_assessoria UUID;
  v_setor_obras UUID;
  v_setor_ti UUID;
BEGIN
  -- Buscar IDs dos setores
  SELECT id INTO v_setor_diretoria FROM public.setores WHERE slug = 'diretoria';
  SELECT id INTO v_setor_administrativo FROM public.setores WHERE slug = 'administrativo';
  SELECT id INTO v_setor_assessoria FROM public.setores WHERE slug = 'assessoria';
  SELECT id INTO v_setor_obras FROM public.setores WHERE slug = 'obras';
  SELECT id INTO v_setor_ti FROM public.setores WHERE slug = 'ti';

  -- Inserir/Atualizar cargos
  -- CARGO 1: Admin (TI, Nível 10, Global, Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Admin',
    'admin',
    v_setor_ti,
    10,
    TRUE,
    'global',
    'Administrador do sistema com acesso total'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 2: Diretor (Diretoria, Nível 9, Global, Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Diretor',
    'diretor',
    v_setor_diretoria,
    9,
    TRUE,
    'global',
    'Diretoria com visão estratégica completa'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 3: Coord. Administrativo (Administrativo, Nível 6, Global, Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Coordenador Administrativo',
    'coord_administrativo',
    v_setor_administrativo,
    6,
    TRUE,
    'global',
    'Coordenador do setor administrativo com acesso financeiro'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 4: Coord. de Assessoria (Assessoria, Nível 5, Setorial, SEM Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Coordenador de Assessoria',
    'coord_assessoria',
    v_setor_assessoria,
    5,
    FALSE,
    'setorial',
    'Coordenador do setor de assessoria técnica'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 5: Coord. de Obras (Obras, Nível 5, Setorial, SEM Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Coordenador de Obras',
    'coord_obras',
    v_setor_obras,
    5,
    FALSE,
    'setorial',
    'Coordenador de obras e execução'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 6: Operacional Admin (Administrativo, Nível 3, Setorial, SEM Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Operacional Administrativo',
    'operacional_admin',
    v_setor_administrativo,
    3,
    FALSE,
    'setorial',
    'Operacional do setor administrativo'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 7: Operacional Comercial (Administrativo, Nível 3, Setorial, SEM Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Operacional Comercial',
    'operacional_comercial',
    v_setor_administrativo,
    3,
    FALSE,
    'setorial',
    'Operacional comercial e vendas'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 8: Operacional Assessoria (Assessoria, Nível 2, Setorial, SEM Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Operacional Assessoria',
    'operacional_assessoria',
    v_setor_assessoria,
    2,
    FALSE,
    'setorial',
    'Operacional de assessoria técnica'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 9: Operacional Obras (Obras, Nível 2, Setorial, SEM Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Operacional Obras',
    'operacional_obras',
    v_setor_obras,
    2,
    FALSE,
    'setorial',
    'Operacional de obras'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

  -- CARGO 10: Colaborador Obra (Obras, Nível 0, Nenhuma visão, SEM Financeiro)
  INSERT INTO public.cargos (nome, slug, setor_id, nivel_acesso, acesso_financeiro, escopo_visao, descricao)
  VALUES (
    'Colaborador Obra',
    'colaborador_obra',
    v_setor_obras,
    0,
    FALSE,
    'nenhuma',
    'Colaborador de obra sem acesso ao sistema'
  )
  ON CONFLICT (slug) 
  DO UPDATE SET 
    nome = EXCLUDED.nome,
    setor_id = EXCLUDED.setor_id,
    nivel_acesso = EXCLUDED.nivel_acesso,
    acesso_financeiro = EXCLUDED.acesso_financeiro,
    escopo_visao = EXCLUDED.escopo_visao,
    descricao = EXCLUDED.descricao;

END $$;

-- ============================================================
-- PARTE 4: VALIDAÇÃO (Comentários informativos)
-- ============================================================

-- Para validar a migration, execute:
-- SELECT slug, nome, setor_id, nivel_acesso, acesso_financeiro, escopo_visao FROM public.cargos ORDER BY nivel_acesso DESC;
-- SELECT COUNT(*) FROM public.setores; -- Deve retornar 5
-- SELECT COUNT(*) FROM public.cargos;  -- Deve retornar 10
