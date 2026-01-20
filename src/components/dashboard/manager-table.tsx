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
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
    TableHeader,
    TableRow,
    TableCell,
} from '@/components/ui/table';
import {
    Search,
    Filter,
    AlertTriangle,
} from 'lucide-react';
import { type OSComEtapa } from '@/lib/hooks/use-dashboard-data';
import { type SetorSlug } from '@/lib/types';
import {
    CompactTableWrapper,
    CompactTableHead,
    CompactTableRow,
    CompactTableCell
} from '@/components/shared/compact-table';

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
    { value: 'todos', label: 'Todos' },
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
    const [itemsPerPage, setItemsPerPage] = useState(20);

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
        <div className="space-y-4">
            {/* Filtros em Card Separado */}
            <Card className="shadow-sm">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-3">
                        {/* Busca */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Buscar por cliente, código ou tipo..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-9"
                            />
                        </div>

                        {/* Filtro Setor */}
                        {showSetorFilter && (
                            <Select value={setorFilter} onValueChange={(v) => setSetorFilter(v as SetorSlug | 'todos')}>
                                <SelectTrigger className="w-[180px] h-9">
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
                            <SelectTrigger className="w-[200px] h-9">
                                <SelectValue placeholder="Responsável" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="todos">Todos</SelectItem>
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
                                        icon: undefined
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
                </CardContent>
            </Card>

            {/* Tabela Compacta */}
            <CompactTableWrapper
                title={title}
                subtitle={`${filteredData.length} ordens de serviço encontradas`}
                totalItems={filteredData.length}
                currentCount={paginatedData.length}
                page={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
            >
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/40 hover:bg-muted/40">
                            <CompactTableHead
                                className="w-[100px]"
                                onSort={() => handleSort('codigo_os')}
                                sortDirection={sortField === 'codigo_os' ? sortDirection : undefined}
                            >
                                ID
                            </CompactTableHead>
                            <CompactTableHead
                                onSort={() => handleSort('cliente_nome')}
                                sortDirection={sortField === 'cliente_nome' ? sortDirection : undefined}
                            >
                                Cliente
                            </CompactTableHead>
                            <CompactTableHead
                                className="w-[140px]"
                                onSort={() => handleSort('status_geral')}
                                sortDirection={sortField === 'status_geral' ? sortDirection : undefined}
                            >
                                Status
                            </CompactTableHead>
                            <CompactTableHead className="w-[150px]">
                                Tipo
                            </CompactTableHead>
                            <CompactTableHead
                                className="min-w-[150px]"
                                onSort={() => handleSort('prazoEtapa')}
                                sortDirection={sortField === 'prazoEtapa' ? sortDirection : undefined}
                            >
                                Etapa
                            </CompactTableHead>
                            <CompactTableHead
                                className="w-[100px]"
                                onSort={() => handleSort('created_at')}
                                sortDirection={sortField === 'created_at' ? sortDirection : undefined}
                            >
                                Início
                            </CompactTableHead>
                            <CompactTableHead
                                className="w-[100px]"
                                onSort={() => handleSort('prazoEtapa')} // Note: Using same sort key as 'Etapa' based on existing logic
                                sortDirection={sortField === 'prazoEtapa' ? sortDirection : undefined} // But maybe we should check if this conflicts
                            >
                                Prazo
                            </CompactTableHead>
                            <CompactTableHead className="w-[120px]">
                                Situação
                            </CompactTableHead>
                            <CompactTableHead className="w-[150px]">
                                Resp. Atual
                            </CompactTableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                    Nenhuma ordem de serviço encontrada.
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedData.map((os) => (
                                <CompactTableRow
                                    key={os.id}
                                    className={`cursor-pointer ${os.prazoVencido ? 'bg-destructive/5 hover:bg-destructive/10' : ''}`}
                                    onClick={() => navigate({ to: '/os/$osId', params: { osId: os.id } })}
                                >
                                    {/* ID */}
                                    <CompactTableCell className="font-mono font-medium text-primary">
                                        {os.codigo_os}
                                    </CompactTableCell>

                                    {/* Cliente */}
                                    <CompactTableCell className="max-w-[200px] truncate font-medium" title={os.cliente_nome}>
                                        {os.cliente_nome || '-'}
                                    </CompactTableCell>

                                    {/* Status */}
                                    <CompactTableCell>
                                        {getStatusBadge(os.status_geral)}
                                    </CompactTableCell>

                                    {/* Tipo OS */}
                                    <CompactTableCell className="max-w-[150px] truncate text-muted-foreground" title={os.tipo_os_nome}>
                                        {os.tipo_os_nome || '-'}
                                    </CompactTableCell>

                                    {/* Etapa Atual */}
                                    <CompactTableCell>
                                        {os.etapaAtual ? (
                                            <div className="flex items-center gap-1.5" title={os.etapaAtual.titulo}>
                                                <span className="truncate max-w-[140px]">
                                                    {os.etapaAtual.numero}. {os.etapaAtual.titulo}
                                                </span>
                                                {os.prazoVencido && (
                                                    <AlertTriangle className="h-3.5 w-3.5 text-destructive shrink-0" />
                                                )}
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </CompactTableCell>

                                    {/* Data Início */}
                                    <CompactTableCell>
                                        {formatDate(os.created_at || os.data_entrada)}
                                    </CompactTableCell>

                                    {/* Prazo da Etapa */}
                                    <CompactTableCell className={os.prazoVencido ? "text-destructive font-medium" : ""}>
                                        {os.prazoEtapa ? formatDate(os.prazoEtapa) : '-'}
                                    </CompactTableCell>

                                    {/* Situação */}
                                    <CompactTableCell>
                                        {os.status_situacao ? (
                                            <Badge variant="outline" className={STATUS_SITUACAO_CONFIG[os.status_situacao]?.className || 'bg-muted/10 text-muted-foreground'}>
                                                {STATUS_SITUACAO_CONFIG[os.status_situacao]?.label || os.status_situacao}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground">-</span>
                                        )}
                                    </CompactTableCell>

                                    {/* Responsável Atual */}
                                    <CompactTableCell>
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarImage
                                                    src={os.responsavel_avatar_url || undefined}
                                                    alt={os.responsavel_nome || 'Responsável'}
                                                />
                                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                                    {getInitials(os.responsavel_nome || '')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span className="truncate max-w-[100px]" title={os.responsavel_nome}>
                                                {os.responsavel_nome || 'Não atribuído'}
                                            </span>
                                        </div>
                                    </CompactTableCell>
                                </CompactTableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </CompactTableWrapper>
        </div>
    );
}
