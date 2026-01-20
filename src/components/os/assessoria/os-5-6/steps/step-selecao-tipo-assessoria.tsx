// React import não necessário com JSX Transform do React 17+
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Check } from 'lucide-react';

interface StepSelecaoTipoAssessoriaProps {
  data: {
    tipoOS: string;
  };
  onDataChange: (data: { tipoOS: string }) => void;
  /** Modo somente leitura */
  readOnly?: boolean;
}

export function StepSelecaoTipoAssessoria({
  data,
  onDataChange: _onDataChange,
  readOnly = false
}: StepSelecaoTipoAssessoriaProps) {
  // Em modo read-only, mostrar apenas o resumo
  if (readOnly) {
    return (
      <Card className="bg-muted/30 border-muted">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Check className="h-5 w-5 text-success" />
            <div>
              <div className="text-sm text-muted-foreground">Tipo selecionado:</div>
              <div className="text-base font-medium">
                {data.tipoOS === 'OS-05' ? 'OS 05 - Assessoria Técnica Mensal' : 'OS 06 - Laudo Pontual'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <RadioGroup
        value={data.tipoOS}
        onValueChange={(value) => _onDataChange({ tipoOS: value })}
        className="space-y-3"
      >
        <div className={`flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer ${data.tipoOS === 'OS-05' ? 'border-primary bg-primary/5' : ''}`}>
          <RadioGroupItem value="OS-05" id="os-05" />
          <Label htmlFor="os-05" className="flex-1 cursor-pointer">
            <div>
              <div className="text-base font-medium">OS 05 - Assessoria Técnica Mensal</div>
              <div className="text-sm text-muted-foreground">
                Contrato anual de assessoria com visitas mensais e acompanhamento contínuo
              </div>
            </div>
          </Label>
        </div>

        <div className={`flex items-center space-x-3 border rounded-lg p-4 hover:bg-accent/5 transition-colors cursor-pointer ${data.tipoOS === 'OS-06' ? 'border-primary bg-primary/5' : ''}`}>
          <RadioGroupItem value="OS-06" id="os-06" />
          <Label htmlFor="os-06" className="flex-1 cursor-pointer">
            <div>
              <div className="text-base font-medium">OS 06 - Laudo Pontual</div>
              <div className="text-sm text-muted-foreground">
                Laudo técnico específico ou serviço de assessoria pontual
              </div>
            </div>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
