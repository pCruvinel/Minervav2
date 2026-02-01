/**
 * Tipos e constantes para Visita Técnica / Parecer Técnico
 * Compartilhado entre OS-08 e OS-11
 * 
 * Este arquivo centraliza as definições de tipos, constantes e funções
 * utilitárias para os workflows de visita técnica.
 */

// =====================================================
// FINALIDADE DA INSPEÇÃO
// =====================================================

/**
 * Tipos de finalidade de inspeção disponíveis
 */
export type FinalidadeInspecao =
  | 'recebimento_unidade'
  | 'escopo_tecnico'
  | 'parecer_tecnico'
  | 'laudo_spci'
  | 'laudo_spda';

/**
 * Opções do select de finalidade de inspeção
 */
export const FINALIDADE_OPTIONS: Array<{
  value: FinalidadeInspecao;
  label: string;
  descricao: string;
}> = [
  {
    value: 'recebimento_unidade',
    label: 'Recebimento de Unidade Autônoma',
    descricao: 'Inspeção para recebimento e entrega de unidades autônomas',
  },
  {
    value: 'escopo_tecnico',
    label: 'Escopo de Serviço',
    descricao: 'Levantamento técnico para elaboração de escopo de serviço',
  },
  {
    value: 'parecer_tecnico',
    label: 'Parecer Técnico de Vistoria',
    descricao: 'Parecer técnico sobre a situação encontrada na vistoria',
  },
  {
    value: 'laudo_spci',
    label: 'Laudo Técnico de SPCI',
    descricao: 'Laudo do Sistema de Proteção e Combate a Incêndio',
  },
  {
    value: 'laudo_spda',
    label: 'Laudo Técnico de SPDA',
    descricao: 'Laudo do Sistema de Proteção Contra Descargas Atmosféricas',
  },
];

// =====================================================
// ÁREAS VISTORIADAS
// =====================================================

/**
 * Áreas disponíveis para vistoria técnica
 */
export const AREAS_VISTORIA = [
  'ABASTECIMENTO DE ÁGUA (tubulações, conexões, hidrômetro, reservatórios, bombas, registros e afins) – exceto SPCI',
  'SPCI (Qualquer item relacionado ao sistema de proteção e combate ao incêndio)',
  'TELEFONE, INTERFONE, ANTENA (cabos, quadros e afins)',
  'ESGOTAMENTO E DRENAGEM (tubulações, conexões, caixas coletoras, galerias, sarjetas, grelhas e afins)',
  'ARQUITETURA (Fachadas, muros, área verde e afins)',
  'ELÉTRICA (Quadros, disjuntores, tomadas, interruptores, centrais de medição e afins)',
  'SPDA (captores, malhas, sinalização, cabos e afins)',
  'ESTRUTURAL (Fundações, lajes, vigas, pilares e afins)',
  'COBERTURA (Telhado, laje, calhas, rufos, platibanda e afins)',
] as const;

export type AreaVistoriada = typeof AREAS_VISTORIA[number];

/**
 * Extrai o nome curto da área vistoriada (primeira palavra)
 * Ex: "ABASTECIMENTO DE ÁGUA (...)" → "ABASTECIMENTO DE ÁGUA"
 */
export function getAreaShortName(area: string): string {
  const match = area.match(/^([^(]+)/);
  return match ? match[1].trim() : area;
}

// =====================================================
// GERAÇÃO DE TÍTULO DO DOCUMENTO
// =====================================================

/**
 * Gera o título do documento baseado na finalidade e área vistoriada
 * 
 * @param finalidade - Tipo de finalidade da inspeção
 * @param areaVistoriada - Área que foi vistoriada
 * @returns Título formatado para o documento
 * 
 * @example
 * gerarTituloDocumento('parecer_tecnico', 'ELÉTRICA (...)') 
 * // → "PARECER TÉCNICO DE VISTORIA DE ELÉTRICA"
 */
export function gerarTituloDocumento(
  finalidade: FinalidadeInspecao,
  areaVistoriada?: string
): string {
  const areaFormatada = areaVistoriada 
    ? getAreaShortName(areaVistoriada).toUpperCase() 
    : 'ÁREA NÃO ESPECIFICADA';

  switch (finalidade) {
    case 'recebimento_unidade':
      return 'RELATÓRIO DE INSPEÇÃO DE RECEBIMENTO DE UNIDADE AUTÔNOMA';
    
    case 'escopo_tecnico':
      return `ESCOPO DE SERVIÇO PARA ${areaFormatada}`;
    
    case 'parecer_tecnico':
      return `PARECER TÉCNICO DE VISTORIA DE ${areaFormatada}`;
    
    case 'laudo_spci':
      return 'LAUDO TÉCNICO DE SPCI – SISTEMA DE PROTEÇÃO E COMBATE A INCÊNDIO';
    
    case 'laudo_spda':
      return 'LAUDO TÉCNICO DE SPDA – SISTEMA DE PROTEÇÃO CONTRA DESCARGAS ATMOSFÉRICAS';
    
    default:
      return 'DOCUMENTO TÉCNICO';
  }
}

// =====================================================
// MAPEAMENTO FINALIDADE → ÁREA PADRÃO
// =====================================================

/**
 * Mapeia finalidades específicas para suas áreas correspondentes
 * Usado para auto-preencher o campo área quando SPCI ou SPDA é selecionado
 */
export const FINALIDADE_AREA_MAP: Partial<Record<FinalidadeInspecao, string>> = {
  laudo_spci: AREAS_VISTORIA[1], // SPCI
  laudo_spda: AREAS_VISTORIA[6], // SPDA
};

/**
 * Verifica se a finalidade requer formulário de checklist de recebimento
 */
export function isFinalidadeRecebimento(finalidade: FinalidadeInspecao): boolean {
  return finalidade === 'recebimento_unidade';
}

/**
 * Verifica se a finalidade deve auto-preencher a área
 */
export function deveAutoPreencherArea(finalidade: FinalidadeInspecao): boolean {
  return finalidade === 'laudo_spci' || finalidade === 'laudo_spda';
}

// =====================================================
// INTERFACES DE DADOS DAS ETAPAS
// =====================================================

/**
 * Dados da Etapa 2: Detalhes da Solicitação
 */
export interface Etapa2Data {
  finalidadeInspecao: FinalidadeInspecao | '';
  tipoArea: 'unidade_autonoma' | 'area_comum' | '';
  unidadesVistoriar: string;
  contatoUnidades: string;
  tipoDocumento: string;
  areaVistoriada: string;
  detalhesSolicitacao: string;
  tempoSituacao: string;
  primeiraVisita: string;
  arquivos?: Array<{ file: File; comment?: string }>;
}

/**
 * Valores iniciais para Etapa 2
 */
export const ETAPA2_INITIAL_DATA: Etapa2Data = {
  finalidadeInspecao: '',
  tipoArea: '',
  unidadesVistoriar: '',
  contatoUnidades: '',
  tipoDocumento: '',
  areaVistoriada: '',
  detalhesSolicitacao: '',
  tempoSituacao: '',
  primeiraVisita: '',
  arquivos: [],
};
