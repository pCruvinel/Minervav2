/**
 * StepAgendarVisita - Etapa 4 da OS-12
 * 
 * Agendamento da primeira visita técnica
 */

import React from 'react';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export interface StepAgendarVisitaData {
    dataVisita?: string;
    horaVisita?: string;
    localVisita?: string;
    observacoes?: string;
}

export interface StepAgendarVisitaProps {
    data: StepAgendarVisitaData;
    onDataChange: (data: StepAgendarVisitaData) => void;
    readOnly?: boolean;
}

export function StepAgendarVisita({ data, onDataChange, readOnly }: StepAgendarVisitaProps) {
    const isComplete = !!(data.dataVisita && data.horaVisita);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl mb-1">Agendar Visita Técnica</h2>
                <p className="text-sm text-muted-foreground">
                    Agende a primeira visita técnica ao condomínio
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
                            <Calendar className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base mb-2">
                            {isComplete ? 'Visita agendada!' : 'Aguardando agendamento'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isComplete
                                ? `Visita marcada para ${data.dataVisita} às ${data.horaVisita}`
                                : 'Defina a data e horário da visita técnica.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Dados do Agendamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="dataVisita">Data da Visita *</Label>
                            <Input
                                id="dataVisita"
                                type="date"
                                value={data.dataVisita || ''}
                                onChange={(e) => onDataChange({ ...data, dataVisita: e.target.value })}
                                disabled={readOnly}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="horaVisita">Horário *</Label>
                            <Input
                                id="horaVisita"
                                type="time"
                                value={data.horaVisita || ''}
                                onChange={(e) => onDataChange({ ...data, horaVisita: e.target.value })}
                                disabled={readOnly}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="localVisita">Local / Endereço</Label>
                        <Input
                            id="localVisita"
                            value={data.localVisita || ''}
                            onChange={(e) => onDataChange({ ...data, localVisita: e.target.value })}
                            placeholder="Endereço completo do condomínio"
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="observacoes">Observações</Label>
                        <Textarea
                            id="observacoes"
                            value={data.observacoes || ''}
                            onChange={(e) => onDataChange({ ...data, observacoes: e.target.value })}
                            placeholder="Informações adicionais sobre a visita..."
                            disabled={readOnly}
                            rows={3}
                        />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
