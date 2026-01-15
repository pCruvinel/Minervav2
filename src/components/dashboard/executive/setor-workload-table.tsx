/**
 * SetorWorkloadTable - Visualização Hierárquica de Carga de Trabalho
 * 
 * Inspirado no Monday.com com estrutura:
 * - Nível 1: Setor (grupo colapsável)
 * - Nível 2: Colaborador (linha expansível, coordenador primeiro)
 * - Nível 3: OSs (sub-tabela com colunas alinhadas)
 * 
 * @see docs/technical/DESIGN_SYSTEM.md
 * @see docs/technical/STATUS_SYSTEM.md
 */
'use client';

import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import {
    useSetorWorkload,
    type SetorWorkload,
    type ColaboradorWorkload,
    type OSWorkloadItem
} from '@/lib/hooks/use-setor-workload';
import { STATUS_SITUACAO_CONFIG, type StatusSituacao } from '@/lib/types';

// UI Components
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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

// Icons
import {
    ChevronDown,
    ChevronRight,
    Users,
    FileText,
    AlertTriangle,
    Paperclip,
    Building2,
    RefreshCw,
    Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function SetorWorkloadTable() {
    const { setores, loading, error, refetch } = useSetorWorkload();

    // Calcular totais gerais - DEVE vir antes de qualquer return condicional
    const totais = useMemo(() => ({
        os: setores.reduce((sum, s) => sum + s.total_os, 0),
        colaboradores: setores.reduce((sum, s) => sum + s.total_colaboradores, 0)
    }), [setores]);

    if (loading) {
        return <SetorWorkloadSkeleton />;
    }

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Erro ao carregar dados: {error.message}</span>
                    </div>
                    <Button variant="outline" onClick={refetch} className="mt-4">
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Tentar novamente
                    </Button>
                </CardContent>
            </Card>
        );
    }

    if (setores.length === 0) {
        return (
            <Card>
                <CardContent className="pt-6 text-center text-muted-foreground">
                    <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhum setor encontrado</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                    <h3 className="text-lg font-semibold">Carga de Trabalho por Setor</h3>
                    <p className="text-sm text-muted-foreground">
                        Visualização hierárquica: Setor → Colaborador → OS
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-muted-foreground">
                        {totais.os} OS ativas
                    </Badge>
                    <Badge variant="outline" className="text-muted-foreground">
                        {totais.colaboradores} colaboradores
                    </Badge>
                    <Button variant="outline" size="sm" onClick={refetch}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Atualizar
                    </Button>
                </div>
            </div>

            {/* Setores */}
            <div className="space-y-4">
                {setores.map(setor => (
                    <SetorGroup key={setor.id} setor={setor} />
                ))}
            </div>
        </div>
    );
}

// ============================================================
// SETOR GROUP (Nível 1)
// ============================================================

interface SetorGroupProps {
    setor: SetorWorkload;
}

function SetorGroup({ setor }: SetorGroupProps) {
    const [isOpen, setIsOpen] = useState(true);

    const getSetorColor = (slug: string) => {
        switch (slug) {
            case 'obras':
                return 'border-l-primary bg-primary/5';
            case 'assessoria':
                return 'border-l-info bg-info/5';
            case 'administrativo':
                return 'border-l-warning bg-warning/5';
            default:
                return 'border-l-muted bg-muted/5';
        }
    };

    return (
        <Card className={cn('border-l-4 overflow-hidden', getSetorColor(setor.slug))}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                {/* Header do Setor */}
                <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors py-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {isOpen ? (
                                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                )}
                                <Building2 className="h-5 w-5 text-primary" />
                                <h4 className="font-semibold text-base uppercase tracking-wide">
                                    {setor.nome}
                                </h4>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant="secondary" className="gap-1.5">
                                    <Users className="h-3.5 w-3.5" />
                                    {setor.total_colaboradores} colaboradores
                                </Badge>
                                <Badge variant="outline" className="gap-1.5">
                                    <FileText className="h-3.5 w-3.5" />
                                    {setor.total_os} OS ativas
                                </Badge>
                            </div>
                        </div>
                    </CardHeader>
                </CollapsibleTrigger>

                {/* Conteúdo (Colaboradores) */}
                <CollapsibleContent>
                    <CardContent className="pt-0 pb-2">
                        {/* Cabeçalho da Tabela de OS (visível sempre) */}
                        <div className="rounded-lg border border-border overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-muted/30 hover:bg-muted/30">
                                        <TableHead className="w-[40px]"></TableHead>
                                        <TableHead className="w-[200px]">Colaborador</TableHead>
                                        <TableHead className="w-[100px] text-center">ID</TableHead>
                                        <TableHead className="w-[180px]">Cliente</TableHead>
                                        <TableHead className="w-[90px] text-center">Data</TableHead>
                                        <TableHead className="w-[150px]">Etapa</TableHead>
                                        <TableHead className="w-[70px] text-center">
                                            <Paperclip className="h-4 w-4 mx-auto" />
                                        </TableHead>
                                        <TableHead className="w-[90px] text-center">Prazo</TableHead>
                                        <TableHead className="w-[100px] text-center">Status</TableHead>
                                        <TableHead className="w-[110px] text-center">Situação</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {setor.colaboradores.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                                                Nenhum colaborador ativo neste setor
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        setor.colaboradores.map(colaborador => (
                                            <ColaboradorRow
                                                key={colaborador.id}
                                                colaborador={colaborador}
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
// COLABORADOR ROW (Nível 2)
// ============================================================

interface ColaboradorRowProps {
    colaborador: ColaboradorWorkload;
}

function ColaboradorRow({ colaborador }: ColaboradorRowProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const getInitials = (nome: string) => {
        if (!nome) return '??';
        const parts = nome.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    return (
        <>
            {/* Linha do Colaborador */}
            <TableRow
                className={cn(
                    'cursor-pointer transition-colors',
                    isExpanded ? 'bg-muted/20' : 'hover:bg-muted/10',
                    colaborador.is_coordenador && 'bg-primary/5'
                )}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <TableCell className="py-2">
                    {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                </TableCell>
                <TableCell colSpan={9}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={colaborador.avatar_url || undefined} />
                                <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                    {getInitials(colaborador.nome_completo)}
                                </AvatarFallback>
                            </Avatar>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-sm">
                                        {colaborador.nome_completo}
                                    </span>
                                    {colaborador.is_coordenador && (
                                        <Crown className="h-3.5 w-3.5 text-primary" />
                                    )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {colaborador.cargo_nome}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                                {colaborador.total_os} OS
                            </Badge>
                            {colaborador.os_atrasadas > 0 && (
                                <Badge variant="destructive" className="text-xs">
                                    {colaborador.os_atrasadas} atrasadas
                                </Badge>
                            )}
                        </div>
                    </div>
                </TableCell>
            </TableRow>

            {/* OSs do Colaborador (Nível 3) */}
            {isExpanded && colaborador.os_ativas.length > 0 && (
                colaborador.os_ativas.map((os, index) => (
                    <OSTableRow
                        key={os.id}
                        os={os}
                        isLast={index === colaborador.os_ativas.length - 1}
                    />
                ))
            )}

            {/* Mensagem de vazio */}
            {isExpanded && colaborador.os_ativas.length === 0 && (
                <TableRow className="bg-muted/10">
                    <TableCell></TableCell>
                    <TableCell colSpan={9} className="py-4 text-center text-sm text-muted-foreground">
                        Nenhuma OS ativa para este colaborador
                    </TableCell>
                </TableRow>
            )}
        </>
    );
}

// ============================================================
// OS TABLE ROW (Nível 3)
// ============================================================

interface OSTableRowProps {
    os: OSWorkloadItem;
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

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
            'em_triagem': { label: 'Triagem', className: 'bg-muted text-muted-foreground' },
            'em_andamento': { label: 'Em And.', className: 'bg-primary/10 text-primary' },
            'aguardando_info': { label: 'Aguard. Info', className: 'bg-warning/20 text-warning' },
            'aguardando_aprovacao': { label: 'Aguard. Aprov.', className: 'bg-secondary text-secondary-foreground' },
            'concluido': { label: 'Concluído', className: 'bg-success/10 text-success' },
            'cancelado': { label: 'Cancelado', className: 'bg-destructive/10 text-destructive' },
        };
        const config = statusConfig[status] || statusConfig['em_andamento'];
        return (
            <Badge className={cn('text-[10px] h-5 px-1.5', config.className)}>
                {config.label}
            </Badge>
        );
    };

    const getSituacaoBadge = (situacao: StatusSituacao | null) => {
        if (!situacao || situacao === 'finalizado') return null;
        const config = STATUS_SITUACAO_CONFIG[situacao];
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
                'bg-muted/5 hover:bg-primary/5 transition-colors',
                !isLast && 'border-b border-border/30'
            )}
        >
            {/* Indent visual */}
            <TableCell className="py-2 pl-4">
                <div className="w-4 h-4 border-l-2 border-b-2 border-muted-foreground/30 rounded-bl" />
            </TableCell>

            {/* Colaborador (vazio, já mostrado acima) */}
            <TableCell></TableCell>

            {/* ID */}
            <TableCell className="text-center">
                <Link
                    to="/os/$osId"
                    params={{ osId: os.id }}
                    className="font-mono text-xs font-medium text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {os.codigo_os}
                </Link>
            </TableCell>

            {/* Cliente */}
            <TableCell className="text-sm truncate max-w-[180px]" title={os.cliente_nome}>
                {os.cliente_nome}
            </TableCell>

            {/* Data */}
            <TableCell className="text-center text-xs text-muted-foreground">
                {formatDate(os.data_entrada)}
            </TableCell>

            {/* Etapa */}
            <TableCell className="text-sm truncate max-w-[150px]" title={os.etapa_atual_nome}>
                <span className="text-muted-foreground mr-1">{os.etapa_atual_ordem}.</span>
                {os.etapa_atual_nome}
            </TableCell>

            {/* Anexos */}
            <TableCell className="text-center">
                {os.anexos_count > 0 ? (
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5">
                        {os.anexos_count}
                    </Badge>
                ) : (
                    <span className="text-muted-foreground text-xs">-</span>
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

            {/* Status Geral */}
            <TableCell className="text-center">
                {getStatusBadge(os.status_geral)}
            </TableCell>

            {/* Status Situação */}
            <TableCell className="text-center">
                {getSituacaoBadge(os.status_situacao)}
            </TableCell>
        </TableRow>
    );
}

// ============================================================
// SKELETON
// ============================================================

function SetorWorkloadSkeleton() {
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
                                <Skeleton className="h-5 w-5" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-6 w-28" />
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
