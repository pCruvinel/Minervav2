import { HorarioSlot } from '@/lib/hooks/use-turno-horarios';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface HorarioSelectorProps {
  slots: HorarioSlot[];
  horarioSelecionado: string | null;
  onSelect: (horario: string) => void;
}

/**
 * HorarioSelector - Componente de seleção visual de horários
 *
 * Renderiza grade de botões representando slots de horário de 1 hora.
 * Cada slot pode estar:
 * - Disponível (clicável, fundo claro)
 * - Selecionado (borda azul, ring azul)
 * - Ocupado (desabilitado, riscado, opaco)
 *
 * Grid responsivo: 6 colunas (desktop) → 4 (tablet) → 3 (mobile)
 */
export function HorarioSelector({
  slots,
  horarioSelecionado,
  onSelect,
}: HorarioSelectorProps) {
  if (slots.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        Nenhum horário disponível para este turno.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Selecione o horário (1 hora)</Label>

      {/* Grid de horários */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {slots.map((slot) => {
          const ehSelecionado = horarioSelecionado === slot.hora;
          const ehDisponivel = slot.disponivel;

          return (
            <button
              key={slot.hora}
              type="button"
              onClick={() => ehDisponivel && onSelect(slot.hora)}
              disabled={!ehDisponivel}
              className={cn(
                'aspect-square p-3 rounded-lg border-2 transition-all',
                'flex flex-col items-center justify-center',

                // Estado selecionado
                ehSelecionado && [
                  'border-primary bg-primary/5',
                  'ring-2 ring-primary ring-offset-2',
                ],

                // Estado disponível (não selecionado)
                ehDisponivel &&
                !ehSelecionado && [
                  'border-border bg-card',
                  'hover:border-primary hover:bg-primary/3',
                  'cursor-pointer',
                ],

                // Estado ocupado
                !ehDisponivel && [
                  'border-border bg-muted/50',
                  'opacity-50 cursor-not-allowed',
                ]
              )}
              title={
                ehDisponivel
                  ? `${slot.hora} - ${slot.horaFim} (Disponível)`
                  : `${slot.hora} - ${slot.horaFim} (Ocupado)`
              }
            >
              {/* Hora (ex: "09") */}
              <span
                className={cn(
                  'text-lg font-semibold',
                  ehSelecionado && 'text-primary',
                  ehDisponivel && !ehSelecionado && 'text-foreground',
                  !ehDisponivel && 'text-muted-foreground line-through'
                )}
              >
                {slot.hora.split(':')[0]}
              </span>

              {/* Status (✓ Livre / ✗ Ocupado) */}
              <span className="text-[10px] text-muted-foreground mt-0.5">
                {ehDisponivel ? '✓ Livre' : '✗ Ocupado'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
