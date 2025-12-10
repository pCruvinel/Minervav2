import { logger } from '@/lib/utils/logger';
import { useState, useEffect } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { Loader2 } from 'lucide-react';
import {
  Mail,
  Search,
  Send,
  Building2,
  Briefcase,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { ModalConviteColaborador } from './modal-convite-colaborador';
import { colaboradoresAPI } from '../../lib/api-client';
import { toast } from 'sonner';

interface Colaborador {
  id: string;
  nome_completo: string;
  avatar_url?: string | null;
  cpf: string | null;
  email: string | null;
  telefone: string | null;
  email_profissional?: string | null;
  telefone_profissional?: string | null;
  email_pessoal?: string | null;
  telefone_pessoal?: string | null;
  cargo_id: string | null;
  setor: string | null;
  tipo_contratacao: string | null;
  custo_dia: number | null;
  ativo: boolean;
  status_convite?: string | null;
  data_admissao: string | null;
  cargos?: { nome: string } | null;
  setores?: { nome: string } | null;
}

export function ColaboradoresListaPage() {
  const navigate = useNavigate();
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');
  const [setorFilter, setSetorFilter] = useState('todos');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [modalConviteOpen, setModalConviteOpen] = useState(false);

  // Buscar colaboradores da API
  useEffect(() => {
    async function fetchColaboradores() {
      try {
        setLoading(true);
        const data = await colaboradoresAPI.list();
        setColaboradores(data);
      } catch (error) {
        logger.error('Erro ao buscar colaboradores:', error);
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



  const colaboradoresFiltrados = colaboradores.filter((colaborador) => {
    const matchesSearch =
      colaborador.nome_completo?.toLowerCase().includes(filtro.toLowerCase()) ||
      colaborador.email?.toLowerCase().includes(filtro.toLowerCase()) ||
      colaborador.email_profissional?.toLowerCase().includes(filtro.toLowerCase()) ||
      colaborador.email_pessoal?.toLowerCase().includes(filtro.toLowerCase()) ||
      colaborador.cpf?.includes(filtro);

    const matchesSetor = setorFilter === 'todos' ||
      colaborador.setor?.toLowerCase() === setorFilter.toLowerCase();

    const matchesStatus = statusFilter === 'todos' ||
      (statusFilter === 'ativo' && colaborador.ativo && colaborador.status_convite !== 'pendente' && colaborador.status_convite !== 'convidado') ||
      (statusFilter === 'inativo' && !colaborador.ativo) ||
      (statusFilter === 'pendente' && (colaborador.status_convite === 'pendente' || colaborador.status_convite === 'convidado'));

    return matchesSearch && matchesSetor && matchesStatus;
  });

  const handleConvidar = () => {
    setModalConviteOpen(true);
  };

  const handleConviteSuccess = async () => {
    // Recarregar lista após enviar convites
    const data = await colaboradoresAPI.list();
    setColaboradores(data);
  };

  // Navegar para detalhes ao clicar na linha
  const handleRowClick = (colaboradorId: string) => {
    navigate({ to: '/colaboradores/$colaboradorId', params: { colaboradorId } });
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Gestão de Colaboradores</h1>
          <p className="text-muted-foreground">
            Gerencia os documentos e informações de todos os Colaboradores.
          </p>
        </div>
        <Button onClick={handleConvidar}>
          <Send className="mr-2 h-4 w-4" />
          Convidar Colaborador
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Ativos</p>
            <h3 className="text-2xl text-success">
              {colaboradores.filter((c) => c.ativo).length}
            </h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground mb-1">Total Inativos</p>
            <h3 className="text-2xl text-destructive">
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos Status</SelectItem>
                  <SelectItem value="ativo">Ativos</SelectItem>
                  <SelectItem value="inativo">Inativos</SelectItem>
                  <SelectItem value="pendente">Pendentes</SelectItem>
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
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                    <p className="text-muted-foreground mt-2">Carregando colaboradores...</p>
                  </TableCell>
                </TableRow>
              ) : colaboradoresFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <p className="text-muted-foreground">
                      Nenhum colaborador encontrado com os filtros aplicados.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                colaboradoresFiltrados.map((colaborador) => (
                  <TableRow
                    key={colaborador.id}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleRowClick(colaborador.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={colaborador.avatar_url || undefined} alt={colaborador.nome_completo} />
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {colaborador.nome_completo?.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{colaborador.nome_completo}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Mail className="h-3 w-3" />
                            {colaborador.email_profissional || colaborador.email_pessoal || colaborador.email || 'N/A'}
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
                      {renderStatusBadge(colaborador)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Convite */}
      <ModalConviteColaborador
        open={modalConviteOpen}
        onClose={() => setModalConviteOpen(false)}
        onSuccess={handleConviteSuccess}
      />
    </div>
  );
}

// Helper para badge de status
function renderStatusBadge(colaborador: Colaborador) {
  // Se o colaborador está inativo, sempre mostrar "Inativo" (prioridade máxima)
  if (colaborador.ativo === false) {
    return (
      <Badge variant="destructive">
        Inativo
      </Badge>
    );
  }

  // Se está ativo, verificar o status do convite
  const statusConvite = colaborador.status_convite;

  switch (statusConvite) {
    case 'pendente':
    case 'convidado':
      return (
        <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">
          <Clock className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      );
    case 'aceito':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Aceito
        </Badge>
      );
    default:
      // Colaborador ativo sem status de convite específico
      return (
        <Badge variant="default" className="bg-green-500/10 text-green-700 border-green-500/30">
          Ativo
        </Badge>
      );
  }
}
