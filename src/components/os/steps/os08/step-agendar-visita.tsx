import React from 'react';
import { Label } from '../../../ui/label';
import { Calendar } from '../../../ui/calendar';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface StepAgendarVisitaProps {
  data: {
    dataAgendamento: string;
  };
  onDataChange: (data: any) => void;
}

export function StepAgendarVisita({ data, onDataChange }: StepAgendarVisitaProps) {
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      onDataChange({ ...data, dataAgendamento: date.toISOString() });
    }
  };

  const selectedDate = data.dataAgendamento ? new Date(data.dataAgendamento) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Agendar Visita Técnica</h2>
        <p className="text-sm text-neutral-600">
          Selecione a data e horário para realizar a visita técnica
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label>
            Data da Visita <span className="text-red-500">*</span>
          </Label>
          
          <div className="flex flex-col items-start gap-4">
            <div className="border border-neutral-200 rounded-lg p-4 bg-white">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
                disabled={(date) => date < new Date()}
                className="rounded-md"
              />
            </div>

            {selectedDate && (
              <div className="w-full p-4 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center gap-2 mb-2">
                  <CalendarIcon className="w-5 h-5" style={{ color: '#D3AF37' }} />
                  <h3 className="text-sm">Data Selecionada</h3>
                </div>
                <p className="text-lg">
                  {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </p>
                <p className="text-sm text-neutral-600 mt-1">
                  {format(selectedDate, 'EEEE', { locale: ptBR })}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

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
