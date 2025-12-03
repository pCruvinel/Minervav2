import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, CheckCircle, Eye, AlertCircle } from 'lucide-react';
import { PDFDownloadButton } from '@/components/pdf/pdf-download-button';
import { PDFPreviewModal } from '@/components/pdf/pdf-preview-modal';
import { isValidUUID } from '@/lib/utils/os-workflow-helpers';

interface StepGerarPropostaProps {
  osId: string; // ✅ FIX: osId como prop separada obrigatória
  etapa1Data?: {
    nome?: string;
    cpfCnpj?: string;
    email?: string;
    telefone?: string;
    [key: string]: unknown;
  };
  etapa2Data?: {
    tipoOS?: string;
    [key: string]: unknown;
  };
  etapa7Data?: {
    objetivo?: string;
    etapasPrincipais?: unknown[];
    [key: string]: unknown;
  };
  etapa8Data?: {
    percentualEntrada?: string;
    numeroParcelas?: string;
    percentualImposto?: string;
    [key: string]: unknown;
  };
  valorTotal?: number;
  valorEntrada?: number;
  valorParcela?: number;
  data: {
    propostaGerada?: boolean;
    dataGeracao?: string;
    pdfUrl?: string;
    codigoProposta?: string;
    validadeDias?: string;
    garantiaMeses?: string;
    [key: string]: unknown;
  };
  // eslint-disable-next-line no-unused-vars
  onDataChange: (data: Record<string, unknown>) => void;
  readOnly?: boolean;
}

export function StepGerarProposta({
  osId,
  etapa1Data = {},
  etapa8Data = {},
  valorTotal = 0,
  valorEntrada = 0,
  valorParcela = 0,
  data,
  onDataChange,
  readOnly = false
}: StepGerarPropostaProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleSuccess = (url: string) => {
    onDataChange({
      ...data,
      propostaGerada: true,
      dataGeracao: new Date().toISOString().split('T')[0],
      pdfUrl: url
    });
  };

  // ✅ FIX: Construir dados da proposta a partir das props recebidas
  // Remover máscara do CNPJ para enviar ao backend
  const cpfCnpjLimpo = (etapa1Data.cpfCnpj || '').replace(/\D/g, '');

  const propostaData = {
    clienteCpfCnpj: cpfCnpjLimpo,
    dadosFinanceiros: {
      precoFinal: valorTotal.toString(),
      valorEntrada: valorEntrada.toString(),
      valorParcela: valorParcela.toString(),
      numeroParcelas: etapa8Data.numeroParcelas || '1',
      percentualEntrada: etapa8Data.percentualEntrada || '0',
      percentualImposto: etapa8Data.percentualImposto || '0',
    }
  };

  // ✅ FIX: Validar se osId é um UUID válido (não a string "undefined")
  const osIdValido = osId && isValidUUID(osId);

  return (
    <div className="space-y-6">
      {/* Alerta de osId inválido */}
      {!osIdValido && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erro:</strong> ID da OS não está disponível ou é inválido.
            Certifique-se de que a OS foi criada corretamente nas etapas anteriores.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Clique no botão abaixo para gerar a proposta comercial automaticamente com base nas informações preenchidas.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col items-center justify-center py-8 gap-4 border-2 border-dashed rounded-lg">
        <FileText className="h-16 w-16 text-muted-foreground" />

        <div className="flex gap-3">
          {osIdValido && !readOnly ? (
            <PDFDownloadButton
              tipo="proposta"
              osId={osId}
              dados={propostaData}
              onSuccess={handleSuccess}
              variant="default"
            >
              <FileText className="w-4 h-4 mr-2" />
              Gerar Proposta Comercial
            </PDFDownloadButton>
          ) : (
            <button
              disabled
              className="px-4 py-2 text-sm bg-muted text-muted-foreground rounded-md cursor-not-allowed flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              {!osIdValido ? 'OS não disponível' : 'Modo de visualização'}
            </button>
          )}

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

      {osIdValido && (
        <PDFPreviewModal
          isOpen={showPreview}
          onClose={() => setShowPreview(false)}
          tipo="proposta"
          osId={osId}
          dados={propostaData}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
}
