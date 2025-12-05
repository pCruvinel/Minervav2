import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, CheckCircle2, AlertCircle, XCircle } from 'lucide-react';

export interface StepSeguroObrasProps {
  data: { decisaoSeguro: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepSeguroObras({ data, onDataChange, readOnly }: StepSeguroObrasProps) {
  const handleDecisaoChange = (value: string) => {
    onDataChange({ decisaoSeguro: value });
  };

  const isAprovado = data.decisaoSeguro === 'aprovar';
  const isReprovado = data.decisaoSeguro === 'reprovar';

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Contratar Seguro de Obras</h2>
        <p className="text-sm text-muted-foreground">
          Defina se o seguro de obras será contratado para esta obra
        </p>
      </div>

      {/* Status */}
      <div className="border border-border rounded-lg p-6 bg-background">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: !data.decisaoSeguro ? 'var(--primary)' : isAprovado ? 'var(--success)' : 'var(--destructive)'
            }}
          >
            {!data.decisaoSeguro ? (
              <Shield className="w-6 h-6 text-white" />
            ) : isAprovado ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <XCircle className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-base mb-2">
              {!data.decisaoSeguro 
                ? 'Aguardando decisão sobre o seguro' 
                : isAprovado 
                  ? 'Seguro de obras aprovado' 
                  : 'Seguro de obras não será contratado'
              }
            </h3>
            <p className="text-sm text-muted-foreground">
              {!data.decisaoSeguro 
                ? 'Selecione uma opção abaixo para definir a contratação do seguro'
                : isAprovado 
                  ? 'O seguro de obras foi aprovado e deverá ser contratado'
                  : 'A obra prosseguirá sem contratação de seguro'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Radio Group */}
      <div className="space-y-4">
        <Label className="text-base">
          Decisão sobre Contratação do Seguro <span className="text-destructive">*</span>
        </Label>
        
        <RadioGroup value={data.decisaoSeguro} onValueChange={handleDecisaoChange} disabled={readOnly}>
          <Card
            className={`transition-all ${
              data.decisaoSeguro === 'aprovar' ? 'border-success bg-success/5' : 'hover:border-border'
            } ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={readOnly ? undefined : () => handleDecisaoChange('aprovar')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="aprovar" id="aprovar" />
                <div className="flex-1">
                  <Label htmlFor="aprovar" className="cursor-pointer text-base">
                    Aprovar Contratação do Seguro
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    O seguro de obras será contratado para cobrir riscos durante a execução
                  </p>
                </div>
                {isAprovado && (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card
            className={`transition-all ${
              data.decisaoSeguro === 'reprovar' ? 'border-destructive bg-destructive/5' : 'hover:border-border'
            } ${readOnly ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            onClick={readOnly ? undefined : () => handleDecisaoChange('reprovar')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <RadioGroupItem value="reprovar" id="reprovar" />
                <div className="flex-1">
                  <Label htmlFor="reprovar" className="cursor-pointer text-base">
                    Reprovar Contratação do Seguro
                  </Label>
                  <p className="text-sm text-muted-foreground mt-1">
                    A obra prosseguirá sem contratação de seguro
                  </p>
                </div>
                {isReprovado && (
                  <XCircle className="w-5 h-5 text-destructive" />
                )}
              </div>
            </CardContent>
          </Card>
        </RadioGroup>
      </div>

      {/* Alertas Condicionais */}
      {isAprovado && (
        <Alert className="bg-success/5 border-success/20">
          <CheckCircle2 className="h-4 w-4 text-success" />
          <AlertDescription className="text-success">
            Seguro aprovado. Proceda com a contratação junto à seguradora e anexe a apólice nas próximas etapas.
          </AlertDescription>
        </Alert>
      )}

      {isReprovado && (
        <Alert className="bg-destructive/5 border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-destructive">
            Atenção: A obra prosseguirá sem seguro. Certifique-se de que esta decisão está de acordo com as políticas da empresa e contrato com o cliente.
          </AlertDescription>
        </Alert>
      )}

      {!data.decisaoSeguro && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            O seguro de obras cobre danos materiais à obra, equipamentos e terceiros. Avalie os riscos antes de tomar a decisão.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
