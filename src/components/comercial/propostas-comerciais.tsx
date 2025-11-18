import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { 
  FileText, 
  Search, 
  Filter,
  Calendar,
  TrendingUp,
  MessageSquare,
  FileSignature,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  User
} from 'lucide-react';
import { 
  mockPropostasComerciais, 
  StatusProposta,
  getPropostasByStatus,
  calcularValorTotalPorStatus
} from '../../lib/mock-data-comercial';

export default function PropostasComerciais() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<string>('TODOS');
  const [dialogFeedback, setDialogFeedback] = useState(false);
  const [dialogContrato, setDialogContrato] = useState(false);
  const [propostaSelecionada, setPropostaSelecionada] = useState<string | null>(null);
  const [novoFeedback, setNovoFeedback] = useState('');

  // Estatísticas
  const totalAguardando = getPropostasByStatus('AGUARDANDO_APROVACAO_CLIENTE').length;
  const valorAguardando = calcularValorTotalPorStatus('AGUARDANDO_APROVACAO_CLIENTE');
  const totalNegociacao = getPropostasByStatus('NEGOCIACAO').length;
  const valorNegociacao = calcularValorTotalPorStatus('NEGOCIACAO');
  const totalAprovadas = getPropostasByStatus('APROVADA').length;
  const valorAprovadas = calcularValorTotalPorStatus('APROVADA');

  // Filtros
  const propostasFiltradas = mockPropostasComerciais.filter(proposta => {
    const matchSearch = 
      proposta.leadNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposta.osNumero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      proposta.tipoServico.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filtroStatus === 'TODOS' || proposta.status === filtroStatus;
    const matchTipo = filtroTipo === 'TODOS' || proposta.osTipo === filtroTipo;

    return matchSearch && matchStatus && matchTipo;
  });

  const getStatusBadge = (status: StatusProposta) => {
    const statusMap: Record<StatusProposta, { label: string; icon: JSX.Element; className: string }> = {
      'AGUARDANDO_APROVACAO_CLIENTE': {
        label: 'Aguardando Aprovação',
        icon: <Clock className="h-3 w-3" />,
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      },
      'NEGOCIACAO': {
        label: 'Em Negociação',
        icon: <MessageSquare className="h-3 w-3" />,
        className: 'bg-orange-100 text-orange-800 border-orange-300'
      },
      'APROVADA': {
        label: 'Aprovada',
        icon: <CheckCircle className="h-3 w-3" />,
        className: 'bg-green-100 text-green-800 border-green-300'
      },
      'RECUSADA': {
        label: 'Recusada',
        icon: <XCircle className="h-3 w-3" />,
        className: 'bg-red-100 text-red-800 border-red-300'
      },
      'EXPIRADA': {
        label: 'Expirada',
        icon: <AlertCircle className="h-3 w-3" />,
        className: 'bg-gray-100 text-gray-800 border-gray-300'
      }
    };
    return statusMap[status];
  };

  const getTipoOSLabel = (tipo: string) => {
    const tipoMap: Record<string, string> = {
      'OS_01_VISTORIA': 'OS-01 Vistoria',
      'OS_02_ORCAMENTO': 'OS-02 Orçamento',
      'OS_03_LAUDO': 'OS-03 Laudo',
      'OS_04_ASSESSORIA': 'OS-04 Assessoria'
    };
    return tipoMap[tipo] || tipo;
  };

  const handleRegistrarFeedback = (propostaId: string) => {
    setPropostaSelecionada(propostaId);
    setDialogFeedback(true);
  };

  const handleGerarContrato = (propostaId: string) => {
    setPropostaSelecionada(propostaId);
    setDialogContrato(true);
  };

  const handleSalvarFeedback = () => {
    console.log('Feedback registrado para proposta:', propostaSelecionada, novoFeedback);
    setDialogFeedback(false);
    setNovoFeedback('');
    setPropostaSelecionada(null);
  };

  const handleConfirmarContrato = () => {
    console.log('Gerando contrato para proposta:', propostaSelecionada);
    setDialogContrato(false);
    setPropostaSelecionada(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const calcularDiasRestantes = (dataValidade: string) => {
    const hoje = new Date();
    const validade = new Date(dataValidade);
    const diff = validade.getTime() - hoje.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-black">Propostas Comerciais</h1>
        <p className="text-black/60">Acompanhamento de Propostas OS Tipo 01-04</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-black/70">Aguardando Aprovação</CardTitle>
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl text-black">{totalAguardando}</p>
              <p className="text-sm text-black/60">
                R$ {(valorAguardando / 1000).toFixed(0)}k em propostas
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-black/70">Em Negociação</CardTitle>
              <MessageSquare className="h-5 w-5 text-orange-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl text-black">{totalNegociacao}</p>
              <p className="text-sm text-black/60">
                R$ {(valorNegociacao / 1000).toFixed(0)}k em discussão
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-black/70">Aprovadas</CardTitle>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-2xl text-black">{totalAprovadas}</p>
              <p className="text-sm text-black/60">
                R$ {(valorAprovadas / 1000).toFixed(0)}k aprovados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="border-[#D3AF37]/20">
        <CardHeader>
          <CardTitle className="text-black flex items-center gap-2">
            <Filter className="h-5 w-5 text-[#D3AF37]" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-black/70">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/40" />
                <Input
                  placeholder="Lead, OS ou serviço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-black/70">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Status</SelectItem>
                  <SelectItem value="AGUARDANDO_APROVACAO_CLIENTE">Aguardando Aprovação</SelectItem>
                  <SelectItem value="NEGOCIACAO">Em Negociação</SelectItem>
                  <SelectItem value="APROVADA">Aprovada</SelectItem>
                  <SelectItem value="RECUSADA">Recusada</SelectItem>
                  <SelectItem value="EXPIRADA">Expirada</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-black/70">Tipo de OS</Label>
              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Tipos</SelectItem>
                  <SelectItem value="OS_01_VISTORIA">OS-01 Vistoria</SelectItem>
                  <SelectItem value="OS_02_ORCAMENTO">OS-02 Orçamento</SelectItem>
                  <SelectItem value="OS_03_LAUDO">OS-03 Laudo</SelectItem>
                  <SelectItem value="OS_04_ASSESSORIA">OS-04 Assessoria</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-black/60">
              Mostrando {propostasFiltradas.length} de {mockPropostasComerciais.length} propostas
            </p>
            {(searchTerm || filtroStatus !== 'TODOS' || filtroTipo !== 'TODOS') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFiltroStatus('TODOS');
                  setFiltroTipo('TODOS');
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Lista de Propostas */}
      <div className="grid grid-cols-1 gap-4">
        {propostasFiltradas.map(proposta => {
          const statusInfo = getStatusBadge(proposta.status);
          const diasRestantes = calcularDiasRestantes(proposta.dataValidade);
          const isExpirando = diasRestantes <= 3 && diasRestantes > 0;
          const isExpirada = diasRestantes <= 0;

          return (
            <Card 
              key={proposta.id} 
              className={`border-[#D3AF37]/20 hover:border-[#D3AF37]/50 transition-colors ${
                isExpirada ? 'bg-red-50/50' : isExpirando ? 'bg-yellow-50/50' : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header da Proposta */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <FileText className="h-5 w-5 text-[#D3AF37]" />
                          <h3 className="text-black text-lg">{proposta.osNumero}</h3>
                          <Badge className={`${statusInfo.className} border flex items-center gap-1`}>
                            {statusInfo.icon}
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="outline" className="border-[#D3AF37] text-black">
                            {getTipoOSLabel(proposta.osTipo)}
                          </Badge>
                        </div>

                        <div className="space-y-1">
                          <p className="text-black">
                            <strong>Lead/Cliente:</strong> {proposta.leadNome}
                            {proposta.clienteNome && ` (Cliente: ${proposta.clienteNome})`}
                          </p>
                          <p className="text-black/70">
                            <strong>Serviço:</strong> {proposta.tipoServico}
                          </p>
                          <p className="text-sm text-black/60">
                            {proposta.descricaoServico}
                          </p>
                        </div>
                      </div>

                      {/* Valor */}
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[#D3AF37] mb-1">
                          <TrendingUp className="h-4 w-4" />
                          <span className="text-sm">Valor da Proposta</span>
                        </div>
                        <p className="text-2xl text-black">
                          R$ {proposta.valorProposta.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>

                    {/* Informações Adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-3 border-y border-black/10">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-[#D3AF37]" />
                        <div>
                          <p className="text-black/60">Enviado em</p>
                          <p className="text-black">{formatDate(proposta.dataEnvio)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#D3AF37]" />
                        <div>
                          <p className="text-black/60">Validade</p>
                          <p className={`${isExpirada ? 'text-red-600' : isExpirando ? 'text-yellow-600' : 'text-black'}`}>
                            {formatDate(proposta.dataValidade)}
                            {!isExpirada && ` (${diasRestantes}d)`}
                            {isExpirada && ' (Expirada)'}
                          </p>
                        </div>
                      </div>

                      {proposta.prazoExecucao && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-[#D3AF37]" />
                          <div>
                            <p className="text-black/60">Prazo de Execução</p>
                            <p className="text-black">{proposta.prazoExecucao}</p>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-[#D3AF37]" />
                        <div>
                          <p className="text-black/60">Responsável</p>
                          <p className="text-black">{proposta.responsavelNome}</p>
                        </div>
                      </div>
                    </div>

                    {/* Feedbacks */}
                    {proposta.feedbacks.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-black mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4 text-[#D3AF37]" />
                          Histórico de Feedbacks:
                        </p>
                        <div className="space-y-2">
                          {proposta.feedbacks.map((feedback, idx) => (
                            <div 
                              key={idx}
                              className="pl-4 border-l-2 border-[#D3AF37]/30 text-sm text-black/70"
                            >
                              • {feedback}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    {(proposta.status === 'AGUARDANDO_APROVACAO_CLIENTE' || proposta.status === 'NEGOCIACAO') && (
                      <div className="mt-4 flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRegistrarFeedback(proposta.id)}
                          className="border-[#D3AF37] text-black hover:bg-[#D3AF37]/10"
                        >
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Registrar Feedback
                        </Button>

                        {proposta.status === 'NEGOCIACAO' && (
                          <Button
                            size="sm"
                            onClick={() => handleGerarContrato(proposta.id)}
                            className="bg-[#D3AF37] hover:bg-[#C49F2F] text-black"
                          >
                            <FileSignature className="h-4 w-4 mr-2" />
                            Gerar Contrato
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {propostasFiltradas.length === 0 && (
          <Card className="border-[#D3AF37]/20">
            <CardContent className="p-12 text-center">
              <FileText className="h-12 w-12 text-black/20 mx-auto mb-4" />
              <p className="text-black/60">Nenhuma proposta encontrada com os filtros aplicados.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog: Registrar Feedback */}
      <Dialog open={dialogFeedback} onOpenChange={setDialogFeedback}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Registrar Feedback do Cliente</DialogTitle>
            <DialogDescription>
              Anote o retorno do cliente sobre a proposta
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-black/70">Feedback / Observação</Label>
              <Textarea
                value={novoFeedback}
                onChange={(e) => setNovoFeedback(e.target.value)}
                placeholder="Ex: Cliente solicitou desconto de 10%, Cliente aprovou técnica mas precisa aprovar internamente, etc."
                rows={4}
              />
            </div>

            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Dica:</strong> Registre informações como solicitações de desconto, 
                ajustes de escopo, prazos de retorno do cliente, etc.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogFeedback(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleSalvarFeedback}
              className="bg-[#D3AF37] hover:bg-[#C49F2F] text-black"
              disabled={!novoFeedback}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Salvar Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Gerar Contrato */}
      <Dialog open={dialogContrato} onOpenChange={setDialogContrato}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black flex items-center gap-2">
              <FileSignature className="h-5 w-5 text-[#D3AF37]" />
              Gerar Contrato
            </DialogTitle>
            <DialogDescription>
              Avançar a proposta para a etapa de geração de contrato
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-[#D3AF37]/10 rounded-lg border border-[#D3AF37]/30 mb-4">
              <p className="text-sm text-black">
                A proposta será avançada para a etapa de geração de contrato (OS-13). 
                O lead será automaticamente convertido em cliente se ainda não foi.
              </p>
            </div>

            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-900">
                <strong>Próximos passos:</strong>
              </p>
              <ul className="text-sm text-green-800 mt-2 space-y-1 list-disc list-inside">
                <li>Proposta marcada como "Aprovada"</li>
                <li>Iniciado processo de geração de contrato (OS-13)</li>
                <li>Lead convertido em cliente automaticamente</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogContrato(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConfirmarContrato}
              className="bg-[#D3AF37] hover:bg-[#C49F2F] text-black"
            >
              <FileSignature className="h-4 w-4 mr-2" />
              Confirmar e Gerar Contrato
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}