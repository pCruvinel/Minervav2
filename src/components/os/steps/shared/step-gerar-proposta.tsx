import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { FileText, Download, CheckCircle } from 'lucide-react';

interface StepGerarPropostaProps {
  data: {
    propostaGerada: boolean;
    dataGeracao: string;
  };
  onDataChange: (data: any) => void;
}

export function StepGerarProposta({ data, onDataChange }: StepGerarPropostaProps) {
  const handleGerarProposta = () => {
    onDataChange({
      propostaGerada: true,
      dataGeracao: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Clique no botão abaixo para gerar a proposta comercial automaticamente com base nas informações preenchidas.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed rounded-lg">
        <FileText className="h-16 w-16 text-muted-foreground" />
        <Button
          onClick={handleGerarProposta}
          className="bg-primary text-white hover:bg-primary/90"
        >
          <FileText className="w-4 h-4 mr-2" />
          Gerar Proposta Comercial
        </Button>
      </div>

      {data.propostaGerada && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm">Proposta gerada com sucesso!</div>
                  <div className="text-xs text-muted-foreground">
                    Data: {data.dataGeracao}
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Baixar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
