import { useState, useEffect, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft,
    FileText,
    Calendar,
    User,
    Clock,
    MessageSquare,
    Activity,
    Paperclip,
    Send,
    Loader2,
    Code,
    Ban,
    MoreVertical,
    Layers,
    MapPin,
    AlertTriangle,
    Mail,
    Users
} from 'lucide-react';
import { OSHierarchyCard } from '../components/os-hierarchy-card';
import { OSDocumentsTab } from '@/components/os/tabs/os-documents-tab';
import { OSNotificationsCard } from '../components/os-notifications-card';
import { UnifiedWorkflowStepper, QuickActionsPanel } from '../../unified';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';
import { useOSHierarchy } from '@/lib/hooks/use-os-hierarchy';
import { SendMessageModal } from '@/components/shared/send-message-modal';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { OSHeaderDelegacao } from '../components/os-header-delegacao';

// Types for the redesigned OS details
interface OSDetails {
    id: string;
    codigo_os: string;
    status_geral: string;
    descricao: string;
    cliente_id?: string;
    cliente_nome: string;
    cliente_email?: string;
    cliente_telefone?: string;
    endereco_obra?: {
        logradouro?: string;
        numero?: string;
        bairro?: string;
        cidade?: string;
        estado?: string;
        cep?: string;
        complemento?: string;
    };
    tipo_os_nome: string;
    responsavel_nome?: string;
    responsavel_avatar_url?: string;
    criado_por_nome?: string;
    data_entrada?: string;
    data_prazo?: string;
    data_conclusao?: string;
    comentarios_count: number;
    documentos_count: number;
    etapas_concluidas_count: number;
    etapas_total_count: number;
    parent_os_id?: string;
    cc_id?: string;
    // Novos campos de dados da obra (vindos da etapa 1)
    dados_obra?: {
        qtdBlocos?: string;
        qtdUnidades?: string;
        tipoTelhado?: string;
        possuiPiscina?: boolean;
        qtdPavimentos?: string;
        possuiElevador?: boolean;
        tipoEdificacao?: string;
        nomeResponsavel?: string;
        cargoResponsavel?: string;
        tipoEmpresa?: string;
        cpfCnpj?: string;
    };
    status_detalhado?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

interface WorkflowStep {
    id: string;
    nome_etapa: string;
    status: 'pendente' | 'em_andamento' | 'concluida' | 'bloqueada' | 'cancelada';
    ordem: number;
    responsavel_id?: string;
    ultima_atualizacao?: string;
    comentarios_count: number;
    documentos_count: number;
}

interface Comment {
    id: string;
    comentario: string;
    tipo: string;
    criado_em: string;
    usuario_nome: string;
    usuario_avatar_url?: string | null;
    etapa_nome?: string;
}











// Main Component
interface OSDetailsRedesignPageProps {
    osId: string;
}

const OSDetailsRedesignPage = ({ osId }: OSDetailsRedesignPageProps) => {

    // Buscar hierarquia para documentos unificados
    const { parent, children } = useOSHierarchy(osId);

    // Calcular IDs de OS relacionadas para buscar documentos unificados
    const relatedOsIds = useMemo(() => {
        const ids: string[] = [];
        if (parent?.id) ids.push(parent.id);
        children?.forEach(child => ids.push(child.id));
        return ids;
    }, [parent, children]);

    // State management
    const [loading, setLoading] = useState(true);
    const [osDetails, setOsDetails] = useState<OSDetails | null>(null);
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [newComment, setNewComment] = useState('');
    const [commentsPage] = useState(1);
    const [commentsPerPage] = useState(10);
    const [commentFilter] = useState<'all' | 'comentario' | 'sistema'>('all');
    const [searchTerm] = useState('');

    const [isNavigating] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    // Pagination and filtering states


    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isAutoUpdating, setIsAutoUpdating] = useState(false);

    // Cancel modal states
    const [showCancelDialog, setShowCancelDialog] = useState(false);
    const [cancelReason, setCancelReason] = useState('');
    const [cancelReasonOther, setCancelReasonOther] = useState('');
    const [isCancelling, setIsCancelling] = useState(false);

    // Send Message Modal
    const [showSendMessageModal, setShowSendMessageModal] = useState(false);

    // Delegação Modal
    const [showDelegacaoModal, setShowDelegacaoModal] = useState(false);

    // Status Situação (de vw_os_status_completo)
    const [statusSituacao, setStatusSituacao] = useState<string>('acao_pendente');

    // Opções de motivo de cancelamento
    const CANCEL_REASONS = [
        'Cliente desistiu',
        'Proposta não aprovada',
        'Fora do escopo',
        'Duplicidade de OS',
        'Erro no cadastro',
        'Outro',
    ];

    // Load data on mount and when osId changes
    useEffect(() => {
        loadOSData();
    }, [osId]);

    // Update data when filters change
    useEffect(() => {
        if (osId) {
            loadOSData();
        }
    }, [commentsPage, commentFilter, searchTerm]);

    const loadOSData = async (isAutoUpdate = false) => {
        try {
            if (isAutoUpdate) {
                setIsAutoUpdating(true);
            } else {
                setLoading(true);
            }

            // Load OS details with view (with fallback)
            let osData = null;
            try {
                const { data, error } = await supabase
                    .from('os_detalhes_completos')
                    .select('*')
                    .eq('id', osId)
                    .single();

                if (error) throw error;
                osData = data;
            } catch (viewError) {
                console.warn('View os_detalhes_completos não disponível, usando fallback:', viewError);
                // Fallback: Load from ordens_servico with joins
                const { data, error } = await supabase
                    .from('ordens_servico')
                    .select(`
                        id,
                        codigo_os,
                        status_geral,
                        descricao,
                        data_entrada,
                        data_prazo,
                        data_conclusao,
                        clientes!inner(nome_razao_social, email, telefone, endereco),
                        tipos_os!inner(nome),
                        responsavel:colaboradores!ordens_servico_responsavel_id_fkey(nome_completo, avatar_url),
                        criado_por:colaboradores!ordens_servico_criado_por_id_fkey(nome_completo)
                    `)
                    .eq('id', osId)
                    .single();

                if (error) throw error;

                // Conversão segura dos tipos
                const clienteData = data.clientes as any;
                const responsavelData = data.responsavel as any;
                const criadoPorData = data.criado_por as any;
                const tipoOsData = data.tipos_os as any;

                osData = {
                    id: data.id,
                    codigo_os: data.codigo_os,
                    status_geral: data.status_geral,
                    descricao: data.descricao,
                    cliente_nome: clienteData?.nome_razao_social || 'Cliente não encontrado',
                    cliente_email: clienteData?.email,
                    cliente_telefone: clienteData?.telefone,
                    cliente_endereco: {
                        logradouro: typeof clienteData?.endereco === 'object' ? clienteData?.endereco?.logradouro : clienteData?.endereco,
                        numero: typeof clienteData?.endereco === 'object' ? clienteData?.endereco?.numero : undefined,
                        bairro: typeof clienteData?.endereco === 'object' ? clienteData?.endereco?.bairro : undefined,
                        cidade: typeof clienteData?.endereco === 'object' ? clienteData?.endereco?.cidade : undefined,
                        uf: typeof clienteData?.endereco === 'object' ? clienteData?.endereco?.uf : undefined,
                        cep: typeof clienteData?.endereco === 'object' ? clienteData?.endereco?.cep : undefined
                    },
                    tipo_os_nome: tipoOsData?.nome || 'Tipo não encontrado',
                    responsavel_nome: responsavelData?.nome_completo,
                    responsavel_avatar_url: responsavelData?.avatar_url,
                    criado_por_nome: criadoPorData?.nome_completo,
                    data_entrada: data.data_entrada,
                    data_prazo: data.data_prazo,
                    data_conclusao: data.data_conclusao,
                    comentarios_count: 0,
                    documentos_count: 0,
                    etapas_concluidas_count: 0,
                    etapas_total_count: 0
                };
            }
            setOsDetails(osData);

            // Buscar status_situacao da view
            try {
                const { data: statusData } = await supabase
                    .from('vw_os_status_completo')
                    .select('status_situacao')
                    .eq('id', osId)
                    .single();

                if (statusData?.status_situacao) {
                    setStatusSituacao(statusData.status_situacao);
                }
            } catch (statusError) {
                console.warn('Erro ao buscar status_situacao:', statusError);
            }

            // Load workflow steps (with error handling)
            try {
                const { data: stepsData, error: stepsError } = await supabase
                    .from('os_etapas')
                    .select(`
                        id,
                        nome_etapa,
                        status,
                        ordem,
                        responsavel_id,
                        ultima_atualizacao,
                        comentarios_count,
                        documentos_count,
                        dados_etapa
                    `)
                    .eq('os_id', osId)
                    .order('ordem');

                if (stepsError) {
                    console.warn('Erro ao carregar etapas:', stepsError);
                    setWorkflowSteps([]);
                } else {
                    setWorkflowSteps(stepsData || []);

                    // Extract data from Step 1 (Cadastro)
                    const step1 = stepsData?.find((s: any) => s.ordem === 1 && s.dados_etapa);
                    if (step1 && step1.dados_etapa) {
                        const dados = step1.dados_etapa as any;

                        // Update osData with Step 1 info
                        // Handle endereco that may be a nested object or individual fields
                        const enderecoObj = typeof dados.endereco === 'object' && dados.endereco !== null
                            ? dados.endereco
                            : null;

                        osData = {
                            ...osData,
                            // Prioritize Step 1 address over Client fallback
                            endereco_obra: {
                                logradouro: enderecoObj?.rua || enderecoObj?.logradouro || dados.rua || dados.logradouro || (typeof dados.endereco === 'string' ? dados.endereco : '') || osData.endereco_obra?.logradouro,
                                numero: enderecoObj?.numero || dados.numero || osData.endereco_obra?.numero,
                                bairro: enderecoObj?.bairro || dados.bairro || osData.endereco_obra?.bairro,
                                cidade: enderecoObj?.cidade || dados.cidade || osData.endereco_obra?.cidade,
                                estado: enderecoObj?.estado || enderecoObj?.uf || dados.estado || dados.uf || osData.endereco_obra?.estado,
                                cep: enderecoObj?.cep || dados.cep || osData.endereco_obra?.cep,
                                complemento: enderecoObj?.complemento || dados.complemento || osData.endereco_obra?.complemento
                            },
                            // Update client info override if available
                            cliente_nome: dados.nome || osData.cliente_nome,
                            cliente_email: dados.email || osData.cliente_email,
                            cliente_telefone: dados.telefone || osData.cliente_telefone,
                            // Populate technical data
                            dados_obra: {
                                qtdBlocos: dados.qtdBlocos,
                                qtdUnidades: dados.qtdUnidades,
                                tipoTelhado: dados.tipoTelhado,
                                possuiPiscina: dados.possuiPiscina,
                                qtdPavimentos: dados.qtdPavimentos,
                                possuiElevador: dados.possuiElevador,
                                tipoEdificacao: dados.tipoEdificacao,
                                nomeResponsavel: dados.nomeResponsavel,
                                cargoResponsavel: dados.cargoResponsavel,
                                tipoEmpresa: dados.tipoEmpresa,
                                cpfCnpj: dados.cpfCnpj
                            }
                        };

                        // Update state with the enriched data
                        setOsDetails(osData);
                    }
                }
            } catch (stepsError) {
                console.warn('Erro ao carregar etapas:', stepsError);
                setWorkflowSteps([]);
            }

            // Load recent comments (with pagination and filtering)
            try {
                let query = supabase
                    .from('os_comentarios')
                    .select(`
                        id,
                        comentario,
                        tipo,
                        criado_em,
                        colaboradores!inner(nome_completo, avatar_url),
                        os_etapas(nome_etapa)
                    `, { count: 'exact' })
                    .eq('os_id', osId);

                // Apply filters
                if (commentFilter !== 'all') {
                    query = query.eq('tipo', commentFilter);
                }

                if (searchTerm) {
                    query = query.ilike('comentario', `%${searchTerm}%`);
                }

                const { data: commentsData, error: commentsError } = await query
                    .order('criado_em', { ascending: false })
                    .range((commentsPage - 1) * commentsPerPage, commentsPage * commentsPerPage - 1);

                if (commentsError) {
                    console.warn('Erro ao carregar comentários:', commentsError);
                    setComments([]);
                } else {
                    const formattedComments = commentsData?.map(c => ({
                        id: c.id,
                        comentario: c.comentario,
                        tipo: c.tipo,
                        criado_em: c.criado_em,
                        usuario_nome: (c.colaboradores as any)?.nome_completo || 'Usuário',
                        usuario_avatar_url: (c.colaboradores as any)?.avatar_url || null,
                        etapa_nome: (c.os_etapas as any)?.nome_etapa
                    })) || [];
                    setComments(formattedComments);
                }
            } catch (commentsError) {
                console.warn('Erro ao carregar comentários:', commentsError);
                setComments([]);
            }



            // Documents loading removed - handled by OSDockumentsTab

        } catch (error) {
            console.error('Erro crítico ao carregar dados da OS:', error);
            if (!isAutoUpdate) {
                toast.error('Erro ao carregar dados da OS. Tente recarregar a página.');
            }
        } finally {
            setLoading(false);
            setIsAutoUpdating(false);
            setLastUpdate(new Date());
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) {
            toast.error('Digite um comentário antes de adicionar');
            return;
        }

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            const { error } = await supabase
                .from('os_comentarios')
                .insert({
                    os_id: osId,
                    usuario_id: user.id,
                    comentario: newComment.trim(),
                    tipo: 'comentario'
                });

            if (error) throw error;

            // Log activity
            await supabase.rpc('registrar_atividade_os', {
                p_os_id: osId,
                p_usuario_id: user.id,
                p_tipo: 'comentario_adicionado',
                p_descricao: `Comentário adicionado: "${newComment.substring(0, 50)}${newComment.length > 50 ? '...' : ''}"`
            });

            setNewComment('');
            toast.success('Comentário adicionado com sucesso!');
            loadOSData(); // Reload to get updated data

        } catch (error) {
            console.error('Erro ao adicionar comentário:', error);
            toast.error('Erro ao adicionar comentário');
        }
    };

    // Cancelar OS
    const handleCancelOS = async () => {
        if (!cancelReason) {
            toast.error('Selecione um motivo de cancelamento');
            return;
        }

        const finalReason = cancelReason === 'Outro'
            ? cancelReasonOther.trim() || 'Outro motivo não especificado'
            : cancelReason;

        if (cancelReason === 'Outro' && !cancelReasonOther.trim()) {
            toast.error('Descreva o motivo do cancelamento');
            return;
        }

        setIsCancelling(true);
        try {
            // Buscar informações do usuário
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Usuário não autenticado');
                return;
            }

            // Buscar nome do colaborador
            const { data: colaborador } = await supabase
                .from('colaboradores')
                .select('nome_completo')
                .eq('user_id', user.id)
                .single();

            const canceladoPorNome = colaborador?.nome_completo || user.email || 'Usuário desconhecido';
            const dataCancelamento = new Date().toISOString();

            // Atualizar status da OS para cancelado com informações completas
            const { error: updateError } = await supabase
                .from('ordens_servico')
                .update({
                    status_geral: 'cancelado',
                    metadata: {
                        ...osDetails?.metadata,
                        cancelamento: {
                            motivo: finalReason,
                            data: dataCancelamento,
                            cancelado_por_id: user.id,
                            cancelado_por_nome: canceladoPorNome,
                        }
                    }
                })
                .eq('id', osId);

            if (updateError) throw updateError;

            // Inserir na tabela de atividades (audit log)
            const { error: atividadeError } = await supabase.from('os_atividades').insert({
                os_id: osId,
                usuario_id: user.id,
                tipo: 'status_alterado',
                descricao: `OS cancelada. Motivo: ${finalReason}`,
                metadados: {
                    status_anterior: osDetails?.status_geral,
                    status_novo: 'cancelado',
                    motivo_cancelamento: finalReason,
                    cancelado_por: canceladoPorNome,
                }
            });

            if (atividadeError) {
                console.warn('Erro ao registrar atividade:', atividadeError);
            }

            toast.success('OS cancelada com sucesso');
            setShowCancelDialog(false);
            setCancelReason('');
            setCancelReasonOther('');
            loadOSData(); // Recarregar dados
        } catch (error) {
            console.error('Erro ao cancelar OS:', error);
            toast.error('Erro ao cancelar OS');
        } finally {
            setIsCancelling(false);
        }
    };





    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getProgressPercentage = () => {
        if (!osDetails) return 0;
        return Math.round((osDetails.etapas_concluidas_count / osDetails.etapas_total_count) * 100);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                {/* Header Skeleton */}
                <div className="bg-background border-b border-border">
                    <div className="px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="w-24 h-10 bg-muted rounded animate-pulse"></div>
                            <div className="text-center">
                                <div className="w-48 h-8 bg-muted rounded animate-pulse mx-auto mb-2"></div>
                                <div className="w-32 h-4 bg-muted rounded animate-pulse mx-auto"></div>
                            </div>
                            <div className="w-20 h-8 bg-muted rounded animate-pulse"></div>
                        </div>
                    </div>
                </div>

                <div className="px-8 py-6">
                    {/* Tabs Skeleton */}
                    <div className="w-full h-12 bg-muted rounded-xl animate-pulse mb-6"></div>

                    {/* Progress Card Skeleton */}
                    <div className="bg-card border border-border rounded-lg shadow-sm p-6 mb-6">
                        <div className="w-32 h-6 bg-muted rounded animate-pulse mb-4"></div>
                        <div className="space-y-4">
                            <div className="w-full h-4 bg-muted rounded animate-pulse"></div>
                            <div className="flex justify-between">
                                <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
                                <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
                            </div>
                        </div>
                    </div>

                    {/* Info Card Skeleton */}
                    <div className="bg-card border border-border rounded-lg shadow-sm p-6">
                        <div className="w-48 h-7 bg-muted rounded animate-pulse mb-6"></div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="space-y-2">
                                <div className="w-16 h-4 bg-muted rounded animate-pulse"></div>
                                <div className="w-32 h-5 bg-muted rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-2">
                                <div className="w-20 h-4 bg-muted rounded animate-pulse"></div>
                                <div className="w-28 h-5 bg-muted rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="w-full h-16 bg-muted rounded animate-pulse"></div>
                    </div>

                    {/* Loading Message */}
                    <div className="text-center mt-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Carregando detalhes da OS...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!osDetails) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Card className="p-8 border-border">
                    <p className="text-muted-foreground">OS não encontrada</p>
                    <Link to="/os">
                        <Button className="mt-4 bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black">
                            Voltar para OS
                        </Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="bg-muted pb-6">
            {/* Header */}
            <div className="bg-background/95 backdrop-blur-sm border-b border-border">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <Link to="/os">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar
                            </Button>
                        </Link>
                        <div className="text-center">
                            <h1 className="text-2xl font-bold text-neutral-900">{osDetails.codigo_os}</h1>
                            <p className="text-sm text-neutral-600">{osDetails.tipo_os_nome}</p>
                            <p className="text-xs text-neutral-400">{osDetails.cliente_nome}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {/* Badge Status Geral */}
                            <Badge
                                variant="outline"
                                className={
                                    osDetails.status_geral === 'em_andamento'
                                        ? 'bg-info/10 text-info border-info/20'
                                        : osDetails.status_geral === 'em_triagem'
                                            ? 'bg-warning/10 text-warning border-warning/20'
                                            : osDetails.status_geral === 'aguardando_info'
                                                ? 'bg-warning/10 text-warning border-warning/20'
                                                : osDetails.status_geral === 'concluido'
                                                    ? 'bg-success/10 text-success border-success/20'
                                                    : osDetails.status_geral === 'cancelado'
                                                        ? 'bg-destructive/10 text-destructive border-destructive/20'
                                                        : 'bg-muted text-muted-foreground'
                                }
                            >
                                {osDetails.status_geral === 'em_andamento' ? 'Em Andamento'
                                    : osDetails.status_geral === 'em_triagem' ? 'Em Triagem'
                                        : osDetails.status_geral === 'aguardando_info' ? 'Aguard. Info'
                                            : osDetails.status_geral === 'concluido' ? 'Concluído'
                                                : osDetails.status_geral === 'cancelado' ? 'Cancelado'
                                                    : osDetails.status_geral}
                            </Badge>
                            {/* Badge Status Situação - dinâmico */}
                            <Badge
                                variant="outline"
                                className={
                                    statusSituacao === 'atrasado'
                                        ? 'bg-destructive text-destructive-foreground border-destructive'
                                        : statusSituacao === 'aguardando_aprovacao'
                                            ? 'bg-secondary text-secondary-foreground border-secondary'
                                            : statusSituacao === 'aguardando_info'
                                                ? 'bg-warning/20 text-warning border-warning/20'
                                                : statusSituacao === 'alerta_prazo'
                                                    ? 'bg-warning text-warning-foreground border-warning'
                                                    : statusSituacao === 'acao_pendente'
                                                        ? 'bg-primary/10 text-primary border-primary/20'
                                                        : statusSituacao === 'finalizado'
                                                            ? 'bg-muted text-muted-foreground border-muted'
                                                            : 'bg-muted text-muted-foreground'
                                }
                            >
                                {statusSituacao === 'atrasado' ? 'Atrasado'
                                    : statusSituacao === 'aguardando_aprovacao' ? 'Aguard. Aprovação'
                                        : statusSituacao === 'aguardando_info' ? 'Aguard. Info'
                                            : statusSituacao === 'alerta_prazo' ? 'Alerta Prazo'
                                                : statusSituacao === 'acao_pendente' ? 'Ação Pendente'
                                                    : statusSituacao === 'finalizado' ? 'Finalizado'
                                                        : statusSituacao}
                            </Badge>
                            {isAutoUpdating && (
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 animate-pulse">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Atualizando...
                                </Badge>
                            )}
                            {!isAutoUpdating && (
                                <Badge variant="outline" className="bg-success/5 text-success border-success/20 text-xs hidden md:flex">
                                    Atualizado {formatDateTime(lastUpdate.toISOString())}
                                </Badge>
                            )}
                            {/* Menu de ações */}
                            {osDetails.status_geral !== 'cancelado' && osDetails.status_geral !== 'concluido' && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="w-4 h-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            onClick={() => setShowDelegacaoModal(true)}
                                        >
                                            <Users className="w-4 h-4 mr-2" />
                                            Delegar Etapas
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => setShowCancelDialog(true)}
                                            className="text-destructive focus:text-destructive"
                                        >
                                            <Ban className="w-4 h-4 mr-2" />
                                            Cancelar OS
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    {/* Tab Navigation */}
                    <TabsList className="w-full h-auto p-1 bg-muted rounded-xl">
                        <TabsTrigger value="overview" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Visão Geral</span>
                            <span className="sm:hidden truncate">Geral</span>
                        </TabsTrigger>
                        <TabsTrigger value="workflow" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
                            <Layers className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Etapas ({workflowSteps.length})</span>
                            <span className="sm:hidden truncate">Etapas ({workflowSteps.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
                            <Paperclip className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Anexos ({osDetails.documentos_count})</span>
                            <span className="sm:hidden truncate">Anexos ({osDetails.documentos_count})</span>
                        </TabsTrigger>
                        <TabsTrigger value="comments" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
                            <MessageSquare className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Chat ({osDetails.comentarios_count})</span>
                            <span className="sm:hidden truncate">Chat ({osDetails.comentarios_count})</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab Content */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* 1. Cancellation Info Card (Always on top if canceled) */}
                        {osDetails.status_geral === 'cancelado' && osDetails.metadata?.cancelamento && (() => {
                            const cancelamento = osDetails.metadata.cancelamento as {
                                motivo?: string;
                                data?: string;
                                cancelado_por_id?: string;
                                cancelado_por_nome?: string;
                            };
                            return (
                                <Card className="border-destructive/30 bg-destructive/5 rounded-lg shadow-sm">
                                    <CardHeader className="pb-3">
                                        <CardTitle className="text-lg font-semibold text-destructive flex items-center gap-2">
                                            <Ban className="w-5 h-5" />
                                            Cancelada
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="p-3 rounded-lg bg-background border border-border/50">
                                                <p className="text-xs text-muted-foreground mb-1">Cancelado por</p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {cancelamento.cancelado_por_nome || 'Não informado'}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-background border border-border/50">
                                                <p className="text-xs text-muted-foreground mb-1">Data e Hora</p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {cancelamento.data
                                                        ? new Date(cancelamento.data).toLocaleString('pt-BR', {
                                                            day: '2-digit',
                                                            month: '2-digit',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })
                                                        : 'Não informado'}
                                                </p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-background border border-border/50">
                                                <p className="text-xs text-muted-foreground mb-1">Motivo</p>
                                                <p className="text-sm font-medium text-foreground">
                                                    {cancelamento.motivo || 'Não informado'}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })()}

                        {/* 2. Grid: Details & Progress (2:1 Ratio) */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Left Column: Detalhes (Span 2) */}
                            <Card className="border-border rounded-lg shadow-sm h-full flex flex-col lg:col-span-2">
                                <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                                    <CardTitle className="text-base font-semibold">Detalhes</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6 pt-6 flex-1">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Cliente Section */}
                                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <User className="w-4 h-4" />
                                                <span className="font-medium">Cliente</span>
                                            </div>
                                            <p className="text-lg font-medium text-foreground">{osDetails.cliente_nome}</p>
                                            {(osDetails.cliente_email || osDetails.cliente_telefone) && (
                                                <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                                                    {osDetails.cliente_email && <span>{osDetails.cliente_email}</span>}
                                                    {osDetails.cliente_telefone && <span>{osDetails.cliente_telefone}</span>}
                                                </div>
                                            )}
                                            {(osDetails.cliente_email || osDetails.cliente_telefone) && (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="mt-3 w-full"
                                                    onClick={() => setShowSendMessageModal(true)}
                                                >
                                                    <Mail className="w-4 h-4 mr-2" />
                                                    Enviar Mensagem
                                                </Button>
                                            )}
                                        </div>

                                        {/* Address Section */}
                                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <MapPin className="w-4 h-4" />
                                                <span className="font-medium">Endereço da Obra</span>
                                            </div>
                                            {osDetails.endereco_obra ? (
                                                <div className="text-sm text-foreground">
                                                    <p className="font-medium">
                                                        {osDetails.endereco_obra?.logradouro || ''}
                                                        {osDetails.endereco_obra?.numero ? `, ${osDetails.endereco_obra?.numero}` : ''}
                                                    </p>
                                                    <p className="text-muted-foreground">
                                                        {osDetails.endereco_obra?.bairro || ''}
                                                        {osDetails.endereco_obra?.cidade ? ` - ${osDetails.endereco_obra?.cidade}` : ''}
                                                        {osDetails.endereco_obra?.estado ? `/${osDetails.endereco_obra?.estado}` : ''}
                                                    </p>
                                                    {(osDetails.endereco_obra as any).cep && (
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            CEP: {osDetails.endereco_obra?.cep}
                                                        </p>
                                                    )}
                                                    {(osDetails.endereco_obra as any).complemento && (
                                                        <p className="text-xs text-muted-foreground mt-0.5">
                                                            Obs: {osDetails.endereco_obra?.complemento}
                                                        </p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-muted-foreground italic">Endereço não informado</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Dados da Obra (Extra Info) */}
                                    {osDetails.dados_obra && (
                                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50 mt-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                                                <Code className="w-4 h-4" />
                                                <span className="font-medium">Detalhes da Obra</span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-2">
                                                {osDetails.dados_obra.tipoEdificacao && (
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Edificação</p>
                                                        <p className="text-sm">{osDetails.dados_obra.tipoEdificacao}</p>
                                                    </div>
                                                )}
                                                {osDetails.dados_obra.qtdBlocos && (
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Blocos</p>
                                                        <p className="text-sm">{osDetails.dados_obra.qtdBlocos}</p>
                                                    </div>
                                                )}
                                                {osDetails.dados_obra.qtdUnidades && (
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Unidades</p>
                                                        <p className="text-sm">{osDetails.dados_obra.qtdUnidades}</p>
                                                    </div>
                                                )}
                                                {osDetails.dados_obra.qtdPavimentos && (
                                                    <div>
                                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Pavimentos</p>
                                                        <p className="text-sm">{osDetails.dados_obra.qtdPavimentos}</p>
                                                    </div>
                                                )}
                                                {osDetails.dados_obra.tipoTelhado && (
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Telhado</p>
                                                        <p className="text-sm">{osDetails.dados_obra.tipoTelhado}</p>
                                                    </div>
                                                )}
                                                <div className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${osDetails.dados_obra.possuiPiscina ? 'bg-success' : 'bg-muted'}`} />
                                                        <span className="text-xs">Piscina</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${osDetails.dados_obra.possuiElevador ? 'bg-success' : 'bg-muted'}`} />
                                                        <span className="text-xs">Elevador</span>
                                                    </div>
                                                </div>
                                                {osDetails.dados_obra.nomeResponsavel && (
                                                    <div className="col-span-2">
                                                        <p className="text-[10px] uppercase text-muted-foreground font-semibold">Responsável Local</p>
                                                        <p className="text-sm">{osDetails.dados_obra.nomeResponsavel} <span className="text-muted-foreground text-xs">({osDetails.dados_obra.cargoResponsavel})</span></p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Grid: Tipo + Datas */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                                <FileText className="w-4 h-4" />
                                                <span className="font-medium">Tipo</span>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">{osDetails.tipo_os_nome}</p>
                                        </div>

                                        <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                                                <Calendar className="w-4 h-4" />
                                                <span className="font-medium">Abertura</span>
                                            </div>
                                            <p className="text-sm font-medium text-foreground">
                                                {osDetails.data_entrada ? formatDate(osDetails.data_entrada) : '-'}
                                            </p>
                                        </div>

                                        {(() => {
                                            // SLA Status Calculation
                                            const getSLAStatus = () => {
                                                if (!osDetails.data_prazo) return null;
                                                if (osDetails.status_geral === 'concluido') return { status: 'concluido', days: 0, label: 'Concluído' };
                                                const hoje = new Date();
                                                const prazo = new Date(osDetails.data_prazo);
                                                const diffDays = Math.ceil((prazo.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));

                                                if (diffDays < 0) return { status: 'atrasado', days: Math.abs(diffDays), label: `${Math.abs(diffDays)}d atrasado` };
                                                if (diffDays <= 3) return { status: 'alerta', days: diffDays, label: `${diffDays}d restantes` };
                                                return { status: 'ok', days: diffDays, label: `${diffDays}d restantes` };
                                            };
                                            const sla = getSLAStatus();
                                            const bgClass = sla?.status === 'atrasado' ? 'bg-destructive/10 border-destructive/30'
                                                : sla?.status === 'alerta' ? 'bg-warning/10 border-warning/30'
                                                    : sla?.status === 'concluido' ? 'bg-success/10 border-success/30'
                                                        : 'bg-muted/30 border-border/50';
                                            const iconClass = sla?.status === 'atrasado' ? 'text-destructive'
                                                : sla?.status === 'alerta' ? 'text-warning'
                                                    : sla?.status === 'concluido' ? 'text-success'
                                                        : 'text-muted-foreground';
                                            return (
                                                <div className={`p-4 rounded-lg border ${bgClass}`}>
                                                    <div className="flex items-center justify-between mb-1">
                                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                            <Clock className={`w-4 h-4 ${iconClass}`} />
                                                            <span className="font-medium">Prazo</span>
                                                        </div>
                                                        {sla && sla.status !== 'concluido' && sla.status !== 'ok' && (
                                                            <Badge
                                                                variant={sla.status === 'atrasado' ? 'destructive' : 'outline'}
                                                                className="text-[10px] px-1.5 py-0"
                                                            >
                                                                {sla.status === 'atrasado' && <AlertTriangle className="w-3 h-3 mr-0.5" />}
                                                                {sla.label}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <p className="text-sm font-medium text-foreground">
                                                        {osDetails.data_prazo ? formatDate(osDetails.data_prazo) : '-'}
                                                    </p>
                                                </div>
                                            );
                                        })()}
                                    </div>

                                    {/* Responsável */}
                                    <div className="flex items-center gap-4 p-4 rounded-lg bg-primary/5 border border-primary/20">
                                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                                            <AvatarImage
                                                src={osDetails.responsavel_avatar_url || undefined}
                                                alt={osDetails.responsavel_nome || 'Responsável'}
                                            />
                                            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                                                {osDetails.responsavel_nome?.substring(0, 2).toUpperCase() || '??'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Responsável Atual</p>
                                            <p className="text-base font-semibold text-foreground">
                                                {osDetails.responsavel_nome || 'Não atribuído'}
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Criado por: {osDetails.criado_por_nome || 'Sistema'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Descrição */}
                                    {osDetails.descricao && (
                                        <div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <FileText className="w-4 h-4" />
                                                <span className="font-medium">Descrição</span>
                                            </div>
                                            <p className="text-sm text-foreground leading-relaxed">
                                                {osDetails.descricao}
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Right Column: Progresso & Notificações (Span 1) */}
                            <div className="grid grid-rows-[3fr_7fr] gap-4 h-full lg:col-span-1">
                                <Card className="border-border rounded-lg shadow-sm flex flex-col">
                                    <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                                        <CardTitle className="text-base font-semibold flex items-center gap-2">
                                            <Activity className="w-5 h-5 text-primary" />
                                            Progresso
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6 flex-1 flex flex-col justify-center gap-6">
                                        <div className="space-y-3">
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-muted-foreground">Conclusão do Fluxo</span>
                                                <span className="text-2xl font-bold text-primary">{getProgressPercentage()}%</span>
                                            </div>
                                            <Progress value={getProgressPercentage()} className="h-3 w-full" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center hover:bg-muted/50 transition-colors">
                                                <p className="text-2xl font-bold text-foreground mb-0.5">{osDetails.etapas_concluidas_count}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Concluídas</p>
                                            </div>
                                            <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center hover:bg-muted/50 transition-colors">
                                                <p className="text-2xl font-bold text-muted-foreground mb-0.5">{osDetails.etapas_total_count}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Total</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Notifications Card */}
                                <OSNotificationsCard osId={osId} codigoOS={osDetails.codigo_os} />
                            </div>
                        </div>

                        {/* 3. OS Hierarchy (Full Width, now at bottom) */}
                        <OSHierarchyCard osId={osDetails.id} />
                    </TabsContent>

                    {/* Workflow Tab - Unificado com hierarquia */}
                    <TabsContent value="workflow" className="space-y-6">
                        <UnifiedWorkflowStepper
                            osId={osId}
                            isNavigating={isNavigating}
                        />

                        {/* Ações Rápidas (criar OS-09, OS-10) - apenas para contratos */}
                        <QuickActionsPanel
                            osId={osId}
                            clienteId={osDetails?.cliente_id}
                            ccId={osDetails?.cc_id}
                            isContract={osDetails?.tipo_os_nome?.includes('OS-12') || osDetails?.tipo_os_nome?.includes('OS-13') || osDetails?.codigo_os?.startsWith('OS-12') || osDetails?.codigo_os?.startsWith('OS-13')}
                        />
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <OSDocumentsTab osId={osId} relatedOsIds={relatedOsIds} />
                    </TabsContent>

                    {/* Comments Tab - Chat Interface */}
                    <TabsContent value="comments" className="space-y-0">
                        <Card className="border-border rounded-lg shadow-sm overflow-hidden">
                            {/* Chat Header */}
                            <div className="border-b border-border bg-muted/30 px-6 py-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <MessageSquare className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-foreground">Chat Restrito</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {comments.length} mensage{comments.length !== 1 ? 'ns' : 'm'} • Atualizado em tempo real
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className="text-xs">
                                            {osDetails.codigo_os}
                                        </Badge>
                                    </div>
                                </div>
                            </div>

                            {/* Chat Messages Area */}
                            <ScrollArea className="h-[350px] bg-muted/10">
                                <div className="p-4 space-y-4">
                                    {comments.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center h-[280px] text-center">
                                            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                                                <MessageSquare className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                            <h4 className="text-lg font-medium text-foreground mb-1">Nenhuma mensagem</h4>
                                            <p className="text-sm text-muted-foreground max-w-xs">
                                                Inicie uma conversa sobre esta OS. Seus colegas serão notificados.
                                            </p>
                                        </div>
                                    ) : (
                                        [...comments].reverse().map((comment, index, arr) => {
                                            // Check if this is a new day
                                            const currentDate = new Date(comment.criado_em).toDateString();
                                            const prevDate = index > 0 ? new Date(arr[index - 1].criado_em).toDateString() : null;
                                            const showDateSeparator = index === 0 || currentDate !== prevDate;

                                            return (
                                                <div key={comment.id}>
                                                    {showDateSeparator && (
                                                        <div className="flex items-center justify-center my-4">
                                                            <div className="bg-muted/80 px-3 py-1 rounded-full">
                                                                <span className="text-xs font-medium text-muted-foreground">
                                                                    {new Date(comment.criado_em).toLocaleDateString('pt-BR', {
                                                                        day: '2-digit',
                                                                        month: 'long',
                                                                        year: 'numeric'
                                                                    })}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    )}

                                                    <div className="flex gap-3 group animate-in fade-in-50 slide-in-from-bottom-2 duration-300">
                                                        <Avatar className="w-9 h-9 flex-shrink-0 border-2 border-background shadow-sm">
                                                            <AvatarImage
                                                                src={comment.usuario_avatar_url || undefined}
                                                                alt={comment.usuario_nome || 'Usuário'}
                                                            />
                                                            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
                                                                {comment.usuario_nome?.substring(0, 2).toUpperCase() || '??'}
                                                            </AvatarFallback>
                                                        </Avatar>

                                                        <div className="flex-1 max-w-[85%]">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <span className="text-sm font-semibold text-foreground">
                                                                    {comment.usuario_nome || 'Usuário'}
                                                                </span>
                                                                {comment.etapa_nome && (
                                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                                                                        {comment.etapa_nome}
                                                                    </Badge>
                                                                )}
                                                                <span className="text-[11px] text-muted-foreground">
                                                                    {new Date(comment.criado_em).toLocaleTimeString('pt-BR', {
                                                                        hour: '2-digit',
                                                                        minute: '2-digit'
                                                                    })}
                                                                </span>
                                                            </div>

                                                            <div className="bg-background rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm border border-border/50 hover:border-border transition-colors">
                                                                <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                                                                    {comment.comentario}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </ScrollArea>

                            {/* Chat Input Area */}
                            <div className="border-t border-border bg-background p-4">
                                <div className="flex gap-3 items-end">
                                    <div className="flex-1 relative">
                                        <Textarea
                                            placeholder="Digite sua mensagem..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    if (newComment.trim()) {
                                                        handleAddComment();
                                                    }
                                                }
                                            }}
                                            rows={1}
                                            className="min-h-[44px] max-h-32 resize-none pr-12 rounded-2xl border-border/60 focus:border-primary/50 bg-muted/30 transition-all"
                                        />
                                        <div className="absolute right-2 bottom-2 flex items-center gap-1">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-full text-muted-foreground hover:text-primary"
                                            >
                                                <Paperclip className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>

                                    <Button
                                        onClick={handleAddComment}
                                        disabled={!newComment.trim()}
                                        size="icon"
                                        className="h-11 w-11 rounded-full shadow-md shrink-0"
                                    >
                                        <Send className="w-5 h-5" />
                                    </Button>
                                </div>
                                <p className="text-[11px] text-neutral-400 mt-2 text-center">
                                    Pressione <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Enter</kbd> para enviar • <kbd className="px-1.5 py-0.5 bg-muted rounded text-[10px] font-mono">Shift + Enter</kbd> para nova linha
                                </p>
                            </div>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Modal de Cancelamento */}
            <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <AlertDialogContent className="max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                            <Ban className="w-5 h-5" />
                            Cancelar Ordem de Serviço
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação não pode ser desfeita. Por favor, selecione o motivo do cancelamento.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-4 py-4">
                        <RadioGroup value={cancelReason} onValueChange={setCancelReason}>
                            {CANCEL_REASONS.map((reason) => (
                                <div key={reason} className="flex items-center space-x-3">
                                    <RadioGroupItem value={reason} id={reason} />
                                    <Label htmlFor={reason} className="cursor-pointer">
                                        {reason}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>

                        {cancelReason === 'Outro' && (
                            <Textarea
                                placeholder="Descreva o motivo do cancelamento..."
                                value={cancelReasonOther}
                                onChange={(e) => setCancelReasonOther(e.target.value)}
                                className="min-h-[100px]"
                            />
                        )}
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>
                            Voltar
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleCancelOS}
                            disabled={isCancelling || !cancelReason}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isCancelling ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Cancelando...
                                </>
                            ) : (
                                'Confirmar Cancelamento'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Send Message Modal */}
            <SendMessageModal
                open={showSendMessageModal}
                onOpenChange={setShowSendMessageModal}
                destinatario={{
                    nome: osDetails.cliente_nome,
                    email: osDetails.cliente_email,
                    telefone: osDetails.cliente_telefone,
                }}
                contexto={{
                    tipo: 'os',
                    id: osId,
                    codigo: osDetails.codigo_os,
                }}
                variaveis={{
                    os_tipo: osDetails.tipo_os_nome,
                }}
            />

            {/* Delegação Modal */}
            <Dialog open={showDelegacaoModal} onOpenChange={setShowDelegacaoModal}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Delegar Etapas
                        </DialogTitle>
                        <DialogDescription>
                            Selecione um responsável e as etapas que deseja delegar.
                        </DialogDescription>
                    </DialogHeader>
                    <OSHeaderDelegacao
                        osId={osId}
                        onDelegationChange={() => {
                            setShowDelegacaoModal(false);
                            loadOSData();
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div >
    );
};

export { OSDetailsRedesignPage };