import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import { Switch } from '../ui/switch';
import {
  Search,
  Shield,
  User,
  Lock,
  Unlock,
  Edit,
  Mail,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Info,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { toast } from 'sonner';

type PerfilAcesso = 'DIRETORIA' | 'GESTOR_ADM' | 'GESTOR_TECNICO' | 'OPERACIONAL' | 'SEM_ACESSO';
type StatusUsuario = 'ATIVO' | 'BLOQUEADO' | 'INATIVO';

interface Usuario {
  id: string;
  nome: string;
  cargo: string;
  funcao: string;
  email: string;
  perfil: PerfilAcesso;
  status: StatusUsuario;
  ultimoAcesso?: string;
  dataCriacao: string;
}

// Mock de usuários
const mockUsuarios: Usuario[] = [
  {
    id: 'usr-1',
    nome: 'Roberto Minerva',
    cargo: 'Diretor Geral',
    funcao: 'DIRETORIA',
    email: 'roberto.minerva@minervaeng.com.br',
    perfil: 'DIRETORIA',
    status: 'ATIVO',
    ultimoAcesso: '2024-11-17 14:30',
    dataCriacao: '2024-01-01',
  },
  {
    id: 'usr-2',
    nome: 'Ana Costa',
    cargo: 'Gerente Administrativo',
    funcao: 'GESTOR_ADM',
    email: 'ana.costa@minervaeng.com.br',
    perfil: 'GESTOR_ADM',
    status: 'ATIVO',
    ultimoAcesso: '2024-11-17 09:15',
    dataCriacao: '2024-01-01',
  },
  {
    id: 'usr-3',
    nome: 'Maria Santos',
    cargo: 'Engenheira Civil',
    funcao: 'GESTOR_TECNICO',
    email: 'maria.santos@minervaeng.com.br',
    perfil: 'GESTOR_TECNICO',
    status: 'ATIVO',
    ultimoAcesso: '2024-11-16 18:45',
    dataCriacao: '2024-02-01',
  },
  {
    id: 'usr-4',
    nome: 'Pedro Oliveira',
    cargo: 'Auxiliar Administrativo',
    funcao: 'OPERACIONAL',
    email: 'pedro.oliveira@minervaeng.com.br',
    perfil: 'OPERACIONAL',
    status: 'ATIVO',
    ultimoAcesso: '2024-11-17 10:20',
    dataCriacao: '2024-03-01',
  },
  {
    id: 'usr-5',
    nome: 'João Silva',
    cargo: 'Pedreiro',
    funcao: 'COLABORADOR_OBRA',
    email: '',
    perfil: 'SEM_ACESSO',
    status: 'INATIVO',
    dataCriacao: '2024-04-01',
  },
  {
    id: 'usr-6',
    nome: 'Carlos Mendes',
    cargo: 'Servente',
    funcao: 'COLABORADOR_OBRA',
    email: '',
    perfil: 'SEM_ACESSO',
    status: 'INATIVO',
    dataCriacao: '2024-04-01',
  },
  {
    id: 'usr-7',
    nome: 'Beatriz Lima',
    cargo: 'Arquiteta',
    funcao: 'GESTOR_TECNICO',
    email: 'beatriz.lima@minervaeng.com.br',
    perfil: 'GESTOR_TECNICO',
    status: 'BLOQUEADO',
    ultimoAcesso: '2024-10-15 16:30',
    dataCriacao: '2024-05-01',
  },
];

interface MatrizPermissao {
  perfil: PerfilAcesso;
  nivel: number;
  descricao: string;
  permissoes: string[];
  restricoes: string[];
}

const matrizPermissoes: MatrizPermissao[] = [
  {
    perfil: 'DIRETORIA',
    nivel: 1,
    descricao: 'Acesso total ao sistema',
    permissoes: [
      'Visualizar todos os módulos',
      'Aprovar e rejeitar OS de todos os níveis',
      'Acessar dados financeiros completos (incluindo salários)',
      'Gerenciar usuários e permissões',
      'Visualizar dashboards executivos',
      'Exportar relatórios sensíveis',
    ],
    restricoes: [],
  },
  {
    perfil: 'GESTOR_ADM',
    nivel: 2,
    descricao: 'Gestão administrativa e financeira',
    permissoes: [
      'Acessar módulo Financeiro completo',
      'Visualizar e editar dados de colaboradores',
      'Aprovar OS financeiras e administrativas',
      'Gerenciar contas a pagar/receber',
      'Criar e editar clientes',
      'Acessar controle de presença',
    ],
    restricoes: [
      'Não pode aprovar OS técnicas (Obras/Assessoria)',
      'Não pode alterar permissões de outros usuários',
    ],
  },
  {
    perfil: 'GESTOR_TECNICO',
    nivel: 3,
    descricao: 'Gestão técnica e operacional',
    permissoes: [
      'Aprovar OS técnicas (Tipo 1-4, 7-8)',
      'Visualizar projetos e obras',
      'Criar e editar OS operacionais',
      'Acessar relatórios de obra',
      'Gerenciar cronogramas',
    ],
    restricoes: [
      'Não visualiza salários dos colaboradores',
      'Não acessa módulo de Contas a Pagar (Salários)',
      'Não pode gerenciar usuários',
      'Não acessa dados financeiros sensíveis',
    ],
  },
  {
    perfil: 'OPERACIONAL',
    nivel: 4,
    descricao: 'Execução e consulta limitada',
    permissoes: [
      'Criar OS de nível operacional',
      'Visualizar OS atribuídas a si',
      'Registrar prestação de contas (próprias)',
      'Acessar calendário de tarefas',
      'Consultar documentos públicos',
    ],
    restricoes: [
      'Não pode aprovar OS',
      'Não visualiza dados financeiros',
      'Não acessa módulo de colaboradores',
      'Acesso somente-leitura a maioria dos módulos',
    ],
  },
  {
    perfil: 'SEM_ACESSO',
    nivel: 5,
    descricao: 'Colaboradores de obra sem acesso ao sistema',
    permissoes: [],
    restricoes: [
      'Sem login no sistema web',
      'Acesso apenas via registro de presença pelo gestor',
    ],
  },
];

interface UsuariosPermissoesPageProps {
  onBack?: () => void;
}

export function UsuariosPermissoesPage({ onBack }: UsuariosPermissoesPageProps) {
  const [usuarios] = useState(mockUsuarios);
  const [filtro, setFiltro] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('');
  const [filtroStatus, setFiltroStatus] = useState<string>('');
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [modalMatrizOpen, setModalMatrizOpen] = useState(false);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState<Usuario | null>(null);

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPerfilBadge = (perfil: PerfilAcesso) => {
    const config = {
      DIRETORIA: { label: 'Diretoria (N1)', className: 'bg-purple-100 text-purple-800', icon: Shield },
      GESTOR_ADM: { label: 'Gestor ADM (N2)', className: 'bg-blue-100 text-blue-800', icon: Shield },
      GESTOR_TECNICO: { label: 'Gestor Técnico (N3)', className: 'bg-green-100 text-green-800', icon: Shield },
      OPERACIONAL: { label: 'Operacional (N4)', className: 'bg-amber-100 text-amber-800', icon: User },
      SEM_ACESSO: { label: 'Sem Acesso', className: 'bg-neutral-100 text-neutral-800', icon: Lock },
    };

    const { label, className, icon: Icon } = config[perfil];
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getStatusBadge = (status: StatusUsuario) => {
    const config = {
      ATIVO: { label: 'Ativo', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      BLOQUEADO: { label: 'Bloqueado', icon: Lock, className: 'bg-red-100 text-red-800' },
      INATIVO: { label: 'Inativo', icon: XCircle, className: 'bg-neutral-100 text-neutral-800' },
    };

    const { label, icon: Icon, className } = config[status];
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  // Aplicar filtros
  const usuariosFiltrados = usuarios.filter((u) => {
    if (filtro && !u.nome.toLowerCase().includes(filtro.toLowerCase()) &&
        !u.email.toLowerCase().includes(filtro.toLowerCase())) {
      return false;
    }

    if (filtroPerfil && u.perfil !== filtroPerfil) return false;
    if (filtroStatus && u.status !== filtroStatus) return false;

    return true;
  });

  // Estatísticas
  const stats = {
    total: usuarios.length,
    ativos: usuarios.filter(u => u.status === 'ATIVO').length,
    bloqueados: usuarios.filter(u => u.status === 'BLOQUEADO').length,
    semAcesso: usuarios.filter(u => u.perfil === 'SEM_ACESSO').length,
  };

  const handleEditarAcesso = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalEditarOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Usuários e Permissões</h1>
          <p className="text-muted-foreground">
            Gestão de acesso ao sistema - Apenas Diretoria e Gestor ADM
          </p>
        </div>
        <Button variant="outline" onClick={() => setModalMatrizOpen(true)}>
          <Info className="mr-2 h-4 w-4" />
          Ver Matriz de Permissões
        </Button>
      </div>

      {/* Alerta de Permissão */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Área Restrita:</strong> Apenas usuários com perfil <strong>Diretoria (N1)</strong> ou{' '}
          <strong>Gestor ADM (N2)</strong> podem acessar esta tela e gerenciar permissões.
        </AlertDescription>
      </Alert>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total de Usuários</p>
              <User className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-2xl">{stats.total}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              cadastrados no sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Usuários Ativos</p>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-2xl text-green-600">{stats.ativos}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              com acesso liberado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Bloqueados</p>
              <Lock className="h-4 w-4 text-red-600" />
            </div>
            <h3 className="text-2xl text-red-600">{stats.bloqueados}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              acesso temporariamente suspenso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Sem Acesso</p>
              <XCircle className="h-4 w-4 text-neutral-600" />
            </div>
            <h3 className="text-2xl text-neutral-600">{stats.semAcesso}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              colaboradores de obra
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros e Tabela */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Usuários do Sistema ({usuariosFiltrados.length})</CardTitle>
            <div className="flex items-center gap-4">
              {/* Filtro de Perfil */}
              <div className="w-56">
                <Select value={filtroPerfil} onValueChange={setFiltroPerfil}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por perfil..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DIRETORIA">Diretoria</SelectItem>
                    <SelectItem value="GESTOR_ADM">Gestor ADM</SelectItem>
                    <SelectItem value="GESTOR_TECNICO">Gestor Técnico</SelectItem>
                    <SelectItem value="OPERACIONAL">Operacional</SelectItem>
                    <SelectItem value="SEM_ACESSO">Sem Acesso</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtro de Status */}
              <div className="w-48">
                <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ATIVO">Ativo</SelectItem>
                    <SelectItem value="BLOQUEADO">Bloqueado</SelectItem>
                    <SelectItem value="INATIVO">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Busca */}
              <div className="relative w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome ou e-mail..."
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
                <TableHead>Colaborador</TableHead>
                <TableHead>E-mail de Login</TableHead>
                <TableHead>Perfil de Acesso</TableHead>
                <TableHead>Último Acesso</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {usuariosFiltrados.map((usuario) => (
                <TableRow 
                  key={usuario.id}
                  className={cn(
                    "hover:bg-neutral-50",
                    usuario.perfil === 'SEM_ACESSO' && "opacity-60"
                  )}
                >
                  <TableCell>
                    <div>
                      <p className="font-medium">{usuario.nome}</p>
                      <p className="text-xs text-muted-foreground">{usuario.cargo}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {usuario.email ? (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{usuario.email}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Lock className="h-4 w-4" />
                        <span className="text-sm">Sem login</span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    {getPerfilBadge(usuario.perfil)}
                  </TableCell>
                  <TableCell>
                    {usuario.ultimoAcesso ? (
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {formatDate(usuario.ultimoAcesso)}
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(usuario.status)}
                  </TableCell>
                  <TableCell className="text-center">
                    {usuario.perfil !== 'SEM_ACESSO' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditarAcesso(usuario)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {usuariosFiltrados.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                Nenhum usuário encontrado com os filtros aplicados.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal Editar Acesso */}
      <ModalEditarAcesso
        open={modalEditarOpen}
        onClose={() => {
          setModalEditarOpen(false);
          setUsuarioSelecionado(null);
        }}
        usuario={usuarioSelecionado}
      />

      {/* Modal Matriz de Permissões */}
      <ModalMatrizPermissoes
        open={modalMatrizOpen}
        onClose={() => setModalMatrizOpen(false)}
      />
    </div>
  );
}

// Modal Editar Acesso
interface ModalEditarAcessoProps {
  open: boolean;
  onClose: () => void;
  usuario: Usuario | null;
}

function ModalEditarAcesso({ open, onClose, usuario }: ModalEditarAcessoProps) {
  const [perfil, setPerfil] = useState<PerfilAcesso>('OPERACIONAL');
  const [bloqueado, setBloqueado] = useState(false);

  React.useEffect(() => {
    if (usuario) {
      setPerfil(usuario.perfil);
      setBloqueado(usuario.status === 'BLOQUEADO');
    }
  }, [usuario]);

  const handleSalvar = () => {
    console.log('Salvar alterações:', { usuarioId: usuario?.id, perfil, bloqueado });
    toast.success('Permissões atualizadas com sucesso!');
    onClose();
  };

  const handleRedefinirSenha = () => {
    toast.success(`E-mail de redefinição enviado para ${usuario?.email}`);
  };

  if (!usuario) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Gerenciamento de Acesso
          </DialogTitle>
          <DialogDescription>
            Editando permissões de <strong>{usuario.nome}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Informações do Usuário */}
          <div className="p-4 bg-neutral-50 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Nome</p>
                <p className="font-medium">{usuario.nome}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cargo</p>
                <p className="font-medium">{usuario.cargo}</p>
              </div>
              <div>
                <p className="text-muted-foreground">E-mail</p>
                <p className="font-medium">{usuario.email}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Último Acesso</p>
                <p className="font-medium">
                  {usuario.ultimoAcesso ? new Date(usuario.ultimoAcesso).toLocaleString('pt-BR') : '-'}
                </p>
              </div>
            </div>
          </div>

          {/* Alterar Perfil */}
          <div className="space-y-2">
            <Label>Perfil de Acesso</Label>
            <Select value={perfil} onValueChange={(value) => setPerfil(value as PerfilAcesso)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DIRETORIA">🛡️ Diretoria (Nível 1) - Acesso Total</SelectItem>
                <SelectItem value="GESTOR_ADM">🛡️ Gestor ADM (Nível 2) - Administrativo/Financeiro</SelectItem>
                <SelectItem value="GESTOR_TECNICO">🛡️ Gestor Técnico (Nível 3) - Obras/Assessoria</SelectItem>
                <SelectItem value="OPERACIONAL">👤 Operacional (Nível 4) - Execução Limitada</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Consulte a Matriz de Permissões para entender o que cada nível pode acessar
            </p>
          </div>

          {/* Redefinir Senha */}
          <div className="space-y-2">
            <Label>Gerenciamento de Senha</Label>
            <Button variant="outline" className="w-full" onClick={handleRedefinirSenha}>
              <Mail className="mr-2 h-4 w-4" />
              Enviar E-mail de Redefinição de Senha
            </Button>
          </div>

          {/* Bloqueio Temporário */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Lock className="h-5 w-5 text-red-600" />
              <div>
                <p className="font-medium">Bloquear Acesso Temporário</p>
                <p className="text-sm text-muted-foreground">
                  O usuário não poderá fazer login enquanto estiver bloqueado
                </p>
              </div>
            </div>
            <Switch
              checked={bloqueado}
              onCheckedChange={setBloqueado}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal Matriz de Permissões
interface ModalMatrizPermissoesProps {
  open: boolean;
  onClose: () => void;
}

function ModalMatrizPermissoes({ open, onClose }: ModalMatrizPermissoesProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Matriz de Permissões do Sistema
          </DialogTitle>
          <DialogDescription>
            Resumo fixo de permissões e restrições por nível de acesso
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {matrizPermissoes.map((matriz) => (
            <Card key={matriz.perfil} className="border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold",
                      matriz.nivel === 1 && "bg-purple-100 text-purple-800",
                      matriz.nivel === 2 && "bg-blue-100 text-blue-800",
                      matriz.nivel === 3 && "bg-green-100 text-green-800",
                      matriz.nivel === 4 && "bg-amber-100 text-amber-800",
                      matriz.nivel === 5 && "bg-neutral-100 text-neutral-800"
                    )}>
                      N{matriz.nivel}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {matriz.perfil.replace('_', ' ')}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {matriz.descricao}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {matriz.permissoes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      Permissões
                    </p>
                    <ul className="space-y-1">
                      {matriz.permissoes.map((perm, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>{perm}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matriz.restricoes.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-600" />
                      Restrições
                    </p>
                    <ul className="space-y-1">
                      {matriz.restricoes.map((rest, idx) => (
                        <li key={idx} className="text-sm flex items-start gap-2">
                          <span className="text-red-600 mt-1">✗</span>
                          <span>{rest}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {matriz.perfil === 'SEM_ACESSO' && (
                  <Alert>
                    <Lock className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      Colaboradores de obra (Pedreiro, Servente, etc.) não possuem acesso ao sistema web.
                      Seu registro é feito apenas via Controle de Presença Diária pelo gestor.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}