
import React, { useState, useEffect } from 'react';
import { useParams } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase-client';
import { Colaborador } from '@/types/colaborador';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';
import { format, parseISO, subMonths, eachMonthOfInterval } from 'date-fns';
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
    Clock,
    AlertTriangle,
    Edit,
    UserCheck,
    UserX,
    ChevronDown,
    FileSpreadsheet,
    Archive,
    Link
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
import { ModalCadastroColaborador, ColaboradorFormPayload } from './modal-cadastro-colaborador';
import { ColaboradorPresencaTab } from './ColaboradorPresencaTab';
import { DOCUMENTOS_OBRIGATORIOS } from '@/lib/constants/colaboradores';
import { FATOR_ENCARGOS_CLT, calcularCustoDiaMaoDeObra } from '@/lib/constants/colaboradores';
import { useCustoTotalMensal } from '@/lib/hooks/use-custos-variaveis';
import { useDiasUteisMes } from '@/lib/hooks/use-dias-uteis';
import { getColaboradorStatus } from '@/lib/utils/colaborador-status';
import { useColaboradorExport } from '@/lib/hooks/use-colaborador-export';

// Types
interface Documento {
    id: string;
    nome: string;
    url: string;
    tipo: string;
    tipo_documento?: string; // RG, CPF, CNH, etc.
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
    is_abonada?: boolean;
    motivo_abono?: string;
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
    const [isGeneratingLink, setIsGeneratingLink] = useState(false);
    const [isTogglingStatus, setIsTogglingStatus] = useState(false);
    
    // Data hooks
    const { data: historicoCustos = [] } = useCustoTotalMensal({ colaboradorId });
    const now = new Date();
    const { data: diasUteisMes = 22 } = useDiasUteisMes(now.getFullYear(), now.getMonth() + 1);
    const { exporting, exportarPDF, exportarCSV } = useColaboradorExport();

    // Computed status
    const statusInfo = colaborador ? getColaboradorStatus(colaborador) : null;

    // Fetch Data
    const fetchData = async () => {
        try {
            setLoading(true);

            // 1. Colaborador (com JOIN do setor)
            const { data: colData, error: colError } = await supabase
                .from('colaboradores')
                .select('*, setores(id, nome, slug)')
                .eq('id', colaboradorId)
                .single();

            if (colError) throw colError;
            // Map setor slug from joined setores for display/filtering
            const colaboradorComSetor = {
                ...colData,
                setor: (colData as any).setores?.slug || colData.setor || undefined,
                setor_slug: (colData as any).setores?.slug || colData.setor_slug || undefined,
            } as Colaborador;
            setColaborador(colaboradorComSetor);

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
    // eslint-disable-next-line no-undef
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, tipoDocumento: string) => {
        const file = e.target.files?.[0];
        if (!file || !colaborador) return;

        try {
            setUploading(true);
            const fileExt = file.name.split('.').pop();
            const fileName = `${colaborador.id}/${tipoDocumento}_${Date.now()}.${fileExt}`;

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
                    tipo_documento: tipoDocumento,
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
            e.target.value = ''; // Reset input
        }
    };

    const handleDeleteDocumento = async (id: string, url: string) => {
        if (!window.confirm('Tem certeza que deseja excluir este documento?')) return;

        try {
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

    const handleSalvarEdicao = async (dados: ColaboradorFormPayload) => {
        try {
            setLoading(true);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { email_acesso: _, enviar_convite: __, ...updatePayload } = dados;
            
            const { error } = await supabase
                .from('colaboradores')
                .update(updatePayload)
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
            const { data, error } = await supabase.functions.invoke('invite-user', {
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

            // Check for logical errors in the response (since batch processing returns 200 OK)
            if (data && !data.success) {
                const firstError = data.results?.failed?.[0]?.error;
                throw new Error(firstError || 'Erro ao processar o convite');
            }

            toast.success('Convite reenviado com sucesso!', {
                description: `Email enviado para ${colaborador.email}`
            });
        } catch (err: unknown) {
            console.error('Erro ao reenviar convite:', err);
            
            const error = err instanceof Error ? err : new Error('Unknown error');

            // Fallback: Se o usuário já existe, enviar email de recuperação
            if (error.message && (error.message.includes('already been registered') || error.message.includes('already registered'))) {
                try {
                    toast.info('Usuário já cadastrado. Enviando email de recuperação de senha...');

                    const { error: resetError } = await supabase.auth.resetPasswordForEmail(colaborador.email, {
                        redirectTo: `${window.location.origin}/auth/callback-reset-password`
                    });

                    if (resetError) throw resetError;

                    toast.success('Email de recuperação enviado!', {
                        description: 'O usuário receberá um link para definir sua senha.'
                    });
                    return;

                } catch (recoveryErr: unknown) {
                    console.error('Erro no fallback de recuperação:', recoveryErr);
                    const recError = recoveryErr instanceof Error ? recoveryErr : new Error('Unknown error');
                    toast.error('Erro ao enviar recuperação', {
                        description: recError.message
                    });
                    return;
                }
            }

            toast.error('Erro ao reenviar convite', {
                description: error.message || 'Verifique se o email é válido ou se houve limite de envios.'
            });
        } finally {
            setIsResendingInvite(false);
        }
    };

    // Copiar Link de Convite
    const handleCopiarLinkConvite = async () => {
        if (!colaborador?.email) {
            toast.error('Colaborador não possui email cadastrado');
            return;
        }

        setIsGeneratingLink(true);
        try {
            const { data, error } = await supabase.functions.invoke('invite-user', {
                body: {
                    action: 'generate-invite-link',
                    email: colaborador.email,
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            });

            if (error) throw error;
            if (data?.error) throw new Error(data.error);
            if (!data?.action_link) throw new Error('Link não retornado pela função');

            await window.navigator.clipboard.writeText(data.action_link);
            
            toast.success('Link copiado!', {
                description: 'O link de acesso foi copiado para a área de transferência. Envie-o para o colaborador definir sua senha.'
            });
        } catch (err: unknown) {
            console.error('Erro ao gerar link de convite:', err);
            const error = err instanceof Error ? err : new Error('Unknown error');
            toast.error('Erro ao gerar link', {
                description: error.message || 'Verifique se o email é válido ou se houve falha no servidor.'
            });
        } finally {
            setIsGeneratingLink(false);
        }
    };

    // Ativar/Desativar colaborador
    const handleToggleStatus = async () => {
        if (!colaborador) return;

        const novoStatus = !colaborador.ativo;
        const acao = novoStatus ? 'ativar' : 'desativar';

        if (!window.confirm(`Tem certeza que deseja ${acao} este colaborador?${!novoStatus ? '\n\nO colaborador não poderá mais acessar o sistema.' : ''}`)) {
            return;
        }

        setIsTogglingStatus(true);
        try {
            const { error } = await supabase
                .from('colaboradores')
                .update({
                    ativo: novoStatus,
                    bloqueado_sistema: !novoStatus // Se desativar, bloqueia o sistema
                })
                .eq('id', colaboradorId);

            if (error) throw error;

            toast.success(
                novoStatus ? 'Colaborador ativado!' : 'Colaborador desativado!',
                { description: novoStatus ? 'O colaborador agora pode acessar o sistema.' : 'O acesso ao sistema foi bloqueado.' }
            );

            fetchData(); // Recarregar dados
        } catch (err) {
            console.error('Erro ao alterar status:', err);
            toast.error(`Erro ao ${acao} colaborador`);
        } finally {
            setIsTogglingStatus(false);
        }
    };

    // Calculations
    const calculateFinancialStats = () => {
        if (!colaborador) return { monthlyData: [], totalCost: 0, avgAttendance: 0 };

        const custoDia = calcularCustoDiaMaoDeObra(
            colaborador.salario_base,
            colaborador.custo_dia,
            diasUteisMes,
            colaborador.tipo_contratacao === 'CLT'
        );

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
                            {statusInfo && (
                                <Badge className={statusInfo.className}>
                                    {statusInfo.label}
                                </Badge>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Ações de Convite - só aparece se não for ativo e não for obra */}
                    {colaborador.status_convite && colaborador.status_convite !== 'ativo' && colaborador.funcao !== 'colaborador_obra' && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" disabled={isResendingInvite || isGeneratingLink}>
                                    {isResendingInvite || isGeneratingLink ? (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    ) : (
                                        <Mail className="mr-2 h-4 w-4" />
                                    )}
                                    Opções de Acesso
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56">
                                <DropdownMenuItem onClick={handleReenviarConvite} disabled={isResendingInvite}>
                                    <Mail className="mr-2 h-4 w-4" />
                                    Enviar Convite por Email
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={handleCopiarLinkConvite} disabled={isGeneratingLink}>
                                    <Link className="mr-2 h-4 w-4" />
                                    Copiar Link de Acesso
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}

                    {/* Dropdown Exportar */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" disabled={exporting}>
                                {exporting ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <Download className="mr-2 h-4 w-4" />
                                )}
                                Exportar
                                <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => exportarPDF(colaborador, registros)}>
                                <FileText className="mr-2 h-4 w-4" />
                                PDF (Relatório Executivo)
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => exportarCSV(colaborador, registros)}>
                                <FileSpreadsheet className="mr-2 h-4 w-4" />
                                Excel/CSV (Analítico)
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="outline" onClick={() => setModalEdicaoOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Editar Cadastro
                    </Button>
                    <Button
                        variant={colaborador.ativo ? "destructive" : "default"}
                        onClick={handleToggleStatus}
                        disabled={isTogglingStatus}
                    >
                        {isTogglingStatus ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : colaborador.ativo ? (
                            <UserX className="mr-2 h-4 w-4" />
                        ) : (
                            <UserCheck className="mr-2 h-4 w-4" />
                        )}
                        {colaborador.ativo ? 'Desativar' : 'Ativar'}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="overview" className="w-full">
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-6">
                    <TabsTrigger
                        value="overview"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                    >
                        Visão Geral
                    </TabsTrigger>
                    <TabsTrigger
                        value="financial"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                    >
                        Financeiro
                    </TabsTrigger>
                    <TabsTrigger
                        value="presence"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
                    >
                        Presença & Performance
                    </TabsTrigger>
                    <TabsTrigger
                        value="documents"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-3"
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
                                <Label className="text-muted-foreground">Endereço Completo</Label>
                                <p className="font-medium text-sm">
                                    {colaborador.logradouro ? (
                                        <>
                                            {colaborador.logradouro}{colaborador.numero ? `, ${colaborador.numero}` : ''}
                                            {colaborador.complemento ? ` - ${colaborador.complemento}` : ''}
                                            <br />
                                            {colaborador.bairro ? `${colaborador.bairro}, ` : ''}
                                            {colaborador.cidade ? `${colaborador.cidade}` : ''}
                                            {colaborador.uf ? `/${colaborador.uf}` : ''}
                                            {colaborador.cep ? ` - CEP: ${colaborador.cep}` : ''}
                                        </>
                                    ) : (
                                        colaborador.endereco || '-'
                                    )}
                                </p>
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
                                <Label className="text-muted-foreground">Dia de Vencimento</Label>
                                <div className="flex items-center gap-2">
                                    <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                                    <p className="font-medium">Dia {colaborador.dia_vencimento || 5}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Dados Bancários */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dados Bancários</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Banco</Label>
                                <p className="font-medium">{colaborador.banco || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Agência</Label>
                                <p className="font-medium">{colaborador.agencia || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Conta</Label>
                                <p className="font-medium">{colaborador.conta || '-'}</p>
                            </div>
                            <div className="space-y-1">
                                <Label className="text-muted-foreground">Chave PIX</Label>
                                <p className="font-medium">{colaborador.chave_pix || '-'}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* TAB: FINANCEIRO */}
                <TabsContent value="financial" className="mt-6 space-y-6">
                    {/* Financial KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Salário Base</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {(colaborador.salario_base || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{colaborador.tipo_contratacao || 'CLT'}</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Encargos CLT</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {colaborador.tipo_contratacao === 'CLT'
                                        ? ((colaborador.salario_base || 0) * (FATOR_ENCARGOS_CLT - 1)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                                        : '—'}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {colaborador.tipo_contratacao === 'CLT' ? `Fator ${FATOR_ENCARGOS_CLT}× (INSS+FGTS)` : 'N/A para PJ'}
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Custo/Dia ({diasUteisMes}d)</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {calcularCustoDiaMaoDeObra(
                                        colaborador.salario_base,
                                        colaborador.custo_dia,
                                        diasUteisMes,
                                        colaborador.tipo_contratacao === 'CLT'
                                    ).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Base de {diasUteisMes} dias úteis</p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-muted-foreground">Custo Mensal Estimado</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-success">
                                    {(calcularCustoDiaMaoDeObra(
                                        colaborador.salario_base,
                                        colaborador.custo_dia,
                                        diasUteisMes,
                                        colaborador.tipo_contratacao === 'CLT'
                                    ) * diasUteisMes).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">Previsão mensal</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Cost Detail Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Detalhamento de Custos (Base + Variável)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Mês</TableHead>
                                        <TableHead>Custo Fixo</TableHead>
                                        <TableHead>Custo Variável</TableHead>
                                        <TableHead className="text-right font-bold">Total</TableHead>
                                        <TableHead className="text-right">Custo/Dia ({diasUteisMes}d)</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historicoCustos.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                                                Nenhum registro de custo variável encontrado. Mostrando apenas previsão fixa atual.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        historicoCustos.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell className="capitalize">
                                                    {format(parseISO(item.mes), 'MMMM/yyyy', { locale: ptBR })}
                                                </TableCell>
                                                <TableCell>{item.custo_fixo.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</TableCell>
                                                <TableCell className="text-warning">
                                                    {item.custo_variavel > 0 && '+ '}
                                                    {item.custo_variavel.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </TableCell>
                                                <TableCell className="text-right font-bold text-success">
                                                    {item.custo_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    {item.custo_dia_calculado.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Cost Chart */}
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
                </TabsContent>

                {/* TAB: PRESENÇA & PERFORMANCE */}
                <TabsContent value="presence" className="mt-6">
                    <ColaboradorPresencaTab colaboradorId={colaboradorId} />
                </TabsContent>

                {/* TAB: DOCUMENTOS */}
                <TabsContent value="documents" className="mt-6">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle>Documentos de Compliance (Obrigatórios)</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {(() => {
                                // Criar mapa de documentos enviados por tipo
                                const docsEnviados = new Map<string, Documento>();
                                documentos.forEach(doc => {
                                    if (doc.tipo_documento) {
                                        // Se já existe um documento deste tipo, mantém o mais recente
                                        const existing = docsEnviados.get(doc.tipo_documento);
                                        if (!existing || new Date(doc.created_at) > new Date(existing.created_at)) {
                                            docsEnviados.set(doc.tipo_documento, doc);
                                        }
                                    }
                                });

                                // Lista fixa baseada na constante DOCUMENTOS_OBRIGATORIOS
                                const checklist = DOCUMENTOS_OBRIGATORIOS.map(docInfo => {
                                    const docEnviado = docsEnviados.get(docInfo.value);
                                    return {
                                        tipo_documento: docInfo.value,
                                        label: docInfo.label,
                                        obrigatorio: true,
                                        enviado: !!docEnviado,
                                        documento: docEnviado,
                                        isLegacy: false
                                    };
                                });
                                
                                // Documentos "extras" ou legados (que não estão na lista fixa atual)
                                const legacyDocs = Array.from(docsEnviados.values()).filter(
                                    (doc) => !DOCUMENTOS_OBRIGATORIOS.some(d => d.value === doc.tipo_documento)
                                );
                                
                                const documentosLegadosStatus = legacyDocs.map(doc => ({
                                    tipo_documento: doc.tipo_documento || doc.id,
                                    label: doc.tipo_documento ? `(Legado) ${doc.tipo_documento}` : `(Legado) ${doc.nome}`,
                                    obrigatorio: false,
                                    enviado: true,
                                    documento: doc,
                                    isLegacy: true
                                }));

                                const todosDocumentos = [...checklist, ...documentosLegadosStatus];

                                return (
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Documento</TableHead>
                                                <TableHead>Situação</TableHead>
                                                <TableHead>Último Envio</TableHead>
                                                <TableHead className="text-center">Ações</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {todosDocumentos.map((item, idx) => (
                                                <TableRow key={`${item.tipo_documento}-${idx}`}>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <FileText className="h-4 w-4 text-primary shrink-0" />
                                                            <span className="font-medium text-sm">{item.label}</span>
                                                            {item.obrigatorio && (
                                                                <Badge variant="outline" className="text-xs">Obrigatório</Badge>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        {item.enviado && !item.isLegacy ? (
                                                            <Badge className="bg-success/10 text-success border-success/30">
                                                                <CheckCircle className="h-3 w-3 mr-1 shrink-0" />
                                                                Enviado
                                                            </Badge>
                                                        ) : item.isLegacy ? (
                                                             <Badge variant="secondary" className="bg-muted text-muted-foreground border-border">
                                                                <Archive className="h-3 w-3 mr-1 shrink-0" />
                                                                Arquivado
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="destructive" className="bg-warning/10 text-warning border-warning/30">
                                                                <Clock className="h-3 w-3 mr-1 shrink-0" />
                                                                Pendente
                                                            </Badge>
                                                        )}
                                                    </TableCell>
                                                    <TableCell className="text-sm">
                                                        {item.documento?.created_at
                                                            ? format(parseISO(item.documento.created_at), 'dd/MM/yyyy HH:mm')
                                                            : '-'
                                                        }
                                                    </TableCell>
                                                    <TableCell className="text-center">
                                                        <div className="flex justify-center flex-row gap-2">
                                                            {item.documento ? (
                                                                <>
                                                                    <Button variant="ghost" size="icon" asChild>
                                                                        <a href={item.documento.url} target="_blank" rel="noopener noreferrer">
                                                                            <Download className="h-4 w-4" />
                                                                        </a>
                                                                    </Button>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        className="text-destructive hover:text-destructive hover:bg-destructive/5"
                                                                        onClick={() => handleDeleteDocumento(item.documento!.id, item.documento!.url)}
                                                                        disabled={uploading}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <input
                                                                        type="file"
                                                                        id={`file-upload-${item.tipo_documento}`}
                                                                        className="hidden"
                                                                        onChange={(e) => handleFileUpload(e, item.tipo_documento)}
                                                                        disabled={uploading}
                                                                    />
                                                                    <Button variant="outline" size="sm" asChild disabled={uploading}>
                                                                        <label htmlFor={`file-upload-${item.tipo_documento}`} className="cursor-pointer">
                                                                            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                                                                            Upload
                                                                        </label>
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                );
                            })()}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Modal de Edição */}
            {colaborador && (
                <ModalCadastroColaborador
                    mode="edit"
                    open={modalEdicaoOpen}
                    onClose={() => setModalEdicaoOpen(false)}
                    colaborador={colaborador}
                    onSalvar={handleSalvarEdicao}
                />
            )}
        </div>
    );
}
