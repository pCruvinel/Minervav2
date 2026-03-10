import { z } from 'zod';

/**
 * Schemas Zod para validação de dados do workflow OS-10.
 *
 * Valores de enum coincidem com os CHECK constraints do banco:
 * - urgencia: ('baixa','normal','alta','critica')
 * - status:   ('aberta','em_selecao','preenchida','cancelada')
 */

// ─── Etapa 1: Abertura da Solicitação ────────────────────────────

export const etapa1Schema = z.object({
  dataAbertura: z.string().min(1, 'Data de abertura é obrigatória'),
  solicitante: z.string().min(1, 'Solicitante é obrigatório'),
  solicitanteId: z.string().optional(),
  departamento: z.string().min(1, 'Departamento é obrigatório'),
  urgencia: z.enum(['baixa', 'normal', 'alta', 'critica'], {
    errorMap: () => ({ message: 'Selecione um nível de urgência válido' }),
  }),
  justificativa: z
    .string()
    .min(10, 'A justificativa deve ter pelo menos 10 caracteres')
    .max(2000, 'A justificativa não pode exceder 2000 caracteres'),
});

export type Etapa1Data = z.infer<typeof etapa1Schema>;

// ─── Etapa 2: Seleção do Centro de Custo ─────────────────────────

export const etapa2Schema = z.object({
  centroCusto: z.string().min(1, 'Selecione um centro de custo'),
  centroCustoNome: z.string().default(''),
  obraVinculada: z.string().default(''),
  clienteId: z.string().optional(),
});

export type Etapa2Data = z.infer<typeof etapa2Schema>;

// ─── Vaga (item individual) ──────────────────────────────────────

export const vagaSchema = z.object({
  id: z.string().min(1),
  cargo_id: z.string().uuid('Selecione um cargo válido'),
  cargo_nome: z.string().min(1, 'Nome do cargo é obrigatório'),
  quantidade: z
    .number()
    .int('Quantidade deve ser inteira')
    .min(1, 'Mínimo de 1 vaga'),
  habilidades_necessarias: z.string().optional().default(''),
  perfil_comportamental: z.string().optional().default(''),
  experiencia_minima: z.string().optional(),
  escolaridade_minima: z.string().optional(),
});

export type VagaData = z.infer<typeof vagaSchema>;

// ─── Etapa 3: Gerenciador de Vagas ──────────────────────────────

export const etapa3Schema = z.object({
  vagas: z
    .array(vagaSchema)
    .min(1, 'Adicione pelo menos uma vaga para continuar'),
});

export type Etapa3Data = z.infer<typeof etapa3Schema>;

// ─── Candidato ───────────────────────────────────────────────────

export const candidatoSchema = z.object({
  nome_completo: z.string().min(3, 'Nome completo é obrigatório'),
  email: z.string().email('E-mail inválido').optional().or(z.literal('')),
  telefone: z.string().optional().or(z.literal('')),
  fonte: z.enum(['indicacao', 'portal', 'linkedin', 'outro']).optional(),
  observacoes: z.string().optional(),
});

export type CandidatoData = z.infer<typeof candidatoSchema>;

// ─── Helpers ─────────────────────────────────────────────────────

/**
 * Extrai a primeira mensagem de erro legível de um ZodError.
 */
export function getFirstZodError(result: z.SafeParseError<unknown>): string {
  const firstIssue = result.error.issues[0];
  return firstIssue?.message ?? 'Dados inválidos';
}
