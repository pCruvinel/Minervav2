import { cn } from "./utils";

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

/**
 * Skeleton para um bloco de turno individual
 * Simula a estrutura de BlocoTurno durante carregamento
 */
export function SkeletonTurno() {
  return (
    <div className="rounded-lg p-3 shadow-sm border border-neutral-200 bg-neutral-50 space-y-2">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-5 w-12" />
      </div>
      <Skeleton className="h-4 w-32" />
      <div className="flex gap-1">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
      </div>
    </div>
  );
}

/**
 * Grid de skeletons para múltiplos turnos
 * Útil para calendário-dia e calendário-semana
 */
export function SkeletonTurnoGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonTurno key={i} />
      ))}
    </div>
  );
}

export { Skeleton };
