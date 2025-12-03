import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    ArrowLeft,
    FileText,
    Upload,
    Download,
    Calendar,
    User,
    Clock,
    MessageSquare,
    Activity,
    Paperclip,
    Play,
    CheckCircle,
    AlertCircle,
    Lock,
    X,
    Send,
    Loader2,
    Sun,
    Moon
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';

// Types for the redesigned OS details
interface OSDetails {
    id: string;
    codigo_os: string;
    status_geral: string;
    descricao: string;
    cliente_nome: string;
    cliente_email?: string;
    cliente_telefone?: string;
    cliente_endereco?: any;
    tipo_os_nome: string;
    responsavel_nome?: string;
    criado_por_nome?: string;
    data_entrada?: string;
    data_prazo?: string;
    data_conclusao?: string;
    comentarios_count: number;
    documentos_count: number;
    etapas_concluidas_count: number;
    etapas_total_count: number;
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
    usuario_avatar?: string;
    etapa_nome?: string;
}

interface ActivityItem {
    id: string;
    tipo: string;
    descricao: string;
    criado_em: string;
    usuario_nome: string;
    metadados?: any;
}

interface Document {
    id: string;
    nome: string;
    tipo?: string;
    tamanho_bytes?: number;
    criado_em: string;
    uploaded_by_nome: string;
    caminho_arquivo?: string;
}

const getStatusBadge = (status: string) => {
    const badges = {
        'em_triagem': <Badge variant="secondary" className="bg-muted text-foreground font-medium">Triagem</Badge>,
        'em_andamento': <Badge className="bg-primary/20 text-primary font-medium">Em Andamento</Badge>,
        'aguardando_aprovacao': <Badge className="bg-secondary/20 text-secondary font-medium">Aguardando Aprovação</Badge>,
        'concluida': <Badge className="bg-success/10 text-success font-medium">Concluída</Badge>,
        'cancelada': <Badge className="bg-destructive/20 text-destructive font-medium">Cancelada</Badge>,
    };
    return badges[status as keyof typeof badges] || badges.em_triagem;
};

const getStepStatusIcon = (status: string) => {
    switch (status) {
        case 'concluida': return <CheckCircle className="w-5 h-5 text-success" />;
        case 'em_andamento': return <Play className="w-5 h-5 text-primary" />;
        case 'bloqueada': return <Lock className="w-5 h-5 text-destructive" />;
        case 'cancelada': return <X className="w-5 h-5 text-destructive" />;
        default: return <AlertCircle className="w-5 h-5 text-muted-foreground" />;
    }
};

// Workflow Access Rules
enum WorkflowAccessRule {
    COMPLETED_READ_ONLY = 'completed_read_only',
    CURRENT_EDITABLE = 'current_editable',
    NEXT_AVAILABLE = 'next_available',
    FUTURE_BLOCKED = 'future_blocked',
    PREVIOUS_READ_ONLY = 'previous_read_only'
}

// Helper functions for workflow navigation
const getCurrentStepOrder = (steps: WorkflowStep[]): number => {
    const firstIncomplete = steps
        .filter(step => step.status !== 'concluida')
        .sort((a, b) => a.ordem - b.ordem)[0];

    return firstIncomplete?.ordem || steps.length + 1;
};

const determineWorkflowAccess = (
    step: WorkflowStep,
    currentStepOrder: number
): WorkflowAccessRule => {
    // Etapa cancelada: sempre leitura (similar a concluída, mas com visual diferente)
    if (step.status === 'cancelada') {
        return WorkflowAccessRule.COMPLETED_READ_ONLY;
    }

    // Etapa concluída: sempre leitura
    if (step.status === 'concluida') {
        return WorkflowAccessRule.COMPLETED_READ_ONLY;
    }

    // Etapa atual: edição completa
    if (step.ordem === currentStepOrder) {
        return WorkflowAccessRule.CURRENT_EDITABLE;
    }

    // Próxima etapa disponível
    if (step.ordem === currentStepOrder + 1 && step.status === 'pendente') {
        return WorkflowAccessRule.NEXT_AVAILABLE;
    }

    // Etapas futuras: bloqueadas
    if (step.ordem > currentStepOrder) {
        return WorkflowAccessRule.FUTURE_BLOCKED;
    }

    // Etapas anteriores não concluídas: leitura
    return WorkflowAccessRule.PREVIOUS_READ_ONLY;
};

const validateWorkflowAccess = (
    targetStep: WorkflowStep,
    currentStepOrder: number
): { canAccess: boolean; reason: string } => {
    const accessRule = determineWorkflowAccess(targetStep, currentStepOrder);

    switch (accessRule) {
        case WorkflowAccessRule.COMPLETED_READ_ONLY:
            return { canAccess: true, reason: 'Visualização permitida' };

        case WorkflowAccessRule.CURRENT_EDITABLE:
            return { canAccess: true, reason: 'Edição permitida' };

        case WorkflowAccessRule.NEXT_AVAILABLE:
            return { canAccess: true, reason: 'Iniciar próxima etapa' };

        case WorkflowAccessRule.FUTURE_BLOCKED:
            return {
                canAccess: false,
                reason: 'Complete as etapas anteriores primeiro'
            };

        default:
            return {
                canAccess: false,
                reason: 'Acesso não autorizado'
            };
    }
};

const getStepStatusColor = (status: string) => {
    switch (status) {
        case 'concluida': return 'bg-success/5 border-success/20 text-success';
        case 'em_andamento': return 'bg-primary/5 border-primary/20 text-primary';
        case 'bloqueada': return 'bg-destructive/5 border-destructive/20 text-destructive';
        case 'cancelada': return 'bg-destructive/5 border-destructive/20 text-destructive';
        default: return 'bg-background border-border text-foreground';
    }
};

// Component for workflow navigation buttons
const WorkflowNavigationButton = ({
    step,
    currentStepOrder,
    onNavigate,
    isNavigating = false
}: {
    step: WorkflowStep;
    currentStepOrder: number;
    onNavigate: (step: WorkflowStep) => void;
    isNavigating?: boolean;
}) => {
    const accessRule = determineWorkflowAccess(step, currentStepOrder);

    const getButtonConfig = () => {
        switch (accessRule) {
            case WorkflowAccessRule.COMPLETED_READ_ONLY:
                return {
                    variant: 'outline' as const,
                    className: 'border-success/20 text-success hover:bg-success/5',
                    disabled: false,
                    text: 'Ver'
                };
            case WorkflowAccessRule.CURRENT_EDITABLE:
                return {
                    variant: 'default' as const,
                    className: 'bg-primary hover:bg-primary',
                    disabled: false,
                    text: 'Continuar'
                };
            case WorkflowAccessRule.NEXT_AVAILABLE:
                return {
                    variant: 'default' as const,
                    className: 'bg-primary hover:bg-primary/90',
                    disabled: false,
                    text: 'Iniciar'
                };
            case WorkflowAccessRule.FUTURE_BLOCKED:
                return {
                    variant: 'outline' as const,
                    className: 'border-destructive/20 text-destructive cursor-not-allowed',
                    disabled: true,
                    text: 'Bloqueado'
                };
            default:
                return {
                    variant: 'outline' as const,
                    className: 'border-border text-muted-foreground cursor-not-allowed',
                    disabled: true,
                    text: 'Indisponível'
                };
        }
    };

    const config = getButtonConfig();

    return (
        <Button
            variant={config.variant}
            className={config.className}
            disabled={config.disabled || isNavigating}
            onClick={() => onNavigate(step)}
            size="sm"
        >
            {isNavigating ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
                <Play className="w-4 h-4 mr-2" />
            )}
            {config.text}
        </Button>
    );
};

// Main Component
interface OSDetailsRedesignPageProps {
    osId: string;
}

const OSDetailsRedesignPage = ({ osId }: OSDetailsRedesignPageProps) => {
    const navigate = useNavigate();

    // State management
    const [loading, setLoading] = useState(true);
    const [osDetails, setOsDetails] = useState<OSDetails | null>(null);
    const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([]);
    const [comments, setComments] = useState<Comment[]>([]);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [activeTab, setActiveTab] = useState('overview');
    const [newComment, setNewComment] = useState('');
    const [isNavigating, setIsNavigating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    // Pagination and filtering states
    const [commentsPage, setCommentsPage] = useState(1);
    const [activitiesPage, setActivitiesPage] = useState(1);
    const [commentsPerPage] = useState(10);
    const [activitiesPerPage] = useState(20);
    const [commentFilter, setCommentFilter] = useState<'all' | 'comentario' | 'sistema'>('all');
    const [activityFilter, setActivityFilter] = useState<'all' | 'etapa' | 'documento' | 'comentario'>('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
    const [isAutoUpdating, setIsAutoUpdating] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Load data on mount and when osId changes
    useEffect(() => {
        loadOSData();
    }, [osId]);

    // Real-time updates polling (every 30 seconds)
    useEffect(() => {
        if (!osId) return;

        const interval = setInterval(() => {
            loadOSData(true); // Pass isAutoUpdate = true
        }, 30000); // 30 seconds

        return () => clearInterval(interval);
    }, [osId]);

    // Update data when filters change
    useEffect(() => {
        if (osId) {
            loadOSData();
        }
    }, [commentsPage, activitiesPage, commentFilter, activityFilter, searchTerm]);

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
                        clientes!inner(nome_razao_social),
                        tipos_os!inner(nome),
                        colaboradores!ordens_servico_responsavel_id_fkey(nome_completo),
                        colaboradores!ordens_servico_criado_por_id_fkey(nome_completo)
                    `)
                    .eq('id', osId)
                    .single();

                if (error) throw error;
                osData = {
                    id: data.id,
                    codigo_os: data.codigo_os,
                    status_geral: data.status_geral,
                    descricao: data.descricao,
                    cliente_nome: (data.clientes as any)?.nome_razao_social || 'Cliente não encontrado',
                    tipo_os_nome: (data.tipos_os as any)?.nome || 'Tipo não encontrado',
                    responsavel_nome: (data.colaboradores?.[0] as any)?.nome_completo,
                    criado_por_nome: (data.colaboradores?.[1] as any)?.nome_completo,
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
                        documentos_count
                    `)
                    .eq('os_id', osId)
                    .order('ordem');

                if (stepsError) {
                    console.warn('Erro ao carregar etapas:', stepsError);
                    setWorkflowSteps([]);
                } else {
                    setWorkflowSteps(stepsData || []);
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
                        colaboradores!inner(nome_completo),
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

                const { data: commentsData, error: commentsError, count } = await query
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
                        etapa_nome: (c.os_etapas as any)?.nome_etapa
                    })) || [];
                    setComments(formattedComments);
                }
            } catch (commentsError) {
                console.warn('Erro ao carregar comentários:', commentsError);
                setComments([]);
            }

            // Load recent activities (with pagination and filtering)
            try {
                let query = supabase
                    .from('os_atividades')
                    .select(`
                        id,
                        tipo,
                        descricao,
                        criado_em,
                        colaboradores!inner(nome_completo),
                        metadados
                    `, { count: 'exact' })
                    .eq('os_id', osId);

                // Apply filters
                if (activityFilter !== 'all') {
                    query = query.eq('tipo', activityFilter);
                }

                if (searchTerm) {
                    query = query.ilike('descricao', `%${searchTerm}%`);
                }

                const { data: activitiesData, error: activitiesError } = await query
                    .order('criado_em', { ascending: false })
                    .range((activitiesPage - 1) * activitiesPerPage, activitiesPage * activitiesPerPage - 1);

                if (activitiesError) {
                    console.warn('Erro ao carregar atividades:', activitiesError);
                    setActivities([]);
                } else {
                    const formattedActivities = activitiesData?.map(a => ({
                        id: a.id,
                        tipo: a.tipo,
                        descricao: a.descricao,
                        criado_em: a.criado_em,
                        usuario_nome: (a.colaboradores as any)?.nome_completo || 'Sistema',
                        metadados: a.metadados
                    })) || [];
                    setActivities(formattedActivities);
                }
            } catch (activitiesError) {
                console.warn('Erro ao carregar atividades:', activitiesError);
                setActivities([]);
            }

            // Load documents (with error handling)
            try {
                const { data: documentsData, error: documentsError } = await supabase
                    .from('os_documentos')
                    .select(`
                        id,
                        nome,
                        tipo,
                        tamanho_bytes,
                        criado_em,
                        caminho_arquivo,
                        colaboradores!inner(nome_completo)
                    `)
                    .eq('os_id', osId)
                    .order('criado_em', { ascending: false });

                if (documentsError) {
                    console.warn('Erro ao carregar documentos:', documentsError);
                    setDocuments([]);
                } else {
                    const formattedDocuments = documentsData?.map(d => ({
                        id: d.id,
                        nome: d.nome,
                        tipo: d.tipo,
                        tamanho_bytes: d.tamanho_bytes,
                        criado_em: d.criado_em,
                        caminho_arquivo: d.caminho_arquivo,
                        uploaded_by_nome: (d.colaboradores as any)?.nome_completo || 'Usuário'
                    })) || [];
                    setDocuments(formattedDocuments);
                }
            } catch (documentsError) {
                console.warn('Erro ao carregar documentos:', documentsError);
                setDocuments([]);
            }

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

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validações básicas
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            toast.error('Arquivo muito grande. Máximo 10MB.');
            return;
        }

        const allowedTypes = [
            'application/pdf',
            'image/jpeg',
            'image/png',
            'image/gif',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        ];

        if (!allowedTypes.includes(file.type)) {
            toast.error('Tipo de arquivo não permitido. Use PDF, imagens ou documentos Word.');
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Usuário não autenticado');

            // Simular progresso
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => Math.min(prev + 10, 90));
            }, 200);

            // Upload para Supabase Storage
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `os/${osId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('os-documents')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            clearInterval(progressInterval);
            setUploadProgress(100);

            // Registrar no banco
            const { error: dbError } = await supabase
                .from('os_documentos')
                .insert({
                    os_id: osId,
                    nome: file.name,
                    tipo: file.type,
                    caminho_arquivo: filePath,
                    tamanho_bytes: file.size,
                    uploaded_by: user.id
                });

            if (dbError) throw dbError;

            // Log activity
            await supabase.rpc('registrar_atividade_os', {
                p_os_id: osId,
                p_usuario_id: user.id,
                p_tipo: 'documento_upload',
                p_descricao: `Documento "${file.name}" foi enviado`
            });

            toast.success('Documento enviado com sucesso!');
            loadOSData(); // Recarregar dados

        } catch (error) {
            console.error('Erro no upload:', error);
            toast.error('Erro ao enviar documento. Tente novamente.');
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
            // Limpar input file
            event.target.value = '';
        }
    };

    const handleWorkflowNavigation = async (step: WorkflowStep) => {
        // Prevenir cliques duplos
        if (isNavigating) return;
        setIsNavigating(true);

        try {
            // ===== VALIDAÇÕES OBRIGATÓRIAS =====
            if (!osId) {
                toast.error('ID da OS não encontrado');
                return;
            }

            if (!osDetails) {
                toast.error('Detalhes da OS não carregados');
                return;
            }

            if (step.ordem < 1 || step.ordem > 15) {
                toast.error('Etapa inválida');
                return;
            }

            // ===== VERIFICAR ACESSO =====
            const currentStepOrder = getCurrentStepOrder(workflowSteps);
            const accessRule = determineWorkflowAccess(step, currentStepOrder);
            const { canAccess, reason } = validateWorkflowAccess(step, currentStepOrder);

            if (!canAccess) {
                toast.error(reason);
                return;
            }

            // ===== BLOQUEAR ETAPAS FUTURAS =====
            if (accessRule === WorkflowAccessRule.FUTURE_BLOCKED) {
                toast.error('Complete as etapas anteriores primeiro');
                return;
            }

            // ===== REGISTRAR ATIVIDADE =====
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error('Usuário não autenticado');
                return;
            }

            await supabase.rpc('registrar_atividade_os', {
                p_os_id: osId,
                p_etapa_id: step.id,
                p_usuario_id: user.id,
                p_tipo: 'navegacao_etapa',
                p_descricao: `Navegou para etapa ${step.ordem}: ${step.nome_etapa}`
            });

            // ===== DETERMINAR MODO READONLY =====
            const isReadonly = accessRule === WorkflowAccessRule.COMPLETED_READ_ONLY
                || accessRule === WorkflowAccessRule.PREVIOUS_READ_ONLY
                || step.status === 'cancelada';

            // ===== NAVEGAR COM READONLY PARAM =====
            navigate({
                to: '/os/details-workflow/$id',
                params: { id: osId },
                search: {
                    step: step.ordem,
                    readonly: isReadonly
                }
            });

        } catch (error) {
            console.error('Erro na navegação:', error);
            toast.error('Erro ao navegar para a etapa');
        } finally {
            setIsNavigating(false);
        }
    };

    const handleFileDownload = async (doc: Document) => {
        try {
            if (!doc.caminho_arquivo) {
                toast.error('Caminho do arquivo não encontrado');
                return;
            }

            const { data, error } = await supabase.storage
                .from('os-documents')
                .download(doc.caminho_arquivo);

            if (error) throw error;

            // Criar URL de download
            const url = URL.createObjectURL(data);
            const link = window.document.createElement('a');
            link.href = url;
            link.download = doc.nome;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
            URL.revokeObjectURL(url);

            toast.success('Download iniciado');

        } catch (error) {
            console.error('Erro no download:', error);
            toast.error('Erro ao baixar arquivo');
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
            <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-neutral-900 text-neutral-50' : 'bg-background text-foreground'}`}>
                {/* Header Skeleton */}
                <div className="bg-background border-b border-border sticky top-0 z-10">
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
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-background border-b border-border sticky top-0 z-10">
                <div className="px-8 py-6">
                    <div className="flex items-center justify-between">
                        <Link to="/os">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 rounded-md"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Voltar
                            </Button>
                        </Link>
                        <div className="text-center">
                            <h1 className="text-3xl font-bold">{osDetails.codigo_os}</h1>
                            <p className="text-muted-foreground font-normal">{osDetails.cliente_nome}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(osDetails.status_geral)}
                            {isAutoUpdating && (
                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 animate-pulse">
                                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                                    Atualizando...
                                </Badge>
                            )}
                            {!isAutoUpdating && (
                                <Badge variant="outline" className="bg-success/5 text-success border-success/20 text-xs">
                                    Atualizado {formatDateTime(lastUpdate.toISOString())}
                                </Badge>
                            )}
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsDarkMode(!isDarkMode)}
                                className="rounded-md"
                            >
                                {isDarkMode ? (
                                    <Sun className="w-4 h-4" />
                                ) : (
                                    <Moon className="w-4 h-4" />
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 py-6">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    {/* Tab Navigation */}
                    <TabsList className="w-full h-auto p-1 bg-muted rounded-xl">
                        <TabsTrigger value="overview" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
                            <FileText className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Visão Geral</span>
                            <span className="sm:hidden truncate">Geral</span>
                        </TabsTrigger>
                        <TabsTrigger value="workflow" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
                            <Activity className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Etapas ({workflowSteps.length})</span>
                            <span className="sm:hidden truncate">Etapas ({workflowSteps.length})</span>
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
                            <Paperclip className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Documentos ({osDetails.documentos_count})</span>
                            <span className="sm:hidden truncate">Docs ({osDetails.documentos_count})</span>
                        </TabsTrigger>
                        <TabsTrigger value="comments" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
                            <MessageSquare className="w-4 h-4 flex-shrink-0" />
                            <span className="hidden sm:inline truncate">Comentários ({osDetails.comentarios_count})</span>
                            <span className="sm:hidden truncate">Chat ({osDetails.comentarios_count})</span>
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab Content */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Progress Card */}
                        <Card className="border-border rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Progresso da OS</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-2">
                                        <span>Etapas Concluídas</span>
                                        <span>{osDetails.etapas_concluidas_count}/{osDetails.etapas_total_count}</span>
                                    </div>
                                    <Progress value={getProgressPercentage()} className="h-2" />
                                    <p className="text-xs text-muted-foreground mt-1">{getProgressPercentage()}% concluído</p>
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Comentários</span>
                                        <span>{osDetails.comentarios_count}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span>Documentos</span>
                                        <span>{osDetails.documentos_count}</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* OS Information */}
                        <Card className="border-border rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Informações da OS</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 font-medium">
                                            <User className="w-4 h-4" />
                                            <span>Cliente</span>
                                        </div>
                                        <p className="font-normal text-lg">{osDetails.cliente_nome}</p>
                                        {osDetails.cliente_email && (
                                            <p className="text-sm text-muted-foreground">{osDetails.cliente_email}</p>
                                        )}
                                        {osDetails.cliente_telefone && (
                                            <p className="text-sm text-muted-foreground">{osDetails.cliente_telefone}</p>
                                        )}
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 font-medium">
                                            <FileText className="w-4 h-4" />
                                            <span>Tipo de Serviço</span>
                                        </div>
                                        <p className="font-normal">{osDetails.tipo_os_nome}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <span>Data de Abertura</span>
                                        </div>
                                        <p className="font-normal">{osDetails.data_entrada ? formatDate(osDetails.data_entrada) : '-'}</p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 font-medium">
                                            <Clock className="w-4 h-4" />
                                            <span>Prazo</span>
                                        </div>
                                        <p className="font-normal">{osDetails.data_prazo ? formatDate(osDetails.data_prazo) : '-'}</p>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 font-medium">
                                        <User className="w-4 h-4" />
                                        <span>Responsável Atual</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Avatar className="w-8 h-8">
                                            <AvatarFallback className="bg-primary text-white font-medium">
                                                {osDetails.responsavel_nome?.substring(0, 2).toUpperCase() || '??'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="font-medium">{osDetails.responsavel_nome || 'Não atribuído'}</p>
                                            <p className="text-xs text-muted-foreground">Iniciado por: {osDetails.criado_por_nome || 'Sistema'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1 font-medium">
                                        <FileText className="w-4 h-4" />
                                        <span>Descrição</span>
                                    </div>
                                    <p className="text-muted-foreground font-normal">{osDetails.descricao}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Workflow Tab */}
                    <TabsContent value="workflow" className="space-y-6">
                        <Card className="border-border rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-xl font-semibold">Etapas do Workflow</CardTitle>
                                <p className="text-sm text-muted-foreground">
                                    Clique em "Ir" para continuar o workflow ou visualizar etapas concluídas
                                </p>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {workflowSteps.map((step, index) => (
                                        <div
                                            key={step.id}
                                            className={`flex items-center justify-between p-4 rounded-lg border transition-all hover:shadow-md ${step.status === 'em_andamento' ? 'bg-primary/5 border-primary/20' :
                                                step.status === 'concluida' ? 'bg-success/5 border-success/20' :
                                                    'bg-card border-border'
                                                }`}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-background border-2 border-current">
                                                    {getStepStatusIcon(step.status)}
                                                </div>
                                                <div>
                                                    <h3 className="font-medium">{step.nome_etapa}</h3>
                                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                        <span>Etapa {step.ordem}</span>
                                                        {step.responsavel_id && <span>• Responsável definido</span>}
                                                        {step.ultima_atualizacao && (
                                                            <span>• Atualizado {formatDate(step.ultima_atualizacao)}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <div className="text-right text-sm">
                                                    <div className="flex items-center gap-2">
                                                        <MessageSquare className="w-4 h-4" />
                                                        <span>{step.comentarios_count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Paperclip className="w-4 h-4" />
                                                        <span>{step.documentos_count}</span>
                                                    </div>
                                                </div>

                                                <Badge variant="outline" className={getStepStatusColor(step.status)}>
                                                    {step.status === 'concluida' ? 'Concluída' :
                                                        step.status === 'em_andamento' ? 'Em Andamento' :
                                                            step.status === 'bloqueada' ? 'Bloqueada' :
                                                                step.status === 'cancelada' ? 'Cancelada' : 'Pendente'}
                                                </Badge>

                                                <WorkflowNavigationButton
                                                    step={step}
                                                    currentStepOrder={getCurrentStepOrder(workflowSteps)}
                                                    onNavigate={handleWorkflowNavigation}
                                                    isNavigating={isNavigating}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Documents Tab */}
                    <TabsContent value="documents" className="space-y-6">
                        <Card className="border-border rounded-lg shadow-sm">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl font-semibold">Documentos Vinculados</CardTitle>
                                    <div className="flex items-center gap-2">
                                        {isUploading && (
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                <span>Enviando... {uploadProgress}%</span>
                                            </div>
                                        )}
                                        <Button
                                            size="sm"
                                            className="rounded-md"
                                            disabled={isUploading}
                                            onClick={() => document.getElementById('file-upload')?.click()}
                                        >
                                            <Upload className="w-4 h-4 mr-2" />
                                            Upload
                                        </Button>
                                        <input
                                            id="file-upload"
                                            type="file"
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                            onChange={handleFileUpload}
                                            disabled={isUploading}
                                        />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {documents.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        <Paperclip className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                        <p>Nenhum documento vinculado ainda</p>
                                        <p className="text-sm">Os documentos gerados no workflow aparecerão aqui</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {documents.map(doc => (
                                            <div
                                                key={doc.id}
                                                className="flex items-center justify-between p-3 bg-background rounded-md hover:bg-muted transition-colors border border-border"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <FileText className="w-5 h-5 text-primary flex-shrink-0" />
                                                    <div>
                                                        <p className="font-medium">{doc.nome}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {doc.uploaded_by_nome} • {formatDate(doc.criado_em)}
                                                            {doc.tamanho_bytes && ` • ${(doc.tamanho_bytes / 1024 / 1024).toFixed(2)} MB`}
                                                        </p>
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleFileDownload(doc)}
                                                    disabled={!doc.caminho_arquivo}
                                                >
                                                    <Download className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Comments Tab */}
                    <TabsContent value="comments" className="space-y-6">
                        {/* Filters and Search */}
                        <Card className="border-border rounded-lg shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg font-semibold">Filtros e Busca</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <div className="flex-1">
                                        <Input
                                            placeholder="Buscar comentários..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full"
                                        />
                                    </div>
                                    <Select value={commentFilter} onValueChange={(value: any) => setCommentFilter(value)}>
                                        <SelectTrigger className="w-full sm:w-48">
                                            <SelectValue placeholder="Filtrar por tipo" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Todos os tipos</SelectItem>
                                            <SelectItem value="comentario">Comentários</SelectItem>
                                            <SelectItem value="sistema">Sistema</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Comments List */}
                            <div className="lg:col-span-2">
                                <Card className="border-border rounded-lg shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5" />
                                            Comentários Internos ({comments.length})
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <ScrollArea className="h-96">
                                            <div className="space-y-4">
                                                {comments.length === 0 ? (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                                        <p>Nenhum comentário encontrado</p>
                                                        <p className="text-sm">Tente ajustar os filtros de busca</p>
                                                    </div>
                                                ) : (
                                                    comments.map(comment => (
                                                        <div key={comment.id} className="flex gap-3 animate-in fade-in-50 duration-300">
                                                            <Avatar className="w-8 h-8 flex-shrink-0">
                                                                <AvatarFallback className="bg-primary text-white text-xs font-medium">
                                                                    {comment.usuario_nome.substring(0, 2).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1">
                                                                <div className="bg-background rounded-md p-3 border border-border hover:bg-muted transition-colors">
                                                                    <div className="flex items-center gap-2 mb-1">
                                                                        <p className="text-xs font-medium">{comment.usuario_nome}</p>
                                                                        {comment.etapa_nome && (
                                                                            <Badge variant="outline" className="text-xs">
                                                                                {comment.etapa_nome}
                                                                            </Badge>
                                                                        )}
                                                                        <Badge
                                                                            variant={comment.tipo === 'sistema' ? 'secondary' : 'default'}
                                                                            className="text-xs"
                                                                        >
                                                                            {comment.tipo}
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-sm text-muted-foreground">{comment.comentario}</p>
                                                                </div>
                                                                <p className="text-xs text-muted-foreground mt-1">
                                                                    {formatDateTime(comment.criado_em)}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))
                                                )}
                                            </div>
                                        </ScrollArea>

                                        {/* Pagination */}
                                        {comments.length > 0 && (
                                            <div className="flex items-center justify-between mt-4 pt-4 border-t">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCommentsPage(prev => Math.max(1, prev - 1))}
                                                    disabled={commentsPage === 1}
                                                >
                                                    Anterior
                                                </Button>
                                                <span className="text-sm text-muted-foreground">
                                                    Página {commentsPage}
                                                </span>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setCommentsPage(prev => prev + 1)}
                                                    disabled={comments.length < commentsPerPage}
                                                >
                                                    Próxima
                                                </Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Add Comment */}
                            <div>
                                <Card className="border-border rounded-lg shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-lg font-semibold">Adicionar Comentário</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Textarea
                                            placeholder="Compartilhe informações importantes sobre esta OS..."
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            rows={4}
                                            className="border-border rounded-md"
                                        />
                                        <Button
                                            onClick={handleAddComment}
                                            disabled={!newComment.trim()}
                                            className="w-full rounded-md"
                                        >
                                            <Send className="w-4 h-4 mr-2" />
                                            Adicionar Comentário
                                        </Button>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export { OSDetailsRedesignPage };