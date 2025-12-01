import { logger } from '@/lib/utils/logger';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Building2,
  User,
  FileText,
  DollarSign,
  Calendar,
  Download,
  Eye,
  Key,
  Copy,
  AlertTriangle,
  Upload,
  CheckCircle,
  ArrowLeft,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface ClienteDetalhe {
  id: string;
  nome: string;
  razaoSocial?: string;
  documento: string;
  tipo: 'PF' | 'PJ';
  status: 'ativo' | 'inativo' | 'lead' | 'blacklist';
  email: string;
  telefone: string;
  endereco: string;
  dataCadastro: string;
  origem: string;
  observacoes?: string;
  // Campos adicionais para UI
  loginPortal?: string;
  senhaPortal?: string;
  contratoAssinado?: string;
  responsavel?: string;
  cpfResponsavel?: string;
  cnpj?: string; // Alias para documento se necessário

  financeiro: {
    limiteCredito: number;
    faturasEmAberto: number;
    valorEmAberto: number;
    statusFinanceiro: 'em_dia' | 'inadimplente' | 'alerta';
    proximaFatura?: string; // Adicionado
  };
  contrato: {
    tipo: 'avulso' | 'recorrente' | 'parceiro';
    inicio?: string;
    fim?: string;
    valorMensal?: number;
    servicosInclusos?: string[];
    valorTotal?: number; // Adicionado
    prazoMeses?: number; // Adicionado
    parcelasRestantes?: number; // Adicionado
  };
}

const renderStatusBadge = (status: ClienteDetalhe['status']) => {
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

const mockClienteDetalhe: ClienteDetalhe = {
  id: 'cli-1',

  responsavel: 'Carlos Eduardo Silva',
  cpfResponsavel: '123.456.789-00',
  email: 'carlos.silva@abc.com.br',
  telefone: '(11) 98765-4321',
  cnpj: '12.345.678/0001-90',
  endereco: 'Av. Paulista, 1000 - São Paulo/SP',
  contratoAssinado: 'Contrato_Prestacao_Servicos_2023.pdf',
  loginPortal: '12345678900',
  senhaPortal: '8x2k9Lp1',

  financeiro: {
    limiteCredito: 10000,
    faturasEmAberto: 1,
    valorEmAberto: 4200,
    statusFinanceiro: 'em_dia',
    proximaFatura: '2024-12-05',
  },
  contrato: {
    tipo: 'recorrente',
    inicio: '2023-12-05',
    fim: '2024-12-05',
    valorMensal: 4200,
    servicosInclusos: ['Manutenção de Software', 'Suporte Técnico'],
    valorTotal: 50400,
    prazoMeses: 12,
    parcelasRestantes: 1,
  },
  nome: 'ABC Soluções Ltda.',
  documento: '12.345.678/0001-90',
  tipo: 'PJ',
  status: 'ativo',
  dataCadastro: '2023-12-01',
  origem: 'Indicação',
  observacoes: 'Cliente com contrato de 12 meses, renovação automática.',
};

interface ClienteDetalhesPageProps {
  clienteId: string;
  onBack: () => void;
  onVisualizarPortal?: () => void;
}

export function ClienteDetalhesPage({ clienteId: _clienteId, onBack, onVisualizarPortal }: ClienteDetalhesPageProps) {
  // FRONTEND-ONLY MODE: Usando mock data - implementar fetch real quando conectar Supabase
  // Ref: CLAUDE.md - modo frontend-only é aceito durante desenvolvimento
  const [cliente] = useState(mockClienteDetalhe);
  const [modalInativarOpen, setModalInativarOpen] = useState(false);
  const [justificativa, setJustificativa] = useState('');
  const [termoEntrega, setTermoEntrega] = useState<File | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
  };

  const handleCopyLogin = () => {
    navigator.clipboard.writeText(cliente.loginPortal || '');
    toast.success('Login copiado!');
  };

  const handleCopySenha = () => {
    navigator.clipboard.writeText(cliente.senhaPortal || '');
    toast.success('Senha copiada!');
  };

  const handleVisualizarPortal = () => {
    if (onVisualizarPortal) {
      onVisualizarPortal();
    } else {
      toast.info('Abrindo visualização do portal do cliente...');
    }
  };

  const handleDownloadContrato = () => {
    toast.success(`Baixando ${cliente.contratoAssinado}...`);
  };

  const handleInativar = () => {
    // Validações
    if (cliente.contrato.tipo === 'parceiro' && !termoEntrega) {
      toast.error('Anexe o Termo de Entrega de Obra');
      return;
    }

    if (cliente.contrato.tipo === 'recorrente' && !justificativa.trim()) {
      toast.error('Preencha a justificativa de inativação');
      return;
    }

    logger.log('Inativar cliente:', {
      clienteId: cliente.id,
      tipo: cliente.contrato.tipo,
      justificativa,
      termoEntrega: termoEntrega?.name,
    });

    toast.success('Contrato inativado com sucesso!');
    setModalInativarOpen(false);
  };

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
              <h1 className="text-3xl">{cliente.nome}</h1>
              <Badge variant="outline" className="font-mono">
                {cliente.id}
              </Badge>
              {renderStatusBadge(cliente.status)}
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
          {cliente.status === 'ativo' && (
            <Button variant="destructive" onClick={() => setModalInativarOpen(true)}>
              <AlertTriangle className="mr-2 h-4 w-4" />
              Inativar Contrato
            </Button>
          )}
        </div>
      </div>

      {/* Resumo Rápido */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Tipo de Contrato</p>
              <FileText className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl">
              {cliente.contrato.tipo === 'parceiro' ? 'Parceiro' : cliente.contrato.tipo === 'recorrente' ? 'Recorrente' : 'Avulso'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Início: {cliente.contrato.inicio ? formatDate(cliente.contrato.inicio) : '-'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Mensal</p>
              <DollarSign className="h-4 w-4 text-success" />
            </div>
            <h3 className="text-xl text-success">{formatCurrency(cliente.contrato.valorMensal || 0)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {cliente.contrato.parcelasRestantes || 0} parcela(s) restante(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl">{formatCurrency(cliente.contrato.valorTotal || 0)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {cliente.contrato.prazoMeses || 0} meses de contrato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Próxima Fatura</p>
              <Calendar className="h-4 w-4 text-warning" />
            </div>
            <h3 className="text-xl">{cliente.financeiro.proximaFatura ? formatDate(cliente.financeiro.proximaFatura) : '-'}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Vencimento programado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de Conteúdo */}
      <Tabs defaultValue="cadastro" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="cadastro">Dados Cadastrais</TabsTrigger>
          <TabsTrigger value="financeiro">Dados Financeiros</TabsTrigger>
          <TabsTrigger value="portal">Acesso ao Portal</TabsTrigger>
        </TabsList>

        {/* Aba 1: Dados Cadastrais */}
        <TabsContent value="cadastro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-primary" />
                  Informações da Empresa
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Razão Social</Label>
                  <p className="font-medium mt-1">{cliente.razaoSocial || cliente.nome}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CNPJ</Label>
                  <p className="font-medium mt-1">{cliente.documento}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Endereço</Label>
                  <p className="font-medium mt-1">{cliente.endereco}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5 text-primary" />
                  Responsável Legal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-xs text-muted-foreground">Nome Completo</Label>
                  <p className="font-medium mt-1">{cliente.responsavel}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CPF</Label>
                  <p className="font-medium mt-1">{cliente.cpfResponsavel}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">E-mail</Label>
                  <p className="font-medium mt-1">{cliente.email}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Telefone</Label>
                  <p className="font-medium mt-1">{cliente.telefone}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contrato Assinado */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contrato Assinado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="font-medium">{cliente.contratoAssinado}</p>
                    <p className="text-xs text-muted-foreground">
                      Assinado em {cliente.contrato.inicio ? formatDate(cliente.contrato.inicio) : '-'}
                    </p>
                  </div>
                </div>
                <Button variant="outline" onClick={handleDownloadContrato}>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba 2: Dados Financeiros */}
        <TabsContent value="financeiro">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Resumo Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-sm text-muted-foreground">Valor Total do Contrato</span>
                  <span className="font-medium text-lg">{formatCurrency(cliente.contrato.valorTotal || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-sm text-muted-foreground">Valor Mensal</span>
                  <span className="font-medium text-lg text-success">{formatCurrency(cliente.contrato.valorMensal || 0)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-sm text-muted-foreground">Prazo (meses)</span>
                  <span className="font-medium text-lg">{cliente.contrato.prazoMeses || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                  <span className="text-sm text-muted-foreground">Parcelas Restantes</span>
                  <span className="font-medium text-lg text-warning">{cliente.contrato.parcelasRestantes || 0}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Próximas Faturas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <AlertDescription>
                    <p className="font-medium mb-2">Próxima Fatura: {cliente.financeiro.proximaFatura ? formatDate(cliente.financeiro.proximaFatura) : '-'}</p>
                    <p className="text-sm">
                      Valor: {formatCurrency(cliente.contrato.valorMensal || 0)}
                    </p>
                  </AlertDescription>
                </Alert>
                <p className="text-xs text-muted-foreground mt-4">
                  💡 Consulte a tela "Contas a Receber" para ver todas as parcelas previstas deste contrato.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Aba 3: Acesso ao Portal */}
        <TabsContent value="portal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5 text-primary" />
                Credenciais de Acesso ao Portal do Cliente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <AlertDescription>
                  <p className="text-sm">
                    <strong>Importante:</strong> Estas credenciais devem ser fornecidas ao cliente para que ele acesse o portal exclusivo.
                    O login é sempre o CPF do responsável (sem pontuação) e a senha é gerada automaticamente.
                  </p>
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Login (CPF do Responsável)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cliente.loginPortal || ''}
                      readOnly
                      className="font-mono"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopyLogin}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Senha (Gerada Automaticamente)</Label>
                  <div className="flex gap-2">
                    <Input
                      value={cliente.senhaPortal || ''}
                      readOnly
                      className="font-mono"
                      type="password"
                    />
                    <Button variant="outline" size="icon" onClick={handleCopySenha}>
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <div>
                  <p className="font-medium">URL do Portal do Cliente</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    https://portal.minervaengenharia.com.br
                  </p>
                </div>
                <Button variant="outline" onClick={handleVisualizarPortal}>
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Visualizar como Cliente
                </Button>
              </div>
            </CardContent>
          </Card>
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
              Você está prestes a inativar o contrato de <strong>{cliente.nome}</strong>.
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cliente.contrato.tipo === 'parceiro' ? (
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
                  placeholder="Descreva o motivo da inativação do contrato de assessoria..."
                  rows={4}
                  value={justificativa}
                  onChange={(e) => setJustificativa(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Para contratos de assessoria, é obrigatório informar o motivo da inativação.
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
