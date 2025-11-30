import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { AgendamentoOS } from '@/components/os/agendamento-os';
import { useOS } from '@/lib/hooks/use-os';

export interface StepAgendarVisitaFinalProps {
  osId: string;
  data: {
    dataVisitaFinal?: string;
    agendamentoId?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepAgendarVisitaFinal({ osId, data, onDataChange, readOnly }: StepAgendarVisitaFinalProps) {
  // Buscar setor da OS
  const { os, loading } = useOS(osId);
  const setorSlug = os?.tipo_os?.setor?.slug || '';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Agendar Visita Final</h2>
        <p className="text-sm text-neutral-600">
          Agende a visita final para verificação do andamento e conclusão das atividades usando o sistema de calendário
        </p>
      </div>

      <AgendamentoOS
        osId={osId}
        categoria="Vistoria Final"
        setorSlug={setorSlug}
        agendamentoId={data.agendamentoId}
        onAgendamentoChange={(id) => onDataChange({ ...data, agendamentoId: id })}
        readOnly={readOnly}
        dataLegacy={data.dataVisitaFinal}
      />

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          A visita final deve ser agendada próximo à conclusão das atividades principais da obra para verificar a execução e qualidade dos serviços.
        </AlertDescription>
      </Alert>
    </div>
  );
}
