import { forwardRef, useImperativeHandle, useRef } from 'react';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import {
  CalendarioIntegracao,
  CalendarioIntegracaoHandle,
} from '@/components/os/shared/components/calendario-integracao';
import { useColaboradores } from '@/lib/hooks/use-os-workflows';
import { useOS } from '@/lib/hooks/use-os';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { agendarVisitaSchema } from '@/lib/validations/os11-schemas';
import { FormTextarea } from '@/components/ui/form-textarea';
import { logger } from '@/lib/utils/logger';

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

    // Hook de validação
    const {
      errors,
      touched,
      validateField,
      markFieldTouched,
      validateAll,
      markAllTouched
    } = useFieldValidation(agendarVisitaSchema);

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
          return validateAll(data);
        },

        validate: () => {
          const isValid = validateAll(data);
          if (!isValid) {
             logger.error('❌ Validation Failed for Step 2:', data);
             // Logar erros específicos se possível, mas validateAll retorna bool.
             // Vamos forçar re-validação para logar erros
             try {
                agendarVisitaSchema.parse(data);
             } catch (e: any) {
                logger.error('❌ Zod Validation Errors:', e.errors);
             }
          } else {
             logger.log('✅ Validation Success for Step 2:', data);
          }
          markAllTouched();
          return isValid;
        },
      }),
      [data, validateAll, markAllTouched]
    );

    // =====================================================
    // HANDLERS
    // =====================================================

    const handleInputChange = (field: keyof StepAgendarVisitaData, value: any) => {
      if (readOnly) return;
      const newData = { ...data, [field]: value };
      onDataChange(newData);
      
      if (touched[field]) {
        validateField(field as any, value);
      }
    };

    const handleBlur = (field: keyof StepAgendarVisitaData) => {
      markFieldTouched(field as any);
      validateField(field as any, data[field]);
    };

    const handleTecnicoChange = (tecnicoId: string) => {
      if (readOnly) return;
      const tecnico = tecnicos.find((t) => t.id === tecnicoId);
      
      const newData = {
        ...data,
        tecnicoResponsavel: tecnicoId,
        tecnicoNome: tecnico?.nome_completo || '',
      };
      
      onDataChange(newData);
      
      // Validação imediata
      if (touched.tecnicoResponsavel) {
        validateField('tecnicoResponsavel', tecnicoId);
      }
    };

    const handleAgendamentoChange = (agendamento: any) => {
      logger.log('📅 StepAgendarVisita received agendamento:', agendamento);
      
      if (!agendamento) {
          const emptyData = {
            ...data,
            agendamentoId: undefined,
            dataAgendamento: '',
            horarioInicio: '',
            horarioFim: '',
            duracaoHoras: undefined,
            turnoId: undefined,
            tecnicoResponsavel: '',
            tecnicoNome: '',
          };
          onDataChange(emptyData);
          return;
      }

      // Extração defensiva do ID do responsável
      // Tenta pegar de responsavelId (root) ou responsavel.id (nested ob)
      const responsavelId = agendamento.responsavelId || agendamento.responsavel?.id || '';
      const responsavelNome = agendamento.tecnicoNome || agendamento.responsavelNome || agendamento.responsavel?.nome || '';

      const agendamentoData = {
          agendamentoId: agendamento.id,
          dataAgendamento: agendamento.data,
          horarioInicio: agendamento.horarioInicio,
          horarioFim: agendamento.horarioFim,
          duracaoHoras: agendamento.duracaoHoras,
          turnoId: agendamento.turnoId,
      };

      const newData = {
        ...data,
        ...agendamentoData,
        // CRITICAL FIX: Garantir que tecnicoResponsavel seja preenchido
        tecnicoResponsavel: responsavelId,
        tecnicoNome: responsavelNome,
      };

      logger.log('✅ StepAgendarVisita updateData:', newData);
      onDataChange(newData);
      
      // Validar campos do agendamento se já tocados
      if (touched.tecnicoResponsavel && responsavelId) {
          validateField('tecnicoResponsavel', responsavelId);
      }
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
        <div className={touched.dataAgendamento && errors.dataAgendamento ? "border border-destructive rounded-lg p-2" : ""}>
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
            {touched.dataAgendamento && errors.dataAgendamento && (
                <p className="text-sm text-destructive mt-1 px-2">
                    {errors.dataAgendamento} (Selecione um horário)
                </p>
            )}
        </div>

        {/* Técnico Responsável removido pois já está no calendário (duplicidade) */}

        {/* Instruções */}
        <div className="space-y-4 pt-4 border-t border-border">
          <FormTextarea
            id="instrucoes"
            label="Instruções para o Técnico"
            value={data.instrucoes || ''}
            onChange={(e) => handleInputChange('instrucoes', e.target.value)}
            onBlur={() => handleBlur('instrucoes')}
            placeholder="Detalhes sobre o acesso, contato no local, ou observações específicas..."
            className="min-h-[100px]"
            required={false}
            disabled={readOnly}
            error={touched.instrucoes ? errors.instrucoes : undefined}
          />
        </div>

      </div>
    );
  }
);

StepAgendarVisita.displayName = 'StepAgendarVisita';