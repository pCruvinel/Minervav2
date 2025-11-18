import React, { useState } from 'react';
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
  codigoCC: string;
  nomeRazaoSocial: string;
  tipoContrato: 'OBRAS' | 'ASSESSORIA';
  status: 'ATIVO' | 'INATIVO';
  dataInicio: string;
  dataTermino?: string;
  valorMensal: number;
  valorTotal: number;
  prazoMeses: number;
  responsavel: string;
  cpfResponsavel: string;
  email: string;
  telefone: string;
  cnpj?: string;
  endereco: string;
  contratoAssinado: string;
  loginPortal: string;
  senhaPortal: string;
  proximaFatura: string;
  parcelasRestantes: number;
}

const mockClienteDetalhe: ClienteDetalhe = {
  id: 'cli-1',
  codigoCC: 'CC-001',
  nomeRazaoSocial: 'Empreendimentos ABC S.A.',
  tipoContrato: 'ASSESSORIA',
  status: 'ATIVO',
  dataInicio: '2024-01-01',
  valorMensal: 4200.00,
  valorTotal: 50400.00,
  prazoMeses: 12,
  responsavel: 'Carlos Eduardo Silva',
  cpfResponsavel: '123.456.789-00',
  email: 'carlos.silva@abc.com.br',
  telefone: '(11) 98765-4321',
  cnpj: '12.345.678/0001-90',
  endereco: 'Av. Paulista, 1000 - São Paulo/SP',
  contratoAssinado: 'contrato-abc-2024-001.pdf',
  loginPortal: '12345678900',
  senhaPortal: 'ABC@2024#Minerva',
  proximaFatura: '2024-12-05',
  parcelasRestantes: 1,
};

interface ClienteDetalhesPageProps {
  clienteId: string;
  onBack: () => void;
  onVisualizarPortal?: () => void;
}

export function ClienteDetalhesPage({ clienteId, onBack, onVisualizarPortal }: ClienteDetalhesPageProps) {
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
    navigator.clipboard.writeText(cliente.loginPortal);
    toast.success('Login copiado!');
  };

  const handleCopySenha = () => {
    navigator.clipboard.writeText(cliente.senhaPortal);
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
    if (cliente.tipoContrato === 'OBRAS' && !termoEntrega) {
      toast.error('Anexe o Termo de Entrega de Obra');
      return;
    }

    if (cliente.tipoContrato === 'ASSESSORIA' && !justificativa.trim()) {
      toast.error('Preencha a justificativa de inativação');
      return;
    }

    console.log('Inativar cliente:', {
      clienteId: cliente.id,
      tipo: cliente.tipoContrato,
      justificativa,
      termoEntrega: termoEntrega?.name,
    });

    toast.success('Contrato inativado com sucesso!');
    setModalInativarOpen(false);
  };

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl">{cliente.nomeRazaoSocial}</h1>
              <Badge variant="outline" className="font-mono">
                {cliente.codigoCC}
              </Badge>
              {cliente.status === 'ATIVO' ? (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Ativo
                </Badge>
              ) : (
                <Badge variant="secondary">Inativo</Badge>
              )}
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
          {cliente.status === 'ATIVO' && (
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
              {cliente.tipoContrato === 'OBRAS' ? 'Obras' : 'Assessoria'}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Início: {formatDate(cliente.dataInicio)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Mensal</p>
              <DollarSign className="h-4 w-4 text-green-600" />
            </div>
            <h3 className="text-xl text-green-600">{formatCurrency(cliente.valorMensal)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {cliente.parcelasRestantes} parcela(s) restante(s)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Valor Total</p>
              <DollarSign className="h-4 w-4 text-primary" />
            </div>
            <h3 className="text-xl">{formatCurrency(cliente.valorTotal)}</h3>
            <p className="text-xs text-muted-foreground mt-1">
              {cliente.prazoMeses} meses de contrato
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-muted-foreground">Próxima Fatura</p>
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <h3 className="text-xl">{formatDate(cliente.proximaFatura)}</h3>
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
                  <p className="font-medium mt-1">{cliente.nomeRazaoSocial}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">CNPJ</Label>
                  <p className="font-medium mt-1">{cliente.cnpj}</p>
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
                      Assinado em {formatDate(cliente.dataInicio)}
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
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Valor Total do Contrato</span>
                  <span className="font-medium text-lg">{formatCurrency(cliente.valorTotal)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Valor Mensal</span>
                  <span className="font-medium text-lg text-green-600">{formatCurrency(cliente.valorMensal)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Prazo (meses)</span>
                  <span className="font-medium text-lg">{cliente.prazoMeses}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-neutral-50 rounded-lg">
                  <span className="text-sm text-muted-foreground">Parcelas Restantes</span>
                  <span className="font-medium text-lg text-amber-600">{cliente.parcelasRestantes}</span>
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
                    <p className="font-medium mb-2">Próxima Fatura: {formatDate(cliente.proximaFatura)}</p>
                    <p className="text-sm">
                      Valor: {formatCurrency(cliente.valorMensal)}
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
                      value={cliente.loginPortal}
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
                      value={cliente.senhaPortal}
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
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Inativar Contrato
            </DialogTitle>
            <DialogDescription>
              Você está prestes a inativar o contrato de <strong>{cliente.nomeRazaoSocial}</strong>.
              Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {cliente.tipoContrato === 'OBRAS' ? (
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
