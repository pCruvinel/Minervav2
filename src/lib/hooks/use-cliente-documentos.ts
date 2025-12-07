/**
 * Hook para gerenciamento de documentos do cliente
 *
 * Busca documentos da tabela clientes_documentos
 *
 * @example
 * ```tsx
 * const { documentos, isLoading, uploadDocumento } = useClienteDocumentos(clienteId);
 * ```
 */

import { supabase } from '@/lib/supabase-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logger } from '@/lib/utils/logger';

// ===========================================
// TIPOS E INTERFACES
// ===========================================

export type TipoDocumento = 'contrato_social' | 'comprovante_residencia' | 'documento_foto' | 'logo_cliente';

export interface ClienteDocumento {
  id: string;
  cliente_id: string;
  tipo_documento: TipoDocumento;
  nome_arquivo: string;
  caminho_storage: string;
  mime_type?: string;
  tamanho_bytes?: number;
  uploaded_at: string;
  uploaded_by?: string;
}

export const TIPO_DOCUMENTO_LABELS: Record<TipoDocumento, string> = {
  contrato_social: 'Contrato Social',
  comprovante_residencia: 'Comprovante de Residência',
  documento_foto: 'Documento com Foto',
  logo_cliente: 'Logo do Cliente',
};

export const TIPO_DOCUMENTO_ICONS: Record<TipoDocumento, string> = {
  contrato_social: '📄',
  comprovante_residencia: '🏠',
  documento_foto: '🪪',
  logo_cliente: '🖼️',
};

// ===========================================
// QUERIES
// ===========================================

const fetchClienteDocumentos = async (clienteId: string): Promise<ClienteDocumento[]> => {
  logger.log('📁 Buscando documentos do cliente:', clienteId);

  const { data, error } = await supabase
    .from('clientes_documentos')
    .select('*')
    .eq('cliente_id', clienteId)
    .order('uploaded_at', { ascending: false });

  if (error) {
    logger.error('❌ Erro ao buscar documentos:', error);
    throw error;
  }

  return data || [];
};

// ===========================================
// HOOK PRINCIPAL
// ===========================================

export function useClienteDocumentos(clienteId: string) {
  const queryClient = useQueryClient();

  // Query para documentos
  const documentosQuery = useQuery({
    queryKey: ['cliente-documentos', clienteId],
    queryFn: () => fetchClienteDocumentos(clienteId),
    staleTime: 5 * 60 * 1000, // 5 minutos
    enabled: !!clienteId,
  });

  // Mutation para upload de documento
  const uploadMutation = useMutation({
    mutationFn: async ({ file, tipo }: { file: File; tipo: TipoDocumento }) => {
      // 1. Upload para o Storage
      const fileName = `${clienteId}/${tipo}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // 2. Registrar no banco
      const { data, error } = await supabase
        .from('clientes_documentos')
        .insert({
          cliente_id: clienteId,
          tipo_documento: tipo,
          nome_arquivo: file.name,
          caminho_storage: fileName,
          mime_type: file.type,
          tamanho_bytes: file.size,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-documentos', clienteId] });
    },
  });

  // Mutation para deletar documento
  const deleteMutation = useMutation({
    mutationFn: async (documentoId: string) => {
      // Buscar documento para pegar o caminho
      const doc = documentosQuery.data?.find(d => d.id === documentoId);
      if (!doc) throw new Error('Documento não encontrado');

      // 1. Deletar do Storage
      await supabase.storage.from('uploads').remove([doc.caminho_storage]);

      // 2. Deletar do banco
      const { error } = await supabase
        .from('clientes_documentos')
        .delete()
        .eq('id', documentoId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cliente-documentos', clienteId] });
    },
  });

  // Função para obter URL pública do documento
  const getDocumentoUrl = (caminho: string) => {
    const { data } = supabase.storage.from('uploads').getPublicUrl(caminho);
    return data.publicUrl;
  };

  // Formatação de tamanho
  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '-';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return {
    // Dados
    documentos: documentosQuery.data || [],
    
    // Estado
    isLoading: documentosQuery.isLoading,
    error: documentosQuery.error,
    isUploading: uploadMutation.isPending,
    isDeleting: deleteMutation.isPending,

    // Ações
    uploadDocumento: uploadMutation.mutateAsync,
    deleteDocumento: deleteMutation.mutateAsync,
    getDocumentoUrl,
    formatFileSize,
    refetch: documentosQuery.refetch,
  };
}
