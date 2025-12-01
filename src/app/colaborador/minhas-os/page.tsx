"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Eye, Filter } from "lucide-react";
import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/design-system";
import { getStatusColor, getPrioridadeColor } from "@/lib/color-utils";
import {
  mockUserColaborador,
  mockOrdensServico,
} from "@/lib/mock-data-colaborador";

// Mock de dados - substituir por API real
const mockUser = mockUserColaborador;
const mockOrdemServico = mockOrdensServico;

export default function MinhasOSPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [filterPrioridade, setFilterPrioridade] = useState("TODOS");

  // Filtrar OS do usuário logado
  const minhasOS = mockOrdemServico.filter(
    (os) => os.responsavel === mockUser.nome
  );

  // Aplicar filtros de busca e status
  const osFiltradas = minhasOS.filter((os) => {
    const matchSearch =
      os.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      os.endereco.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus =
      filterStatus === "TODOS" || os.status === filterStatus;

    const matchPrioridade =
      filterPrioridade === "TODOS" || os.prioridade === filterPrioridade;

    return matchSearch && matchStatus && matchPrioridade;
  });

  // Funções de cores migradas para usar design system
  // @deprecated Use StatusBadge e PriorityBadge components

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground mb-1">Minhas Ordens de Serviço</h1>
              <p className="text-muted-foreground">
                Visualize e execute suas OS delegadas
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="text-foreground">{osFiltradas.length}</span>
              <span>OS encontradas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Filtros */}
        <Card className="p-6 border-border mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, cliente ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-input"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] border-input">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Status</SelectItem>
                  <SelectItem value="em_triagem">Em Triagem</SelectItem>
                  <SelectItem value="em_andamento">Em Andamento</SelectItem>
                  <SelectItem value="concluido">Concluído</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPrioridade}
                onValueChange={setFilterPrioridade}
              >
                <SelectTrigger className="w-[180px] border-input">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todas Prioridades</SelectItem>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="MEDIA">Média</SelectItem>
                  <SelectItem value="BAIXA">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Tabela de OS */}
        <Card className="border-border">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-muted-foreground">
                    Código OS
                  </th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Tipo</th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Cliente</th>
                  <th className="px-6 py-3 text-left text-muted-foreground">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-left text-muted-foreground">
                    Etapa Atual
                  </th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-muted-foreground">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Prazo</th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {osFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <p className="text-muted-foreground">
                        Nenhuma OS encontrada com os filtros aplicados
                      </p>
                    </td>
                  </tr>
                ) : (
                  osFiltradas.map((os) => (
                    <tr
                      key={os.id}
                      className="hover:bg-muted transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-foreground">{os.codigo}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="border-primary text-primary-foreground bg-primary/10"
                        >
                          {os.tipo}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{os.cliente}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-muted-foreground max-w-xs truncate">
                          {os.endereco}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-muted-foreground">
                          {os.etapaAtual.replace(/_/g, " ")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={os.status as any}>
                          {os.status.replace(/_/g, " ")}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={os.prioridade as any}>
                          {os.prioridade}
                        </PriorityBadge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">
                          {new Date(os.prazo).toLocaleDateString("pt-BR")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/colaborador/minhas-os/${os.id}`}>
                          <Button
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Executar
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}