"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Plus,
  Search,
  Edit2,
  Phone,
  Mail,
  Building2,
  TrendingUp,
  Filter,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/contexts/auth-context";
import { supabase } from "@/lib/supabase-client";
import { logger } from "@/lib/utils/logger";

interface Lead {
  id: string;
  nome_razao_social: string;
  cpf_cnpj: string;
  email: string;
  telefone: string;
  tipo_cliente: 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
  endereco: {
    logradouro?: string;
    numero?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export default function LeadsComercialPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  // Carregar leads do colaborador autenticado
  useEffect(() => {
    if (currentUser?.id) {
      fetchLeads();
    }
  }, [currentUser?.id]);

  const fetchLeads = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('status', 'lead')
        .eq('responsavel_id', currentUser?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setLeads(data || []);
    } catch (error) {
      logger.error('Erro ao buscar leads:', error);
      toast.error('Erro ao carregar leads');
    } finally {
      setLoading(false);
    }
  };

  const [formData, setFormData] = useState<{
    nome_razao_social: string;
    cpf_cnpj: string;
    telefone: string;
    email: string;
    tipo_cliente: 'PESSOA_FISICA' | 'PESSOA_JURIDICA';
    observacoes: string;
  }>({
    nome_razao_social: "",
    cpf_cnpj: "",
    telefone: "",
    email: "",
    tipo_cliente: "PESSOA_FISICA",
    observacoes: "",
  });

  const handleNovoLead = () => {
    setEditingLead(null);
    setFormData({
      nome_razao_social: "",
      cpf_cnpj: "",
      telefone: "",
      email: "",
      tipo_cliente: "PESSOA_FISICA",
      observacoes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditarLead = (lead: Lead) => {
    setEditingLead(lead);
    setFormData({
      nome_razao_social: lead.nome_razao_social,
      cpf_cnpj: lead.cpf_cnpj,
      telefone: lead.telefone,
      email: lead.email,
      tipo_cliente: lead.tipo_cliente,
      observacoes: lead.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSalvarLead = async () => {
    try {
      if (editingLead) {
        // Editar lead existente
        const { error } = await supabase
          .from('clientes')
          .update(formData)
          .eq('id', editingLead.id);

        if (error) throw error;
        toast.success("Lead atualizado com sucesso!");
      } else {
        // Criar novo lead
        const { error } = await supabase
          .from('clientes')
          .insert([{
            ...formData,
            status: 'lead',
            responsavel_id: currentUser?.id
          }]);

        if (error) throw error;
        toast.success("Lead criado com sucesso!");
      }
      setIsDialogOpen(false);
      fetchLeads();
    } catch (error) {
      logger.error('Erro ao salvar lead:', error);
      toast.error('Erro ao salvar lead');
    }
  };

  const leadsFiltrados = leads.filter((lead) => {
    const matchSearch =
      lead.nome_razao_social.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    // TODO: Implementar filtro por status quando campo existir no schema
    const matchStatus = filterStatus === "TODOS";

    return matchSearch && matchStatus;
  });


  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Acesso negado</h2>
          <p className="text-muted-foreground">Você precisa estar logado para acessar esta página.</p>
        </div>
      </div>
    );
  }

  // Verificar se o usuário é do setor administrativo
  if (currentUser.setor !== "ADMINISTRATIVO") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 border-border max-w-md">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-black mb-2">Acesso Restrito</h2>
            <p className="text-muted-foreground mb-4">
              Esta área é exclusiva para colaboradores do setor administrativo.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black"
            >
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black mb-1">Gestão de Leads</h1>
              <p className="text-muted-foreground">
                Gerencie oportunidades de vendas e novos clientes
              </p>
            </div>
            <Button
              onClick={handleNovoLead}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black"
            >
              <Plus className="w-4 h-4 mr-2" />
              Novo Lead
            </Button>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="p-6 border-border">
            <p className="text-muted-foreground mb-2">Total de Leads</p>
            <p className="text-black">{leads.length}</p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-muted-foreground mb-2">Pessoa Física</p>
            <p className="text-black">
              {leads.filter((l) => l.tipo_cliente === "PESSOA_FISICA").length}
            </p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-muted-foreground mb-2">Pessoa Jurídica</p>
            <p className="text-black">
              {leads.filter((l) => l.tipo_cliente === "PESSOA_JURIDICA").length}
            </p>
          </Card>
          <Card className="p-6 border-border">
            <p className="text-muted-foreground mb-2">Esta Semana</p>
            <p className="text-black">
              {leads.filter((l) => {
                const created = new Date(l.created_at);
                const weekAgo = new Date();
                weekAgo.setDate(weekAgo.getDate() - 7);
                return created >= weekAgo;
              }).length}
            </p>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-6 border-border mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome, contato ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-border"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px] border-border">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Status</SelectItem>
                  <SelectItem value="NOVO">Novo</SelectItem>
                  <SelectItem value="EM_CONTATO">Em Contato</SelectItem>
                  <SelectItem value="QUALIFICADO">Qualificado</SelectItem>
                  <SelectItem value="NAO_QUALIFICADO">Não Qualificado</SelectItem>
                  <SelectItem value="CONVERTIDO">Convertido</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Lista de Leads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {leadsFiltrados.length === 0 ? (
            <div className="col-span-2">
              <Card className="p-12 border-border">
                <p className="text-center text-muted-foreground">
                  Nenhum lead encontrado
                </p>
              </Card>
            </div>
          ) : (
            leadsFiltrados.map((lead) => (
              <Card
                key={lead.id}
                className="p-6 border-border hover:border-[var(--primary)] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-black mb-1">{lead.nome_razao_social}</h3>
                      <p className="text-muted-foreground">CPF/CNPJ: {lead.cpf_cnpj}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditarLead(lead)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`tel:${lead.telefone}`}
                      className="hover:text-[var(--primary)] transition-colors"
                    >
                      {lead.telefone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="hover:text-[var(--primary)] transition-colors truncate"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>

                {lead.observacoes && (
                  <div className="mb-4 p-3 bg-background rounded-lg border border-border">
                    <p className="text-muted-foreground">{lead.observacoes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline">
                    {lead.tipo_cliente === 'PESSOA_FISICA' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                  {/* TODO: Adicionar campos status, potencial, origem ao schema */}
                </div>

                <div className="mt-4 pt-4 border-t border-border text-muted-foreground">
                  Criado em {new Date(lead.created_at).toLocaleDateString("pt-BR")}
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Dialog de Novo/Editar Lead */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">
              {editingLead ? "Editar Lead" : "Novo Lead"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nome_razao_social" className="text-black">
                  Nome / Razão Social *
                </Label>
                <Input
                  id="nome_razao_social"
                  value={formData.nome_razao_social}
                  onChange={(e) =>
                    setFormData({ ...formData, nome_razao_social: e.target.value })
                  }
                  className="border-border"
                  placeholder="Ex: Empresa ABC Ltda ou João Silva"
                />
              </div>
              <div>
                <Label htmlFor="cpf_cnpj" className="text-black">
                  CPF / CNPJ *
                </Label>
                <Input
                  id="cpf_cnpj"
                  value={formData.cpf_cnpj}
                  onChange={(e) =>
                    setFormData({ ...formData, cpf_cnpj: e.target.value })
                  }
                  className="border-border"
                  placeholder="000.000.000-00 ou 00.000.000/0000-00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="telefone" className="text-black">
                  Telefone *
                </Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) =>
                    setFormData({ ...formData, telefone: e.target.value })
                  }
                  className="border-border"
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-black">
                  E-mail *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="border-border"
                  placeholder="contato@empresa.com.br"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="tipo_cliente" className="text-black">
                Tipo de Cliente *
              </Label>
              <Select
                value={formData.tipo_cliente}
                onValueChange={(value: "PESSOA_FISICA" | "PESSOA_JURIDICA") =>
                  setFormData({ ...formData, tipo_cliente: value })
                }
              >
                <SelectTrigger className="border-border">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PESSOA_FISICA">Pessoa Física</SelectItem>
                  <SelectItem value="PESSOA_JURIDICA">Pessoa Jurídica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TODO: Adicionar campos origem, status, potencial ao schema clientes */}

            <div>
              <Label htmlFor="observacoes" className="text-black">
                Observações
              </Label>
              <Textarea
                id="observacoes"
                value={formData.observacoes}
                onChange={(e) =>
                  setFormData({ ...formData, observacoes: e.target.value })
                }
                className="border-border min-h-[100px]"
                placeholder="Informações adicionais sobre o lead..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarLead}
              className="bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black"
            >
              {editingLead ? "Salvar Alterações" : "Criar Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}