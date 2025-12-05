
import React, { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase-client';
import { Colaborador } from '@/types/colaborador';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { format, parseISO, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
    User,
    Mail,
    Phone,
    Calendar as CalendarIcon,
    Briefcase,
    DollarSign,
    FileText,
    Upload,
    Trash2,
    Download,
    Loader2,
    CheckCircle,
    XCircle,
    Clock,
    AlertTriangle,
    Edit
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';
import { ModalCadastroColaborador } from './modal-cadastro-colaborador';

// Types
interface Documento {
    id: string;
    nome: string;
    url: string;
    tipo: string;
    created_at: string;
}

interface RegistroPresenca {
    id: string;
    data: string;
    status: 'OK' | 'ATRASADO' | 'FALTA';
    performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
    centros_custo: string[];
    minutos_atraso?: number;
    justificativa?: string;
}

export function ColaboradorDetalhesPage() {
    const { colaboradorId } = useParams({ from: '/_auth/colaboradores/$colaboradorId' });
    const [colaborador, setColaborador] = useState<Colaborador | null>(null);
    const [documentos, setDocumentos] = useState<Documento[]>([]);
    const [registros, setRegistros] = useState<RegistroPresenca[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [modalEdicaoOpen, setModalEdicaoOpen] = useState(false);
    const [isResendingInvite, setIsResendingInvite] = useState(false);

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Colaborador
            const { data: colData, error: colError } = await supabase
                .from('colaboradores')
                .select('*')
                .eq('id', colaboradorId)
                .single();

            if (colError) throw colError;
            setColaborador(colData);

            // 2. Documentos
            const { data: docData, error: docError } = await supabase
                .from('colaboradores_documentos')
                .select('*')
                .eq('colaborador_id', colaboradorId)
                .order('created_at', { ascending: false });

            if (docError) throw docError;
            setDocumentos(docData || []);

            // 3. Registros (Last 6 months)
            const sixMonthsAgo = subMonths(new Date(), 6);
            const { data: regData, error: regError } = await supabase
                .from('registros_presenca')
                .select('*')
                .eq('colaborador_id', colaboradorId)
                .gte('data', format(sixMonthsAgo, 'yyyy-MM-dd'))
                .order('data', { ascending: false });

            if (regError) throw regError;
            setRegistros(regData || []);

        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            toast.error('Erro ao carregar detalhes do colaborador.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (colaboradorId) {
            fetchData();
        }
    }, [colaboradorId]);

    // Handlers
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !colaborador) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${colaborador.id}/${Date.now()}.${fileExt}`;

            // 1. Upload Storage
            const { error: uploadError } = await supabase.storage
                .from('documentos-colaboradores')
                .upload(fileName, file);

            if (uploadError) throw uploadError;

            // 2. Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('documentos-colaboradores')
                .getPublicUrl(fileName);

            // 3. Insert DB
            const { data: insertData, error: insertError } = await supabase
                .from('colaboradores_documentos')
                .insert({
                    colaborador_id: colaborador.id,
                    nome: file.name,
                    url: publicUrl,
                    tipo: fileExt,
                    tamanho: file.size
                })
                .select()
                .single();

            if (insertError) throw insertError;

            setDocumentos([insertData, ...documentos]);
            toast.success('Documento enviado com sucesso!');

        } catch (error) {
            console.error('Erro no upload:', error);
            toast.error('Erro ao enviar documento.');
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteDocumento = async (id: string, url: string) => {
        if (!confirm('Tem certeza que deseja excluir este documento?')) return;

        try {
            // Extract path from URL
            const path = url.split('/').pop(); // Simple extraction, might need adjustment based on full URL structure
            // Actually, better to store path in DB or just try to delete by ID from DB first

            // 1. Delete DB
            const { error: dbError } = await supabase
                .from('colaboradores_documentos')
                .delete()
                .eq('id', id);

            if (dbError) throw dbError;

            // 2. Delete Storage (Optional, good practice)
            // We need the path relative to bucket. 
            // Assuming URL format: .../documentos-colaboradores/colaboradorId/filename
            const urlObj = new URL(url);
            const pathParts = urlObj.pathname.split('documentos-colaboradores/');
            if (pathParts.length > 1) {
                await supabase.storage.from('documentos-colaboradores').remove([pathParts[1]]);
            }

            setDocumentos(documentos.filter(d => d.id !== id));
            toast.success('Documento excluído.');

        } catch (error) {
            console.error('Erro ao excluir:', error);
            toast.error('Erro ao excluir documento.');
        }
    };

    const handleSalvarEdicao = async (dados: Partial<Colaborador>) => {
        try {
            setLoading(true);
            const { error } = await supabase
                .from('colaboradores')
                .update(dados)
                .eq('id', colaboradorId);

            if (error) throw error;

            toast.success('Colaborador atualizado com sucesso!');
            setModalEdicaoOpen(false);
            fetchData(); // Recarregar dados
        } catch (error) {
            console.error('Erro ao atualizar colaborador:', error);
            toast.error('Erro ao atualizar colaborador.');
        } finally {
            setLoading(false);
        }
    };

    // Reenviar convite por email
    const handleReenviarConvite = async () => {
        if (!colaborador?.email) {
            toast.error('Colaborador não possui email cadastrado');
            return;
        }

        setIsResendingInvite(true);
        try {
            const { error } = await supabase.functions.invoke('invite-user', {
                body: {
                    invites: [{
                        email: colaborador.email,
                        nome: colaborador.nome_completo || colaborador.nome,
                        cargo_id: colaborador.cargo_id,
                        setor_id: colaborador.setor_id,
                    }],
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;
            toast.success('Convite reenviado com sucesso!', {
                description: `Email enviado para ${colaborador.email}`
            });
        } catch (err) {
            console.error('Erro ao reenviar convite:', err);
            toast.error('Erro ao reenviar convite');
        } finally {
            setIsResendingInvite(false);
        }
    };

    // Calculations
    const calculateFinancialStats = () => {
        if (!colaborador) return { monthlyData: [], totalCost: 0, avgAttendance: 0 };

        const custoDia = colaborador.tipo_contratacao === 'CLT'
            ? (colaborador.salario_base || 0) * 1.6 / 22 // Estimativa encargos
            : (colaborador.custo_dia || 0);

        // Group by month
        const months = eachMonthOfInterval({
            start: subMonths(new Date(), 5),
            end: new Date()
        });

        const monthlyData = months.map(month => {
            const monthStr = format(month, 'yyyy-MM');
            const monthRegistros = registros.filter(r => r.data.startsWith(monthStr));

            const diasTrabalhados = monthRegistros.filter(r => r.status !== 'FALTA').length;
            const custoMensal = diasTrabalhados * custoDia;

            return {
                name: format(month, 'MMM/yy', { locale: ptBR }),
                custo: custoMensal,
                dias: diasTrabalhados
            };
        });

        const totalPresentes = registros.filter(r => r.status !== 'FALTA').length;
        const totalRegistros = registros.length;
        const avgAttendance = totalRegistros > 0 ? (totalPresentes / totalRegistros) * 100 : 0;

        return { monthlyData, totalCost: 0, avgAttendance };
    };

    const stats = calculateFinancialStats();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!colaborador) {
        return <div>Colaborador não encontrado.</div>;
    }

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-6">
                    <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                        {colaborador.avatar_url ? (
                            <img src={colaborador.avatar_url} alt={colaborador.nome} className="w-full h-full object-cover" />
                        ) : (
                            <User className="h-10 w-10 text-muted-foreground" />
                        )}
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{colaborador.nome_completo || colaborador.nome}</h1>
                        <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                            <Badge variant="secondary" className="text-sm capitalize">
                                {colaborador.funcao?.replace('_', ' ') || 'Sem Função'}
                            </Badge>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                                <Briefcase className="h-4 w-4" />
                                {colaborador.setor}
                            </span>
                            <span>•</span>
                            <Badge className={colaborador.ativo ? "bg-success/10 text-success hover:bg-success/10" : "bg-destructive/10 text-destructive"}>
                                {colaborador.ativo ? 'Ativo' : 'Inativo'}
                            </Badge>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Botão Reenviar Convite - só aparece se não for ativo */}
                    {colaborador.status_convite && colaborador.status_convite !== 'ativo' && (
                        <Button
                            variant="outline"
                            onClick={handleReenviarConvite}
                            disabled={isResendingInvite}
                        >
                            {isResendingInvite ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                                <Mail className="mr-2 h-4 w-4" />
                            )}
                            Reenviar Convite
                        </Button>
                    )}
                    <Button variant="outline" onClick={() => setModalEdicaoOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Cadastro
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger
                        value="financial"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                        Financeiro & Presença
                    </TabsTrigger>
                    <TabsTrigger
                        value="documents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-3"
                    >
                        Documentos
                    </TabsTrigger>
                </TabsList>

                {/* TAB: VISÃO GERAL */}
                <TabsContent value="overview" className="mt-6 space-y-6">
                    {/* Dados Pessoais */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Pessoais</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Nome Completo</Label>
                                <p className="font-medium">{colaborador.nome_completo || colaborador.nome}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">CPF</Label>
                                <p className="font-medium">{colaborador.cpf || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Data de Nascimento</Label>
                                <p className="font-medium">
                                    {colaborador.data_nascimento
                                        ? format(new Date(colaborador.data_nascimento), 'dd/MM/yyyy')
                                        : '-'}
                                </p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Endereço</Label>
                                <p className="font-medium truncate" title={colaborador.endereco || ''}>{colaborador.endereco || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Contato */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Informações de Contato</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Email Profissional</Label>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{colaborador.email_profissional || colaborador.email || '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Email Pessoal</Label>
                                <div className="flex items-center gap-2">
                                    <Mail className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{colaborador.email_pessoal || '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Telefone Profissional</Label>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{colaborador.telefone_profissional || colaborador.telefone || '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Telefone Pessoal</Label>
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">{colaborador.telefone_pessoal || '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label className="text-muted-foreground">Contato de Emergência</Label>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                    <p className="font-medium">
                                        {colaborador.contato_emergencia_nome}
                                        {colaborador.contato_emergencia_telefone && ` - ${colaborador.contato_emergencia_telefone}`}
                                        {!colaborador.contato_emergencia_nome && !colaborador.contato_emergencia_telefone && '-'}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados Profissionais */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Profissionais</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Função</Label>
                                <div className="flex items-center gap-2">
                                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium capitalize">{colaborador.funcao?.replace(/_/g, ' ') || '-'}</p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Setor</Label>
                                <p className="font-medium capitalize">{colaborador.setor || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Gestor Responsável</Label>
                                <p className="font-medium">{colaborador.gestor || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Qualificação</Label>
                                <p className="font-medium">{colaborador.qualificacao || '-'}</p>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label className="text-muted-foreground">Turno</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {Array.isArray(colaborador.turno) && colaborador.turno.length > 0 ? (
                                        colaborador.turno.map((t, i) => (
                                            <Badge key={i} variant="outline">{t}</Badge>
                                        ))
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1 col-span-2">
                                <Label className="text-muted-foreground">Disponibilidade</Label>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {Array.isArray(colaborador.disponibilidade_dias) && colaborador.disponibilidade_dias.length > 0 ? (
                                        colaborador.disponibilidade_dias.map((d, i) => (
                                            <Badge key={i} variant="secondary">{d}</Badge>
                                        ))
                                    ) : (
                                        <span>-</span>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados Contratuais */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Contratuais</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Tipo de Contratação</Label>
                                <Badge variant="outline">{colaborador.tipo_contratacao || 'Não informado'}</Badge>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Data de Admissão</Label>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">
                                        {colaborador.data_admissao
                                            ? format(new Date(colaborador.data_admissao), 'dd/MM/yyyy')
                                            : '-'}
                                    </p>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">
                                    {colaborador.tipo_contratacao === 'CLT' ? 'Salário Base' : 'Custo Dia'}
                                </Label>
                                <div className="flex items-center gap-2 text-success font-medium">
                                    <DollarSign className="h-4 w-4" />
                                    {colaborador.tipo_contratacao === 'CLT'
                                        ? `R$ ${colaborador.salario_base?.toLocaleString('pt-BR') || '0,00'}`
                                        : `R$ ${colaborador.custo_dia?.toLocaleString('pt-BR') || '0,00'}`
                                    }
                                </div>
                            </div>
                            {colaborador.tipo_contratacao === 'PJ' && (
                                <div className="space-y-1">
                                    <Label className="text-muted-foreground">Remuneração Contratual</Label>
                                    <div className="flex items-center gap-2 text-success font-medium">
                                        <DollarSign className="h-4 w-4" />
                                        {`R$ ${colaborador.remuneracao_contratual?.toLocaleString('pt-BR') || '0,00'}`}
                                    </div>
                                </div>
                            )}
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Rateio Fixo</Label>
                                <p className="font-medium">{colaborador.rateio_fixo ? 'Sim' : 'Não'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Status Sistema</Label>
                                <Badge variant={colaborador.bloqueado_sistema ? "destructive" : "default"}>
                                    {colaborador.bloqueado_sistema ? 'Bloqueado' : 'Liberado'}
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: FINANCEIRO & PRESENÇA */}
                <TabsContent value="financial" className="mt-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Taxa de Presença (6 meses)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.avgAttendance.toFixed(1)}%</div>
                                <p className="text-xs text-muted-foreground mt-1">Baseado em {registros.length} registros</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Faltas Injustificadas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-destructive">
                                    {registros.filter(r => r.status === 'FALTA' && !r.justificativa).length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Nos últimos 6 meses</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Atrasos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-warning">
                                    {registros.filter(r => r.status === 'ATRASADO').length}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Nos últimos 6 meses</p>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Chart */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Custo Mensal Estimado</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.monthlyData}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                        <XAxis dataKey="name" />
                                        <YAxis
                                            tickFormatter={(value) => `R$${value / 1000}k`}
                                        />
                                        <Tooltip
                                            formatter={(value: number) => [`R$ ${value.toLocaleString('pt-BR')}`, 'Custo']}
                                        />
                                        <Bar dataKey="custo" fill="var(--foreground)" radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        {/* Recent Logs Table */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Histórico Recente</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="max-h-[300px] overflow-y-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Data</TableHead>
                                                <TableHead>Status</TableHead>
                                                <TableHead>Performance</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {registros.slice(0, 10).map((reg) => (
                                                <TableRow key={reg.id}>
                                                    <TableCell>{format(parseISO(reg.data), 'dd/MM/yy')}</TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            {reg.status === 'OK' && <CheckCircle className="h-4 w-4 text-success" />}
                                                            {reg.status === 'FALTA' && <XCircle className="h-4 w-4 text-destructive" />}
                                                            {reg.status === 'ATRASADO' && <Clock className="h-4 w-4 text-warning" />}
                                                            <span className="text-sm font-medium">{reg.status}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant="outline" className={
                                                            reg.performance === 'OTIMA' ? 'bg-success/5 text-success' :
                                                                reg.performance === 'RUIM' ? 'bg-destructive/5 text-destructive' : ''
                                                        }>
                                                            {reg.performance}
                                                        </Badge>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                {/* TAB: DOCUMENTOS */}
                <TabsContent value="documents" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Documentos do Colaborador</CardTitle>
                            <div>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleFileUpload}
                                    disabled={uploading}
                                />
                                <Button asChild disabled={uploading}>
                                    <label htmlFor="file-upload" className="cursor-pointer">
                                        {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                                        Upload Documento
                                    </label>
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {documentos.length === 0 ? (
                                <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                                    <FileText className="h-12 w-12 mx-auto mb-3 opacity-20" />
                                    <p>Nenhum documento anexado.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Nome</TableHead>
                                            <TableHead>Tipo</TableHead>
                                            <TableHead>Data Upload</TableHead>
                                            <TableHead className="text-right">Ações</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {documentos.map((doc) => (
                                            <TableRow key={doc.id}>
                                                <TableCell className="font-medium">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-primary" />
                                                        {doc.nome}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="uppercase text-xs text-muted-foreground">{doc.tipo}</TableCell>
                                                <TableCell>{format(parseISO(doc.created_at), 'dd/MM/yyyy HH:mm')}</TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <Button variant="ghost" size="sm" asChild>
                                                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                                                <Download className="h-4 w-4" />
                                                            </a>
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive hover:bg-destructive/5"
                                                            onClick={() => handleDeleteDocumento(doc.id, doc.url)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal de Edição */}
            {colaborador && (
                <ModalCadastroColaborador
                    open={modalEdicaoOpen}
                    onClose={() => setModalEdicaoOpen(false)}
                    colaborador={colaborador}
                    onSalvar={handleSalvarEdicao}
                />
            )}
        </div>
    );
}
