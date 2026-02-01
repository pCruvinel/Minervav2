import { z } from 'zod';

export const agendarVisitaSchema = z.object({
  dataAgendamento: z.string().min(1, { message: 'Data da visita é obrigatória' }),
  horarioInicio: z.string().min(1, { message: 'Horário de início é obrigatório' }),
  horarioFim: z.string().min(1, { message: 'Horário de fim é obrigatório' }),
  tecnicoResponsavel: z.string().min(1, { message: 'Técnico responsável é obrigatório' }),
  duracaoHoras: z.number().optional(),
  instrucoes: z.string().optional(),
});

import { QUESTIONARIO_VISITA } from '@/lib/constants/os11-constants';

export const realizarVisitaSchema = z.object({
  visitaRealizada: z.boolean().refine(val => val === true, { message: 'Confirmação de realização é obrigatória' }),
  dataRealizacao: z.string().min(1, { message: 'Data da realização é obrigatória' }),
  horaChegada: z.string().min(1, { message: 'Hora de chegada é obrigatória' }),
  horaSaida: z.string().min(1, { message: 'Hora de saída é obrigatória' }),
  fotos: z.array(z.any()).optional(),
  observacoesVisita: z.string().optional(),
  respostas: z.record(z.string()).optional(),
}).superRefine((data, ctx) => {
  if (data.visitaRealizada) {
    // Verificar se todas as perguntas foram respondidas
    const respostas = data.respostas || {};
    const perguntasNaoRespondidas = QUESTIONARIO_VISITA.filter(q => !respostas[q.id] || respostas[q.id].trim() === '');
    
    if (perguntasNaoRespondidas.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `Faltam ${perguntasNaoRespondidas.length} respostas no questionário`,
        path: ['respostas'],
      });
    }
    
    if ((data.fotos || []).length === 0) {
        ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Pelo menos uma foto deve ser anexada',
            path: ['fotos'],
        });
    }
  }
});

export const anexarRTSchema = z.object({
  numeroRT: z.string().min(1, { message: 'Número da RT é obrigatório' }),
  dataRT: z.string().min(1, { message: 'Data da RT é obrigatória' }),
  profissionalResponsavel: z.string().min(1, { message: 'Profissional responsável é obrigatório' }),
  crea: z.string().min(1, { message: 'CREA é obrigatório' }),
  arquivoRT: z.any().optional(), // Validação de arquivo geralmente feita no componente ou via state auxiliar
});

export const posVisitaSchema = z.object({
  finalidadeInspecao: z.string().min(1, { message: 'Finalidade é obrigatória' }),
  // Campos condicionais para Parecer Técnico
  manifestacaoPatologica: z.string().optional(),
  gravidade: z.string().optional(),
  // Campos condicionais para Recebimento (Checklist)
  checklistRecebimento: z.any().optional(),
}).superRefine((data, ctx) => {
  if (data.finalidadeInspecao !== 'recebimento_unidade') {
    if (!data.manifestacaoPatologica) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Manifestação Patológica é obrigatória',
        path: ['manifestacaoPatologica'],
      });
    }
    if (!data.gravidade) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Gravidade é obrigatória',
          path: ['gravidade'],
        });
      }
  }
});

export const gerarDocumentoSchema = z.object({
  documentoGerado: z.boolean().optional(),
  urlDocumento: z.string().optional(),
  templateUsado: z.string().min(1, { message: 'Template é obrigatório' }),
});

export type AgendarVisitaData = z.infer<typeof agendarVisitaSchema>;
export type RealizarVisitaData = z.infer<typeof realizarVisitaSchema>;
export type AnexarRTData = z.infer<typeof anexarRTSchema>;
export type PosVisitaData = z.infer<typeof posVisitaSchema>;
export type GerarDocumentoData = z.infer<typeof gerarDocumentoSchema>;
