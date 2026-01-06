/**
 * uploadAndRegisterDocument - Helper centralizado para upload de documentos
 * 
 * Faz upload para Supabase Storage (bucket 'os-documents') e registra na tabela os_documentos.
 * Usado pelos steps de workflow para garantir que todos os documentos estejam centralizados.
 * 
 * @example
 * ```tsx
 * const { url, documentoId } = await uploadAndRegisterDocument({
 *   osId: '123',
 *   file: selectedFile,
 *   tipoDocumento: 'contrato',
 *   descricao: 'Contrato assinado'
 * });
 * ```
 */

import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';

export type VisibilidadeDocumento = 'interno' | 'publico' | 'cliente';

export interface UploadAndRegisterParams {
  /** ID da OS (obrigatório) */
  osId: string;
  /** ID da etapa (opcional, para rastreabilidade) */
  etapaId?: string;
  /** Arquivo a ser uploadado */
  file: File;
  /** Tipo do documento (ex: 'contrato', 'proposta', 'ART', 'foto') */
  tipoDocumento: string;
  /** Descrição opcional */
  descricao?: string;
  /** Visibilidade do documento */
  visibilidade?: VisibilidadeDocumento;
  /** Metadados adicionais */
  metadata?: Record<string, unknown>;
}

export interface UploadResult {
  /** URL pública do arquivo */
  url: string;
  /** ID do registro em os_documentos */
  documentoId: string;
  /** Caminho no storage */
  path: string;
}

/**
 * Faz upload de um arquivo e registra na tabela os_documentos
 */
export async function uploadAndRegisterDocument({
  osId,
  etapaId,
  file,
  tipoDocumento,
  descricao,
  visibilidade = 'interno',
  metadata = {}
}: UploadAndRegisterParams): Promise<UploadResult> {
  if (!osId) {
    throw new Error('osId é obrigatório para fazer upload de documentos');
  }

  try {
    // 1. Gerar path único do arquivo
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${tipoDocumento}_${timestamp}_${sanitizedFilename}`;
    const path = `os/${osId}/documentos/${tipoDocumento}/${filename}`;

    // 2. Upload para Supabase Storage (bucket: os-documents)
    const { error: uploadError } = await supabase.storage
      .from('os-documents')
      .upload(path, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      logger.error('Erro no upload:', uploadError);
      throw new Error(`Falha ao fazer upload: ${uploadError.message}`);
    }

    // 3. Obter URL pública
    const { data: urlData } = supabase.storage
      .from('os-documents')
      .getPublicUrl(path);

    const publicUrl = urlData.publicUrl;

    // 4. Obter ID do usuário atual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      // Tentar deletar arquivo uploadado se não conseguir autenticar
      await supabase.storage.from('os-documents').remove([path]);
      throw new Error('Usuário não autenticado');
    }

    // 5. Verificar se documento já existe (evitar duplicatas)
    const { data: existingDoc } = await supabase
      .from('os_documentos')
      .select('id')
      .eq('os_id', osId)
      .eq('caminho_arquivo', path)
      .maybeSingle();

    if (existingDoc) {
      // Documento já existe, retornar sem criar duplicata
      logger.log('Documento já existe, retornando existente:', existingDoc.id);
      return {
        url: publicUrl,
        documentoId: existingDoc.id,
        path
      };
    }

    // 6. Registrar documento no banco
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
        descricao: descricao || null,
        visibilidade: visibilidade,
        uploaded_by: user.id
      })
      .select('id')
      .single();

    if (dbError) {
      logger.error('Erro ao salvar metadados:', dbError);
      // Tentar deletar arquivo uploadado em caso de erro no banco
      await supabase.storage.from('os-documents').remove([path]);
      throw new Error(`Falha ao registrar documento: ${dbError.message}`);
    }

    logger.log('✅ Documento registrado com sucesso:', documento.id);

    return {
      url: publicUrl,
      documentoId: documento.id,
      path
    };

  } catch (error) {
    logger.error('Erro no upload/registro de documento:', error);
    throw error;
  }
}

/**
 * Deleta um documento do storage e do banco
 */
export async function deleteRegisteredDocument(documentoId: string): Promise<void> {
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
      logger.warn('Erro ao deletar do storage:', storageError);
      // Continua para deletar do banco mesmo assim
    }

    // 3. Deletar do banco
    const { error: dbError } = await supabase
      .from('os_documentos')
      .delete()
      .eq('id', documentoId);

    if (dbError) {
      throw new Error(`Falha ao deletar documento: ${dbError.message}`);
    }

    logger.log('✅ Documento deletado com sucesso:', documentoId);

  } catch (error) {
    logger.error('Erro ao deletar documento:', error);
    throw error;
  }
}
