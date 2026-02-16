/**
 * ClienteDetalhesPage - Página de Detalhes do Cliente
 *
 * Exibe informações completas do cliente com abas de navegação:
 * - Visão Geral: Dados cadastrais e contato
 * - Contratos: Lista de contratos vinculados
 * - Histórico de OS: Ordens de serviço do cliente
 * - Financeiro: Resumo financeiro e faturas
 *
 * @example
 * ```tsx
 * <ClienteDetalhesPage clienteId="uuid" onBack={() => navigate(-1)} />
 * ```
 */

import { useState, useEffect } from 'react';
import { useRouter } from '@tanstack/react-router';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogFooter } from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
import { cn } from '@/lib/utils';
import {
  FileText,
  DollarSign,
  Eye,
  AlertTriangle,
  Upload,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  ClipboardList,
  FolderOpen,
  Mail,
  Send,
  Loader2,
  Pencil,
  Save,
  User,
  Phone,
  MapPin,
  UserMinus,
  UserCheck,
  MoreHorizontal,
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

// Hooks
import { useClienteHistorico } from '@/lib/hooks/use-cliente-historico';
import { useClienteContratos, formatCurrency } from '@/lib/hooks/use-cliente-contratos';

// Services
import { ClientInviteService, InviteStatus } from '@/lib/services/client-invite-service';

// Tab Components
import {
  ClienteTabVisaoGeral,
  ClienteTabContratos,
  ClienteTabHistoricoOS,
  ClienteTabFinanceiro,
  ClienteTabDocumentos,
} from './tabs';
import { SendMessageModal } from '@/components/shared/send-message-modal';

// ===========================================
// HELPERS
// ===========================================

type ClienteStatus = 'ativo' | 'inativo' | 'lead' | 'blacklist';

const renderStatusBadge = (status: ClienteStatus) => {
  switch (status) {
    case 'ativo':
      return (
        <Badge className="bg-success/10 text-success hover:bg-success/10 border-0">
          <CheckCircle className="h-3 w-3 mr-1" />
          Ativo
        </Badge>
      );
    case 'inativo':
      return <Badge variant="secondary">Inativo</Badge>;
    case 'lead':
      return <Badge variant="default">Lead</Badge>;
    case 'blacklist':
      return (
        <Badge variant="destructive">
          <AlertTriangle className="h-3 w-3 mr-1" />
          Blacklist
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

// ===========================================
// COMPONENT
// ===========================================

interface ClienteDetalhesPageProps {
  clienteId: string;
  onBack: () => void;
  onVisualizarPortal?: () => void;
}

export function ClienteDetalhesPage({ clienteId, onBack, onVisualizarPortal }: ClienteDetalhesPageProps) {
  // Hooks para dados reais do Supabase
  const { cliente, ordensServico, isLoading: isLoadingCliente, error: errorCliente } = useClienteHistorico(clienteId);
  const { contratos, summary: contratosSummary } = useClienteContratos(clienteId);

  // Estado do modal de inativação
  const [modalInativarOpen, setModalInativarOpen] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [termoEntrega, setTermoEntrega] = useState<File | null>(null);

  // Contrato principal (primeiro ativo)
  const contratoPrincipal = contratos.find(c => c.status === 'ativo');

  // Estado do convite de acesso ao portal
  const [modalConviteOpen, setModalConviteOpen] = useState(false);
  const [inviteStatus, setInviteStatus] = useState<InviteStatus | null>(null);
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);
  const [isSendingInvite, setIsSendingInvite] = useState(false);

  // Estado do modal de edição
  const [modalEditarOpen, setModalEditarOpen] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editFormData, setEditFormData] = useState({
    nome_razao_social: '',
    cpf_cnpj: '',
    email: '',
    telefone: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  // Estado do modal de status (Ativar/Desativar)
  const [modalStatusOpen, setModalStatusOpen] = useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  // Estado do modal de toggle de acesso ao portal
  const [modalToggleAcessoOpen, setModalToggleAcessoOpen] = useState(false);
  const [isTogglingPortalAccess, setIsTogglingPortalAccess] = useState(false);

  // Send Message Modal
  const [showSendMessageModal, setShowSendMessageModal] = useState(false);

  // Preencher form de edição quando cliente carregar
  useEffect(() => {
    if (cliente) {
      const endereco = cliente.endereco || {};
      setEditFormData({
        nome_razao_social: cliente.nome_razao_social || '',
        cpf_cnpj: cliente.cpf_cnpj || '',
        email: cliente.email || '',
        telefone: cliente.telefone || '',
        cep: endereco.cep || '',
        logradouro: endereco.logradouro || '',
        numero: endereco.numero || '',
        complemento: endereco.complemento || '',
        bairro: endereco.bairro || '',
        cidade: endereco.cidade || '',
        estado: endereco.estado || '',
      });
    }
  }, [cliente]);

  // Verificar status do convite ao carregar
  useEffect(() => {
    if (clienteId) {
      setIsLoadingInvite(true);
      ClientInviteService.checkStatus(clienteId)
        .then(status => setInviteStatus(status))
        .finally(() => setIsLoadingInvite(false));
    }
  }, [clienteId]);

  // Handlers
  const router = useRouter();

  const handleVisualizarPortal = () => {
    if (onVisualizarPortal) {
      onVisualizarPortal();
    } else {
      // Navegar para a página de preview do portal
      router.navigate({ to: `/contatos/portal-preview/${clienteId}` });
    }
  };

  const handleInativar = () => {
    // Validações
    if (contratoPrincipal?.tipo === 'parceiro' && !termoEntrega) {
      toast.error('Anexe o Termo de Entrega de Obra');
      return;
    }

    if (contratoPrincipal?.tipo === 'recorrente' && !justificativa.trim()) {
      toast.error('Preencha a justificativa de inativação');
      return;
    }

    logger.log('Inativar cliente:', {
      clienteId,
      tipo: contratoPrincipal?.tipo,
      justificativa,
      termoEntrega: termoEntrega?.name,
    });

    toast.success('Contrato inativado com sucesso!');
    setModalInativarOpen(false);
  };

  // Handler para enviar convite de acesso
  const handleSendInvite = async () => {
    if (!cliente?.email) {
      toast.error('Cliente não possui e-mail cadastrado');
      return;
    }

    setIsSendingInvite(true);
    try {
      const result = await ClientInviteService.sendInvite({
        clienteId,
        email: cliente.email,
        nomeCliente: cliente.nome_razao_social
      });

      if (result.success) {
        toast.success('Convite enviado com sucesso!');
        setModalConviteOpen(false);
        // Atualizar status
        const newStatus = await ClientInviteService.checkStatus(clienteId);
        setInviteStatus(newStatus);
      } else {
        toast.error(result.error || 'Erro ao enviar convite');
      }
    } catch (err) {
      logger.error('Erro ao enviar convite:', err);
      toast.error('Erro inesperado ao enviar convite');
    } finally {
      setIsSendingInvite(false);
    }
  };

  // Handler para salvar edição do cliente
  const handleSalvarEdicao = async () => {
    setIsSavingEdit(true);
    try {
      // TODO: Implementar chamada ao Supabase para atualizar cliente
      logger.log('Salvar edição do cliente:', editFormData);
      toast.success('Cliente atualizado com sucesso!');
      setModalEditarOpen(false);
    } catch (err) {
      logger.error('Erro ao salvar edição:', err);
      toast.error('Erro ao salvar alterações');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Handler para toggle de status do cliente
  const handleToggleStatus = async () => {
    setIsTogglingStatus(true);
    try {
      const novoStatus = cliente?.status === 'ativo' ? 'inativo' : 'ativo';
      // TODO: Implementar chamada ao Supabase para atualizar status
      logger.log('Toggle status do cliente:', { clienteId, novoStatus });
      toast.success(`Cliente ${novoStatus === 'ativo' ? 'ativado' : 'desativado'} com sucesso!`);
      setModalStatusOpen(false);
    } catch (err) {
      logger.error('Erro ao alterar status:', err);
      toast.error('Erro ao alterar status do cliente');
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // Handler para toggle de acesso ao portal do cliente
  const handleTogglePortalAccess = async () => {
    if (!inviteStatus) return;

    setIsTogglingPortalAccess(true);
    try {
      const novoAcesso = !inviteStatus.portalAtivo;
      const result = await ClientInviteService.togglePortalAccess(clienteId, novoAcesso);

      if (result.success) {
        toast.success(`Acesso ao portal ${novoAcesso ? 'ativado' : 'desativado'} com sucesso!`);
        // Atualizar status localmente
        setInviteStatus(prev => prev ? { ...prev, portalAtivo: novoAcesso } : null);
        setModalToggleAcessoOpen(false);
      } else {
        toast.error(result.error || 'Erro ao alterar acesso ao portal');
      }
    } catch (err) {
      logger.error('Erro ao toggle acesso portal:', err);
      toast.error('Erro ao alterar acesso ao portal');
    } finally {
      setIsTogglingPortalAccess(false);
    }
  };

  // Loading state
  if (isLoadingCliente) {
    return <PageLoading onBack={onBack} />;
  }

  // Error state
  if (errorCliente || !cliente) {
    return (
      <div className="p-6">
        <Button variant="outline" size="icon" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar dados do cliente. {errorCliente?.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Avatar initials helper
  const getInitials = (name: string) => {
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    return parts[0]?.[0]?.toUpperCase() || '?';
  };

  return (
    <div className="bg-muted pb-6">
      {/* Header Bar — Padrão OS Details */}
      <div className="bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back */}
            <Button variant="ghost" size="sm" className="gap-2" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
              Voltar
            </Button>

            {/* Center: Avatar + Name */}
            <div className="text-center flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <span className="text-sm font-bold text-primary">
                  {getInitials(cliente.nome_razao_social)}
                </span>
              </div>
              <h1 className="text-2xl font-bold text-neutral-900">{cliente.nome_razao_social}</h1>
              <div className="flex items-center gap-2 text-sm text-neutral-600">
                {cliente.cpf_cnpj && <span className="font-mono text-xs">{cliente.cpf_cnpj}</span>}
                {cliente.cpf_cnpj && <span>•</span>}
                <span>Cliente desde {formatDate(cliente.created_at)}</span>
              </div>
            </div>

            {/* Right: Status + Actions */}
            <div className="flex items-center gap-2">
              {renderStatusBadge(cliente.status as ClienteStatus)}

              <Button variant="outline" size="sm" onClick={() => setModalEditarOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                Editar
              </Button>

              {/* Dropdown: Mais Ações */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {(cliente.email || cliente.telefone) && (
                    <DropdownMenuItem onClick={() => setShowSendMessageModal(true)}>
                      <Send className="mr-2 h-4 w-4" />
                      Enviar Mensagem
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={handleVisualizarPortal}>
                    <Eye className="mr-2 h-4 w-4" />
                    Visualizar como Cliente
                  </DropdownMenuItem>

                  {cliente.email && (
                    <DropdownMenuItem
                      onClick={() => {
                        if (inviteStatus?.inviteAccepted) {
                          setModalToggleAcessoOpen(true);
                        } else {
                          setModalConviteOpen(true);
                        }
                      }}
                      disabled={isLoadingInvite}
                    >
                      {inviteStatus?.inviteAccepted && inviteStatus?.portalAtivo ? (
                        <CheckCircle className="mr-2 h-4 w-4 text-success" />
                      ) : inviteStatus?.inviteAccepted && !inviteStatus?.portalAtivo ? (
                        <AlertCircle className="mr-2 h-4 w-4 text-destructive" />
                      ) : (
                        <Mail className="mr-2 h-4 w-4" />
                      )}
                      {inviteStatus?.inviteAccepted
                        ? inviteStatus?.portalAtivo ? 'Acesso Ativo' : 'Acesso Desativado'
                        : inviteStatus?.hasInvite ? 'Reenviar Convite' : 'Enviar Convite de Acesso'}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    onClick={() => setModalStatusOpen(true)}
                    variant={cliente.status === 'ativo' ? 'destructive' : 'default'}
                  >
                    {cliente.status === 'ativo' ? (
                      <><UserMinus className="mr-2 h-4 w-4" /> Desativar Cliente</>
                    ) : (
                      <><UserCheck className="mr-2 h-4 w-4" /> Ativar Cliente</>
                    )}
                  </DropdownMenuItem>

                  {cliente.status === 'ativo' && contratosSummary.contratosAtivos > 0 && (
                    <DropdownMenuItem
                      onClick={() => setModalInativarOpen(true)}
                      variant="destructive"
                    >
                      <AlertTriangle className="mr-2 h-4 w-4" />
                      Inativar Contrato
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-6">
        <Tabs defaultValue="visao-geral" className="space-y-6">
          {/* Tab Navigation — Pill Style (Padrão OS Details) */}
          <TabsList className="w-full h-auto p-1 bg-muted rounded-xl">
            <TabsTrigger value="visao-geral" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
              <FileText className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Visão Geral</span>
              <span className="sm:hidden truncate">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="contratos" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
              <ClipboardList className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Contratos ({contratosSummary.contratosAtivos})</span>
              <span className="sm:hidden truncate">Contratos ({contratosSummary.contratosAtivos})</span>
            </TabsTrigger>
            <TabsTrigger value="historico-os" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
              <ClipboardList className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Histórico OS ({ordensServico.length})</span>
              <span className="sm:hidden truncate">OS ({ordensServico.length})</span>
            </TabsTrigger>
            <TabsTrigger value="financeiro" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
              <DollarSign className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Financeiro</span>
              <span className="sm:hidden truncate">Financ.</span>
            </TabsTrigger>
            <TabsTrigger value="documentos" className="flex items-center gap-2 px-3 py-2 text-sm font-medium data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm flex-1 min-w-0">
              <FolderOpen className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Documentos</span>
              <span className="sm:hidden truncate">Docs</span>
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab — Grid 2:1 (Padrão OS Details) */}
          <TabsContent value="visao-geral" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Detalhes (span 2) */}
              <Card className="border-border rounded-lg shadow-sm h-full flex flex-col lg:col-span-2">
                <CardContent className="space-y-6 pt-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Contato Section */}
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Contato</span>
                      </div>
                      <p className="text-lg font-medium text-foreground">{cliente.nome_razao_social}</p>
                      <div className="mt-2 flex flex-col gap-1 text-sm text-muted-foreground">
                        {cliente.email && (
                          <span className="flex items-center gap-2">
                            <Mail className="w-3.5 h-3.5" />
                            {cliente.email}
                          </span>
                        )}
                        {cliente.telefone && (
                          <span className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5" />
                            {cliente.telefone}
                          </span>
                        )}
                      </div>
                      {(cliente.email || cliente.telefone) && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-3 w-full"
                          onClick={() => setShowSendMessageModal(true)}
                        >
                          <Mail className="w-4 h-4 mr-2" />
                          Enviar Mensagem
                        </Button>
                      )}
                    </div>

                    {/* Endereço Section */}
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4" />
                        <span className="font-medium">Endereço</span>
                      </div>
                      {cliente.endereco?.logradouro ? (
                        <div className="text-sm text-foreground">
                          <p className="font-medium">
                            {cliente.endereco.logradouro}
                            {cliente.endereco.numero ? `, ${cliente.endereco.numero}` : ''}
                          </p>
                          <p className="text-muted-foreground">
                            {cliente.endereco.bairro || ''}
                            {cliente.endereco.cidade ? ` - ${cliente.endereco.cidade}` : ''}
                            {cliente.endereco.estado ? `/${cliente.endereco.estado}` : ''}
                          </p>
                          {cliente.endereco.cep && (
                            <p className="text-xs text-muted-foreground mt-1">CEP: {cliente.endereco.cep}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">Endereço não informado</p>
                      )}
                    </div>
                  </div>

                  {/* Grid: CPF/CNPJ + Data Cadastro + Tipo */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">CPF/CNPJ</span>
                      </div>
                      <p className="text-sm font-medium text-foreground font-mono">
                        {cliente.cpf_cnpj || '-'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <User className="w-4 h-4" />
                        <span className="font-medium">Tipo</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {cliente.tipo_cliente === 'PESSOA_JURIDICA' ? 'Pessoa Jurídica' : 'Pessoa Física'}
                      </p>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">Cadastro</span>
                      </div>
                      <p className="text-sm font-medium text-foreground">
                        {formatDate(cliente.created_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Right Column: Resumo (span 1) */}
              <div className="space-y-4 lg:col-span-1">
                {/* Resumo Financeiro */}
                <Card className="border-border rounded-lg shadow-sm">
                  <CardContent className="pt-6 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center hover:bg-muted/50 transition-colors">
                        <p className="text-2xl font-bold text-foreground mb-0.5">{contratosSummary.contratosAtivos}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Contratos</p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/30 border border-border/50 text-center hover:bg-muted/50 transition-colors">
                        <p className="text-2xl font-bold text-foreground mb-0.5">{ordensServico.length}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">OS Total</p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-success/5 border border-success/20">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Receita Mensal</p>
                      <p className="text-xl font-bold text-success">{formatCurrency(contratosSummary.valorRecorrenteMensal)}</p>
                    </div>

                    <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-1">Valor Total Contratos</p>
                      <p className="text-xl font-bold text-primary">{formatCurrency(contratosSummary.valorTotalContratos)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {contratoPrincipal ? `Principal: ${contratoPrincipal.tipo}` : 'Nenhum contrato ativo'}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Visão Geral Tab Content (below grid) */}
            <ClienteTabVisaoGeral cliente={cliente} isLoading={isLoadingCliente} />
          </TabsContent>

          <TabsContent value="contratos" className="space-y-6">
            <ClienteTabContratos clienteId={clienteId} />
          </TabsContent>

          <TabsContent value="historico-os" className="space-y-6">
            <ClienteTabHistoricoOS ordensServico={ordensServico} isLoading={isLoadingCliente} />
          </TabsContent>

          <TabsContent value="financeiro" className="space-y-6">
            <ClienteTabFinanceiro clienteId={clienteId} />
          </TabsContent>

          <TabsContent value="documentos" className="space-y-6">
            <ClienteTabDocumentos clienteId={clienteId} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal de Inativação de Contrato - Modernizado */}
      <Dialog open={modalInativarOpen} onOpenChange={setModalInativarOpen}>
        <DialogContent className="max-w-lg p-0">
          <ModalHeaderPadrao
            title="Inativar Contrato"
            description={`Você está prestes a inativar o contrato de ${cliente.nome_razao_social}.`}
            icon={AlertTriangle}
            theme="error"
          />

          <div className="p-6 space-y-4">
            {/* Alert de aviso */}
            <Alert variant="destructive" className="bg-destructive/5">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Esta ação não pode ser desfeita.
              </AlertDescription>
            </Alert>

            {/* Seção: Documentação */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <FileText className="h-4 w-4 text-destructive" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Documentação</h3>
                  <p className="text-xs text-muted-foreground">
                    {contratoPrincipal?.tipo === 'parceiro' || contratoPrincipal?.tipo === 'obra'
                      ? 'Anexe o Termo de Entrega'
                      : 'Informe a justificativa'}
                  </p>
                </div>
              </div>

              {contratoPrincipal?.tipo === 'parceiro' || contratoPrincipal?.tipo === 'obra' ? (
                <div className="space-y-2">
                  <div className="border-2 border-dashed rounded-xl p-6 text-center hover:bg-muted/50 transition-colors">
                    {termoEntrega ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <FileText className="h-6 w-6 text-primary" />
                          <span className="text-sm">{termoEntrega.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTermoEntrega(null)}
                        >
                          Remover
                        </Button>
                      </div>
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          className="hidden"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => setTermoEntrega(e.target.files?.[0] || null)}
                        />
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                          Clique para anexar o Termo de Entrega
                        </p>
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Para contratos de obra, é obrigatório anexar o Termo de Entrega assinado.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Textarea
                    placeholder="Descreva o motivo da inativação do contrato..."
                    rows={4}
                    value={justificativa}
                    onChange={(e) => setJustificativa(e.target.value)}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    É obrigatório informar o motivo da inativação.
                  </p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={() => setModalInativarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleInativar}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Confirmar Inativação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Convite de Acesso - Modernizado */}
      <Dialog open={modalConviteOpen} onOpenChange={setModalConviteOpen}>
        <DialogContent className="max-w-md p-0">
          <ModalHeaderPadrao
            title="Enviar Convite de Acesso"
            description={`Enviar convite para ${cliente.nome_razao_social} acessar o Portal do Cliente.`}
            icon={Mail}
            theme="info"
          />

          <div className="p-6 space-y-4">
            {/* Seção: Informações do Convite */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-info/10 flex items-center justify-center">
                  <Send className="h-4 w-4 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Detalhes do Envio</h3>
                  <p className="text-xs text-muted-foreground">Informações sobre o convite</p>
                </div>
              </div>

              <Alert className="bg-info/5 border-info/20">
                <AlertCircle className="h-4 w-4 text-info" />
                <AlertDescription>
                  Um e-mail será enviado para <strong>{cliente.email}</strong> com um link seguro para o cliente criar sua própria senha e acessar o portal.
                </AlertDescription>
              </Alert>

              {inviteStatus?.hasInvite && !inviteStatus.inviteAccepted && (
                <Alert variant="destructive" className="bg-warning/5 border-warning/20">
                  <AlertCircle className="h-4 w-4 text-warning" />
                  <AlertDescription>
                    Um convite já foi enviado anteriormente. Deseja reenviar?
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={() => setModalConviteOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendInvite} disabled={isSendingInvite}>
              {isSendingInvite ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  {inviteStatus?.hasInvite ? 'Reenviar Convite' : 'Enviar Convite'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Editar Cliente - NOVO */}
      <Dialog open={modalEditarOpen} onOpenChange={setModalEditarOpen}>
        <DialogContent className="max-w-2xl p-0 max-h-[90vh] overflow-y-auto">
          <ModalHeaderPadrao
            title="Editar Cliente"
            description={`Atualize as informações de ${cliente.nome_razao_social}`}
            icon={Pencil}
            theme="create"
          />

          <div className="p-6 space-y-6">
            {/* Seção: Identificação */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Identificação</h3>
                  <p className="text-xs text-muted-foreground">Dados principais do cliente</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome/Razão Social</Label>
                  <Input
                    value={editFormData.nome_razao_social}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, nome_razao_social: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>CPF/CNPJ</Label>
                  <Input
                    value={editFormData.cpf_cnpj}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, cpf_cnpj: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Seção: Contato */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Contato</h3>
                  <p className="text-xs text-muted-foreground">E-mail e telefone</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>E-mail</Label>
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input
                    value={editFormData.telefone}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Seção: Endereço */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">Endereço</h3>
                  <p className="text-xs text-muted-foreground">Localização do cliente</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>CEP</Label>
                  <Input
                    value={editFormData.cep}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, cep: e.target.value }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <Label>Logradouro</Label>
                  <Input
                    value={editFormData.logradouro}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, logradouro: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Número</Label>
                  <Input
                    value={editFormData.numero}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, numero: e.target.value }))}
                  />
                </div>
                <div className="col-span-3 space-y-2">
                  <Label>Complemento</Label>
                  <Input
                    value={editFormData.complemento}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, complemento: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Bairro</Label>
                  <Input
                    value={editFormData.bairro}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, bairro: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cidade</Label>
                  <Input
                    value={editFormData.cidade}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, cidade: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Estado</Label>
                  <Input
                    value={editFormData.estado}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, estado: e.target.value }))}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <Button variant="outline" onClick={() => setModalEditarOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSalvarEdicao} disabled={isSavingEdit}>
              {isSavingEdit ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Desativar/Ativar Cliente - NOVO */}
      <AlertDialog open={modalStatusOpen} onOpenChange={setModalStatusOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className={cn(
              "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3",
              cliente.status === 'ativo' ? "bg-warning/10" : "bg-success/10"
            )}>
              {cliente.status === 'ativo' ? (
                <UserMinus className="h-6 w-6 text-warning" />
              ) : (
                <UserCheck className="h-6 w-6 text-success" />
              )}
            </div>
            <AlertDialogTitle className="text-center">
              {cliente.status === 'ativo' ? 'Desativar Cliente' : 'Ativar Cliente'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {cliente.status === 'ativo'
                ? `Tem certeza que deseja desativar ${cliente.nome_razao_social}? O cliente não terá mais acesso ao portal.`
                : `Tem certeza que deseja reativar ${cliente.nome_razao_social}?`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleToggleStatus}
              disabled={isTogglingStatus}
              className={cn(
                cliente.status === 'ativo'
                  ? "bg-warning text-warning-foreground hover:bg-warning/90"
                  : "bg-success text-success-foreground hover:bg-success/90"
              )}
            >
              {isTogglingStatus ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : cliente.status === 'ativo' ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Desativar
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Ativar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Toggle Acesso ao Portal - NOVO */}
      <AlertDialog open={modalToggleAcessoOpen} onOpenChange={setModalToggleAcessoOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <div className={cn(
              "mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3",
              inviteStatus?.portalAtivo ? "bg-warning/10" : "bg-success/10"
            )}>
              {inviteStatus?.portalAtivo ? (
                <UserMinus className="h-6 w-6 text-warning" />
              ) : (
                <UserCheck className="h-6 w-6 text-success" />
              )}
            </div>
            <AlertDialogTitle className="text-center">
              {inviteStatus?.portalAtivo ? 'Desativar Acesso ao Portal' : 'Reativar Acesso ao Portal'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              {inviteStatus?.portalAtivo
                ? `Tem certeza que deseja desativar o acesso de ${cliente.nome_razao_social} ao Portal? O cliente não poderá mais acessar suas informações online.`
                : `Tem certeza que deseja reativar o acesso de ${cliente.nome_razao_social} ao Portal? O cliente voltará a poder acessar suas informações online.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleTogglePortalAccess}
              disabled={isTogglingPortalAccess}
              className={cn(
                inviteStatus?.portalAtivo
                  ? "bg-warning text-warning-foreground hover:bg-warning/90"
                  : "bg-success text-success-foreground hover:bg-success/90"
              )}
            >
              {isTogglingPortalAccess ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : inviteStatus?.portalAtivo ? (
                <>
                  <UserMinus className="mr-2 h-4 w-4" />
                  Desativar Acesso
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 h-4 w-4" />
                  Reativar Acesso
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Send Message Modal */}
      <SendMessageModal
        open={showSendMessageModal}
        onOpenChange={setShowSendMessageModal}
        destinatario={{
          nome: cliente.nome_razao_social,
          email: cliente.email || undefined,
          telefone: cliente.telefone || undefined,
        }}
        contexto={{
          tipo: 'cliente',
          id: clienteId,
        }}
      />
    </div>
  );
}

// ===========================================
// LOADING COMPONENT
// ===========================================

function PageLoading({ onBack }: { onBack: () => void }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-6 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-96 w-full" />
    </div>
  );
}
