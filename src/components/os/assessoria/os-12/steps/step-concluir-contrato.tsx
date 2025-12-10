/**
 * StepConcluirContrato - Etapa 8 da OS-12
 * 
 * Conclusão da OS e transformação em contrato ativo
 */

import React from 'react';
import { CheckCircle2, FileCheck, Award } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

export interface StepConcluirContratoData {
    contratoAtivo?: boolean;
    dataAtivacao?: string;
    observacoesFinais?: string;
    confirmacaoTermos?: boolean;
}

export interface StepConcluirContratoProps {
    data: StepConcluirContratoData;
    onDataChange: (data: StepConcluirContratoData) => void;
    readOnly?: boolean;
    clienteNome?: string;
}

export function StepConcluirContrato({ data, onDataChange, readOnly, clienteNome }: StepConcluirContratoProps) {
    const isComplete = data.contratoAtivo === true && data.confirmacaoTermos === true;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl mb-1">Concluir e Ativar Contrato</h2>
                <p className="text-sm text-muted-foreground">
                    Finalize a OS e transforme em contrato de assessoria ativo
                </p>
            </div>

            {/* Status */}
            <div className="border border-border rounded-lg p-6 bg-background">
                <div className="flex items-start gap-4">
                    <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: isComplete ? 'var(--success)' : 'var(--primary)' }}
                    >
                        {isComplete ? (
                            <Award className="w-6 h-6 text-white" />
                        ) : (
                            <FileCheck className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base mb-2">
                            {isComplete ? '🎉 Contrato Ativado com Sucesso!' : 'Finalizar Contrato'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isComplete
                                ? `Contrato de assessoria para ${clienteNome || 'o cliente'} está ativo.`
                                : 'Confirme os termos para ativar o contrato de assessoria.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Resumo */}
            <Card>
                <CardHeader>
                    <CardTitle>Resumo do Contrato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Cliente</div>
                            <div className="font-semibold">{clienteNome || 'Não informado'}</div>
                        </div>
                        <div className="p-4 bg-muted rounded-lg">
                            <div className="text-sm text-muted-foreground">Status</div>
                            <Badge variant={data.contratoAtivo ? 'default' : 'secondary'}>
                                {data.contratoAtivo ? 'Ativo' : 'Pendente'}
                            </Badge>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Confirmação */}
            <Card>
                <CardHeader>
                    <CardTitle>Ativação do Contrato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                        <Checkbox
                            id="confirmacaoTermos"
                            checked={data.confirmacaoTermos || false}
                            onCheckedChange={(checked) => onDataChange({
                                ...data,
                                confirmacaoTermos: checked === true
                            })}
                            disabled={readOnly}
                        />
                        <div>
                            <Label htmlFor="confirmacaoTermos" className="text-base cursor-pointer">
                                Confirmo que todas as etapas foram concluídas
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                                ART anexada, plano de manutenção enviado e visitas realizadas.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border border-primary/20 bg-primary/5 rounded-lg">
                        <Checkbox
                            id="contratoAtivo"
                            checked={data.contratoAtivo || false}
                            onCheckedChange={(checked) => onDataChange({
                                ...data,
                                contratoAtivo: checked === true,
                                dataAtivacao: checked ? new Date().toISOString() : ''
                            })}
                            disabled={readOnly || !data.confirmacaoTermos}
                        />
                        <div>
                            <Label htmlFor="contratoAtivo" className="text-base cursor-pointer font-semibold">
                                Ativar Contrato de Assessoria
                            </Label>
                            <p className="text-sm text-muted-foreground mt-1">
                                O contrato será marcado como ativo e as visitas recorrentes serão monitoradas.
                            </p>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacoesFinais">Observações Finais</Label>
                        <Textarea
                            id="observacoesFinais"
                            value={data.observacoesFinais || ''}
                            onChange={(e) => onDataChange({ ...data, observacoesFinais: e.target.value })}
                            placeholder="Observações gerais sobre o contrato..."
                            disabled={readOnly}
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>

            {isComplete && (
                <Alert className="bg-success/10 border-success/20">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    <AlertDescription className="text-success">
                        Contrato de assessoria ativado com sucesso! O cliente agora tem acesso ao portal e as visitas recorrentes serão monitoradas.
                    </AlertDescription>
                </Alert>
            )}
        </div>
    );
}
