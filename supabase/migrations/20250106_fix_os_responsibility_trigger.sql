-- Migration: 20250106_fix_os_responsibility_trigger
-- Objetivo: Garantir que nenhuma OS seja criada sem responsavel_id (Regra de Ouro)

-- 1. Remover trigger antigo se existir (para evitar conflitos)
DROP TRIGGER IF EXISTS on_os_created_set_owner ON public.ordens_servico;
DROP FUNCTION IF EXISTS public.handle_new_os_owner();

-- 2. Recriar a função do Trigger com lógica robusta
CREATE OR REPLACE FUNCTION public.handle_new_os_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Regra: Se responsavel_id for NULL, atribui ao criador (auth.uid())
  -- auth.uid() retorna o ID do usuário logado via JWT
  IF NEW.responsavel_id IS NULL THEN
    NEW.responsavel_id := auth.uid();
  END IF;
  
  -- Se ainda assim for NULL (ex: criado via service role sem contexto de user), 
  -- tenta pegar do criado_por_id se disponível
  IF NEW.responsavel_id IS NULL AND NEW.criado_por_id IS NOT NULL THEN
    NEW.responsavel_id := NEW.criado_por_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Criar o Trigger BEFORE INSERT
CREATE TRIGGER on_os_created_set_owner
  BEFORE INSERT ON public.ordens_servico
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_os_owner();

-- 4. Correção Retroativa (Opcional, mas recomendada)
-- Atualiza OSs antigas que por ventura estejam sem responsável
UPDATE public.ordens_servico
SET responsavel_id = criado_por_id
WHERE responsavel_id IS NULL AND criado_por_id IS NOT NULL;
