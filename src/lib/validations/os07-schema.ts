import { z } from 'zod';
import { 
    SISTEMAS_REFORMA, 
    INTERVENCOES_CRITICAS 
} from '@/components/os/assessoria/os-7/shared/form-detalhes-reforma';

/**
 * Schema de validação para OS-07 (Reforma)
 */
export const detalhesReformaSchema = z.object({
  intervencoesSelecionadas: z.array(z.string())
    .min(1, { message: 'Selecione pelo menos uma intervenção.' }),

  executores: z.array(z.object({
    id: z.string(),
    nome: z.string().min(3, { message: 'Nome obrigatório' }),
    cpf: z.string().min(11, { message: 'CPF obrigatório' }),
  })).optional(), 
  // Opcional pois pode estar apenas salvando rascunho, mas validaremos customizadamente ou required no UI. 
  // Na verdade, para "Avançar" costuma ser required.
  // Vamos deixar validação dos campos internos para o UI (required) e aqui checar consistência se preenchido.

  discriminacoes: z.array(z.object({
    id: z.string(),
    sistema: z.string().min(1, { message: 'Selecione o sistema' }),
    item: z.string().min(3, { message: 'Descreva o item' }),
    geraRuido: z.boolean(),
    previsaoInicio: z.string().min(1, { message: 'Data de início obrigatória' }),
    previsaoFim: z.string().min(1, { message: 'Data de fim obrigatória' }),
  })).optional(),

  planoDescarte: z.string().optional(),

  arquivosART: z.array(z.any()).optional(),
  arquivosProjeto: z.array(z.any()).optional(),
}).superRefine((data, ctx) => {
  // Validação: Se houver intervenção crítica, ART é obrigatória (se estiver finalizando/avançando)
  // Como o schema é usado em tempo real, talvez não devamos bloquear salvar rascunho.
  // Mas para "Concluir Etapa", sim.
  // Vamos assumir que este schema é para "Está Válido para Avançar?"

  const temCritico = data.intervencoesSelecionadas.some(id => 
    INTERVENCOES_CRITICAS.some(crit => crit.id === id)
  );

  if (temCritico && (!data.arquivosART || data.arquivosART.length === 0)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'ART/RRT é obrigatória para intervenções críticas.',
      path: ['arquivosART'],
    });
  }

  // Validação: Se houver executores, validar CPF? (Já tem regra min 11 acima)
});

export type DetalhesReformaFormData = z.infer<typeof detalhesReformaSchema>;

export const dadosSolicitanteSchema = z.object({
  nome: z.string().min(3, { message: 'Nome é obrigatório (min 3 chars)' }),
  whatsapp: z.string().min(10, { message: 'WhatsApp inválido' }),
  email: z.string().email({ message: 'E-mail inválido' }),
  condominioNome: z.string().min(2, { message: 'Nome do condomínio obrigatório' }),
  bloco: z.string().optional(),
  unidade: z.string().min(1, { message: 'Unidade é obrigatória' }),
});

export type DadosSolicitanteFormData = z.infer<typeof dadosSolicitanteSchema>;
