import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Label } from '../../../ui/label';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { Alert, AlertDescription } from '../../../ui/alert';
import { AlertCircle, Check } from 'lucide-react';

interface StepSelecaoTipoAssessoriaProps {
  data: {
    tipoOS: string;
  };
  onDataChange: (data: any) => void;
}

export function StepSelecaoTipoAssessoria({ data, onDataChange }: StepSelecaoTipoAssessoriaProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Selecione o tipo de ordem de serviço que será criada.
        </AlertDescription>
      </Alert>

      <div className="space-y-3">
        <Label>Selecione o tipo de OS</Label>
        <RadioGroup
          value={data.tipoOS}
          onValueChange={(value) => onDataChange({ tipoOS: value })}
          className="space-y-3"
        >
          <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-neutral-50 transition-colors">
            <RadioGroupItem value="OS-05" id="os-05" />
            <Label htmlFor="os-05" className="flex-1 cursor-pointer">
              <div>
                <div className="text-base">OS 05 - Assessoria Técnica Mensal</div>
                <div className="text-sm text-muted-foreground">
                  Contrato anual de assessoria com visitas mensais e acompanhamento contínuo
                </div>
              </div>
            </Label>
          </div>

          <div className="flex items-center space-x-3 border rounded-lg p-4 hover:bg-neutral-50 transition-colors">
            <RadioGroupItem value="OS-06" id="os-06" />
            <Label htmlFor="os-06" className="flex-1 cursor-pointer">
              <div>
                <div className="text-base">OS 06 - Laudo Pontual</div>
                <div className="text-sm text-muted-foreground">
                  Laudo técnico específico ou serviço de assessoria pontual
                </div>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>

      {data.tipoOS && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Check className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-sm">Tipo selecionado:</div>
                <div className="text-base">
                  {data.tipoOS === 'OS-05' ? 'OS 05 - Assessoria Técnica Mensal' : 'OS 06 - Laudo Pontual'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {data.tipoOS === 'OS-05' 
            ? 'Após a conclusão, será criada automaticamente uma OS 12 (Execução de Assessoria).'
            : 'Após a conclusão, será criada automaticamente uma OS 11 (Execução de Laudo).'}
        </AlertDescription>
      </Alert>
    </div>
  );
}
