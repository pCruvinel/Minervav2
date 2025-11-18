import React from 'react';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Calendar as CalendarIcon, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../ui/utils';

interface StepAgendarVisitaInicialProps {
  data: { dataVisita: string };
  onDataChange: (data: any) => void;
}

export function StepAgendarVisitaInicial({ data, onDataChange }: StepAgendarVisitaInicialProps) {
  const dataVisita = data.dataVisita ? new Date(data.dataVisita) : undefined;
  const isComplete = !!data.dataVisita;

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDataChange({ dataVisita: date.toISOString() });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Agendar Visita Inicial</h2>
        <p className="text-sm text-neutral-600">
          Agende a data da visita técnica inicial para verificação das condições da obra
        </p>
      </div>

      {/* Status */}
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
              {isComplete ? 'Visita agendada!' : 'Aguardando agendamento'}
            </h3>
            {isComplete && dataVisita ? (
              <p className="text-sm text-neutral-600">
                Visita agendada para: <strong>{format(dataVisita, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</strong>
              </p>
            ) : (
              <p className="text-sm text-neutral-600">
                Selecione uma data no calendário abaixo
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Calendário */}
      <div className="space-y-3">
        <label className="text-sm">
          Selecione a Data da Visita <span className="text-red-500">*</span>
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
          Agende a visita inicial com antecedência suficiente para coordenar com a equipe técnica e o cliente.
        </AlertDescription>
      </Alert>
    </div>
  );
}
