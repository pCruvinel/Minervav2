import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
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
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Search, 
  Filter,
  Eye,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  Calendar,
  User
} from 'lucide-react';
import { mockLeads, StatusLead, OrigemLead } from '../../lib/mock-data-comercial';

interface ListaLeadsProps {
  onLeadClick: (leadId: string) => void;
}

export default function ListaLeads({ onLeadClick }: ListaLeadsProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroStatus, setFiltroStatus] = useState<string>('TODOS');
  const [filtroOrigem, setFiltroOrigem] = useState<string>('TODOS');
  const [dialogNovoLead, setDialogNovoLead] = useState(false);

  // Formulário Novo Lead
  const [novoLeadForm, setNovoLeadForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    origem: 'SITE' as OrigemLead,
    interesse: '',
    cidade: '',
    observacoes: ''
  });

  // Filtros aplicados
  const leadsFiltrados = mockLeads.filter(lead => {
    const matchSearch = 
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.interesse.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchStatus = filtroStatus === 'TODOS' || lead.status === filtroStatus;
    const matchOrigem = filtroOrigem === 'TODOS' || lead.origem === filtroOrigem;

    return matchSearch && matchStatus && matchOrigem;
  });

  // Mapeamento de Status para Badge
  const getStatusBadge = (status: StatusLead) => {
    const statusMap: Record<StatusLead, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
      'NOVO': { label: 'Novo', variant: 'default' },
      'EM_CONTATO': { label: 'Em Contato', variant: 'secondary' },
      'VISTORIA_AGENDADA': { label: 'Vistoria Agendada', variant: 'outline' },
      'PROPOSTA_ENVIADA': { label: 'Proposta Enviada', variant: 'outline' },
      'NEGOCIACAO': { label: 'Negociação', variant: 'default' },
      'CONVERTIDO_GANHO': { label: 'Convertido', variant: 'outline' },
      'PERDIDO': { label: 'Perdido', variant: 'destructive' },
      'CANCELADO': { label: 'Cancelado', variant: 'destructive' }
    };
    return statusMap[status];
  };

  // Mapeamento de Origem
  const getOrigemLabel = (origem: OrigemLead) => {
    const origemMap: Record<OrigemLead, string> = {
      'SITE': 'Site',
      'INDICACAO': 'Indicação',
      'REDES_SOCIAIS': 'Redes Sociais',
      'TELEFONE': 'Telefone',
      'EMAIL': 'E-mail',
      'EVENTO': 'Evento',
      'PARCEIRO': 'Parceiro'
    };
    return origemMap[origem];
  };

  const handleNovoLead = () => {
    console.log('Novo Lead criado:', novoLeadForm);
    setDialogNovoLead(false);
    // Reset form
    setNovoLeadForm({
      nome: '',
      email: '',
      telefone: '',
      origem: 'SITE',
      interesse: '',
      cidade: '',
      observacoes: ''
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black">Gestão de Leads</h1>
          <p className="text-black/60">Base completa de leads e oportunidades comerciais</p>
        </div>
        <Button 
          onClick={() => setDialogNovoLead(true)}
          className="bg-[#D3AF37] hover:bg-[#C49F2F] text-black"
        >
          <Plus className="h-4 w-4 mr-2" />
          Novo Lead
        </Button>
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
            {/* Busca */}
            <div className="space-y-2">
              <Label className="text-black/70">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-black/40" />
                <Input
                  placeholder="Nome, email ou interesse..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Filtro Status */}
            <div className="space-y-2">
              <Label className="text-black/70">Status</Label>
              <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Status</SelectItem>
                  <SelectItem value="NOVO">Novo</SelectItem>
                  <SelectItem value="EM_CONTATO">Em Contato</SelectItem>
                  <SelectItem value="VISTORIA_AGENDADA">Vistoria Agendada</SelectItem>
                  <SelectItem value="PROPOSTA_ENVIADA">Proposta Enviada</SelectItem>
                  <SelectItem value="NEGOCIACAO">Negociação</SelectItem>
                  <SelectItem value="CONVERTIDO_GANHO">Convertido/Ganho</SelectItem>
                  <SelectItem value="PERDIDO">Perdido</SelectItem>
                  <SelectItem value="CANCELADO">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Origem */}
            <div className="space-y-2">
              <Label className="text-black/70">Origem</Label>
              <Select value={filtroOrigem} onValueChange={setFiltroOrigem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas as Origens</SelectItem>
                  <SelectItem value="SITE">Site</SelectItem>
                  <SelectItem value="INDICACAO">Indicação</SelectItem>
                  <SelectItem value="REDES_SOCIAIS">Redes Sociais</SelectItem>
                  <SelectItem value="TELEFONE">Telefone</SelectItem>
                  <SelectItem value="EMAIL">E-mail</SelectItem>
                  <SelectItem value="EVENTO">Evento</SelectItem>
                  <SelectItem value="PARCEIRO">Parceiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-black/60">
              Mostrando {leadsFiltrados.length} de {mockLeads.length} leads
            </p>
            {(searchTerm || filtroStatus !== 'TODOS' || filtroOrigem !== 'TODOS') && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  setSearchTerm('');
                  setFiltroStatus('TODOS');
                  setFiltroOrigem('TODOS');
                }}
              >
                Limpar Filtros
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Leads */}
      <div className="grid grid-cols-1 gap-4">
        {leadsFiltrados.map(lead => {
          const statusInfo = getStatusBadge(lead.status);
          return (
            <Card key={lead.id} className="border-[#D3AF37]/20 hover:border-[#D3AF37]/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  {/* Informações Principais */}
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-black text-lg">{lead.nome}</h3>
                          <Badge 
                            variant={statusInfo.variant}
                            className={
                              statusInfo.variant === 'default' ? 'bg-[#D3AF37] text-black hover:bg-[#C49F2F]' :
                              statusInfo.variant === 'outline' ? 'border-[#D3AF37] text-black' :
                              ''
                            }
                          >
                            {statusInfo.label}
                          </Badge>
                          <span className="text-sm text-black/50 px-2 py-1 bg-black/5 rounded">
                            {getOrigemLabel(lead.origem)}
                          </span>
                        </div>
                        
                        <p className="text-black/70 mb-3">{lead.interesse}</p>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-[#D3AF37]" />
                            <span className="text-black/70">{lead.telefone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-[#D3AF37]" />
                            <span className="text-black/70">{lead.email}</span>
                          </div>
                          {lead.cidade && (
                            <div className="flex items-center gap-2 text-sm">
                              <MapPin className="h-4 w-4 text-[#D3AF37]" />
                              <span className="text-black/70">{lead.cidade}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-[#D3AF37]" />
                            <span className="text-black/70">{lead.responsavelNome}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 mt-3 text-sm text-black/60">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Cadastro: {formatDate(lead.dataCadastro)}
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            Última interação: {formatDateTime(lead.ultimaInteracao)}
                          </div>
                        </div>
                      </div>

                      {/* Valor Estimado */}
                      {lead.valorEstimado && (
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-[#D3AF37] mb-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="text-sm">Valor Estimado</span>
                          </div>
                          <p className="text-2xl text-black">
                            R$ {(lead.valorEstimado / 1000).toFixed(0)}k
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Observações */}
                    {lead.observacoes && (
                      <div className="pt-3 border-t border-black/10">
                        <p className="text-sm text-black/60">
                          <span className="text-black/80">Obs:</span> {lead.observacoes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="ml-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onLeadClick(lead.id)}
                      className="border-[#D3AF37] text-black hover:bg-[#D3AF37]/10"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {leadsFiltrados.length === 0 && (
          <Card className="border-[#D3AF37]/20">
            <CardContent className="p-12 text-center">
              <Search className="h-12 w-12 text-black/20 mx-auto mb-4" />
              <p className="text-black/60">Nenhum lead encontrado com os filtros aplicados.</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Dialog Novo Lead */}
      <Dialog open={dialogNovoLead} onOpenChange={setDialogNovoLead}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">Cadastrar Novo Lead</DialogTitle>
            <DialogDescription>
              Preencha as informações do lead para adicionar à base comercial
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label className="text-black/70">Nome / Empresa *</Label>
              <Input
                value={novoLeadForm.nome}
                onChange={(e) => setNovoLeadForm({ ...novoLeadForm, nome: e.target.value })}
                placeholder="Ex: João Silva Construtora"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black/70">Email *</Label>
              <Input
                type="email"
                value={novoLeadForm.email}
                onChange={(e) => setNovoLeadForm({ ...novoLeadForm, email: e.target.value })}
                placeholder="contato@empresa.com"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black/70">Telefone *</Label>
              <Input
                value={novoLeadForm.telefone}
                onChange={(e) => setNovoLeadForm({ ...novoLeadForm, telefone: e.target.value })}
                placeholder="(11) 98765-4321"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black/70">Origem *</Label>
              <Select 
                value={novoLeadForm.origem} 
                onValueChange={(value) => setNovoLeadForm({ ...novoLeadForm, origem: value as OrigemLead })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SITE">Site</SelectItem>
                  <SelectItem value="INDICACAO">Indicação</SelectItem>
                  <SelectItem value="REDES_SOCIAIS">Redes Sociais</SelectItem>
                  <SelectItem value="TELEFONE">Telefone</SelectItem>
                  <SelectItem value="EMAIL">E-mail</SelectItem>
                  <SelectItem value="EVENTO">Evento</SelectItem>
                  <SelectItem value="PARCEIRO">Parceiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-black/70">Interesse / Necessidade *</Label>
              <Input
                value={novoLeadForm.interesse}
                onChange={(e) => setNovoLeadForm({ ...novoLeadForm, interesse: e.target.value })}
                placeholder="Ex: Laudo Técnico de Estrutura"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-black/70">Cidade</Label>
              <Input
                value={novoLeadForm.cidade}
                onChange={(e) => setNovoLeadForm({ ...novoLeadForm, cidade: e.target.value })}
                placeholder="São Paulo - SP"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="text-black/70">Observações</Label>
              <Textarea
                value={novoLeadForm.observacoes}
                onChange={(e) => setNovoLeadForm({ ...novoLeadForm, observacoes: e.target.value })}
                placeholder="Informações adicionais sobre o lead..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogNovoLead(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleNovoLead}
              className="bg-[#D3AF37] hover:bg-[#C49F2F] text-black"
              disabled={!novoLeadForm.nome || !novoLeadForm.email || !novoLeadForm.telefone || !novoLeadForm.interesse}
            >
              Cadastrar Lead
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}