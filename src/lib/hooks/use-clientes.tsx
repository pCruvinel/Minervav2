/**
 * Hook para gerenciamento de clientes
 * Integrado com backend Supabase via clientesAPI
 */

import { useState, useEffect } from 'react';
import { clientesAPI } from '../api-client';
import { logger } from '../utils/logger';

export type UseClientesFilters = {
  status?: string | string[];
};

export function useClientes(filters?: UseClientesFilters | string) {
  const [clientes, setClientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const refetch = async () => {
    try {
      setLoading(true);
      setError(null);

      // Normalizar filtros
      let statusFilter: string | undefined;
      let statusList: string[] | undefined;

      if (typeof filters === 'string') {
        statusFilter = filters;
      } else if (filters?.status) {
        if (Array.isArray(filters.status)) {
          statusList = filters.status;
          // Se for array, não mandamos status para a API para buscar todos e filtrar no client
          // A MENOS que a API suporte array (assumindo que não por enquanto)
          statusFilter = undefined;
        } else {
          statusFilter = filters.status;
        }
      }

      logger.log('🔄 Carregando clientes do backend...',
        statusFilter ? `filtro API: ${statusFilter}` : 'sem filtro API (trazer todos)'
      );

      // Chamar API real do backend
      // Se statusFilter for undefined, busca todos
      const dados = await clientesAPI.list(statusFilter === 'LEAD' ? 'LEAD' : statusFilter);

      let dadosFiltrados = dados || [];

      // Filtragem Client-Side se necessário (ex: statusList = ['lead', 'ativo'])
      if (statusList && statusList.length > 0) {
        dadosFiltrados = dadosFiltrados.filter(c =>
          statusList?.includes(c.status?.toLowerCase()) ||
          statusList?.includes(c.status?.toUpperCase())
        );
      }

      logger.log(`✅ Clientes carregados: ${dadosFiltrados.length} (Total API: ${dados?.length})`);
      setClientes(dadosFiltrados);
    } catch (err) {
      logger.error('❌ Erro ao carregar clientes:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setClientes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { clientes, loading, error, refetch };
}

export function useCreateCliente() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (clienteData: any) => {
    try {
      setLoading(true);
      setError(null);

      logger.log('📝 Criando cliente no backend...', clienteData);

      // Chamar API real do backend (que retorna UUID válido do Supabase)
      const novoCliente = await clientesAPI.create(clienteData);

      logger.log('✅ Cliente criado com UUID válido:', novoCliente.id);
      setLoading(false);

      return novoCliente;
    } catch (err) {
      logger.error('❌ Erro ao criar cliente:', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      setLoading(false);
      throw errorObj;
    }
  };

  return { mutate, loading, error };
}

export function useUpdateCliente() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const mutate = async (clienteId: string, data: Partial<any>) => {
    try {
      setLoading(true);
      setError(null);

      logger.log('📝 Atualizando cliente no backend...', clienteId, data);

      // Chamar API real do backend
      const updated = await clientesAPI.update(clienteId, data);

      logger.log('✅ Cliente atualizado com sucesso:', updated);
      return updated;
    } catch (err) {
      logger.error('❌ Erro ao atualizar cliente:', err);
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return { mutate, loading, error };
}

export function transformFormToCliente(formData: any) {
  const nomeRazao = formData.nomeCompleto || formData.razaoSocial || formData.nome || '';

  // Estrutura JSONB para o campo endereco
  const enderecoJson = {
    cep: formData.cep || '',
    logradouro: formData.endereco || '',
    numero: formData.numero || '',
    complemento: formData.complemento || '',
    bairro: formData.bairro || '',
    cidade: formData.cidade || '',
    estado: formData.estado || '',
    // Adicionando campos extras que podem ser úteis
    cargo_responsavel: formData.cargoResponsavel || '',
    tipo_edificacao: formData.tipoEdificacao || '',
    qtd_unidades: formData.qtdUnidades || '',
    qtd_blocos: formData.qtdBlocos || '',
    qtd_pavimentos: formData.qtdPavimentos || '',
    tipo_telhado: formData.tipoTelhado || '',
    possui_elevador: formData.possuiElevador || false,
    possui_piscina: formData.possuiPiscina || false
  };

  return {
    nome_razao_social: nomeRazao,
    // nome: nomeRazao, // REMOVIDO: Coluna não existe no banco
    email: formData.email || '',
    telefone: formData.telefone || '',
    cpf_cnpj: formData.cpf || formData.cnpj || formData.cpfCnpj || '',
    status: 'lead', // CORRIGIDO: De 'tipo': 'LEAD' para 'status': 'lead'
    nome_responsavel: formData.nomeResponsavel || '', // Nome do responsável pelo cliente
    tipo_cliente: formData.tipo === 'fisica' ? 'PESSOA_FISICA' : 'PESSOA_JURIDICA',
    endereco: enderecoJson,
    observacoes: formData.observacoes || '',
    responsavel_id: formData.responsavel_id // Opcional, se houver
  };
}