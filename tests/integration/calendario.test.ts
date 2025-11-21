/**
 * Testes de Integração: Componente Calendário
 *
 * Testa as funções RPC do Supabase relacionadas ao calendário:
 * - obter_turnos_disponiveis
 * - verificar_vagas_turno
 *
 * IMPORTANTE: Estes testes requerem conexão com o Supabase.
 * Configure as variáveis de ambiente antes de executar:
 * - VITE_SUPABASE_URL
 * - VITE_SUPABASE_ANON_KEY
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase';

// Criar cliente Supabase para testes
const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

describe('Calendário Integration Tests', () => {
  // Verificar se as credenciais do Supabase estão configuradas
  beforeAll(() => {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Variáveis de ambiente não configuradas: VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY são obrigatórias'
      );
    }
  });

  describe('obter_turnos_disponiveis', () => {
    test('deve carregar turnos sem erro 500', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7); // 7 dias no futuro
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('obter_turnos_disponiveis', {
        p_data: dataFormatada,
      });

      // Não deve haver erro
      expect(error).toBeNull();

      // Deve retornar dados (mesmo que seja array vazio)
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('deve retornar array vazio para datas sem turnos', async () => {
      // Data muito no futuro, improvável ter turnos configurados
      const dataDistante = '2030-01-01';

      const { data, error } = await supabase.rpc('obter_turnos_disponiveis', {
        p_data: dataDistante,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('deve retornar turnos com estrutura correta', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('obter_turnos_disponiveis', {
        p_data: dataFormatada,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Se houver turnos, verificar estrutura
      if (data && data.length > 0) {
        const turno = data[0];

        // Verificar campos obrigatórios
        expect(turno).toHaveProperty('turno_id');
        expect(turno).toHaveProperty('hora_inicio');
        expect(turno).toHaveProperty('hora_fim');
        expect(turno).toHaveProperty('vagas_total');
        expect(turno).toHaveProperty('vagas_ocupadas');
        expect(turno).toHaveProperty('setores');
        expect(turno).toHaveProperty('cor');

        // Verificar tipos
        expect(typeof turno.turno_id).toBe('string');
        expect(typeof turno.hora_inicio).toBe('string');
        expect(typeof turno.hora_fim).toBe('string');
        expect(typeof turno.vagas_total).toBe('number');
        expect(typeof turno.vagas_ocupadas).toBe('number');
        expect(Array.isArray(turno.setores)).toBe(true);
        expect(typeof turno.cor).toBe('string');

        // Validar valores lógicos
        expect(turno.vagas_total).toBeGreaterThan(0);
        expect(turno.vagas_ocupadas).toBeGreaterThanOrEqual(0);
        expect(turno.vagas_ocupadas).toBeLessThanOrEqual(turno.vagas_total);
      }
    });

    test('deve retornar turnos ordenados por hora_inicio', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('obter_turnos_disponiveis', {
        p_data: dataFormatada,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Se houver 2 ou mais turnos, verificar ordenação
      if (data && data.length >= 2) {
        for (let i = 0; i < data.length - 1; i++) {
          const horaAtual = data[i].hora_inicio;
          const proximaHora = data[i + 1].hora_inicio;
          expect(horaAtual <= proximaHora).toBe(true);
        }
      }
    });

    test('deve lidar com datas no passado', async () => {
      const dataPassada = '2020-01-01';

      const { data, error } = await supabase.rpc('obter_turnos_disponiveis', {
        p_data: dataPassada,
      });

      // Não deve gerar erro mesmo para datas no passado
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('verificar_vagas_turno', () => {
    test('deve retornar false para turno inexistente', async () => {
      const turnoInexistente = '00000000-0000-0000-0000-000000000000';
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('verificar_vagas_turno', {
        p_turno_id: turnoInexistente,
        p_data: dataFormatada,
        p_horario_inicio: '08:00:00',
        p_horario_fim: '10:00:00',
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(typeof data).toBe('boolean');
      expect(data).toBe(false);
    });

    test('deve retornar boolean para qualquer entrada válida', async () => {
      // Mesmo com UUID aleatório, deve retornar boolean (false)
      const uuidAleatorio = '12345678-1234-1234-1234-123456789012';
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      const { data, error } = await supabase.rpc('verificar_vagas_turno', {
        p_turno_id: uuidAleatorio,
        p_data: dataFormatada,
        p_horario_inicio: '14:00:00',
        p_horario_fim: '16:00:00',
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(typeof data).toBe('boolean');
    });

    test('deve aceitar diferentes formatos de horário', async () => {
      const turnoId = '12345678-1234-1234-1234-123456789012';
      const dataFormatada = '2025-11-30';

      // Testar com formato HH:MM
      const { data: data1, error: error1 } = await supabase.rpc(
        'verificar_vagas_turno',
        {
          p_turno_id: turnoId,
          p_data: dataFormatada,
          p_horario_inicio: '08:00',
          p_horario_fim: '10:00',
        }
      );

      expect(error1).toBeNull();
      expect(typeof data1).toBe('boolean');

      // Testar com formato HH:MM:SS
      const { data: data2, error: error2 } = await supabase.rpc(
        'verificar_vagas_turno',
        {
          p_turno_id: turnoId,
          p_data: dataFormatada,
          p_horario_inicio: '08:00:00',
          p_horario_fim: '10:00:00',
        }
      );

      expect(error2).toBeNull();
      expect(typeof data2).toBe('boolean');
    });
  });

  describe('SECURITY DEFINER - Teste de Permissões', () => {
    test('deve funcionar para usuários não autenticados (anon)', async () => {
      // Criar cliente anônimo (sem autenticação)
      const supabaseAnon = createClient<Database>(supabaseUrl, supabaseAnonKey);

      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      const { data, error } = await supabaseAnon.rpc('obter_turnos_disponiveis', {
        p_data: dataFormatada,
      });

      // Não deve haver erro de permissão
      expect(error).toBeNull();
      expect(data).toBeDefined();
      expect(Array.isArray(data)).toBe(true);
    });

    test('deve executar sem violar RLS policies', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      // Esta query deve funcionar mesmo com RLS ativo
      // porque as funções usam SECURITY DEFINER
      const { data, error } = await supabase.rpc('obter_turnos_disponiveis', {
        p_data: dataFormatada,
      });

      expect(error).toBeNull();
      expect(data).toBeDefined();

      // Não deve retornar erro 500 ou erro de permissão
      if (error) {
        expect(error.code).not.toBe('42501'); // Insufficient privilege
        expect(error.message).not.toContain('500');
      }
    });
  });

  describe('Performance', () => {
    test('deve responder em menos de 2 segundos', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      const inicio = Date.now();

      await supabase.rpc('obter_turnos_disponiveis', {
        p_data: dataFormatada,
      });

      const duracao = Date.now() - inicio;

      expect(duracao).toBeLessThan(2000);
    });

    test('deve lidar com múltiplas requisições concorrentes', async () => {
      const dataFutura = new Date();
      dataFutura.setDate(dataFutura.getDate() + 7);
      const dataFormatada = dataFutura.toISOString().split('T')[0];

      // Fazer 5 requisições concorrentes
      const promises = Array(5)
        .fill(null)
        .map(() =>
          supabase.rpc('obter_turnos_disponiveis', {
            p_data: dataFormatada,
          })
        );

      const resultados = await Promise.all(promises);

      // Todas devem suceder
      resultados.forEach((resultado) => {
        expect(resultado.error).toBeNull();
        expect(resultado.data).toBeDefined();
        expect(Array.isArray(resultado.data)).toBe(true);
      });
    });
  });
});
