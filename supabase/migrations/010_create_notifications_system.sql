-- 1. Tabela de Notificações
CREATE TABLE IF NOT EXISTS public.notificacoes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id uuid NOT NULL REFERENCES public.colaboradores(id) ON DELETE CASCADE,
  titulo text NOT NULL,
  mensagem text,
  link_acao text,
  lida boolean DEFAULT false,
  tipo text DEFAULT 'info', -- 'info', 'atencao', 'sucesso', 'tarefa'
  created_at timestamp with time zone DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_notificacoes_usuario_id ON public.notificacoes(usuario_id);
CREATE INDEX IF NOT EXISTS idx_notificacoes_lida ON public.notificacoes(lida);

-- RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Policy: Ver apenas suas próprias notificações
CREATE POLICY "Users can view their own notifications"
  ON public.notificacoes FOR SELECT
  USING (auth.uid() = usuario_id);

-- Policy: Inserir notificações (necessário para usuário A notificar usuário B na delegação)
CREATE POLICY "Users can create notifications"
  ON public.notificacoes FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Atualizar (marcar como lida)
CREATE POLICY "Users can update their own notifications"
  ON public.notificacoes FOR UPDATE
  USING (auth.uid() = usuario_id);

-- 2. Trigger para Atribuição Automática de Responsável (Regra de Ouro)
CREATE OR REPLACE FUNCTION public.handle_new_os_owner()
RETURNS TRIGGER AS $$
BEGIN
  -- Regra: Se responsavel_id for NULL, atribui ao criador (auth.uid())
  -- Exceção: Se já vier preenchido (portal/automação), mantém o valor original
  IF NEW.responsavel_id IS NULL THEN
    NEW.responsavel_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_os_created_set_owner ON public.ordens_servico;

CREATE TRIGGER on_os_created_set_owner
  BEFORE INSERT ON public.ordens_servico
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_os_owner();

-- 3. Habilitar Realtime
-- Verifica se a publicação existe antes de tentar adicionar (padrão do supabase é existir)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'notificacoes'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.notificacoes;
  END IF;
END
$$;
