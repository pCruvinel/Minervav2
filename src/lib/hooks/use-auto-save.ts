import { useCallback, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  /** Tempo em ms antes de executar o auto-save (debounce) */
  debounceMs?: number;

  /** Se deve usar localStorage como fallback */
  useLocalStorage?: boolean;

  /** Chave para localStorage */
  storageKey?: string;

  /** Callback executado antes do save (para validação) */
  onBeforeSave?: (data: any) => Promise<boolean> | boolean;

  /** Callback executado após sucesso do save */
  onSaveSuccess?: (data: any) => void;

  /** Callback executado em caso de erro */
  onSaveError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  /** Marcar dados para auto-save */
  markDirty: (data: any) => void;

  /** Forçar save imediato */
  saveiNow: () => Promise<void>;

  /** Se está salvando no momento */
  isSaving: boolean;

  /** Se foi salvo com sucesso */
  isSaved: boolean;

  /** Última hora que salvou */
  lastSaveTime: Date | null;

  /** Limpar estado */
  reset: () => void;
}

/**
 * Hook para gerenciar auto-save de dados com debounce
 *
 * Fornece:
 * - Auto-save com debounce configurável
 * - Feedback visual (Salvando... / ✓ Salvo)
 * - Persistência em localStorage (fallback)
 * - Tratamento de erros
 *
 * @example
 * ```tsx
 * const { markDirty, isSaving, isSaved } = useAutoSave({
 *   debounceMs: 1000,
 *   onBeforeSave: async (data) => {
 *     // Validação
 *     return validateData(data);
 *   },
 *   onSaveSuccess: (data) => {
 *     console.log('Salvo:', data);
 *   },
 * });
 *
 * // Ao mudar um campo
 * <Input
 *   onChange={(e) => {
 *     setData({...data, field: e.target.value});
 *     markDirty({...data, field: e.target.value});
 *   }}
 * />
 *
 * // Indicador visual
 * {isSaving && <span>Salvando...</span>}
 * {isSaved && <span>✓ Salvo</span>}
 * ```
 */
export function useAutoSave(
  saveFunction: (data: any) => Promise<void>,
  options: UseAutoSaveOptions = {}
): UseAutoSaveReturn {
  const {
    debounceMs = 1000,
    useLocalStorage = true,
    storageKey = 'autoSave',
    onBeforeSave,
    onSaveSuccess,
    onSaveError,
  } = options;

  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pendingDataRef = useRef<any>(null);

  /**
   * Executar o save
   */
  const performSave = useCallback(
    async (data: any) => {
      try {
        setIsSaving(true);
        setIsSaved(false);

        // Executar callback de validação
        if (onBeforeSave) {
          const isValid = await onBeforeSave(data);
          if (!isValid) {
            console.warn('⚠️ Auto-save: Validação falhou');
            setIsSaving(false);
            return;
          }
        }

        // Executar save
        console.log('💾 Auto-saving...', data);
        await saveFunction(data);

        // Salvar em localStorage
        if (useLocalStorage && storageKey) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(data));
            console.log(`✅ Auto-saved to localStorage: ${storageKey}`);
          } catch (storageError) {
            console.warn('⚠️ Erro ao salvar em localStorage:', storageError);
          }
        }

        setIsSaved(true);
        setLastSaveTime(new Date());

        // Callback de sucesso
        if (onSaveSuccess) {
          onSaveSuccess(data);
        }

        console.log('✅ Auto-save concluído');

        // Mostrar "salvo" por 2 segundos
        setTimeout(() => {
          setIsSaved(false);
        }, 2000);
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        console.error('❌ Erro ao auto-salvar:', err);

        // Callback de erro
        if (onSaveError) {
          onSaveError(err);
        }

        // Tentar fallback em localStorage
        if (useLocalStorage && storageKey) {
          try {
            localStorage.setItem(`${storageKey}_draft`, JSON.stringify(pendingDataRef.current));
            console.log('✅ Rascunho salvo em localStorage (fallback)');
          } catch (storageError) {
            console.error('❌ Erro ao salvar rascunho em localStorage:', storageError);
          }
        }
      } finally {
        setIsSaving(false);
      }
    },
    [saveFunction, useLocalStorage, storageKey, onBeforeSave, onSaveSuccess, onSaveError]
  );

  /**
   * Marcar dados para auto-save (com debounce)
   */
  const markDirty = useCallback(
    (data: any) => {
      // Armazenar dados pendentes
      pendingDataRef.current = data;

      // Limpar timeout anterior
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Configurar novo timeout para debounce
      debounceTimerRef.current = setTimeout(() => {
        if (pendingDataRef.current) {
          performSave(pendingDataRef.current);
        }
      }, debounceMs);
    },
    [debounceMs, performSave]
  );

  /**
   * Forçar save imediato
   */
  const saveNow = useCallback(async () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (pendingDataRef.current) {
      await performSave(pendingDataRef.current);
    }
  }, [performSave]);

  /**
   * Limpar estado
   */
  const reset = useCallback(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setIsSaving(false);
    setIsSaved(false);
    setLastSaveTime(null);
    pendingDataRef.current = null;
  }, []);

  return {
    markDirty,
    saveiNow: saveNow,
    isSaving,
    isSaved,
    lastSaveTime,
    reset,
  };
}

/**
 * Hook para recuperar dados salvos em localStorage
 *
 * @param storageKey Chave do localStorage
 * @returns Dados recuperados ou null
 *
 * @example
 * ```tsx
 * const savedData = useLocalStorageData('autoSave');
 * useEffect(() => {
 *   if (savedData) {
 *     setFormData(savedData);
 *   }
 * }, []);
 * ```
 */
export function useLocalStorageData(storageKey: string): any | null {
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.warn(`⚠️ Erro ao recuperar ${storageKey} do localStorage:`, error);
  }
  return null;
}

/**
 * Hook para limpar dados de localStorage
 *
 * @example
 * ```tsx
 * const clearSaved = useClearLocalStorage();
 * const handleNewForm = () => {
 *   clearSaved('autoSave');
 * };
 * ```
 */
export function useClearLocalStorage() {
  return useCallback((storageKey: string) => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_draft`);
      console.log(`✅ Dados limpos do localStorage: ${storageKey}`);
    } catch (error) {
      console.error(`❌ Erro ao limpar ${storageKey} do localStorage:`, error);
    }
  }, []);
}
