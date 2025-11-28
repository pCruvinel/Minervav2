/**
 * Handler para geração de PDFs de Contratos
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { ContratoTemplate, type ContratoData } from '../templates/contrato-template.tsx';
import { validateContratoData } from '../utils/validation.ts';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handleContratoGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    // Validar dados
    validateContratoData(dados);

    // Converter dados para o formato esperado
    const contratoData: ContratoData = {
      codigoOS: dados.codigoOS as string,
      numeroContrato: dados.numeroContrato as string || `CONT-${osId}`,
      dataEmissao: dados.dataEmissao as string || new Date().toISOString(),
      dataInicio: dados.dataInicio as string,
      dataTermino: dados.dataTermino as string | undefined,

      contratanteNome: dados.contratanteNome as string || dados.clienteNome as string,
      contratanteCpfCnpj: dados.contratanteCpfCnpj as string || dados.clienteCpfCnpj as string,
      contratanteEndereco: dados.contratanteEndereco as string | undefined,
      contratanteCidade: dados.contratanteCidade as string | undefined,
      contratanteEstado: dados.contratanteEstado as string | undefined,

      contratadoNome: dados.contratadoNome as string || 'Minerva Engenharia',
      contratadoCnpj: dados.contratadoCnpj as string || '00.000.000/0000-00',
      contratadoEndereco: dados.contratadoEndereco as string | undefined,
      contratadoCidade: dados.contratadoCidade as string | undefined,
      contratadoEstado: dados.contratadoEstado as string | undefined,

      objetoContrato: dados.objetoContrato as string || 'Prestação de serviços conforme proposta comercial',
      valorContrato: Number(dados.valorContrato),
      formaPagamento: dados.formaPagamento as string | undefined,

      clausulas: dados.clausulas as Array<{
        numero: number;
        titulo: string;
        texto: string;
      }> | undefined,
    };

    // Renderizar template React para PDF
    const doc = React.createElement(ContratoTemplate, { data: contratoData });
    const pdfBuffer = await renderToBuffer(doc);

    // Convert buffer to Uint8Array
    const uint8Array = new Uint8Array(pdfBuffer);

    // Upload para Supabase Storage
    const uploadResult = await uploadPDFToStorage(
      supabase,
      uint8Array,
      osId,
      'contrato',
      {
        codigoOS: contratoData.codigoOS,
        numeroContrato: contratoData.numeroContrato,
        contratanteNome: contratoData.contratanteNome,
        valorContrato: contratoData.valorContrato,
        dataInicio: contratoData.dataInicio
      }
    );

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'contrato'
      }
    };
  } catch (error) {
    console.error('Error generating contrato PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar contrato'
    };
  }
}
