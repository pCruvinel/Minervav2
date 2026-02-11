/**
 * Hook para gerenciamento de Centros de Custo
 *
 * Naming convention: CC{NUMERO_TIPO_OS}{SEQUENCIAL_3_DIGITOS}-{APELIDO_OU_PRIMEIRO_NOME}
 * Exemplo: CC13001-SOLAR, CC09015-JOAO
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
  tipo_os_id?: string | null;
  setor_id?: string | null;
  is_sistema?: boolean;
}

/**
 * Normaliza texto para usar no nome do Centro de Custo
 * - Converte para UPPERCASE
 * - Remove acentos
 * - Substitui espaços por underscore
 * - Limita a 20 caracteres
 * 
 * @param texto - Texto a normalizar (apelido ou nome)
 * @returns Texto normalizado
 */
export function normalizarNomeCentroCusto(texto: string): string {
  if (!texto || texto.trim() === '') {
    return 'CLIENTE';
  }

  return texto
    .trim()
    .toUpperCase()
    // Remove acentos (NFD normalize + remove diacritics)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Substitui espaços e caracteres especiais por underscore
    .replace(/[^A-Z0-9]/g, '_')
    // Remove underscores duplicados
    .replace(/_+/g, '_')
    // Remove underscore no início/fim
    .replace(/^_|_$/g, '')
    // Limita a 20 caracteres
    .substring(0, 20);
}

export function useCentroCusto() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Lista todos os Centros de Custo ativos
   * Fixos primeiro (sem tipo_os_id), depois variáveis ordenados por nome
   */
  const listCentrosCusto = useCallback(async (): Promise<CentroCusto[]> => {
    try {
      setLoading(true);
      
      const { data, error: queryError } = await supabase
        .from('centros_custo')
        .select('id, nome, tipo_os_id, descricao, tipo, setor_id, is_sistema')
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (queryError) {
        throw queryError;
      }

      // Mapear dados (tipo agora vem do banco)
      const mappedData = (data || []).map(cc => ({
        ...cc,
        tipo: cc.tipo || (cc.tipo_os_id ? 'variavel' : 'fixo'),
        is_sistema: cc.is_sistema || false
      })) as CentroCusto[];

      // Ordenar: Fixos primeiro
      return mappedData.sort((a, b) => {
        if (a.tipo === 'fixo' && b.tipo !== 'fixo') return -1;
        if (a.tipo !== 'fixo' && b.tipo === 'fixo') return 1;
        return a.nome.localeCompare(b.nome);
      });
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
   * Formato do nome: CC{NUMERO_TIPO_OS}{SEQUENCIAL_3_DIGITOS}-{APELIDO_OU_PRIMEIRO_NOME}
   * Exemplo: CC13001-SOLAR_I, CC09015-JOAO
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

      // 2. Buscar apelido e nome do cliente
      const { data: cliente, error: clienteError } = await supabase
        .from('clientes')
        .select('apelido, nome_razao_social')
        .eq('id', clienteId)
        .single();

      if (clienteError) {
        logger.warn('⚠️ Erro ao buscar cliente, usando fallback:', clienteError);
      }

      // 3. Determinar texto para o nome do CC
      // Prioridade: apelido > primeiro nome/palavra de nome_razao_social
      let textoNome = 'CLIENTE';
      if (cliente) {
        if (cliente.apelido && cliente.apelido.trim() !== '') {
          textoNome = cliente.apelido;
        } else if (cliente.nome_razao_social) {
          // Pegar primeira palavra do nome
          textoNome = cliente.nome_razao_social.split(' ')[0];
        }
      }

      // 4. Normalizar o texto
      const textoNormalizado = normalizarNomeCentroCusto(textoNome);

      // 5. Extrair número do tipo (ex: "OS-13" -> "13")
      const numeroTipo = tipoOS.codigo.split('-')[1];

      // 6. Buscar/incrementar sequência
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

      // 7. Formatar nome: CC{TIPO}{SEQ:3}-{TEXTO_NORMALIZADO}
      // Exemplo: CC13001-SOLAR_I
      const ccNome = `CC${numeroTipo}${String(sequencial).padStart(3, '0')}-${textoNormalizado}`;

      // 8. Inserir CC com ID específico
      const { data: insertedCC, error: insertError } = await supabase
        .from('centros_custo')
        .insert({
          id: ccId, // Usar o mesmo ID da OS
          nome: ccNome,
          cliente_id: clienteId,
          tipo_os_id: tipoOsId,
          descricao: descricao || null,
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
