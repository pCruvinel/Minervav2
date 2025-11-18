import { useCallback, useMemo } from 'react';
import { useApi, useMutation } from './use-api';
import { ordensServicoAPI } from '../api-client';
import { toast } from '../utils/safe-toast';

/**
 * Hook para gerenciar ordens de serviço
 */
export function useOrdensServico(filters?: { status?: string; tipo?: string }) {
  const { data, loading, error, refetch } = useApi(
    () => ordensServicoAPI.list(filters),
    {
      onError: (error) => {
        console.error('❌ Erro ao carregar OS:', error);
        toast.error(`Erro ao carregar OS: ${error.message}`);
      },
      // Só re-executar quando os filtros mudarem
      deps: [filters?.status, filters?.tipo],
    }
  );

  // Transformar dados da API para formato local
  const ordensServico = useMemo(() => {
    if (!data) return [];

    return data.map((os: any) => ({
      id: os.id,
      codigo: os.codigo_os,
      titulo: os.descricao || `${os.tipo_os?.nome || 'Ordem de Serviço'}`,
      status: mapStatusToLocal(os.status_geral),
      cliente: {
        id: os.cliente?.id || '',
        nome: os.cliente?.nome_razao_social || 'Cliente não informado'
      },
      tipoOS: {
        id: os.tipo_os?.codigo?.replace('OS-', '') || '',
        nome: os.tipo_os?.nome || 'Tipo não informado',
        setor: mapSetorToLocal(os.tipo_os?.setor_padrao)
      },
      responsavel: os.responsavel ? {
        id: os.responsavel.id,
        nome: os.responsavel.nome_completo,
        avatar: getInitials(os.responsavel.nome_completo)
      } : {
        id: '',
        nome: 'Não atribuído',
        avatar: 'NA'
      },
      etapaAtual: os.etapa_atual ? {
        numero: os.etapa_atual.numero_etapa,
        titulo: os.etapa_atual.titulo,
        status: os.etapa_atual.status
      } : null,
      dataInicio: os.data_entrada ? new Date(os.data_entrada).toISOString().split('T')[0] : '',
      dataPrazo: os.data_prazo ? new Date(os.data_prazo).toISOString().split('T')[0] : '',
      criadoEm: new Date(os.data_entrada).toISOString().split('T')[0],
      // Dados originais da API
      _original: os
    }));
  }, [data]);

  return { ordensServico, loading, error, refetch, raw: data };
}

/**
 * Hook para buscar uma OS específica
 */
export function useOrdemServico(osId: string) {
  return useApi(() => ordensServicoAPI.getById(osId), {
    deps: [osId], // Só re-executar quando osId mudar
  });
}

/**
 * Hook para criar ordem de serviço
 */
export function useCreateOrdemServico() {
  return useMutation(ordensServicoAPI.create, {
    onSuccess: (data) => {
      toast.success(`OS ${data.codigo_os} criada com sucesso!`);
    },
    onError: (error) => {
      toast.error(`Erro ao criar OS: ${error.message}`);
    },
  });
}

/**
 * Hook para atualizar ordem de serviço
 */
export function useUpdateOrdemServico(osId: string) {
  return useMutation(
    (data: any) => ordensServicoAPI.update(osId, data),
    {
      onSuccess: () => {
        toast.success('OS atualizada com sucesso!');
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar OS: ${error.message}`);
      },
    }
  );
}

/**
 * Hook para gerenciar etapas de uma OS
 */
export function useEtapasOS(osId: string) {
  const { data, loading, error, refetch } = useApi(
    () => ordensServicoAPI.getEtapas(osId),
    {
      onError: (error) => {
        console.error('Erro ao carregar etapas:', error);
      },
      // Só re-executar quando osId mudar
      deps: [osId],
    }
  );

  return { etapas: data, loading, error, refetch };
}

/**
 * Hook para criar etapa
 */
export function useCreateEtapa(osId: string) {
  return useMutation(
    (data: any) => ordensServicoAPI.createEtapa(osId, data),
    {
      onSuccess: () => {
        toast.success('Etapa criada com sucesso!');
      },
      onError: (error) => {
        toast.error(`Erro ao criar etapa: ${error.message}`);
      },
    }
  );
}

/**
 * Hook para atualizar etapa
 */
export function useUpdateEtapa(etapaId: string) {
  return useMutation(
    (data: any) => ordensServicoAPI.updateEtapa(etapaId, data),
    {
      onSuccess: () => {
        toast.success('Etapa atualizada com sucesso!');
      },
      onError: (error) => {
        toast.error(`Erro ao atualizar etapa: ${error.message}`);
      },
    }
  );
}

// Funções auxiliares
function mapStatusToLocal(status: string): string {
  const statusMap: Record<string, string> = {
    // Novos valores (MAIÚSCULAS + SNAKE_CASE)
    'EM_TRIAGEM': 'em_triagem',
    'AGUARDANDO_INFORMACOES': 'aguardando_informacoes',
    'EM_ANDAMENTO': 'em_andamento',
    'EM_VALIDACAO': 'em_validacao',
    'ATRASADA': 'atrasada',
    'CONCLUIDA': 'concluida',
    'CANCELADA': 'cancelada',
    
    // Valores antigos para compatibilidade
    'Em Triagem': 'em_triagem',
    'Aguardando Informações': 'aguardando_informacoes',
    'Em Andamento': 'em_andamento',
    'Em Validação': 'em_validacao',
    'Atrasada': 'atrasada',
    'Concluída': 'concluida',
    'Concluida': 'concluida',
    'Cancelada': 'cancelada',
  };
  return statusMap[status] || 'em_andamento';
}

function mapSetorToLocal(setor: string | undefined): string {
  if (!setor) return 'obras';
  const setorMap: Record<string, string> = {
    'OBRAS': 'obras',
    'LABORATORIO': 'laboratorio',
    'ADM': 'adm',
    'COMERCIAL': 'comercial',
    'FINANCEIRO': 'financeiro',
  };
  return setorMap[setor] || 'obras';
}

function getInitials(nome: string): string {
  if (!nome) return 'NN';
  const parts = nome.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}