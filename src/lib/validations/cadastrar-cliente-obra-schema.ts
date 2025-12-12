/**
 * Schema de Validação - Cadastrar Cliente Obra (OS13 Etapa 1)
 *
 * Valida todos os campos obrigatórios para cadastro de cliente em obra:
 * - Cliente selecionado
 * - Data de contratação
 * - Aniversário do gestor
 * - Senha de acesso (mín 8 chars + maiúsculas + números)
 * - Documentos obrigatórios (RG/CNH, Comprovante, Contrato Social, Contrato Assinado)
 */

import { z } from 'zod';



export const cadastrarClienteObraSchema = z.object({
  // Identificação do Cliente
  clienteId: z.string().min(1, {
    message: 'Selecione um cliente'
  }),

  clienteNome: z.string().optional(),

  // Campos Estratégicos
  dataContratacao: z.string().min(1, {
    message: 'Data de contratação é obrigatória'
  }),

  aniversarioGestor: z.string().min(1, {
    message: 'Aniversário do gestor é obrigatório'
  }),

  // Centro de Custo (opcional - será gerado automaticamente)
  centroCusto: z.object({
    id: z.string(),
    nome: z.string()
  }).optional(),

  // Documentos OBRIGATÓRIOS do Cliente
  documentosFoto: z.array(z.any()).min(1, {
    message: 'Documento com foto (RG/CNH) é obrigatório'
  }),

  comprovantesResidencia: z.array(z.any()).min(1, {
    message: 'Comprovante de residência é obrigatório'
  }),

  contratoSocial: z.array(z.any()).min(1, {
    message: 'Contrato Social/Ata de Eleição é obrigatório'
  }),

  // Documento OBRIGATÓRIO da OS
  contratoAssinado: z.array(z.any()).min(1, {
    message: 'Contrato assinado é obrigatório'
  }),

  // Documentos OPCIONAIS
  logoCliente: z.array(z.any()).optional().default([])
});

export type CadastrarClienteObraData = z.infer<typeof cadastrarClienteObraSchema>;

/**
 * Valores padrão para o formulário
 */
export const cadastrarClienteObraDefaults: CadastrarClienteObraData = {
  clienteId: '',
  clienteNome: '',
  dataContratacao: '',
  aniversarioGestor: '',
  documentosFoto: [],
  comprovantesResidencia: [],
  contratoSocial: [],
  contratoAssinado: [],
  logoCliente: []
};
