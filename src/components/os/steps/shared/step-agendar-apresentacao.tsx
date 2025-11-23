import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar } from 'lucide-react';

interface StepAgendarApresentacaoProps {
  data: {
    dataAgendamento: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepAgendarApresentacao({ data, onDataChange, readOnly = false }: StepAgendarApresentacaoProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Agende a apresentação da proposta comercial com o cliente.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label>Data e Hora do Agendamento</Label>
          <Input
            type="datetime-local"
            value={data.dataAgendamento}
            onChange={(e) => !readOnly && onDataChange({ dataAgendamento: e.target.value })}
            disabled={readOnly}
          />
        </div>
      </div>

      {data.dataAgendamento && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm">Apresentação agendada para:</div>
                <div className="text-base">
                  {new Date(data.dataAgendamento).toLocaleString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
