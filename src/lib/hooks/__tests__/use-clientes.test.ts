/**
 * Testes unitários para os hooks/funções de clientes
 *
 * Testa a função transformFormToCliente e mocks da clientesAPI
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock do clientesAPI - deve vir antes do import do hook
vi.mock('@/lib/api-client', () => ({
  clientesAPI: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
}));

import { transformFormToCliente } from '../use-clientes';
import { clientesAPI } from '@/lib/api-client';

// =====================================================
// DADOS DE TESTE
// =====================================================

const mockClientes = [
  {
    id: 'cliente-001',
    nome_razao_social: 'Empresa ABC Ltda',
    cpf_cnpj: '12.345.678/0001-90',
    email: 'contato@abc.com',
    telefone: '(11) 3333-4444',
    status: 'ativo',
    tipo_cliente: 'PESSOA_JURIDICA',
  },
  {
    id: 'cliente-002',
    nome_razao_social: 'João da Silva',
    cpf_cnpj: '123.456.789-00',
    email: 'joao@email.com',
    telefone: '(11) 99999-8888',
    status: 'lead',
    tipo_cliente: 'PESSOA_FISICA',
  },
];

const mockNovoCliente = {
  id: 'cliente-003',
  nome_razao_social: 'Novo Cliente Ltda',
  cpf_cnpj: '98.765.432/0001-10',
  email: 'novo@cliente.com',
  telefone: '(11) 5555-6666',
  status: 'lead',
};

// =====================================================
// TESTES: clientesAPI (mocks)
// =====================================================

describe('clientesAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('list', () => {
    it('deve retornar lista de clientes', async () => {
      (clientesAPI.list as ReturnType<typeof vi.fn>).mockResolvedValue(mockClientes);

      const result = await clientesAPI.list();

      expect(result).toEqual(mockClientes);
      expect(clientesAPI.list).toHaveBeenCalled();
    });

    it('deve aceitar filtro LEAD', async () => {
      const leadsOnly = mockClientes.filter((c) => c.status === 'lead');
      (clientesAPI.list as ReturnType<typeof vi.fn>).mockResolvedValue(leadsOnly);

      const result = await clientesAPI.list('LEAD');

      expect(result).toEqual(leadsOnly);
      expect(clientesAPI.list).toHaveBeenCalledWith('LEAD');
    });

    it('deve retornar array vazio quando não há clientes', async () => {
      (clientesAPI.list as ReturnType<typeof vi.fn>).mockResolvedValue([]);

      const result = await clientesAPI.list();

      expect(result).toEqual([]);
    });

    it('deve lançar erro quando API falha', async () => {
      const mockError = new Error('Falha na conexão');
      (clientesAPI.list as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(clientesAPI.list()).rejects.toThrow('Falha na conexão');
    });
  });

  describe('create', () => {
    it('deve criar cliente com sucesso', async () => {
      (clientesAPI.create as ReturnType<typeof vi.fn>).mockResolvedValue(mockNovoCliente);

      const result = await clientesAPI.create({
        nome_razao_social: 'Novo Cliente Ltda',
        email: 'novo@cliente.com',
      });

      expect(result).toEqual(mockNovoCliente);
      expect(clientesAPI.create).toHaveBeenCalled();
    });

    it('deve lançar erro quando criação falha', async () => {
      const mockError = new Error('Erro de validação');
      (clientesAPI.create as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(clientesAPI.create({})).rejects.toThrow('Erro de validação');
    });
  });

  describe('update', () => {
    it('deve atualizar cliente com sucesso', async () => {
      const clienteAtualizado = { ...mockClientes[0], nome_razao_social: 'Nome Atualizado' };
      (clientesAPI.update as ReturnType<typeof vi.fn>).mockResolvedValue(clienteAtualizado);

      const result = await clientesAPI.update('cliente-001', { nome_razao_social: 'Nome Atualizado' });

      expect(result).toEqual(clienteAtualizado);
      expect(clientesAPI.update).toHaveBeenCalledWith('cliente-001', { nome_razao_social: 'Nome Atualizado' });
    });

    it('deve lançar erro quando cliente não encontrado', async () => {
      const mockError = new Error('Cliente não encontrado');
      (clientesAPI.update as ReturnType<typeof vi.fn>).mockRejectedValue(mockError);

      await expect(clientesAPI.update('inexistente', {})).rejects.toThrow('Cliente não encontrado');
    });
  });
});

// =====================================================
// TESTES: transformFormToCliente (função pura)
// =====================================================

describe('transformFormToCliente', () => {
  it('deve transformar dados de pessoa física corretamente', () => {
    const formData = {
      nomeCompleto: 'João da Silva',
      cpf: '123.456.789-00',
      email: 'joao@email.com',
      telefone: '(11) 99999-8888',
      tipo: 'fisica',
      cep: '01310-100',
      endereco: 'Av. Paulista',
      numero: '1000',
      complemento: 'Sala 501',
      bairro: 'Bela Vista',
      cidade: 'São Paulo',
      estado: 'SP',
      observacoes: 'Cliente VIP',
    };

    const result = transformFormToCliente(formData);

    expect(result.nome_razao_social).toBe('João da Silva');
    expect(result.cpf_cnpj).toBe('123.456.789-00');
    expect(result.email).toBe('joao@email.com');
    expect(result.telefone).toBe('(11) 99999-8888');
    expect(result.tipo_cliente).toBe('PESSOA_FISICA');
    expect(result.status).toBe('lead');
    expect(result.endereco.cep).toBe('01310-100');
    expect(result.endereco.logradouro).toBe('Av. Paulista');
    expect(result.endereco.numero).toBe('1000');
    expect(result.endereco.cidade).toBe('São Paulo');
    expect(result.observacoes).toBe('Cliente VIP');
  });

  it('deve transformar dados de pessoa jurídica corretamente', () => {
    const formData = {
      razaoSocial: 'Empresa ABC Ltda',
      cnpj: '12.345.678/0001-90',
      email: 'contato@abc.com',
      telefone: '(11) 3333-4444',
      tipo: 'juridica',
      nomeResponsavel: 'Carlos Diretor',
      cargoResponsavel: 'Diretor',
    };

    const result = transformFormToCliente(formData);

    expect(result.nome_razao_social).toBe('Empresa ABC Ltda');
    expect(result.cpf_cnpj).toBe('12.345.678/0001-90');
    expect(result.tipo_cliente).toBe('PESSOA_JURIDICA');
    expect(result.nome_responsavel).toBe('Carlos Diretor');
    expect(result.endereco.cargo_responsavel).toBe('Diretor');
  });

  it('deve tratar campos opcionais ausentes', () => {
    const formData = {
      nome: 'Cliente Mínimo',
    };

    const result = transformFormToCliente(formData);

    expect(result.nome_razao_social).toBe('Cliente Mínimo');
    expect(result.email).toBe('');
    expect(result.telefone).toBe('');
    expect(result.cpf_cnpj).toBe('');
    expect(result.endereco.cep).toBe('');
  });

  it('deve incluir campos de edificação no endereço', () => {
    const formData = {
      nomeCompleto: 'Cliente Condomínio',
      tipoEdificacao: 'Condomínio',
      qtdUnidades: '50',
      qtdBlocos: '3',
      qtdPavimentos: '10',
      tipoTelhado: 'Laje',
      possuiElevador: true,
      possuiPiscina: true,
    };

    const result = transformFormToCliente(formData);

    expect(result.endereco.tipo_edificacao).toBe('Condomínio');
    expect(result.endereco.qtd_unidades).toBe('50');
    expect(result.endereco.qtd_blocos).toBe('3');
    expect(result.endereco.qtd_pavimentos).toBe('10');
    expect(result.endereco.tipo_telhado).toBe('Laje');
    expect(result.endereco.possui_elevador).toBe(true);
    expect(result.endereco.possui_piscina).toBe(true);
  });

  it('deve usar cpfCnpj quando cpf e cnpj não existem', () => {
    const formData = {
      nome: 'Cliente',
      cpfCnpj: '11.222.333/0001-44',
    };

    const result = transformFormToCliente(formData);

    expect(result.cpf_cnpj).toBe('11.222.333/0001-44');
  });

  it('deve priorizar nomeCompleto sobre razaoSocial e nome', () => {
    const formData = {
      nomeCompleto: 'Nome Completo',
      razaoSocial: 'Razao Social',
      nome: 'Nome',
    };

    const result = transformFormToCliente(formData);

    expect(result.nome_razao_social).toBe('Nome Completo');
  });
});

// =====================================================
// TESTES: Estrutura de dados de clientes
// =====================================================

describe('Estrutura de dados de clientes', () => {
  it('mockClientes deve ter todos os campos obrigatórios', () => {
    mockClientes.forEach((cliente) => {
      expect(cliente.id).toBeDefined();
      expect(cliente.nome_razao_social).toBeDefined();
      expect(cliente.email).toBeDefined();
      expect(cliente.status).toBeDefined();
      expect(cliente.tipo_cliente).toBeDefined();
    });
  });

  it('deve haver cliente PF e PJ nos mocks', () => {
    const pf = mockClientes.find((c) => c.tipo_cliente === 'PESSOA_FISICA');
    const pj = mockClientes.find((c) => c.tipo_cliente === 'PESSOA_JURIDICA');

    expect(pf).toBeDefined();
    expect(pj).toBeDefined();
  });
});
