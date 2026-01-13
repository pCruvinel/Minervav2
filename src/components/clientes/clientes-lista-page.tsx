import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import {
  Building2,
  Search,
  Plus,
  Calendar,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Filter,
} from 'lucide-react';
import { CardDescription } from '../ui/card';
import { CadastrarLead, FormDataCompleto } from '../os/shared/steps/cadastrar-lead';
import { cn } from '../ui/utils';
import { useClientes } from '../../lib/hooks/use-clientes';

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
    .filter((cliente: any) => cliente.nome_razao_social !== 'Sistema - Requisições em Andamento')
    .map((cliente: any) => {
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Gestão de Contatos</h1>
          <p className="text-neutral-600 mt-1">
            Gerencie contatos, contratos e centros de custo
          </p>
        </div>
        <Button onClick={() => setIsCadastroOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Cadastrar
        </Button>
      </div>

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
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                placeholder="Buscar por nome..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="lead">Lead</SelectItem>
                <SelectItem value="blacklist">Blacklist</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Lista de Clientes</CardTitle>
          <CardDescription>{clientesFiltrados.length} cliente(s) encontrado(s)</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente / Razão Social</TableHead>
                <TableHead>CPF / CNPJ</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Contratos</TableHead>
                <TableHead>Status Financeiro</TableHead>
                <TableHead>Próxima Fatura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientesFiltrados.map((cliente) => (
                <TableRow
                  key={cliente.id}
                  className={cn(
                    "hover:bg-muted/50 cursor-pointer transition-colors",
                    cliente.status === 'inativo' && "opacity-60"
                  )}
                  onClick={() => handleClienteClick(cliente.id)}
                >
                  <TableCell>
                    <p className="font-medium">{cliente.nomeRazaoSocial}</p>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground">
                      {formatCpfCnpj(cliente.cpfCnpj)}
                    </span>
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(cliente.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="font-mono">
                      {cliente.qtdContratos}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getStatusFinanceiroBadge(cliente.statusFinanceiro)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {cliente.proximaFatura && (
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                      )}
                      {formatDate(cliente.proximaFatura)}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {clientesFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum cliente encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div >
  );
}
