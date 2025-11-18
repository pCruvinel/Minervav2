import { useState } from 'react';
import { ordensServicoAPI } from '../api-client';

export interface Etapa {
  id: string;
  os_id: string;
  ordem: number;
  nome_etapa: string;
  status: 'PENDENTE' | 'EM_ANDAMENTO' | 'AGUARDANDO_APROVACAO' | 'APROVADA' | 'REJEITADA';
  dados_etapa: any;
  responsavel_id?: string;
  aprovador_id?: string;
  data_inicio?: string;
  data_conclusao?: string;
  observacoes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateEtapaData {
  ordem: number;
  nome_etapa: string;
  status?: 'PENDENTE' | 'EM_ANDAMENTO' | 'APROVADA';
  dados_etapa?: any;
  responsavel_id?: string;
  aprovador_id?: string;
}

export interface UpdateEtapaData {
  nome_etapa?: string;
  status?: 'PENDENTE' | 'EM_ANDAMENTO' | 'AGUARDANDO_APROVACAO' | 'APROVADA' | 'REJEITADA';
  dados_etapa?: any;
  responsavel_id?: string;
  aprovador_id?: string;
  data_inicio?: string;
  data_conclusao?: string;
  observacoes?: string;
}

/**
 * Hook para gerenciar etapas de Ordens de Serviço
 * 
 * Funcionalidades:
 * - Buscar todas as etapas de uma OS
 * - Criar nova etapa
 * - Atualizar etapa existente
 * - Salvar dados de formulário (atalho para update)
 * 
 * @example
 * ```tsx
 * const { etapas, isLoading, fetchEtapas, updateEtapa } = useEtapas();
 * 
 * useEffect(() => {
 *   fetchEtapas(osId);
 * }, [osId]);
 * 
 * const handleSave = async () => {
 *   await updateEtapa(etapaId, { 
 *     dados_formulario: formData,
 *     status: 'concluida'
 *   });
 * };
 * ```
 */
export function useEtapas() {
  const [etapas, setEtapas] = useState<OsEtapa[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Buscar todas as etapas de uma OS
   * 
   * @param osId - ID da Ordem de Serviço
   */
  const fetchEtapas = async (osId: string): Promise<void> => {
    // Validar osId antes de fazer requisição
    if (!osId || osId.trim() === '' || osId === 'undefined' || osId === 'null') {
      console.warn('⚠️ fetchEtapas: osId inválido:', osId);
      setEtapas([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log(`📋 Buscando etapas da OS ${osId}...`);
      
      const data = await ordensServicoAPI.getEtapas(osId);
      
      console.log(`✅ ${data.length} etapas carregadas:`, data);
      setEtapas(data);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao buscar etapas';
      console.error('❌ Erro ao buscar etapas:', err);
      setError(errorMsg);
      setEtapas(null);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Criar nova etapa
   * 
   * @param osId - ID da Ordem de Serviço
   * @param data - Dados da etapa
   * @returns Etapa criada
   */
  const createEtapa = async (osId: string, data: CreateEtapaData): Promise<OsEtapa> => {
    // Validar osId
    if (!osId || osId.trim() === '' || osId === 'undefined' || osId === 'null') {
      const errorMsg = `createEtapa: osId inválido: ${osId}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log(`➕ Criando etapa ${data.ordem} - ${data.nome_etapa} na OS ${osId}...`);
      
      const newEtapa = await ordensServicoAPI.createEtapa(osId, {
        ...data,
        status: data.status || 'Pendente',
      });
      
      console.log('✅ Etapa criada:', newEtapa);
      
      // Atualizar lista local
      setEtapas((prev) => prev ? [...prev, newEtapa] : [newEtapa]);
      
      return newEtapa;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao criar etapa';
      console.error('❌ Erro ao criar etapa:', err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Atualizar etapa existente
   * 
   * @param etapaId - ID da etapa
   * @param data - Dados a atualizar
   * @returns Etapa atualizada
   */
  const updateEtapa = async (etapaId: string, data: UpdateEtapaData): Promise<OsEtapa> => {
    // Validar etapaId
    if (!etapaId || etapaId.trim() === '' || etapaId === 'undefined' || etapaId === 'null') {
      const errorMsg = `updateEtapa: etapaId inválido: ${etapaId}`;
      console.error('❌', errorMsg);
      throw new Error(errorMsg);
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log(`💾 Atualizando etapa ${etapaId}...`, data);
      
      const updatedEtapa = await ordensServicoAPI.updateEtapa(etapaId, data);
      
      console.log('✅ Etapa atualizada:', updatedEtapa);
      
      // Atualizar lista local
      setEtapas((prev) =>
        prev
          ? prev.map((e) => (e.id === etapaId ? updatedEtapa : e))
          : [updatedEtapa]
      );
      
      return updatedEtapa;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erro ao atualizar etapa';
      console.error('❌ Erro ao atualizar etapa:', err);
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Salvar dados de formulário em uma etapa
   * (Atalho para updateEtapa com apenas dados_etapa)
   * 
   * @param etapaId - ID da etapa
   * @param formData - Dados do formulário
   * @param markAsComplete - Se true, marca etapa como concluída
   */
  const saveFormData = async (
    etapaId: string,
    formData: any,
    markAsComplete: boolean = false
  ): Promise<void> => {
    const updateData: UpdateEtapaData = {
      dados_etapa: formData,
    };

    if (markAsComplete) {
      updateData.status = 'Concluída'; // COM acento
      updateData.data_conclusao = new Date().toISOString();
    } else {
      updateData.status = 'Em Andamento';
      if (!etapas?.find(e => e.id === etapaId)?.data_inicio) {
        updateData.data_inicio = new Date().toISOString();
      }
    }

    await updateEtapa(etapaId, updateData);
  };

  /**
   * Buscar uma etapa específica por ordem
   * 
   * @param ordem - Número da etapa (1, 2, 3...)
   * @returns Etapa encontrada ou null
   */
  const getEtapaByOrdem = (ordem: number): OsEtapa | null => {
    return etapas?.find((e) => e.ordem === ordem) || null;
  };

  /**
   * Verificar se uma etapa existe
   * 
   * @param ordem - Número da etapa
   * @returns true se existe, false caso contrário
   */
  const hasEtapa = (ordem: number): boolean => {
    return !!getEtapaByOrdem(ordem);
  };

  /**
   * Buscar dados salvos de uma etapa específica
   * 
   * @param ordem - Número da etapa (1, 2, 3...)
   * @returns Dados da etapa ou null
   */
  const getEtapaData = (ordem: number): any | null => {
    const etapa = getEtapaByOrdem(ordem);
    return etapa?.dados_etapa || null;
  };

  /**
   * Limpar cache local de etapas
   */
  const clearEtapas = (): void => {
    setEtapas(null);
    setError(null);
  };

  return {
    // Estado
    etapas,
    isLoading,
    error,

    // Ações
    fetchEtapas,
    createEtapa,
    updateEtapa,
    saveFormData,

    // Utilitários
    getEtapaByOrdem,
    hasEtapa,
    getEtapaData,
    clearEtapas,
  };
}