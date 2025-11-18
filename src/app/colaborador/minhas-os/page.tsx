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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ATRASADO":
        return "bg-red-100 text-red-800 border-red-200";
      case "EM_ANDAMENTO":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PENDENTE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "CONCLUIDO":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPrioridadeColor = (prioridade: string) => {
    switch (prioridade) {
      case "ALTA":
        return "bg-red-50 text-red-700 border-red-300";
      case "MEDIA":
        return "bg-yellow-50 text-yellow-700 border-yellow-300";
      case "BAIXA":
        return "bg-green-50 text-green-700 border-green-300";
      default:
        return "bg-gray-50 text-gray-700 border-gray-300";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black mb-1">Minhas Ordens de Serviço</h1>
              <p className="text-gray-600">
                Visualize e execute suas OS delegadas
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-black">{osFiltradas.length}</span>
              <span>OS encontradas</span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Filtros */}
        <Card className="p-6 border-gray-200 mb-6">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar por código, cliente ou endereço..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-gray-300"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Filter className="w-4 h-4 text-gray-500" />
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px] border-gray-300">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="TODOS">Todos os Status</SelectItem>
                  <SelectItem value="PENDENTE">Pendente</SelectItem>
                  <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                  <SelectItem value="ATRASADO">Atrasado</SelectItem>
                  <SelectItem value="CONCLUIDO">Concluído</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filterPrioridade}
                onValueChange={setFilterPrioridade}
              >
                <SelectTrigger className="w-[180px] border-gray-300">
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
        <Card className="border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">
                    Código OS
                  </th>
                  <th className="px-6 py-3 text-left text-gray-700">Tipo</th>
                  <th className="px-6 py-3 text-left text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-left text-gray-700">
                    Endereço
                  </th>
                  <th className="px-6 py-3 text-left text-gray-700">
                    Etapa Atual
                  </th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-gray-700">Prazo</th>
                  <th className="px-6 py-3 text-left text-gray-700">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {osFiltradas.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-12 text-center">
                      <p className="text-gray-500">
                        Nenhuma OS encontrada com os filtros aplicados
                      </p>
                    </td>
                  </tr>
                ) : (
                  osFiltradas.map((os) => (
                    <tr
                      key={os.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <p className="text-black">{os.codigo}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="border-[#D3AF37] text-black bg-[#D3AF37]/10"
                        >
                          {os.tipo}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-black">{os.cliente}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700 max-w-xs truncate">
                          {os.endereco}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-gray-700">
                          {os.etapaAtual.replace(/_/g, " ")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={getStatusColor(os.status)}
                        >
                          {os.status.replace(/_/g, " ")}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={getPrioridadeColor(os.prioridade)}
                        >
                          {os.prioridade}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-black">
                          {new Date(os.prazo).toLocaleDateString("pt-BR")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/colaborador/minhas-os/${os.id}`}>
                          <Button
                            size="sm"
                            className="bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black"
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