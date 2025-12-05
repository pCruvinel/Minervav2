/**
 * WorkloadKanban - Aba 2: Controladoria
 * 
 * Kanban de Carga de Trabalho por Coordenador:
 * - Colunas representam coordenadores
 * - Cards são as OSs sob responsabilidade de cada um
 * - Destaque visual para OSs atrasadas
 */
'use client';

import { useCoordinatorsWorkload, WorkloadOS, CoordinatorWorkload } from '@/lib/hooks/use-coordinators-workload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Link } from '@tanstack/react-router';
import {
    AlertTriangle,
    Clock,
    User,
    Building2,
    ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function WorkloadKanban() {
    const { workloads, loading, error } = useCoordinatorsWorkload();

    if (loading) {
        return <WorkloadKanbanSkeleton />;
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Erro ao carregar carga de trabalho: {error.message}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (workloads.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <User className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum coordenador encontrado</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Carga de Trabalho por Coordenador</h3>
                <Badge variant="outline" className="text-muted-foreground">
                    {workloads.reduce((sum, w) => sum + w.total, 0)} OS ativas no total
                </Badge>
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {workloads.map(workload => (
                    <WorkloadColumn key={workload.coordenador_id} workload={workload} />
                ))}
            </div>
        </div>
    );
}

// ============================================================
// COLUNA DO KANBAN
// ============================================================

interface WorkloadColumnProps {
    workload: CoordinatorWorkload;
}

function WorkloadColumn({ workload }: WorkloadColumnProps) {
    const getStatusColor = () => {
        if (workload.atrasadas > 0) return 'border-red-200 bg-red-50/50';
        if (workload.total > 10) return 'border-amber-200 bg-amber-50/50';
        return 'border-border bg-card';
    };

    return (
        <Card className={cn('flex flex-col max-h-[600px]', getStatusColor())}>
            {/* Header da Coluna */}
            <CardHeader className="pb-3 border-b">
                <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={workload.avatar_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                            {workload.coordenador_nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                            {workload.coordenador_nome}
                        </CardTitle>
                        <p className="text-xs text-muted-foreground">
                            {workload.setor_nome}
                        </p>
                    </div>
                </div>

                {/* Contadores */}
                <div className="flex gap-3 mt-3">
                    <Badge variant="secondary">
                        {workload.total} ativas
                    </Badge>
                    {workload.atrasadas > 0 && (
                        <Badge variant="destructive">
                            {workload.atrasadas} atrasadas
                        </Badge>
                    )}
                </div>
            </CardHeader>

            {/* Cards de OS */}
            <ScrollArea className="flex-1">
                <div className="p-3 space-y-2">
                    {workload.os_ativas.length === 0 ? (
                        <p className="text-center text-sm text-muted-foreground py-4">
                            Nenhuma OS ativa
                        </p>
                    ) : (
                        workload.os_ativas.map(os => (
                            <OSCard key={os.id} os={os} />
                        ))
                    )}
                </div>
            </ScrollArea>
        </Card>
    );
}

// ============================================================
// CARD DE OS
// ============================================================

interface OSCardProps {
    os: WorkloadOS;
}

function OSCard({ os }: OSCardProps) {
    return (
        <Link
            to="/os/$osId"
            params={{ osId: os.id }}
            className="block"
        >
            <Card className={cn(
                'p-3 hover:shadow-md transition-shadow cursor-pointer',
                os.prazoVencido && 'border-red-400 bg-red-50'
            )}>
                {/* Header do Card */}
                <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-medium text-primary">
                                {os.codigo_os}
                            </span>
                            {os.prazoVencido && (
                                <AlertTriangle className="h-3 w-3 text-red-500" />
                            )}
                        </div>
                        <p className="text-sm font-medium truncate mt-1">
                            {os.cliente_nome}
                        </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </div>

                {/* Tipo e Etapa */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                    <Building2 className="h-3 w-3" />
                    <span className="truncate">{os.tipo_os_nome}</span>
                </div>

                {os.etapa_atual && (
                    <Badge variant="outline" className="text-xs mb-2">
                        {os.etapa_atual.nome}
                    </Badge>
                )}

                {/* Barra de Progresso do Prazo */}
                <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Progresso
                        </span>
                        <span className={cn(
                            'font-medium',
                            os.prazoVencido ? 'text-red-600' : 'text-muted-foreground'
                        )}>
                            {os.progresso}%
                        </span>
                    </div>
                    <Progress
                        value={os.progresso}
                        className={cn(
                            'h-1.5',
                            os.prazoVencido && '[&>div]:bg-red-500'
                        )}
                    />
                </div>

                {/* Prazo */}
                {os.data_prazo && (
                    <p className={cn(
                        'text-xs mt-2',
                        os.prazoVencido ? 'text-red-600 font-medium' : 'text-muted-foreground'
                    )}>
                        Prazo: {formatDate(os.data_prazo)}
                    </p>
                )}
            </Card>
        </Link>
    );
}

// ============================================================
// SKELETON
// ============================================================

function WorkloadKanbanSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-64" />
                <Skeleton className="h-5 w-32" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <Card key={i} className="h-[400px]">
                        <CardHeader className="pb-3 border-b">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <Skeleton className="h-5 w-16" />
                                <Skeleton className="h-5 w-20" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-3 space-y-2">
                            {[1, 2, 3].map(j => (
                                <Skeleton key={j} className="h-24 w-full" />
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// HELPERS
// ============================================================

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    });
}
