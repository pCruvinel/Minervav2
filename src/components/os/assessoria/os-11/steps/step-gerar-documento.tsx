import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileText, Download, RefreshCw, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

interface StepGerarDocumentoData {
    documentoGerado: boolean;
    urlDocumento: string;
    dataGeracao: string;
    templateUsado: string;
}

interface StepGerarDocumentoProps {
    data: StepGerarDocumentoData;
    onDataChange: (d: StepGerarDocumentoData) => void;
    readOnly?: boolean;
    osId?: string;
    clienteData?: {
        nomeCliente: string;
        cpfCnpj: string;
        endereco: string;
        tipoImovel: string;
    };
    visitaData?: {
        respostas: Record<string, string>;
        observacoesVisita: string;
        fotos: string[];
    };
    rtData?: {
        profissionalResponsavel: string;
        crea: string;
        numeroRT: string;
    };
}

export function StepGerarDocumento({
    data,
    onDataChange,
    readOnly,
    osId,
    clienteData,
    visitaData,
    rtData
}: StepGerarDocumentoProps) {
    // Usar o hook real de geração de PDF
    const { generating, generate, error: pdfError } = usePDFGeneration();

    /**
     * Gera o Laudo Técnico usando a Edge Function generate-pdf
     * Template: 'laudo-tecnico'
     */
    const handleGerarDocumento = async () => {
        if (readOnly || !osId) return;

        // Preparar dados para a Edge Function
        const dadosLaudo = {
            template: 'laudo-tecnico',
            cliente: clienteData,
            vistoria: visitaData,
            responsavelTecnico: rtData,
            dataEmissao: new Date().toISOString(),
        };

        // Chamar Edge Function generate-pdf
        const result = await generate('laudo-tecnico', osId, dadosLaudo);

        if (result?.success && result.url) {
            onDataChange({
                ...data,
                documentoGerado: true,
                urlDocumento: result.url,
                dataGeracao: new Date().toISOString(),
                templateUsado: 'laudo-tecnico',
            });
        }
    };

    const handleDownload = () => {
        if (data.urlDocumento) {
            window.open(data.urlDocumento, '_blank');
        }
    };

    const formatDate = (isoDate: string) => {
        if (!isoDate) return '';
        return new Date(isoDate).toLocaleString('pt-BR');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Gerar Documento</h2>
                    <p className="text-sm text-muted-foreground">
                        Gere o Laudo Técnico automaticamente com base nos dados coletados
                    </p>
                </div>
            </div>

            {/* Resumo dos Dados */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Dados para Geração do Laudo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-muted-foreground">Cliente:</span>
                            <p className="font-medium">{clienteData?.nomeCliente || '-'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Tipo de Imóvel:</span>
                            <p className="font-medium">{clienteData?.tipoImovel || '-'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Responsável Técnico:</span>
                            <p className="font-medium">{rtData?.profissionalResponsavel || '-'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">CREA/CAU:</span>
                            <p className="font-medium">{rtData?.crea || '-'}</p>
                        </div>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Respostas do Questionário:</span>
                        <p className="font-medium">
                            {Object.keys(visitaData?.respostas || {}).length} item(s) preenchido(s)
                        </p>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Fotos Anexadas:</span>
                        <p className="font-medium">{(visitaData?.fotos || []).length} foto(s)</p>
                    </div>
                </CardContent>
            </Card>

            {/* Erro de PDF */}
            {pdfError && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                        Erro ao gerar PDF: {pdfError.message}
                    </AlertDescription>
                </Alert>
            )}

            {/* Geração do Documento */}
            {!data.documentoGerado ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-medium">Gerar Laudo Técnico</p>
                                <p className="text-xs text-muted-foreground">
                                    O documento será gerado automaticamente usando o template &ldquo;laudo-tecnico&rdquo;
                                </p>
                            </div>
                            <Button
                                onClick={handleGerarDocumento}
                                disabled={readOnly || generating || !osId}
                                size="lg"
                            >
                                {generating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Gerando...
                                    </>
                                ) : (
                                    <>
                                        <FileText className="w-4 h-4 mr-2" />
                                        Gerar Laudo Técnico
                                    </>
                                )}
                            </Button>
                            {!osId && (
                                <p className="text-xs text-warning">
                                    Salve a OS primeiro para gerar o documento
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-success/50 bg-success/5">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-success/10 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium">Laudo Técnico Gerado</p>
                                    <p className="text-xs text-muted-foreground">
                                        Gerado em {formatDate(data.dataGeracao)}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge className="bg-success">PDF Pronto</Badge>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                            <Button variant="outline" onClick={handleDownload}>
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF
                            </Button>
                            <Button
                                variant="ghost"
                                onClick={handleGerarDocumento}
                                disabled={readOnly || generating}
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerar
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                    <strong>Edge Function:</strong> Este documento é gerado pela Edge Function
                    <code className="mx-1 px-1 py-0.5 bg-primary/10 rounded text-xs">generate-pdf</code>
                    utilizando o template <code className="mx-1 px-1 py-0.5 bg-primary/10 rounded text-xs">laudo-tecnico</code>.
                </AlertDescription>
            </Alert>
        </div>
    );
}