import { z } from 'zod';
import { getStepDefaults } from '@/lib/utils/schema-defaults';

/**
 * Schemas de Validação para as 15 Etapas do Workflow OS 01-04
 *
 * Cada schema define os campos obrigatórios e suas regras de validação
 * para garantir integridade de dados antes de avançar de etapa
 */

// ============================================================
// ETAPA 1: Identificação do Cliente/Lead
// ============================================================
export const etapa1Schema = z.object({
  leadId: z.string()
    .min(1, { message: 'Lead é obrigatório' })
    .describe('ID do lead/cliente selecionado'),

  // Campos básicos obrigatórios - simplificados para permitir avanço rápido
  nome: z.string()
    .min(1, { message: 'Nome é obrigatório' })
    .describe('Nome do cliente/empresa'),

  // Campos de contato - opcionais por enquanto para permitir avanço
  cpfCnpj: z.string()
    .optional()
    .describe('CPF ou CNPJ'),

  email: z.string()
    .optional()
    .describe('Email do cliente'),

  telefone: z.string()
    .optional()
    .describe('Telefone de contato'),

  // Campos adicionais do lead (mantidos para compatibilidade e futura expansão)
  tipo: z.string().optional(),
  nomeResponsavel: z.string().optional(),
  cargoResponsavel: z.string().optional(),
  tipoEdificacao: z.string().optional(),
  qtdUnidades: z.string().optional(),
  qtdBlocos: z.string().optional(),
  qtdPavimentos: z.string().optional(),
  tipoTelhado: z.string().optional(),
  possuiElevador: z.boolean().optional(),
  possuiPiscina: z.boolean().optional(),
  cep: z.string().optional(),
  endereco: z.string().optional(),
  numero: z.string().optional(),
  complemento: z.string().optional(),
  bairro: z.string().optional(),
  cidade: z.string().optional(),
  estado: z.string().optional(),
}).refine(
  (data) => data.leadId && data.nome,
  {
    message: 'Lead e nome são obrigatórios',
    path: ['leadId'],
  }
);

export type Etapa1Data = z.infer<typeof etapa1Schema>;

// ============================================================
// ETAPA 2: Seleção do Tipo de OS
// ============================================================
export const etapa2Schema = z.object({
  tipoOS: z.string()
    .min(1, { message: 'Tipo de OS é obrigatório' })
    .describe('Tipo de Ordem de Serviço (OS 01, OS 08, etc)'),

  descricaoBreve: z.string()
    .min(10, { message: 'Descrição deve ter pelo menos 10 caracteres' })
    .optional()
    .describe('Descrição breve do serviço'),
}).strict();

export type Etapa2Data = z.infer<typeof etapa2Schema>;

// ============================================================
// ETAPA 3: Follow-up 1 (Entrevista Inicial)
// ============================================================
export const etapa3Schema = z.object({
  // Campos obrigatórios do formulário (flexibilizados para permitir avanço rápido)
  idadeEdificacao: z.string()
    .min(1, { message: 'Idade da edificação é obrigatória' })
    .describe('Qual a idade da edificação?'),

  motivoProcura: z.string()
    .min(5, { message: 'Motivo da procura deve ter pelo menos 5 caracteres' })
    .describe('Qual o motivo fez você nos procurar?'),

  quandoAconteceu: z.string()
    .min(5, { message: 'Histórico deve ter pelo menos 5 caracteres' })
    .describe('Quando aconteceu? Há quanto tempo?'),

  grauUrgencia: z.string()
    .min(1, { message: 'Grau de urgência é obrigatório' })
    .describe('Qual o grau de urgência para executar esse serviço?'),

  apresentacaoProposta: z.string()
    .min(5, { message: 'Resposta sobre apresentação deve ter pelo menos 5 caracteres' })
    .describe('Concordância e agendamento para apresentação da proposta'),

  nomeContatoLocal: z.string()
    .min(2, { message: 'Nome do contato no local deve ter pelo menos 2 caracteres' })
    .describe('Nome do contato no local'),

  telefoneContatoLocal: z.string()
    .min(8, { message: 'Telefone do contato no local deve ter pelo menos 8 caracteres' })
    .describe('Telefone do contato no local'),

  // Campos opcionais
  oqueFeitoARespeito: z.string()
    .optional()
    .describe('O que já foi feito a respeito disso?'),

  existeEscopo: z.string()
    .optional()
    .describe('Existe escopo de serviços ou laudo?'),

  previsaoOrcamentaria: z.string()
    .optional()
    .describe('Existe previsão orçamentária?'),

  cargoContatoLocal: z.string()
    .optional()
    .describe('Cargo do contato no local'),

  anexos: z.array(z.object({
    id: z.string().optional(),
    url: z.string(),
    nome: z.string(),
    tamanho: z.number().optional(),
  }))
    .optional()
    .nullable()
    .default([])
    .describe('Arquivos anexados (escopo, laudo, fotos)'),
});

export type Etapa3Data = z.infer<typeof etapa3Schema>;

// ============================================================
// ETAPA 4: Agendar Apresentação/Visita
// ============================================================
export const etapa4Schema = z.object({
  // Campo novo: ID do agendamento no sistema centralizado
  agendamentoId: z.string()
    .optional()
    .describe('ID do agendamento no sistema de calendário centralizado'),

  // Campo legado mantido para compatibilidade
  dataAgendamento: z.string()
    .optional()
    .describe('Data e horário agendados (campo legado)'),

  // Campos legados mantidos para compatibilidade
  dataVisita: z.string()
    .optional()
    .describe('Data agendada para a visita técnica (legado)'),

  horaVisita: z.string()
    .optional()
    .describe('Hora agendada para a visita (legado)'),

  responsavelVisita: z.string()
    .optional()
    .describe('Nome do profissional que fará a visita (legado)'),

  observacoes: z.string()
    .optional()
    .describe('Observações adicionais'),
}).refine(
  (data) => data.agendamentoId || data.dataAgendamento || (data.dataVisita && data.horaVisita && data.responsavelVisita),
  {
    message: 'Agendamento é obrigatório',
    path: ['agendamentoId'],
  }
);

export type Etapa4Data = z.infer<typeof etapa4Schema>;

// ============================================================
// ETAPA 5: Realizar Visita
// ============================================================
export const etapa5Schema = z.object({
  visitaRealizada: z.boolean()
    .refine((val) => val === true, { message: 'A visita deve ser confirmada como realizada' })
    .describe('Confirmação de que a visita técnica foi realizada'),

  // Campos legados mantidos para compatibilidade futura
  dataVisitaRealizada: z.string()
    .optional()
    .describe('Data em que a visita foi realizada (legado)'),

  observacoesVisita: z.string()
    .optional()
    .describe('Detalhes e observações da visita realizada (legado)'),

  fotosVisita: z.array(z.object({
    url: z.string(),
    nome: z.string(),
  }))
    .optional()
    .describe('Fotos tiradas durante a visita (legado)'),
}).refine(
  (data) => data.visitaRealizada === true,
  {
    message: 'A visita deve ser confirmada como realizada',
    path: ['visitaRealizada'],
  }
);

export type Etapa5Data = z.infer<typeof etapa5Schema>;

// ============================================================
// ETAPA 6: Follow-up 2 (Pós-Visita)
// ============================================================
export const etapa6Schema = z.object({
  // Momento 1: Perguntas Durante a Visita
  outrasEmpresas: z.string()
    .min(1, { message: 'Campo obrigatório' })
    .describe('Há outras empresas realizando visita técnica?'),

  comoEsperaResolver: z.string()
    .min(1, { message: 'Campo obrigatório' })
    .describe('Como você espera resolver esse problema?'),

  expectativaCliente: z.string()
    .min(1, { message: 'Campo obrigatório' })
    .describe('Qual a principal expectativa do cliente?'),

  estadoAncoragem: z.string()
    .min(1, { message: 'Campo obrigatório' })
    .describe('Qual o estado do sistema de ancoragem?'),

  fotosAncoragem: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    url: z.string(),
    path: z.string(),
    size: z.number(),
    type: z.string(),
    uploadedAt: z.string(),
    comment: z.string(),
  }))
    .optional()
    .default([])
    .describe('Fotos do sistema de ancoragem'),

  // Momento 2: Avaliação Geral da Visita
  quemAcompanhou: z.string()
    .min(1, { message: 'Campo obrigatório' })
    .describe('Quem acompanhou a visita?'),

  avaliacaoVisita: z.string()
    .min(1, { message: 'Campo obrigatório' })
    .describe('Avaliação da visita'),

  // Momento 3: Respostas do Engenheiro
  estadoGeralEdificacao: z.string()
    .min(1, { message: 'Campo obrigatório' })
    .describe('Qual o estado geral da edificação?'),

  servicoResolver: z.string()
    .min(1, { message: 'Campo obrigatório' })
    .describe('Qual o serviço deve ser feito para resolver o problema?'),

  arquivosGerais: z.array(z.object({
    id: z.string().optional(),
    name: z.string(),
    url: z.string(),
    path: z.string(),
    size: z.number(),
    type: z.string(),
    uploadedAt: z.string(),
    comment: z.string(),
  }))
    .optional()
    .default([])
    .describe('Arquivos gerais (fotos, croquis, etc)'),
}).refine(
  (data) => {
    // Verificar se todos os campos obrigatórios estão preenchidos
    const camposObrigatorios = [
      data.outrasEmpresas,
      data.comoEsperaResolver,
      data.expectativaCliente,
      data.estadoAncoragem,
      data.quemAcompanhou,
      data.avaliacaoVisita,
      data.estadoGeralEdificacao,
      data.servicoResolver,
    ];

    return camposObrigatorios.every(campo => campo && campo.trim().length > 0);
  },
  {
    message: 'Todos os campos obrigatórios devem ser preenchidos',
    path: ['outrasEmpresas'],
  }
);

export type Etapa6Data = z.infer<typeof etapa6Schema>;

// ============================================================
// ETAPA 7: Formulário Memorial (Escopo)
// ============================================================
export const etapa7Schema = z.object({
  objetivo: z.string()
    .min(10, { message: 'Objetivo deve ter pelo menos 10 caracteres' })
    .describe('Objetivo da contratação do serviço'),

  etapasPrincipais: z.array(z.object({
    nome: z.string()
      .min(1, { message: 'Nome da etapa é obrigatório' })
      .describe('Nome da etapa principal'),
    subetapas: z.array(z.object({
      nome: z.string()
        .min(1, { message: 'Nome da sub-etapa é obrigatório' })
        .describe('Descrição da sub-etapa'),
      m2: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
          message: 'm² deve ser um número positivo',
        })
        .describe('Metragem quadrada'),
      diasUteis: z.string()
        .refine((val) => !isNaN(parseInt(val)) && parseInt(val) > 0, {
          message: 'Dias úteis deve ser um número positivo',
        })
        .describe('Quantidade de dias úteis'),
      total: z.string()
        .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0, {
          message: 'Total deve ser um número positivo',
        })
        .describe('Valor total em R$'),
    }))
      .min(1, { message: 'Cada etapa deve ter pelo menos uma sub-etapa' })
      .describe('Sub-etapas de execução'),
  }))
    .min(1, { message: 'Deve haver pelo menos uma etapa principal' })
    .describe('Etapas principais do projeto'),

  planejamentoInicial: z.string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: 'Planejamento deve ser um número positivo',
    })
    .describe('Dias úteis para planejamento'),

  logisticaTransporte: z.string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: 'Logística deve ser um número positivo',
    })
    .describe('Dias úteis para logística e transporte'),

  preparacaoArea: z.string()
    .refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 0, {
      message: 'Preparação deve ser um número positivo',
    })
    .describe('Dias úteis para preparação de área'),
}).strict();

export type Etapa7Data = z.infer<typeof etapa7Schema>;

// ============================================================
// ETAPA 8: Precificação
// ============================================================
export const etapa8Schema = z.object({
  materialCusto: z.string()
    .min(1, { message: 'Custo de material é obrigatório' })
    .describe('Custo total de materiais'),

  maoObraCusto: z.string()
    .min(1, { message: 'Custo de mão-de-obra é obrigatório' })
    .describe('Custo total de mão-de-obra'),

  margemLucro: z.string()
    .min(1, { message: 'Margem de lucro é obrigatória' })
    .describe('Percentual de margem de lucro'),

  precoFinal: z.string()
    .min(1, { message: 'Preço final é obrigatório' })
    .describe('Preço final cotado'),

  observacoesPrecificacao: z.string()
    .optional()
    .describe('Observações sobre a precificação'),
}).partial().refine(
  (data) => data.materialCusto && data.maoObraCusto && data.precoFinal,
  {
    message: 'Custo material, mão-de-obra e preço final são obrigatórios',
    path: ['materialCusto'],
  }
);

export type Etapa8Data = z.infer<typeof etapa8Schema>;

// ============================================================
// ETAPA 9: Gerar Proposta Comercial
// ============================================================
export const etapa9Schema = z.object({
  // Campos de controle da proposta
  propostaGerada: z.boolean()
    .default(false)
    .describe('Indica se a proposta foi gerada'),

  dataGeracao: z.string()
    .default('')
    .describe('Data de geração da proposta'),

  codigoProposta: z.string()
    .default('')
    .describe('Código único da proposta'),

  // Campos obrigatórios para gerar a proposta
  validadeDias: z.string()
    .default('30')
    .describe('Validade da proposta em dias'),

  garantiaMeses: z.string()
    .default('12')
    .describe('Período de garantia em meses'),

  // Campos gerados automaticamente (após gerar proposta)
  descricaoServicos: z.string()
    .default('')
    .describe('Descrição completa dos serviços'),

  valorProposta: z.string()
    .default('')
    .describe('Valor total da proposta'),

  prazoProposta: z.string()
    .default('')
    .describe('Prazo de execução em dias'),

  condicoesPagamento: z.string()
    .default('')
    .describe('Termos e condições de pagamento'),
});

export type Etapa9Data = z.infer<typeof etapa9Schema>;

// ============================================================
// ETAPA 10: Agendar Visita (Apresentação)
// ============================================================
export const etapa10Schema = z.object({
  dataApresentacao: z.string()
    .min(1, { message: 'Data da apresentação é obrigatória' })
    .describe('Data agendada para apresentar proposta'),

  horaApresentacao: z.string()
    .min(1, { message: 'Hora da apresentação é obrigatória' })
    .describe('Hora agendada para apresentação'),

  responsavelApresentacao: z.string()
    .min(1, { message: 'Responsável é obrigatório' })
    .describe('Nome de quem apresentará a proposta'),
}).partial().refine(
  (data) => data.dataApresentacao && data.horaApresentacao,
  {
    message: 'Data e hora são obrigatórias',
    path: ['dataApresentacao'],
  }
);

export type Etapa10Data = z.infer<typeof etapa10Schema>;

// ============================================================
// ETAPA 11: Realizar Visita (Apresentação)
// ============================================================
export const etapa11Schema = z.object({
  dataApresentacaoRealizada: z.string()
    .min(1, { message: 'Data da apresentação é obrigatória' })
    .describe('Data em que apresentação foi realizada'),

  reacaoCliente: z.string()
    .min(1, { message: 'Reação do cliente é obrigatória' })
    .describe('Como foi a reação do cliente (Positiva/Neutra/Negativa)'),

  observacoesApresentacao: z.string()
    .min(10, { message: 'Observações devem ter pelo menos 10 caracteres' })
    .describe('Observações e comentários sobre a apresentação'),
}).partial().refine(
  (data) => data.dataApresentacaoRealizada && data.reacaoCliente,
  {
    message: 'Data e reação do cliente são obrigatórias',
    path: ['dataApresentacaoRealizada'],
  }
);

export type Etapa11Data = z.infer<typeof etapa11Schema>;

// ============================================================
// ETAPA 12: Follow-up 3 (Pós-Apresentação)
// ============================================================
export const etapa12Schema = z.object({
  propostaApresentada: z.string()
    .optional()
    .describe('Qual a proposta apresentada?'),

  metodoApresentacao: z.string()
    .optional()
    .describe('Qual o método de apresentação?'),

  clienteAchouProposta: z.string()
    .optional()
    .describe('O que o cliente achou da proposta?'),

  clienteAchouContrato: z.string()
    .optional()
    .describe('O que o cliente achou do contrato?'),

  doresNaoAtendidas: z.string()
    .optional()
    .describe('Quais dores não foram atendidas?'),

  indicadorFechamento: z.string()
    .optional()
    .describe('Qual é o indicador de fechamento?'),

  quemEstavaNaApresentacao: z.string()
    .optional()
    .describe('Quem estava presente na apresentação?'),

  nivelSatisfacao: z.string()
    .optional()
    .describe('Nível de satisfação do cliente'),
}).partial();

export type Etapa12Data = z.infer<typeof etapa12Schema>;

// ============================================================
// ETAPA 13: Gerar Contrato (Upload)
// ============================================================
export const etapa13Schema = z.object({
  descricaoContrato: z.string()
    .min(20, { message: 'Descrição deve ter pelo menos 20 caracteres' })
    .describe('Descrição do contrato e termos'),

  dataInicio: z.string()
    .min(1, { message: 'Data de início é obrigatória' })
    .describe('Data de início dos trabalhos'),

  dataFim: z.string()
    .min(1, { message: 'Data de fim é obrigatória' })
    .describe('Data de conclusão prevista'),

  arquivoContrato: z.object({
    url: z.string(),
    nome: z.string(),
  })
    .describe('Arquivo do contrato em PDF'),
}).partial().refine(
  (data) => data.descricaoContrato && data.dataInicio && data.dataFim,
  {
    message: 'Descrição, data de início e fim são obrigatórias',
    path: ['descricaoContrato'],
  }
);

export type Etapa13Data = z.infer<typeof etapa13Schema>;

// ============================================================
// ETAPA 14: Contrato Assinado
// ============================================================
export const etapa14Schema = z.object({
  dataAssinatura: z.string()
    .min(1, { message: 'Data de assinatura é obrigatória' })
    .describe('Data em que contrato foi assinado'),

  assinadoPor: z.string()
    .min(1, { message: 'Nome de quem assinou é obrigatório' })
    .describe('Nome do responsável que assinou'),

  arquivoAssinado: z.object({
    url: z.string(),
    nome: z.string(),
  })
    .describe('Arquivo do contrato assinado'),
}).partial().refine(
  (data) => data.dataAssinatura && data.assinadoPor,
  {
    message: 'Data e assinante são obrigatórios',
    path: ['dataAssinatura'],
  }
);

export type Etapa14Data = z.infer<typeof etapa14Schema>;

// ============================================================
// ETAPA 15: Iniciar Contrato de Obra
// ============================================================
export const etapa15Schema = z.object({
  dataInicio: z.string()
    .min(1, { message: 'Data de início é obrigatória' })
    .describe('Data de início efetivo da obra'),

  responsavelObra: z.string()
    .min(1, { message: 'Responsável é obrigatório' })
    .describe('Nome do responsável pela obra'),

  numEquipe: z.string()
    .min(1, { message: 'Número da equipe é obrigatório' })
    .describe('Equipe designada para a obra'),
}).partial().refine(
  (data) => data.dataInicio && data.responsavelObra,
  {
    message: 'Data e responsável são obrigatórios',
    path: ['dataInicio'],
  }
);

export type Etapa15Data = z.infer<typeof etapa15Schema>;

// ============================================================
// MAPA DE SCHEMAS POR ETAPA
// ============================================================

export const stepsSchemas = {
  1: etapa1Schema,
  2: etapa2Schema,
  3: etapa3Schema,
  4: etapa4Schema,
  5: etapa5Schema,
  6: etapa6Schema,
  7: etapa7Schema,
  8: etapa8Schema,
  9: etapa9Schema,
  10: etapa10Schema,
  11: etapa11Schema,
  12: etapa12Schema,
  13: etapa13Schema,
  14: etapa14Schema,
  15: etapa15Schema,
} as const;

/**
 * Função genérica para validar dados de uma etapa
 *
 * @param stepNumber Número da etapa (1-15)
 * @param data Dados a validar
 * @returns {valid: boolean, errors: Record<string, string>}
 */
export function validateStep(stepNumber: number, data: any): { valid: boolean; errors: Record<string, string> } {
  // Usar defaults se data estiver vazio
  const dataToValidate = (data && Object.keys(data).length > 0)
    ? data
    : getStepDefaults(stepNumber);

  const schema = stepsSchemas[stepNumber as keyof typeof stepsSchemas];

  if (!schema) {
    return { valid: false, errors: { _root: `Schema não encontrado para etapa ${stepNumber}` } };
  }

  try {
    schema.parse(dataToValidate);
    return { valid: true, errors: {} };
  } catch (error) {
    // Verificar se é um erro Zod válido
    if (error instanceof z.ZodError && error.errors && Array.isArray(error.errors)) {
      const errors: Record<string, string> = {};

      error.errors.forEach((err) => {
        if (err && err.path && Array.isArray(err.path)) {
          const path = err.path.join('.');
          errors[path] = err.message;
        }
      });

      return { valid: false, errors };
    }

    // Fallback para erros genéricos
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido ao validar dados';
    return { valid: false, errors: { _root: errorMessage } };
  }
}

/**
 * Função auxiliar para obter todos os erros de validação de uma etapa
 */
export function getStepValidationErrors(stepNumber: number, data: any): string[] {
  const { errors } = validateStep(stepNumber, data);
  return Object.values(errors).filter(error => typeof error === 'string');
}

/**
 * Função para verificar se existe schema para uma etapa
 */
export function hasSchemaForStep(stepNumber: number): boolean {
  return stepNumber in stepsSchemas;
}
