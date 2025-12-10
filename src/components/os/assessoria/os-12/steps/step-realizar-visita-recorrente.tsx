/**
 * StepRealizarVisitaRecorrente - Etapa 7 da OS-12
 * 
 * Registro de visitas recorrentes realizadas
 */

import React from 'react';
import { CheckCircle2, ClipboardCheck, Plus } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface VisitaRegistro {
    id: string;
    data: string;
    hora: string;
    observacoes: string;
    realizada: boolean;
}

export interface StepRealizarVisitaRecorrenteData {
    visitaAtualRealizada?: boolean;
    dataVisitaAtual?: string;
    horaVisitaAtual?: string;
    observacoesVisitaAtual?: string;
    historicoVisitas?: VisitaRegistro[];
}

export interface StepRealizarVisitaRecorrenteProps {
    data: StepRealizarVisitaRecorrenteData;
    onDataChange: (data: StepRealizarVisitaRecorrenteData) => void;
    readOnly?: boolean;
}

export function StepRealizarVisitaRecorrente({ data, onDataChange, readOnly }: StepRealizarVisitaRecorrenteProps) {
    const isComplete = data.visitaAtualRealizada === true;
    const historicoVisitas = data.historicoVisitas || [];

    const registrarVisita = () => {
        if (!data.dataVisitaAtual) return;

        const novaVisita: VisitaRegistro = {
            id: Date.now().toString(),
            data: data.dataVisitaAtual,
            hora: data.horaVisitaAtual || '',
            observacoes: data.observacoesVisitaAtual || '',
            realizada: true
        };

        onDataChange({
            ...data,
            historicoVisitas: [...historicoVisitas, novaVisita],
            visitaAtualRealizada: true,
            dataVisitaAtual: '',
            horaVisitaAtual: '',
            observacoesVisitaAtual: ''
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl mb-1">Realizar Visita Recorrente</h2>
                <p className="text-sm text-muted-foreground">
                    Registre a realização das visitas recorrentes
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
                            <CheckCircle2 className="w-6 h-6 text-white" />
                        ) : (
                            <ClipboardCheck className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base mb-2">
                            {isComplete ? 'Visita recorrente registrada!' : 'Registre a visita'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {historicoVisitas.length > 0
                                ? `${historicoVisitas.length} visita(s) registrada(s)`
                                : 'Nenhuma visita recorrente registrada ainda.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Histórico de Visitas */}
            {historicoVisitas.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico de Visitas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {historicoVisitas.map((visita) => (
                                <div
                                    key={visita.id}
                                    className="flex items-center justify-between p-3 border border-border rounded-lg"
                                >
                                    <div className="flex items-center gap-3">
                                        <Badge variant="outline" className="bg-success/10 text-success">
                                            <CheckCircle2 className="w-3 h-3 mr-1" />
                                            Realizada
                                        </Badge>
                                        <span className="font-medium">{visita.data}</span>
                                        {visita.hora && <span className="text-muted-foreground">às {visita.hora}</span>}
                                    </div>
                                    {visita.observacoes && (
                                        <span className="text-sm text-muted-foreground truncate max-w-[200px]">
                                            {visita.observacoes}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Registrar Nova Visita */}
            <Card>
                <CardHeader>
                    <CardTitle>Registrar Nova Visita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dataVisitaAtual">Data da Visita</Label>
                            <Input
                                id="dataVisitaAtual"
                                type="date"
                                value={data.dataVisitaAtual || ''}
                                onChange={(e) => onDataChange({ ...data, dataVisitaAtual: e.target.value })}
                                disabled={readOnly}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="horaVisitaAtual">Horário</Label>
                            <Input
                                id="horaVisitaAtual"
                                type="time"
                                value={data.horaVisitaAtual || ''}
                                onChange={(e) => onDataChange({ ...data, horaVisitaAtual: e.target.value })}
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacoesVisitaAtual">Observações</Label>
                        <Textarea
                            id="observacoesVisitaAtual"
                            value={data.observacoesVisitaAtual || ''}
                            onChange={(e) => onDataChange({ ...data, observacoesVisitaAtual: e.target.value })}
                            placeholder="Observações sobre a visita..."
                            disabled={readOnly}
                            rows={3}
                        />
                    </div>

                    <Button
                        onClick={registrarVisita}
                        disabled={readOnly || !data.dataVisitaAtual}
                        className="w-full"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Registrar Visita
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
