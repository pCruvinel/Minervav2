import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AgendamentoOS } from '@/components/os/agendamento-os';
import { useOS } from '@/lib/hooks/use-os';

export interface StepAgendarVisitaInicialProps {
  osId: string;
  data: {
    dataVisita?: string;
    agendamentoId?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepAgendarVisitaInicial({ osId, data, onDataChange, readOnly }: StepAgendarVisitaInicialProps) {
  // Buscar setor da OS
  const { os, loading } = useOS(osId);
  const setorSlug = os?.tipo_os?.setor?.slug || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Agendar Visita Inicial</h2>
        <p className="text-sm text-muted-foreground">
          Agende a visita técnica inicial para verificação das condições da obra usando o sistema de calendário
        </p>
      </div>

      <AgendamentoOS
        osId={osId}
        categoria="Vistoria Inicial"
        setorSlug={setorSlug}
        agendamentoId={data.agendamentoId}
        onAgendamentoChange={(id) => onDataChange({ ...data, agendamentoId: id })}
        readOnly={readOnly}
        dataLegacy={data.dataVisita}
      />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Agende a visita inicial com antecedência suficiente para coordenar com a equipe técnica e o cliente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
