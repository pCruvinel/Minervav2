// Constantes para o módulo de Colaboradores

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
  { value: 'RG', label: 'RG' },
  { value: 'CPF', label: 'CPF' },
  { value: 'CNH', label: 'CNH' },
  { value: 'CTPS', label: 'Carteira de Trabalho (CTPS)' },
  { value: 'COMPROVANTE_RESIDENCIA', label: 'Comprovante de Residência' },
  { value: 'TITULO_ELEITOR', label: 'Título de Eleitor' },
  { value: 'RESERVISTA', label: 'Certificado de Reservista' },
  { value: 'PIS_PASEP', label: 'PIS/PASEP' },
  { value: 'CERTIDAO_NASCIMENTO', label: 'Certidão de Nascimento' },
  { value: 'CERTIDAO_CASAMENTO', label: 'Certidão de Casamento' },
  { value: 'CERTIFICADOS', label: 'Certificados e Cursos' },
  { value: 'EXAME_ADMISSIONAL', label: 'Exame Admissional' },
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
