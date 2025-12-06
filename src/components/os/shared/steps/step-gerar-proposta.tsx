/**
 * StepGerarProposta - Etapa 9 do Workflow OS 1-4
 * 
 * Funcionalidades:
 * - Botão "Gerar Documento" no canto superior direito
 * - Visualizador de PDF embarcado após geração
 * - Toolbar com impressão, download, rotação, navegação
 */

import React, { useState } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { PDFViewerEmbedded } from '@/components/pdf/pdf-viewer-embedded';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';
import { isValidUUID } from '@/lib/utils/os-workflow-helpers';
import { toast } from '@/lib/utils/safe-toast';

interface StepGerarPropostaProps {
  osId: string;
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
  onDataChange: (newData: Record<string, unknown>) => void;
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
  // Hook de geração de PDF
  const { generating, generate } = usePDFGeneration();

  // Estado local do PDF gerado
  const [pdfUrl, setPdfUrl] = useState<string | null>(data.pdfUrl || null);

  // Validar se osId é um UUID válido
  const osIdValido = osId && isValidUUID(osId);

  // Construir dados da proposta
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

  // Handler para gerar PDF
  const handleGeneratePDF = async () => {
    if (!osIdValido) {
      toast.error('ID da OS inválido');
      return;
    }

    try {
      const result = await generate('proposta', osId, propostaData);

      if (result?.success && result.url) {
        setPdfUrl(result.url);
        onDataChange({
          ...data,
          propostaGerada: true,
          dataGeracao: new Date().toISOString().split('T')[0],
          pdfUrl: result.url
        });
        toast.success('Proposta gerada com sucesso!');
      } else {
        toast.error(result?.error || 'Erro ao gerar proposta');
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast.error('Erro ao gerar proposta. Tente novamente.');
    }
  };

  // Nome do arquivo para download
  const filename = `proposta-${osId?.substring(0, 8) || 'draft'}.pdf`;

  return (
    <div className="space-y-4">
      {/* Header com Título e Botão */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-medium">Proposta Comercial</h3>
          {data.propostaGerada && (
            <span className="inline-flex items-center gap-1 text-xs text-success bg-success/10 px-2 py-1 rounded-full">
              <CheckCircle className="h-3 w-3" />
              Gerada em {data.dataGeracao}
            </span>
          )}
        </div>

        {/* Botão Gerar - Canto Superior Direito */}
        {osIdValido && !readOnly && (
          <Button
            onClick={handleGeneratePDF}
            disabled={generating}
            className="min-w-[160px]"
          >
            {generating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <FileText className="h-4 w-4 mr-2" />
                {pdfUrl ? 'Gerar Novamente' : 'Gerar Documento'}
              </>
            )}
          </Button>
        )}
      </div>

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

      {/* Alerta informativo (só mostra se não tem PDF) */}
      {!pdfUrl && osIdValido && (
        <Alert>
          <FileText className="h-4 w-4" />
          <AlertDescription>
            Clique no botão <strong>"Gerar Documento"</strong> para criar a proposta comercial
            automaticamente com base nas informações preenchidas nas etapas anteriores.
          </AlertDescription>
        </Alert>
      )}

      {/* Visualizador de PDF Embarcado */}
      {pdfUrl ? (
        <PDFViewerEmbedded
          pdfUrl={pdfUrl}
          filename={filename}
          height={600}
          showToolbar={true}
          className="mt-4"
        />
      ) : (
        /* Estado Vazio - Antes de Gerar */
        <Card className="border-dashed">
          <CardHeader className="text-center pb-2">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-2" />
            <CardTitle className="text-muted-foreground font-normal">
              Nenhuma proposta gerada ainda
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center text-sm text-muted-foreground">
            <p>
              O documento será exibido aqui após a geração.
            </p>
            <p className="mt-2">
              A proposta incluirá os dados do cliente, memorial descritivo,
              cronograma e valores calculados.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Info sobre dados utilizados (colapsável para debug) */}
      {pdfUrl && (
        <details className="text-xs text-muted-foreground">
          <summary className="cursor-pointer hover:text-foreground">
            Dados utilizados na proposta
          </summary>
          <pre className="mt-2 p-3 bg-muted rounded-md overflow-x-auto">
            {JSON.stringify({
              osId: (osId?.substring(0, 8) || 'N/A') + '...',
              clienteCpfCnpj: cpfCnpjLimpo ? `***${cpfCnpjLimpo.slice(-4)}` : 'N/A',
              valorTotal,
              valorEntrada,
              valorParcela,
              numeroParcelas: etapa8Data.numeroParcelas,
              percentualEntrada: etapa8Data.percentualEntrada
            }, null, 2)}
          </pre>
        </details>
      )}
    </div>
  );
}
