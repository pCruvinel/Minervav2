/**
 * Hook para gerenciamento de documentos de clientes
 *
 * Faz upload de documentos para o Supabase Storage e registra
 * na tabela clientes_documentos
 *
 * Tipos de documentos suportados:
 * - contrato_social: Contrato Social / Ata de Eleição
 * - comprovante_residencia: Comprovante de Residência
 * - documento_foto: RG/CNH (Pessoa Física)
 * - logo_cliente: Logotipo do Cliente
 *
 * @example
 * ```tsx
 * const { uploadDocumentos, loading } = useClienteDocumentos();
 *
 * await uploadDocumentos(
 *   clienteId,
 *   'documento_foto',
 *   [file1, file2],
 *   uploadedById
 * );
 * ```
 */

import { supabase } from '@/lib/supabase-client';
import { useState } from 'react';
import { logger } from '@/lib/utils/logger';
import { FileWithComment } from '@/components/ui/file-upload-unificado';

export type TipoDocumentoCliente =
  | 'contrato_social'
  | 'comprovante_residencia'
  | 'documento_foto'
  | 'logo_cliente';

export function useClienteDocumentos() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Faz upload de documentos do cliente para o Storage e registra no banco
   *
   * @param clienteId - ID do cliente
   * @param tipoDocumento - Tipo do documento
   * @param files - Array de arquivos a serem enviados
   * @param uploadedBy - ID do usuário que está fazendo o upload
   * @throws Error se o upload falhar
   */
  const uploadDocumentos = async (
    clienteId: string,
    tipoDocumento: TipoDocumentoCliente,
    files: FileWithComment[],
    uploadedBy: string
  ): Promise<void> => {
    if (files.length === 0) {
      logger.log(`⏭️ Nenhum arquivo para upload (tipo: ${tipoDocumento})`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.log(`📤 Fazendo upload de ${files.length} documento(s)...`, {
        clienteId,
        tipoDocumento,
        fileCount: files.length
      });

      // Upload paralelo de todos os arquivos
      const uploads = files.map(async (file) => {
        // 1. Upload para Storage (bucket: uploads)
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('uploads')
          .upload(file.path, file);

        if (uploadError) {
          logger.error(`❌ Erro no upload do arquivo ${file.name}:`, uploadError);
          throw uploadError;
        }

        logger.log(`✅ Arquivo ${file.name} enviado para Storage`);

        // 2. Registrar em clientes_documentos
        const { error: dbError } = await supabase
          .from('clientes_documentos')
          .insert({
            cliente_id: clienteId,
            tipo_documento: tipoDocumento,
            nome_arquivo: file.name,
            caminho_storage: file.path,
            mime_type: file.type,
            tamanho_bytes: file.size,
            uploaded_by: uploadedBy
          });

        if (dbError) {
          logger.error(`❌ Erro ao registrar documento ${file.name}:`, dbError);
          throw dbError;
        }

        logger.log(`✅ Documento ${file.name} registrado no banco`);
      });

      await Promise.all(uploads);

      logger.log(`✅ Upload completo: ${files.length} documento(s) processado(s)`);
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error('❌ Falha no upload de documentos:', errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca documentos de um cliente por tipo
   *
   * @param clienteId - ID do cliente
   * @param tipoDocumento - Tipo do documento (opcional)
   * @returns Array de documentos
   */
  const getDocumentos = async (
    clienteId: string,
    tipoDocumento?: TipoDocumentoCliente
  ) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('clientes_documentos')
        .select('*')
        .eq('cliente_id', clienteId)
        .order('uploaded_at', { ascending: false });

      if (tipoDocumento) {
        query = query.eq('tipo_documento', tipoDocumento);
      }

      const { data, error: queryError } = await query;

      if (queryError) throw queryError;

      return data || [];
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error(String(err));
      setError(errorObj);
      logger.error('❌ Erro ao buscar documentos:', errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadDocumentos,
    getDocumentos,
    loading,
    error
  };
}
