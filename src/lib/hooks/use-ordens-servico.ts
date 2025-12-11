import { useMemo } from 'react';
import { useApi, useMutation } from './use-api';
import { ordensServicoAPI } from '../api-client';
import { toast } from '../utils/safe-toast';
import { supabase } from '@/lib/supabase-client';
import { normalizeStatusOS, normalizeSetorOS } from '../types';
import { logger } from '../utils/logger';

/**
 * Hook para gerenciar ordens de serviço
 */
export function useOrdensServico(filters?: { status?: string; tipo?: string }) {
  const { data, loading, error, refetch } = useApi(
    async () => {
      let query = supabase
        .from('ordens_servico')
        .select(`
          *,
          clientes (*),
          colaboradores:responsavel_id (*, setores:setor_id(slug)),
          tipos_os (*, setores:setor_padrao_id(*)),
          os_etapas (*, responsavel:responsavel_id(id, nome_completo, avatar_url, setores:setor_id(slug))),
          parent_os:parent_os_id (id, tipos_os (*, setores:setor_padrao_id(*)))
        `)
        .order('data_entrada', { ascending: false });

      if (filters?.status) {
        query = query.eq('status_geral', filters.status);
      }

      // Filtro por tipo (precisaria filtrar na relação, mas por enquanto vamos filtrar no client se necessário ou ajustar query)
      // Supabase suporta filtro em relação: !inner join

      const { data, error } = await query;
      
      logger.log('🔍 [useOrdensServico] Query result:', { 
        count: data?.length, 
        error, 
        filters 
      });

      if (error) throw error;
      return data;
    },
    {
      onError: (error) => {
        logger.error('❌ Erro ao carregar OS:', error);
        toast.error(`Erro ao carregar OS: ${error.message}`);
      },
      // Só re-executar quando os filtros mudarem
      deps: [filters?.status, filters?.tipo],
    }
  );

  // Transformar dados da API adicionando campos de joins para OrdemServico
  const ordensServico = useMemo(() => {
    if (!data) return [];

    return data.map((os: any) => ({
      // Campos diretos do banco
      ...os,
      // Campos adicionais de joins (para interface OrdemServico)
      cliente_nome: os.clientes?.nome_razao_social || 'Cliente não informado',
      tipo_os_nome: os.tipos_os?.nome || 'Tipo não informado',
      responsavel_nome: os.colaboradores?.nome_completo || 'Não atribuído',
      responsavel_avatar_url: os.colaboradores?.avatar_url || null,
      setor_nome: os.tipos_os?.setores?.nome || os.tipos_os?.setores?.slug || '-',
      // Campos legados para compatibilidade
      codigo: os.codigo_os, // Legado
      titulo: os.descricao || `${os.tipos_os?.nome || 'Ordem de Serviço'}`, // Legado
      status: normalizeStatusOS(os.status_geral), // Legado
      cliente: { // Legado
        id: os.clientes?.id || '',
        nome: os.clientes?.nome_razao_social || 'Cliente não informado'
      },
      tipoOS: { // Legado
        id: os.tipos_os?.codigo?.replace('OS-', '') || '',
        nome: os.tipos_os?.nome || 'Tipo não informado',
        setor: normalizeSetorOS(os.tipos_os?.setores?.slug)
      },
      responsavel: os.colaboradores ? { // Legado
        id: os.colaboradores.id,
        nome: os.colaboradores.nome_completo,
        avatar: getInitials(os.colaboradores.nome_completo)
      } : {
        id: '',
        nome: 'Não atribuído',
        avatar: 'NA'
      },
      etapaAtual: getEtapaAtual(os.os_etapas || []),
      dataInicio: os.data_entrada ? new Date(os.data_entrada).toISOString().split('T')[0] : '', // Legado
      dataPrazo: os.data_prazo ? new Date(os.data_prazo).toISOString().split('T')[0] : '', // Legado
      criadoEm: new Date(os.data_entrada).toISOString().split('T')[0], // Legado
    }));
  }, [data]);

  return { ordensServico, loading, error, refetch, raw: data };
}

/**
 * Hook para buscar uma OS específica
 */
export function useOrdemServico(osId: string | null) {
  const { data, loading, error, refetch } = useApi(
    () => osId ? ordensServicoAPI.getById(osId) : Promise.resolve(null),
    {
      deps: [osId],
    }
  );

  const os = useMemo(() => {
    if (!data) return null;
    
    const rawOS = data as any;
    
    return {
      ...rawOS,
      cliente_nome: rawOS.cliente?.nome_razao_social || 'Cliente não informado',
      tipo_os_nome: rawOS.tipo_os?.nome || 'Tipo não informado',
      tipo_os_codigo: rawOS.tipo_os?.codigo || null, // e.g., 'OS-01', 'OS-02', etc.
      responsavel_nome: rawOS.responsavel?.nome_completo || 'Não atribuído',
      setor_nome: rawOS.tipo_os?.setores?.nome || rawOS.tipo_os?.setores?.slug || '-',
      
      // Campos legados
      codigo: rawOS.codigo_os,
      titulo: rawOS.descricao || `${rawOS.tipo_os?.nome || 'Ordem de Serviço'}`,
      status: normalizeStatusOS(rawOS.status_geral),
      
      cliente: rawOS.cliente ? {
        ...rawOS.cliente,
        endereco: rawOS.cliente.endereco || {} // Garantir que endereco existe
      } : undefined,
      
      tipoOS: {
        id: rawOS.tipo_os?.codigo?.replace('OS-', '') || '',
        nome: rawOS.tipo_os?.nome || 'Tipo não informado',
        setor: normalizeSetorOS(rawOS.tipo_os?.setores?.slug)
      },
      
      responsavel: rawOS.responsavel ? {
        id: rawOS.responsavel.id,
        nome: rawOS.responsavel.nome_completo,
        avatar: getInitials(rawOS.responsavel.nome_completo)
      } : undefined,
      
      etapaAtual: rawOS.etapa_atual ? {
        numero: rawOS.etapa_atual.numero_etapa || 0,
        titulo: rawOS.etapa_atual.titulo || 'Etapa sem nome',
        status: rawOS.etapa_atual.status
      } : undefined,
      
      dataInicio: rawOS.data_entrada ? new Date(rawOS.data_entrada).toISOString().split('T')[0] : '',
      dataPrazo: rawOS.data_prazo ? new Date(rawOS.data_prazo).toISOString().split('T')[0] : '',
      criadoEm: rawOS.data_entrada ? new Date(rawOS.data_entrada).toISOString().split('T')[0] : '',
    };
  }, [data]);

  return { data: os, isLoading: loading, error, refetch };
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
        logger.error('Erro ao carregar etapas:', error);
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
function getEtapaAtual(etapas: any[]): { numero: number; titulo: string; status: string } | null {
  if (!etapas || etapas.length === 0) return null;

  // Ordenar por ordem crescente
  const etapasOrdenadas = [...etapas].sort((a, b) => (a.ordem || 0) - (b.ordem || 0));

  // Prioridade 1: Etapa em andamento
  const emAndamento = etapasOrdenadas.find(e => e.status === 'em_andamento');
  if (emAndamento) {
    return {
      numero: emAndamento.ordem || 0,
      titulo: emAndamento.nome_etapa || 'Etapa sem nome',
      status: emAndamento.status
    };
  }

  // Prioridade 2: Primeira etapa pendente
  const pendente = etapasOrdenadas.find(e => e.status === 'pendente');
  if (pendente) {
    return {
      numero: pendente.ordem || 0,
      titulo: pendente.nome_etapa || 'Etapa sem nome',
      status: pendente.status
    };
  }

  // Prioridade 3: Última etapa concluída
  const concluidas = etapasOrdenadas.filter(e => e.status === 'concluida');
  if (concluidas.length > 0) {
    const ultima = concluidas[concluidas.length - 1];
    return {
      numero: ultima.ordem || 0,
      titulo: ultima.nome_etapa || 'Etapa sem nome',
      status: ultima.status
    };
  }

  // Fallback: Primeira etapa
  const primeira = etapasOrdenadas[0];
  return {
    numero: primeira.ordem || 0,
    titulo: primeira.nome_etapa || 'Etapa sem nome',
    status: primeira.status
  };
}

function getInitials(nome: string): string {
  if (!nome) return 'NN';
  const parts = nome.trim().split(' ');
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}