"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Search, Building2, MapPin, Phone, Mail, Lock, History, Eye } from "lucide-react";
import { mockClientes } from "@/lib/mock-data-colaborador";
import { ClienteHistoricoCompleto } from "@/components/clientes/ClienteHistoricoCompleto";

// Mock de dados - substituir por API real

export default function ClientesConsultaPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [clienteHistoricoAberto, setClienteHistoricoAberto] = useState<string | null>(null);

  // Filtrar clientes pela busca
  const clientesFiltrados = mockClientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.endereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.telefone.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black mb-1">Consulta de Clientes</h1>
              <p className="text-muted-foreground">
                Visualize informações de contato e localização (somente leitura)
              </p>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-warning/5 border border-warning/20 rounded-lg">
              <Lock className="w-4 h-4 text-warning" />
              <span className="text-warning">Acesso Somente Leitura</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Busca */}
        <Card className="p-6 border-border mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, endereço, telefone ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-border"
            />
          </div>
        </Card>

        {/* Lista de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {clientesFiltrados.length === 0 ? (
            <div className="col-span-2">
              <Card className="p-12 border-border">
                <p className="text-center text-muted-foreground">
                  Nenhum cliente encontrado com os termos de busca
                </p>
              </Card>
            </div>
          ) : (
            clientesFiltrados.map((cliente) => (
              <Card
                key={cliente.id}
                className="p-6 border-border hover:border-[var(--primary)] transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-lg bg-[var(--primary)]/20 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-6 h-6 text-[var(--primary)]" />
                    </div>
                    <div>
                      <h3 className="text-black mb-1">{cliente.nome}</h3>
                      <p className="text-muted-foreground">
                        {cliente.tipo === "PESSOA_JURIDICA"
                          ? `CNPJ: ${cliente.cnpj}`
                          : `CPF: ${cliente.cpf}`}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-success/5 text-success border-success/30"
                  >
                    {cliente.status}
                  </Badge>
                </div>

                {/* Botão Histórico Completo */}
                <div className="mb-4">
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full border-[var(--primary)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white"
                      >
                        <History className="w-4 h-4 mr-2" />
                        Ver Histórico Completo
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Histórico Completo - {cliente.nome}
                        </DialogTitle>
                      </DialogHeader>
                      <ClienteHistoricoCompleto clienteId={cliente.id.toString()} />
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-black">{cliente.endereco}</p>
                      <p className="text-muted-foreground">CEP: {cliente.cep}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`tel:${cliente.telefone}`}
                      className="text-black hover:text-[var(--primary)] transition-colors"
                    >
                      {cliente.telefone}
                    </a>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <a
                      href={`mailto:${cliente.email}`}
                      className="text-black hover:text-[var(--primary)] transition-colors truncate"
                    >
                      {cliente.email}
                    </a>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <Badge
                    variant="outline"
                    className="border-[var(--primary)] text-black bg-[var(--primary)]/10"
                  >
                    {cliente.tipo === "PESSOA_JURIDICA"
                      ? "Pessoa Jurídica"
                      : "Pessoa Física"}
                  </Badge>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Informativo */}
        <Card className="mt-6 p-6 border-border bg-primary/5">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-black mb-1">Acesso Restrito</h3>
              <p className="text-muted-foreground">
                Como colaborador, você pode visualizar as informações de
                clientes para facilitar visitas e contatos, mas não pode
                criar, editar ou excluir registros. Para alterações, entre em
                contato com seu gestor.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}