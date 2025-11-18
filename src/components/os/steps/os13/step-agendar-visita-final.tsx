import React from 'react';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../ui/utils';

interface StepAgendarVisitaFinalProps {
  data: { dataVisitaFinal: string };
  onDataChange: (data: any) => void;
}

export function StepAgendarVisitaFinal({ data, onDataChange }: StepAgendarVisitaFinalProps) {
  const dataVisita = data.dataVisitaFinal ? new Date(data.dataVisitaFinal) : undefined;
  const isComplete = !!data.dataVisitaFinal;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDataChange({ dataVisitaFinal: date.toISOString() });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Agendar Visita Final</h2>
        <p className="text-sm text-neutral-600">
          Agende a visita final para verificação do andamento e conclusão das atividades
        </p>
      </div>

      <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isComplete ? '#10b981' : '#DDC063' }}
          >
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <CalendarIcon className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-base mb-2">
              {isComplete ? 'Visita final agendada!' : 'Aguardando agendamento'}
            </h3>
            {isComplete && dataVisita ? (
              <p className="text-sm text-neutral-600">
                Visita final agendada para: <strong>{format(dataVisita, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong>
              </p>
            ) : (
              <p className="text-sm text-neutral-600">
                Selecione uma data no calendário abaixo
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="text-sm">
          Selecione a Data da Visita Final <span className="text-red-500">*</span>
        </label>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'w-full justify-start text-left',
                !dataVisita && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataVisita ? format(dataVisita, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={dataVisita}
              onSelect={handleDateSelect}
              locale={ptBR}
              disabled={(date) => date < new Date()}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          A visita final deve ser agendada próximo à conclusão das atividades principais da obra para verificar a execução e qualidade dos serviços.
        </AlertDescription>
      </Alert>
    </div>
  );
}
