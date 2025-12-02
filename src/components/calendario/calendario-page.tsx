import { CalendarioSemanaCustom } from './calendario-semana-custom';

/**
 * CalendarioPage - Página principal do calendário
 *
 * Visualização semanal para todos os usuários.
 * Gestão de turnos em /calendario/painel (Admin/Diretoria).
 */
export function CalendarioPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto">
        <div className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          <CalendarioSemanaCustom />
        </div>
      </div>
    </div>
  );
}
