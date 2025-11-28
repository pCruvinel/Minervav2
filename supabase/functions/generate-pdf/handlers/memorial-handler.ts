/**
 * Handler para geração de PDFs de Memoriais Descritivos
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { renderToBuffer } from '@react-pdf/renderer';
import React from 'react';
import { MemorialTemplate, type MemorialData } from '../templates/memorial-template.tsx';
import { uploadPDFToStorage } from '../utils/pdf-storage.ts';
import { PDFGenerationResponse } from '../index.ts';

export async function handleMemorialGeneration(
  supabase: SupabaseClient,
  osId: string,
  dados: Record<string, unknown>
): Promise<PDFGenerationResponse> {
  try {
    // Converter dados para o formato esperado
    const memorialData: MemorialData = {
      codigoOS: dados.codigoOS as string,
      titulo: dados.titulo as string || 'Memorial Descritivo',
      dataEmissao: dados.dataEmissao as string || new Date().toISOString(),
      clienteNome: dados.clienteNome as string,
      local: dados.local as string | undefined,

      secoes: dados.secoes as Array<{
        titulo: string;
        conteudo: string;
      }> || []
    };

    // Renderizar template React para PDF
    const doc = React.createElement(MemorialTemplate, { data: memorialData });
    const pdfBuffer = await renderToBuffer(doc);

    // Convert buffer to Uint8Array
    const uint8Array = new Uint8Array(pdfBuffer);

    // Upload para Supabase Storage
    const uploadResult = await uploadPDFToStorage(
      supabase,
      uint8Array,
      osId,
      'memorial',
      {
        codigoOS: memorialData.codigoOS,
        titulo: memorialData.titulo,
        clienteNome: memorialData.clienteNome,
        dataEmissao: memorialData.dataEmissao
      }
    );

    return {
      success: true,
      url: uploadResult.url,
      metadata: {
        filename: uploadResult.filename,
        size: uploadResult.size,
        tipo: 'memorial'
      }
    };
  } catch (error) {
    console.error('Error generating memorial PDF:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido ao gerar memorial'
    };
  }
}
