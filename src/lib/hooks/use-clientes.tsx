/**
 * Hook para gerenciamento de clientes
 * MODO FRONTEND ONLY - Sem dependências do Supabase
 */

import { useState, useEffect } from 'react';

// Mock de dados de clientes
const mockClientes = [
  {
    id: '1',
    nome_razao_social: 'João Silva',
    nome: 'João Silva',
    email: 'joao@email.com',
    telefone: '(11) 98765-4321',
    cpf_cnpj: '123.456.789-00',
    tipo: 'LEAD',
    tipo_cliente: 'PESSOA_FISICA',
    endereco: 'Rua A, 123',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '01234-567',
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    nome_razao_social: 'Maria Santos',
    nome: 'Maria Santos',
    email: 'maria@email.com',
    telefone: '(11) 91234-5678',
    cpf_cnpj: '987.654.321-00',
    tipo: 'LEAD',
    tipo_cliente: 'PESSOA_FISICA',
    endereco: 'Av. B, 456',
    cidade: 'São Paulo',
    estado: 'SP',
    cep: '02345-678',
    created_at: new Date().toISOString(),
  },
];

export function useClientes(tipo?: string) {
  const [clientes, setClientes] = useState<any[]>(mockClientes);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = () => {
    setLoading(true);
    // Simular delay de rede
    setTimeout(() => {
      const filtrados = tipo 
        ? mockClientes.filter(c => c.tipo === tipo)
        : mockClientes;
      setClientes(filtrados);
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    refetch();
  }, [tipo]);

  return { clientes, loading, error, refetch };
}

export function useCreateCliente() {
  const [loading, setLoading] = useState(false);

  const mutate = async (clienteData: any) => {
    setLoading(true);
    
    // Simular criação no backend
    return new Promise((resolve) => {
      setTimeout(() => {
        const novoCliente = {
          ...clienteData,
          id: Math.random().toString(36).substr(2, 9),
          created_at: new Date().toISOString(),
        };
        
        mockClientes.push(novoCliente);
        setLoading(false);
        resolve(novoCliente);
      }, 500);
    });
  };

  return { mutate, loading };
}

export function transformFormToCliente(formData: any) {
  const nomeRazao = formData.nomeCompleto || formData.razaoSocial || formData.nome || '';
  return {
    nome_razao_social: nomeRazao,
    nome: nomeRazao,
    email: formData.email || '',
    telefone: formData.telefone || '',
    cpf_cnpj: formData.cpf || formData.cnpj || formData.cpfCnpj || '',
    tipo: 'LEAD',
    tipo_cliente: formData.tipo === 'fisica' ? 'PESSOA_FISICA' : 'PESSOA_JURIDICA',
    endereco: formData.endereco || '',
    cidade: formData.cidade || '',
    estado: formData.estado || '',
    cep: formData.cep || '',
  };
}