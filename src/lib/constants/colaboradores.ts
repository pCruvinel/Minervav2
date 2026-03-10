// Constantes para o módulo de Colaboradores

/**
 * Fator de encargos CLT (INSS patronal + FGTS ≈ 46%)
 * Usado para calcular o custo real diário de um colaborador CLT:
 * custo_dia = (salario_base × FATOR_ENCARGOS_CLT) / dias_uteis_mes
 */
export const FATOR_ENCARGOS_CLT = 1.46;

export const FUNCOES = [
  { value: 'admin', label: '1 - Admin do Sistema', setor: 'ti', nivel: 10 },
  { value: 'diretor', label: '2 - Diretor', setor: 'diretoria', nivel: 9 },
  { value: 'coord_administrativo', label: '3 - Coordenador Administrativo', setor: 'administrativo', nivel: 6 },
  { value: 'coord_assessoria', label: '4 - Coordenador de Assessoria', setor: 'assessoria', nivel: 5 },
  { value: 'coord_obras', label: '5 - Coordenador de Obras', setor: 'obras', nivel: 5 },
  { value: 'operacional_admin', label: '6 - Operacional Administrativo', setor: 'administrativo', nivel: 3 },
  { value: 'operacional_comercial', label: '7 - Operacional Comercial', setor: 'administrativo', nivel: 3 },
  { value: 'operacional_assessoria', label: '8 - Operacional Assessoria', setor: 'assessoria', nivel: 2 },
  { value: 'operacional_obras', label: '9 - Operacional Obras', setor: 'obras', nivel: 2 },
  { value: 'colaborador_obra', label: '10 - Colaborador Obra', setor: 'obras', nivel: 0 },
];


export const QUALIFICACOES_OBRA = [
  { value: 'ENCARREGADO', label: 'Encarregado' },
  { value: 'OFICIAL', label: 'Oficial' },
  { value: 'MEIO_OFICIAL', label: 'Meio Oficial' },
  { value: 'SERVENTE', label: 'Servente' },
  { value: 'OUTROS', label: 'Outros' },
];

export const TIPOS_CONTRATACAO = [
  { value: 'CONTRATO', label: 'Contrato / Empreita / Estágio' },
  { value: 'CLT', label: 'CLT' },
  { value: 'PROLABORE', label: 'Pró-labore' },
];

export const DIAS_SEMANA = ['SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB', 'DOM'];

export const DOCUMENTOS_OBRIGATORIOS = [
  { value: 'DOCUMENTO_FOTO', label: 'Documento com Foto' },
  { value: 'CONTRATO_TRABALHO', label: 'Contrato de Trabalho' },
  { value: 'CHECKLIST_ADMISSIONAL', label: 'Checklist Admissional' },
  { value: 'TERMO_SIGILO', label: 'Termo de Sigilo' },
  { value: 'TERMO_INTEGRACAO', label: 'Termo de Integracao' },
  { value: 'COMPROVANTE_ESCOLARIDADE', label: 'Comprovante de Escolaridade' },
  { value: 'CONTRATO_CONFIDENCIALIDADE', label: 'Contrato de Confidencialidade' },
] as const;

export const BANCOS = [
  { value: '001', label: '001 - Banco do Brasil' },
  { value: '033', label: '033 - Santander' },
  { value: '104', label: '104 - Caixa Econômica' },
  { value: '237', label: '237 - Bradesco' },
  { value: '341', label: '341 - Itaú' },
  { value: '260', label: '260 - Nubank' },
  { value: '077', label: '077 - Inter' },
  { value: '756', label: '756 - Sicoob' },
  { value: '748', label: '748 - Sicredi' },
  { value: '422', label: '422 - Safra' },
  { value: '212', label: '212 - Original' },
  { value: '336', label: '336 - C6 Bank' },
  { value: '290', label: '290 - PagSeguro' },
  { value: '380', label: '380 - PicPay' },
  { value: 'OUTRO', label: 'Outro' },
];

// =====================================================
// MAPEAMENTOS DE SLUGS PARA UUIDs
// Usados para preencher cargo_id e setor_id automaticamente
// =====================================================

/**
 * Mapeamento de funcao (slug) para cargo_id (UUID)
 * Baseado nos dados da tabela 'cargos' em produção
 */
export const FUNCAO_TO_CARGO_ID: Record<string, string> = {
  'admin': '5174909f-5cf8-44f1-a77c-6c4125ee2b9f',
  'diretor': '1649ffa1-cd14-45e8-b570-6dc8eca39a81',
  'coord_administrativo': 'a784d075-5434-4ee4-ae9c-4ac808ec7fa0',
  'coord_assessoria': '144ce406-f26c-4287-8b32-d3222d28c7c4',
  'coord_obras': '38da3cbe-480d-42c3-b29b-6c277ecf3682',
  'operacional_admin': '9d3705d5-5a0e-4334-8f20-b85e61d646da',
  'operacional_assessoria': '4475a115-d30f-4ef4-87bd-2e192c9c072a',
  'operacional_comercial': '9f80ce8f-64be-4e4d-bbe9-37bcc7a81861',
  'operacional_obras': '0e55831d-935a-4d2c-98d2-1fb0b309dfc6',
  'colaborador_obra': '6335c1e2-6267-4f3e-ac9e-b6421ed75b34',
};

/**
 * Mapeamento de setor (slug) para setor_id (UUID)
 * Baseado nos dados da tabela 'setores' em produção
 */
export const SETOR_SLUG_TO_ID: Record<string, string> = {
  'ti': 'c09a349c-146b-4bca-9b79-d2d20d2fe286',
  'diretoria': 'f7355c6e-8788-44d9-90fb-1df80cb694bc',
  'administrativo': '7042bada-7bb3-42c9-9f52-c69ea62c6ae3',
  'assessoria': '3756cce2-25b4-4aff-b679-f559b22c4e7e',
  'obras': '950dce89-b35d-49b4-af8e-161feb386774',
};

/**
 * Helper para obter cargo_id a partir da função
 */
export function getCargoIdByFuncao(funcao: string | null | undefined): string | null {
  if (!funcao) return null;
  return FUNCAO_TO_CARGO_ID[funcao] || null;
}

/**
 * Helper para obter setor_id a partir do slug do setor
 */
export function getSetorIdBySlug(setorSlug: string | null | undefined): string | null {
  if (!setorSlug) return null;
  return SETOR_SLUG_TO_ID[setorSlug] || null;
}

/**
 * Helper unificado para cálculo de custo diário da mão de obra
 * Para CLT: (salario_base * FATOR_ENCARGOS_CLT) / dias_uteis_mes
 * Para PJ/Outros: custo_dia do banco de dados
 */
export function calcularCustoDiaMaoDeObra(
  salarioBase: number | null | undefined,
  custoDiaPJ: number | null | undefined,
  diasUteisMes: number,
  isCLT: boolean = true
): number {
  if (isCLT) {
    const base = salarioBase || 0;
    if (base === 0 || diasUteisMes === 0) return 0;
    return (base * FATOR_ENCARGOS_CLT) / diasUteisMes;
  }
  
  return custoDiaPJ || 0;
}

// =====================================================
// CENTRO DE CUSTO FIXO — MAPEAMENTO POR FUNÇÃO
// Colaboradores "sem divisão de custo" alocam 100% no CC fixo
// =====================================================

/**
 * Mapeamento de função (slug) → código do Centro de Custo Fixo
 * Regra de negócio hardcoded:
 * - coord_administrativo, operacional_admin, operacional_comercial, diretor → CC-ESCRITORIO
 * - coord_obras → CC-SETOR_OBRAS  
 * - coord_assessoria → CC-SETOR_ASSESSORIA
 * 
 * Funções NÃO listadas aqui (operacional_assessoria, operacional_obras, colaborador_obra)
 * são "com divisão de custo" — seus custos são rateados entre CCs de clientes.
 */
export const CENTRO_CUSTO_FIXO_MAP: Record<string, string> = {
  diretor: 'CC-ESCRITORIO',
  coord_administrativo: 'CC-ESCRITORIO',
  coord_assessoria: 'CC-SETOR_ASSESSORIA',
  coord_obras: 'CC-SETOR_OBRAS',
  operacional_admin: 'CC-ESCRITORIO',
  operacional_comercial: 'CC-ESCRITORIO',
};

/**
 * Helper para obter o código do CC Fixo a partir da função do colaborador
 * @returns código CC (ex: 'CC-ESCRITORIO') ou null se função tem divisão de custo
 */
export function getCentroCustoFixo(funcao: string | null | undefined): string | null {
  if (!funcao) return null;
  return CENTRO_CUSTO_FIXO_MAP[funcao] || null;
}

/**
 * Verifica se uma função tem centro de custo fixo (sem divisão)
 */
export function temCentroCustoFixo(funcao: string | null | undefined): boolean {
  return getCentroCustoFixo(funcao) !== null;
}

// =====================================================
// FORMATAÇÃO DE TEMPO
// =====================================================

/**
 * Converte minutos de atraso para formato legível:
 * - < 60 min → "45 min"
 * - = 60 min → "1h"
 * - > 60 min → "2h 15min"
 */
export function formatMinutosAtraso(minutos: number | null | undefined): string {
  if (!minutos || minutos <= 0) return '0 min';
  if (minutos < 60) return `${minutos} min`;
  const horas = Math.floor(minutos / 60);
  const mins = minutos % 60;
  return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
}
