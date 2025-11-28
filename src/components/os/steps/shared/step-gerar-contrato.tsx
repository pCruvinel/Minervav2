import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, CheckCircle, Eye } from 'lucide-react';
import { PDFDownloadButton } from '@/components/pdf/pdf-download-button';
import { PDFPreviewModal } from '@/components/pdf/pdf-preview-modal';

interface StepGerarContratoProps {
  data: {
    contratoGerado?: boolean;
    dataGeracao?: string;
    pdfUrl?: string;
    // Dados necessários para gerar o contrato
    osId: string;
    codigoOS: string;
    numeroContrato?: string;
    clienteNome: string;
    clienteCpfCnpj: string;
    valorContrato: number;
    dataInicio: string;
    objetoContrato?: string;
    [key: string]: unknown;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepGerarContrato({ data, onDataChange, readOnly = false }: StepGerarContratoProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleSuccess = (url: string) => {
    onDataChange({
      ...data,
      contratoGerado: true,
      dataGeracao: new Date().toISOString().split('T')[0],
      pdfUrl: url
    });
  };

  const contratoData = {
    codigoOS: data.codigoOS,
    numeroContrato: data.numeroContrato || `CONT-${data.osId}`,
    dataEmissao: new Date().toISOString(),
    dataInicio: data.dataInicio,
    contratanteNome: data.clienteNome,
    contratanteCpfCnpj: data.clienteCpfCnpj,
    contratadoNome: 'Minerva Engenharia',
    contratadoCnpj: '00.000.000/0000-00',
    objetoContrato: data.objetoContrato || 'Prestação de serviços de engenharia conforme proposta comercial aceita',
    valorContrato: data.valorContrato,
    ...data
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Clique no botão abaixo para gerar o contrato de prestação de serviços automaticamente com base nas informações preenchidas.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed rounded-lg">
        <FileText className="h-16 w-16 text-muted-foreground" />

        <div className="flex gap-3">
          <PDFDownloadButton
            tipo="contrato"
            osId={data.osId}
            dados={contratoData}
            onSuccess={handleSuccess}
            variant="default"
            disabled={readOnly}
          >
            <FileText className="w-4 h-4 mr-2" />
            Gerar Contrato
          </PDFDownloadButton>

          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 flex items-center gap-2"
            disabled={readOnly}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {data.contratoGerado && data.pdfUrl && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <div className="text-sm">Contrato gerado com sucesso!</div>
                  <div className="text-xs text-muted-foreground">
                    Data: {data.dataGeracao}
                  </div>
                </div>
              </div>
              <a
                href={data.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                Visualizar PDF
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      <PDFPreviewModal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        tipo="contrato"
        osId={data.osId}
        dados={contratoData}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
