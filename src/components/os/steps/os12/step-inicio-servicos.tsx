import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Play, CheckCircle2, Loader2, ExternalLink, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from '@/lib/utils/safe-toast';

interface StepInicioServicosProps {
    data: {
        contratoAtivado: boolean;
        dataAtivacao: string;
        primeiraVisitaAgendada: boolean;
        observacoes: string;
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
    clienteData?: {
        nomeCliente: string;
        tipoContrato: string;
        valorMensal: string;
    };
    slaData?: {
        visitasSemanais: number;
        servicosIncluidos: string[];
    };
}

export function StepInicioServicos({
    data,
    onDataChange,
    readOnly,
    clienteData,
    slaData
}: StepInicioServicosProps) {
    const [isActivating, setIsActivating] = useState(false);

    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const handleAtivarContrato = async () => {
        if (readOnly) return;

        setIsActivating(true);

        try {
            // Simular ativação do contrato
            await new Promise(resolve => window.setTimeout(resolve, 2000));

            onDataChange({
                ...data,
                contratoAtivado: true,
                dataAtivacao: new Date().toISOString(),
                primeiraVisitaAgendada: true,
            });

            toast.success('Contrato ativado com sucesso! Primeira visita agendada automaticamente.');
        } catch {
            toast.error('Erro ao ativar contrato');
        } finally {
            setIsActivating(false);
        }
    };

    const formatDate = (isoDate: string) => {
        if (!isoDate) return '-';
        return new Date(isoDate).toLocaleString('pt-BR');
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Play className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Início dos Serviços</h2>
                    <p className="text-sm text-muted-foreground">
                        Revise as configurações e ative o contrato de assessoria
                    </p>
                </div>
            </div>

            {/* Resumo do Contrato */}
            <Card>
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Resumo do Contrato
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <span className="text-muted-foreground">Cliente:</span>
                            <p className="font-medium">{clienteData?.nomeCliente || '-'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Tipo:</span>
                            <p className="font-medium capitalize">{clienteData?.tipoContrato || '-'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Valor Mensal:</span>
                            <p className="font-medium">{clienteData?.valorMensal || '-'}</p>
                        </div>
                        <div>
                            <span className="text-muted-foreground">Visitas/Semana:</span>
                            <p className="font-medium">{slaData?.visitasSemanais || '-'}</p>
                        </div>
                    </div>

                    {(slaData?.servicosIncluidos || []).length > 0 && (
                        <div>
                            <span className="text-sm text-muted-foreground">Serviços Incluídos:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                                {slaData?.servicosIncluidos.map((servico, index) => (
                                    <Badge key={index} variant="outline" className="text-xs">{servico}</Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ativação do Contrato */}
            {!data.contratoAtivado ? (
                <Card className="border-dashed">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <div className="p-4 bg-primary/10 rounded-full">
                                <Play className="w-8 h-8 text-primary" />
                            </div>
                            <div className="text-center">
                                <p className="font-medium">Pronto para Iniciar</p>
                                <p className="text-sm text-muted-foreground">
                                    Ao ativar, o sistema irá:
                                </p>
                                <ul className="text-sm text-muted-foreground mt-2 text-left list-disc list-inside">
                                    <li>Gerar todas as parcelas financeiras</li>
                                    <li>Reservar as visitas no calendário</li>
                                    <li>Notificar a equipe responsável</li>
                                    <li>Criar a página customizada do cliente</li>
                                </ul>
                            </div>
                            <Button
                                onClick={handleAtivarContrato}
                                disabled={readOnly || isActivating}
                                size="lg"
                                className="mt-4"
                            >
                                {isActivating ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Ativando...
                                    </>
                                ) : (
                                    <>
                                        <Play className="w-4 h-4 mr-2" />
                                        Ativar Contrato
                                    </>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card className="border-success/50 bg-success/5">
                        <CardContent className="pt-4">
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-success/10 rounded-lg">
                                        <CheckCircle2 className="w-5 h-5 text-success" />
                                    </div>
                                    <div>
                                        <p className="font-medium">Contrato Ativado</p>
                                        <p className="text-xs text-muted-foreground">
                                            Ativado em {formatDate(data.dataAtivacao)}
                                        </p>
                                    </div>
                                </div>
                                <Badge className="bg-success">Ativo</Badge>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Status das Integrações */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Primeira Visita</span>
                                    </div>
                                    {data.primeiraVisitaAgendada ? (
                                        <Badge className="bg-success">Agendada</Badge>
                                    ) : (
                                        <Badge variant="outline">Pendente</Badge>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="pt-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-muted-foreground" />
                                        <span className="text-sm">Parcelas Financeiras</span>
                                    </div>
                                    <Badge className="bg-success">Geradas</Badge>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Links Rápidos */}
                    <div className="space-y-2">
                        <Label>Ações Rápidas</Label>
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" size="sm">
                                <Calendar className="w-4 h-4 mr-2" />
                                Ver Calendário
                                <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                            <Button variant="outline" size="sm">
                                <FileText className="w-4 h-4 mr-2" />
                                Página do Cliente
                                <ExternalLink className="w-3 h-3 ml-2" />
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Observações */}
            <div className="space-y-2">
                <Label htmlFor="observacoes">Observações Finais</Label>
                <Textarea
                    id="observacoes"
                    value={data.observacoes}
                    onChange={(e) => handleInputChange('observacoes', e.target.value)}
                    placeholder="Observações adicionais sobre o início do contrato..."
                    rows={3}
                    disabled={readOnly}
                />
            </div>

            <Alert className="bg-primary/5 border-primary/20">
                <AlertCircle className="h-4 w-4 text-primary" />
                <AlertDescription className="text-primary">
                    <strong>Página Customizada:</strong> O cliente terá acesso a uma página exclusiva com histórico
                    de todas as OS (07 e 08), relatórios mensais, documentos e botão direto para abrir chamadas.
                </AlertDescription>
            </Alert>
        </div>
    );
}