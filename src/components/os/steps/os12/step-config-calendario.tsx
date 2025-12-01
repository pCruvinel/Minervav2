import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar, Bell } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';

const DIAS_SEMANA = [
    { id: 'seg', label: 'Segunda', short: 'Seg' },
    { id: 'ter', label: 'Terça', short: 'Ter' },
    { id: 'qua', label: 'Quarta', short: 'Qua' },
    { id: 'qui', label: 'Quinta', short: 'Qui' },
    { id: 'sex', label: 'Sexta', short: 'Sex' },
    { id: 'sab', label: 'Sábado', short: 'Sáb' },
];

const HORARIOS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
];

interface StepConfigCalendarioProps {
    data: {
        visitasAgendadas: any[];
        diasSemana: string[];
        horarioVisita: string;
        alertasConfigurados: boolean;
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
    slaData?: {
        visitasSemanais: number;
        diasAtendimento: string[];
    };
}

export function StepConfigCalendario({ data, onDataChange, readOnly, slaData }: StepConfigCalendarioProps) {
    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const toggleDia = (diaId: string) => {
        if (readOnly) return;
        const current = data.diasSemana || [];
        if (current.includes(diaId)) {
            handleInputChange('diasSemana', current.filter(d => d !== diaId));
        } else if (current.length < (slaData?.visitasSemanais || 1)) {
            handleInputChange('diasSemana', [...current, diaId]);
        }
    };

    const diasDisponiveis = slaData?.diasAtendimento || DIAS_SEMANA.map(d => d.id);

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Configuração do Calendário</h2>
                    <p className="text-sm text-muted-foreground">
                        Defina os dias e horários fixos para as visitas semanais obrigatórias
                    </p>
                </div>
            </div>

            {/* Resumo do SLA */}
            {slaData && (
                <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Conforme SLA definido:</p>
                                <p className="font-medium">{slaData.visitasSemanais} visita(s) por semana</p>
                            </div>
                            <Badge className="bg-primary">{slaData.visitasSemanais}x/semana</Badge>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Seleção de Dias */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Dias Fixos para Visitas
                </h3>

                <div className="space-y-2">
                    <Label>
                        Selecione {slaData?.visitasSemanais || 1} dia(s) da semana <span className="text-destructive">*</span>
                    </Label>
                    <div className="grid grid-cols-6 gap-2">
                        {DIAS_SEMANA.map((dia) => {
                            const isSelected = (data.diasSemana || []).includes(dia.id);
                            const isDisponivel = diasDisponiveis.includes(dia.id);
                            return (
                                <button
                                    key={dia.id}
                                    onClick={() => isDisponivel && toggleDia(dia.id)}
                                    disabled={readOnly || !isDisponivel}
                                    className={cn(
                                        'p-3 rounded-lg border text-center transition-all',
                                        isSelected && 'bg-primary text-white border-primary',
                                        !isSelected && isDisponivel && 'hover:bg-muted border-border',
                                        !isDisponivel && 'opacity-50 cursor-not-allowed bg-muted',
                                        readOnly && 'cursor-not-allowed'
                                    )}
                                >
                                    <span className="text-sm font-medium">{dia.short}</span>
                                </button>
                            );
                        })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {(data.diasSemana || []).length} de {slaData?.visitasSemanais || 1} dia(s) selecionado(s)
                    </p>
                </div>
            </div>

            {/* Horário Padrão */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Horário Padrão das Visitas
                </h3>

                <div className="space-y-2">
                    <Label htmlFor="horarioVisita">Horário das Visitas <span className="text-destructive">*</span></Label>
                    <Select
                        value={data.horarioVisita}
                        onValueChange={(value) => handleInputChange('horarioVisita', value)}
                        disabled={readOnly}
                    >
                        <SelectTrigger id="horarioVisita" className="w-48">
                            <SelectValue placeholder="Selecione o horário" />
                        </SelectTrigger>
                        <SelectContent>
                            {HORARIOS.map((h) => (
                                <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Preview do Calendário */}
            {(data.diasSemana || []).length > 0 && data.horarioVisita && (
                <Card className="bg-success/5 border-success/20">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Visitas Agendadas Semanalmente
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-2">
                            {(data.diasSemana || []).map((diaId) => {
                                const dia = DIAS_SEMANA.find(d => d.id === diaId);
                                return (
                                    <Badge key={diaId} className="bg-success py-2 px-3">
                                        {dia?.label} às {data.horarioVisita}
                                    </Badge>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Alertas */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Bell className="w-5 h-5 text-warning" />
                            <div>
                                <Label className="text-base">Alertas Automáticos</Label>
                                <p className="text-sm text-muted-foreground">
                                    Notificar quando visitas não forem realizadas
                                </p>
                            </div>
                        </div>
                        <Switch
                            checked={data.alertasConfigurados}
                            onCheckedChange={(checked) => handleInputChange('alertasConfigurados', checked)}
                            disabled={readOnly}
                        />
                    </div>
                </CardContent>
            </Card>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    As visitas serão automaticamente reservadas no calendário do sistema.
                    Cada visita gerará uma OS-08 (Vistoria Técnica) vinculada a este contrato.
                </AlertDescription>
            </Alert>
        </div>
    );
}