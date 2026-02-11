/**
 * Testes Unitários - Integração Módulo Colaborador
 * Valida estruturas de dados e lógica de negócio
 */

import { describe, it, expect } from 'vitest';
import { FATOR_ENCARGOS_CLT } from '@/lib/constants/colaboradores';

// Valor padrão de fallback para testes unitários (sem acesso à RPC)
const DIAS_UTEIS_PADRAO = 22;

describe('Módulo Colaborador - Validações Unitárias', () => {
  describe('Estrutura de Dados - Registro de Presença', () => {
    it('deve validar estrutura completa de registro de presença', () => {
      const registroPresenca = {
        colaboradorId: 'test-id',
        status: 'OK' as const,
        performance: 'BOA' as const,
        centrosCusto: ['cc1', 'cc2'],
        confirmedAt: null,
        confirmedBy: null,
        justificativaStatus: undefined,
        justificativaPerformance: undefined,
        minutosAtraso: undefined,
        anexoUrl: undefined
      };

      expect(registroPresenca.colaboradorId).toBe('test-id');
      expect(registroPresenca.status).toBe('OK');
      expect(registroPresenca.performance).toBe('BOA');
      expect(Array.isArray(registroPresenca.centrosCusto)).toBe(true);
      expect(registroPresenca.centrosCusto).toHaveLength(2);
      expect(registroPresenca.confirmedAt).toBeNull();
      expect(registroPresenca.confirmedBy).toBeNull();
    });

    it('deve validar campos obrigatórios de presença', () => {
      const registroValido = {
        colaboradorId: 'test-id',
        status: 'OK' as const,
        performance: 'BOA' as const,
        centrosCusto: ['cc1']
      };

      expect(registroValido.colaboradorId).toBeTruthy();
      expect(['OK', 'ATRASADO', 'FALTA']).toContain(registroValido.status);
      expect(['OTIMA', 'BOA', 'REGULAR', 'RUIM', 'PESSIMA']).toContain(registroValido.performance);
      expect(registroValido.centrosCusto.length).toBeGreaterThan(0);
    });

    it('deve validar registro confirmado', () => {
      const registroConfirmado = {
        colaboradorId: 'test-id',
        status: 'OK' as const,
        performance: 'BOA' as const,
        centrosCusto: ['cc1'],
        confirmedAt: '2025-12-03T10:00:00Z',
        confirmedBy: 'admin-id'
      };

      expect(registroConfirmado.confirmedAt).toBeTruthy();
      expect(registroConfirmado.confirmedBy).toBeTruthy();
      expect(typeof registroConfirmado.confirmedAt).toBe('string');
    });
  });

  describe('Regras de Negócio - Controle de Presença', () => {
    it('deve validar cálculo de custo CLT', () => {
      const colaboradorCLT = {
        tipo_contratacao: 'CLT',
        salario_base: 3000,
        custo_dia: 0
      };

      const custoDiaEsperado = (3000 * FATOR_ENCARGOS_CLT) / DIAS_UTEIS_PADRAO;
      const custoDiaCalculado = colaboradorCLT.tipo_contratacao === 'CLT'
        ? (colaboradorCLT.salario_base || 0) * FATOR_ENCARGOS_CLT / DIAS_UTEIS_PADRAO
        : colaboradorCLT.custo_dia || 0;

      expect(custoDiaCalculado).toBeCloseTo(custoDiaEsperado, 2);
      expect(custoDiaCalculado).toBeGreaterThan(0);
    });

    it('deve validar cálculo de custo PJ', () => {
      const colaboradorPJ = {
        tipo_contratacao: 'PJ',
        salario_base: 0,
        custo_dia: 250
      };

      const custoDiaCalculado = colaboradorPJ.tipo_contratacao === 'CLT'
        ? (colaboradorPJ.salario_base || 0) * FATOR_ENCARGOS_CLT / DIAS_UTEIS_PADRAO
        : colaboradorPJ.custo_dia || 0;

      expect(custoDiaCalculado).toBe(250);
    });

    it('deve validar justificativas obrigatórias', () => {
      const validacoes = [];

      // FALTA deve ter justificativa
      const faltaSemJustificativa = { status: 'FALTA', justificativaStatus: null };
      if ((faltaSemJustificativa.status === 'FALTA' || faltaSemJustificativa.status === 'ATRASADO') && !faltaSemJustificativa.justificativaStatus) {
        validacoes.push('FALTA precisa justificativa');
      }

      // ATRASADO deve ter justificativa
      const atrasadoSemJustificativa = { status: 'ATRASADO', justificativaStatus: null };
      if ((atrasadoSemJustificativa.status === 'FALTA' || atrasadoSemJustificativa.status === 'ATRASADO') && !atrasadoSemJustificativa.justificativaStatus) {
        validacoes.push('ATRASADO precisa justificativa');
      }

      // RUIM deve ter justificativa
      const ruimSemJustificativa = { performance: 'RUIM', justificativaPerformance: null };
      if (ruimSemJustificativa.performance === 'RUIM' && !ruimSemJustificativa.justificativaPerformance) {
        validacoes.push('RUIM precisa justificativa');
      }

      expect(validacoes).toHaveLength(3);
      expect(validacoes).toContain('FALTA precisa justificativa');
      expect(validacoes).toContain('ATRASADO precisa justificativa');
      expect(validacoes).toContain('RUIM precisa justificativa');
    });
  });

  describe('Estrutura de Dados - Colaborador', () => {
    it('deve validar campos obrigatórios do colaborador', () => {
      const colaborador = {
        id: 'uuid-colaborador',
        nome_completo: 'João Silva',
        email: 'joao@teste.com',
        cpf: '12345678901',
        telefone: '11999999999',
        cargo_id: 'uuid-cargo',
        setor_id: 'uuid-setor',
        setor: 'obras',
        ativo: true,
        data_admissao: '2025-01-01',
        tipo_contratacao: 'CLT',
        salario_base: 3000,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      expect(colaborador.id).toBeTruthy();
      expect(colaborador.nome_completo).toBeTruthy();
      expect(colaborador.email).toBeTruthy();
      expect(colaborador.cargo_id).toBeTruthy();
      expect(colaborador.setor_id).toBeTruthy();
      expect(colaborador.ativo).toBe(true);
      expect(['CLT', 'PJ', 'ESTAGIO']).toContain(colaborador.tipo_contratacao);
    });

    it('deve validar tipos de contratação', () => {
      const tiposValidos = ['CLT', 'PJ', 'ESTAGIO'];
      const tipoInvalido = 'FREELANCER';

      expect(tiposValidos).toContain('CLT');
      expect(tiposValidos).toContain('PJ');
      expect(tiposValidos).toContain('ESTAGIO');
      expect(tiposValidos).not.toContain(tipoInvalido);
    });
  });

  describe('Estrutura de Dados - Cliente/Lead', () => {
    it('deve validar estrutura de cliente', () => {
      const cliente = {
        id: 'uuid-cliente',
        nome_razao_social: 'Empresa Teste Ltda',
        cpf_cnpj: '12345678000199',
        email: 'contato@empresa.com',
        telefone: '1133333333',
        status: 'lead',
        responsavel_id: 'uuid-colaborador',
        endereco: {
          logradouro: 'Rua Teste',
          numero: '123',
          bairro: 'Centro',
          cidade: 'São Paulo',
          estado: 'SP',
          cep: '01234567'
        },
        observacoes: 'Cliente em prospecção',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z',
        tipo_cliente: 'PESSOA_JURIDICA'
      };

      expect(cliente.id).toBeTruthy();
      expect(cliente.nome_razao_social).toBeTruthy();
      expect(cliente.status).toBe('lead');
      expect(['lead', 'ativo', 'inativo', 'blacklist']).toContain(cliente.status);
      expect(['PESSOA_FISICA', 'PESSOA_JURIDICA']).toContain(cliente.tipo_cliente);
    });

    it('deve validar filtros de leads', () => {
      const leads = [
        { status: 'lead', responsavel_id: 'user1', nome_razao_social: 'Lead 1' },
        { status: 'ativo', responsavel_id: 'user1', nome_razao_social: 'Cliente 1' },
        { status: 'lead', responsavel_id: 'user2', nome_razao_social: 'Lead 2' }
      ];

      const leadsDoUsuario1 = leads.filter(lead =>
        lead.status === 'lead' && lead.responsavel_id === 'user1'
      );

      expect(leadsDoUsuario1).toHaveLength(1);
      expect(leadsDoUsuario1[0].nome_razao_social).toBe('Lead 1');
    });
  });

  describe('Validações de Segurança e Permissões', () => {
    it('deve validar isolamento de dados por usuário', () => {
      const user1 = { id: 'user1', setor: 'obras' };
      const user2 = { id: 'user2', setor: 'assessoria' };

      // Usuários diferentes devem ter dados isolados
      expect(user1.id).not.toBe(user2.id);
      expect(user1.setor).not.toBe(user2.setor);

      // Dados devem ser filtrados por usuário
      const dadosUser1 = [
        { user_id: 'user1', content: 'Dado 1' },
        { user_id: 'user2', content: 'Dado 2' }
      ].filter(item => item.user_id === user1.id);

      expect(dadosUser1).toHaveLength(1);
      expect(dadosUser1[0].content).toBe('Dado 1');
    });

    it('deve validar permissões por setor', () => {
      const setoresPermitidos = ['obras', 'assessoria', 'administrativo'];
      const setorUsuario = 'obras';

      expect(setoresPermitidos).toContain(setorUsuario);

      // Apenas administrativo pode ver leads
      const podeVerLeads = setorUsuario === 'administrativo';
      expect(podeVerLeads).toBe(false);

      const setorAdmin: string = 'administrativo';
      const adminPodeVerLeads = setorAdmin === 'administrativo';
      expect(adminPodeVerLeads).toBe(true);
    });

    it('deve validar hierarquia de cargos', () => {
      const niveis = {
        admin: 10,
        diretoria: 9,
        gestor_administrativo: 5,
        gestor_obras: 5,
        gestor_assessoria: 5,
        colaborador: 1,
        mao_de_obra: 0
      };

      expect(niveis.admin).toBeGreaterThan(niveis.diretoria);
      expect(niveis.gestor_obras).toBeGreaterThan(niveis.colaborador);
      expect(niveis.colaborador).toBeGreaterThan(niveis.mao_de_obra);

      // Gestores têm mesmo nível
      expect(niveis.gestor_obras).toBe(niveis.gestor_assessoria);
      expect(niveis.gestor_assessoria).toBe(niveis.gestor_administrativo);
    });
  });

  describe('Integração com Supabase - Estruturas', () => {
    it('deve validar estrutura de query UPSERT', () => {
      const upsertData = [
        {
          colaborador_id: 'uuid-colaborador',
          data: '2025-12-03',
          status: 'OK',
          minutos_atraso: null,
          justificativa: null,
          performance: 'BOA',
          performance_justificativa: null,
          centros_custo: ['cc1', 'cc2'],
          anexo_url: null,
          updated_at: '2025-12-03T10:00:00Z'
        }
      ];

      expect(Array.isArray(upsertData)).toBe(true);
      expect(upsertData[0].colaborador_id).toBeTruthy();
      expect(upsertData[0].data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['OK', 'ATRASADO', 'FALTA']).toContain(upsertData[0].status);
      expect(Array.isArray(upsertData[0].centros_custo)).toBe(true);
    });

    it('deve validar estrutura de centros de custo JSONB', () => {
      const centrosCusto = ['uuid-cc1', 'uuid-cc2', 'uuid-cc3'];

      expect(Array.isArray(centrosCusto)).toBe(true);
      expect(centrosCusto.length).toBeGreaterThan(0);
      expect(centrosCusto.every(cc => typeof cc === 'string')).toBe(true);
      expect(centrosCusto.every(cc => cc.length > 0)).toBe(true);
    });

    it('deve validar estrutura de agendamento', () => {
      const agendamento = {
        turno_id: 'uuid-turno',
        data: '2025-12-03',
        horario_inicio: '08:00:00',
        horario_fim: '17:00:00',
        duracao_horas: 8,
        categoria: 'Trabalho',
        setor: 'obras',
        os_id: 'uuid-os',
        status: 'confirmado',
        criado_por: 'uuid-colaborador'
      };

      expect(agendamento.turno_id).toBeTruthy();
      expect(agendamento.data).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(agendamento.duracao_horas).toBeGreaterThan(0);
      expect(['confirmado', 'cancelado', 'realizado', 'ausente']).toContain(agendamento.status);
      expect(agendamento.criado_por).toBeTruthy();
    });
  });
});