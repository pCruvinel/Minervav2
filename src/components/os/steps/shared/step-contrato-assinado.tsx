import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Checkbox } from '../../../ui/checkbox';
import { Alert, AlertDescription } from '../../../ui/alert';
import { FileText, CheckCircle } from 'lucide-react';

interface StepContratoAssinadoProps {
  data: {
    contratoAssinado: boolean;
    dataAssinatura: string;
  };
  onDataChange: (data: any) => void;
}

export function StepContratoAssinado({ data, onDataChange }: StepContratoAssinadoProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Confirme que o contrato foi assinado por todas as partes.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="flex items-center space-x-3 border rounded-lg p-4">
          <Checkbox
            id="contrato-assinado"
            checked={data.contratoAssinado}
            onCheckedChange={(checked) => onDataChange({ 
              ...data, 
              contratoAssinado: checked as boolean,
              dataAssinatura: checked ? new Date().toISOString().split('T')[0] : ''
            })}
          />
          <Label htmlFor="contrato-assinado" className="cursor-pointer">
            Confirmar que o contrato foi assinado por todas as partes
          </Label>
        </div>

        {data.contratoAssinado && (
          <div>
            <Label>Data de Assinatura</Label>
            <Input
              type="date"
              value={data.dataAssinatura}
              onChange={(e) => onDataChange({ ...data, dataAssinatura: e.target.value })}
            />
          </div>
        )}
      </div>

      {data.contratoAssinado && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm">Contrato assinado!</div>
                <div className="text-xs text-muted-foreground">
                  Data: {new Date(data.dataAssinatura).toLocaleDateString('pt-BR')}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
