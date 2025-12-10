/**
 * StepAgendarVisitaRecorrente - Etapa 6 da OS-12
 * 
 * Configuração de visitas periódicas/recorrentes
 */

import React from 'react';
import { CalendarClock, CheckCircle2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export interface StepAgendarVisitaRecorrenteData {
    frequencia?: 'semanal' | 'quinzenal' | 'mensal';
    proximaVisita?: string;
    horaVisita?: string;
    diasSemana?: string[];
    observacoes?: string;
}

export interface StepAgendarVisitaRecorrenteProps {
    data: StepAgendarVisitaRecorrenteData;
    onDataChange: (data: StepAgendarVisitaRecorrenteData) => void;
    readOnly?: boolean;
}

const DIAS_SEMANA = [
    { id: 'seg', label: 'Segunda' },
    { id: 'ter', label: 'Terça' },
    { id: 'qua', label: 'Quarta' },
    { id: 'qui', label: 'Quinta' },
    { id: 'sex', label: 'Sexta' },
];

export function StepAgendarVisitaRecorrente({ data, onDataChange, readOnly }: StepAgendarVisitaRecorrenteProps) {
    const isComplete = !!(data.frequencia && data.proximaVisita);

    const toggleDia = (diaId: string) => {
        const current = data.diasSemana || [];
        const updated = current.includes(diaId)
            ? current.filter(d => d !== diaId)
            : [...current, diaId];
        onDataChange({ ...data, diasSemana: updated });
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-xl mb-1">Agendar Visitas Recorrentes</h2>
                <p className="text-sm text-muted-foreground">
                    Configure a periodicidade das visitas técnicas
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
                            <CalendarClock className="w-6 h-6 text-white" />
                        )}
                    </div>

                    <div className="flex-1">
                        <h3 className="text-base mb-2">
                            {isComplete ? 'Recorrência configurada!' : 'Configure a recorrência'}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            {isComplete
                                ? `Visitas ${data.frequencia}s configuradas`
                                : 'Defina a frequência e dias das visitas.'
                            }
                        </p>
                    </div>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Configuração da Recorrência</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="frequencia">Frequência das Visitas *</Label>
                        <Select
                            value={data.frequencia || ''}
                            onValueChange={(value) => onDataChange({ ...data, frequencia: value as any })}
                            disabled={readOnly}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Selecione a frequência" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="semanal">Semanal</SelectItem>
                                <SelectItem value="quinzenal">Quinzenal</SelectItem>
                                <SelectItem value="mensal">Mensal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Dias da Semana Preferidos</Label>
                        <div className="flex flex-wrap gap-3">
                            {DIAS_SEMANA.map((dia) => (
                                <div key={dia.id} className="flex items-center space-x-2">
                                    <Checkbox
                                        id={dia.id}
                                        checked={(data.diasSemana || []).includes(dia.id)}
                                        onCheckedChange={() => toggleDia(dia.id)}
                                        disabled={readOnly}
                                    />
                                    <Label htmlFor={dia.id} className="cursor-pointer">{dia.label}</Label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="proximaVisita">Próxima Visita *</Label>
                            <Input
                                id="proximaVisita"
                                type="date"
                                value={data.proximaVisita || ''}
                                onChange={(e) => onDataChange({ ...data, proximaVisita: e.target.value })}
                                disabled={readOnly}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="horaVisita">Horário Preferido</Label>
                            <Input
                                id="horaVisita"
                                type="time"
                                value={data.horaVisita || ''}
                                onChange={(e) => onDataChange({ ...data, horaVisita: e.target.value })}
                                disabled={readOnly}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
