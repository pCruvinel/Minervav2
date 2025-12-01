import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, AlertCircle, Loader2 } from 'lucide-react';
import { AgendamentoOS } from '@/components/os/agendamento-os';
import { useOS } from '@/lib/hooks/use-os';

interface StepAgendarVisitaProps {
  osId: string;
  data: {
    dataAgendamento?: string;
    agendamentoId?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepAgendarVisita({ osId, data, onDataChange, readOnly }: StepAgendarVisitaProps) {
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
        <h2 className="text-xl mb-1">Agendar Visita Técnica</h2>
        <p className="text-sm text-muted-foreground">
          Selecione o dia e horário para realizar a visita técnica usando o sistema de calendário
        </p>
      </div>

      <AgendamentoOS
        osId={osId}
        categoria="Vistoria Técnica"
        setorSlug={setorSlug}
        agendamentoId={data.agendamentoId}
        onAgendamentoChange={(id) => onDataChange({ ...data, agendamentoId: id })}
        readOnly={readOnly}
        dataLegacy={data.dataAgendamento}
      />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Certifique-se de confirmar a disponibilidade do solicitante antes de agendar a visita.
          O sistema enviará uma notificação automática ao cliente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
