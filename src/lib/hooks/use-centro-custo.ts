/**
 * Hook para gerenciamento de Centros de Custo
 *
 * Integrado com função PL/pgSQL `gerar_centro_custo` para geração automática
 * com naming convention CC{NUMERO_TIPO_OS}{SEQUENCIAL}
 *
 * @example
 * ```tsx
 * const { createCentroCustoWithId, listCentrosCusto } = useCentroCusto();
 *
 * // Criar CC com mesmo ID da OS
 * const cc = await createCentroCustoWithId(
 *   osId,           // ID a usar para o CC (mesmo da OS)
 *   tipoOsId,
 *   clienteId,
 *   'Descrição'
 * );
 * ```
 */

import { supabase } from '@/lib/supabase-client';
import { useState, useCallback } from 'react';
import { logger } from '@/lib/utils/logger';

export interface CentroCusto {
  id: string;
  nome: string;
  tipo?: 'fixo' | 'variavel';
  descricao?: string;
}

export function useCentroCusto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Lista todos os Centros de Custo ativos
   * Fixos primeiro, depois variáveis ordenados por nome
   */
  const listCentrosCusto = useCallback(async (): Promise<CentroCusto[]> => {
    try {
      setLoading(true);
      
      const { data, error: queryError } = await supabase
        .from('centros_custo')
        .select('id, nome, tipo, descricao')
        .eq('ativo', true)
        .order('tipo', { ascending: false }) // fixos primeiro
        .order('nome', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      return data || [];
    } catch (err) {
      logger.error('❌ Erro ao listar Centros de Custo:', err);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Cria Centro de Custo com ID específico (mesmo ID da OS)
   * 
   * @param ccId - ID a usar para o CC (geralmente o mesmo ID da OS)
   * @param tipoOsId - ID do tipo de OS
   * @param clienteId - ID do cliente
   * @param descricao - Descrição do Centro de Custo
   * @returns Objeto com id e nome do CC criado
   */
  const createCentroCustoWithId = useCallback(async (
    ccId: string,
    tipoOsId: string,
    clienteId: string,
    descricao?: string
  ): Promise<CentroCusto> => {
    try {
      setLoading(true);
      setError(null);

      logger.log('🏗️ Criando Centro de Custo com ID específico...', { ccId, tipoOsId, clienteId });

      // 1. Buscar código do tipo de OS para gerar nome do CC
      const { data: tipoOS, error: tipoError } = await supabase
        .from('tipos_os')
        .select('codigo')
        .eq('id', tipoOsId)
        .single();

      if (tipoError || !tipoOS) {
        throw new Error(`Tipo de OS não encontrado: ${tipoOsId}`);
      }

      // 2. Extrair número do tipo (ex: "OS-13" -> "13")
      const numeroTipo = tipoOS.codigo.split('-')[1];

      // 3. Buscar/incrementar sequência
      const { data: seqData, error: seqError } = await supabase.rpc('incrementar_sequencia_cc', {
        p_tipo_os_id: tipoOsId
      });

      let sequencial = 1;
      if (!seqError && seqData) {
        sequencial = seqData;
      } else {
        // Fallback: contar CCs existentes deste tipo
        const { count } = await supabase
          .from('centros_custo')
          .select('*', { count: 'exact', head: true })
          .eq('tipo_os_id', tipoOsId);
        sequencial = (count || 0) + 1;
      }

      // 4. Formatar nome: CC + numero_tipo + sequencial (5 dígitos)
      const ccNome = `CC${numeroTipo}${String(sequencial).padStart(5, '0')}`;

      // 5. Inserir CC com ID específico
      const { data: insertedCC, error: insertError } = await supabase
        .from('centros_custo')
        .insert({
          id: ccId, // Usar o mesmo ID da OS
          nome: ccNome,
          cliente_id: clienteId,
          tipo_os_id: tipoOsId,
          descricao: descricao || null,
          tipo: 'variavel',
          ativo: true,
          valor_global: 0
        })
        .select('id, nome')
        .single();

      if (insertError) {
        throw new Error(`Erro ao criar Centro de Custo: ${insertError.message}`);
      }

      const centroCusto: CentroCusto = {
        id: insertedCC.id,
        nome: insertedCC.nome,
        tipo: 'variavel'
      };

      logger.log('✅ Centro de Custo criado com sucesso:', centroCusto);

      return centroCusto;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error('❌ Falha ao criar Centro de Custo:', errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Gera um novo Centro de Custo automaticamente (com ID gerado pelo banco)
   * @deprecated Use createCentroCustoWithId para manter CC ID = OS ID
   */
  const generateCentroCusto = useCallback(async (
    tipoOsId: string,
    clienteId: string,
    descricao?: string
  ): Promise<CentroCusto> => {
    try {
      setLoading(true);
      setError(null);

      logger.log('🏗️ Gerando Centro de Custo (método legado)...', { tipoOsId, clienteId, descricao });

      const { data, error: rpcError } = await supabase.rpc('gerar_centro_custo', {
        p_tipo_os_id: tipoOsId,
        p_cliente_id: clienteId,
        p_descricao: descricao || null
      });

      if (rpcError) {
        logger.error('❌ Erro ao gerar Centro de Custo:', rpcError);
        throw rpcError;
      }

      if (!data || data.length === 0) {
        throw new Error('Nenhum Centro de Custo foi gerado');
      }

      const centroCusto: CentroCusto = {
        id: data[0].cc_id,
        nome: data[0].cc_nome,
        tipo: 'variavel'
      };

      logger.log('✅ Centro de Custo gerado com sucesso:', centroCusto);

      return centroCusto;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error('❌ Falha ao gerar Centro de Custo:', errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    createCentroCustoWithId,
    generateCentroCusto,
    listCentrosCusto,
    loading,
    error
  };
}
