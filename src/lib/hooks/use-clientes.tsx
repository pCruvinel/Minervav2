/**
 * Hook para gerenciamento de clientes
 * Integrado com backend Supabase via clientesAPI
 */

import { useState, useEffect } from 'react';
import { clientesAPI } from '../api-client';

export function useClientes(tipo?: string) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Carregando clientes do backend...', tipo ? `com filtro: ${tipo}` : '');

      // Chamar API real do backend
      const dados = await clientesAPI.list(tipo === 'LEAD' ? 'LEAD' : undefined);

      console.log('✅ Clientes carregados:', dados);
      setClientes(dados || []);
    } catch (err) {
      console.error('❌ Erro ao carregar clientes:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
  }, [tipo]);

  return { clientes, loading, error, refetch };
}

export function useCreateCliente() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (clienteData: any) => {
    try {
      setLoading(true);
      setError(null);

      console.log('📝 Criando cliente no backend...', clienteData);

      // Chamar API real do backend (que retorna UUID válido do Supabase)
      const novoCliente = await clientesAPI.create(clienteData);

      console.log('✅ Cliente criado com UUID válido:', novoCliente.id);
      setLoading(false);

      return novoCliente;
    } catch (err) {
      console.error('❌ Erro ao criar cliente:', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setLoading(false);
      throw errorObj;
    }
  };

  return { mutate, loading, error };
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