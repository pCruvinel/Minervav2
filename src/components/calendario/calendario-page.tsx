import { useState } from 'react';
import { CalendarioSemanaCustom } from './calendario-semana-custom';
import { CalendarioMes } from './calendario-mes';
import { cn } from '@/lib/utils';
import { CalendarDays, CalendarRange } from 'lucide-react';

type ViewMode = 'semana' | 'mes';

/**
 * CalendarioPage - Página principal do calendário
 *
 * Usa h-full para preencher o espaço dado pelo layout (page-content).
 * Sem padding próprio — o page-content já aplica 1.5rem.
 */
export function CalendarioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('semana');

  return (
    <div className="h-full flex flex-col overflow-hidden -m-6">
      <div className="max-w-[1400px] mx-auto flex flex-col flex-1 min-h-0 w-full p-2 lg:p-4 gap-2 lg:gap-3">
        {/* Toggle de visualização */}
        <div className="flex justify-end flex-shrink-0">
          <div className="inline-flex items-center gap-1 bg-muted/50 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('semana')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium',
                viewMode === 'semana'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <CalendarRange className="h-4 w-4" />
              Semana
            </button>
            <button
              onClick={() => setViewMode('mes')}
              className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium',
                viewMode === 'mes'
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'hover:bg-muted text-muted-foreground'
              )}
            >
              <CalendarDays className="h-4 w-4" />
              Mês
            </button>
          </div>
        </div>

        {/* Calendário — Card individual no background cinza */}
        <div className="flex-1 min-h-0 flex flex-col rounded-xl border border-border bg-card shadow-sm overflow-hidden">
          {viewMode === 'semana' ? (
            <CalendarioSemanaCustom />
          ) : (
            <CalendarioMes />
          )}
        </div>
      </div>
    </div>
  );
}
