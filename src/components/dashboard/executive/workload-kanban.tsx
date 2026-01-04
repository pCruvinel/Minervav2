/**
 * WorkloadKanban - Aba 2: Controladoria
 * 
 * Kanban de Carga de Trabalho por Coordenador:
 * - Colunas representam coordenadores
 * - Cards são as OSs sob responsabilidade de cada um
 * - Destaque visual para OSs atrasadas
 * - Filtro de coordenadores selecionáveis
 */
'use client';

import { useState, useMemo } from 'react';
import { useCoordinatorsWorkload, WorkloadOS, CoordinatorWorkload } from '@/lib/hooks/use-coordinators-workload';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Link } from '@tanstack/react-router';
import {
    AlertTriangle,
    Clock,
    User,
    Building2,
    ArrowRight,
    Filter,
    Check,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function WorkloadKanban() {
    const { workloads, loading, error } = useCoordinatorsWorkload();

    // Estado: IDs dos coordenadores selecionados (todos por padrão)
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Inicializar selectedIds com todos os coordenadores quando carregar
    useMemo(() => {
        if (workloads.length > 0 && selectedIds.length === 0) {
            setSelectedIds(workloads.map(w => w.coordenador_id));
        }
    }, [workloads]);

    // Filtrar workloads baseado nos IDs selecionados
    const filteredWorkloads = useMemo(() => {
        return workloads.filter(w => selectedIds.includes(w.coordenador_id));
    }, [workloads, selectedIds]);

    // Toggle de seleção
    const toggleCoordinator = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(existingId => existingId !== id)
                : [...prev, id]
        );
    };

    // Remover coordenador
    const removeCoordinator = (id: string) => {
        setSelectedIds(prev => prev.filter(existingId => existingId !== id));
    };

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
            {/* Header com Filtro */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h3 className="text-lg font-semibold">Carga de Trabalho por Coordenador</h3>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-muted-foreground">
                        {workloads.reduce((sum, w) => sum + w.total, 0)} OS ativas no total
                    </Badge>
                    <CoordinatorFilter
                        coordinators={workloads}
                        selectedIds={selectedIds}
                        onToggle={toggleCoordinator}
                    />
                </div>
            </div>

            {/* Badges Removíveis */}
            {selectedIds.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedIds.map(id => {
                        const coord = workloads.find(w => w.coordenador_id === id);
                        if (!coord) return null;
                        return (
                            <Badge
                                key={id}
                                variant="secondary"
                                className="pl-2 pr-1 py-1 flex items-center gap-2 transition-all hover:bg-secondary/80"
                            >
                                <Avatar className="h-4 w-4">
                                    <AvatarImage src={coord.avatar_url} />
                                    <AvatarFallback className="text-[10px]">
                                        {coord.coordenador_nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="text-xs">{coord.coordenador_nome}</span>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-4 w-4 p-0 hover:bg-destructive/20"
                                    onClick={() => removeCoordinator(id)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        );
                    })}
                </div>
            )}

            {/* Feedback de Estado Vazio */}
            {selectedIds.length === 0 ? (
                <Card>
                    <CardContent className="pt-12 pb-12 text-center">
                        <Filter className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                        <h4 className="text-lg font-medium mb-2">Nenhum coordenador selecionado</h4>
                        <p className="text-muted-foreground text-sm">
                            Selecione pelo menos um coordenador no filtro acima para visualizar a carga de trabalho.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                // Kanban Board Dinâmico
                <div className="flex gap-6 overflow-x-auto pb-4">
                    {filteredWorkloads.map((workload, index) => (
                        <div
                            key={workload.coordenador_id}
                            className="flex-shrink-0 w-[350px] animate-in slide-in-from-left duration-300"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <WorkloadColumn workload={workload} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ============================================================
// FILTRO DE COORDENADORES
// ============================================================

interface CoordinatorFilterProps {
    coordinators: CoordinatorWorkload[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}

function CoordinatorFilter({ coordinators, selectedIds, onToggle }: CoordinatorFilterProps) {
    const [open, setOpen] = useState(false);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-9 gap-2 font-normal"
                >
                    <Filter className="h-4 w-4" />
                    <span className="hidden sm:inline">Filtrar Coordenadores</span>
                    <span className="sm:hidden">Filtrar</span>
                    <Badge variant="secondary" className="ml-1 h-5 min-w-5 rounded-full px-1.5 text-xs">
                        {selectedIds.length}
                    </Badge>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[280px] p-0" align="end">
                <Command>
                    <CommandInput placeholder="Buscar coordenador..." />
                    <CommandList>
                        <CommandEmpty>Nenhum coordenador encontrado.</CommandEmpty>
                        <CommandGroup>
                            {coordinators.map(coord => {
                                const isSelected = selectedIds.includes(coord.coordenador_id);
                                return (
                                    <CommandItem
                                        key={coord.coordenador_id}
                                        onSelect={() => onToggle(coord.coordenador_id)}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex items-center gap-3 flex-1">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={coord.avatar_url} />
                                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                                    {coord.coordenador_nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium truncate">
                                                    {coord.coordenador_nome}
                                                </p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {coord.setor_nome}
                                                </p>
                                            </div>
                                        </div>
                                        {isSelected && (
                                            <Check className="h-4 w-4 text-primary" />
                                        )}
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
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
            className="block no-underline hover:no-underline"
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
