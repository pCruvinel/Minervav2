/**
 * DADOS MOCKADOS PARA MÓDULOS DE GESTORES
 * Sistema ERP Minerva Engenharia
 * 
 * Este arquivo centraliza dados para Gestor de Assessoria e Gestor de Obras
 */

// ============================================================
// GESTOR DE ASSESSORIA - DADOS
// ============================================================

export interface LaudoPendente {
  id: string;
  codigo: string;
  cliente: string;
  tipoLaudo: 'VISTORIA_TECNICA' | 'LAUDO_ESTRUTURAL' | 'PERICIA_ENGENHARIA' | 'AVALIACAO_IMOVEL';
  tipoOS: 'OS_06' | 'OS_08';
  autor: string;
  dataSubmissao: string;
  status: 'pendente_revisao' | 'em_revisao' | 'aprovado' | 'rejeitado';
  arquivoRascunho?: string;
  observacoes?: string;
}

export interface ReformaPendente {
  id: string;
  codigo: string;
  condominio: string;
  unidade: string;
  tipoReforma: 'ESTRUTURAL' | 'NAO_ESTRUTURAL' | 'INSTALACOES' | 'ACABAMENTO';
  statusDocumentacao: 'pendente_art' | 'art_enviada' | 'rrt_enviada' | 'completo';
  statusAprovacao: 'aguardando_analise' | 'em_analise' | 'aprovado' | 'reprovado' | 'pendente_documentacao';
  dataSolicitacao: string;
  responsavel: string;
  valorEstimado?: number;
  observacoes?: string;
  documentos?: {
    art?: string;
    rrt?: string;
    projeto?: string;
    memorial?: string;
  };
}

// Laudos Pendentes de Aprovação
export const mockLaudosPendentes: LaudoPendente[] = [
  {
    id: 'L001',
    codigo: 'OS-006-2025',
    cliente: 'Construtora ABC Ltda',
    tipoLaudo: 'VISTORIA_TECNICA',
    tipoOS: 'OS_06',
    autor: 'Carlos Silva',
    dataSubmissao: '2025-11-15',
    status: 'pendente_revisao',
    arquivoRascunho: 'vistoria_tecnica_abc_rascunho.pdf',
    observacoes: 'Vistoria completa realizada em 14/11. Aguardando aprovação para emissão do laudo final.'
  },
  {
    id: 'L002',
    codigo: 'OS-008-2025',
    cliente: 'Residencial Park Ltda',
    tipoLaudo: 'LAUDO_ESTRUTURAL',
    tipoOS: 'OS_08',
    autor: 'Ana Oliveira',
    dataSubmissao: '2025-11-14',
    status: 'em_revisao',
    arquivoRascunho: 'laudo_estrutural_park_rascunho.pdf',
  },
  {
    id: 'L003',
    codigo: 'OS-006-2024',
    cliente: 'Edifício Solar',
    tipoLaudo: 'PERICIA_ENGENHARIA',
    tipoOS: 'OS_06',
    autor: 'Roberto Santos',
    dataSubmissao: '2025-11-13',
    status: 'pendente_revisao',
    arquivoRascunho: 'pericia_solar_rascunho.pdf',
    observacoes: 'Perícia solicitada pelo síndico. Identificados problemas estruturais.'
  },
  {
    id: 'L004',
    codigo: 'OS-008-2024',
    cliente: 'Condomínio Bela Vista',
    tipoLaudo: 'AVALIACAO_IMOVEL',
    tipoOS: 'OS_08',
    autor: 'Mariana Costa',
    dataSubmissao: '2025-11-12',
    status: 'pendente_revisao',
    arquivoRascunho: 'avaliacao_belavista_rascunho.pdf',
  },
  {
    id: 'L005',
    codigo: 'OS-006-2023',
    cliente: 'Shopping Center Norte',
    tipoLaudo: 'VISTORIA_TECNICA',
    tipoOS: 'OS_06',
    autor: 'Pedro Almeida',
    dataSubmissao: '2025-11-11',
    status: 'aprovado',
    arquivoRascunho: 'vistoria_shopping_final.pdf',
    observacoes: 'Aprovado e PDF final gerado em 16/11/2025'
  },
];

// Reformas Pendentes de Análise
export const mockReformasPendentes: ReformaPendente[] = [
  {
    id: 'R001',
    codigo: 'OS-007-2025',
    condominio: 'Edifício Residencial Aurora',
    unidade: 'Apto 1504',
    tipoReforma: 'ESTRUTURAL',
    statusDocumentacao: 'pendente_art',
    statusAprovacao: 'aguardando_analise',
    dataSolicitacao: '2025-11-16',
    responsavel: 'Carlos Silva',
    valorEstimado: 85000,
    documentos: {
      projeto: 'projeto_reforma_1504.pdf',
      memorial: 'memorial_descritivo_1504.pdf',
    }
  },
  {
    id: 'R002',
    codigo: 'OS-007-2024',
    condominio: 'Condomínio Jardim das Flores',
    unidade: 'Casa 23',
    tipoReforma: 'NAO_ESTRUTURAL',
    statusDocumentacao: 'art_enviada',
    statusAprovacao: 'em_analise',
    dataSolicitacao: '2025-11-14',
    responsavel: 'Ana Oliveira',
    valorEstimado: 45000,
    documentos: {
      art: 'art_reforma_casa23.pdf',
      projeto: 'projeto_reforma_casa23.pdf',
    }
  },
  {
    id: 'R003',
    codigo: 'OS-007-2023',
    condominio: 'Edifício Comercial Central',
    unidade: 'Sala 801',
    tipoReforma: 'INSTALACOES',
    statusDocumentacao: 'completo',
    statusAprovacao: 'aprovado',
    dataSolicitacao: '2025-11-10',
    responsavel: 'Roberto Santos',
    valorEstimado: 32000,
    documentos: {
      art: 'art_reforma_sala801.pdf',
      rrt: 'rrt_reforma_sala801.pdf',
      projeto: 'projeto_reforma_sala801.pdf',
      memorial: 'memorial_sala801.pdf',
    }
  },
  {
    id: 'R004',
    codigo: 'OS-007-2022',
    condominio: 'Residencial Parque Verde',
    unidade: 'Bloco B - Apto 302',
    tipoReforma: 'ACABAMENTO',
    statusDocumentacao: 'rrt_enviada',
    statusAprovacao: 'pendente_documentacao',
    dataSolicitacao: '2025-11-09',
    responsavel: 'Mariana Costa',
    valorEstimado: 28000,
    documentos: {
      rrt: 'rrt_reforma_b302.pdf',
    }
  },
  {
    id: 'R005',
    codigo: 'OS-007-2021',
    condominio: 'Edifício Empresarial Tower',
    unidade: 'Conjunto 1205',
    tipoReforma: 'ESTRUTURAL',
    statusDocumentacao: 'pendente_art',
    statusAprovacao: 'reprovado',
    dataSolicitacao: '2025-11-05',
    responsavel: 'Pedro Almeida',
    valorEstimado: 120000,
    observacoes: 'Reprovado por falta de documentação completa. Cliente notificado.'
  },
];

// KPIs para Dashboard do Gestor de Assessoria
export const mockKPIsAssessoria = {
  vistoriasAgendadasSemana: 8,
  laudosEmRedacao: 12,
  os07PendentesAnalise: 4,
  totalLaudosRevisao: 4,
  totalReformasAprovadas: 15,
  totalReformasRejeitadas: 3,
};

// ============================================================
// GESTOR DE OBRAS - DADOS
// ============================================================

export interface ObraAtiva {
  id: string;
  codigo: string;
  tipoOS: 'OS_01' | 'OS_02' | 'OS_03' | 'OS_04' | 'OS_13';
  cliente: string;
  tituloObra: string;
  percentualConcluido: number;
  statusCronograma: 'NO_PRAZO' | 'ATENCAO' | 'ATRASADO';
  dataInicio: string;
  dataPrevistaTermino: string;
  responsavel: string;
  ultimoDiarioObra?: string;
  valorContrato?: number;
  localidade: string;
}

export interface MedicaoPendente {
  id: string;
  codigo: string;
  obraId: string;
  obraCliente: string;
  numeroMedicao: number;
  tipoMedicao: 'FISICA' | 'FINANCEIRA' | 'AMBAS';
  percentualMedido: number;
  valorMedicao: number;
  dataEnvio: string;
  responsavel: string;
  statusAprovacao: 'aguardando_validacao' | 'em_analise' | 'aprovado' | 'rejeitado';
  documentos?: {
    relatorioFotografico?: string;
    planilhaMedicao?: string;
    diarioObra?: string;
  };
  observacoes?: string;
}

// Obras Ativas
export const mockObrasAtivas: ObraAtiva[] = [
  {
    id: 'OB001',
    codigo: 'OS-013-2025',
    tipoOS: 'OS_13',
    cliente: 'Construtora Horizonte Ltda',
    tituloObra: 'Construção de Galpão Industrial - 2.500m²',
    percentualConcluido: 68,
    statusCronograma: 'NO_PRAZO',
    dataInicio: '2025-09-01',
    dataPrevistaTermino: '2026-02-28',
    responsavel: 'Carlos Silva',
    ultimoDiarioObra: '2025-11-16',
    valorContrato: 1850000,
    localidade: 'Guarulhos/SP',
  },
  {
    id: 'OB002',
    codigo: 'OS-001-2025',
    tipoOS: 'OS_01',
    cliente: 'Incorporadora Prime',
    tituloObra: 'Edifício Residencial Vista Park - 15 andares',
    percentualConcluido: 42,
    statusCronograma: 'ATENCAO',
    dataInicio: '2025-06-15',
    dataPrevistaTermino: '2026-12-20',
    responsavel: 'Ana Oliveira',
    ultimoDiarioObra: '2025-11-15',
    valorContrato: 5200000,
    localidade: 'São Paulo/SP',
  },
  {
    id: 'OB003',
    codigo: 'OS-002-2024',
    tipoOS: 'OS_02',
    cliente: 'Prefeitura Municipal de Osasco',
    tituloObra: 'Reforma e Ampliação de UBS - Unidade Centro',
    percentualConcluido: 85,
    statusCronograma: 'NO_PRAZO',
    dataInicio: '2024-08-01',
    dataPrevistaTermino: '2025-12-31',
    responsavel: 'Roberto Santos',
    ultimoDiarioObra: '2025-11-17',
    valorContrato: 980000,
    localidade: 'Osasco/SP',
  },
  {
    id: 'OB004',
    codigo: 'OS-013-2024',
    tipoOS: 'OS_13',
    cliente: 'Supermercados São José',
    tituloObra: 'Construção de Centro de Distribuição - 8.000m²',
    percentualConcluido: 25,
    statusCronograma: 'ATRASADO',
    dataInicio: '2025-10-01',
    dataPrevistaTermino: '2026-08-30',
    responsavel: 'Mariana Costa',
    ultimoDiarioObra: '2025-11-10',
    valorContrato: 6500000,
    localidade: 'Campinas/SP',
  },
  {
    id: 'OB005',
    codigo: 'OS-003-2024',
    tipoOS: 'OS_03',
    cliente: 'Condomínio Residencial Parque das Árvores',
    tituloObra: 'Construção de Área de Lazer e Piscina',
    percentualConcluido: 92,
    statusCronograma: 'NO_PRAZO',
    dataInicio: '2025-07-10',
    dataPrevistaTermino: '2025-11-30',
    responsavel: 'Pedro Almeida',
    ultimoDiarioObra: '2025-11-17',
    valorContrato: 450000,
    localidade: 'Santo André/SP',
  },
  {
    id: 'OB006',
    codigo: 'OS-004-2025',
    tipoOS: 'OS_04',
    cliente: 'Hospital Santa Clara',
    tituloObra: 'Ampliação de Ala de Internação - 3º Andar',
    percentualConcluido: 55,
    statusCronograma: 'ATENCAO',
    dataInicio: '2025-08-20',
    dataPrevistaTermino: '2026-03-15',
    responsavel: 'Carlos Silva',
    ultimoDiarioObra: '2025-11-14',
    valorContrato: 2100000,
    localidade: 'São Bernardo do Campo/SP',
  },
];

// Medições Pendentes
export const mockMedicoesPendentes: MedicaoPendente[] = [
  {
    id: 'M001',
    codigo: 'MED-001-2025',
    obraId: 'OB001',
    obraCliente: 'Construtora Horizonte Ltda',
    numeroMedicao: 4,
    tipoMedicao: 'AMBAS',
    percentualMedido: 68,
    valorMedicao: 425000,
    dataEnvio: '2025-11-16',
    responsavel: 'Carlos Silva',
    statusAprovacao: 'aguardando_validacao',
    documentos: {
      relatorioFotografico: 'relatorio_foto_med4.pdf',
      planilhaMedicao: 'planilha_med4.xlsx',
      diarioObra: 'diario_obra_16_11.pdf',
    },
    observacoes: 'Medição referente ao mês de outubro/2025. Concretagem de pilares concluída.'
  },
  {
    id: 'M002',
    codigo: 'MED-002-2025',
    obraId: 'OB002',
    obraCliente: 'Incorporadora Prime',
    numeroMedicao: 3,
    tipoMedicao: 'FISICA',
    percentualMedido: 42,
    valorMedicao: 680000,
    dataEnvio: '2025-11-15',
    responsavel: 'Ana Oliveira',
    statusAprovacao: 'em_analise',
    documentos: {
      relatorioFotografico: 'relatorio_foto_med3.pdf',
      planilhaMedicao: 'planilha_med3.xlsx',
    },
  },
  {
    id: 'M003',
    codigo: 'MED-003-2024',
    obraId: 'OB003',
    obraCliente: 'Prefeitura Municipal de Osasco',
    numeroMedicao: 8,
    tipoMedicao: 'AMBAS',
    percentualMedido: 85,
    valorMedicao: 120000,
    dataEnvio: '2025-11-14',
    responsavel: 'Roberto Santos',
    statusAprovacao: 'aguardando_validacao',
    documentos: {
      relatorioFotografico: 'relatorio_foto_med8.pdf',
      planilhaMedicao: 'planilha_med8.xlsx',
      diarioObra: 'diario_obra_14_11.pdf',
    },
    observacoes: 'Aguardando aprovação para emissão de nota fiscal.'
  },
  {
    id: 'M004',
    codigo: 'MED-004-2024',
    obraId: 'OB004',
    obraCliente: 'Supermercados São José',
    numeroMedicao: 2,
    tipoMedicao: 'FINANCEIRA',
    percentualMedido: 25,
    valorMedicao: 520000,
    dataEnvio: '2025-11-13',
    responsavel: 'Mariana Costa',
    statusAprovacao: 'rejeitado',
    observacoes: 'Rejeitado: divergência entre medição física e financeira. Solicitar correção.'
  },
  {
    id: 'M005',
    codigo: 'MED-005-2025',
    obraId: 'OB006',
    obraCliente: 'Hospital Santa Clara',
    numeroMedicao: 3,
    tipoMedicao: 'AMBAS',
    percentualMedido: 55,
    valorMedicao: 315000,
    dataEnvio: '2025-11-12',
    responsavel: 'Carlos Silva',
    statusAprovacao: 'aprovado',
    documentos: {
      relatorioFotografico: 'relatorio_foto_med3_hsc.pdf',
      planilhaMedicao: 'planilha_med3_hsc.xlsx',
      diarioObra: 'diario_obra_12_11.pdf',
    },
    observacoes: 'Aprovado em 17/11/2025. Nota fiscal emitida.'
  },
];

// KPIs para Dashboard do Gestor de Obras
export const mockKPIsObras = {
  obrasEmAndamento: 6,
  medicoesPendentes: 3,
  atrasosNoCronograma: 1,
  percentualMedioExecucao: 61.2,
  valorTotalContratos: 17080000,
  valorTotalMedido: 9850000,
};

// Dados para Gráfico de Evolução Física Geral
export const mockEvolucaoFisicaGeral = [
  { mes: 'Jun', planejado: 15, executado: 12 },
  { mes: 'Jul', planejado: 28, executado: 25 },
  { mes: 'Ago', planejado: 42, executado: 38 },
  { mes: 'Set', planejado: 55, executado: 51 },
  { mes: 'Out', planejado: 68, executado: 61 },
  { mes: 'Nov', planejado: 78, executado: 68 },
];
