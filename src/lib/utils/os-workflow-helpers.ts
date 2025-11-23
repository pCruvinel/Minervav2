import { OS_TYPE_CODE_MAP } from '../../constants/os-workflow';

/**
 * Valida se uma string é um UUID válido
 * @param uuid - String a ser validada
 * @returns true se for um UUID válido, false caso contrário
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Mapeia nome amigável do tipo de OS para código do banco
 * @param nomeOS - Nome amigável da OS (ex: "OS 01: Perícia de Fachada")
 * @returns Código do banco (ex: "OS-01")
 */
export function mapearTipoOSParaCodigo(nomeOS: string): string {
  return OS_TYPE_CODE_MAP[nomeOS] || 'OS-01';
}

/**
 * Calcula valores de precificação baseado nos dados das etapas 7 e 8
 */
export interface ValoresPrecificacao {
  valorTotal: number;
  valorEntrada: number;
  valorParcela: number;
}

interface Subetapa {
  total?: string;
}

interface EtapaPrincipal {
  subetapas?: Subetapa[];
}

interface Etapa7Data {
  etapasPrincipais?: EtapaPrincipal[];
}

interface Etapa8Data {
  percentualImprevisto?: string;
  percentualLucro?: string;
  percentualImposto?: string;
  percentualEntrada?: string;
  numeroParcelas?: string;
}

/**
 * Calcula valores de precificação
 * @param etapa7Data - Dados do memorial/escopo
 * @param etapa8Data - Dados de precificação
 * @returns Valores calculados (total, entrada, parcela)
 */
export function calcularValoresPrecificacao(
  etapa7Data: Etapa7Data,
  etapa8Data: Etapa8Data
): ValoresPrecificacao {
  // Custo Base (soma dos totais das sub-etapas)
  const custoBase = etapa7Data?.etapasPrincipais?.reduce((total: number, etapa: EtapaPrincipal) => {
    return total + (etapa.subetapas?.reduce((subTotal: number, sub: Subetapa) => {
      const valor = parseFloat(sub.total?.replace('R$ ', '').replace('.', '').replace(',', '.') || '0') || 0;
      return subTotal + valor;
    }, 0) || 0);
  }, 0) || 0;

  // Percentuais
  const pImprevisto = parseFloat(etapa8Data?.percentualImprevisto?.replace(',', '.') || '0') / 100;
  const pLucro = parseFloat(etapa8Data?.percentualLucro?.replace(',', '.') || '0') / 100;
  const pImposto = parseFloat(etapa8Data?.percentualImposto?.replace(',', '.') || '0') / 100;

  // Valor Total
  const custoComImprevisto = custoBase * (1 + pImprevisto);
  const divisor = (1 - (pLucro + pImposto));
  const precoVenda = divisor > 0 ? custoComImprevisto / divisor : 0;

  // Entrada e Parcelas
  const pEntrada = parseFloat(etapa8Data?.percentualEntrada?.replace(',', '.') || '0') / 100;
  const vEntrada = precoVenda * pEntrada;
  const numParcelas = parseInt(etapa8Data?.numeroParcelas || '0');
  const vParcela = numParcelas > 0 ? (precoVenda - vEntrada) / numParcelas : 0;

  return {
    valorTotal: precoVenda,
    valorEntrada: vEntrada,
    valorParcela: vParcela,
  };
}
