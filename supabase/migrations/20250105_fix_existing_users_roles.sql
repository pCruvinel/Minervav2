-- ============================================================
-- SCRIPT DE CORREÇÃO: Reatribuição de Usuários Existentes
-- Data: 2025-01-05
-- Descrição: Mapeia cargos legados para novos cargos da reestruturação RBAC
-- ============================================================

-- ATENÇÃO: Este script deve ser executado APÓS a migration principal
-- (20250105_refactor_roles_sectors.sql)

-- ============================================================
-- MAPEAMENTO DE CARGOS LEGADOS -> NOVOS CARGOS
-- ============================================================

DO $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Logging inicial
  RAISE NOTICE 'Iniciando correção de cargos de usuários existentes...';

  -- ============================================================
  -- MAPEAMENTO 1: gestor_administrativo -> coord_administrativo
  -- ============================================================
  UPDATE public.colaboradores
  SET cargo_id = (SELECT id FROM public.cargos WHERE slug = 'coord_administrativo')
  WHERE cargo_id IN (SELECT id FROM public.cargos WHERE slug = 'gestor_administrativo');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % usuários: gestor_administrativo -> coord_administrativo', v_count;

  -- ============================================================
  -- MAPEAMENTO 2: gestor_assessoria -> coord_assessoria
  -- ============================================================
  UPDATE public.colaboradores
  SET cargo_id = (SELECT id FROM public.cargos WHERE slug = 'coord_assessoria')
  WHERE cargo_id IN (SELECT id FROM public.cargos WHERE slug = 'gestor_assessoria');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % usuários: gestor_assessoria -> coord_assessoria', v_count;

  -- ============================================================
  -- MAPEAMENTO 3: gestor_obras -> coord_obras
  -- ============================================================
  UPDATE public.colaboradores
  SET cargo_id = (SELECT id FROM public.cargos WHERE slug = 'coord_obras')
  WHERE cargo_id IN (SELECT id FROM public.cargos WHERE slug = 'gestor_obras');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % usuários: gestor_obras -> coord_obras', v_count;

  -- ============================================================
  -- MAPEAMENTO 4: colaborador (setor obras) -> operacional_obras
  -- ============================================================
  UPDATE public.colaboradores c
  SET cargo_id = (SELECT id FROM public.cargos WHERE slug = 'operacional_obras')
  WHERE c.cargo_id IN (SELECT id FROM public.cargos WHERE slug = 'colaborador')
    AND c.setor_id IN (SELECT id FROM public.setores WHERE slug = 'obras');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % usuários: colaborador (obras) -> operacional_obras', v_count;

  -- ============================================================
  -- MAPEAMENTO 5: colaborador (setor administrativo) -> operacional_admin
  -- ============================================================
  UPDATE public.colaboradores c
  SET cargo_id = (SELECT id FROM public.cargos WHERE slug = 'operacional_admin')
  WHERE c.cargo_id IN (SELECT id FROM public.cargos WHERE slug = 'colaborador')
    AND c.setor_id IN (SELECT id FROM public.setores WHERE slug = 'administrativo');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % usuários: colaborador (administrativo) -> operacional_admin', v_count;

  -- ============================================================
  -- MAPEAMENTO 6: colaborador (setor assessoria) -> operacional_assessoria
  -- ============================================================
  UPDATE public.colaboradores c
  SET cargo_id = (SELECT id FROM public.cargos WHERE slug = 'operacional_assessoria')
  WHERE c.cargo_id IN (SELECT id FROM public.cargos WHERE slug = 'colaborador')
    AND c.setor_id IN (SELECT id FROM public.setores WHERE slug = 'assessoria');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % usuários: colaborador (assessoria) -> operacional_assessoria', v_count;

  -- ============================================================
  -- MAPEAMENTO 7: mao_de_obra -> colaborador_obra
  -- ============================================================
  UPDATE public.colaboradores
  SET cargo_id = (SELECT id FROM public.cargos WHERE slug = 'colaborador_obra')
  WHERE cargo_id IN (SELECT id FROM public.cargos WHERE slug = 'mao_de_obra');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % usuários: mao_de_obra -> colaborador_obra', v_count;

  -- ============================================================
  -- MAPEAMENTO 8: diretoria -> diretor
  -- ============================================================
  UPDATE public.colaboradores
  SET cargo_id = (SELECT id FROM public.cargos WHERE slug = 'diretor')
  WHERE cargo_id IN (SELECT id FROM public.cargos WHERE slug = 'diretoria');
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  RAISE NOTICE 'Atualizados % usuários: diretoria -> diretor', v_count;

  -- Logging final
  RAISE NOTICE 'Correção de cargos concluída com sucesso!';

END $$;

-- ============================================================
-- VALIDAÇÃO PÓS-CORREÇÃO
-- ============================================================

-- Ver distribuição de usuários por cargo após correção
-- SELECT 
--   c.slug,
--   c.nome,
--   COUNT(col.id) as total_usuarios
-- FROM public.cargos c
-- LEFT JOIN public.colaboradores col ON col.cargo_id = c.id
-- GROUP BY c.slug, c.nome
-- ORDER BY c.nivel_acesso DESC;

-- Verificar se ainda existem usuários com cargos legados
-- SELECT 
--   col.id,
--   col.nome_completo,
--   c.slug as cargo_slug_atual
-- FROM public.colaboradores col
-- JOIN public.cargos c ON c.id = col.cargo_id
-- WHERE c.slug IN ('gestor_administrativo', 'gestor_assessoria', 'gestor_obras', 'colaborador', 'mao_de_obra', 'diretoria');
