import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import {
    ArrowLeft,
    Users,
    CheckCircle,
    XCircle,
    Clock,
    DollarSign,
    FileSpreadsheet,
    Search,
    RefreshCw,
    Building,
    History,
    Paperclip
} from 'lucide-react';
import { cn } from '../ui/utils';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';

interface RegistroPresencaDetalhes {
    id: string;
    colaborador_id: string;
    data: string;
    status: 'OK' | 'ATRASADO' | 'FALTA';
    minutos_atraso?: number;
    justificativa?: string;
    performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
    performance_justificativa?: string;
    centros_custo: string[];
    anexo_url?: string;
    confirmed_at?: string;
    confirmed_by?: string;
    confirmed_changes?: ConfirmedChange[];
    colaborador: {
        nome_completo: string;
        funcao: string;
        setor: string;
        tipo_contratacao: string;
        custo_dia: number;
        salario_base: number;
        avatar_url?: string;
    };
}

interface ConfirmedChange {
    timestamp: string;
    action: string;
    previous_state: string;
    user_id?: string;
    user_name?: string;
}

interface CustoPorCC {
    cc_id: string;
    cc_nome: string;
    custo_total: number;
    colaboradores_count: number;
    percentual_do_total: number;
}

export function PresencaDetalhesPage() {
    const { data: dataParam } = useParams({ from: '/_auth/colaboradores/presenca-tabela/$data' });

    // Estados
    const [registros, setRegistros] = useState<RegistroPresencaDetalhes[]>([]);
    const [custosPorCC, setCustosPorCC] = useState<CustoPorCC[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState<string>('todos');
    const [filtroSetor, setFiltroSetor] = useState<string>('todos');
    const [busca, setBusca] = useState('');
    const [tabAtual, setTabAtual] = useState('registros');

    // Parse da data
    const dataSelecionada = useMemo(() => {
        const parsed = parseISO(dataParam);
        return isValid(parsed) ? parsed : new Date();
    }, [dataParam]);

    // Carregar dados
    useEffect(() => {
        fetchDados();
    }, [dataParam]);

    const fetchDados = async () => {
        try {
            setLoading(true);

            // Buscar registros do dia com dados do colaborador
            const { data: registrosData, error: registrosError } = await supabase
                .from('registros_presenca')
                .select(`
          *,
          colaborador:colaboradores(
            nome_completo,
            funcao,
            setor,
            tipo_contratacao,
            custo_dia,
            salario_base,
            avatar_url
          )
        `)
                .eq('data', dataParam)
                .order('colaborador(nome_completo)');

            if (registrosError) throw registrosError;

            setRegistros(registrosData || []);

            // Calcular custos por CC
            if (registrosData && registrosData.length > 0) {
                const registroIds = registrosData.map(r => r.id);

                const { data: alocacoesData, error: alocacoesError } = await supabase
                    .from('alocacao_horas_cc')
                    .select(`
            registro_presenca_id,
            cc_id,
            percentual,
            valor_calculado,
            centro_custo:centros_custo(nome)
          `)
                    .in('registro_presenca_id', registroIds);

                if (!alocacoesError && alocacoesData) {
                    // Agrupar por CC
                    const ccMap = new Map<string, CustoPorCC>();
                    let custoTotal = 0;

                    alocacoesData.forEach(aloc => {
                        const ccId = aloc.cc_id;
                        const ccNome = (aloc.centro_custo as { nome: string })?.nome || 'Desconhecido';
                        const valor = aloc.valor_calculado || 0;

                        if (!ccMap.has(ccId)) {
                            ccMap.set(ccId, {
                                cc_id: ccId,
                                cc_nome: ccNome,
                                custo_total: 0,
                                colaboradores_count: 0,
                                percentual_do_total: 0
                            });
                        }

                        const cc = ccMap.get(ccId)!;
                        cc.custo_total += valor;
                        cc.colaboradores_count += 1;
                        custoTotal += valor;
                    });

                    // Calcular percentuais
                    ccMap.forEach(cc => {
                        cc.percentual_do_total = custoTotal > 0 ? (cc.custo_total / custoTotal) * 100 : 0;
                    });

                    setCustosPorCC(Array.from(ccMap.values()).sort((a, b) => b.custo_total - a.custo_total));
                }
            }
        } catch (error) {
            console.error('Erro ao buscar dados:', error);
            toast.error('Erro ao carregar dados do dia');
        } finally {
            setLoading(false);
        }
    };

    // Setores únicos
    const setoresUnicos = useMemo(() => {
        const setores = [...new Set(registros.map(r => r.colaborador?.setor).filter(Boolean))];
        return setores.sort();
    }, [registros]);

    // Filtrar registros
    const registrosFiltrados = useMemo(() => {
        return registros.filter(r => {
            if (filtroStatus !== 'todos' && r.status !== filtroStatus) return false;
            if (filtroSetor !== 'todos' && r.colaborador?.setor !== filtroSetor) return false;
            if (busca && !r.colaborador?.nome_completo?.toLowerCase().includes(busca.toLowerCase())) return false;
            return true;
        });
    }, [registros, filtroStatus, filtroSetor, busca]);

    // Estatísticas
    const stats = useMemo(() => {
        const presentes = registros.filter(r => r.status !== 'FALTA').length;
        const faltas = registros.filter(r => r.status === 'FALTA').length;
        const atrasos = registros.filter(r => r.status === 'ATRASADO').length;

        const custoTotal = registros.reduce((acc, r) => {
            if (r.status === 'FALTA') return acc;
            const col = r.colaborador;
            if (!col) return acc;
            if (col.tipo_contratacao === 'CLT') {
                return acc + (col.salario_base || 0) * 1.46 / 22;
            }
            return acc + (col.custo_dia || 0);
        }, 0);

        const isConfirmado = registros.some(r => r.confirmed_at);

        return { presentes, faltas, atrasos, custoTotal, total: registros.length, isConfirmado };
    }, [registros]);

    // Histórico de alterações (auditoria)
    const historicoAlteracoes = useMemo(() => {
        const alteracoes: Array<ConfirmedChange & { colaborador_nome: string }> = [];

        registros.forEach(r => {
            if (r.confirmed_changes && Array.isArray(r.confirmed_changes)) {
                r.confirmed_changes.forEach(change => {
                    alteracoes.push({
                        ...change,
                        colaborador_nome: r.colaborador?.nome_completo || 'Desconhecido'
                    });
                });
            } else if (r.confirmed_at) {
                alteracoes.push({
                    timestamp: r.confirmed_at,
                    action: 'confirmed',
                    previous_state: 'draft',
                    colaborador_nome: r.colaborador?.nome_completo || 'Desconhecido'
                });
            }
        });

        return alteracoes.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [registros]);

    // Export Excel
    const handleExportExcel = () => {
        try {
            const headers = ['Colaborador', 'Setor', 'Função', 'Status', 'Performance', 'Min. Atraso', 'Justificativa', 'Custo'];
            const rows = registrosFiltrados.map(r => [
                r.colaborador?.nome_completo || '',
                r.colaborador?.setor || '',
                r.colaborador?.funcao || '',
                r.status,
                r.performance || '',
                r.minutos_atraso || '',
                r.justificativa || '',
                r.colaborador?.tipo_contratacao === 'CLT'
                    ? ((r.colaborador.salario_base || 0) * 1.46 / 22).toFixed(2)
                    : (r.colaborador?.custo_dia || 0).toFixed(2)
            ]);

            const csv = [headers.join(';'), ...rows.map(row => row.join(';'))].join('\n');
            const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = `presenca_${dataParam}.csv`;
            link.click();

            URL.revokeObjectURL(url);
            toast.success('Arquivo exportado com sucesso!');
        } catch (error) {
            console.error('Erro ao exportar:', error);
            toast.error('Erro ao exportar arquivo');
        }
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'OK':
                return <Badge className="bg-success/10 text-success border-success/30">Presente</Badge>;
            case 'ATRASADO':
                return <Badge className="bg-warning/10 text-warning border-warning/30">Atrasado</Badge>;
            case 'FALTA':
                return <Badge variant="destructive">Falta</Badge>;
            default:
                return <Badge variant="secondary">{status}</Badge>;
        }
    };

    const getPerformanceBadge = (performance: string) => {
        switch (performance) {
            case 'OTIMA':
                return <Badge className="bg-success/10 text-success border-success/30">Ótima</Badge>;
            case 'BOA':
                return <Badge className="bg-primary/10 text-primary border-primary/30">Boa</Badge>;
            case 'REGULAR':
                return <Badge className="bg-warning/10 text-warning border-warning/30">Regular</Badge>;
            case 'RUIM':
                return <Badge variant="destructive">Ruim</Badge>;
            default:
                return <Badge variant="secondary">N/A</Badge>;
        }
    };

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Header */}
            <div className="bg-white border-b px-6 py-4 shadow-sm">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/colaboradores/presenca-tabela">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="h-5 w-5" />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-bold text-foreground">
                                    Presenças do dia {format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </h1>
                                {stats.isConfirmado && (
                                    <Badge className="bg-success/10 text-success border-success/30">
                                        <CheckCircle className="mr-1 h-3 w-3" />
                                        Confirmado
                                    </Badge>
                                )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                                {format(dataSelecionada, "EEEE", { locale: ptBR })}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={fetchDados} disabled={loading}>
                            <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                            Atualizar
                        </Button>
                        <Button variant="default" onClick={handleExportExcel} disabled={registrosFiltrados.length === 0}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" />
                            Exportar Excel
                        </Button>
                    </div>
                </div>
            </div>

            {/* KPIs */}
            <div className="px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Total</p>
                                    <p className="text-xl font-bold">{stats.total}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-success" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Presentes</p>
                                    <p className="text-xl font-bold text-success">{stats.presentes}</p>
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
                                    <p className="text-xl font-bold text-destructive">{stats.faltas}</p>
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
                                    <p className="text-xl font-bold text-warning">{stats.atrasos}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2">
                                <DollarSign className="h-5 w-5 text-primary" />
                                <div>
                                    <p className="text-xs text-muted-foreground">Custo Total</p>
                                    <p className="text-lg font-bold">{formatCurrency(stats.custoTotal)}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-auto px-6 pb-6">
                <Tabs value={tabAtual} onValueChange={setTabAtual} className="h-full">
                    <TabsList className="mb-4">
                        <TabsTrigger value="registros" className="gap-2">
                            <Users className="h-4 w-4" />
                            Registros
                        </TabsTrigger>
                        <TabsTrigger value="custos" className="gap-2">
                            <Building className="h-4 w-4" />
                            Custos por CC
                        </TabsTrigger>
                        <TabsTrigger value="auditoria" className="gap-2">
                            <History className="h-4 w-4" />
                            Auditoria
                        </TabsTrigger>
                    </TabsList>

                    {/* Tab: Registros */}
                    <TabsContent value="registros" className="h-full">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">Registros do Dia</CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                                            <SelectTrigger className="w-32">
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos</SelectItem>
                                                <SelectItem value="OK">Presentes</SelectItem>
                                                <SelectItem value="ATRASADO">Atrasados</SelectItem>
                                                <SelectItem value="FALTA">Faltas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={filtroSetor} onValueChange={setFiltroSetor}>
                                            <SelectTrigger className="w-36">
                                                <SelectValue placeholder="Setor" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="todos">Todos os setores</SelectItem>
                                                {setoresUnicos.map(setor => (
                                                    <SelectItem key={setor} value={setor || 'sem_setor'}>
                                                        {setor}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                placeholder="Buscar..."
                                                value={busca}
                                                onChange={(e) => setBusca(e.target.value)}
                                                className="pl-10 w-48"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {loading ? (
                                    <div className="flex items-center justify-center py-12">
                                        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : registrosFiltrados.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Nenhum registro encontrado</p>
                                    </div>
                                ) : (
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="bg-muted">
                                                <TableHead>Colaborador</TableHead>
                                                <TableHead>Setor</TableHead>
                                                <TableHead>Função</TableHead>
                                                <TableHead className="text-center">Status</TableHead>
                                                <TableHead className="text-center">Performance</TableHead>
                                                <TableHead className="text-center">Atraso</TableHead>
                                                <TableHead className="text-right">Custo</TableHead>
                                                <TableHead className="text-center">Anexo</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {registrosFiltrados.map(registro => (
                                                <TableRow key={registro.id} className="hover:bg-muted/50">
                                                    <TableCell className="font-medium">
                                                        {registro.colaborador?.nome_completo || 'N/A'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className="capitalize">
                                                            {registro.colaborador?.setor || 'N/A'}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {registro.colaborador?.funcao || 'N/A'}
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <Popover>
                                                            <PopoverTrigger>
                                                                {getStatusBadge(registro.status)}
                                                            </PopoverTrigger>
                                                            {registro.justificativa && (
                                                                <PopoverContent className="w-64">
                                                                    <p className="text-sm font-medium mb-1">Justificativa:</p>
                                                                    <p className="text-sm text-muted-foreground">{registro.justificativa}</p>
                                                                </PopoverContent>
                                                            )}
                                                        </Popover>
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.status === 'FALTA'
                                                            ? <Badge variant="secondary">N/A</Badge>
                                                            : getPerformanceBadge(registro.performance)
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.minutos_atraso
                                                            ? <span className="text-warning font-medium">{registro.minutos_atraso} min</span>
                                                            : <span className="text-muted-foreground">-</span>
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium">
                                                        {registro.status === 'FALTA'
                                                            ? <span className="text-muted-foreground">-</span>
                                                            : formatCurrency(
                                                                registro.colaborador?.tipo_contratacao === 'CLT'
                                                                    ? (registro.colaborador.salario_base || 0) * 1.46 / 22
                                                                    : registro.colaborador?.custo_dia || 0
                                                            )
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        {registro.anexo_url ? (
                                                            <a href={registro.anexo_url} target="_blank" rel="noopener noreferrer">
                                                                <Button variant="ghost" size="icon">
                                                                    <Paperclip className="h-4 w-4" />
                                                                </Button>
                                                            </a>
                                                        ) : (
                                                            <span className="text-muted-foreground">-</span>
                                                        )}
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Custos por CC */}
                    <TabsContent value="custos">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Custos por Centro de Custo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {custosPorCC.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Nenhum custo registrado para este dia</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Gráfico simples de barras */}
                                        <div className="space-y-4">
                                            <h3 className="font-medium text-sm text-muted-foreground">Distribuição de Custos</h3>
                                            {custosPorCC.map(cc => (
                                                <div key={cc.cc_id} className="space-y-1">
                                                    <div className="flex justify-between text-sm">
                                                        <span>{cc.cc_nome}</span>
                                                        <span className="font-medium">{cc.percentual_do_total.toFixed(1)}%</span>
                                                    </div>
                                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-primary transition-all"
                                                            style={{ width: `${cc.percentual_do_total}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Tabela de custos */}
                                        <div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow className="bg-muted">
                                                        <TableHead>Centro de Custo</TableHead>
                                                        <TableHead className="text-center">Colaboradores</TableHead>
                                                        <TableHead className="text-right">Custo</TableHead>
                                                        <TableHead className="text-right">%</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {custosPorCC.map(cc => (
                                                        <TableRow key={cc.cc_id}>
                                                            <TableCell className="font-medium">{cc.cc_nome}</TableCell>
                                                            <TableCell className="text-center">{cc.colaboradores_count}</TableCell>
                                                            <TableCell className="text-right font-medium">
                                                                {formatCurrency(cc.custo_total)}
                                                            </TableCell>
                                                            <TableCell className="text-right">
                                                                {cc.percentual_do_total.toFixed(1)}%
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Tab: Auditoria */}
                    <TabsContent value="auditoria">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg">Histórico de Alterações</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {historicoAlteracoes.length === 0 ? (
                                    <div className="text-center py-12 text-muted-foreground">
                                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                        <p>Nenhuma alteração registrada</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {historicoAlteracoes.map((alt, idx) => (
                                            <div key={idx} className="flex items-start gap-4 border-l-2 border-primary/30 pl-4 pb-4">
                                                <div className="w-3 h-3 rounded-full bg-primary -ml-[1.4rem] mt-1" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        {alt.action === 'confirmed' ? 'Registro confirmado' : alt.action}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {format(new Date(alt.timestamp), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                                                    </p>
                                                    {alt.user_name && (
                                                        <p className="text-xs text-muted-foreground">Por: {alt.user_name}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
