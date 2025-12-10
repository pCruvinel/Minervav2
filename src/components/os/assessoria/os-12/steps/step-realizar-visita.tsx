/**
 * StepRealizarVisita - Etapa 5 da OS-12
 * 
 * Registro da realização da primeira visita técnica
 */

import React from 'react';
import { CheckCircle2, MapPin, Clock } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export interface StepRealizarVisitaData {
    visitaRealizada?: boolean;
    dataRealizacao?: string;
    horaRealizacao?: string;
    observacoes?: string;
}

export interface StepRealizarVisitaProps {
    data: StepRealizarVisitaData;
    onDataChange: (data: StepRealizarVisitaData) => void;
    readOnly?: boolean;
}

export function StepRealizarVisita({ data, onDataChange, readOnly }: StepRealizarVisitaProps) {
    const isComplete = data.visitaRealizada === true;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl mb-1">Realizar Visita Técnica</h2>
                <p className="text-sm text-muted-foreground">
                    Confirme a realização da primeira visita técnica
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
                            <MapPin className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base mb-2">
                            {isComplete ? 'Visita realizada com sucesso!' : 'Aguardando realização da visita'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isComplete
                                ? `Visita realizada em ${data.dataRealizacao} às ${data.horaRealizacao}`
                                : 'Marque a visita como realizada após a conclusão.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Confirmação da Visita</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-3 p-4 border border-border rounded-lg">
                        <Checkbox
                            id="visitaRealizada"
                            checked={data.visitaRealizada || false}
                            onCheckedChange={(checked) => {
                                onDataChange({
                                    ...data,
                                    visitaRealizada: checked === true,
                                    dataRealizacao: checked ? new Date().toISOString().split('T')[0] : '',
                                    horaRealizacao: checked ? new Date().toTimeString().slice(0, 5) : ''
                                });
                            }}
                            disabled={readOnly}
                        />
                        <Label htmlFor="visitaRealizada" className="text-base cursor-pointer">
                            Confirmo que a visita técnica foi realizada
                        </Label>
                    </div>

                    {data.visitaRealizada && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="dataRealizacao">Data da Realização</Label>
                                    <Input
                                        id="dataRealizacao"
                                        type="date"
                                        value={data.dataRealizacao || ''}
                                        onChange={(e) => onDataChange({ ...data, dataRealizacao: e.target.value })}
                                        disabled={readOnly}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="horaRealizacao">Horário</Label>
                                    <Input
                                        id="horaRealizacao"
                                        type="time"
                                        value={data.horaRealizacao || ''}
                                        onChange={(e) => onDataChange({ ...data, horaRealizacao: e.target.value })}
                                        disabled={readOnly}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="observacoes">Observações da Visita</Label>
                                <Textarea
                                    id="observacoes"
                                    value={data.observacoes || ''}
                                    onChange={(e) => onDataChange({ ...data, observacoes: e.target.value })}
                                    placeholder="Anote observações importantes sobre a visita realizada..."
                                    disabled={readOnly}
                                    rows={4}
                                />
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
