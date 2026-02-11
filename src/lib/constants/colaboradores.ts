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
  // Documentos Pessoais
  { value: 'RG', label: 'RG', categoria: 'pessoal' },
  { value: 'CPF', label: 'CPF', categoria: 'pessoal' },
  { value: 'CNH', label: 'CNH', categoria: 'pessoal' },
  { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência', categoria: 'pessoal' },
  { value: 'TITULO_ELEITOR', label: 'Título de Eleitor', categoria: 'pessoal' },
  { value: 'RESERVISTA', label: 'Certificado de Reservista', categoria: 'pessoal' },
  { value: 'CERTIDAO_NASCIMENTO', label: 'Certidão de Nascimento', categoria: 'pessoal' },
  { value: 'CERTIDAO_CASAMENTO', label: 'Certidão de Casamento', categoria: 'pessoal' },
  
  // Documentos CLT
  { value: 'CTPS', label: 'Carteira de Trabalho (CTPS)', categoria: 'clt' },
  { value: 'PIS_PASEP', label: 'PIS/PASEP', categoria: 'clt' },
  { value: 'EXAME_ADMISSIONAL', label: 'Exame Admissional', categoria: 'clt' },
  
  // Documentos MEI/PJ
  { value: 'CNPJ', label: 'Cartão CNPJ', categoria: 'pj' },
  { value: 'CCMEI', label: 'Certificado MEI (CCMEI)', categoria: 'pj' },
  { value: 'CONTRATO_SOCIAL', label: 'Contrato Social / Requerimento MEI', categoria: 'pj' },
  { value: 'ALVARA_FUNCIONAMENTO', label: 'Alvará de Funcionamento', categoria: 'pj' },
  { value: 'COMPROVANTE_INSCRICAO_MUNICIPAL', label: 'Inscrição Municipal', categoria: 'pj' },
  { value: 'CERTIDAO_NEGATIVA_FEDERAL', label: 'Certidão Negativa Federal', categoria: 'pj' },
  { value: 'CERTIDAO_NEGATIVA_ESTADUAL', label: 'Certidão Negativa Estadual', categoria: 'pj' },
  { value: 'CERTIDAO_NEGATIVA_MUNICIPAL', label: 'Certidão Negativa Municipal', categoria: 'pj' },
  { value: 'RPA', label: 'Recibo de Pagamento Autônomo (RPA)', categoria: 'pj' },
  { value: 'DADOS_BANCARIOS_PJ', label: 'Comprovante Conta PJ', categoria: 'pj' },
  
  // Outros
  { value: 'CERTIFICADOS', label: 'Certificados e Cursos', categoria: 'outros' },
  { value: 'FOTO_3X4', label: 'Foto 3x4', categoria: 'outros' },
  { value: 'CONTRATO_TRABALHO', label: 'Contrato de Prestação de Serviços', categoria: 'outros' },
];

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
