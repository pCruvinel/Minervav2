import { logger } from '@/lib/utils/logger';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Separator } from '../ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import {
  Download,
  FileText,
  Calendar,
  Plus,
  Phone,
  MessageCircle,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  ClipboardCheck,
  Home,
} from 'lucide-react';
import { toast } from 'sonner';

interface Solicitacao {
  id: string;
  tipo: 'VISTORIA' | 'REFORMA';
  data: string;
  status: 'PENDENTE' | 'EM_ANALISE' | 'APROVADO' | 'REPROVADO' | 'CONCLUIDO';
  descricao: string;
  documentoGerado?: string;
}

interface Relatorio {
  id: string;
  mes: string;
  tipo: string;
  dataUpload: string;
}

const mockSolicitacoes: Solicitacao[] = [
  {
    id: 'sol-1',
    tipo: 'VISTORIA',
    data: '2024-11-01',
    status: 'CONCLUIDO',
    descricao: 'Vistoria pré-obra - Unidade 302',
    documentoGerado: 'laudo-vistoria-302.pdf',
  },
  {
    id: 'sol-2',
    tipo: 'REFORMA',
    data: '2024-11-05',
    status: 'APROVADO',
    descricao: 'Reforma de banheiro - Unidade 405',
    documentoGerado: 'parecer-reforma-405.pdf',
  },
  {
    id: 'sol-3',
    tipo: 'VISTORIA',
    data: '2024-11-10',
    status: 'EM_ANALISE',
    descricao: 'Vistoria de infiltração - Unidade 201',
  },
  {
    id: 'sol-4',
    tipo: 'REFORMA',
    data: '2024-11-12',
    status: 'REPROVADO',
    descricao: 'Ampliação de sacada - Unidade 501',
    documentoGerado: 'parecer-negativa-501.pdf',
  },
];

const mockRelatorios: Relatorio[] = [
  { id: 'rel-1', mes: 'Outubro/2024', tipo: 'Plano de Manutenção Mensal', dataUpload: '2024-11-05' },
  { id: 'rel-2', mes: 'Setembro/2024', tipo: 'Plano de Manutenção Mensal', dataUpload: '2024-10-05' },
  { id: 'rel-3', mes: 'Agosto/2024', tipo: 'Plano de Manutenção Mensal', dataUpload: '2024-09-05' },
];

export function PortalClienteAssessoria() {
  const [solicitacoes] = useState(mockSolicitacoes);
  const [relatorios] = useState(mockRelatorios);
  const [modalVistoriaOpen, setModalVistoriaOpen] = useState(false);
  const [modalReformaOpen, setModalReformaOpen] = useState(false);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getStatusBadge = (status: Solicitacao['status']) => {
    const config = {
      PENDENTE: { label: 'Pendente', icon: Clock, className: 'bg-amber-100 text-amber-800' },
      EM_ANALISE: { label: 'Em Análise', icon: Eye, className: 'bg-blue-100 text-blue-800' },
      APROVADO: { label: 'Aprovado', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      REPROVADO: { label: 'Reprovado', icon: AlertCircle, className: 'bg-red-100 text-red-800' },
      CONCLUIDO: { label: 'Concluído', icon: CheckCircle, className: 'bg-green-100 text-green-800' },
    };

    const { label, icon: Icon, className } = config[status];
    return (
      <Badge className={className}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getTipoLabel = (tipo: Solicitacao['tipo']) => {
    return tipo === 'VISTORIA' ? 'Vistoria' : 'Análise de Reforma';
  };

  const handleDownloadDocumento = (docId: string) => {
    logger.log('Download documento:', docId);
    toast.success('Download iniciado!');
  };

  const handleDownloadRelatorio = (relId: string) => {
    logger.log('Download relatório:', relId);
    toast.success('Download iniciado!');
  };

  const handleNovaVistoria = (dados: any) => {
    logger.log('Nova vistoria:', dados);
    toast.success('Solicitação de vistoria enviada com sucesso!');
    setModalVistoriaOpen(false);
  };

  const handleNovaReforma = (dados: any) => {
    logger.log('Nova reforma:', dados);
    toast.success('Solicitação de análise de reforma enviada com sucesso!');
    setModalReformaOpen(false);
  };

  const handleContatoWhatsApp = () => {
    window.open('https://wa.me/5511987654321?text=Olá, preciso de ajuda com minha assessoria condominial.', '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header com Logos */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-1">Portal do Cliente</h1>
              <p className="text-sm text-muted-foreground">Empreendimentos ABC S.A. - Assessoria Condominial</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="text-sm font-medium">Empreendimentos ABC</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Parceria com</p>
                <p className="text-lg font-bold" style={{ color: '#D3AF37' }}>Minerva Engenharia</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Ações Rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <ClipboardCheck className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Nova Solicitação de Vistoria</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Solicite uma vistoria técnica para sua unidade
                  </p>
                  <Button onClick={() => setModalVistoriaOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Solicitar Vistoria
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 hover:border-primary/40 transition-colors cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Home className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium mb-1">Nova Análise de Reforma</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Solicite análise técnica para sua reforma
                  </p>
                  <Button onClick={() => setModalReformaOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Solicitar Análise
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Histórico de Solicitações */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Histórico de Solicitações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-center">Documento</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {solicitacoes.map((sol) => (
                      <TableRow key={sol.id}>
                        <TableCell className="whitespace-nowrap">
                          {new Date(sol.data).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getTipoLabel(sol.tipo)}
                          </Badge>
                        </TableCell>
                        <TableCell>{sol.descricao}</TableCell>
                        <TableCell>{getStatusBadge(sol.status)}</TableCell>
                        <TableCell className="text-center">
                          {sol.documentoGerado ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDownloadDocumento(sol.documentoGerado!)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Relatórios e Contato */}
          <div className="space-y-6">
            {/* Relatórios Mensais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Planos de Manutenção
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {relatorios.map((rel) => (
                  <div
                    key={rel.id}
                    className="flex items-start justify-between gap-2 p-3 border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{rel.mes}</p>
                      <p className="text-xs text-muted-foreground">
                        {rel.tipo}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadRelatorio(rel.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Estatísticas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo do Mês</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Vistorias Solicitadas</span>
                  <span className="text-lg font-medium">2</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Reformas Analisadas</span>
                  <span className="text-lg font-medium">2</span>
                </div>
                <Separator />
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Aprovadas</span>
                  <span className="text-lg font-medium text-green-600">1</span>
                </div>
              </CardContent>
            </Card>

            {/* Contato */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <MessageCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h4 className="font-medium mb-2">Precisa de Ajuda?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Entre em contato conosco pelo WhatsApp
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleContatoWhatsApp}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Falar no WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Botão Flutuante WhatsApp */}
      <button
        onClick={handleContatoWhatsApp}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
        title="Contato WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Modal Nova Vistoria */}
      <ModalNovaVistoria
        open={modalVistoriaOpen}
        onClose={() => setModalVistoriaOpen(false)}
        onSalvar={handleNovaVistoria}
      />

      {/* Modal Nova Reforma */}
      <ModalNovaReforma
        open={modalReformaOpen}
        onClose={() => setModalReformaOpen(false)}
        onSalvar={handleNovaReforma}
      />
    </div>
  );
}

// Modal Nova Vistoria
interface ModalNovaVistoriaProps {
  open: boolean;
  onClose: () => void;
  onSalvar: (dados: any) => void;
}

function ModalNovaVistoria({ open, onClose, onSalvar }: ModalNovaVistoriaProps) {
  const [unidade, setUnidade] = useState('');
  const [motivo, setMotivo] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSalvar = () => {
    if (!unidade || !motivo || !descricao) {
      toast.error('Preencha todos os campos');
      return;
    }

    onSalvar({ unidade, motivo, descricao });
    setUnidade('');
    setMotivo('');
    setDescricao('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Solicitação de Vistoria</DialogTitle>
          <DialogDescription>
            Preencha os dados abaixo para solicitar uma vistoria técnica
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Unidade *</Label>
            <Input
              placeholder="Ex: Apartamento 302"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Motivo *</Label>
            <Input
              placeholder="Ex: Infiltração, Pré-obra, Entrega"
              value={motivo}
              onChange={(e) => setMotivo(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição Detalhada *</Label>
            <Textarea
              placeholder="Descreva o motivo da vistoria e o que precisa ser analisado..."
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Enviar Solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal Nova Reforma
interface ModalNovaReformaProps {
  open: boolean;
  onClose: () => void;
  onSalvar: (dados: any) => void;
}

function ModalNovaReforma({ open, onClose, onSalvar }: ModalNovaReformaProps) {
  const [unidade, setUnidade] = useState('');
  const [tipoReforma, setTipoReforma] = useState('');
  const [descricao, setDescricao] = useState('');

  const handleSalvar = () => {
    if (!unidade || !tipoReforma || !descricao) {
      toast.error('Preencha todos os campos');
      return;
    }

    onSalvar({ unidade, tipoReforma, descricao });
    setUnidade('');
    setTipoReforma('');
    setDescricao('');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova Análise de Reforma</DialogTitle>
          <DialogDescription>
            Solicite análise técnica e aprovação para sua reforma
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Unidade *</Label>
            <Input
              placeholder="Ex: Apartamento 405"
              value={unidade}
              onChange={(e) => setUnidade(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Tipo de Reforma *</Label>
            <Input
              placeholder="Ex: Banheiro, Sacada, Cozinha"
              value={tipoReforma}
              onChange={(e) => setTipoReforma(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Descrição da Reforma *</Label>
            <Textarea
              placeholder="Descreva detalhadamente o que será feito na reforma..."
              rows={4}
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Enviar Solicitação
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
