-- =====================================================
-- Migration: Dados de Teste para Calendário
-- Descrição: Insere turnos e agendamentos exemplo
-- Data: 2025-11-22
-- =====================================================

-- Inserir turnos de exemplo
-- Estes turnos serão visíveis por todos os colaboradores ativos

INSERT INTO public.turnos (hora_inicio, hora_fim, vagas_total, setores, cor, tipo_recorrencia, ativo)
VALUES
  -- Manhã - Assessoria
  ('08:00', '12:00', 3, '["assessoria"]'::jsonb, '#3B82F6', 'uteis', true),

  -- Tarde - Assessoria
  ('13:00', '17:00', 3, '["assessoria"]'::jsonb, '#3B82F6', 'uteis', true),

  -- Manhã - Obras
  ('08:00', '12:00', 5, '["obras"]'::jsonb, '#10B981', 'uteis', true),

  -- Tarde - Obras
  ('13:00', '17:00', 5, '["obras"]'::jsonb, '#10B981', 'uteis', true),

  -- Integral - Ambos Setores
  ('09:00', '16:00', 2, '["obras", "assessoria"]'::jsonb, '#F59E0B', 'todos', true),

  -- Atendimento Rápido - Todos os Dias
  ('14:00', '15:00', 4, '["administrativo", "obras", "assessoria"]'::jsonb, '#8B5CF6', 'todos', true)
ON CONFLICT DO NOTHING;

-- Nota: Não vamos inserir agendamentos iniciais para deixar o calendário limpo
-- Os usuários poderão criar seus próprios agendamentos

-- Adicionar comentário
COMMENT ON TABLE public.turnos IS 'Turnos populados com exemplos: manhã/tarde para obras e assessoria, integral multi-setor, e atendimento rápido';
