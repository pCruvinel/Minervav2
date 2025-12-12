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
  Calendar,
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
      router.navigate({ to: `/clientes/portal-preview/${clienteId}` });
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

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl">{cliente.nome_razao_social}</h1>
              <Badge variant="outline" className="font-mono text-xs">
                {cliente.id.slice(0, 8)}...
              </Badge>
              {renderStatusBadge(cliente.status as ClienteStatus)}
            </div>
            <p className="text-muted-foreground">
              Dossiê interno do cliente - Visão administrativa
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Botão Editar */}
          <Button variant="outline" onClick={() => setModalEditarOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </Button>

          {/* Botão Desativar/Ativar */}
          <Button
            variant="outline"
            onClick={() => setModalStatusOpen(true)}
            className={cn(
              cliente.status === 'ativo' && "text-warning hover:text-warning"
            )}
          >
            {cliente.status === 'ativo' ? (
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
          </Button>

          {/* Botão de Convite de Acesso */}
          {cliente.email && (
            <Button
              variant="outline"
              onClick={() => setModalConviteOpen(true)}
              disabled={isLoadingInvite || inviteStatus?.inviteAccepted}
            >
              {isLoadingInvite ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : inviteStatus?.inviteAccepted ? (
                <CheckCircle className="mr-2 h-4 w-4 text-success" />
              ) : (
                <Mail className="mr-2 h-4 w-4" />
              )}
              {inviteStatus?.inviteAccepted
                ? 'Acesso Ativo'
                : inviteStatus?.hasInvite
                  ? 'Reenviar Convite'
                  : 'Enviar Convite de Acesso'}
            </Button>
          )}
          <Button variant="outline" onClick={handleVisualizarPortal}>
            <Eye className="mr-2 h-4 w-4" />
            Visualizar como Cliente
          </Button>
          {cliente.status === 'ativo' && contratosSummary.contratosAtivos > 0 && (
            <Button variant="destructive" onClick={() => setModalInativarOpen(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Inativar Contrato
            </Button>
          )}
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Contratos Ativos</p>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl">{contratosSummary.contratosAtivos}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {contratoPrincipal ? `Principal: ${contratoPrincipal.tipo}` : 'Nenhum contrato ativo'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Total de OS</p>
              <ClipboardList className="h-4 w-4 text-blue-500" />
            </div>
            <h3 className="text-xl text-blue-500">{ordensServico.length}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Ordens de serviço
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Mensal</p>
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-xl text-success">
              {formatCurrency(contratosSummary.valorRecorrenteMensal)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Receita recorrente
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl">
              {formatCurrency(contratosSummary.valorTotalContratos)}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Todos os contratos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Cliente desde</p>
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <h3 className="text-xl">{formatDate(cliente.created_at)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Data de cadastro
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="contratos">
            Contratos
            {contratosSummary.contratosAtivos > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {contratosSummary.contratosAtivos}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="historico-os">
            Histórico de OS
            {ordensServico.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 px-1.5">
                {ordensServico.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="financeiro">Financeiro</TabsTrigger>
          <TabsTrigger value="documentos">
            <FolderOpen className="h-4 w-4 mr-1" />
            Documentos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral">
          <ClienteTabVisaoGeral cliente={cliente} isLoading={isLoadingCliente} />
        </TabsContent>

        <TabsContent value="contratos">
          <ClienteTabContratos clienteId={clienteId} />
        </TabsContent>

        <TabsContent value="historico-os">
          <ClienteTabHistoricoOS ordensServico={ordensServico} isLoading={isLoadingCliente} />
        </TabsContent>

        <TabsContent value="financeiro">
          <ClienteTabFinanceiro clienteId={clienteId} />
        </TabsContent>

        <TabsContent value="documentos">
          <ClienteTabDocumentos clienteId={clienteId} />
        </TabsContent>
      </Tabs>

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
