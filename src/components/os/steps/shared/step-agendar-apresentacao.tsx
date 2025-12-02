import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Loader2 } from 'lucide-react';
import {
  CalendarioIntegracao,
  CalendarioIntegracaoHandle,
} from '@/components/os/calendario-integracao';
import { useOS } from '@/lib/hooks/use-os';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

interface StepAgendarApresentacaoProps {
  osId: string;
  data: {
    dataAgendamento?: string;
    agendamentoId?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export interface StepAgendarApresentacaoHandle {
  isFormValid: () => boolean;
  validate: () => boolean;
}

// =====================================================
// COMPONENTE
// =====================================================

export const StepAgendarApresentacao = forwardRef<
  StepAgendarApresentacaoHandle,
  StepAgendarApresentacaoProps
>(
  ({ osId, data, onDataChange, readOnly = false }, ref) => {
    // Buscar setor da OS
    const { os, loading } = useOS(osId);
    const setorSlug = os?.tipo_os?.setor?.slug || '';

    // Ref do calendário para validação
    const calendarioRef = useRef<CalendarioIntegracaoHandle>(null);

    // =====================================================
    // REF IMPERATIVO
    // =====================================================

    useImperativeHandle(
      ref,
      () => ({
        isFormValid: () => {
          return calendarioRef.current?.isAgendamentoConfirmado() ?? false;
        },

        validate: () => {
          const isFormValid = calendarioRef.current?.isAgendamentoConfirmado() ?? false;
          if (!isFormValid) {
            toast.error(
              'Por favor, selecione um horário no calendário para continuar'
            );
            return false;
          }
          return true;
        },
      }),
      []
    );

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleAgendamentoChange = (agendamento: any) => {
      const agendamentoData = agendamento
        ? {
            agendamentoId: agendamento.id,
            dataAgendamento: agendamento.data,
          }
        : { agendamentoId: null };

      onDataChange({
        ...data,
        ...agendamentoData,
      });
    };

    // =====================================================
    // RENDER
    // =====================================================

    if (loading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <CalendarioIntegracao
          ref={calendarioRef}
          osId={osId}
          categoria="apresentacao"
          setorSlug={setorSlug}
          agendamentoExistente={
            data.agendamentoId
              ? {
                  id: data.agendamentoId,
                  data: data.dataAgendamento || '',
                  horarioInicio: '',
                  horarioFim: '',
                  duracaoHoras: 0,
                  turnoId: '',
                  categoria: 'Apresentação de Proposta',
                  setor: setorSlug,
                  status: 'confirmado',
                }
              : undefined
          }
          onAgendamentoChange={handleAgendamentoChange}
          readOnly={readOnly}
        />
      </div>
    );
  }
);

StepAgendarApresentacao.displayName = 'StepAgendarApresentacao';
