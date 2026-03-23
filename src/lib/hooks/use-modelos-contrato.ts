/**
 * use-modelos-contrato.ts
 *
 * Hook for managing contract template files per OS type.
 * One file upload per tipo_os, stored in Supabase Storage (`os-documents` bucket).
 */
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

export interface ModeloContrato {
  id: string;
  tipo_os_id: string;
  arquivo_path: string | null;
  arquivo_nome: string | null;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

interface TipoOs {
  id: string;
  codigo: string;
  nome: string;
}

interface UseModelosContratoReturn {
  tiposOs: TipoOs[];
  modelo: ModeloContrato | null;
  isLoading: boolean;
  isSaving: boolean;
  fetchModelo: (tipoOsId: string) => Promise<void>;
  uploadArquivo: (tipoOsId: string, file: File) => Promise<boolean>;
  deleteModelo: (tipoOsId: string) => Promise<boolean>;
  getDownloadUrl: (arquivoPath: string) => Promise<string | null>;
}

// ============================================================
// HOOK
// ============================================================

export function useModelosContrato(initialTipoOsId?: string): UseModelosContratoReturn {
  const [tiposOs, setTiposOs] = useState<TipoOs[]>([]);
  const [modelo, setModelo] = useState<ModeloContrato | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load OS types once
  useEffect(() => {
    const loadTipos = async () => {
      const { data, error } = await supabase
        .from('tipos_os')
        .select('id, codigo, nome')
        .order('codigo');

      if (error) {
        logger.error('[useModelosContrato] Error loading tipos_os:', error);
        return;
      }

      setTiposOs(data || []);
    };

    loadTipos();
  }, []);

  // Fetch template for a specific OS type
  const fetchModelo = useCallback(async (tipoOsId: string) => {
    if (!tipoOsId) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('modelos_contrato')
        .select('*')
        .eq('tipo_os_id', tipoOsId)
        .maybeSingle();

      if (error) {
        logger.error('[useModelosContrato] Error fetching modelo:', error);
        setModelo(null);
        return;
      }

      setModelo(data as ModeloContrato | null);
    } catch (err) {
      logger.error('[useModelosContrato] Unexpected error:', err);
      setModelo(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Auto-fetch when initialTipoOsId is provided
  useEffect(() => {
    if (initialTipoOsId) {
      fetchModelo(initialTipoOsId);
    }
  }, [initialTipoOsId, fetchModelo]);

  // Upload file and upsert record
  const uploadArquivo = useCallback(
    async (tipoOsId: string, file: File): Promise<boolean> => {
      setIsSaving(true);
      try {
        // Build storage path
        const ext = file.name.split('.').pop() || 'pdf';
        const storagePath = `modelos-contrato/${tipoOsId}/template.${ext}`;

        // Upload to storage (overwrite if exists)
        const { error: uploadError } = await supabase.storage
          .from('os-documents')
          .upload(storagePath, file, { upsert: true });

        if (uploadError) {
          logger.error('[useModelosContrato] Upload error:', uploadError);
          toast.error('Erro ao fazer upload do arquivo');
          return false;
        }

        // Upsert DB record
        const { error: dbError } = await supabase
          .from('modelos_contrato')
          .upsert(
            {
              tipo_os_id: tipoOsId,
              arquivo_path: storagePath,
              arquivo_nome: file.name,
              ativo: true,
            },
            { onConflict: 'tipo_os_id' }
          );

        if (dbError) {
          logger.error('[useModelosContrato] DB error:', dbError);
          toast.error('Erro ao salvar registro do modelo');
          return false;
        }

        toast.success('Modelo de contrato salvo com sucesso');
        await fetchModelo(tipoOsId);
        return true;
      } catch (err) {
        logger.error('[useModelosContrato] Unexpected upload error:', err);
        toast.error('Erro inesperado ao salvar');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [fetchModelo]
  );

  // Delete template (file + record)
  const deleteModelo = useCallback(
    async (tipoOsId: string): Promise<boolean> => {
      setIsSaving(true);
      try {
        // First get the record to know the storage path
        if (modelo?.arquivo_path) {
          await supabase.storage
            .from('os-documents')
            .remove([modelo.arquivo_path]);
        }

        const { error } = await supabase
          .from('modelos_contrato')
          .delete()
          .eq('tipo_os_id', tipoOsId);

        if (error) {
          logger.error('[useModelosContrato] Error deleting:', error);
          toast.error('Erro ao remover modelo');
          return false;
        }

        setModelo(null);
        toast.success('Modelo removido com sucesso');
        return true;
      } catch (err) {
        logger.error('[useModelosContrato] Unexpected delete error:', err);
        toast.error('Erro inesperado');
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [modelo]
  );

  // Get a signed download URL
  const getDownloadUrl = useCallback(async (arquivoPath: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('os-documents')
        .createSignedUrl(arquivoPath, 3600); // 1 hour

      if (error) {
        logger.error('[useModelosContrato] Error creating signed URL:', error);
        return null;
      }

      return data?.signedUrl || null;
    } catch (err) {
      logger.error('[useModelosContrato] Unexpected URL error:', err);
      return null;
    }
  }, []);

  return {
    tiposOs,
    modelo,
    isLoading,
    isSaving,
    fetchModelo,
    uploadArquivo,
    deleteModelo,
    getDownloadUrl,
  };
}
