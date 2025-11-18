import React, { useEffect, useState } from 'react';
import { Check, Loader2, AlertCircle, Clock } from 'lucide-react';
import { cn } from './utils';

interface AutoSaveStatusProps {
  /** Se está salvando */
  isSaving?: boolean;

  /** Se foi salvo com sucesso */
  isSaved?: boolean;

  /** Última hora que salvou */
  lastSaveTime?: Date | null;

  /** Se há erro */
  hasError?: boolean;

  /** Classes CSS adicionais */
  className?: string;

  /** Mensagem customizada para "salvando" */
  savingMessage?: string;

  /** Mensagem customizada para "salvo" */
  savedMessage?: string;

  /** Mensagem customizada para "erro" */
  errorMessage?: string;

  /** Posição do componente */
  position?: 'inline' | 'fixed';
}

/**
 * Componente para exibir status do auto-save
 *
 * Exibe animação de "Salvando..." → "✓ Salvo" com feedback visual
 *
 * @example
 * ```tsx
 * <AutoSaveStatus
 *   isSaving={isSaving}
 *   isSaved={isSaved}
 *   lastSaveTime={lastSaveTime}
 * />
 * ```
 */
export function AutoSaveStatus({
  isSaving = false,
  isSaved = false,
  lastSaveTime = null,
  hasError = false,
  className,
  savingMessage = 'Salvando...',
  savedMessage = '✓ Salvo',
  errorMessage = 'Erro ao salvar',
  position = 'inline',
}: AutoSaveStatusProps) {
  const [isVisible, setIsVisible] = useState(false);

  // Mostrar/ocultar baseado nos estados
  useEffect(() => {
    if (isSaving || isSaved || hasError) {
      setIsVisible(true);

      // Auto-ocultar após 3 segundos se não estiver salvando
      if (!isSaving) {
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }
  }, [isSaving, isSaved, hasError]);

  if (!isVisible) {
    return null;
  }

  // Determinar conteúdo baseado no estado
  let icon = null;
  let text = '';
  let colorClass = '';

  if (hasError) {
    icon = <AlertCircle className="h-4 w-4" />;
    text = errorMessage;
    colorClass = 'text-red-600 bg-red-50 border-red-200';
  } else if (isSaving) {
    icon = <Loader2 className="h-4 w-4 animate-spin" />;
    text = savingMessage;
    colorClass = 'text-blue-600 bg-blue-50 border-blue-200';
  } else if (isSaved) {
    icon = <Check className="h-4 w-4" />;
    text = savedMessage;
    colorClass = 'text-green-600 bg-green-50 border-green-200';
  } else if (lastSaveTime) {
    icon = <Clock className="h-4 w-4" />;
    text = `Salvo às ${lastSaveTime.toLocaleTimeString('pt-BR')}`;
    colorClass = 'text-gray-600 bg-gray-50 border-gray-200';
  }

  const positionClass =
    position === 'fixed'
      ? 'fixed bottom-4 right-4 z-50'
      : 'inline-flex';

  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-md border text-sm font-medium transition-all duration-300',
        colorClass,
        positionClass,
        className
      )}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {icon}
      <span>{text}</span>
    </div>
  );
}

/**
 * Variante compacta do AutoSaveStatus (apenas ícone)
 */
export function AutoSaveStatusCompact({
  isSaving = false,
  isSaved = false,
  hasError = false,
  className,
}: Omit<AutoSaveStatusProps, 'position'>) {
  if (!isSaving && !isSaved && !hasError) {
    return null;
  }

  let icon = null;
  let colorClass = '';
  let title = '';

  if (hasError) {
    icon = <AlertCircle className="h-4 w-4" />;
    colorClass = 'text-red-600';
    title = 'Erro ao salvar';
  } else if (isSaving) {
    icon = <Loader2 className="h-4 w-4 animate-spin" />;
    colorClass = 'text-blue-600';
    title = 'Salvando...';
  } else if (isSaved) {
    icon = <Check className="h-4 w-4" />;
    colorClass = 'text-green-600';
    title = 'Salvo com sucesso';
  }

  return (
    <div
      className={cn('inline-flex items-center', colorClass, className)}
      title={title}
      role="status"
      aria-live="polite"
    >
      {icon}
    </div>
  );
}

/**
 * Componente de barra de progresso para auto-save
 *
 * Mostra um indicador visual enquanto está salvando
 */
export function AutoSaveProgressBar({
  isSaving = false,
  className,
}: {
  isSaving?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('h-1 w-full bg-gray-200 overflow-hidden', className)}>
      {isSaving && (
        <div
          className="h-full bg-gradient-to-r from-blue-400 to-blue-600 animate-pulse"
          style={{
            width: '100%',
            animation: 'slideInOut 2s infinite',
          }}
        />
      )}
      <style>{`
        @keyframes slideInOut {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
