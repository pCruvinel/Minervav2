"use client";

import { useState } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import {
  mockUserColaborador,
  mockLeads as initialMockLeads,
} from "@/lib/mock-data-colaborador";

export default function LeadsComercialPage() {
  // Mock de dados - substituir por API real
  const mockUser = mockUserColaborador;
  const [leads, setLeads] = useState(initialMockLeads);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<(typeof initialMockLeads)[0] | null>(
    null
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");

  const [formData, setFormData] = useState({
    nome: "",
    contato: "",
    telefone: "",
    email: "",
    origem: "",
    status: "NOVO",
    potencial: "MEDIO",
    observacoes: "",
  });

  const handleNovoLead = () => {
    setEditingLead(null);
    setFormData({
      nome: "",
      contato: "",
      telefone: "",
      email: "",
      origem: "",
      status: "NOVO",
      potencial: "MEDIO",
      observacoes: "",
    });
    setIsDialogOpen(true);
  };

  const handleEditarLead = (lead: (typeof initialMockLeads)[0]) => {
    setEditingLead(lead);
    setFormData({
      nome: lead.nome,
      contato: lead.contato,
      telefone: lead.telefone,
      email: lead.email,
      origem: lead.origem,
      status: lead.status,
      potencial: lead.potencial,
      observacoes: lead.observacoes || "",
    });
    setIsDialogOpen(true);
  };

  const handleSalvarLead = () => {
    if (editingLead) {
      // Editar lead existente
      setLeads(
        leads.map((l) =>
          l.id === editingLead.id
            ? { ...l, ...formData }
            : l
        )
      );
      toast.success("Lead atualizado com sucesso!");
    } else {
      // Criar novo lead
      const novoLead = {
        id: leads.length + 1,
        ...formData,
        criadoPor: mockUser.nome,
        criadoEm: new Date().toISOString().split("T")[0],
      };
      setLeads([...leads, novoLead]);
      toast.success("Lead criado com sucesso!");
    }
    setIsDialogOpen(false);
  };

  const leadsFiltrados = leads.filter((lead) => {
    const matchSearch =
      lead.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contato.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = filterStatus === "TODOS" || lead.status === filterStatus;

    return matchSearch && matchStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "NOVO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "EM_CONTATO":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "QUALIFICADO":
        return "bg-green-100 text-green-800 border-green-200";
      case "NAO_QUALIFICADO":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "CONVERTIDO":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPotencialColor = (potencial: string) => {
    switch (potencial) {
      case "ALTO":
        return "bg-red-50 text-red-700 border-red-300";
      case "MEDIO":
        return "bg-yellow-50 text-yellow-700 border-yellow-300";
      case "BAIXO":
        return "bg-green-50 text-green-700 border-green-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  // Verificar se o usuário é do setor administrativo
  if (mockUser.setor !== "ADMINISTRATIVO") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 border-gray-200 max-w-md">
          <div className="text-center">
            <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-black mb-2">Acesso Restrito</h2>
            <p className="text-gray-600 mb-4">
              Esta área é exclusiva para colaboradores do setor administrativo.
            </p>
            <Button
              onClick={() => window.history.back()}
              className="bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black"
            >
              Voltar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black mb-1">Gestão de Leads</h1>
              <p className="text-gray-600">
                Gerencie oportunidades de vendas e novos clientes
              </p>
            </div>
            <Button
              onClick={handleNovoLead}
              className="bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black"
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
          <Card className="p-6 border-gray-200">
            <p className="text-gray-600 mb-2">Total de Leads</p>
            <p className="text-black">{leads.length}</p>
          </Card>
          <Card className="p-6 border-gray-200">
            <p className="text-gray-600 mb-2">Novos</p>
            <p className="text-black">
              {leads.filter((l) => l.status === "NOVO").length}
            </p>
          </Card>
          <Card className="p-6 border-gray-200">
            <p className="text-gray-600 mb-2">Em Contato</p>
            <p className="text-black">
              {leads.filter((l) => l.status === "EM_CONTATO").length}
            </p>
          </Card>
          <Card className="p-6 border-gray-200">
            <p className="text-gray-600 mb-2">Qualificados</p>
            <p className="text-black">
              {leads.filter((l) => l.status === "QUALIFICADO").length}
            </p>
          </Card>
        </div>

        {/* Filtros */}
        <Card className="p-6 border-gray-200 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, contato ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[200px] border-gray-300">
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
              <Card className="p-12 border-gray-200">
                <p className="text-center text-gray-500">
                  Nenhum lead encontrado
                </p>
              </Card>
            </div>
          ) : (
            leadsFiltrados.map((lead) => (
              <Card
                key={lead.id}
                className="p-6 border-gray-200 hover:border-[#D3AF37] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-12 h-12 rounded-lg bg-[#D3AF37]/20 flex items-center justify-center flex-shrink-0">
                      <TrendingUp className="w-6 h-6 text-[#D3AF37]" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-black mb-1">{lead.nome}</h3>
                      <p className="text-gray-600">Contato: {lead.contato}</p>
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
                  <div className="flex items-center gap-2 text-gray-700">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <a
                      href={`tel:${lead.telefone}`}
                      className="hover:text-[#D3AF37] transition-colors"
                    >
                      {lead.telefone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <a
                      href={`mailto:${lead.email}`}
                      className="hover:text-[#D3AF37] transition-colors truncate"
                    >
                      {lead.email}
                    </a>
                  </div>
                </div>

                {lead.observacoes && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-700">{lead.observacoes}</p>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="outline" className={getStatusColor(lead.status)}>
                    {lead.status.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline" className={getPotencialColor(lead.potencial)}>
                    {lead.potencial}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-gray-300 text-gray-700"
                  >
                    {lead.origem}
                  </Badge>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 text-gray-500">
                  Criado em {new Date(lead.criadoEm).toLocaleDateString("pt-BR")}
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
                <Label htmlFor="nome" className="text-black">
                  Nome da Empresa *
                </Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) =>
                    setFormData({ ...formData, nome: e.target.value })
                  }
                  className="border-gray-300"
                  placeholder="Ex: Empresa ABC Ltda"
                />
              </div>
              <div>
                <Label htmlFor="contato" className="text-black">
                  Nome do Contato *
                </Label>
                <Input
                  id="contato"
                  value={formData.contato}
                  onChange={(e) =>
                    setFormData({ ...formData, contato: e.target.value })
                  }
                  className="border-gray-300"
                  placeholder="Ex: João Silva"
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
                  className="border-gray-300"
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
                  className="border-gray-300"
                  placeholder="contato@empresa.com.br"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="origem" className="text-black">
                  Origem *
                </Label>
                <Select
                  value={formData.origem}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, origem: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SITE">Site</SelectItem>
                    <SelectItem value="TELEFONE">Telefone</SelectItem>
                    <SelectItem value="EMAIL">E-mail</SelectItem>
                    <SelectItem value="INDICACAO">Indicação</SelectItem>
                    <SelectItem value="REDES_SOCIAIS">Redes Sociais</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="status" className="text-black">
                  Status
                </Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, status: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NOVO">Novo</SelectItem>
                    <SelectItem value="EM_CONTATO">Em Contato</SelectItem>
                    <SelectItem value="QUALIFICADO">Qualificado</SelectItem>
                    <SelectItem value="NAO_QUALIFICADO">Não Qualificado</SelectItem>
                    <SelectItem value="CONVERTIDO">Convertido</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="potencial" className="text-black">
                  Potencial
                </Label>
                <Select
                  value={formData.potencial}
                  onValueChange={(value: string) =>
                    setFormData({ ...formData, potencial: value })
                  }
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALTO">Alto</SelectItem>
                    <SelectItem value="MEDIO">Médio</SelectItem>
                    <SelectItem value="BAIXO">Baixo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

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
                className="border-gray-300 min-h-[100px]"
                placeholder="Informações adicionais sobre o lead..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-300"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarLead}
              className="bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black"
            >
              {editingLead ? "Salvar Alterações" : "Criar Lead"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}