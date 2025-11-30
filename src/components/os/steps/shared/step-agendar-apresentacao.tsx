import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Loader2 } from 'lucide-react';
import { AgendamentoOS } from '@/components/os/agendamento-os';
import { useOS } from '@/lib/hooks/use-os';

interface StepAgendarApresentacaoProps {
  osId: string;
  data: {
    dataAgendamento?: string;
    agendamentoId?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepAgendarApresentacao({ osId, data, onDataChange, readOnly = false }: StepAgendarApresentacaoProps) {
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
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Agende a apresentação da proposta comercial com o cliente usando o sistema de calendário.
        </AlertDescription>
      </Alert>

      <AgendamentoOS
        osId={osId}
        categoria="Apresentação de Proposta"
        setorSlug={setorSlug}
        agendamentoId={data.agendamentoId}
        onAgendamentoChange={(id) => onDataChange({ ...data, agendamentoId: id })}
        readOnly={readOnly}
        dataLegacy={data.dataAgendamento}
      />
    </div>
  );
}
