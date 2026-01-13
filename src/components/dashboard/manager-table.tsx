/**
 * ManagerTable - Tabela Gerencial para Coordenadores e Diretoria
 * 
 * Foco em controle e visibilidade. Inclui:
 * - Colunas: ID, Cliente, Tipo OS, Etapa Atual, Responsável, Prazo, Status
 * - 🆕 Coluna "Situação": Badge indicando onde a OS está (no setor, aguardando outro, etc.)
 * - Filtros: Setor, Responsável, Busca por Cliente
 * - Destaque visual para prazos vencidos
 * 
 * @version 2.0 - Adiciona indicador de responsável atual
 */

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { GroupedMultiSelect } from '@/components/dashboard/grouped-multi-select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Search,
    Filter,
    AlertTriangle,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { type OSComEtapa } from '@/lib/hooks/use-dashboard-data';
import { type SetorSlug } from '@/lib/types';

// ============================================================
// TIPOS
// ============================================================

interface ManagerTableProps {
    /** Dados de OSs a exibir */
    data: OSComEtapa[];
    /** Título da tabela */
    title?: string;
    /** Se deve mostrar o filtro de setor (apenas para escopo global) */
    showSetorFilter?: boolean;
    /** Lista de responsáveis únicos para o filtro */
    responsaveis?: { id: string; nome: string }[];

}

type SortField = 'codigo_os' | 'cliente_nome' | 'prazoEtapa' | 'status_geral' | 'created_at' | 'updated_at';
type SortDirection = 'asc' | 'desc';

// ============================================================
// CONSTANTES
// ============================================================

const SETORES: { value: SetorSlug | 'todos'; label: string }[] = [
    { value: 'todos', label: 'Todos os Setores' },
    { value: 'administrativo', label: 'Administrativo' },
    { value: 'assessoria', label: 'Assessoria' },
    { value: 'obras', label: 'Obras' },
    { value: 'diretoria', label: 'Diretoria' },
];

/** Configuração de cores para Status Geral (ciclo de vida) */
const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    em_triagem: { label: 'Em Triagem', className: 'bg-muted text-muted-foreground border-muted' },
    em_andamento: { label: 'Em Andamento', className: 'bg-primary/10 text-primary border-primary/20' },
    concluido: { label: 'Concluído', className: 'bg-success/10 text-success border-success/20' },
    cancelado: { label: 'Cancelado', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    // Legados (mantidos para compatibilidade)
    aguardando_info: { label: 'Aguardando Info', className: 'bg-warning/10 text-warning border-warning/20' },
    aguardando_aprovacao: { label: 'Aguard. Aprovação', className: 'bg-secondary text-secondary-foreground border-secondary/20' },
};

/** Configuração de cores para Status Situação (ação pendente) */
const STATUS_SITUACAO_CONFIG: Record<string, { label: string; className: string }> = {
    atrasado: { label: 'Atrasado', className: 'bg-destructive text-destructive-foreground border-destructive' },
    aguardando_aprovacao: { label: 'Aguard. Aprovação', className: 'bg-secondary text-secondary-foreground border-secondary' },
    aguardando_info: { label: 'Aguard. Info', className: 'bg-warning/20 text-warning border-warning/20' },
    alerta_prazo: { label: 'Alerta Prazo', className: 'bg-warning text-warning-foreground border-warning' },
    acao_pendente: { label: 'Ação Pendente', className: 'bg-primary/10 text-primary border-primary/20' },
    finalizado: { label: 'Finalizado', className: 'bg-muted text-muted-foreground border-muted' },
};

/** Opções de filtro para Status Geral (colunas Kanban) */
const STATUS_OPTIONS: { value: string; label: string }[] = [
    { value: 'todos', label: 'Todos os Status' },
    { value: 'em_triagem', label: 'Em Triagem' },
    { value: 'em_andamento', label: 'Em Andamento' },
    { value: 'concluido', label: 'Concluído' },
    { value: 'cancelado', label: 'Cancelado' },
];

/** Opções de filtro para Status Situação (badges de ação) */
const STATUS_SITUACAO_OPTIONS: { value: string; label: string }[] = [
    { value: 'todos', label: 'Todas as Situações' },
    { value: 'atrasado', label: 'Atrasado' },
    { value: 'alerta_prazo', label: 'Alerta Prazo' },
    { value: 'aguardando_aprovacao', label: 'Aguard. Aprovação' },
    { value: 'aguardando_info', label: 'Aguard. Info' },
    { value: 'acao_pendente', label: 'Ação Pendente' },
    { value: 'finalizado', label: 'Finalizado' },
];



// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function ManagerTable({
    data,
    title = 'Ordens de Serviço',
    showSetorFilter = true,
    responsaveis = [],
}: ManagerTableProps) {
    const navigate = useNavigate();

    // Estados de filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [setorFilter, setSetorFilter] = useState<SetorSlug | 'todos'>('todos');
    const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');

    // Filtros agrupados
    const [groupedFilters, setGroupedFilters] = useState<Record<string, string[]>>({
        status: ['em_andamento', 'em_triagem', 'aguardando_info']
    });

    // Estado de ordenação
    const [sortField, setSortField] = useState<SortField>('prazoEtapa');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    // Estado de paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    // Extrair responsáveis únicos dos dados se não fornecidos
    const responsaveisUnicos = useMemo(() => {
        if (responsaveis.length > 0) return responsaveis;

        const map = new Map<string, string>();
        data.forEach(os => {
            if (os.responsavel_id && os.responsavel_nome) {
                map.set(os.responsavel_id, os.responsavel_nome);
            }
        });
        return Array.from(map.entries()).map(([id, nome]) => ({ id, nome }));
    }, [data, responsaveis]);

    // Aplicar filtros e ordenação
    const filteredData = useMemo(() => {
        let result = [...data];

        // Filtro por busca (cliente)
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(os =>
                os.cliente_nome?.toLowerCase().includes(term) ||
                os.codigo_os?.toLowerCase().includes(term) ||
                os.tipo_os_nome?.toLowerCase().includes(term)
            );
        }

        // Filtro por setor
        if (setorFilter !== 'todos') {
            result = result.filter(os => os.setorSlug === setorFilter);
        }

        // Filtro por responsável
        if (responsavelFilter !== 'todos') {
            result = result.filter(os => os.responsavel_id === responsavelFilter);
        }

        // Filtro por status (Multi-select)
        const statusFilters = groupedFilters['status'] || [];
        if (statusFilters.length > 0) {
            result = result.filter(os => statusFilters.includes(os.status_geral));
        }

        // Filtro por situação (Multi-select)
        const situacaoFilters = groupedFilters['situacao'] || [];
        if (situacaoFilters.length > 0) {
            result = result.filter(os => {
                const situacao = (os as any).status_situacao;

                // Se tiver status_situacao do banco
                if (situacao && situacaoFilters.includes(situacao)) {
                    return true;
                }

                // Fallback: calcular localmente apenas se a situação estiver nos filtros selecionados
                if (situacaoFilters.includes('atrasado') && os.prazoVencido) return true;
                if (situacaoFilters.includes('acao_pendente') && (os.statusEtapa === 'pendente' || os.statusEtapa === 'em_andamento')) return true;
                if (situacaoFilters.includes('finalizado') && (os.status_geral === 'concluido' || os.status_geral === 'cancelado')) return true;

                // Se não casou com nenhum filtro selecionado
                return false;
            });
        }

        // Ordenação
        result.sort((a, b) => {
            let comparison = 0;

            switch (sortField) {
                case 'codigo_os':
                    comparison = (a.codigo_os || '').localeCompare(b.codigo_os || '');
                    break;
                case 'cliente_nome':
                    comparison = (a.cliente_nome || '').localeCompare(b.cliente_nome || '');
                    break;
                case 'prazoEtapa': {
                    const dateA = a.prazoEtapa ? new Date(a.prazoEtapa).getTime() : Infinity;
                    const dateB = b.prazoEtapa ? new Date(b.prazoEtapa).getTime() : Infinity;
                    comparison = dateA - dateB;
                    break;
                }
                case 'status_geral':
                    comparison = (a.status_geral || '').localeCompare(b.status_geral || '');
                    break;
                case 'created_at':
                    comparison = (new Date(a.created_at || 0).getTime()) - (new Date(b.created_at || 0).getTime());
                    break;
                case 'updated_at':
                    comparison = (new Date(a.updated_at || 0).getTime()) - (new Date(b.updated_at || 0).getTime());
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [data, searchTerm, setorFilter, responsavelFilter, groupedFilters, sortField, sortDirection]);

    // Reset página quando filtros mudam
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, setorFilter, responsavelFilter, groupedFilters]);

    // Dados paginados
    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredData.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredData, currentPage, itemsPerPage]);

    // Cálculos de paginação
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startItem = filteredData.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, filteredData.length);

    // Handlers
    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
    };

    const getInitials = (nome: string) => {
        if (!nome) return '??';
        const parts = nome.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        return new Date(dateStr).toLocaleDateString('pt-BR');
    };

    const getStatusBadge = (status: string) => {
        const config = STATUS_CONFIG[status] || { label: status, className: 'bg-muted text-muted-foreground' };
        return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
    };



    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{title}</CardTitle>
                    <Badge variant="outline" className="text-sm">
                        {filteredData.length} de {data.length}
                    </Badge>
                </div>

                {/* Filtros */}
                <div className="flex flex-wrap gap-3 mt-4">
                    {/* Busca */}
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por cliente, código ou tipo..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Filtro Setor */}
                    {showSetorFilter && (
                        <Select value={setorFilter} onValueChange={(v) => setSetorFilter(v as SetorSlug | 'todos')}>
                            <SelectTrigger className="w-[180px]">
                                <Filter className="h-4 w-4 mr-2" />
                                <SelectValue placeholder="Setor" />
                            </SelectTrigger>
                            <SelectContent>
                                {SETORES.map(s => (
                                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Filtro Responsável */}
                    <Select value={responsavelFilter} onValueChange={setResponsavelFilter}>
                        <SelectTrigger className="w-[200px]">
                            <SelectValue placeholder="Responsável" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="todos">Todos os Responsáveis</SelectItem>
                            {responsaveisUnicos.map(r => (
                                <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {/* Filtro Dropdown Agrupado (Status e Situação) */}
                    <GroupedMultiSelect
                        title="Status e Situação"
                        selectedValues={groupedFilters}
                        onChange={setGroupedFilters}
                        groups={[
                            {
                                key: 'status',
                                label: 'Status Geral',
                                options: STATUS_OPTIONS.filter(o => o.value !== 'todos').map(opt => ({
                                    ...opt,
                                    icon: undefined // Pode adicionar ícones se quiser
                                }))
                            },
                            {
                                key: 'situacao',
                                label: 'Situação',
                                options: STATUS_SITUACAO_OPTIONS.filter(o => o.value !== 'todos').map(opt => ({
                                    ...opt,
                                    icon: undefined
                                }))
                            }
                        ]}
                    />
                </div>
            </CardHeader>

            <CardContent className="px-6 pb-6">
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('codigo_os')}
                                        className="h-8 px-2 -ml-2"
                                    >
                                        ID
                                        <ArrowUpDown className="ml-1 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('cliente_nome')}
                                        className="h-8 px-2 -ml-2"
                                    >
                                        Cliente
                                        <ArrowUpDown className="ml-1 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('status_geral')}
                                        className="h-8 px-2 -ml-2"
                                    >
                                        Status
                                        <ArrowUpDown className="ml-1 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('prazoEtapa')}
                                        className="h-8 px-2 -ml-2"
                                    >
                                        Etapa
                                        <ArrowUpDown className="ml-1 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('created_at')}
                                        className="h-8 px-2 -ml-2"
                                    >
                                        Data Início
                                        <ArrowUpDown className="ml-1 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('prazoEtapa')}
                                        className="h-8 px-2 -ml-2"
                                    >
                                        Prazo
                                        <ArrowUpDown className="ml-1 h-3 w-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>Situação</TableHead>
                                <TableHead>Resp. Atual</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        Nenhuma ordem de serviço encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginatedData.map((os) => (
                                    <TableRow
                                        key={os.id}
                                        className={`cursor-pointer ${os.prazoVencido ? 'bg-destructive/5 hover:bg-destructive/10' : 'hover:bg-muted/50'}`}
                                        onClick={() => navigate({ to: '/os/$osId', params: { osId: os.id } })}
                                    >
                                        {/* ID */}
                                        <TableCell className="font-mono font-medium text-primary">
                                            {os.codigo_os}
                                        </TableCell>

                                        {/* Cliente */}
                                        <TableCell className="max-w-[200px] truncate">
                                            {os.cliente_nome || '-'}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            {getStatusBadge(os.status_geral)}
                                        </TableCell>

                                        {/* Tipo OS */}
                                        <TableCell className="max-w-[180px] truncate">
                                            {os.tipo_os_nome || '-'}
                                        </TableCell>

                                        {/* Etapa Atual */}
                                        <TableCell>
                                            {os.etapaAtual ? (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm">
                                                        {os.etapaAtual.numero}. {os.etapaAtual.titulo}
                                                    </span>
                                                    {os.prazoVencido && (
                                                        <AlertTriangle className="h-4 w-4 text-destructive" />
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>

                                        {/* Data Início */}
                                        <TableCell>
                                            {formatDate(os.created_at || os.data_entrada)}
                                        </TableCell>

                                        {/* Prazo da Etapa */}
                                        <TableCell>
                                            {os.prazoEtapa ? formatDate(os.prazoEtapa) : '-'}
                                        </TableCell>

                                        {/* Situação */}
                                        <TableCell>
                                            {os.status_situacao ? (
                                                <Badge variant="outline" className={STATUS_SITUACAO_CONFIG[os.status_situacao]?.className || 'bg-muted/10 text-muted-foreground'}>
                                                    {STATUS_SITUACAO_CONFIG[os.status_situacao]?.label || os.status_situacao}
                                                </Badge>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>

                                        {/* Responsável Atual */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage
                                                        src={os.responsavel_avatar_url || undefined}
                                                        alt={os.responsavel_nome || 'Responsável'}
                                                    />
                                                    <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                                                        {getInitials(os.responsavel_nome || '')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="text-sm truncate max-w-[120px]">
                                                    {os.responsavel_nome || 'Não atribuído'}
                                                </span>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Paginação */}
                {filteredData.length > 0 && (
                    <div className="flex items-center justify-between mt-4">
                        <p className="text-sm text-muted-foreground">
                            Mostrando {startItem} a {endItem} de {filteredData.length} registros
                        </p>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Anterior
                            </Button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum: number;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }
                                    return (
                                        <Button
                                            key={pageNum}
                                            variant={currentPage === pageNum ? 'default' : 'outline'}
                                            size="sm"
                                            className="w-8 h-8 p-0"
                                            onClick={() => setCurrentPage(pageNum)}
                                        >
                                            {pageNum}
                                        </Button>
                                    );
                                })}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Próximo
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
