import { z } from 'zod';

/**
 * Schema de validação para criação de turno no calendário
 * Utilizado pelo stepper de 3 passos
 */

// Passo 1: Horários
export const turnoStep1Schema = z.object({
  horaInicio: z.string()
    .regex(/^\d{2}:\d{2}$/, { message: 'Formato inválido (use HH:MM)' })
    .refine((v) => {
      const [h] = v.split(':').map(Number);
      return h >= 6 && h <= 22;
    }, { message: 'Deve estar entre 06:00 e 22:00' })
    .describe('Hora de início do turno'),
  horaFim: z.string()
    .regex(/^\d{2}:\d{2}$/, { message: 'Formato inválido (use HH:MM)' })
    .describe('Hora de fim do turno'),
});

// Passo 2: Disponibilidade
export const turnoStep2Schema = z.object({
  disponibilidade: z.enum(['uteis', 'recorrente', 'custom'], {
    required_error: 'Selecione o tipo de disponibilidade',
  }),
  diasSemana: z.array(z.number()).optional(),
  dataInicio: z.string().optional(),
  dataFim: z.string().optional(),
});

// Passo 3: Setores + Vagas
export const turnoStep3Schema = z.object({
  setoresSelecionados: z.array(z.string())
    .min(1, { message: 'Selecione ao menos um setor' }),
});

export type TurnoStep1Data = z.infer<typeof turnoStep1Schema>;
export type TurnoStep2Data = z.infer<typeof turnoStep2Schema>;
export type TurnoStep3Data = z.infer<typeof turnoStep3Schema>;
