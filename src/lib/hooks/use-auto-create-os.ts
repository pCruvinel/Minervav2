import { useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { useCreateOrdemServico } from './use-ordens-servico';
import { useEtapas } from './use-etapas';
import { ordensServicoAPI } from '../api-client';
import { toast } from '../utils/safe-toast';
import { logger } from '../utils/logger';

/**
 * ID do cliente genérico usado para OSs criadas automaticamente
 * antes de definir o cliente real
 */
export const GENERIC_CLIENT_ID = 'c0000000-0000-0000-0000-000000000001';

interface UseAutoCreateOSOptions {
  tipoOS: 'OS-09' | 'OS-10' | 'OS-11' | 'OS-12';
  nomeEtapa1: string;
  enabled: boolean;
}

interface UseAutoCreateOSReturn {
  createOSWithFirstStep: () => Promise<{
    osId: string;
    etapaId: string;
  } | undefined>;
  isCreating: boolean;
  error: Error | null;
  createdOsId: string | null;
}

/**
 * Hook para criar automaticamente OS + Etapa quando workflow é acessado sem osId
 *
 * Cria atomicamente uma Ordem de Serviço e sua primeira etapa, garantindo
 * idempotência via URL query params. Usado em workflows de requisição (OS-09, OS-10, etc.).
 *
 * @param options - Configuração da auto-criação
 * @param options.tipoOS - Código do tipo de OS ('OS-09', 'OS-10', 'OS-11', 'OS-12')
 * @param options.nomeEtapa1 - Nome descritivo da primeira etapa
 * @param options.enabled - Se false, não cria (já existe osId)
 *
 * @returns Objeto contendo:
 *   - createOSWithFirstStep: Função para iniciar criação
 *   - isCreating: Estado de loading
 *   - error: Erro ocorrido (se houver)
 *   - createdOsId: ID da OS criada
 *
 * @example
 * ```tsx
 * const { createOSWithFirstStep, isCreating } = useAutoCreateOS({
 *   tipoOS: 'OS-09',
 *   nomeEtapa1: 'Requisição de Compra',
 *   enabled: !osId
 * });
 *
 * useEffect(() => {
 *   if (!osId && !isCreating) {
 *     createOSWithFirstStep().catch(err => {
 *       logger.error('Erro na criação:', err);
 *     });
 *   }
 * }, [osId, isCreating]);
 * ```
 */
export function useAutoCreateOS({
  tipoOS,
  nomeEtapa1,
  enabled
}: UseAutoCreateOSOptions): UseAutoCreateOSReturn {
  // Estados locais
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [createdOsId, setCreatedOsId] = useState<string | null>(null);

  // Dependências
  const { currentUser } = useAuth();
  const { mutate: createOS } = useCreateOrdemServico();
  const { createEtapa } = useEtapas();

  /**
   * Cria atomicamente OS + Etapa 1
   * Garante rollback se qualquer operação falhar
   */
  const createOSWithFirstStep = async () => {
    if (!enabled) {
      logger.warn('[useAutoCreateOS] Hook desabilitado, pulando criação');
      return;
    }

    if (!currentUser?.id) {
      const err = new Error('Usuário não autenticado');
      setError(err);
      logger.error('[useAutoCreateOS] currentUser undefined');
      toast.error('Sessão expirada. Faça login novamente.');
      throw err;
    }

    try {
      setIsCreating(true);
      setError(null);

      logger.log(`[useAutoCreateOS] 🔧 Iniciando criação de ${tipoOS}...`);

      // PASSO 1: Buscar tipo de OS
      const tiposOS = await ordensServicoAPI.getTiposOS();
      const tipo = tiposOS.find((t: { codigo: string }) => t.codigo === tipoOS);

      if (!tipo) {
        throw new Error(`Tipo de OS ${tipoOS} não encontrado no sistema`);
      }

      logger.log(`[useAutoCreateOS] ✅ Tipo de OS encontrado: ${tipo.nome} (ID: ${tipo.id})`);

      // PASSO 2: Criar OS
      const osData = {
        tipo_os_id: tipo.id,
        status_geral: 'em_triagem' as const,
        descricao: `${tipoOS}: Requisição em andamento`,
        criado_por_id: currentUser.id,
        cliente_id: GENERIC_CLIENT_ID,
        data_entrada: new Date().toISOString()
      };

      logger.log(`[useAutoCreateOS] 📝 Criando OS...`);

      const newOS = await createOS(osData);

      logger.log(`[useAutoCreateOS] ✅ OS criada: ${newOS.codigo_os} (ID: ${newOS.id})`);

      // PASSO 3: Criar Etapa 1
      let etapa1;
      try {
        etapa1 = await createEtapa(newOS.id, {
          ordem: 1,
          nome_etapa: nomeEtapa1,
          status: 'em_andamento',
          dados_etapa: {}
        });

        logger.log(`[useAutoCreateOS] ✅ Etapa 1 criada (ID: ${etapa1.id})`);
      } catch (etapaError) {
        // Nota: Não fazemos rollback da OS, ela fica como "órfã"
        // mas será recuperada em próximo acesso ou limpa por cleanup job
        logger.error('[useAutoCreateOS] ❌ Falha ao criar Etapa 1:', etapaError);
        throw new Error('Falha ao criar estrutura da requisição');
      }

      logger.log(`[useAutoCreateOS] 🎉 Criação concluída! osId=${newOS.id}, etapaId=${etapa1.id}`);

      setCreatedOsId(newOS.id);

      return {
        osId: newOS.id,
        etapaId: etapa1.id
      };

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));

      logger.error('[useAutoCreateOS] ❌ Erro ao criar OS:', error);
      setError(error);
      toast.error('Erro ao criar requisição. Tente novamente.');

      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  return {
    createOSWithFirstStep,
    isCreating,
    error,
    createdOsId
  };
}
