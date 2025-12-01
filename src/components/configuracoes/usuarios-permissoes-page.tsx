import { logger } from '@/lib/utils/logger';
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
import { RoleLevel, ROLE_LABELS, PERMISSOES_POR_ROLE } from '../../lib/types';

type StatusUsuario = 'ativo' | 'bloqueado' | 'inativo';

interface Usuario {
  id: string;
  nome: string;
  cargo: string;
  funcao: string;
  email: string;
  perfil: RoleLevel;
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
    funcao: 'diretoria',
    email: 'roberto.minerva@minervaeng.com.br',
    perfil: 'diretoria',
    status: 'ativo',
    ultimoAcesso: '2024-11-17 14:30',
    dataCriacao: '2024-01-01',
  },
  {
    id: 'usr-2',
    nome: 'Ana Costa',
    cargo: 'Gerente Administrativo',
    funcao: 'gestor_administrativo',
    email: 'ana.costa@minervaeng.com.br',
    perfil: 'gestor_administrativo',
    status: 'ativo',
    ultimoAcesso: '2024-11-17 09:15',
    dataCriacao: '2024-01-01',
  },
  {
    id: 'usr-3',
    nome: 'Maria Santos',
    cargo: 'Engenheira Civil',
    funcao: 'gestor_obras',
    email: 'maria.santos@minervaeng.com.br',
    perfil: 'gestor_obras',
    status: 'ativo',
    ultimoAcesso: '2024-11-16 18:45',
    dataCriacao: '2024-02-01',
  },
  {
    id: 'usr-4',
    nome: 'Pedro Oliveira',
    cargo: 'Auxiliar Administrativo',
    funcao: 'colaborador',
    email: 'pedro.oliveira@minervaeng.com.br',
    perfil: 'colaborador',
    status: 'ativo',
    ultimoAcesso: '2024-11-17 10:20',
    dataCriacao: '2024-03-01',
  },
  {
    id: 'usr-5',
    nome: 'João Silva',
    cargo: 'Pedreiro',
    funcao: 'mao_de_obra',
    email: '',
    perfil: 'mao_de_obra',
    status: 'inativo',
    dataCriacao: '2024-04-01',
  },
  {
    id: 'usr-6',
    nome: 'Carlos Mendes',
    cargo: 'Servente',
    funcao: 'mao_de_obra',
    email: '',
    perfil: 'mao_de_obra',
    status: 'inativo',
    dataCriacao: '2024-04-01',
  },
  {
    id: 'usr-7',
    nome: 'Beatriz Lima',
    cargo: 'Arquiteta',
    funcao: 'gestor_assessoria',
    email: 'beatriz.lima@minervaeng.com.br',
    perfil: 'gestor_assessoria',
    status: 'bloqueado',
    ultimoAcesso: '2024-10-15 16:30',
    dataCriacao: '2024-05-01',
  },
];

// Usar matriz de permissões do sistema
const matrizPermissoes = Object.entries(PERMISSOES_POR_ROLE).map(([role, perms]) => ({
  perfil: role as RoleLevel,
  ...perms,
}));

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

  const getPerfilBadge = (perfil: RoleLevel) => {
    const perms = PERMISSOES_POR_ROLE[perfil];
    const config: Record<RoleLevel, { className: string; icon: typeof Shield }> = {
      admin: { className: 'bg-secondary/10 text-secondary', icon: Shield },
      diretoria: { className: 'bg-secondary/10 text-secondary', icon: Shield },
      gestor_administrativo: { className: 'bg-primary/10 text-primary', icon: Shield },
      gestor_obras: { className: 'bg-success/10 text-success', icon: Shield },
      gestor_assessoria: { className: 'bg-teal-100 text-teal-800', icon: Shield },
      colaborador: { className: 'bg-warning/10 text-warning', icon: User },
      mao_de_obra: { className: 'bg-muted text-foreground', icon: Lock },
    };

    const { className, icon: Icon } = config[perfil];
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {ROLE_LABELS[perfil]} (N{perms.nivel})
      </Badge>
    );
  };

  const getStatusBadge = (status: StatusUsuario) => {
    const config: Record<StatusUsuario, { label: string; icon: typeof CheckCircle; className: string }> = {
      ativo: { label: 'Ativo', icon: CheckCircle, className: 'bg-success/10 text-success' },
      bloqueado: { label: 'Bloqueado', icon: Lock, className: 'bg-destructive/10 text-destructive' },
      inativo: { label: 'Inativo', icon: XCircle, className: 'bg-muted text-foreground' },
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
    ativos: usuarios.filter(u => u.status === 'ativo').length,
    bloqueados: usuarios.filter(u => u.status === 'bloqueado').length,
    semAcesso: usuarios.filter(u => u.perfil === 'mao_de_obra').length,
  };

  const handleEditarAcesso = (usuario: Usuario) => {
    setUsuarioSelecionado(usuario);
    setModalEditarOpen(true);
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
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
              <CheckCircle className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-2xl text-success">{stats.ativos}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              com acesso liberado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Bloqueados</p>
              <Lock className="h-4 w-4 text-destructive" />
            </div>
            <h3 className="text-2xl text-destructive">{stats.bloqueados}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              acesso temporariamente suspenso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Sem Acesso</p>
              <XCircle className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="text-2xl text-muted-foreground">{stats.semAcesso}</h3>
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
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="diretoria">Diretoria</SelectItem>
                    <SelectItem value="gestor_administrativo">Gestor Administrativo</SelectItem>
                    <SelectItem value="gestor_obras">Gestor Obras</SelectItem>
                    <SelectItem value="gestor_assessoria">Gestor Assessoria</SelectItem>
                    <SelectItem value="colaborador">Colaborador</SelectItem>
                    <SelectItem value="mao_de_obra">Mão de Obra</SelectItem>
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
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
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
                    "hover:bg-background",
                    usuario.perfil === 'mao_de_obra' && "opacity-60"
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
                    {usuario.perfil !== 'mao_de_obra' && (
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
  const [perfil, setPerfil] = useState<RoleLevel>('colaborador');
  const [bloqueado, setBloqueado] = useState(false);

  React.useEffect(() => {
    if (usuario) {
      setPerfil(usuario.perfil);
      setBloqueado(usuario.status === 'bloqueado');
    }
  }, [usuario]);

  const handleSalvar = () => {
    logger.log('Salvar alterações:', { usuarioId: usuario?.id, perfil, bloqueado });
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
          <div className="p-4 bg-background rounded-lg">
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
            <Select value={perfil} onValueChange={(value) => setPerfil(value as RoleLevel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">🛡️ Admin (Nível 10) - Acesso Total Sistema</SelectItem>
                <SelectItem value="diretoria">🛡️ Diretoria (Nível 9) - Acesso Total</SelectItem>
                <SelectItem value="gestor_administrativo">🛡️ Gestor Administrativo (Nível 5) - Adm/Financeiro</SelectItem>
                <SelectItem value="gestor_obras">🛡️ Gestor Obras (Nível 5) - Obras</SelectItem>
                <SelectItem value="gestor_assessoria">🛡️ Gestor Assessoria (Nível 5) - Assessoria</SelectItem>
                <SelectItem value="colaborador">👤 Colaborador (Nível 1) - Execução Limitada</SelectItem>
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
              <Lock className="h-5 w-5 text-destructive" />
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
                      matriz.nivel === 10 && "bg-secondary/10 text-secondary",
                      matriz.nivel === 9 && "bg-secondary/10 text-secondary",
                      matriz.nivel === 5 && "bg-primary/10 text-primary",
                      matriz.nivel === 1 && "bg-warning/10 text-warning",
                      matriz.nivel === 0 && "bg-muted text-foreground"
                    )}>
                      N{matriz.nivel}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {ROLE_LABELS[matriz.perfil]}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {matriz.descricao}
                      </p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-success" />
                    Permissões
                  </p>
                  <ul className="space-y-1">
                    {matriz.pode_ver_todas_os && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Visualizar todas as OSs</span>
                      </li>
                    )}
                    {matriz.pode_acessar_financeiro && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Acessar módulo financeiro</span>
                      </li>
                    )}
                    {matriz.pode_delegar && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Delegar tarefas</span>
                      </li>
                    )}
                    {matriz.pode_aprovar && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Aprovar etapas de workflow</span>
                      </li>
                    )}
                    {matriz.pode_gerenciar_usuarios && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Gerenciar usuários e permissões</span>
                      </li>
                    )}
                    {matriz.pode_criar_os && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Criar ordens de serviço</span>
                      </li>
                    )}
                    {matriz.pode_cancelar_os && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Cancelar ordens de serviço</span>
                      </li>
                    )}
                    {matriz.setores_visiveis === 'todos' && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Visualizar todos os setores</span>
                      </li>
                    )}
                    {Array.isArray(matriz.setores_visiveis) && matriz.setores_visiveis.length > 0 && (
                      <li className="text-sm flex items-start gap-2">
                        <span className="text-success mt-1">✓</span>
                        <span>Visualizar setores: {matriz.setores_visiveis.join(', ')}</span>
                      </li>
                    )}
                  </ul>
                </div>

                {matriz.perfil === 'mao_de_obra' && (
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