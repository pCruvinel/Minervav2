import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Upload, Download, File, FileText, X } from 'lucide-react';

interface StepGerarContratoProps {
  data: {
    contratoFile: File | null;
    dataUpload: string;
  };
  onDataChange: (data: any) => void;
}

export function StepGerarContrato({ data, onDataChange }: StepGerarContratoProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Baixe o modelo de contrato, preencha e faça o upload do documento assinado.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Baixar Modelo</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8 gap-4">
            <Download className="h-12 w-12 text-muted-foreground" />
            <p className="text-sm text-muted-foreground text-center">
              Baixe o modelo de contrato padrão
            </p>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Baixar Modelo de Contrato (.docx)
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">2. Upload do Contrato</CardTitle>
          </CardHeader>
          <CardContent className="py-8">
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm mb-2">
                Clique para fazer upload ou arraste o arquivo
              </p>
              <p className="text-xs text-muted-foreground">
                PDF, DOCX até 10MB
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {data.contratoFile && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm">Contrato enviado com sucesso!</div>
                  <div className="text-xs text-muted-foreground">
                    {data.contratoFile.name}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onDataChange({ contratoFile: null, dataUpload: '' })}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
