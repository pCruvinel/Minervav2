import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Receipt,
    Users,
    Building2,
    DollarSign,
    Plus,
    Search,
    CalendarDays,
    Briefcase,
    Loader2,
    AlertTriangle,
    CheckCircle,
    Clock,
    XCircle,
    Calendar
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { KPICardFinanceiro, KPIFinanceiroGrid } from './kpi-card-financeiro';

// ============================================================
// MOCK DATA - FRONTEND-ONLY MODE
// ============================================================

const mockKPIs = {
    totalMensal: 57500,
    totalSalarios: 45000,
    totalContasFixas: 12500,
    colaboradoresAtivos: 15,
    proximoVencimento: '2025-01-05',
    contasVencidas: 2,
    valorVencido: 8500,
};

const mockSalarios = [
    {
        id: 'sal-001', colaborador: 'João Silva', cargo: 'Pedreiro', setor: 'Obras',
        salarioBase: 4095, encargos: 1884, beneficios: 450, custoTotal: 6429, vencimento: 5, status: 'ativo'
    },
    {
        id: 'sal-002', colaborador: 'Maria Santos', cargo: 'Servente', setor: 'Obras',
        salarioBase: 2628, encargos: 1209, beneficios: 450, custoTotal: 4287, vencimento: 5, status: 'ativo'
    },
    {
        id: 'sal-003', colaborador: 'Pedro Oliveira', cargo: 'Eletricista', setor: 'Obras',
        salarioBase: 5200, encargos: 2392, beneficios: 450, custoTotal: 8042, vencimento: 5, status: 'ativo'
    },
    {
        id: 'sal-004', colaborador: 'Ana Costa', cargo: 'Engenheira', setor: 'Assessoria',
        salarioBase: 8500, encargos: 3910, beneficios: 800, custoTotal: 13210, vencimento: 5, status: 'ativo'
    },
    {
        id: 'sal-005', colaborador: 'Carlos Lima', cargo: 'Auxiliar Administrativo', setor: 'Administrativo',
        salarioBase: 2200, encargos: 1012, beneficios: 450, custoTotal: 3662, vencimento: 5, status: 'ativo'
    },
];

const mockContasFixas = [
    {
        id: 'fix-001', fornecedor: 'Imobiliária Centro', descricao: 'Aluguel Escritório',
        categoria: 'Infraestrutura', valor: 5500, vencimento: 10, status: 'ativo'
    },
    {
        id: 'fix-002', fornecedor: 'CEMIG', descricao: 'Energia Elétrica',
        categoria: 'Utilidades', valor: 1250, vencimento: 15, status: 'ativo'
    },
    {
        id: 'fix-003', fornecedor: 'COPASA', descricao: 'Água e Esgoto',
        categoria: 'Utilidades', valor: 380, vencimento: 20, status: 'ativo'
    },
    {
        id: 'fix-004', fornecedor: 'Claro', descricao: 'Internet + Telefonia',
        categoria: 'Comunicação', valor: 450, vencimento: 12, status: 'ativo'
    },
    {
        id: 'fix-005', fornecedor: 'Contador Silva', descricao: 'Honorários Contábeis',
        categoria: 'Serviços', valor: 1800, vencimento: 25, status: 'ativo'
    },
    {
        id: 'fix-006', fornecedor: 'Software XYZ', descricao: 'Licença Software',
        categoria: 'Tecnologia', valor: 320, vencimento: 1, status: 'ativo'
    },
    {
        id: 'fix-007', fornecedor: 'Seguradora ABC', descricao: 'Seguro Empresarial',
        categoria: 'Seguros', valor: 1500, vencimento: 8, status: 'ativo'
    },
    {
        id: 'fix-008', fornecedor: 'CREA-MG', descricao: 'Anuidade CREA',
        categoria: 'Taxas', valor: 1300, vencimento: 15, status: 'ativo'
    },
];

// Contas a pagar pendentes (consolidado de contas-pagar)
const mockContasPendentes = [
    { id: 'cp-1', fornecedor: 'Materiais ABC', descricao: 'Cimento e Areia', tipo: 'Material', vencimento: '2024-12-15', valor: 4500, status: 'atrasado', ccCodigo: 'CC13001-SOLAR_I' },
    { id: 'cp-2', fornecedor: 'Ferragens Silva', descricao: 'Ferragens especiais', tipo: 'Material', vencimento: '2024-12-20', valor: 4000, status: 'atrasado', ccCodigo: 'CC13001-SOLAR_I' },
    { id: 'cp-3', fornecedor: 'CEMIG', descricao: 'Energia Elétrica', tipo: 'Conta Fixa', vencimento: '2025-01-15', valor: 1250, status: 'em_aberto', ccCodigo: null },
    { id: 'cp-4', fornecedor: 'Imobiliária Centro', descricao: 'Aluguel Escritório', tipo: 'Conta Fixa', vencimento: '2025-01-10', valor: 5500, status: 'em_aberto', ccCodigo: null },
    { id: 'cp-5', fornecedor: 'Folha de Pagamento', descricao: 'Salários Janeiro/2025', tipo: 'Salário', vencimento: '2025-01-05', valor: 45000, status: 'em_aberto', ccCodigo: null },
    { id: 'cp-6', fornecedor: 'INSS', descricao: 'Encargos Trabalhistas', tipo: 'Imposto', vencimento: '2025-01-20', valor: 8500, status: 'futuro', ccCodigo: null },
];

// ============================================================
// COMPONENT
// ============================================================

/**
 * FaturasRecorrentesPage - Gestão de Despesas
 * 
 * Consolida:
 * - Salários (folha de pagamento)
 * - Contas fixas (despesas recorrentes)
 * - Contas a pagar pendentes (antes em contas-pagar)
 */
export function FaturasRecorrentesPage() {
    const [activeTab, setActiveTab] = useState('salarios');
    const [buscaSalarios, setBuscaSalarios] = useState('');
    const [buscaContas, setBuscaContas] = useState('');
    const [buscaPendentes, setBuscaPendentes] = useState('');
    const [statusFiltro, setStatusFiltro] = useState<string>('todos');
    const [isLoading] = useState(false);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const salariosFiltrados = mockSalarios.filter(s =>
        s.colaborador.toLowerCase().includes(buscaSalarios.toLowerCase()) ||
        s.cargo.toLowerCase().includes(buscaSalarios.toLowerCase())
    );

    const contasFiltradas = mockContasFixas.filter(c =>
        c.fornecedor.toLowerCase().includes(buscaContas.toLowerCase()) ||
        c.descricao.toLowerCase().includes(buscaContas.toLowerCase())
    );

    const contasPendentesFiltradas = mockContasPendentes.filter(c => {
        const matchBusca = c.fornecedor.toLowerCase().includes(buscaPendentes.toLowerCase()) ||
            c.descricao.toLowerCase().includes(buscaPendentes.toLowerCase());
        const matchStatus = statusFiltro === 'todos' || c.status === statusFiltro;
        return matchBusca && matchStatus;
    });

    const totalSalarios = salariosFiltrados.reduce((acc, s) => acc + s.custoTotal, 0);
    const totalContas = contasFiltradas.reduce((acc, c) => acc + c.valor, 0);
    const totalAtrasado = mockContasPendentes.filter(c => c.status === 'atrasado').reduce((acc, c) => acc + c.valor, 0);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pago':
                return <Badge className="bg-success/10 text-success"><CheckCircle className="w-3 h-3 mr-1" />Pago</Badge>;
            case 'atrasado':
                return <Badge className="bg-destructive/10 text-destructive"><XCircle className="w-3 h-3 mr-1" />Atrasado</Badge>;
            case 'em_aberto':
                return <Badge className="bg-warning/10 text-warning"><Clock className="w-3 h-3 mr-1" />Em Aberto</Badge>;
            case 'futuro':
                return <Badge className="bg-muted text-muted-foreground"><Calendar className="w-3 h-3 mr-1" />Futuro</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    const getTipoBadge = (tipo: string) => {
        switch (tipo) {
            case 'Salário':
                return <Badge className="bg-primary/10 text-primary">{tipo}</Badge>;
            case 'Conta Fixa':
                return <Badge className="bg-secondary/10 text-secondary">{tipo}</Badge>;
            case 'Material':
                return <Badge className="bg-warning/10 text-warning">{tipo}</Badge>;
            case 'Imposto':
                return <Badge className="bg-destructive/10 text-destructive">{tipo}</Badge>;
            default:
                return <Badge variant="outline">{tipo}</Badge>;
        }
    };

    return (
        <div className="container mx-auto p-6 space-y-6">
            {/* ========== Header ========== */}
            <PageHeader
                title="Despesas"
                subtitle="Salários, contas fixas e contas a pagar"
                showBackButton
            >
                <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Despesa
                </Button>
            </PageHeader>

            {/* ========== Alerta de Contas Vencidas ========== */}
            {totalAtrasado > 0 && (
                <Alert className="border-destructive/30 bg-destructive/5">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="text-destructive">
                        <strong>Atenção:</strong> Existem {mockContasPendentes.filter(c => c.status === 'atrasado').length} conta(s) vencida(s)
                        totalizando <strong>{formatCurrency(totalAtrasado)}</strong>. Veja na aba "Contas Pendentes".
                    </AlertDescription>
                </Alert>
            )}

            {/* ========== KPIs ========== */}
            <KPIFinanceiroGrid columns={4}>
                <KPICardFinanceiro
                    title="Total Mensal"
                    value={mockKPIs.totalMensal}
                    icon={<DollarSign className="w-6 h-6" />}
                    variant="destructive"
                    subtitle="Despesas fixas"
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Salários"
                    value={mockKPIs.totalSalarios}
                    icon={<Users className="w-6 h-6" />}
                    variant="primary"
                    subtitle={`${mockKPIs.colaboradoresAtivos} colaboradores`}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Contas Fixas"
                    value={mockKPIs.totalContasFixas}
                    icon={<Receipt className="w-6 h-6" />}
                    variant="warning"
                    subtitle={`${mockContasFixas.length} fornecedores`}
                    loading={isLoading}
                />
                <KPICardFinanceiro
                    title="Vencido"
                    value={totalAtrasado}
                    icon={<AlertTriangle className="w-6 h-6" />}
                    variant={totalAtrasado > 0 ? "destructive" : "neutral"}
                    subtitle={totalAtrasado > 0 ? "Pendente pagamento" : "Nada vencido"}
                    loading={isLoading}
                />
            </KPIFinanceiroGrid>

            {/* ========== Tabs ========== */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList>
                    <TabsTrigger value="salarios" className="gap-2">
                        <Briefcase className="w-4 h-4" />
                        Salários ({mockSalarios.length})
                    </TabsTrigger>
                    <TabsTrigger value="contas-fixas" className="gap-2">
                        <Building2 className="w-4 h-4" />
                        Contas Fixas ({mockContasFixas.length})
                    </TabsTrigger>
                    <TabsTrigger value="pendentes" className="gap-2">
                        <Clock className="w-4 h-4" />
                        Contas Pendentes ({mockContasPendentes.length})
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Salários */}
                <TabsContent value="salarios" className="space-y-4">
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base font-semibold">Folha de Pagamento Mensal</CardTitle>
                                    <CardDescription>Vencimento: Dia 05 | Encargos CLT: 46%</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        placeholder="Buscar colaborador..."
                                        value={buscaSalarios}
                                        onChange={(e) => setBuscaSalarios(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <span className="ml-3 text-neutral-600">Carregando...</span>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Colaborador</TableHead>
                                            <TableHead>Cargo</TableHead>
                                            <TableHead>Setor</TableHead>
                                            <TableHead className="text-right">Salário</TableHead>
                                            <TableHead className="text-right">Encargos</TableHead>
                                            <TableHead className="text-right">Benefícios</TableHead>
                                            <TableHead className="text-right">Custo Total</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {salariosFiltrados.map((sal) => (
                                            <TableRow key={sal.id}>
                                                <TableCell className="font-medium">{sal.colaborador}</TableCell>
                                                <TableCell>{sal.cargo}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline">{sal.setor}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">{formatCurrency(sal.salarioBase)}</TableCell>
                                                <TableCell className="text-right text-neutral-500">
                                                    {formatCurrency(sal.encargos)}
                                                </TableCell>
                                                <TableCell className="text-right text-neutral-500">
                                                    {formatCurrency(sal.beneficios)}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-destructive">
                                                    {formatCurrency(sal.custoTotal)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-success/10 text-success">Ativo</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-muted/50">
                                            <TableCell colSpan={6} className="font-bold">Total Mensal</TableCell>
                                            <TableCell className="text-right font-bold text-destructive">
                                                {formatCurrency(totalSalarios)}
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Contas Fixas */}
                <TabsContent value="contas-fixas" className="space-y-4">
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base font-semibold">Despesas Fixas Mensais</CardTitle>
                                    <CardDescription>Contas recorrentes com fornecedores</CardDescription>
                                </div>
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                    <Input
                                        placeholder="Buscar conta..."
                                        value={buscaContas}
                                        onChange={(e) => setBuscaContas(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-12">
                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                    <span className="ml-3 text-neutral-600">Carregando...</span>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Fornecedor</TableHead>
                                            <TableHead>Descrição</TableHead>
                                            <TableHead>Categoria</TableHead>
                                            <TableHead className="text-center">Vencimento</TableHead>
                                            <TableHead className="text-right">Valor</TableHead>
                                            <TableHead>Status</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {contasFiltradas.map((conta) => (
                                            <TableRow key={conta.id}>
                                                <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                                                <TableCell>{conta.descricao}</TableCell>
                                                <TableCell>
                                                    <Badge variant="secondary">{conta.categoria}</Badge>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Badge variant="outline">Dia {conta.vencimento}</Badge>
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-destructive">
                                                    {formatCurrency(conta.valor)}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className="bg-success/10 text-success">Ativo</Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                        <TableRow className="bg-muted/50">
                                            <TableCell colSpan={4} className="font-bold">Total Mensal</TableCell>
                                            <TableCell className="text-right font-bold text-destructive">
                                                {formatCurrency(totalContas)}
                                            </TableCell>
                                            <TableCell></TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Contas Pendentes */}
                <TabsContent value="pendentes" className="space-y-4">
                    <Card className="shadow-card">
                        <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle className="text-base font-semibold">Contas a Pagar</CardTitle>
                                    <CardDescription>{contasPendentesFiltradas.length} conta(s) pendente(s)</CardDescription>
                                </div>
                                <div className="flex gap-3">
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                                        <Input
                                            placeholder="Buscar..."
                                            value={buscaPendentes}
                                            onChange={(e) => setBuscaPendentes(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                                        <SelectTrigger className="w-[160px]">
                                            <SelectValue placeholder="Status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="todos">Todos</SelectItem>
                                            <SelectItem value="atrasado">Atrasado</SelectItem>
                                            <SelectItem value="em_aberto">Em Aberto</SelectItem>
                                            <SelectItem value="futuro">Futuro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Fornecedor</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Tipo</TableHead>
                                        <TableHead>Centro de Custo</TableHead>
                                        <TableHead>Vencimento</TableHead>
                                        <TableHead className="text-right">Valor</TableHead>
                                        <TableHead>Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {contasPendentesFiltradas.map((conta) => (
                                        <TableRow
                                            key={conta.id}
                                            className={conta.status === 'atrasado' ? 'bg-destructive/5 border-l-4 border-l-destructive' : ''}
                                        >
                                            <TableCell className="font-medium">{conta.fornecedor}</TableCell>
                                            <TableCell>{conta.descricao}</TableCell>
                                            <TableCell>{getTipoBadge(conta.tipo)}</TableCell>
                                            <TableCell>
                                                {conta.ccCodigo ? (
                                                    <Badge variant="outline">{conta.ccCodigo}</Badge>
                                                ) : (
                                                    <span className="text-neutral-400">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="flex items-center gap-1">
                                                    <CalendarDays className="w-3 h-3 text-neutral-400" />
                                                    {formatDate(conta.vencimento)}
                                                </span>
                                            </TableCell>
                                            <TableCell className="text-right font-bold text-destructive">
                                                {formatCurrency(conta.valor)}
                                            </TableCell>
                                            <TableCell>{getStatusBadge(conta.status)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
