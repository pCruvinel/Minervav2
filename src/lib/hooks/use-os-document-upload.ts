import { useState } from 'react';
import { supabase } from '../supabase-client';

export interface OSDocumento {
  id: string;
  os_id: string;
  etapa_id?: string;
  nome: string;
  tipo: string;
  caminho_arquivo: string;
  tamanho_bytes: number;
  mime_type: string;
  metadados?: Record<string, unknown>;
  uploaded_by: string;
  criado_em: string;
  url?: string;
}

export interface UploadDocumentoParams {
  file: File;
  tipoDocumento: string;
  etapaId?: string;
  metadata?: Record<string, unknown>;
  descricao?: string; // Descrição/observação do documento
}

/**
 * Hook para upload e gerenciamento de documentos de OS no Supabase
 * 
 * @param osId - ID da ordem de serviço
 * @returns Funções e estados para gerenciar uploads
 * 
 * @example
 * ```tsx
 * const { uploadDocument, deleteDocument, isUploading } = useOSDocumentUpload(osId);
 * 
 * const handleUpload = async (file: File) => {
 *   const doc = await uploadDocument({
 *     file,
 *     tipoDocumento: 'ART',
 *     etapaId: '123'
 *   });
 * };
 * ```
 */
export function useOSDocumentUpload(osId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  /**
   * Faz upload de um documento para o storage e registra no banco
   */
  const uploadDocument = async ({
    file,
    tipoDocumento,
    etapaId,
    metadata = {},
    descricao
  }: UploadDocumentoParams): Promise<OSDocumento> => {
    if (!osId) {
      throw new Error('osId é obrigatório para fazer upload de documentos');
    }

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // 1. Gerar path do arquivo
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${tipoDocumento}_${timestamp}_${sanitizedFilename}`;
      const path = `os/${osId}/documentos/${tipoDocumento}/${filename}`;

      setUploadProgress(20);

      // 2. Upload para Supabase Storage (bucket: os-documents)
      const { error: uploadError } = await supabase.storage
        .from('os-documents')
        .upload(path, file, {
          contentType: file.type,
          upsert: false
        });

      if (uploadError) {
        console.error('Erro no upload:', uploadError);
        throw new Error(`Falha ao fazer upload: ${uploadError.message}`);
      }

      setUploadProgress(60);

      // 3. Obter URL pública
      const { data: urlData } = supabase.storage
        .from('os-documents')
        .getPublicUrl(path);

      setUploadProgress(80);

      // 4. Obter ID do usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Usuário não autenticado');
      }

      // 5. Registrar documento no banco
      const { data: documento, error: dbError } = await supabase
        .from('os_documentos')
        .insert({
          os_id: osId,
          etapa_id: etapaId || null,
          nome: file.name,
          tipo: tipoDocumento,
          caminho_arquivo: path,
          tamanho_bytes: file.size,
          mime_type: file.type,
          metadados: metadata,
          descricao: descricao || null, // Salvar descrição na coluna correta
          uploaded_by: user.id
        })
        .select()
        .single();

      if (dbError) {
        console.error('Erro ao salvar metadados:', dbError);
        // Tentar deletar arquivo upado
        await supabase.storage.from('uploads').remove([path]);
        throw new Error(`Falha ao registrar documento: ${dbError.message}`);
      }

      setUploadProgress(100);
      
      return {
        ...documento,
        url: urlData.publicUrl
      } as OSDocumento;

    } catch (error) {
      console.error('Erro no upload de documento:', error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  /**
   * Deleta um documento do storage e do banco
   */
  const deleteDocument = async (documentoId: string): Promise<void> => {
    try {
      // 1. Buscar documento para pegar caminho
      const { data: documento, error: fetchError } = await supabase
        .from('os_documentos')
        .select('caminho_arquivo')
        .eq('id', documentoId)
        .single();

      if (fetchError || !documento) {
        throw new Error('Documento não encontrado');
      }

      // 2. Deletar do storage
      const { error: storageError } = await supabase.storage
        .from('os-documents')
        .remove([documento.caminho_arquivo]);

      if (storageError) {
        console.warn('Erro ao deletar do storage:', storageError);
      }

      // 3. Deletar do banco
      const { error: dbError } = await supabase
        .from('os_documentos')
        .delete()
        .eq('id', documentoId);

      if (dbError) {
        throw new Error(`Falha ao deletar documento: ${dbError.message}`);
      }

    } catch (error) {
      console.error('Erro ao deletar documento:', error);
      throw error;
    }
  };

  /**
   * Lista todos os documentos de uma OS
   */
  const listDocuments = async (tipoDocumento?: string): Promise<OSDocumento[]> => {
    let query = supabase
      .from('os_documentos')
      .select('*')
      .eq('os_id', osId)
      .order('criado_em', { ascending: false });

    if (tipoDocumento) {
      query = query.eq('tipo', tipoDocumento);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Falha ao listar documentos: ${error.message}`);
    }

    return (data || []) as OSDocumento[];
  };

  return {
    uploadDocument,
    deleteDocument,
    listDocuments,
    isUploading,
    uploadProgress
  };
}
