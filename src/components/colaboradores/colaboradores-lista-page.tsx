import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Loader2 } from 'lucide-react';
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
import { colaboradoresAPI } from '../../lib/api-client';
import { toast } from 'sonner';

interface Colaborador {
  id: string;
  nome_completo: string;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  cargo_id: string | null;
  setor: string | null;
  tipo_contratacao: string | null;
  custo_dia: number | null;
  ativo: boolean;
  data_admissao: string | null;
  cargos?: { nome: string } | null;
  setores?: { nome: string } | null;
}

export function ColaboradoresListaPage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [setorFilter, setSetorFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [colaboradorEdicao, setColaboradorEdicao] = useState<Colaborador | null>(null);
  const [modalCadastroOpen, setModalCadastroOpen] = useState(false);

  // Buscar colaboradores da API
  useEffect(() => {
    async function fetchColaboradores() {
      try {
        setLoading(true);
        const data = await colaboradoresAPI.list();
        setColaboradores(data);
      } catch (error) {
        console.error('Erro ao buscar colaboradores:', error);
        toast.error('Erro ao carregar colaboradores', {
          description: 'Não foi possível carregar a lista de colaboradores.',
        });
      } finally {
        setLoading(false);
      }
    }

    fetchColaboradores();
  }, []);

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
    const matchesSearch =
      colaborador.nome_completo?.toLowerCase().includes(filtro.toLowerCase()) ||
      colaborador.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      colaborador.cpf?.includes(filtro);

    const matchesSetor = setorFilter === 'todos' ||
      colaborador.setor?.toLowerCase() === setorFilter.toLowerCase();

    const matchesStatus = statusFilter === 'todos' ||
      (statusFilter === 'ativo' && colaborador.ativo) ||
      (statusFilter === 'inativo' && !colaborador.ativo);

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
              {colaboradores.filter((c) => c.ativo).length}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Inativos</p>
            <h3 className="text-2xl text-red-600">
              {colaboradores.filter((c) => !c.ativo).length}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Custo-Dia Médio</p>
            <h3 className="text-2xl">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatCurrency(
                  colaboradores
                    .filter((c) => c.ativo && c.custo_dia)
                    .reduce((sum, c) => sum + (c.custo_dia || 0), 0) /
                  (colaboradores.filter((c) => c.ativo && c.custo_dia).length || 1)
                )
              )}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Custo-Dia Total</p>
            <h3 className="text-2xl">
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                formatCurrency(
                  colaboradores
                    .filter((c) => c.ativo)
                    .reduce((sum, c) => sum + (c.custo_dia || 0), 0)
                )
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
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Carregando colaboradores...</p>
                  </TableCell>
                </TableRow>
              ) : colaboradoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <p className="text-muted-foreground">
                      Nenhum colaborador encontrado com os filtros aplicados.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                colaboradoresFiltrados.map((colaborador) => (
                  <TableRow key={colaborador.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{colaborador.nome_completo}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {colaborador.email || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                        {colaborador.cargos?.nome || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        {colaborador.setores?.nome || colaborador.setor || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {colaborador.tipo_contratacao || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {colaborador.custo_dia ? formatCurrency(colaborador.custo_dia) : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={colaborador.ativo ? 'default' : 'destructive'}>
                        {colaborador.ativo ? 'ATIVO' : 'INATIVO'}
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
                        {colaborador.ativo && (
                          <Button variant="ghost" size="sm">
                            <UserX className="h-4 w-4 text-red-600" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
