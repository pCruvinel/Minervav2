import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, CheckCircle } from 'lucide-react';

interface StepContratoAssinadoProps {
  data: {
    contratoAssinado: boolean;
    dataAssinatura: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepContratoAssinado({ data, onDataChange, readOnly = false }: StepContratoAssinadoProps) {
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
            onCheckedChange={(checked: boolean | 'indeterminate') => !readOnly && onDataChange({ 
              ...data, 
              contratoAssinado: checked === true,
              dataAssinatura: checked === true ? new Date().toISOString().split('T')[0] : ''
            })}
            disabled={readOnly}
          />
          <Label htmlFor="contrato-assinado" className="cursor-pointer">
            Confirmar que o contrato foi assinado por todas as partes
          </Label>
        </div>

        {data.contratoAssinado && (
          <div>
            <Label>Data de Assinatura</Label>
            <Input
              type="text"
              placeholder="dd/mm/aaaa"
              maxLength={10}
              value={data.dataAssinatura}
              onChange={(e) => {
                if (readOnly) return;
                const masked = e.target.value
                  .replace(/\D/g, '')
                  .replace(/(\d{2})(\d)/, '$1/$2')
                  .replace(/(\d{2})(\d)/, '$1/$2')
                  .replace(/(\/\d{4})\d+?$/, '$1');
                onDataChange({ ...data, dataAssinatura: masked });
              }}
              disabled={readOnly}
            />
          </div>
        )}
      </div>

      {data.contratoAssinado && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-success" />
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
