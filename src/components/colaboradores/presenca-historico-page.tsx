import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import {
    Calendar as CalendarIcon,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    Download,
    Search,
    FileSpreadsheet,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '../ui/utils';
import { format, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { Colaborador } from '@/types/colaborador';

interface RegistroPresencaHistorico {
    id: string;
    colaborador_id: string;
    data: string;
    status: 'OK' | 'ATRASADO' | 'FALTA';
    minutos_atraso?: number;
    justificativa?: string;
    performance?: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
    performance_justificativa?: string;
    centros_custo: string[];
    anexo_url?: string;
    confirmed_at?: string;
    confirmed_by?: string;
}

interface ResumoColaborador {
    colaboradorId: string;
    nome: string;
    setor: string;
    diasUteis: number;
    presencas: number;
    atrasos: number;
    faltas: number;
    taxaPresenca: number;
    custoTotal: number;
    minutosAtrasoTotal: number;
}

export function PresencaHistoricoPage() {
    // Filtros
    const [dataInicio, setDataInicio] = useState<Date>(startOfMonth(subMonths(new Date(), 1)));
    const [dataFim, setDataFim] = useState<Date>(endOfMonth(subMonths(new Date(), 1)));
    const [setorFiltro, setSetorFiltro] = useState<string>('todos');
    const [colaboradorFiltro, setColaboradorFiltro] = useState<string>('todos');
    const [statusFiltro, setStatusFiltro] = useState<string>('todos');
    const [busca, setBusca] = useState('');

    // Dados
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [registros, setRegistros] = useState<RegistroPresencaHistorico[]>([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);

    // Carregar dados
    useEffect(() => {
        fetchColaboradores();
    }, []);

    useEffect(() => {
        if (colaboradores.length > 0) {
            fetchRegistros();
        }
    }, [dataInicio, dataFim, colaboradores]);

    const fetchColaboradores = async () => {
        try {
            const { data, error } = await supabase
                .from('colaboradores')
                .select('*')
                .eq('ativo', true)
                .order('nome_completo');

            if (error) throw error;
            setColaboradores(data || []);
        } catch (error) {
            console.error('Erro ao buscar colaboradores:', error);
            toast.error('Erro ao carregar colaboradores');
        }
    };

    const fetchRegistros = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('registros_presenca')
                .select('*')
                .gte('data', format(dataInicio, 'yyyy-MM-dd'))
                .lte('data', format(dataFim, 'yyyy-MM-dd'))
                .order('data', { ascending: false });

            if (error) throw error;
            setRegistros(data || []);
        } catch (error) {
            console.error('Erro ao buscar registros:', error);
            toast.error('Erro ao carregar registros de presença');
        } finally {
            setLoading(false);
        }
    };

    // Calcular dias úteis no período
    const diasUteisPeriodo = useMemo(() => {
        const dias = eachDayOfInterval({ start: dataInicio, end: dataFim });
        return dias.filter(dia => !isWeekend(dia)).length;
    }, [dataInicio, dataFim]);

    // Setores únicos
    const setoresUnicos = useMemo(() => {
        const setores = [...new Set(colaboradores.map(c => c.setor).filter(Boolean))];
        return setores.sort();
    }, [colaboradores]);

    // Resumo por colaborador
    const resumoPorColaborador = useMemo((): ResumoColaborador[] => {
        return colaboradores.map(col => {
            const registrosCol = registros.filter(r => r.colaborador_id === col.id);

            const presencas = registrosCol.filter(r => r.status !== 'FALTA').length;
            const atrasos = registrosCol.filter(r => r.status === 'ATRASADO').length;
            const faltas = registrosCol.filter(r => r.status === 'FALTA').length;
            const minutosAtrasoTotal = registrosCol.reduce((acc, r) => acc + (r.minutos_atraso || 0), 0);

            // Calcular custo
            const custoDia = col.tipo_contratacao === 'CLT'
                ? (col.salario_base || 0) * 1.46 / 22
                : col.custo_dia || 0;
            const custoTotal = presencas * custoDia;

            const taxaPresenca = diasUteisPeriodo > 0
                ? (presencas / diasUteisPeriodo) * 100
                : 0;

            return {
                colaboradorId: col.id,
                nome: col.nome_completo || col.nome || 'Sem nome',
                setor: col.setor || 'Sem setor',
                diasUteis: diasUteisPeriodo,
                presencas,
                atrasos,
                faltas,
                taxaPresenca,
                custoTotal,
                minutosAtrasoTotal
            };
        });
    }, [colaboradores, registros, diasUteisPeriodo]);

    // Aplicar filtros
    const resumoFiltrado = useMemo(() => {
        return resumoPorColaborador.filter(r => {
            if (setorFiltro !== 'todos' && r.setor !== setorFiltro) return false;
            if (colaboradorFiltro !== 'todos' && r.colaboradorId !== colaboradorFiltro) return false;
            if (busca && !r.nome.toLowerCase().includes(busca.toLowerCase())) return false;

            // Filtro por status
            if (statusFiltro === 'com_faltas' && r.faltas === 0) return false;
            if (statusFiltro === 'com_atrasos' && r.atrasos === 0) return false;
            if (statusFiltro === 'perfeito' && (r.faltas > 0 || r.atrasos > 0)) return false;

            return true;
        });
    }, [resumoPorColaborador, setorFiltro, colaboradorFiltro, statusFiltro, busca]);

    // KPIs gerais
    const kpis = useMemo(() => {
        const totalPresencas = resumoFiltrado.reduce((acc, r) => acc + r.presencas, 0);
        const totalFaltas = resumoFiltrado.reduce((acc, r) => acc + r.faltas, 0);
        const totalAtrasos = resumoFiltrado.reduce((acc, r) => acc + r.atrasos, 0);
        const totalCusto = resumoFiltrado.reduce((acc, r) => acc + r.custoTotal, 0);
        const totalMinutosAtraso = resumoFiltrado.reduce((acc, r) => acc + r.minutosAtrasoTotal, 0);
        const taxaMediaPresenca = resumoFiltrado.length > 0
            ? resumoFiltrado.reduce((acc, r) => acc + r.taxaPresenca, 0) / resumoFiltrado.length
            : 0;

        return {
            totalColaboradores: resumoFiltrado.length,
            totalPresencas,
            totalFaltas,
            totalAtrasos,
            totalCusto,
            totalMinutosAtraso,
            taxaMediaPresenca
        };
    }, [resumoFiltrado]);

    // Exportar para Excel
    const handleExportExcel = async () => {
        try {
            setExporting(true);

            // Criar CSV
            const headers = ['Colaborador', 'Setor', 'Dias Úteis', 'Presenças', 'Faltas', 'Atrasos', 'Min. Atraso', 'Taxa Presença', 'Custo Total'];
            const rows = resumoFiltrado.map(r => [
                r.nome,
                r.setor,
                r.diasUteis,
                r.presencas,
                r.faltas,
                r.atrasos,
                r.minutosAtrasoTotal,
                `${r.taxaPresenca.toFixed(1)}%`,
                `R$ ${r.custoTotal.toFixed(2)}`
            ]);

            const csv = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `historico_presencas_${format(dataInicio, 'yyyy-MM-dd')}_a_${format(dataFim, 'yyyy-MM-dd')}.csv`;
            link.click();

            URL.revokeObjectURL(url);
            toast.success('Arquivo exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            toast.error('Erro ao exportar arquivo');
        } finally {
            setExporting(false);
        }
    };

    const getStatusBadge = (resumo: ResumoColaborador) => {
        if (resumo.faltas === 0 && resumo.atrasos === 0) {
            return <Badge className="bg-success/10 text-success border-success/30">Perfeito</Badge>;
        }
        if (resumo.faltas > 2 || resumo.taxaPresenca < 80) {
            return <Badge variant="destructive">Atenção</Badge>;
        }
        if (resumo.atrasos > 3) {
            return <Badge className="bg-warning/10 text-warning border-warning/30">Atrasos</Badge>;
        }
        return <Badge variant="secondary">Regular</Badge>;
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            <PageHeader
                title="Histórico de Presenças"
                subtitle="Consulte o histórico de presenças por período, setor e colaborador"
                showBackButton={true}
            >
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={fetchRegistros}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                        Atualizar
                    </Button>
                    <Button
                        variant="default"
                        onClick={handleExportExcel}
                        disabled={exporting || resumoFiltrado.length === 0}
                    >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Exportar Excel
                    </Button>
                </div>
            </PageHeader>
            {/* Filtros */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-wrap items-end gap-4">
                        {/* Período */}
                        <div className="space-y-1">
                            <Label className="text-xs">Data Início</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-40">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(dataInicio, 'dd/MM/yyyy')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dataInicio}
                                        onSelect={(date) => date && setDataInicio(date)}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-1">
                            <Label className="text-xs">Data Fim</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button variant="outline" className="w-40">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {format(dataFim, 'dd/MM/yyyy')}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0">
                                    <Calendar
                                        mode="single"
                                        selected={dataFim}
                                        onSelect={(date) => date && setDataFim(date)}
                                        locale={ptBR}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        {/* Setor */}
                        <div className="space-y-1">
                            <Label className="text-xs">Setor</Label>
                            <Select value={setorFiltro} onValueChange={setSetorFiltro}>
                                <SelectTrigger className="w-44">
                                    <SelectValue placeholder="Todos os setores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os setores</SelectItem>
                                    {setoresUnicos.map(setor => (
                                        <SelectItem key={setor} value={setor || 'sem_setor'} className="capitalize">
                                            {setor || 'Sem setor'}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Colaborador */}
                        <div className="space-y-1">
                            <Label className="text-xs">Colaborador</Label>
                            <Select value={colaboradorFiltro} onValueChange={setColaboradorFiltro}>
                                <SelectTrigger className="w-52">
                                    <SelectValue placeholder="Todos os colaboradores" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos os colaboradores</SelectItem>
                                    {colaboradores.map(col => (
                                        <SelectItem key={col.id} value={col.id}>
                                            {col.nome_completo || col.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Status */}
                        <div className="space-y-1">
                            <Label className="text-xs">Status</Label>
                            <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                                <SelectTrigger className="w-40">
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="todos">Todos</SelectItem>
                                    <SelectItem value="perfeito">100% de presença</SelectItem>
                                    <SelectItem value="com_faltas">Com faltas</SelectItem>
                                    <SelectItem value="com_atrasos">Com atrasos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Busca */}
                        <div className="space-y-1 flex-1 min-w-[200px]">
                            <Label className="text-xs">Buscar</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar por nome..."
                                    value={busca}
                                    onChange={(e) => setBusca(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPIs */}
            <div className="">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Colaboradores</p>
                                    <p className="text-xl font-bold">{kpis.totalColaboradores}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-success" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Presenças</p>
                                    <p className="text-xl font-bold">{kpis.totalPresencas}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <XCircle className="h-5 w-5 text-destructive" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Faltas</p>
                                    <p className="text-xl font-bold">{kpis.totalFaltas}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-warning" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Atrasos</p>
                                    <p className="text-xl font-bold">{kpis.totalAtrasos}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-warning" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Min. Atraso</p>
                                    <p className="text-xl font-bold">{kpis.totalMinutosAtraso}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                {kpis.taxaMediaPresenca >= 90 ? (
                                    <TrendingUp className="h-5 w-5 text-success" />
                                ) : (
                                    <TrendingDown className="h-5 w-5 text-destructive" />
                                )}
                                <div>
                                    <p className="text-xs text-muted-foreground">Taxa Média</p>
                                    <p className="text-xl font-bold">{kpis.taxaMediaPresenca.toFixed(1)}%</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Download className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Custo Total</p>
                                    <p className="text-lg font-bold">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(kpis.totalCusto)}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tabela */}
            {/* Tabela */}
            <div className="">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center justify-between">
                            <span>Resumo por Colaborador</span>
                            <span className="text-sm font-normal text-muted-foreground">
                                {diasUteisPeriodo} dias úteis no período
                            </span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : resumoFiltrado.length === 0 ? (
                            <div className="text-center py-12 text-muted-foreground">
                                <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>Nenhum registro encontrado para os filtros selecionados</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted">
                                        <TableHead>Colaborador</TableHead>
                                        <TableHead>Setor</TableHead>
                                        <TableHead className="text-center">Presenças</TableHead>
                                        <TableHead className="text-center">Faltas</TableHead>
                                        <TableHead className="text-center">Atrasos</TableHead>
                                        <TableHead className="text-center">Min. Atraso</TableHead>
                                        <TableHead className="text-center">Taxa</TableHead>
                                        <TableHead className="text-right">Custo</TableHead>
                                        <TableHead className="text-center">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {resumoFiltrado.map(resumo => (
                                        <TableRow key={resumo.colaboradorId} className="hover:bg-muted/50">
                                            <TableCell className="font-medium">{resumo.nome}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="capitalize">{resumo.setor}</Badge>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className="text-success font-medium">{resumo.presencas}</span>
                                                <span className="text-muted-foreground">/{resumo.diasUteis}</span>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {resumo.faltas > 0 ? (
                                                    <span className="text-destructive font-medium">{resumo.faltas}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">0</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {resumo.atrasos > 0 ? (
                                                    <span className="text-warning font-medium">{resumo.atrasos}</span>
                                                ) : (
                                                    <span className="text-muted-foreground">0</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {resumo.minutosAtrasoTotal > 0 ? (
                                                    <span className="text-warning">{resumo.minutosAtrasoTotal}min</span>
                                                ) : (
                                                    <span className="text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <span className={cn(
                                                    "font-medium",
                                                    resumo.taxaPresenca >= 95 && "text-success",
                                                    resumo.taxaPresenca >= 80 && resumo.taxaPresenca < 95 && "text-warning",
                                                    resumo.taxaPresenca < 80 && "text-destructive"
                                                )}>
                                                    {resumo.taxaPresenca.toFixed(0)}%
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo.custoTotal)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                {getStatusBadge(resumo)}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
