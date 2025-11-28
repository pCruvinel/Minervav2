/**
 * Handler para geração de PDFs de Documentos SST
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { DocumentoSSTTemplate, type DocumentoSSTData } from '../templates/documento-sst-template.tsx';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handleDocumentoSSTGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    // Converter dados para o formato esperado
    const sstData: DocumentoSSTData = {
      codigoOS: dados.codigoOS as string,
      tipoDocumento: dados.tipoDocumento as string || 'Documento de Segurança do Trabalho',
      dataEmissao: dados.dataEmissao as string || new Date().toISOString(),
      clienteNome: dados.clienteNome as string,
      local: dados.local as string,
      responsavelTecnico: dados.responsavelTecnico as string | undefined,

      itens: dados.itens as Array<{
        categoria?: string;
        descricao: string;
        status?: 'conforme' | 'nao-conforme' | 'n/a';
        observacao?: string;
      }> || [],

      conclusao: dados.conclusao as string | undefined
    };

    // Renderizar template React para PDF
    const doc = React.createElement(DocumentoSSTTemplate, { data: sstData });
    const pdfBuffer = await renderToBuffer(doc);

    // Convert buffer to Uint8Array
    const uint8Array = new Uint8Array(pdfBuffer);

    // Upload para Supabase Storage
    const uploadResult = await uploadPDFToStorage(
      supabase,
      uint8Array,
      osId,
      'documento-sst',
      {
        codigoOS: sstData.codigoOS,
        tipoDocumento: sstData.tipoDocumento,
        clienteNome: sstData.clienteNome,
        local: sstData.local,
        dataEmissao: sstData.dataEmissao
      }
    );

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'documento-sst'
      }
    };
  } catch (error) {
    console.error('Error generating SST document PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar documento SST'
    };
  }
}
