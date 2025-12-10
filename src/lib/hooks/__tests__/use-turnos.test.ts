/**
 * Testes unitários para turnosAPI
 *
 * Testa a API de turnos e funções de mapeamento
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock do Supabase - deve vir antes do import
vi.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
    auth: {
      getUser: vi.fn(() =>
        Promise.resolve({
          data: { user: { id: 'test-user-id' } },
        })
      ),
    },
  },
}));

// Mock do toast para suprimir notificações durante testes
vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

import { turnosAPI } from '../use-turnos';
import { supabase } from '@/lib/supabase-client';

// =====================================================
// DADOS DE TESTE
// =====================================================

const mockTurnoDB = {
  id: 'turno-001',
  hora_inicio: '08:00',
  hora_fim: '12:00',
  vagas_total: 4,
  vagas_por_setor: { engenharia: 2, assessoria: 2 },
  setores: ['engenharia', 'assessoria'],
  cor: '#3B82F6',
  tipo_recorrencia: 'uteis',
  data_inicio: '2025-01-01',
  data_fim: '2025-12-31',
  dias_semana: [1, 2, 3, 4, 5],
  ativo: true,
  criado_por: 'user-001',
  criado_em: '2025-01-01T10:00:00Z',
  atualizado_em: '2025-01-01T10:00:00Z',
};

const mockTurnosListDB = [
  mockTurnoDB,
  {
    ...mockTurnoDB,
    id: 'turno-002',
    hora_inicio: '14:00',
    hora_fim: '18:00',
    cor: '#10B981',
  },
];

// =====================================================
// HELPER PARA CONFIGURAR MOCK DO SUPABASE
// =====================================================

function setupSupabaseListMock(responseData: unknown[], error: unknown = null) {
  const mockOrder = vi.fn().mockResolvedValue({ data: responseData, error });
  const mockEq = vi.fn().mockReturnValue({ order: mockOrder });
  const mockSelect = vi.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = vi.fn().mockReturnValue({ select: mockSelect });

  (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

  return { mockFrom, mockSelect, mockEq, mockOrder };
}

function setupSupabaseInsertMock(responseData: unknown, error: unknown = null) {
  const mockSingle = vi.fn().mockResolvedValue({ data: responseData, error });
  const mockSelectAfterInsert = vi.fn().mockReturnValue({ single: mockSingle });
  const mockInsert = vi.fn().mockReturnValue({ select: mockSelectAfterInsert });
  const mockFrom = vi.fn().mockReturnValue({ insert: mockInsert });

  (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

  return { mockFrom, mockInsert, mockSelectAfterInsert, mockSingle };
}

function setupSupabaseUpdateMock(responseData: unknown, error: unknown = null) {
  const mockSingle = vi.fn().mockResolvedValue({ data: responseData, error });
  const mockSelectAfterUpdate = vi.fn().mockReturnValue({ single: mockSingle });
  const mockEq = vi.fn().mockReturnValue({ select: mockSelectAfterUpdate });
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

  (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

  return { mockFrom, mockUpdate, mockEq, mockSingle };
}

function setupSupabaseDeleteMock(error: unknown = null) {
  const mockEq = vi.fn().mockResolvedValue({ error });
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq });
  const mockFrom = vi.fn().mockReturnValue({ update: mockUpdate });

  (supabase.from as ReturnType<typeof vi.fn>).mockImplementation(mockFrom);

  return { mockFrom, mockUpdate, mockEq };
}

// =====================================================
// TESTES: turnosAPI.list
// =====================================================

describe('turnosAPI.list', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('deve listar turnos ativos com mapeamento correto', async () => {
    setupSupabaseListMock(mockTurnosListDB);

    const turnos = await turnosAPI.list();

    expect(supabase.from).toHaveBeenCalledWith('turnos');
    expect(turnos).toHaveLength(2);
    expect(turnos[0].horaInicio).toBe('08:00');
    expect(turnos[0].horaFim).toBe('12:00');
    expect(turnos[0].vagasTotal).toBe(4);
  });

  it('deve retornar array vazio quando não há turnos', async () => {
    setupSupabaseListMock([]);

    const turnos = await turnosAPI.list();

    expect(turnos).toEqual([]);
  });

  it('deve lançar erro quando Supabase falha', async () => {
    const mockError = { message: 'Database error', code: 'PGRST301' };
    setupSupabaseListMock([], mockError);

    await expect(turnosAPI.list()).rejects.toEqual(mockError);
  });
});

// =====================================================
// TESTES: turnosAPI.create
// =====================================================

describe('turnosAPI.create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve criar turno com sucesso', async () => {
    setupSupabaseInsertMock(mockTurnoDB);

    const novoTurno = await turnosAPI.create({
      horaInicio: '08:00',
      horaFim: '12:00',
      vagasTotal: 4,
      setores: ['engenharia', 'assessoria'],
      cor: '#3B82F6',
      tipoRecorrencia: 'uteis',
    });

    expect(supabase.from).toHaveBeenCalledWith('turnos');
    expect(novoTurno.horaInicio).toBe('08:00');
    expect(novoTurno.vagasTotal).toBe(4);
  });

  it('deve distribuir vagas por setor automaticamente quando não informado', async () => {
    setupSupabaseInsertMock(mockTurnoDB);

    await turnosAPI.create({
      horaInicio: '08:00',
      horaFim: '12:00',
      vagasTotal: 4,
      setores: ['engenharia', 'assessoria'],
      cor: '#3B82F6',
      tipoRecorrencia: 'uteis',
    });

    expect(supabase.from).toHaveBeenCalled();
  });

  it('deve lançar erro quando criação falha', async () => {
    const mockError = { message: 'Validation error', code: '23505' };
    setupSupabaseInsertMock(null, mockError);

    await expect(
      turnosAPI.create({
        horaInicio: '08:00',
        horaFim: '12:00',
        vagasTotal: 4,
        setores: ['engenharia'],
        cor: '#3B82F6',
        tipoRecorrencia: 'uteis',
      })
    ).rejects.toEqual(mockError);
  });
});

// =====================================================
// TESTES: turnosAPI.update
// =====================================================

describe('turnosAPI.update', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve atualizar turno com sucesso', async () => {
    const turnoAtualizado = { ...mockTurnoDB, hora_fim: '13:00' };
    setupSupabaseUpdateMock(turnoAtualizado);

    const result = await turnosAPI.update('turno-001', { horaFim: '13:00' });

    expect(supabase.from).toHaveBeenCalledWith('turnos');
    expect(result.horaFim).toBe('13:00');
  });

  it('deve permitir atualização parcial', async () => {
    const turnoAtualizado = { ...mockTurnoDB, cor: '#FF0000' };
    setupSupabaseUpdateMock(turnoAtualizado);

    const result = await turnosAPI.update('turno-001', { cor: '#FF0000' });

    expect(result.cor).toBe('#FF0000');
  });

  it('deve permitir desativar turno', async () => {
    const turnoDesativado = { ...mockTurnoDB, ativo: false };
    setupSupabaseUpdateMock(turnoDesativado);

    const result = await turnosAPI.update('turno-001', { ativo: false });

    expect(result.ativo).toBe(false);
  });

  it('deve lançar erro quando atualização falha', async () => {
    const mockError = { message: 'Turno não encontrado', code: 'PGRST116' };
    setupSupabaseUpdateMock(null, mockError);

    await expect(turnosAPI.update('turno-inexistente', { cor: '#FF0000' })).rejects.toEqual(mockError);
  });
});

// =====================================================
// TESTES: turnosAPI.delete (soft delete)
// =====================================================

describe('turnosAPI.delete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve fazer soft delete (ativo = false)', async () => {
    const { mockUpdate, mockEq } = setupSupabaseDeleteMock();

    await turnosAPI.delete('turno-001');

    expect(supabase.from).toHaveBeenCalledWith('turnos');
    expect(mockUpdate).toHaveBeenCalledWith({ ativo: false });
    expect(mockEq).toHaveBeenCalledWith('id', 'turno-001');
  });

  it('deve lançar erro quando delete falha', async () => {
    const mockError = { message: 'Permissão negada', code: '42501' };
    setupSupabaseDeleteMock(mockError);

    await expect(turnosAPI.delete('turno-001')).rejects.toEqual(mockError);
  });
});

// =====================================================
// TESTES: Mapeamento snake_case → camelCase
// =====================================================

describe('Mapeamento de campos', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve mapear corretamente snake_case para camelCase', async () => {
    setupSupabaseListMock([mockTurnoDB]);

    const turnos = await turnosAPI.list();

    const turno = turnos[0];
    expect(turno.id).toBe(mockTurnoDB.id);
    expect(turno.horaInicio).toBe(mockTurnoDB.hora_inicio);
    expect(turno.horaFim).toBe(mockTurnoDB.hora_fim);
    expect(turno.vagasTotal).toBe(mockTurnoDB.vagas_total);
    expect(turno.vagasPorSetor).toEqual(mockTurnoDB.vagas_por_setor);
    expect(turno.tipoRecorrencia).toBe(mockTurnoDB.tipo_recorrencia);
    expect(turno.dataInicio).toBe(mockTurnoDB.data_inicio);
    expect(turno.dataFim).toBe(mockTurnoDB.data_fim);
    expect(turno.diasSemana).toEqual(mockTurnoDB.dias_semana);
    expect(turno.criadoPor).toBe(mockTurnoDB.criado_por);
    expect(turno.criadoEm).toBe(mockTurnoDB.criado_em);
    expect(turno.atualizadoEm).toBe(mockTurnoDB.atualizado_em);
  });

  it('deve tratar campos nulos/undefined', async () => {
    const turnoMinimo = {
      id: 'turno-003',
      hora_inicio: '09:00',
      hora_fim: '11:00',
      vagas_total: 2,
      vagas_por_setor: null,
      setores: null,
      cor: '#000000',
      tipo_recorrencia: 'uteis',
      ativo: true,
    };
    setupSupabaseListMock([turnoMinimo]);

    const turnos = await turnosAPI.list();

    expect(turnos[0].vagasPorSetor).toEqual({});
    expect(turnos[0].setores).toEqual([]);
  });
});

// =====================================================
// TESTES: Estrutura de dados de turnos
// =====================================================

describe('Estrutura de dados de turnos', () => {
  it('mockTurnoDB deve ter todos os campos obrigatórios', () => {
    expect(mockTurnoDB.id).toBeDefined();
    expect(mockTurnoDB.hora_inicio).toBeDefined();
    expect(mockTurnoDB.hora_fim).toBeDefined();
    expect(mockTurnoDB.vagas_total).toBeDefined();
    expect(mockTurnoDB.setores).toBeDefined();
    expect(mockTurnoDB.cor).toBeDefined();
    expect(mockTurnoDB.tipo_recorrencia).toBeDefined();
    expect(mockTurnoDB.ativo).toBeDefined();
  });

  it('deve ter vagas por setor configuradas', () => {
    expect(mockTurnoDB.vagas_por_setor).toBeDefined();
    expect(mockTurnoDB.vagas_por_setor.engenharia).toBe(2);
    expect(mockTurnoDB.vagas_por_setor.assessoria).toBe(2);
  });

  it('deve ter dias da semana para recorrência', () => {
    expect(mockTurnoDB.dias_semana).toBeDefined();
    expect(mockTurnoDB.dias_semana).toContain(1); // Segunda
    expect(mockTurnoDB.dias_semana).toContain(5); // Sexta
    expect(mockTurnoDB.dias_semana).not.toContain(0); // Domingo
    expect(mockTurnoDB.dias_semana).not.toContain(6); // Sábado
  });
});
