/**
 * WorkloadKanban - Visualização por Coordenador
 * 
 * Kanban de Carga de Trabalho por Coordenador:
 * - Cards colapsáveis representam coordenadores
 * - Tabela interna mostra as OSs sob responsabilidade de cada um
 * - Design consistente com SetorWorkloadTable (Monday.com style)
 * 
 * @see docs/technical/DESIGN_SYSTEM.md
 */
'use client';

import { useState, useMemo } from 'react';
import { useCoordinatorsWorkload, WorkloadOS, CoordinatorWorkload } from '@/lib/hooks/use-coordinators-workload';
import { STATUS_SITUACAO_CONFIG, StatusSituacao } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Link } from '@tanstack/react-router';
import {
    AlertTriangle,
    User,
    Building2,
    Filter,
    Check,
    X,
    ChevronDown,
    ChevronRight,
    FileText,
    Crown,
    RefreshCw,
    Paperclip
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function WorkloadKanban() {
    const { workloads, loading, error, refetch } = useCoordinatorsWorkload();

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

    // Totais calculados antes de conditional returns
    const totais = useMemo(() => ({
        os: workloads.reduce((sum, w) => sum + w.total, 0),
        coordenadores: workloads.length
    }), [workloads]);

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
                    <Button variant="outline" onClick={refetch} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tentar novamente
                    </Button>
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
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-semibold">Carga de Trabalho por Coordenador</h3>
                    <p className="text-sm text-muted-foreground">
                        Visualização de OSs agrupadas por coordenador responsável
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-muted-foreground">
                        {totais.os} OS ativas
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                        {totais.coordenadores} coordenadores
                    </Badge>
                    <CoordinatorFilter
                        coordinators={workloads}
                        selectedIds={selectedIds}
                        onToggle={toggleCoordinator}
                    />
                    <Button variant="outline" size="sm" onClick={refetch}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Badges Removíveis */}
            {selectedIds.length > 0 && selectedIds.length < workloads.length && (
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
                // Cards de Coordenadores
                <div className="space-y-4">
                    {filteredWorkloads.map(workload => (
                        <CoordinatorCard key={workload.coordenador_id} workload={workload} />
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
                    <span className="hidden sm:inline">Filtrar</span>
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
// CARD DE COORDENADOR (Similar ao SetorGroup)
// ============================================================

interface CoordinatorCardProps {
    workload: CoordinatorWorkload;
}

function CoordinatorCard({ workload }: CoordinatorCardProps) {
    const [isOpen, setIsOpen] = useState(true);

    const getSetorColor = (setor: string) => {
        const s = setor.toLowerCase();
        if (s.includes('obra')) return 'border-l-primary bg-primary/5';
        if (s.includes('assess')) return 'border-l-info bg-info/5';
        if (s.includes('admin')) return 'border-l-warning bg-warning/5';
        return 'border-l-muted bg-muted/5';
    };

    return (
        <Card className={cn('border-l-4 overflow-hidden', getSetorColor(workload.setor_nome))}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                {/* Header do Coordenador */}
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isOpen ? (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={workload.avatar_url} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {workload.coordenador_nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-semibold text-sm">
                                            {workload.coordenador_nome}
                                        </h4>
                                        <Crown className="h-3.5 w-3.5 text-primary" />
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {workload.setor_nome}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="gap-1.5">
                                    <FileText className="h-3.5 w-3.5" />
                                    {workload.total} OS ativas
                                </Badge>
                                {workload.atrasadas > 0 && (
                                    <Badge variant="destructive" className="gap-1.5">
                                        <AlertTriangle className="h-3.5 w-3.5" />
                                        {workload.atrasadas} atrasadas
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>

                {/* Tabela de OSs */}
                <CollapsibleContent>
                    <CardContent className="pt-0 pb-2">
                        <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="w-[100px]">ID</TableHead>
                                        <TableHead className="w-[180px]">Cliente</TableHead>
                                        <TableHead className="w-[150px]">Tipo</TableHead>
                                        <TableHead className="w-[150px]">Etapa</TableHead>
                                        <TableHead className="w-[90px] text-center">Prazo</TableHead>
                                        <TableHead className="w-[80px] text-center">Progresso</TableHead>
                                        <TableHead className="w-[110px] text-center">Situação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {workload.os_ativas.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                                Nenhuma OS ativa para este coordenador
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        workload.os_ativas.map((os, index) => (
                                            <OSTableRow
                                                key={os.id}
                                                os={os}
                                                isLast={index === workload.os_ativas.length - 1}
                                            />
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </CollapsibleContent>
            </Collapsible>
        </Card>
    );
}

// ============================================================
// LINHA DA TABELA DE OS
// ============================================================

interface OSTableRowProps {
    os: WorkloadOS;
    isLast: boolean;
}

function OSTableRow({ os, isLast }: OSTableRowProps) {
    const formatDate = (dateStr: string | null) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short'
        });
    };

    const getSituacaoBadge = (situacao: string | null) => {
        if (!situacao || situacao === 'finalizado') return null;
        const config = STATUS_SITUACAO_CONFIG[situacao as StatusSituacao];
        if (!config) return null;
        return (
            <Badge className={cn('text-[10px] h-5 px-1.5', config.className)}>
                {config.label}
            </Badge>
        );
    };

    return (
        <TableRow
            className={cn(
                'hover:bg-primary/5 transition-colors',
                os.prazoVencido && 'bg-destructive/5',
                !isLast && 'border-b border-border/30'
            )}
        >
            {/* ID */}
            <TableCell>
                <Link
                    to="/os/$osId"
                    params={{ osId: os.id }}
                    className="font-mono text-xs font-medium text-primary hover:underline"
                >
                    {os.codigo_os}
                </Link>
            </TableCell>

            {/* Cliente */}
            <TableCell className="text-sm truncate max-w-[180px]" title={os.cliente_nome}>
                {os.cliente_nome}
            </TableCell>

            {/* Tipo */}
            <TableCell className="text-sm truncate max-w-[150px]">
                <div className="flex items-center gap-1.5">
                    <Building2 className="h-3 w-3 text-muted-foreground shrink-0" />
                    <span className="truncate">{os.tipo_os_nome}</span>
                </div>
            </TableCell>

            {/* Etapa */}
            <TableCell className="text-sm truncate max-w-[150px]">
                {os.etapa_atual ? (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        {os.etapa_atual.nome}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground">-</span>
                )}
            </TableCell>

            {/* Prazo */}
            <TableCell className="text-center">
                <span className={cn(
                    'text-xs flex items-center justify-center gap-1',
                    os.prazoVencido ? 'text-destructive font-medium' : 'text-muted-foreground'
                )}>
                    {os.prazoVencido && <AlertTriangle className="h-3 w-3" />}
                    {formatDate(os.data_prazo)}
                </span>
            </TableCell>

            {/* Progresso */}
            <TableCell className="text-center">
                <div className="flex items-center justify-center gap-1">
                    <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                            className={cn(
                                "h-full rounded-full",
                                os.prazoVencido ? "bg-destructive" : "bg-primary"
                            )}
                            style={{ width: `${os.progresso}%` }}
                        />
                    </div>
                    <span className="text-[10px] text-muted-foreground w-8">
                        {os.progresso}%
                    </span>
                </div>
            </TableCell>

            {/* Situação */}
            <TableCell className="text-center">
                {getSituacaoBadge(os.status_situacao)}
            </TableCell>
        </TableRow>
    );
}

// ============================================================
// SKELETON
// ============================================================

function WorkloadKanbanSkeleton() {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-6 w-64 mb-2" />
                    <Skeleton className="h-4 w-48" />
                </div>
                <div className="flex gap-2">
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-6 w-32" />
                </div>
            </div>

            {[1, 2, 3].map(i => (
                <Card key={i} className="border-l-4 border-l-muted">
                    <CardHeader className="py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div>
                                    <Skeleton className="h-4 w-32 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-24" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-48 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
