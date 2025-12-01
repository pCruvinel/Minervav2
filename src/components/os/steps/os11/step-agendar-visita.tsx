import React from 'react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Calendar as CalendarIcon, Clock, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/components/ui/utils';
import { useColaboradores, useTurnos } from '@/lib/hooks/use-os-workflows';

const HORARIOS = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
    '15:00', '15:30', '16:00', '16:30', '17:00'
];

const DURACOES = [
    { value: '30', label: '30 minutos' },
    { value: '60', label: '1 hora' },
    { value: '90', label: '1h30' },
    { value: '120', label: '2 horas' },
    { value: '180', label: '3 horas' },
    { value: '240', label: '4 horas' },
];

interface StepAgendarVisitaData {
    dataVisita: string;
    horarioVisita: string;
    tecnicoResponsavel: string;
    tecnicoNome: string;
    duracaoEstimada: string;
    instrucoes: string;
    turnoId: string;
}

interface StepAgendarVisitaProps {
    data: StepAgendarVisitaData;
    onDataChange: (d: StepAgendarVisitaData) => void;
    readOnly?: boolean;
}

export function StepAgendarVisita({ data, onDataChange, readOnly }: StepAgendarVisitaProps) {
    // Buscar colaboradores técnicos do Supabase (setor assessoria)
    const { colaboradores, loading: loadingColaboradores } = useColaboradores({ ativo: true });
    const { turnos, loading: loadingTurnos } = useTurnos();

    // Filtrar apenas técnicos de assessoria
    const tecnicos = colaboradores.filter(c =>
        c.setor?.slug === 'assessoria' ||
        c.funcao?.includes('assessoria') ||
        c.funcao?.includes('tecnico') ||
        c.cargo?.slug?.includes('engenheiro') ||
        c.cargo?.slug?.includes('tecnico')
    );

    const handleInputChange = (field: string, value: string) => {
        if (readOnly) return;
        onDataChange({ ...data, [field]: value });
    };

    const handleDateSelect = (date: Date | undefined) => {
        if (readOnly) return;
        if (date) {
            handleInputChange('dataVisita', date.toISOString());
        }
    };

    const handleTecnicoChange = (tecnicoId: string) => {
        if (readOnly) return;
        const tecnico = tecnicos.find(t => t.id === tecnicoId);
        onDataChange({
            ...data,
            tecnicoResponsavel: tecnicoId,
            tecnicoNome: tecnico?.nome_completo || '',
        });
    };

    const dataVisita = data.dataVisita ? new Date(data.dataVisita) : undefined;

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <CalendarIcon className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Agendar Visita Técnica</h2>
                    <p className="text-sm text-muted-foreground">
                        Defina a data, horário e técnico responsável pela visita
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2 text-primary">
                    Data e Horário
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Data da Visita <span className="text-destructive">*</span></Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        'w-full justify-start text-left font-normal',
                                        !dataVisita && 'text-muted-foreground'
                                    )}
                                    disabled={readOnly}
                                >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dataVisita ? format(dataVisita, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={dataVisita}
                                    onSelect={handleDateSelect}
                                    locale={ptBR}
                                    disabled={(date: Date) => date < new Date() || !!readOnly}
                                    initialFocus
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="horarioVisita">Horário <span className="text-destructive">*</span></Label>
                        <Select
                            value={data.horarioVisita}
                            onValueChange={(value) => handleInputChange('horarioVisita', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="horarioVisita">
                                <Clock className="w-4 h-4 mr-2" />
                                <SelectValue placeholder="Selecione o horário" />
                            </SelectTrigger>
                            <SelectContent>
                                {HORARIOS.map((horario) => (
                                    <SelectItem key={horario} value={horario}>{horario}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="duracaoEstimada">Duração Estimada</Label>
                        <Select
                            value={data.duracaoEstimada}
                            onValueChange={(value) => handleInputChange('duracaoEstimada', value)}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="duracaoEstimada">
                                <SelectValue placeholder="Selecione a duração" />
                            </SelectTrigger>
                            <SelectContent>
                                {DURACOES.map((dur) => (
                                    <SelectItem key={dur.value} value={dur.value}>{dur.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {turnos.length > 0 && (
                        <div className="space-y-2">
                            <Label htmlFor="turnoId">Turno</Label>
                            <Select
                                value={data.turnoId}
                                onValueChange={(value) => handleInputChange('turnoId', value)}
                                disabled={readOnly || loadingTurnos}
                            >
                                <SelectTrigger id="turnoId">
                                    <SelectValue placeholder="Selecione o turno" />
                                </SelectTrigger>
                                <SelectContent>
                                    {turnos.map((turno) => (
                                        <SelectItem key={turno.id} value={turno.id}>
                                            {turno.hora_inicio} - {turno.hora_fim}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2 text-primary">
                    Técnico Responsável
                </h3>

                <div className="space-y-2">
                    <Label htmlFor="tecnicoResponsavel">Técnico <span className="text-destructive">*</span></Label>
                    {loadingColaboradores ? (
                        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm text-muted-foreground">Carregando técnicos...</span>
                        </div>
                    ) : (
                        <Select
                            value={data.tecnicoResponsavel}
                            onValueChange={handleTecnicoChange}
                            disabled={readOnly}
                        >
                            <SelectTrigger id="tecnicoResponsavel">
                                <SelectValue placeholder="Selecione o técnico" />
                            </SelectTrigger>
                            <SelectContent>
                                {tecnicos.length === 0 ? (
                                    <div className="p-2 text-sm text-muted-foreground text-center">
                                        Nenhum técnico cadastrado
                                    </div>
                                ) : (
                                    tecnicos.map((tec) => (
                                        <SelectItem key={tec.id} value={tec.id}>
                                            <div className="flex items-center gap-2">
                                                <span>{tec.nome_completo}</span>
                                                {tec.cargo?.nome && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({tec.cargo.nome})
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                    )}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="instrucoes">Instruções para a Visita</Label>
                <Textarea
                    id="instrucoes"
                    value={data.instrucoes}
                    onChange={(e) => handleInputChange('instrucoes', e.target.value)}
                    placeholder="Informações importantes para o técnico (acesso ao local, pessoa de contato, etc.)"
                    rows={4}
                    disabled={readOnly}
                />
            </div>

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    O cliente será notificado sobre a data e horário da visita técnica.
                </AlertDescription>
            </Alert>
        </div>
    );
}