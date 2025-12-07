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

import { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Skeleton } from '../ui/skeleton';
import { Alert, AlertDescription } from '../ui/alert';
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
} from 'lucide-react';
import { toast } from 'sonner';
import { logger } from '@/lib/utils/logger';

// Hooks
import { useClienteHistorico } from '@/lib/hooks/use-cliente-historico';
import { useClienteContratos, formatCurrency } from '@/lib/hooks/use-cliente-contratos';

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

  // Handlers
  const handleVisualizarPortal = () => {
    if (onVisualizarPortal) {
      onVisualizarPortal();
    } else {
      toast.info('Abrindo visualização do portal do cliente...');
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

      {/* Modal de Inativação */}
      <Dialog open={modalInativarOpen} onOpenChange={setModalInativarOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Inativar Contrato
            </DialogTitle>
            <DialogDescription>
              Você está prestes a inativar o contrato de <strong>{cliente.nome_razao_social}</strong>.
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {contratoPrincipal?.tipo === 'parceiro' || contratoPrincipal?.tipo === 'obra' ? (
              <div className="space-y-2">
                <Label>Termo de Entrega de Obra *</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
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
                <Label>Justificativa *</Label>
                <Textarea
                  placeholder="Descreva o motivo da inativação do contrato..."
                  rows={4}
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  É obrigatório informar o motivo da inativação.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setModalInativarOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleInativar}>
              Confirmar Inativação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
