// Constantes para o módulo de Colaboradores

export const FUNCOES = [
  { value: 'DIRETOR_ADMINISTRATIVO', label: '1 - Diretor(a) Administrativo(a)', setor: 'administrativo', gestor: null },
  { value: 'DIRETOR_TECNICO', label: '2 - Diretor(a) Técnico(a)', setor: 'assessoria', gestor: null },
  { value: 'COORDENADOR_ADMINISTRATIVO', label: '3 - Coordenador(a) Administrativo(a)', setor: 'administrativo', gestor: 'DIRETOR_ADMINISTRATIVO' },
  { value: 'COORDENADOR_ASSESSORIA', label: '4 - Coordenador de Assessoria Técnica', setor: 'assessoria', gestor: 'DIRETOR_TECNICO' },
  { value: 'COORDENADOR_OBRAS', label: '5 - Coordenador de Obras', setor: 'obras', gestor: 'DIRETOR_TECNICO' },
  { value: 'OPERACIONAL_ADMINISTRATIVO', label: '6 - Operacional Administrativo', setor: 'administrativo', gestor: 'COORDENADOR_ADMINISTRATIVO' },
  { value: 'OPERACIONAL_COMERCIAL', label: '7 - Operacional Administrativo II', setor: 'administrativo', gestor: 'DIRETOR_ADMINISTRATIVO' },
  { value: 'OPERACIONAL_ASSESSORIA', label: '8 - Operacional Assessoria', setor: 'assessoria', gestor: 'COORDENADOR_ASSESSORIA' },
  { value: 'OPERACIONAL_OBRAS', label: '9 - Operacional Obras', setor: 'obras', gestor: 'COORDENADOR_OBRAS' },
  { value: 'COLABORADOR_OBRA', label: '10 - Colaborador Obra', setor: 'obras', gestor: 'COORDENADOR_OBRAS' },
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
