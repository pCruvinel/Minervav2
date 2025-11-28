/**
 * Utilitários para upload e gerenciamento de PDFs no Supabase Storage
 */

import { SupabaseClient } from '@supabase/supabase-js';
import { PDFType } from '../index.ts';

export interface UploadResult {
  url: string;
  path: string;
  filename: string;
  size: number;
}

/**
 * Faz upload de PDF para Supabase Storage e registra em os_documentos
 */
export async function uploadPDFToStorage(
  supabase: SupabaseClient,
  pdfBuffer: Uint8Array,
  osId: string,
  tipo: PDFType,
  metadata?: Record<string, unknown>
): Promise<UploadResult> {
  // Gerar nome do arquivo com timestamp
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${tipo}_${timestamp}.pdf`;
  const path = `os/${osId}/documentos/${tipo}/${filename}`;

  // Upload para Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from('uploads')
    .upload(path, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: false
    });

  if (uploadError) {
    console.error('Error uploading PDF:', uploadError);
    throw new Error(`Falha ao fazer upload do PDF: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('uploads')
    .getPublicUrl(path);

  const publicUrl = urlData.publicUrl;

  // Registrar documento na tabela os_documentos
  const { error: dbError } = await supabase
    .from('os_documentos')
    .insert({
      os_id: osId,
      nome: filename,
      tipo: tipo,
      caminho_arquivo: path,
      tamanho_bytes: pdfBuffer.length,
      mime_type: 'application/pdf',
      metadados: metadata || {},
      created_at: new Date().toISOString()
    });

  if (dbError) {
    console.error('Error saving document metadata:', dbError);
    // Não falha se não conseguir registrar no banco - PDF já foi upado
    console.warn('PDF uploaded but metadata not saved:', dbError.message);
  }

  return {
    url: publicUrl,
    path,
    filename,
    size: pdfBuffer.length
  };
}

/**
 * Obtém URL signed com expiração
 */
export async function getSignedUrl(
  supabase: SupabaseClient,
  path: string,
  expiresIn = 3600
): Promise<string> {
  const { data, error } = await supabase.storage
    .from('uploads')
    .createSignedUrl(path, expiresIn);

  if (error) {
    throw new Error(`Falha ao gerar URL signed: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Lista todos os documentos de uma OS
 */
export async function listDocumentosByOS(
  supabase: SupabaseClient,
  osId: string,
  tipo?: PDFType
): Promise<Array<{ nome: string; tipo: string; url: string; created_at: string }>> {
  let query = supabase
    .from('os_documentos')
    .select('nome, tipo, caminho_arquivo, created_at')
    .eq('os_id', osId)
    .order('created_at', { ascending: false });

  if (tipo) {
    query = query.eq('tipo', tipo);
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Falha ao listar documentos: ${error.message}`);
  }

  // Generate URLs for each document
  return (data || []).map((doc) => {
    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(doc.caminho_arquivo);

    return {
      nome: doc.nome,
      tipo: doc.tipo,
      url: urlData.publicUrl,
      created_at: doc.created_at
    };
  });
}

/**
 * Deleta um PDF do storage e do registro
 */
export async function deletePDF(
  supabase: SupabaseClient,
  path: string
): Promise<void> {
  // Delete from storage
  const { error: storageError } = await supabase.storage
    .from('uploads')
    .remove([path]);

  if (storageError) {
    throw new Error(`Falha ao deletar PDF: ${storageError.message}`);
  }

  // Delete from database
  const { error: dbError } = await supabase
    .from('os_documentos')
    .delete()
    .eq('caminho_arquivo', path);

  if (dbError) {
    console.warn('Failed to delete document metadata:', dbError.message);
  }
}
