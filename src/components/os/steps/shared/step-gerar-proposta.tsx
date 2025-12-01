import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, CheckCircle, Eye } from 'lucide-react';
import { PDFDownloadButton } from '@/components/pdf/pdf-download-button';
import { PDFPreviewModal } from '@/components/pdf/pdf-preview-modal';

interface StepGerarPropostaProps {
  data: {
    propostaGerada?: boolean;
    dataGeracao?: string;
    pdfUrl?: string;
    // Dados necessários para gerar a proposta
    osId: string;
    codigoOS: string;
    clienteNome: string;
    clienteCpfCnpj: string;
    clienteEmail?: string;
    clienteTelefone?: string;
    descricaoServico?: string;
    valorProposta: number;
    [key: string]: unknown;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepGerarProposta({ data, onDataChange, readOnly = false }: StepGerarPropostaProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleSuccess = (url: string) => {
    onDataChange({
      ...data,
      propostaGerada: true,
      dataGeracao: new Date().toISOString().split('T')[0],
      pdfUrl: url
    });
  };

  const propostaData = {
    codigoOS: data.codigoOS,
    tipoOS: 'Proposta Comercial',
    dataEmissao: new Date().toISOString(),
    clienteNome: data.clienteNome,
    clienteCpfCnpj: data.clienteCpfCnpj,
    clienteEmail: data.clienteEmail,
    clienteTelefone: data.clienteTelefone,
    descricaoServico: data.descricaoServico || 'Serviços de engenharia conforme solicitado',
    valorProposta: data.valorProposta,
    ...data
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

        <div className="flex gap-3">
          <PDFDownloadButton
            tipo="proposta"
            osId={data.osId}
            dados={propostaData}
            onSuccess={handleSuccess}
            variant="default"
            disabled={readOnly}
          >
            <FileText className="w-4 h-4 mr-2" />
            Gerar Proposta Comercial
          </PDFDownloadButton>

          <button
            onClick={() => setShowPreview(true)}
            className="px-4 py-2 text-sm border border-border rounded-md hover:bg-background flex items-center gap-2"
            disabled={readOnly}
          >
            <Eye className="w-4 h-4" />
            Preview
          </button>
        </div>
      </div>

      {data.propostaGerada && data.pdfUrl && (
        <Card className="bg-success/5 border-success/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <div>
                  <div className="text-sm">Proposta gerada com sucesso!</div>
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
        tipo="proposta"
        osId={data.osId}
        dados={propostaData}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
