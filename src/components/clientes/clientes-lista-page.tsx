import { useState, useMemo } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableHeader, TableRow } from '../ui/table';
import {
  Building2,
  Plus,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { CadastrarLead, FormDataCompleto } from '../os/shared/steps/cadastrar-lead';
import { cn } from '../ui/utils';
import { useClientes } from '../../lib/hooks/use-clientes';
import {
  CompactTableWrapper,
  CompactTableHead,
  CompactTableCell,
  CompactTableRow,
} from '@/components/shared/compact-table';
import { FilterBar, SearchInput, FilterSelect } from '@/components/shared/filters';

interface Cliente {
  id: string;
  nomeRazaoSocial: string;
  cpfCnpj: string;
  status: 'ativo' | 'inativo' | 'lead' | 'blacklist';
  qtdContratos: number;
  statusFinanceiro: 'em_dia' | 'atencao' | 'inadimplente';
  proximaFatura: string | null;
}

interface ClientesListaPageProps {
  onClienteClick?: (clienteId: string) => void;
}

export function ClientesListaPage({ onClienteClick }: ClientesListaPageProps) {
  // Carregar clientes do backend
  const { clientes: clientesBackend } = useClientes();

  // Mapear dados do backend para o formato esperado pelo componente
  const clientes: Cliente[] = clientesBackend
    .filter((cliente) => cliente.nome_razao_social !== 'Sistema - Requisições em Andamento')
    .map((cliente) => {
      // Calcular status financeiro baseado em faturas atrasadas e contas inadimplentes
      const faturasAtrasadas = cliente.faturas_atrasadas || 0;
      const contasInadimplentes = cliente.contas_inadimplentes || 0;

      let statusFinanceiro: 'em_dia' | 'atencao' | 'inadimplente' = 'em_dia';
      if (faturasAtrasadas > 0 || contasInadimplentes > 0) {
        statusFinanceiro = 'inadimplente';
      } else if (cliente.proxima_fatura) {
        const proximaFatura = new Date(cliente.proxima_fatura);
        const hoje = new Date();
        const diasAteVencimento = Math.ceil((proximaFatura.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
        if (diasAteVencimento <= 7 && diasAteVencimento >= 0) {
          statusFinanceiro = 'atencao';
        }
      }

      return {
        id: cliente.id,
        nomeRazaoSocial: cliente.nome_razao_social || 'Cliente sem nome',
        cpfCnpj: cliente.cpf_cnpj || '',
        status: cliente.status || 'lead',
        qtdContratos: cliente.qtd_contratos || 0,
        statusFinanceiro,
        proximaFatura: cliente.proxima_fatura || null,
      };
    });

  const [filtro, setFiltro] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');

  // Pagination and sorting state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState<keyof Cliente | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Estado para o componente CadastrarLead
  const [isCadastroOpen, setIsCadastroOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [showCombobox, setShowCombobox] = useState(false);
  const [formData, setFormData] = useState<FormDataCompleto>({
    nome: '',
    cpfCnpj: '',
    tipo: '',
    nomeResponsavel: '',
    cargoResponsavel: '',
    telefone: '',
    email: '',
    tipoEdificacao: '',
    qtdUnidades: '',
    qtdBlocos: '',
    qtdPavimentos: '',
    tipoTelhado: '',
    possuiElevador: false,
    possuiPiscina: false,
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const formatCpfCnpj = (value: string) => {
    if (!value) return '-';
    const digits = value.replace(/\D/g, '');
    if (digits.length === 11) {
      return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }
    if (digits.length === 14) {
      return digits.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }
    return value;
  };

  const getStatusBadge = (status: Cliente['status']) => {
    const statusConfig = {
      ativo: { label: 'Ativo', icon: CheckCircle, className: 'bg-success/10 text-success hover:bg-success/10' },
      inativo: { label: 'Inativo', icon: XCircle, className: 'bg-muted text-muted-foreground' },
      lead: { label: 'Lead', icon: Clock, className: 'bg-info/10 text-info' },
      blacklist: { label: 'Blacklist', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
    };

    const config = statusConfig[status] || statusConfig.lead;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const getStatusFinanceiroBadge = (status: Cliente['statusFinanceiro']) => {
    const statusConfig = {
      em_dia: { label: 'Em dia', icon: CheckCircle, className: 'bg-success/10 text-success hover:bg-success/10' },
      atencao: { label: 'Atenção', icon: AlertTriangle, className: 'bg-warning/10 text-warning' },
      inadimplente: { label: 'Inadimplente', icon: XCircle, className: 'bg-destructive/10 text-destructive' },
    };

    const config = statusConfig[status];
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  // Aplicar filtros
  const clientesFiltrados = clientes.filter(cliente => {
    const searchTermLower = filtro.toLowerCase();
    const matchesSearch = cliente.nomeRazaoSocial.toLowerCase().includes(searchTermLower);
    const matchesStatus = !filtroStatus || filtroStatus === 'todos' || cliente.status === filtroStatus;

    return matchesSearch && matchesStatus;
  });

  // Handle Sort
  const handleSort = (field: keyof Cliente) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setPage(1);
  };

  // Sorted clients
  const sortedClientes = useMemo(() => {
    if (!sortField) return clientesFiltrados;
    return [...clientesFiltrados].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
  }, [clientesFiltrados, sortField, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedClientes.length / itemsPerPage));
  const paginatedClientes = sortedClientes.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  // Calcular estatísticas
  const stats = {
    total: clientes.filter(c => c.status !== 'lead').length, // Excluir leads do total de clientes
    ativos: clientes.filter(c => c.status === 'ativo').length,
    leads: clientes.filter(c => c.status === 'lead').length,
    comContratos: clientes.filter(c => c.qtdContratos > 0).length,
    inadimplentes: clientes.filter(c => c.statusFinanceiro === 'inadimplente').length,
  };

  const handleClienteClick = (clienteId: string) => {
    if (onClienteClick) {
      onClienteClick(clienteId);
    }
  };



  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <PageHeader
        title="Gestão de Contatos"
        subtitle="Gerencie contatos, contratos e centros de custo"
      >
        <Button onClick={() => setIsCadastroOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar
        </Button>
      </PageHeader>

      {/* Componente CadastrarLead (Oculto, mas renderiza o Dialog quando isCadastroOpen é true) */}
      <div className="hidden">
        <CadastrarLead
          selectedLeadId={selectedLeadId}
          onSelectLead={(id) => setSelectedLeadId(id)}
          showCombobox={showCombobox}
          onShowComboboxChange={setShowCombobox}
          showNewLeadDialog={isCadastroOpen}
          onShowNewLeadDialogChange={setIsCadastroOpen}
          formData={formData}
          onFormDataChange={setFormData}
        />
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Total de Clientes</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Leads</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.leads}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Com Contratos</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.comContratos}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-neutral-600">Inadimplentes</p>
                <p className="text-2xl font-bold text-neutral-900 mt-1">{stats.inadimplentes}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <FilterBar>
        <SearchInput
          value={filtro}
          onChange={setFiltro}
          placeholder="Buscar por nome..."
        />
        <FilterSelect
          value={filtroStatus || 'todos'}
          onChange={setFiltroStatus}
          options={[
            { value: 'todos', label: 'Todos' },
            { value: 'ativo', label: 'Ativo' },
            { value: 'inativo', label: 'Inativo' },
            { value: 'lead', label: 'Lead' },
            { value: 'blacklist', label: 'Blacklist' },
          ]}
          placeholder="Status"
        />
      </FilterBar>

      {/* Tabela */}
      <CompactTableWrapper
        title="Lista de Clientes"
        totalItems={sortedClientes.length}
        currentCount={paginatedClientes.length}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={(perPage) => {
          setItemsPerPage(perPage);
          setPage(1);
        }}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <CompactTableHead
                onSort={() => handleSort('nomeRazaoSocial')}
                sortDirection={sortField === 'nomeRazaoSocial' ? sortDirection : undefined}
              >
                Cliente / Razão Social
              </CompactTableHead>
              <CompactTableHead>CPF / CNPJ</CompactTableHead>
              <CompactTableHead
                onSort={() => handleSort('status')}
                sortDirection={sortField === 'status' ? sortDirection : undefined}
              >
                Status
              </CompactTableHead>
              <CompactTableHead
                className="text-center"
                onSort={() => handleSort('qtdContratos')}
                sortDirection={sortField === 'qtdContratos' ? sortDirection : undefined}
              >
                Contratos
              </CompactTableHead>
              <CompactTableHead
                onSort={() => handleSort('statusFinanceiro')}
                sortDirection={sortField === 'statusFinanceiro' ? sortDirection : undefined}
              >
                Status Financeiro
              </CompactTableHead>
              <CompactTableHead>Próxima Fatura</CompactTableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedClientes.length === 0 ? (
              <CompactTableRow>
                <CompactTableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                  Nenhum cliente encontrado com os filtros aplicados.
                </CompactTableCell>
              </CompactTableRow>
            ) : (
              paginatedClientes.map((cliente) => (
                <CompactTableRow
                  key={cliente.id}
                  className={cn(
                    "cursor-pointer transition-colors",
                    cliente.status === 'inativo' && "opacity-60"
                  )}
                  onClick={() => handleClienteClick(cliente.id)}
                >
                  <CompactTableCell>
                    <p className="font-medium">{cliente.nomeRazaoSocial}</p>
                  </CompactTableCell>
                  <CompactTableCell>
                    <span className="font-mono text-muted-foreground">
                      {formatCpfCnpj(cliente.cpfCnpj)}
                    </span>
                  </CompactTableCell>
                  <CompactTableCell>
                    {getStatusBadge(cliente.status)}
                  </CompactTableCell>
                  <CompactTableCell className="text-center">
                    <Badge variant="outline" className="font-mono">
                      {cliente.qtdContratos}
                    </Badge>
                  </CompactTableCell>
                  <CompactTableCell>
                    {getStatusFinanceiroBadge(cliente.statusFinanceiro)}
                  </CompactTableCell>
                  <CompactTableCell>
                    <div className="flex items-center gap-2">
                      {cliente.proximaFatura && (
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      )}
                      {formatDate(cliente.proximaFatura)}
                    </div>
                  </CompactTableCell>
                </CompactTableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CompactTableWrapper>
    </div >
  );
}
