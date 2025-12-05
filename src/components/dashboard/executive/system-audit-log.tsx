/**
 * SystemAuditLog - Aba 3: Auditoria
 * 
 * DataTable robusta de logs de auditoria:
 * - Combina audit_log + os_atividades
 * - Filtros avançados
 * - Paginação para performance
 */
'use client';

import { useState } from 'react';
import { useAuditLogs, AuditActionType, AuditFilters } from '@/lib/hooks/use-audit-logs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
    AlertTriangle,
    ChevronLeft,
    ChevronRight,
    Filter,
    RefreshCw,
    Calendar as CalendarIcon,
    FileText,
    Plus,
    Pencil,
    Trash2,
    ArrowRight,
    Upload,
    Users
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function SystemAuditLog() {
    const {
        logs,
        loading,
        error,
        pagination,
        setPage,
        filters,
        setFilters,
        refetch
    } = useAuditLogs();

    const [showFilters, setShowFilters] = useState(false);

    if (error) {
        return (
            <Card className="border-destructive">
                <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        <span>Erro ao carregar logs: {error.message}</span>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            Log de Auditoria
                        </CardTitle>
                        <CardDescription>
                            Histórico de ações no sistema
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="h-4 w-4 mr-1" />
                            Filtros
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={refetch}
                            disabled={loading}
                        >
                            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
                        </Button>
                    </div>
                </div>

                {/* Filtros */}
                {showFilters && (
                    <FilterBar filters={filters} setFilters={setFilters} />
                )}
            </CardHeader>

            <CardContent>
                {loading ? (
                    <AuditLogSkeleton />
                ) : logs.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                        <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                        <p>Nenhum registro de auditoria encontrado</p>
                    </div>
                ) : (
                    <>
                        {/* Tabela */}
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[160px]">Data/Hora</TableHead>
                                        <TableHead className="w-[200px]">Usuário</TableHead>
                                        <TableHead className="w-[120px]">Ação</TableHead>
                                        <TableHead>Entidade</TableHead>
                                        <TableHead className="w-[80px]">Fonte</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.map(log => (
                                        <TableRow key={log.id}>
                                            {/* Data/Hora */}
                                            <TableCell className="font-mono text-xs">
                                                {formatDateTime(log.timestamp)}
                                            </TableCell>

                                            {/* Usuário */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={log.user_avatar} />
                                                        <AvatarFallback className="text-[10px]">
                                                            {log.user_nome.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span className="text-sm truncate max-w-[140px]">
                                                        {log.user_nome}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Ação */}
                                            <TableCell>
                                                <ActionBadge action={log.action} label={log.action_label} />
                                            </TableCell>

                                            {/* Entidade */}
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {log.entity_type}
                                                    </Badge>
                                                    <span className="font-mono text-xs text-primary">
                                                        {log.entity_label}
                                                    </span>
                                                </div>
                                            </TableCell>

                                            {/* Fonte */}
                                            <TableCell>
                                                <Badge
                                                    variant="secondary"
                                                    className="text-[10px] font-normal"
                                                >
                                                    {log.source === 'audit_log' ? 'Audit' : 'OS'}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Paginação */}
                        <div className="flex items-center justify-between mt-4">
                            <p className="text-sm text-muted-foreground">
                                Página {pagination.page} de {pagination.totalPages} ({pagination.totalCount} registros)
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setPage(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.totalPages}
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}

// ============================================================
// BARRA DE FILTROS
// ============================================================

interface FilterBarProps {
    filters: AuditFilters;
    setFilters: (filters: AuditFilters) => void;
}

function FilterBar({ filters, setFilters }: FilterBarProps) {
    const [startDate, setStartDate] = useState<Date | undefined>();
    const [endDate, setEndDate] = useState<Date | undefined>();

    const handleActionChange = (value: string) => {
        setFilters({
            ...filters,
            action: value === 'all' ? undefined : value as AuditActionType
        });
    };

    const handleDateChange = (type: 'start' | 'end', date: Date | undefined) => {
        if (type === 'start') {
            setStartDate(date);
            setFilters({
                ...filters,
                start_date: date?.toISOString()
            });
        } else {
            setEndDate(date);
            setFilters({
                ...filters,
                end_date: date?.toISOString()
            });
        }
    };

    const clearFilters = () => {
        setStartDate(undefined);
        setEndDate(undefined);
        setFilters({});
    };

    return (
        <div className="flex flex-wrap gap-3 mt-4 p-4 bg-muted/50 rounded-lg">
            {/* Filtro por Ação */}
            <Select
                value={filters.action || 'all'}
                onValueChange={handleActionChange}
            >
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de Ação" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="all">Todas as Ações</SelectItem>
                    <SelectItem value="create">Criação</SelectItem>
                    <SelectItem value="update">Atualização</SelectItem>
                    <SelectItem value="delete">Exclusão</SelectItem>
                    <SelectItem value="status_change">Mudança de Status</SelectItem>
                    <SelectItem value="etapa_avanco">Avanço de Etapa</SelectItem>
                </SelectContent>
            </Select>

            {/* Data Início */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? format(startDate, 'dd/MM/yyyy') : 'Data Início'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => handleDateChange('start', date)}
                        locale={ptBR}
                    />
                </PopoverContent>
            </Popover>

            {/* Data Fim */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button variant="outline" className="w-[160px] justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, 'dd/MM/yyyy') : 'Data Fim'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => handleDateChange('end', date)}
                        locale={ptBR}
                    />
                </PopoverContent>
            </Popover>

            {/* Limpar Filtros */}
            <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar
            </Button>
        </div>
    );
}

// ============================================================
// BADGE DE AÇÃO
// ============================================================

interface ActionBadgeProps {
    action: AuditActionType;
    label: string;
}

function ActionBadge({ action, label }: ActionBadgeProps) {
    const getIcon = () => {
        switch (action) {
            case 'create': return <Plus className="h-3 w-3" />;
            case 'update': return <Pencil className="h-3 w-3" />;
            case 'delete': return <Trash2 className="h-3 w-3" />;
            case 'status_change': return <ArrowRight className="h-3 w-3" />;
            case 'etapa_avanco': return <ArrowRight className="h-3 w-3" />;
            case 'upload': return <Upload className="h-3 w-3" />;
            case 'delegacao': return <Users className="h-3 w-3" />;
            default: return <FileText className="h-3 w-3" />;
        }
    };

    const getVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
        switch (action) {
            case 'create': return 'default';
            case 'delete': return 'destructive';
            case 'status_change':
            case 'etapa_avanco': return 'secondary';
            default: return 'outline';
        }
    };

    return (
        <Badge variant={getVariant()} className="gap-1 text-xs">
            {getIcon()}
            <span className="max-w-[80px] truncate">{label}</span>
        </Badge>
    );
}

// ============================================================
// SKELETON
// ============================================================

function AuditLogSkeleton() {
    return (
        <div className="space-y-2">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center gap-4 p-3 border rounded-lg">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-4 w-20" />
                </div>
            ))}
        </div>
    );
}

// ============================================================
// HELPERS
// ============================================================

function formatDateTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}
