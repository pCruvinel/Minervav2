import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DateRangePicker, DateRange } from '@/components/shared/filters/date-range-picker';
import { toast } from 'sonner';
import { format, parseISO, subMonths, eachDayOfInterval, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface RegistroPresenca {
    id: string;
    data: string;
    status: 'OK' | 'ATRASADO' | 'FALTA';
    performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
    centros_custo: string[];
    minutos_atraso?: number;
    justificativa?: string;
}

interface ColaboradorPresencaTabProps {
    colaboradorId: string;
}

// ============================================================
// HELPERS
// ============================================================

const getDiaSemana = (dateStr: string): string => {
    const date = parseISO(dateStr);
    return format(date, 'EEEE', { locale: ptBR });
};

const getStatusBadge = (status: RegistroPresenca['status']) => {
    switch (status) {
        case 'OK':
            return (
                <Badge className="bg-success/10 text-success border-success/30 gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Presente
                </Badge>
            );
        case 'FALTA':
            return (
                <Badge className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                    <XCircle className="h-3 w-3" />
                    Falta
                </Badge>
            );
        case 'ATRASADO':
            return (
                <Badge className="bg-warning/10 text-warning border-warning/30 gap-1">
                    <Clock className="h-3 w-3" />
                    Atrasado
                </Badge>
            );
    }
};

const getPerformanceColor = (perf: string) => {
    const colors: Record<string, string> = {
        OTIMA: 'bg-success',
        BOA: 'bg-primary',
        REGULAR: 'bg-warning',
        RUIM: 'bg-destructive',
    };
    return colors[perf] || 'bg-muted';
};

// ============================================================
// COMPONENT
// ============================================================

export function ColaboradorPresencaTab({ colaboradorId }: ColaboradorPresencaTabProps) {
    // State
    const [registros, setRegistros] = useState<RegistroPresenca[]>([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState<DateRange | null>(() => {
        const end = new Date();
        const start = subMonths(end, 6);
        return {
            start: format(start, 'yyyy-MM-dd'),
            end: format(end, 'yyyy-MM-dd'),
        };
    });

    // Fetch registros based on date range
    useEffect(() => {
        if (!colaboradorId || !dateRange) return;

        const fetchRegistros = async () => {
            try {
                setLoading(true);
                const { data, error } = await supabase
                    .from('registros_presenca')
                    .select('*')
                    .eq('colaborador_id', colaboradorId)
                    .gte('data', dateRange.start)
                    .lte('data', dateRange.end)
                    .order('data', { ascending: false });

                if (error) throw error;
                setRegistros(data || []);
            } catch (error) {
                console.error('Erro ao buscar registros de presença:', error);
                toast.error('Erro ao carregar registros de presença.');
            } finally {
                setLoading(false);
            }
        };

        fetchRegistros();
    }, [colaboradorId, dateRange]);

    // KPIs computed from filtered data
    const kpis = useMemo(() => {
        const total = registros.length;
        const presentes = registros.filter(r => r.status !== 'FALTA').length;
        const faltas = registros.filter(r => r.status === 'FALTA' && !r.justificativa).length;
        const atrasos = registros.filter(r => r.status === 'ATRASADO').length;
        const minutosAtraso = registros.reduce((acc, r) => acc + (r.minutos_atraso || 0), 0);
        const taxaPresenca = total > 0 ? (presentes / total) * 100 : 0;

        // Dias úteis no período selecionado
        let diasUteis = 0;
        if (dateRange) {
            try {
                const dias = eachDayOfInterval({
                    start: parseISO(dateRange.start),
                    end: parseISO(dateRange.end),
                });
                diasUteis = dias.filter(d => !isWeekend(d)).length;
            } catch {
                diasUteis = 0;
            }
        }

        return { total, presentes, faltas, atrasos, minutosAtraso, taxaPresenca, diasUteis };
    }, [registros, dateRange]);

    // Performance distribution
    const perfDistribution = useMemo(() => {
        return (['OTIMA', 'BOA', 'REGULAR', 'RUIM'] as const).map(perf => {
            const count = registros.filter(r => r.performance === perf).length;
            const pct = registros.length > 0 ? (count / registros.length) * 100 : 0;
            return { perf, count, pct };
        });
    }, [registros]);

    // Handle date change
    const handleDateChange = (range: DateRange | null) => {
        setDateRange(range);
    };

    return (
        <div className="space-y-6">
            {/* Date Filter */}
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">
                    Período de análise
                </h3>
                <DateRangePicker
                    startDate={dateRange?.start}
                    endDate={dateRange?.end}
                    onChange={handleDateChange}
                    showPresets
                    placeholder="Selecione o período"
                />
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Presença</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{kpis.taxaPresenca.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {kpis.presentes}/{kpis.total} registros ({kpis.diasUteis} dias úteis)
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Dias Trabalhados</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-success">{kpis.presentes}</div>
                        <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Faltas Injustificadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-destructive">{kpis.faltas}</div>
                        <p className="text-xs text-muted-foreground mt-1">No período selecionado</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Atrasos</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-warning">{kpis.atrasos}</div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {kpis.minutosAtraso} min de atraso total
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Performance Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle>Distribuição de Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {perfDistribution.map(({ perf, count, pct }) => (
                                <div key={perf} className="flex items-center gap-3">
                                    <span className="text-sm font-medium w-20 capitalize">{perf.toLowerCase()}</span>
                                    <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full ${getPerformanceColor(perf)}`}
                                            style={{ width: `${pct}%` }}
                                        />
                                    </div>
                                    <span className="text-sm text-muted-foreground w-16 text-right">
                                        {count} ({pct.toFixed(0)}%)
                                    </span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Compact Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Histórico Detalhado</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : registros.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>Nenhum registro no período selecionado</p>
                            </div>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Data</TableHead>
                                            <TableHead>Dia</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-center">Atraso</TableHead>
                                            <TableHead>Justificativa</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {registros.map((reg) => (
                                            <TableRow key={reg.id}>
                                                <TableCell className="text-sm">
                                                    {format(parseISO(reg.data), 'dd/MM/yy')}
                                                </TableCell>
                                                <TableCell className="text-sm capitalize">
                                                    {getDiaSemana(reg.data)}
                                                </TableCell>
                                                <TableCell>
                                                    {getStatusBadge(reg.status)}
                                                </TableCell>
                                                <TableCell className="text-center text-sm">
                                                    {reg.minutos_atraso && reg.minutos_atraso > 0
                                                        ? <span className="text-warning font-medium">{reg.minutos_atraso}min</span>
                                                        : <span className="text-muted-foreground">-</span>
                                                    }
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                                                    {reg.justificativa || '-'}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
