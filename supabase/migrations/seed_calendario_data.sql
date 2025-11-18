-- =====================================================
-- SEED: Dados Iniciais para Sistema de Calendário
-- Data: 2025-01-18
-- Descrição: Popular turnos e agendamentos de exemplo
-- =====================================================

-- =====================================================
-- INSERIR TURNOS DE EXEMPLO
-- =====================================================

-- Turno 1: Manhã Comercial (Todos os dias)
INSERT INTO turnos (
  hora_inicio,
  hora_fim,
  vagas_total,
  setores,
  cor,
  tipo_recorrencia,
  ativo
) VALUES (
  '09:00',
  '12:00',
  5,
  ARRAY['Comercial', 'Obras'],
  '#DBEAFE',
  'todos',
  true
);

-- Turno 2: Manhã Assessoria (Dias úteis)
INSERT INTO turnos (
  hora_inicio,
  hora_fim,
  vagas_total,
  setores,
  cor,
  tipo_recorrencia,
  ativo
) VALUES (
  '08:00',
  '11:00',
  3,
  ARRAY['Assessoria'],
  '#FEF3C7',
  'uteis',
  true
);

-- Turno 3: Tarde Obras (Dias úteis)
INSERT INTO turnos (
  hora_inicio,
  hora_fim,
  vagas_total,
  setores,
  cor,
  tipo_recorrencia,
  ativo
) VALUES (
  '14:00',
  '17:00',
  4,
  ARRAY['Obras'],
  '#E0E7FF',
  'uteis',
  true
);

-- Turno 4: Tarde Mista (Dias úteis)
INSERT INTO turnos (
  hora_inicio,
  hora_fim,
  vagas_total,
  setores,
  cor,
  tipo_recorrencia,
  ativo
) VALUES (
  '13:00',
  '16:00',
  6,
  ARRAY['Comercial', 'Obras', 'Assessoria'],
  '#D1FAE5',
  'uteis',
  true
);

-- Turno 5: Manhã Técnica (Dias úteis)
INSERT INTO turnos (
  hora_inicio,
  hora_fim,
  vagas_total,
  setores,
  cor,
  tipo_recorrencia,
  ativo
) VALUES (
  '10:00',
  '13:00',
  5,
  ARRAY['Comercial'],
  '#FCE7F3',
  'uteis',
  true
);

-- =====================================================
-- INSERIR AGENDAMENTOS DE EXEMPLO
-- =====================================================

-- Buscar IDs dos turnos criados
DO $$
DECLARE
  v_turno1_id UUID;
  v_turno2_id UUID;
  v_turno3_id UUID;
  v_turno4_id UUID;
  v_data_hoje DATE := CURRENT_DATE;
  v_data_amanha DATE := CURRENT_DATE + INTERVAL '1 day';
  v_data_depois DATE := CURRENT_DATE + INTERVAL '2 days';
BEGIN
  -- Pegar IDs dos turnos
  SELECT id INTO v_turno1_id FROM turnos WHERE hora_inicio = '09:00' AND hora_fim = '12:00' LIMIT 1;
  SELECT id INTO v_turno2_id FROM turnos WHERE hora_inicio = '08:00' AND hora_fim = '11:00' LIMIT 1;
  SELECT id INTO v_turno3_id FROM turnos WHERE hora_inicio = '14:00' AND hora_fim = '17:00' LIMIT 1;
  SELECT id INTO v_turno4_id FROM turnos WHERE hora_inicio = '13:00' AND hora_fim = '16:00' LIMIT 1;

  -- Agendamento 1: Vistoria Inicial no Turno 1 (hoje)
  INSERT INTO agendamentos (
    turno_id,
    data,
    horario_inicio,
    horario_fim,
    duracao_horas,
    categoria,
    setor,
    solicitante_nome,
    solicitante_contato,
    status
  ) VALUES (
    v_turno1_id,
    v_data_hoje,
    '09:00',
    '11:00',
    2,
    'Vistoria Inicial',
    'Comercial',
    'João Silva',
    '(11) 99999-1111',
    'confirmado'
  );

  -- Agendamento 2: Apresentação de Proposta no Turno 1 (hoje)
  INSERT INTO agendamentos (
    turno_id,
    data,
    horario_inicio,
    horario_fim,
    duracao_horas,
    categoria,
    setor,
    solicitante_nome,
    solicitante_contato,
    status
  ) VALUES (
    v_turno1_id,
    v_data_hoje,
    '10:00',
    '12:00',
    2,
    'Apresentação de Proposta',
    'Obras',
    'Maria Santos',
    '(11) 99999-2222',
    'confirmado'
  );

  -- Agendamento 3: Visita Semanal no Turno 2 (amanhã)
  INSERT INTO agendamentos (
    turno_id,
    data,
    horario_inicio,
    horario_fim,
    duracao_horas,
    categoria,
    setor,
    solicitante_nome,
    solicitante_contato,
    status
  ) VALUES (
    v_turno2_id,
    v_data_amanha,
    '08:00',
    '10:00',
    2,
    'Visita Semanal',
    'Assessoria',
    'Pedro Costa',
    '(11) 99999-3333',
    'confirmado'
  );

  -- Agendamento 4: Vistoria Técnica no Turno 3 (amanhã)
  INSERT INTO agendamentos (
    turno_id,
    data,
    horario_inicio,
    horario_fim,
    duracao_horas,
    categoria,
    setor,
    solicitante_nome,
    solicitante_contato,
    solicitante_observacoes,
    status
  ) VALUES (
    v_turno3_id,
    v_data_amanha,
    '14:00',
    '16:00',
    2,
    'Vistoria Técnica',
    'Obras',
    'Ana Paula',
    '(11) 99999-4444',
    'Verificar infiltração no teto do apartamento 301',
    'confirmado'
  );

  -- Agendamento 5: Vistoria Inicial no Turno 4 (depois de amanhã)
  INSERT INTO agendamentos (
    turno_id,
    data,
    horario_inicio,
    horario_fim,
    duracao_horas,
    categoria,
    setor,
    solicitante_nome,
    solicitante_contato,
    status
  ) VALUES (
    v_turno4_id,
    v_data_depois,
    '13:00',
    '15:00',
    2,
    'Vistoria Inicial',
    'Comercial',
    'Carlos Oliveira',
    '(11) 99999-5555',
    'confirmado'
  );

  -- Agendamento 6: Apresentação de Proposta no Turno 4 (depois de amanhã)
  INSERT INTO agendamentos (
    turno_id,
    data,
    horario_inicio,
    horario_fim,
    duracao_horas,
    categoria,
    setor,
    solicitante_nome,
    solicitante_contato,
    status
  ) VALUES (
    v_turno4_id,
    v_data_depois,
    '14:00',
    '16:00',
    2,
    'Apresentação de Proposta',
    'Obras',
    'Fernanda Lima',
    '(11) 99999-6666',
    'confirmado'
  );

  RAISE NOTICE 'Seed de calendário concluído com sucesso!';
END $$;

-- =====================================================
-- VERIFICAÇÃO DOS DADOS INSERIDOS
-- =====================================================

-- Mostrar resumo dos turnos
DO $$
DECLARE
  v_count_turnos INTEGER;
  v_count_agendamentos INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count_turnos FROM turnos WHERE ativo = true;
  SELECT COUNT(*) INTO v_count_agendamentos FROM agendamentos WHERE status = 'confirmado';

  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESUMO DO SEED:';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Turnos criados: %', v_count_turnos;
  RAISE NOTICE 'Agendamentos criados: %', v_count_agendamentos;
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- COMENTÁRIOS
-- =====================================================

COMMENT ON TABLE turnos IS 'Turnos configurados para o sistema de agendamento (populado com 5 turnos de exemplo)';
COMMENT ON TABLE agendamentos IS 'Agendamentos realizados pelos usuários (populado com 6 agendamentos de exemplo)';
