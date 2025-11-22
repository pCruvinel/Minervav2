import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import {
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Building2,
  Briefcase,
  Eye,
  Edit,
  UserX,
} from 'lucide-react';
import { ModalCadastroColaborador } from './modal-cadastro-colaborador';

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  funcao: string;
  setor: 'obras' | 'administrativo' | 'assessoria' | 'diretoria';
  tipoContratacao: 'CLT' | 'CONTRATO' | 'PROLABORE';
  custoDia: number;
  status: 'ATIVO' | 'INATIVO';
  dataAdmissao: string;
}

// Mock data
const mockColaboradores: Colaborador[] = [
  {
    id: 'col-1',
    nome: 'João Silva',
    cpf: '123.456.789-00',
    email: 'joao.silva@minerva.com',
    telefone: '(11) 98765-4321',
    funcao: 'COORDENADOR DE OBRAS',
    setor: 'obras',
    tipoContratacao: 'CLT',
    custoDia: 280.50,
    status: 'ATIVO',
    dataAdmissao: '2023-01-15',
  },
  {
    id: 'col-2',
    nome: 'Maria Santos',
    cpf: '987.654.321-00',
    email: 'maria.santos@minerva.com',
    telefone: '(11) 91234-5678',
    funcao: 'ANALISTA ADMINISTRATIVO',
    setor: 'administrativo',
    tipoContratacao: 'CLT',
    custoDia: 150.00,
    status: 'ATIVO',
    dataAdmissao: '2023-03-10',
  },
  {
    id: 'col-3',
    nome: 'Pedro Oliveira',
    cpf: '456.789.123-00',
    email: 'pedro.oliveira@minerva.com',
    telefone: '(11) 97777-8888',
    funcao: 'ENGENHEIRO CIVIL',
    setor: 'assessoria',
    tipoContratacao: 'CONTRATO',
    custoDia: 450.00,
    status: 'ATIVO',
    dataAdmissao: '2023-06-01',
  },
  {
    id: 'col-4',
    nome: 'Ana Costa',
    cpf: '321.654.987-00',
    email: 'ana.costa@minerva.com',
    telefone: '(11) 98765-9876',
    funcao: 'COORDENADOR ADMINISTRATIVO',
    setor: 'ADM',
    tipoContratacao: 'CLT',
    custoDia: 320.00,
    status: 'ATIVO',
    dataAdmissao: '2022-11-20',
  },
  {
    id: 'col-5',
    nome: 'Carlos Mendes',
    cpf: '654.321.789-00',
    email: 'carlos.mendes@example.com',
    telefone: '(11) 98765-4567',
    funcao: 'COLABORADOR OBRA',
    setor: 'OBRAS',
    tipoContratacao: 'CONTRATO',
    custoDia: 110.00,
    status: 'INATIVO',
    dataAdmissao: '2023-02-05',
  },
];

export function ColaboradoresListaPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(mockColaboradores);
  const [filtro, setFiltro] = useState('');
  const [setorFilter, setSetorFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [colaboradorEdicao, setColaboradorEdicao] = useState<Colaborador | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatFuncao = (funcao: string) => {
    return funcao.replace(/_/g, ' ').toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const colaboradoresFiltrados = colaboradores.filter((colaborador) => {
    const matchesSearch = colaborador.nome.toLowerCase().includes(filtro.toLowerCase()) ||
      colaborador.email.toLowerCase().includes(filtro.toLowerCase()) ||
      colaborador.cpf.includes(filtro);

    const matchesSetor = setorFilter === 'todos' || colaborador.setor.toLowerCase() === setorFilter.toLowerCase();
    const matchesStatus = statusFilter === 'todos' || colaborador.status.toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesSetor && matchesStatus;
  });

  const handleNovoCadastro = () => {
    setColaboradorEdicao(null);
    setModalCadastroOpen(true);
  };

  const handleEditar = (colaborador: Colaborador) => {
    setColaboradorEdicao(colaborador);
    setModalCadastroOpen(true);
  };

  const handleSalvarColaborador = (dados: any) => {
    console.log('Colaborador salvo:', dados);
    setModalCadastroOpen(false);
    setColaboradorEdicao(null);
  };

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestão de Colaboradores</h1>
          <p className="text-muted-foreground">
            Cadastro completo de colaboradores (Fluxo OS Tipo 10)
          </p>
        </div>
        <Button onClick={handleNovoCadastro}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Colaborador
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Ativos</p>
            <h3 className="text-2xl text-green-600">
              {colaboradores.filter((c) => c.status === 'ATIVO').length}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Inativos</p>
            <h3 className="text-2xl text-red-600">
              {colaboradores.filter((c) => c.status === 'INATIVO').length}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Custo-Dia Médio</p>
            <h3 className="text-2xl">
              {formatCurrency(
                colaboradores
                  .filter((c) => c.status === 'ATIVO')
                  .reduce((sum, c) => sum + c.custoDia, 0) /
                colaboradores.filter((c) => c.status === 'ATIVO').length
              )}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Custo-Dia Total</p>
            <h3 className="text-2xl">
              {formatCurrency(
                colaboradores
                  .filter((c) => c.status === 'ATIVO')
                  .reduce((sum, c) => sum + c.custoDia, 0)
              )}
            </h3>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Colaboradores ({colaboradoresFiltrados.length})</CardTitle>
            <div className="flex items-center gap-4"> {/* Added a flex container for filters */}
              <div className="relative w-96">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, CPF ou e-mail..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={setorFilter} onValueChange={setSetorFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os Setores</SelectItem>
                  <SelectItem value="obras">Obras</SelectItem>
                  <SelectItem value="administrativo">Administrativo</SelectItem>
                  <SelectItem value="assessoria">Assessoria</SelectItem>
                  <SelectItem value="diretoria">Diretoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Colaborador</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Setor</TableHead>
                <TableHead>Tipo Contratação</TableHead>
                <TableHead className="text-right">Custo-Dia</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradoresFiltrados.map((colaborador) => (
                <TableRow key={colaborador.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{colaborador.nome}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {colaborador.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      {formatFuncao(colaborador.funcao)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      {colaborador.setor}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={colaborador.status === 'ATIVO' ? 'success' : 'secondary'}>
                      {colaborador.status === 'ATIVO' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(colaborador.custoDia)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={colaborador.status === 'ATIVO' ? 'default' : 'destructive'}
                    >
                      {colaborador.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditar(colaborador)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {colaborador.status === 'ATIVO' && (
                        <Button variant="ghost" size="sm">
                          <UserX className="h-4 w-4 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {colaboradoresFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum colaborador encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Cadastro */}
      <ModalCadastroColaborador
        open={modalCadastroOpen}
        onClose={() => {
          setModalCadastroOpen(false);
          setColaboradorEdicao(null);
        }}
        colaborador={colaboradorEdicao}
        onSalvar={handleSalvarColaborador}
      />
    </div>
  );
}
