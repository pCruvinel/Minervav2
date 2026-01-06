import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import {
  CalendarioIntegracao,
  CalendarioIntegracaoHandle,
  Agendamento,
} from '@/components/os/shared/components/calendario-integracao';
import { useOS } from '@/lib/hooks/use-os';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

interface StepAgendarApresentacaoData {
  dataAgendamento?: string;
  agendamentoId?: string;
  horarioInicio?: string;
  horarioFim?: string;
  duracaoHoras?: number;
  turnoId?: string;
  // Novos campos para UX melhorada
  agendadoPorId?: string;
  agendadoPorNome?: string;
  agendadoEm?: string;
  responsavelAgendamentoId?: string;
  responsavelAgendamentoNome?: string;
  notificacaoEnviada?: boolean;
}

interface StepAgendarApresentacaoProps {
  osId: string;
  data: StepAgendarApresentacaoData;
  onDataChange: (data: StepAgendarApresentacaoData) => void;
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

    // Buscar usuário atual para registrar quem fez o agendamento
    const { currentUser } = useAuth();

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

    const handleAgendamentoChange = (agendamento: Agendamento | null) => {
      const agendamentoData: Partial<StepAgendarApresentacaoData> = agendamento
        ? {
          agendamentoId: agendamento.id,
          dataAgendamento: agendamento.data,
          horarioInicio: agendamento.horarioInicio,
          horarioFim: agendamento.horarioFim,
          duracaoHoras: agendamento.duracaoHoras,
          turnoId: agendamento.turnoId,
          // Novos campos: quem agendou, quando e responsável
          agendadoPorId: currentUser?.id,
          agendadoPorNome: currentUser?.nome_completo || 'Usuário',
          agendadoEm: new Date().toISOString(),
          responsavelAgendamentoId: agendamento.responsavelId,
          responsavelAgendamentoNome: agendamento.responsavelNome,
          notificacaoEnviada: true,
        }
        : {
          agendamentoId: undefined,
          dataAgendamento: undefined,
          horarioInicio: undefined,
          horarioFim: undefined,
          duracaoHoras: undefined,
          turnoId: undefined,
          agendadoPorId: undefined,
          agendadoPorNome: undefined,
          agendadoEm: undefined,
          responsavelAgendamentoId: undefined,
          responsavelAgendamentoNome: undefined,
          notificacaoEnviada: undefined,
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
        <CalendarioIntegracao
          ref={calendarioRef}
          osId={osId}
          categoria="apresentacao"
          setorSlug={setorSlug}
          setorFiltro={setorSlug}
          agendamentoExistente={
            data.agendamentoId
              ? {
                id: data.agendamentoId,
                data: data.dataAgendamento || '',
                horarioInicio: data.horarioInicio || '',
                horarioFim: data.horarioFim || '',
                duracaoHoras: data.duracaoHoras || 0,
                turnoId: data.turnoId || '',
                categoria: 'Apresentação de Proposta',
                setor: setorSlug,
                status: 'confirmado',
                // Passar os novos campos para exibição no card de confirmação
                agendadoPorId: data.agendadoPorId,
                agendadoPorNome: data.agendadoPorNome,
                agendadoEm: data.agendadoEm,
                responsavelId: data.responsavelAgendamentoId,
                responsavelNome: data.responsavelAgendamentoNome,
                notificacaoEnviada: data.notificacaoEnviada,
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

