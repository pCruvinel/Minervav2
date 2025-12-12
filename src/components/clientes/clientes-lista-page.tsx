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
  TrendingUp,
  AlertTriangle,
  Clock,
} from 'lucide-react';
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
      lead: { label: 'Lead', icon: Clock, className: 'bg-blue-500/10 text-blue-500' },
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
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestão de Clientes</h1>
          <p className="text-muted-foreground">
            Contratos ativos e centros de custo
          </p>
        </div>
        <Button variant="outline" onClick={() => setIsCadastroOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
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
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <Building2 className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl">{stats.total}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.ativos} ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Leads</p>
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-2xl text-blue-500">{stats.leads}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              aguardando conversão
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Com Contratos</p>
              <FileText className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-2xl text-success">{stats.comContratos}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              contratos ativos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Inadimplentes</p>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </div>
            <h3 className="text-2xl text-destructive">{stats.inadimplentes}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              requerem atenção
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Clientes ({clientesFiltrados.length})</CardTitle>
            <div className="flex items-center gap-4">
              {/* Filtro de Status */}
              <div className="w-48">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger className="w-[180px]">
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

              {/* Busca */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>
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
