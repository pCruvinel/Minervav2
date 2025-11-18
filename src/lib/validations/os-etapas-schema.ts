import { z } from 'zod';

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

  nome: z.string()
    .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' })
    .describe('Nome do cliente/empresa'),

  cpfCnpj: z.string()
    .min(11, { message: 'CPF/CNPJ inválido' })
    .optional()
    .describe('CPF ou CNPJ'),

  email: z.string()
    .email({ message: 'Email inválido' })
    .optional()
    .describe('Email do cliente'),

  telefone: z.string()
    .min(10, { message: 'Telefone deve ter pelo menos 10 dígitos' })
    .optional()
    .describe('Telefone de contato'),
}).strict();

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
  dataEntrevista: z.string()
    .min(1, { message: 'Data da entrevista é obrigatória' })
    .describe('Data da entrevista inicial'),

  interessePrincipal: z.string()
    .min(1, { message: 'Interesse principal é obrigatório' })
    .describe('Qual o principal interesse do cliente'),

  observacoes: z.string()
    .min(10, { message: 'Observações devem ter pelo menos 10 caracteres' })
    .optional()
    .describe('Observações da entrevista'),
}).strict();

export type Etapa3Data = z.infer<typeof etapa3Schema>;

// ============================================================
// ETAPA 4: Agendar Visita Técnica
// ============================================================
export const etapa4Schema = z.object({
  dataVisita: z.string()
    .min(1, { message: 'Data da visita é obrigatória' })
    .describe('Data agendada para a visita técnica'),

  horaVisita: z.string()
    .min(1, { message: 'Hora da visita é obrigatória' })
    .describe('Hora agendada para a visita'),

  responsavelVisita: z.string()
    .min(1, { message: 'Responsável pela visita é obrigatório' })
    .describe('Nome do profissional que fará a visita'),

  observacoes: z.string()
    .optional()
    .describe('Observações adicionais'),
}).strict();

export type Etapa4Data = z.infer<typeof etapa4Schema>;

// ============================================================
// ETAPA 5: Realizar Visita
// ============================================================
export const etapa5Schema = z.object({
  dataVisitaRealizada: z.string()
    .min(1, { message: 'Data da visita é obrigatória' })
    .describe('Data em que a visita foi realizada'),

  observacoesVisita: z.string()
    .min(10, { message: 'Observações devem ter pelo menos 10 caracteres' })
    .describe('Detalhes e observações da visita realizada'),

  fotosVisita: z.array(z.object({
    url: z.string(),
    nome: z.string(),
  }))
    .min(1, { message: 'Pelo menos uma foto é obrigatória' })
    .describe('Fotos tiradas durante a visita'),
}).partial().refine(
  (data) => data.dataVisitaRealizada && data.observacoesVisita,
  {
    message: 'Data da visita e observações são obrigatórias',
    path: ['dataVisitaRealizada'],
  }
);

export type Etapa5Data = z.infer<typeof etapa5Schema>;

// ============================================================
// ETAPA 6: Follow-up 2 (Pós-Visita)
// ============================================================
export const etapa6Schema = z.object({
  dataFollowup: z.string()
    .min(1, { message: 'Data do follow-up é obrigatória' })
    .describe('Data do follow-up pós-visita'),

  feedback: z.string()
    .min(10, { message: 'Feedback deve ter pelo menos 10 caracteres' })
    .describe('Feedback do cliente sobre a visita'),

  proximosPassos: z.string()
    .min(1, { message: 'Próximos passos são obrigatórios' })
    .describe('Quais são os próximos passos agora'),
}).partial().refine(
  (data) => data.dataFollowup && data.feedback,
  {
    message: 'Data e feedback são obrigatórios',
    path: ['dataFollowup'],
  }
);

export type Etapa6Data = z.infer<typeof etapa6Schema>;

// ============================================================
// ETAPA 7: Formulário Memorial (Escopo)
// ============================================================
export const etapa7Schema = z.object({
  idadeEdificacao: z.string()
    .min(1, { message: 'Idade da edificação é obrigatória' })
    .describe('Idade da edificação em anos'),

  tipoEdificacao: z.string()
    .min(1, { message: 'Tipo de edificação é obrigatório' })
    .describe('Tipo: Residencial, Comercial, etc'),

  areaConstruida: z.string()
    .min(1, { message: 'Área construída é obrigatória' })
    .describe('Área total construída em m²'),

  descricaoEscopo: z.string()
    .min(20, { message: 'Descrição do escopo deve ter pelo menos 20 caracteres' })
    .describe('Descrição detalhada do escopo dos trabalhos'),

  motivoProcura: z.string()
    .min(1, { message: 'Motivo da procura é obrigatório' })
    .describe('Qual o motivo da procura pelos serviços'),
}).partial().refine(
  (data) => data.idadeEdificacao && data.tipoEdificacao && data.descricaoEscopo,
  {
    message: 'Idade, tipo, área e escopo são obrigatórios',
    path: ['idadeEdificacao'],
  }
);

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
  descricaoServicos: z.string()
    .min(20, { message: 'Descrição deve ter pelo menos 20 caracteres' })
    .describe('Descrição completa dos serviços'),

  valorProposta: z.string()
    .min(1, { message: 'Valor da proposta é obrigatório' })
    .describe('Valor total da proposta'),

  prazoProposta: z.string()
    .min(1, { message: 'Prazo da proposta é obrigatório' })
    .describe('Prazo de execução em dias'),

  condicoesPagamento: z.string()
    .min(1, { message: 'Condições de pagamento são obrigatórias' })
    .describe('Termos e condições de pagamento'),
}).partial().refine(
  (data) => data.descricaoServicos && data.valorProposta && data.prazoProposta,
  {
    message: 'Descrição, valor e prazo são obrigatórios',
    path: ['descricaoServicos'],
  }
);

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
  dataFollowup3: z.string()
    .min(1, { message: 'Data do follow-up é obrigatória' })
    .describe('Data do follow-up pós-apresentação'),

  statusNegociacao: z.string()
    .min(1, { message: 'Status da negociação é obrigatório' })
    .describe('Status: Interessado/Negociando/Pronto/Rejeitado'),

  observacoesFollowup: z.string()
    .min(10, { message: 'Observações devem ter pelo menos 10 caracteres' })
    .describe('Observações do follow-up'),
}).partial().refine(
  (data) => data.dataFollowup3 && data.statusNegociacao,
  {
    message: 'Data e status são obrigatórios',
    path: ['dataFollowup3'],
  }
);

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
  // Proteção contra data undefined
  if (data === undefined || data === null) {
    return { valid: false, errors: { _root: `Dados não fornecidos para etapa ${stepNumber}` } };
  }

  const schema = stepsSchemas[stepNumber as keyof typeof stepsSchemas];

  if (!schema) {
    return { valid: false, errors: { _root: `Schema não encontrado para etapa ${stepNumber}` } };
  }

  try {
    schema.parse(data);
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
