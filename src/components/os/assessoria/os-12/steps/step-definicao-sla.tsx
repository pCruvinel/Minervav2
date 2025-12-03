import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, FileCheck, X, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/components/ui/utils';

const DIAS_SEMANA = [
    { id: 'seg', label: 'Segunda' },
    { id: 'ter', label: 'Terça' },
    { id: 'qua', label: 'Quarta' },
    { id: 'qui', label: 'Quinta' },
    { id: 'sex', label: 'Sexta' },
    { id: 'sab', label: 'Sábado' },
];

const SERVICOS_INCLUIDOS = [
    'Vistoria Semanal',
    'Parecer Técnico',
    'Análise de Reformas',
    'Atendimento Prioritário',
    'Relatórios Mensais',
    'Consultoria Técnica',
    'Acompanhamento de Obras',
    'Aprovação de Projetos',
];

const TEMPOS_RESPOSTA = [
    { value: '2h', label: 'Até 2 horas' },
    { value: '4h', label: 'Até 4 horas' },
    { value: '8h', label: 'Até 8 horas' },
    { value: '24h', label: 'Até 24 horas' },
    { value: '48h', label: 'Até 48 horas' },
];

interface StepDefinicaoSLAProps {
    data: {
        tempoResposta: string;
        visitasSemanais: number;
        diasAtendimento: string[];
        horarioInicio: string;
        horarioFim: string;
        servicosIncluidos: string[];
        penalidades: string;
    };
    onDataChange: (d: any) => void;
    readOnly?: boolean;
}

export function StepDefinicaoSLA({ data, onDataChange, readOnly }: StepDefinicaoSLAProps) {
    const handleInputChange = (field: string, value: any) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const toggleDia = (diaId: string) => {
        if (readOnly) return;
        const current = data.diasAtendimento || [];
        if (current.includes(diaId)) {
            handleInputChange('diasAtendimento', current.filter(d => d !== diaId));
        } else {
            handleInputChange('diasAtendimento', [...current, diaId]);
        }
    };

    const toggleServico = (servico: string) => {
        if (readOnly) return;
        const current = data.servicosIncluidos || [];
        if (current.includes(servico)) {
            handleInputChange('servicosIncluidos', current.filter(s => s !== servico));
        } else {
            handleInputChange('servicosIncluidos', [...current, servico]);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <FileCheck className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Definição de SLA</h2>
                    <p className="text-sm text-muted-foreground">
                        Configure os acordos de nível de serviço para o contrato de assessoria
                    </p>
                </div>
            </div>

            {/* Tempo de Resposta e Visitas */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Níveis de Atendimento
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="tempoResposta">Tempo de Resposta <span className="text-destructive">*</span></Label>
                        <Select
                            value={data.tempoResposta}
                            onValueChange={(value) => handleInputChange('tempoResposta', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="tempoResposta">
                                <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                                {TEMPOS_RESPOSTA.map((t) => (
                                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="visitasSemanais">Visitas Semanais Obrigatórias <span className="text-destructive">*</span></Label>
                        <Input
                            id="visitasSemanais"
                            type="number"
                            min="1"
                            max="7"
                            value={data.visitasSemanais}
                            onChange={(e) => handleInputChange('visitasSemanais', parseInt(e.target.value) || 1)}
                            disabled={readOnly}
                        />
                        <p className="text-xs text-muted-foreground">Quantas visitas técnicas por semana</p>
                    </div>
                </div>
            </div>

            {/* Dias de Atendimento */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Dias de Atendimento
                </h3>

                <div className="space-y-2">
                    <Label>Selecione os dias disponíveis para visitas <span className="text-destructive">*</span></Label>
                    <div className="flex flex-wrap gap-2">
                        {DIAS_SEMANA.map((dia) => {
                            const isSelected = (data.diasAtendimento || []).includes(dia.id);
                            return (
                                <Badge
                                    key={dia.id}
                                    variant={isSelected ? 'default' : 'outline'}
                                    className={cn(
                                        'cursor-pointer transition-all px-4 py-2',
                                        isSelected ? 'bg-primary' : 'hover:bg-muted',
                                        readOnly && 'cursor-not-allowed opacity-70'
                                    )}
                                    onClick={() => toggleDia(dia.id)}
                                >
                                    {dia.label}
                                </Badge>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="horarioInicio">Horário Início</Label>
                        <Input
                            id="horarioInicio"
                            type="time"
                            value={data.horarioInicio}
                            onChange={(e) => handleInputChange('horarioInicio', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="horarioFim">Horário Fim</Label>
                        <Input
                            id="horarioFim"
                            type="time"
                            value={data.horarioFim}
                            onChange={(e) => handleInputChange('horarioFim', e.target.value)}
                            disabled={readOnly}
                        />
                    </div>
                </div>
            </div>

            {/* Serviços Incluídos */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Serviços Incluídos no Contrato
                </h3>

                <div className="flex flex-wrap gap-2">
                    {SERVICOS_INCLUIDOS.map((servico) => {
                        const isSelected = (data.servicosIncluidos || []).includes(servico);
                        return (
                            <Badge
                                key={servico}
                                variant={isSelected ? 'default' : 'outline'}
                                className={cn(
                                    'cursor-pointer transition-all',
                                    isSelected ? 'bg-success' : 'hover:bg-muted',
                                    readOnly && 'cursor-not-allowed opacity-70'
                                )}
                                onClick={() => toggleServico(servico)}
                            >
                                {isSelected ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                                {servico}
                            </Badge>
                        );
                    })}
                </div>
                <p className="text-xs text-muted-foreground">
                    {(data.servicosIncluidos || []).length} serviço(s) selecionado(s)
                </p>
            </div>

            {/* Penalidades */}
            <div className="space-y-2">
                <Label htmlFor="penalidades">Penalidades por Descumprimento</Label>
                <Textarea
                    id="penalidades"
                    value={data.penalidades}
                    onChange={(e) => handleInputChange('penalidades', e.target.value)}
                    placeholder="Descreva as penalidades aplicáveis em caso de descumprimento do SLA..."
                    rows={3}
                    disabled={readOnly}
                />
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    O SLA definido será monitorado automaticamente pelo sistema. Alertas serão enviados
                    quando visitas não forem realizadas conforme acordado.
                </AlertDescription>
            </Alert>
        </div>
    );
}