import { z } from 'zod';
import { FINALIDADE_OPTIONS, AREAS_VISTORIA } from '@/components/os/assessoria/os-8/types/os08-types';

/**
 * Schema de validação para os detalhes da solicitação de OS-08
 * Usado tanto no formulário público quanto no interno
 */
export const detalhesVisitaSchema = z.object({
  finalidadeInspecao: z.enum(
    FINALIDADE_OPTIONS.map(o => o.value) as [string, ...string[]], 
    { errorMap: () => ({ message: 'Selecione a finalidade da inspeção' }) }
  ),

  tipoArea: z.enum(['unidade_autonoma', 'area_comum'], {
    errorMap: () => ({ message: 'Selecione o tipo de área' }),
  }),

  unidadesVistoriar: z.string()
    .min(1, { message: 'Informe quais unidades devem ser vistoriadas' })
    .describe('Unidades a serem vistoriadas'),

  contatoUnidades: z.string()
    .min(10, { message: 'O telefone deve ter pelo menos 10 dígitos' })
    .describe('Contato das unidades'),

  areaVistoriada: z.enum(
    AREAS_VISTORIA as unknown as [string, ...string[]],
    { errorMap: () => ({ message: 'Selecione a área a ser vistoriada' }) }
  ),

  detalhesSolicitacao: z.string()
    .min(10, { message: 'Descreva os detalhes com pelo menos 10 caracteres' })
    .describe('Detalhes da solicitação'),

  tempoSituacao: z.string()
    .min(1, { message: 'Informe há quanto tempo a situação ocorre' })
    .describe('Tempo da situação'),

  primeiraVisita: z.string()
    .min(1, { message: 'Informe se é a primeira visita' })
    .describe('Primeira visita'),
    
  arquivos: z.array(z.any()).optional().describe('Fotos da situação'),
});

export type DetalhesVisitaFormData = z.infer<typeof detalhesVisitaSchema>;
