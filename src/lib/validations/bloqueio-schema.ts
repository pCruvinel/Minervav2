import { z } from 'zod';

/**
 * Schema de validação para criação de bloqueio no calendário
 * Utilizado pelo stepper de 3 passos
 */

// Passo 1: Motivo + Descrição
export const bloqueioStep1Schema = z.object({
  motivo: z.enum(['ponto_facultativo', 'manutencao', 'evento', 'ferias_coletivas', 'outro'], {
    required_error: 'Selecione o motivo do bloqueio',
  }),
  descricao: z.string()
    .min(3, { message: 'Descrição deve ter no mínimo 3 caracteres' })
    .max(100, { message: 'Descrição deve ter no máximo 100 caracteres' })
    .describe('Descrição do bloqueio'),
});

// Passo 2: Período
export const bloqueioStep2Schema = z.object({
  dataInicio: z.string()
    .min(1, { message: 'Data de início é obrigatória' })
    .describe('Data de início do bloqueio'),
  dataFim: z.string()
    .min(1, { message: 'Data de fim é obrigatória' })
    .describe('Data de fim do bloqueio'),
  diaInteiro: z.boolean(),
  horaInicio: z.string().optional(),
  horaFim: z.string().optional(),
}).refine(
  (data) => data.dataFim >= data.dataInicio,
  { message: 'Data de fim deve ser após a data de início', path: ['dataFim'] }
).refine(
  (data) => data.diaInteiro || (!!data.horaInicio && !!data.horaFim),
  { message: 'Defina os horários', path: ['horaInicio'] }
).refine(
  (data) => data.diaInteiro || !data.horaFim || !data.horaInicio || data.horaFim > data.horaInicio,
  { message: 'Hora de fim deve ser após a hora de início', path: ['horaFim'] }
);

// Passo 3: Escopo (setores) — validação leve
export const bloqueioStep3Schema = z.object({
  todosSetores: z.boolean(),
  setorId: z.string().nullable().optional(),
});

// Schema completo (para tipagem)
export const bloqueioCompletoSchema = z.object({
  motivo: z.enum(['ponto_facultativo', 'manutencao', 'evento', 'ferias_coletivas', 'outro']),
  descricao: z.string().min(3).max(100),
  dataInicio: z.string().min(1),
  dataFim: z.string().min(1),
  diaInteiro: z.boolean(),
  horaInicio: z.string().optional(),
  horaFim: z.string().optional(),
  todosSetores: z.boolean(),
  setorId: z.string().nullable().optional(),
});

export type BloqueioStep1Data = z.infer<typeof bloqueioStep1Schema>;
export type BloqueioStep2Data = z.infer<typeof bloqueioStep2Schema>;
export type BloqueioCompletoData = z.infer<typeof bloqueioCompletoSchema>;
