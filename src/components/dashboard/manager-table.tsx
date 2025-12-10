/**
 * ManagerTable - Tabela Gerencial para Coordenadores e Diretoria
 * 
 * Foco em controle e visibilidade. Inclui:
 * - Colunas: ID, Cliente, Tipo OS, Etapa Atual, Responsável, Prazo, Status
 * - Filtros: Setor, Responsável, Busca por Cliente
 * - Destaque visual para prazos vencidos
 */

import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
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
    Eye
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

type SortField = 'codigo_os' | 'cliente_nome' | 'prazoEtapa' | 'status_geral';
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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    em_triagem: { label: 'Em Triagem', className: 'bg-warning/10 text-warning border-warning/20' },
    em_andamento: { label: 'Em Andamento', className: 'bg-info/10 text-info border-info/20' },
    aguardando_aprovacao: { label: 'Aguardando', className: 'bg-warning/10 text-warning border-warning/20' },
    concluida: { label: 'Concluída', className: 'bg-success/10 text-success border-success/20' },
    cancelada: { label: 'Cancelada', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function ManagerTable({
    data,
    title = 'Ordens de Serviço',
    showSetorFilter = true,
    responsaveis = []
}: ManagerTableProps) {
    // Estados de filtro
    const [searchTerm, setSearchTerm] = useState('');
    const [setorFilter, setSetorFilter] = useState<SetorSlug | 'todos'>('todos');
    const [responsavelFilter, setResponsavelFilter] = useState<string>('todos');

    // Estado de ordenação
    const [sortField, setSortField] = useState<SortField>('prazoEtapa');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
                case 'prazoEtapa':
                    const dateA = a.prazoEtapa ? new Date(a.prazoEtapa).getTime() : Infinity;
                    const dateB = b.prazoEtapa ? new Date(b.prazoEtapa).getTime() : Infinity;
                    comparison = dateA - dateB;
                    break;
                case 'status_geral':
                    comparison = (a.status_geral || '').localeCompare(b.status_geral || '');
                    break;
            }

            return sortDirection === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [data, searchTerm, setorFilter, responsavelFilter, sortField, sortDirection]);

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
                </div>
            </CardHeader>

            <CardContent className="p-0">
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
                                <TableHead>Tipo OS</TableHead>
                                <TableHead>Etapa Atual</TableHead>
                                <TableHead>Responsável</TableHead>
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
                                <TableHead className="w-[60px]">Ação</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredData.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                        Nenhuma ordem de serviço encontrada.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredData.map((os) => (
                                    <TableRow
                                        key={os.id}
                                        className={os.prazoVencido ? 'bg-destructive/5 hover:bg-destructive/10' : ''}
                                    >
                                        {/* ID */}
                                        <TableCell className="font-mono font-medium">
                                            <Link
                                                to="/os/$osId"
                                                params={{ osId: os.id }}
                                                className="text-primary hover:underline"
                                            >
                                                {os.codigo_os}
                                            </Link>
                                        </TableCell>

                                        {/* Cliente */}
                                        <TableCell className="max-w-[200px] truncate">
                                            {os.cliente_nome || '-'}
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

                                        {/* Responsável */}
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-7 w-7">
                                                    <AvatarImage
                                                        src={(os as any).responsavel_avatar_url || undefined}
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

                                        {/* Prazo */}
                                        <TableCell className={os.prazoVencido ? 'text-destructive font-medium' : ''}>
                                            {formatDate(os.prazoEtapa)}
                                        </TableCell>

                                        {/* Status */}
                                        <TableCell>
                                            {getStatusBadge(os.status_geral)}
                                        </TableCell>

                                        {/* Ação */}
                                        <TableCell>
                                            <Button variant="ghost" size="icon" asChild>
                                                <Link to="/os/$osId" params={{ osId: os.id }}>
                                                    <Eye className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
