import { logger } from '@/lib/utils/logger';
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  ArrowLeft,
  Phone, 
  Mail, 
  MapPin,
  Calendar,
  TrendingUp,
  User,
  Globe,
  Plus,
  CheckCircle,
  PhoneCall,
  MessageSquare,
  FileText,
  Users,
  ClipboardList,
  Eye,
  UserCheck
} from 'lucide-react';
import { 
  getLeadById, 
  getInteracoesByLeadId, 
  getPropostasByLeadId,
  TipoInteracao,
  StatusLead
} from '../../lib/mock-data-comercial';

interface DetalhesLeadProps {
  leadId: string;
  onBack: () => void;
}

export default function DetalhesLead({ leadId, onBack }: DetalhesLeadProps) {
  const [dialogInteracao, setDialogInteracao] = useState(false);
  const [dialogConversao, setDialogConversao] = useState(false);

  const lead = getLeadById(leadId || '');
  const interacoes = getInteracoesByLeadId(leadId || '');
  const propostas = getPropostasByLeadId(leadId || '');

  // Form Registrar Interação
  const [novaInteracao, setNovaInteracao] = useState({
    tipo: 'LIGACAO' as TipoInteracao,
    descricao: '',
    proximo_passo: ''
  });

  if (!lead) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-black/60">Lead não encontrado</p>
            <Button 
              onClick={() => onBack()}
              className="mt-4"
              variant="outline"
            >
              Voltar para Leads
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const getStatusBadge = (status: StatusLead) => {
    const statusMap: Record<StatusLead, { label: string; color: string }> = {
      'NOVO': { label: 'Novo', color: 'bg-[#D3AF37] text-black' },
      'EM_CONTATO': { label: 'Em Contato', color: 'bg-[#DDC063] text-black' },
      'VISTORIA_AGENDADA': { label: 'Vistoria Agendada', color: 'bg-blue-100 text-blue-800' },
      'PROPOSTA_ENVIADA': { label: 'Proposta Enviada', color: 'bg-purple-100 text-purple-800' },
      'NEGOCIACAO': { label: 'Negociação', color: 'bg-orange-100 text-orange-800' },
      'CONVERTIDO_GANHO': { label: 'Convertido', color: 'bg-green-100 text-green-800' },
      'PERDIDO': { label: 'Perdido', color: 'bg-red-100 text-red-800' },
      'CANCELADO': { label: 'Cancelado', color: 'bg-gray-100 text-gray-800' }
    };
    return statusMap[status];
  };

  const getTipoInteracaoIcon = (tipo: TipoInteracao) => {
    const iconMap: Record<TipoInteracao, JSX.Element> = {
      'LIGACAO': <Phone className="h-4 w-4" />,
      'WHATSAPP': <MessageSquare className="h-4 w-4" />,
      'EMAIL': <Mail className="h-4 w-4" />,
      'REUNIAO': <Users className="h-4 w-4" />,
      'VISTORIA': <Eye className="h-4 w-4" />,
      'PROPOSTA_ENVIADA': <FileText className="h-4 w-4" />,
      'CONTRATO_ENVIADO': <FileText className="h-4 w-4" />,
      'FEEDBACK_CLIENTE': <MessageSquare className="h-4 w-4" />,
      'ANOTACAO': <ClipboardList className="h-4 w-4" />
    };
    return iconMap[tipo];
  };

  const getTipoInteracaoLabel = (tipo: TipoInteracao) => {
    const labelMap: Record<TipoInteracao, string> = {
      'LIGACAO': 'Ligação',
      'WHATSAPP': 'WhatsApp',
      'EMAIL': 'E-mail',
      'REUNIAO': 'Reunião',
      'VISTORIA': 'Vistoria',
      'PROPOSTA_ENVIADA': 'Proposta Enviada',
      'CONTRATO_ENVIADO': 'Contrato Enviado',
      'FEEDBACK_CLIENTE': 'Feedback do Cliente',
      'ANOTACAO': 'Anotação'
    };
    return labelMap[tipo];
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleRegistrarInteracao = () => {
    logger.log('Nova interação registrada:', novaInteracao);
    setDialogInteracao(false);
    setNovaInteracao({
      tipo: 'LIGACAO',
      descricao: '',
      proximo_passo: ''
    });
  };

  const handleConverterCliente = () => {
    logger.log('Lead convertido em cliente:', lead.id);
    setDialogConversao(false);
    onBack();
  };

  const statusInfo = getStatusBadge(lead.status);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onBack()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-black">{lead.nome}</h1>
              <Badge className={statusInfo.color}>
                {statusInfo.label}
              </Badge>
            </div>
            <p className="text-black/60">{lead.interesse}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setDialogInteracao(true)}
            className="border-[#D3AF37] text-black hover:bg-[#D3AF37]/10"
          >
            <Plus className="h-4 w-4 mr-2" />
            Registrar Interação
          </Button>
          {lead.status !== 'CONVERTIDO_GANHO' && lead.status !== 'PERDIDO' && lead.status !== 'CANCELADO' && (
            <Button
              onClick={() => setDialogConversao(true)}
              className="bg-[#D3AF37] hover:bg-[#C49F2F] text-black"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Converter em Cliente
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna Esquerda: Dados do Lead */}
        <div className="lg:col-span-1 space-y-6">
          {/* Informações de Contato */}
          <Card className="border-[#D3AF37]/20">
            <CardHeader>
              <CardTitle className="text-black">Informações de Contato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-[#D3AF37] mt-0.5" />
                <div>
                  <p className="text-sm text-black/60">Telefone</p>
                  <p className="text-black">{lead.telefone}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-[#D3AF37] mt-0.5" />
                <div>
                  <p className="text-sm text-black/60">E-mail</p>
                  <p className="text-black">{lead.email}</p>
                </div>
              </div>

              {lead.cidade && (
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-[#D3AF37] mt-0.5" />
                  <div>
                    <p className="text-sm text-black/60">Localização</p>
                    <p className="text-black">{lead.cidade}</p>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <Globe className="h-5 w-5 text-[#D3AF37] mt-0.5" />
                <div>
                  <p className="text-sm text-black/60">Origem</p>
                  <p className="text-black capitalize">{lead.origem.toLowerCase().replace(/_/g, ' ')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-[#D3AF37] mt-0.5" />
                <div>
                  <p className="text-sm text-black/60">Responsável</p>
                  <p className="text-black">{lead.responsavelNome}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Datas Importantes */}
          <Card className="border-[#D3AF37]/20">
            <CardHeader>
              <CardTitle className="text-black">Datas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-[#D3AF37] mt-0.5" />
                <div>
                  <p className="text-sm text-black/60">Data de Cadastro</p>
                  <p className="text-black">{formatDateTime(lead.dataCadastro)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-[#D3AF37] mt-0.5" />
                <div>
                  <p className="text-sm text-black/60">Última Interação</p>
                  <p className="text-black">{formatDateTime(lead.ultimaInteracao)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Valor Estimado */}
          {lead.valorEstimado && (
            <Card className="border-[#D3AF37]/20 bg-[#D3AF37]/5">
              <CardHeader>
                <CardTitle className="text-black flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-[#D3AF37]" />
                  Valor Estimado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl text-black">
                  R$ {lead.valorEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {lead.observacoes && (
            <Card className="border-[#D3AF37]/20">
              <CardHeader>
                <CardTitle className="text-black">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-black/70 text-sm">{lead.observacoes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Coluna Direita: Timeline e Propostas */}
        <div className="lg:col-span-2 space-y-6">
          {/* Histórico de Interações */}
          <Card className="border-[#D3AF37]/20">
            <CardHeader>
              <CardTitle className="text-black">Histórico de Interações</CardTitle>
              <p className="text-sm text-black/60">
                Timeline completa de contatos e ações com o lead
              </p>
            </CardHeader>
            <CardContent>
              {interacoes.length > 0 ? (
                <div className="space-y-4">
                  {interacoes.map((interacao, index) => (
                    <div key={interacao.id}>
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#D3AF37]/20 text-[#D3AF37]">
                            {getTipoInteracaoIcon(interacao.tipo)}
                          </div>
                          {index < interacoes.length - 1 && (
                            <div className="w-0.5 h-full bg-[#D3AF37]/20 my-2 min-h-[40px]" />
                          )}
                        </div>

                        <div className="flex-1 pb-6">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <p className="text-black">
                                {getTipoInteracaoLabel(interacao.tipo)}
                              </p>
                              <p className="text-sm text-black/60">
                                {formatDateTime(interacao.data)} • {interacao.usuarioNome}
                              </p>
                            </div>
                          </div>
                          
                          <p className="text-black/70 text-sm mb-2">
                            {interacao.descricao}
                          </p>

                          {interacao.proximo_passo && (
                            <div className="mt-2 p-3 bg-[#DDC063]/10 rounded-lg border-l-4 border-[#D3AF37]">
                              <p className="text-sm text-black/70">
                                <span className="text-black">Próximo passo:</span> {interacao.proximo_passo}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-black/60">
                  Nenhuma interação registrada ainda
                </div>
              )}
            </CardContent>
          </Card>

          {/* Propostas Relacionadas */}
          <Card className="border-[#D3AF37]/20">
            <CardHeader>
              <CardTitle className="text-black">Propostas Comerciais</CardTitle>
              <p className="text-sm text-black/60">
                OS Tipo 1-4 (Orçamentos e Laudos) vinculadas a este lead
              </p>
            </CardHeader>
            <CardContent>
              {propostas.length > 0 ? (
                <div className="space-y-4">
                  {propostas.map(proposta => (
                    <div 
                      key={proposta.id}
                      className="p-4 border border-[#D3AF37]/20 rounded-lg hover:border-[#D3AF37]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="h-4 w-4 text-[#D3AF37]" />
                            <span className="text-black">{proposta.osNumero}</span>
                            <Badge 
                              variant="outline"
                              className="border-[#D3AF37] text-black"
                            >
                              {proposta.tipoServico}
                            </Badge>
                          </div>
                          <p className="text-sm text-black/70">{proposta.descricaoServico}</p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg text-[#D3AF37]">
                            R$ {(proposta.valorProposta / 1000).toFixed(0)}k
                          </p>
                          <p className="text-xs text-black/60 capitalize">
                            {proposta.status.toLowerCase().replace(/_/g, ' ')}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-black/60">
                        <span>Enviado em {new Date(proposta.dataEnvio).toLocaleDateString('pt-BR')}</span>
                        {proposta.prazoExecucao && <span>Prazo: {proposta.prazoExecucao}</span>}
                      </div>

                      {proposta.feedbacks.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {proposta.feedbacks.map((feedback, idx) => (
                            <p key={idx} className="text-sm text-black/70 pl-4 border-l-2 border-[#D3AF37]/30">
                              {feedback}
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-black/60">
                  Nenhuma proposta vinculada a este lead ainda
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dialog: Registrar Interação */}
      <Dialog open={dialogInteracao} onOpenChange={setDialogInteracao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black">Registrar Interação</DialogTitle>
            <DialogDescription>
              Registre um novo contato ou ação realizada com este lead
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-black/70">Tipo de Interação</Label>
              <Select 
                value={novaInteracao.tipo} 
                onValueChange={(value) => setNovaInteracao({ ...novaInteracao, tipo: value as TipoInteracao })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LIGACAO">Ligação</SelectItem>
                  <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                  <SelectItem value="EMAIL">E-mail</SelectItem>
                  <SelectItem value="REUNIAO">Reunião</SelectItem>
                  <SelectItem value="VISTORIA">Vistoria</SelectItem>
                  <SelectItem value="FEEDBACK_CLIENTE">Feedback do Cliente</SelectItem>
                  <SelectItem value="ANOTACAO">Anotação</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-black/70">Descrição *</Label>
              <Textarea
                value={novaInteracao.descricao}
                onChange={(e) => setNovaInteracao({ ...novaInteracao, descricao: e.target.value })}
                placeholder="Descreva o que foi discutido ou realizado..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black/70">Próximo Passo (opcional)</Label>
              <Textarea
                value={novaInteracao.proximo_passo}
                onChange={(e) => setNovaInteracao({ ...novaInteracao, proximo_passo: e.target.value })}
                placeholder="Ex: Agendar vistoria técnica para próxima semana"
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogInteracao(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleRegistrarInteracao}
              className="bg-[#D3AF37] hover:bg-[#C49F2F] text-black"
              disabled={!novaInteracao.descricao}
            >
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Converter em Cliente */}
      <Dialog open={dialogConversao} onOpenChange={setDialogConversao}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-black flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-[#D3AF37]" />
              Converter Lead em Cliente
            </DialogTitle>
            <DialogDescription>
              O lead será movido para a base de clientes e poderá iniciar OS de serviço ou contrato
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="p-4 bg-[#D3AF37]/10 rounded-lg border border-[#D3AF37]/30">
              <p className="text-black mb-2">
                <strong>Lead:</strong> {lead.nome}
              </p>
              <p className="text-black/70 text-sm mb-2">
                <strong>Interesse:</strong> {lead.interesse}
              </p>
              {lead.valorEstimado && (
                <p className="text-black/70 text-sm">
                  <strong>Valor Estimado:</strong> R$ {lead.valorEstimado.toLocaleString('pt-BR')}
                </p>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <strong>Próximos passos:</strong>
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>Lead será marcado como "Convertido/Ganho"</li>
                <li>Dados migrados para a base de Clientes</li>
                <li>Você poderá iniciar OS de Contrato (OS-13) ou OS de Serviço</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogConversao(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleConverterCliente}
              className="bg-[#D3AF37] hover:bg-[#C49F2F] text-black"
            >
              <UserCheck className="h-4 w-4 mr-2" />
              Confirmar Conversão
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}