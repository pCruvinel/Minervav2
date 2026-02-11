import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import {
  CalendarioIntegracao,
  CalendarioIntegracaoHandle,
} from '@/components/os/shared/components/calendario-integracao';
import { useOS } from '@/lib/hooks/use-os';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

export interface StepAgendarVisitaInicialProps {
  osId: string;
  data: {
    dataVisita?: string;
    agendamentoId?: string;
    horarioInicio?: string;
    horarioFim?: string;
    duracaoHoras?: number;
    turnoId?: string;
    // EtapaCheck — kept in data interface for future use in execution steps
    realizadoConfirmado?: boolean;
    dataRealizacao?: string;
    confirmadoPor?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export interface StepAgendarVisitaInicialHandle {
  isFormValid: () => boolean;
  validate: () => boolean;
}

// =====================================================
// COMPONENTE
// =====================================================

export const StepAgendarVisitaInicial = forwardRef<
  StepAgendarVisitaInicialHandle,
  StepAgendarVisitaInicialProps
>(
  ({ osId, data, onDataChange, readOnly }, ref) => {
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
          dataVisita: agendamento.data,
          horarioInicio: agendamento.horarioInicio,
          horarioFim: agendamento.horarioFim,
          duracaoHoras: agendamento.duracaoHoras,
          turnoId: agendamento.turnoId,
        }
        : { 
          agendamentoId: null,
          dataVisita: undefined,
          horarioInicio: undefined,
          horarioFim: undefined,
          duracaoHoras: undefined,
          turnoId: undefined,
        };

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
        <div>
          <h2 className="text-xl mb-1">Agendar Visita Inicial</h2>
          <p className="text-sm text-muted-foreground">
            Agende a visita técnica inicial para verificação das condições da
            obra usando o sistema de calendário
          </p>
        </div>

        <CalendarioIntegracao
          ref={calendarioRef}
          osId={osId}
          categoria="visita"
          setorSlug={setorSlug}
          setorFiltro={setorSlug}
          agendamentoExistente={
            data.agendamentoId
              ? {
                id: data.agendamentoId,
                data: data.dataVisita || '',
                horarioInicio: data.horarioInicio || '',
                horarioFim: data.horarioFim || '',
                duracaoHoras: data.duracaoHoras || 0,
                turnoId: data.turnoId || '',
                categoria: 'Vistoria Inicial',
                setor: setorSlug,
                status: data.realizadoConfirmado ? 'realizado' : 'confirmado',
              }
              : undefined
          }
          onAgendamentoChange={handleAgendamentoChange}
          readOnly={readOnly}
        />

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Agende a visita inicial com antecedência suficiente para coordenar
            com a equipe técnica e o cliente.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
);

StepAgendarVisitaInicial.displayName = 'StepAgendarVisitaInicial';
