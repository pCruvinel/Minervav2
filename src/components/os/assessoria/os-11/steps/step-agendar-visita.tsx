import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import {
  CalendarioIntegracao,
  CalendarioIntegracaoHandle,
} from '@/components/os/shared/components/calendario-integracao';
import { useColaboradores } from '@/lib/hooks/use-os-workflows';
import { useOS } from '@/lib/hooks/use-os';
import { toast } from 'sonner';

// =====================================================
// TYPES
// =====================================================

interface StepAgendarVisitaData {
  agendamentoId?: string;
  dataAgendamento?: string;
  horarioInicio?: string;
  horarioFim?: string;
  duracaoHoras?: number;
  turnoId?: string;
  tecnicoResponsavel: string;
  tecnicoNome: string;
  instrucoes: string;
}

interface StepAgendarVisitaProps {
  osId: string;
  data: StepAgendarVisitaData;
  onDataChange: (newData: StepAgendarVisitaData) => void;
  readOnly?: boolean;
}

export interface StepAgendarVisitaHandle {
  isFormValid: () => boolean;
  validate: () => boolean;
}

// =====================================================
// COMPONENTE
// =====================================================

export const StepAgendarVisita = forwardRef<
  StepAgendarVisitaHandle,
  StepAgendarVisitaProps
>(
  ({ osId, data, onDataChange, readOnly }, ref) => {
    // Buscar colaboradores técnicos do Supabase (setor assessoria)
    const { colaboradores, loading: loadingColaboradores } =
      useColaboradores({ ativo: true });
    const { os, loading: loadingOS } = useOS(osId);
    const setorSlug = os?.tipo_os?.setor?.slug || 'assessoria';

    // Ref do calendário para validação
    const calendarioRef = useRef<CalendarioIntegracaoHandle>(null);

    // Filtrar apenas técnicos de assessoria
    const tecnicos = colaboradores.filter(
      (c) =>
        c.setor?.slug === 'assessoria' ||
        c.funcao?.includes('assessoria') ||
        c.funcao?.includes('tecnico') ||
        c.cargo?.slug?.includes('engenheiro') ||
        c.cargo?.slug?.includes('tecnico')
    );

    // =====================================================
    // REF IMPERATIVO
    // =====================================================

    useImperativeHandle(
      ref,
      () => ({
        isFormValid: () => {
          const agendamentoConfirmado =
            calendarioRef.current?.isAgendamentoConfirmado() ?? false;
          const tecnicoSelecionado = !!data.tecnicoResponsavel;

          return agendamentoConfirmado && tecnicoSelecionado;
        },

        validate: () => {
          const agendamentoConfirmado =
            calendarioRef.current?.isAgendamentoConfirmado() ?? false;
          const tecnicoSelecionado = !!data.tecnicoResponsavel;

          if (!agendamentoConfirmado) {
            toast.error('Por favor, selecione um horário no calendário');
            return false;
          }

          if (!tecnicoSelecionado) {
            toast.error('Por favor, selecione um técnico responsável');
            return false;
          }

          return true;
        },
      }),
      [data.tecnicoResponsavel]
    );

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleInputChange = (field: string, value: string) => {
      if (readOnly) return;
      onDataChange({ ...data, [field]: value });
    };

    const handleTecnicoChange = (tecnicoId: string) => {
      if (readOnly) return;
      const tecnico = tecnicos.find((t) => t.id === tecnicoId);
      onDataChange({
        ...data,
        tecnicoResponsavel: tecnicoId,
        tecnicoNome: tecnico?.nome_completo || '',
      });
    };

    const handleAgendamentoChange = (agendamento: any) => {
      const agendamentoData = agendamento
        ? {
          agendamentoId: agendamento.id,
          dataAgendamento: agendamento.data,
          horarioInicio: agendamento.horarioInicio,
          horarioFim: agendamento.horarioFim,
          duracaoHoras: agendamento.duracaoHoras,
          turnoId: agendamento.turnoId,
        }
        : { 
          agendamentoId: undefined,
          dataAgendamento: undefined,
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

    if (loadingOS) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-xl mb-1">Agendar Visita Técnica</h2>
            <p className="text-sm text-muted-foreground">
              Selecione a data e horário no calendário, depois escolha o técnico
              responsável
            </p>
          </div>
        </div>

        {/* Calendário */}
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
                data: data.dataAgendamento || '',
                horarioInicio: data.horarioInicio || '',
                horarioFim: data.horarioFim || '',
                duracaoHoras: data.duracaoHoras || 0,
                turnoId: data.turnoId || '',
                categoria: 'Vistoria Técnica',
                setor: setorSlug,
                status: 'confirmado',
              }
              : undefined
          }
          onAgendamentoChange={handleAgendamentoChange}
          readOnly={readOnly}
        />

        {/* Técnico Responsável */}
        <div className="space-y-4">
          <h3 className="text-base border-b border-border pb-2 text-primary">
            Técnico Responsável
          </h3>

          <div className="space-y-2">
            <Label htmlFor="tecnicoResponsavel">
              Técnico <span className="text-destructive">*</span>
            </Label>
            {loadingColaboradores ? (
              <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">
                  Carregando técnicos...
                </span>
              </div>
            ) : (
              <Select
                value={data.tecnicoResponsavel}
                onValueChange={handleTecnicoChange}
                disabled={readOnly}
              >
                <SelectTrigger id="tecnicoResponsavel">
                  <SelectValue placeholder="Selecione o técnico" />
                </SelectTrigger>
                <SelectContent>
                  {tecnicos.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground text-center">
                      Nenhum técnico cadastrado
                    </div>
                  ) : (
                    tecnicos.map((tec) => (
                      <SelectItem key={tec.id} value={tec.id}>
                        <div className="flex items-center gap-2">
                          <span>{tec.nome_completo}</span>
                          {tec.cargo?.nome && (
                            <span className="text-xs text-muted-foreground">
                              ({tec.cargo.nome})
                            </span>
                          )}
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* Instruções */}
        <div className="space-y-2">
          <Label htmlFor="instrucoes">Instruções para a Visita</Label>
          <Textarea
            id="instrucoes"
            value={data.instrucoes}
            onChange={(e) => handleInputChange('instrucoes', e.target.value)}
            placeholder="Informações importantes para o técnico (acesso ao local, pessoa de contato, etc.)"
            rows={4}
            disabled={readOnly}
          />
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            O cliente será notificado sobre a data e horário da visita técnica.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
);

StepAgendarVisita.displayName = 'StepAgendarVisita';