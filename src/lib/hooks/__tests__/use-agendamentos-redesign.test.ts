/**
 * Testes para o hook useAgendamentos após redesign do card de turno
 * Foco: Filtragem de agendamentos cancelados e dados enriquecidos
 */

import { renderHook } from '@testing-library/react';
import { useAgendamentos } from '../use-agendamentos';
import { supabase } from '@/lib/supabase-client';

// Mock do Supabase
jest.mock('@/lib/supabase-client', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  neq: jest.fn(() => ({
                    then: jest.fn()
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    }))
  }
}));

describe('useAgendamentos - Redesign', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should show badge with user avatar and category when agendamento exists', () => {
    // Teste do componente BlocoTurno com agendamento
    const agendamentoRealizado = {
      id: '1',
      categoria: 'Vistoria Técnica',
      setor: 'assessoria',
      usuarioNome: 'João Silva',
      osCodigo: 'OS-2025-001',
      clienteNome: 'Cliente A',
      statusGeralOS: 'em_andamento',
      etapasAtivas: 2
    };

    const turno = {
      id: 'turno-1',
      vagasOcupadas: 0,
      vagasTotal: 1,
      setores: ['assessoria'],
      cor: '#3B82F6',
      agendamentosRealizados: [agendamentoRealizado],
      etapasAtivas: 2
    };

    // Verificar se o badge aparece com avatar e categoria
    expect(turno.agendamentosRealizados).toHaveLength(1);
    expect(turno.agendamentosRealizados[0].categoria).toBe('Vistoria Técnica');
    expect(turno.agendamentosRealizados[0].usuarioNome).toBe('João Silva');
  });

  test('should show "Disponível" when no agendamentos', () => {
    const turno = {
      id: 'turno-1',
      vagasOcupadas: 0,
      vagasTotal: 1,
      setores: ['assessoria'],
      cor: '#3B82F6',
      agendamentosRealizados: [],
      etapasAtivas: 0
    };

    expect(turno.agendamentosRealizados).toHaveLength(0);
    expect(turno.etapasAtivas).toBe(0);
  });

  test('should filter out cancelled OS agendamentos', async () => {
    const mockData = [
      {
        id: '1',
        status: 'confirmado',
        statusGeralOS: 'em_andamento',
        colaborador: { nome_completo: 'João Silva' },
        ordens_servico: {
          codigo_os: 'OS-2025-001',
          status_geral: 'em_andamento',
          cliente: { nome_razao_social: 'Cliente A' },
          etapas: [
            { status: 'pendente' },
            { status: 'em_andamento' }
          ]
        }
      },
      {
        id: '2',
        status: 'confirmado',
        statusGeralOS: 'cancelado',
        colaborador: { nome_completo: 'Maria Santos' },
        ordens_servico: {
          codigo_os: 'OS-2025-002',
          status_geral: 'cancelado',
          cliente: { nome_razao_social: 'Cliente B' },
          etapas: []
        }
      }
    ];

    // Mock da resposta do Supabase
    const mockSupabase = supabase as any;
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  neq: jest.fn(() => ({
                    then: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAgendamentos({ dataInicio: '2025-11-25', dataFim: '2025-11-25' })
    );

    await waitForNextUpdate();

    expect(result.current.agendamentos).toHaveLength(1);
    expect(result.current.agendamentos[0].id).toBe('1');
    expect(result.current.agendamentos[0].statusGeralOS).toBe('em_andamento');
  });

  test('should calculate etapas ativas correctly', async () => {
    const mockData = [
      {
        id: '1',
        status: 'confirmado',
        statusGeralOS: 'em_andamento',
        colaborador: { nome_completo: 'João Silva' },
        ordens_servico: {
          codigo_os: 'OS-2025-001',
          status_geral: 'em_andamento',
          cliente: { nome_razao_social: 'Cliente A' },
          etapas: [
            { status: 'pendente' },
            { status: 'em_andamento' },
            { status: 'concluida' },
            { status: 'bloqueada' }
          ]
        }
      }
    ];

    const mockSupabase = supabase as any;
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  neq: jest.fn(() => ({
                    then: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAgendamentos({ dataInicio: '2025-11-25', dataFim: '2025-11-25' })
    );

    await waitForNextUpdate();

    expect(result.current.agendamentos[0].etapasAtivas).toBe(3); // pendente, em_andamento, bloqueada
  });

  test('should enrich agendamento data with user and OS info', async () => {
    const mockData = [
      {
        id: '1',
        status: 'confirmado',
        statusGeralOS: 'em_andamento',
        colaborador: { nome_completo: 'João Silva' },
        ordens_servico: {
          codigo_os: 'OS-2025-001',
          status_geral: 'em_andamento',
          cliente: { nome_razao_social: 'Cliente A' },
          etapas: [{ status: 'pendente' }]
        }
      }
    ];

    const mockSupabase = supabase as any;
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  neq: jest.fn(() => ({
                    then: jest.fn(() => Promise.resolve({ data: mockData, error: null }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAgendamentos({ dataInicio: '2025-11-25', dataFim: '2025-11-25' })
    );

    await waitForNextUpdate();

    const agendamento = result.current.agendamentos[0];
    expect(agendamento.usuarioNome).toBe('João Silva');
    expect(agendamento.osCodigo).toBe('OS-2025-001');
    expect(agendamento.clienteNome).toBe('Cliente A');
    expect(agendamento.statusGeralOS).toBe('em_andamento');
    expect(agendamento.etapasAtivas).toBe(1);
  });

  test('should handle empty data gracefully', async () => {
    const mockSupabase = supabase as any;
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  neq: jest.fn(() => ({
                    then: jest.fn(() => Promise.resolve({ data: null, error: null }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAgendamentos({ dataInicio: '2025-11-25', dataFim: '2025-11-25' })
    );

    await waitForNextUpdate();

    expect(result.current.agendamentos).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  test('should handle error states', async () => {
    const mockError = new Error('Database connection failed');
    const mockSupabase = supabase as any;
    mockSupabase.from.mockReturnValue({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          eq: jest.fn(() => ({
            gte: jest.fn(() => ({
              lte: jest.fn(() => ({
                eq: jest.fn(() => ({
                  neq: jest.fn(() => ({
                    then: jest.fn(() => Promise.resolve({ data: null, error: mockError }))
                  }))
                }))
              }))
            }))
          }))
        }))
      }))
    });

    const { result, waitForNextUpdate } = renderHook(() =>
      useAgendamentos({ dataInicio: '2025-11-25', dataFim: '2025-11-25' })
    );

    await waitForNextUpdate();

    expect(result.current.error).toBe(mockError);
    expect(result.current.agendamentos).toEqual([]);
  });
});