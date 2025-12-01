"use client";

import { logger } from '@/lib/utils/logger';
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import { cn } from '../ui/utils';

/**
 * Props para o componente EtapaFilter
 */
interface EtapaFilterProps {
  /** Número total de etapas */
  totalSteps?: number;

  /** Etapas selecionadas (números) */
  selectedEtapas?: number[];

  /** Callback ao mudar seleção */
  onFilterChange?: (selectedEtapas: number[]) => void;

  /** Se deve usar localStorage para persistir filtro */
  useLocalStorage?: boolean;

  /** Chave do localStorage */
  storageKey?: string;

  /** Classes CSS adicionais */
  className?: string;

  /** Se deve exibir em modo compacto (sem card) */
  compact?: boolean;
}

/**
 * Componente para filtrar lista de OS por etapa
 *
 * Permite selecionar múltiplas etapas para filtrar a tabela
 * Os filtros são persistidos em localStorage
 *
 * @example
 * ```tsx
 * const [selectedEtapas, setSelectedEtapas] = useState<number[]>([]);
 *
 * <EtapaFilter
 *   totalSteps={15}
 *   selectedEtapas={selectedEtapas}
 *   onFilterChange={setSelectedEtapas}
 * />
 * ```
 */
export function EtapaFilter({
  totalSteps = 15,
  selectedEtapas = [],
  onFilterChange,
  useLocalStorage = true,
  storageKey = 'os_etapa_filter',
  className,
  compact = false,
}: EtapaFilterProps) {
  const [internalSelected, setInternalSelected] = useState<number[]>(selectedEtapas);
  const [isOpen, setIsOpen] = useState(false);

  // Recuperar filtro do localStorage ao montar
  useEffect(() => {
    if (useLocalStorage) {
      try {
        const stored = localStorage.getItem(storageKey);
        if (stored) {
          const parsed = JSON.parse(stored) as number[];
          setInternalSelected(parsed);
          onFilterChange?.(parsed);
          logger.log('📁 Filtro de etapas recuperado:', parsed);
        }
      } catch (error) {
        logger.warn('⚠️ Erro ao recuperar filtro do localStorage:', error);
      }
    }
  }, [useLocalStorage, storageKey, onFilterChange]);

  // Atualizar quando props mudam
  useEffect(() => {
    if (selectedEtapas.length > 0 && JSON.stringify(selectedEtapas) !== JSON.stringify(internalSelected)) {
      setInternalSelected(selectedEtapas);
    }
  }, [selectedEtapas]);

  /**
   * Toggle seleção de etapa
   */
  const toggleEtapa = useCallback(
    (etapaNum: number) => {
      setInternalSelected((prev) => {
        const isSelected = prev.includes(etapaNum);
        const updated = isSelected
          ? prev.filter((e) => e !== etapaNum)
          : [...prev, etapaNum].sort((a, b) => a - b);

        // Persistir em localStorage
        if (useLocalStorage) {
          try {
            localStorage.setItem(storageKey, JSON.stringify(updated));
            logger.log('💾 Filtro de etapas salvo:', updated);
          } catch (error) {
            logger.warn('⚠️ Erro ao salvar filtro no localStorage:', error);
          }
        }

        // Chamar callback
        onFilterChange?.(updated);

        return updated;
      });
    },
    [useLocalStorage, storageKey, onFilterChange]
  );

  /**
   * Selecionar todas as etapas
   */
  const selectAll = useCallback(() => {
    const allEtapas = Array.from({ length: totalSteps }, (_, i) => i + 1);
    setInternalSelected(allEtapas);

    if (useLocalStorage) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(allEtapas));
      } catch (error) {
        logger.warn('⚠️ Erro ao salvar filtro no localStorage:', error);
      }
    }

    onFilterChange?.(allEtapas);
  }, [totalSteps, useLocalStorage, storageKey, onFilterChange]);

  /**
   * Desselecionar todas as etapas
   */
  const clearAll = useCallback(() => {
    setInternalSelected([]);

    if (useLocalStorage) {
      try {
        localStorage.removeItem(storageKey);
      } catch (error) {
        logger.warn('⚠️ Erro ao limpar filtro do localStorage:', error);
      }
    }

    onFilterChange?.([]);
  }, [useLocalStorage, storageKey, onFilterChange]);

  // Modo compacto (apenas badges inline)
  if (compact) {
    return (
      <div className={cn('flex flex-wrap gap-2', className)}>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((etapaNum) => (
          <Badge
            key={etapaNum}
            variant={internalSelected.includes(etapaNum) ? 'default' : 'outline'}
            className="cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => toggleEtapa(etapaNum)}
            title={`Filtrar etapa ${etapaNum}`}
          >
            E{etapaNum}
            {internalSelected.includes(etapaNum) && (
              <X className="ml-1 h-3 w-3" />
            )}
          </Badge>
        ))}
      </div>
    );
  }

  // Modo card normal
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            <CardTitle className="text-base">Filtrar por Etapa</CardTitle>
          </div>

          <div className="flex gap-2">
            {internalSelected.length > 0 && (
              <Badge variant="secondary" className="cursor-pointer hover:opacity-80" onClick={clearAll}>
                {internalSelected.length} selecionada{internalSelected.length !== 1 ? 's' : ''}
                <X className="ml-1 h-3 w-3" />
              </Badge>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="px-2"
            >
              {isOpen ? 'Fechar' : 'Abrir'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="pb-4">
          {/* Botões de ação */}
          <div className="flex gap-2 mb-4">
            <Button size="sm" variant="outline" onClick={selectAll}>
              Selecionar Todas
            </Button>
            <Button size="sm" variant="outline" onClick={clearAll}>
              Limpar
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                // Toggle: se tem seleção, limpa; se vazio, seleciona todas
                if (internalSelected.length > 0) {
                  clearAll();
                } else {
                  selectAll();
                }
              }}
              className="gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Inverter
            </Button>
          </div>

          {/* Grid de etapas */}
          <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-15">
            {Array.from({ length: totalSteps }, (_, i) => i + 1).map((etapaNum) => {
              const isSelected = internalSelected.includes(etapaNum);

              return (
                <button
                  key={etapaNum}
                  onClick={() => toggleEtapa(etapaNum)}
                  className={cn(
                    'flex items-center justify-center h-8 rounded-md font-medium text-sm transition-all',
                    'border-2 cursor-pointer hover:opacity-80',
                    isSelected
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-white text-foreground border-border hover:border-primary'
                  )}
                  title={`Etapa ${etapaNum}`}
                >
                  E{etapaNum}
                </button>
              );
            })}
          </div>

          {/* Info de seleção */}
          {internalSelected.length > 0 && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Mostrando: {internalSelected.length} etapa{internalSelected.length !== 1 ? 's' : ''}
                {' - '}
                <span className="font-mono text-xs">
                  {internalSelected.join(', ')}
                </span>
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}

/**
 * Hook para gerenciar estado do filtro de etapas
 */
export function useEtapaFilter(storageKey = 'os_etapa_filter') {
  const [selectedEtapas, setSelectedEtapas] = React.useState<number[]>([]);
  const [isLoaded, setIsLoaded] = React.useState(false);

  // Carregar do localStorage ao montar
  React.useEffect(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        setSelectedEtapas(JSON.parse(stored) as number[]);
      }
    } catch (error) {
      logger.warn('⚠️ Erro ao carregar filtro:', error);
    } finally {
      setIsLoaded(true);
    }
  }, [storageKey]);

  /**
   * Aplicar filtro à lista de OS
   */
  const filterOS = React.useCallback(
    (ordensServico: any[]) => {
      if (selectedEtapas.length === 0) {
        return ordensServico; // Sem filtro = mostrar todas
      }

      return ordensServico.filter((os) => {
        // Verificar se etapa atual está na lista de filtro
        return selectedEtapas.includes(os.etapaAtual?.numero);
      });
    },
    [selectedEtapas]
  );

  return {
    selectedEtapas,
    setSelectedEtapas,
    filterOS,
    isLoaded,
  };
}
