import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { Checkbox } from '../../../ui/checkbox';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Calendar, CheckCircle } from 'lucide-react';

interface StepRealizarApresentacaoProps {
  data: {
    apresentacaoRealizada: boolean;
  };
  onDataChange: (data: any) => void;
}

export function StepRealizarApresentacao({ data, onDataChange }: StepRealizarApresentacaoProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          Confirme que a apresentação da proposta foi realizada.
        </AlertDescription>
      </Alert>

      <div className="flex items-center space-x-3 border rounded-lg p-4">
        <Checkbox
          id="apresentacao-realizada"
          checked={data.apresentacaoRealizada}
          onCheckedChange={(checked) => onDataChange({ apresentacaoRealizada: checked as boolean })}
        />
        <Label htmlFor="apresentacao-realizada" className="cursor-pointer">
          Confirmar que a apresentação foi realizada
        </Label>
      </div>

      {data.apresentacaoRealizada && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm">Apresentação confirmada!</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
