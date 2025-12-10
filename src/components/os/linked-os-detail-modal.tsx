/**
 * LinkedOSDetailModal - Modal Read-Only de Detalhes da OS Filha
 * 
 * Modal para visualizar detalhes de uma OS vinculada sem sair da página atual.
 * Exibe informações como cliente, tipo, status, etapas e prazo.
 * 
 * @example
 * ```tsx
 * <LinkedOSDetailModal
 *   osId="123-abc"
 *   open={true}
 *   onClose={() => setModal(false)}
 * />
 * ```
 */

import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from '@tanstack/react-router';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import {
    User,
    Calendar,
    FileText,
    Clock,
    CheckCircle2,
    ExternalLink,
    Building2,
    Phone,
    Mail
} from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface LinkedOSDetailModalProps {
    /** ID da OS a exibir */
    osId: string | null;
    /** Se o modal está aberto */
    open: boolean;
    /** Callback ao fechar */
    onClose: () => void;
}

interface OSDetail {
    id: string;
    codigo_os: string;
    status_geral: string;
    descricao: string;
    data_prazo?: string;
    data_entrada?: string;
    tipos_os?: {
        nome: string;
        codigo: string;
    };
    clientes?: {
        nome_razao_social: string;
        email?: string;
        telefone?: string;
    };
    responsavel?: {
        nome_completo: string;
        email?: string;
        avatar_url?: string;
    };
    etapas?: {
        id: string;
        nome: string;
        ordem: number;
        status: string;
    }[];
}

// ============================================================
// HELPERS
// ============================================================

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    em_triagem: { label: 'Em Triagem', className: 'bg-warning/10 text-warning border-warning/20' },
    em_andamento: { label: 'Em Andamento', className: 'bg-info/10 text-info border-info/20' },
    aguardando_aprovacao: { label: 'Aguardando', className: 'bg-warning/10 text-warning border-warning/20' },
    concluido: { label: 'Concluída', className: 'bg-success/10 text-success border-success/20' },
    concluida: { label: 'Concluída', className: 'bg-success/10 text-success border-success/20' },
    cancelado: { label: 'Cancelada', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    cancelada: { label: 'Cancelada', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function formatDate(dateStr: string | undefined) {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function LinkedOSDetailModal({ osId, open, onClose }: LinkedOSDetailModalProps) {
    const [osData, setOSData] = useState<OSDetail | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    // Fetch OS data when modal opens
    useEffect(() => {
        if (!osId || !open) {
            setOSData(null);
            return;
        }

        const fetchOS = async () => {
            setLoading(true);
            setError(null);

            try {
                const { data, error: fetchError } = await supabase
                    .from('ordens_servico')
                    .select(`
            id,
            codigo_os,
            status_geral,
            descricao,
            data_prazo,
            data_entrada,
            tipos_os:tipo_os_id (
              nome,
              codigo
            ),
            clientes:cliente_id (
              nome_razao_social,
              email,
              telefone
            ),
            responsavel:responsavel_id (
              nome_completo,
              email,
              avatar_url
            ),
            os_etapas (
              id,
              nome,
              ordem,
              status
            )
          `)
                    .eq('id', osId)
                    .single();

                if (fetchError) throw fetchError;

                // Normalizar dados
                const normalizedData: OSDetail = {
                    ...(data as any),
                    etapas: (data as any).os_etapas?.sort(
                        (a: any, b: any) => (a.ordem || 0) - (b.ordem || 0)
                    ) || []
                };

                setOSData(normalizedData);
            } catch (err) {
                logger.error('Erro ao buscar detalhes da OS:', err);
                setError(err as Error);
            } finally {
                setLoading(false);
            }
        };

        fetchOS();
    }, [osId, open]);

    // Calculate progress
    const getProgress = () => {
        if (!osData?.etapas?.length) return 0;
        const completed = osData.etapas.filter(e => e.status === 'concluida').length;
        return Math.round((completed / osData.etapas.length) * 100);
    };

    const statusConfig = osData ? STATUS_CONFIG[osData.status_geral] || { label: osData.status_geral, className: '' } : null;

    return (
        <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
            <DialogContent className="max-w-lg">
                {loading ? (
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Separator />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </div>
                ) : error ? (
                    <div className="text-center py-8">
                        <p className="text-destructive">Erro ao carregar detalhes da OS</p>
                        <Button variant="outline" onClick={onClose} className="mt-4">
                            Fechar
                        </Button>
                    </div>
                ) : osData ? (
                    <>
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-3">
                                <span className="font-mono text-primary">{osData.codigo_os}</span>
                                {statusConfig && (
                                    <Badge variant="outline" className={statusConfig.className}>
                                        {statusConfig.label}
                                    </Badge>
                                )}
                            </DialogTitle>
                            <DialogDescription>
                                {osData.tipos_os?.nome || 'Tipo não definido'}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            {/* Progresso */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Progresso</span>
                                    <span className="font-medium">{getProgress()}%</span>
                                </div>
                                <Progress value={getProgress()} className="h-2" />
                            </div>

                            <Separator />

                            {/* Cliente */}
                            {osData.clientes && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Building2 className="h-4 w-4 text-muted-foreground" />
                                        Cliente
                                    </h4>
                                    <div className="pl-6 space-y-1">
                                        <p className="text-sm">{osData.clientes.nome_razao_social}</p>
                                        {osData.clientes.email && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Mail className="h-3 w-3" />
                                                {osData.clientes.email}
                                            </p>
                                        )}
                                        {osData.clientes.telefone && (
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Phone className="h-3 w-3" />
                                                {osData.clientes.telefone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Responsável */}
                            {osData.responsavel && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <User className="h-4 w-4 text-muted-foreground" />
                                        Responsável Atual
                                    </h4>
                                    <div className="pl-6 flex items-center gap-2">
                                        <Avatar className="h-7 w-7">
                                            <AvatarImage
                                                src={osData.responsavel.avatar_url || undefined}
                                                alt={osData.responsavel.nome_completo}
                                            />
                                            <AvatarFallback className="bg-primary text-white text-xs">
                                                {osData.responsavel.nome_completo.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <p className="text-sm">{osData.responsavel.nome_completo}</p>
                                    </div>
                                </div>
                            )}

                            {/* Datas */}
                            <div className="flex gap-4">
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        Entrada
                                    </h4>
                                    <p className="text-sm pl-6">{formatDate(osData.data_entrada)}</p>
                                </div>
                                <div className="flex-1 space-y-1">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-muted-foreground" />
                                        Prazo
                                    </h4>
                                    <p className="text-sm pl-6">{formatDate(osData.data_prazo)}</p>
                                </div>
                            </div>

                            {/* Etapas */}
                            {osData.etapas && osData.etapas.length > 0 && (
                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Etapas
                                    </h4>
                                    <div className="pl-6 space-y-1">
                                        {osData.etapas.map((etapa) => (
                                            <div
                                                key={etapa.id}
                                                className="flex items-center justify-between text-sm py-1"
                                            >
                                                <span className={etapa.status === 'concluida' ? 'text-muted-foreground line-through' : ''}>
                                                    {etapa.ordem}. {etapa.nome}
                                                </span>
                                                {etapa.status === 'concluida' && (
                                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                                )}
                                                {etapa.status === 'em_andamento' && (
                                                    <Badge variant="outline" className="text-xs bg-info/10 text-info">
                                                        Em andamento
                                                    </Badge>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <Separator />

                            {/* Ações */}
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" onClick={onClose}>
                                    Fechar
                                </Button>
                                <Button asChild>
                                    <Link to="/os/$osId" params={{ osId: osData.id }}>
                                        <ExternalLink className="h-4 w-4 mr-2" />
                                        Abrir Completo
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    </>
                ) : null}
            </DialogContent>
        </Dialog>
    );
}
