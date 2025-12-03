import { useState } from 'react';
import { CalendarioSemanaCustom } from './calendario-semana-custom';
import { CalendarioMes } from './calendario-mes';
import { cn } from '@/lib/utils';
import { CalendarDays, CalendarRange } from 'lucide-react';

type ViewMode = 'semana' | 'mes';

/**
 * CalendarioPage - Página principal do calendário
 *
 * Suporta visualização semanal e mensal.
 * Gestão de turnos em /calendario/painel (Admin/Diretoria).
 */
export function CalendarioPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('semana');

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Toggle de visualização */}
        <div className="flex justify-end">
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

        {/* Calendário */}
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
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
