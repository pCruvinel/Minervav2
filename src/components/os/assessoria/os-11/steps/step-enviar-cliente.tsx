import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Send, CheckCircle2, Mail, Loader2, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/utils/safe-toast';

interface StepEnviarClienteProps {
    data: {
        enviado: boolean;
        dataEnvio: string;
        emailEnviado: string;
        confirmacaoRecebimento: boolean;
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
    clienteEmail?: string;
    documentoUrl?: string;
}

export function StepEnviarCliente({
    data,
    onDataChange,
    readOnly,
    clienteEmail,
    documentoUrl
}: StepEnviarClienteProps) {
    const [isSending, setIsSending] = useState(false);
    const [emailDestino, setEmailDestino] = useState(clienteEmail || '');

    const handleEnviarDocumento = async () => {
        if (readOnly || !documentoUrl) return;

        setIsSending(true);

        try {
            // TODO: Integrar com serviço de e-mail
            // await sendEmail({ to: emailDestino, subject: 'Laudo Técnico', attachmentUrl: documentoUrl });

            // Simulação de envio
            await new Promise(resolve => window.setTimeout(resolve, 1500));

            onDataChange({
                ...data,
                enviado: true,
                dataEnvio: new Date().toISOString(),
                emailEnviado: emailDestino,
            });

            toast.success('Documento enviado com sucesso!');
        } catch {
            toast.error('Erro ao enviar documento');
        } finally {
            setIsSending(false);
        }
    };

    const handleConfirmacaoChange = (checked: boolean) => {
        if (readOnly) return;
        onDataChange({ ...data, confirmacaoRecebimento: checked });
    };

    const formatDate = (isoDate: string) => {
        if (!isoDate) return '';
        return new Date(isoDate).toLocaleString('pt-BR');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Send className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Enviar ao Cliente</h2>
                    <p className="text-sm text-muted-foreground">
                        Envie o Laudo Técnico gerado diretamente para o e-mail do cliente
                    </p>
                </div>
            </div>

            {/* Status do Documento */}
            {!documentoUrl && (
                <Alert className="border-warning bg-warning/5">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <AlertDescription className="text-warning">
                        O documento ainda não foi gerado. Retorne à etapa anterior para gerar o Laudo Técnico.
                    </AlertDescription>
                </Alert>
            )}

            {/* Formulário de Envio */}
            {!data.enviado ? (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="emailDestino">
                                E-mail do Destinatário <span className="text-destructive">*</span>
                            </Label>
                            <Input
                                id="emailDestino"
                                type="email"
                                value={emailDestino}
                                onChange={(e) => setEmailDestino(e.target.value)}
                                placeholder="email@cliente.com"
                                disabled={readOnly}
                            />
                            <p className="text-xs text-muted-foreground">
                                E-mail cadastrado do cliente: {clienteEmail || 'Não informado'}
                            </p>
                        </div>

                        {documentoUrl && (
                            <div className="p-4 bg-muted rounded-lg">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Mail className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Documento a ser enviado:</span>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={() => window.open(documentoUrl, '_blank')}>
                                        <ExternalLink className="w-4 h-4 mr-1" />
                                        Visualizar
                                    </Button>
                                </div>
                            </div>
                        )}

                        <Button
                            onClick={handleEnviarDocumento}
                            disabled={readOnly || isSending || !documentoUrl || !emailDestino}
                            className="w-full"
                            size="lg"
                        >
                            {isSending ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4 mr-2" />
                                    Enviar Laudo por E-mail
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card className="border-success/50 bg-success/5">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-success/10 rounded-lg">
                                    <CheckCircle2 className="w-5 h-5 text-success" />
                                </div>
                                <div>
                                    <p className="font-medium">Documento Enviado</p>
                                    <p className="text-xs text-muted-foreground">
                                        Enviado em {formatDate(data.dataEnvio)}
                                    </p>
                                </div>
                            </div>
                            <Badge className="bg-success">Enviado</Badge>
                        </div>

                        <div className="space-y-2 text-sm p-4 bg-white/50 rounded-lg">
                            <div className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-muted-foreground" />
                                <span className="text-muted-foreground">Enviado para:</span>
                                <span className="font-medium">{data.emailEnviado}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Confirmação de Recebimento */}
            {data.enviado && (
                <Card>
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Switch
                                    checked={data.confirmacaoRecebimento}
                                    onCheckedChange={handleConfirmacaoChange}
                                    disabled={readOnly}
                                />
                                <div>
                                    <Label className="text-base">Confirmação de Recebimento</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Marque quando o cliente confirmar o recebimento do documento
                                    </p>
                                </div>
                            </div>
                            {data.confirmacaoRecebimento && (
                                <Badge className="bg-success">Confirmado</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>
            )}

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Após o envio, o cliente receberá o Laudo Técnico em formato PDF no e-mail informado.
                    Esta OS será automaticamente finalizada após a confirmação de recebimento.
                </AlertDescription>
            </Alert>
        </div>
    );
}