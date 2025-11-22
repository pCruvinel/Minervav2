"use client";

import { useState, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ClipboardList,
  Calendar,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import {
  mockUserColaborador,
  mockOrdensServico,
} from "@/lib/mock-data-colaborador";

export default function ColaboradorDashboardPage() {
  // Mock de dados - substituir por API real
  const mockUser = mockUserColaborador;

  // Filtrar apenas as OS do colaborador logado e ordenar por prazo
  const minhasOS = useMemo(() => 
    mockOrdensServico
      .filter((os) => os.responsavel === mockUser.nome)
      .sort((a, b) => new Date(a.prazo).getTime() - new Date(b.prazo).getTime()),
    [mockUser.nome]
  );

  const mockKPIs = useMemo(() => ({
    osEmAberto: minhasOS.filter((os) => os.status !== "CONCLUIDO").length,
    tarefasHoje: minhasOS.filter((os) => {
      const hoje = new Date().toISOString().split("T")[0];
      return os.prazo === hoje;
    }).length,
    prazosVencidos: minhasOS.filter((os) => {
      const hoje = new Date();
      const prazo = new Date(os.prazo);
      return prazo < hoje && os.status !== "CONCLUIDO";
    }).length,
  }), [minhasOS]);

  const mockTarefasPrioritarias = useMemo(() => minhasOS.slice(0, 15), [minhasOS]);

  const [tarefas] = useState(mockTarefasPrioritarias);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "em_andamento":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "em_triagem":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "concluido":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelado":
        return "bg-red-100 text-red-800 border-red-200";
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

  const isPrazoVencido = (prazo: string) => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    return dataPrazo < hoje;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black mb-1">Dashboard Operacional</h1>
              <p className="text-gray-600">
                Bem-vindo, {mockUser.nome} • Setor {mockUser.setor}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/colaborador/minhas-os">
                <Button
                  variant="outline"
                  className="border-[#D3AF37] text-black hover:bg-[#D3AF37]/10"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Ver Todas as OS
                </Button>
              </Link>
              <Link href="/colaborador/agenda">
                <Button className="bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black">
                  <Calendar className="w-4 h-4 mr-2" />
                  Minha Agenda
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-2">Minhas OS em Aberto</p>
                <p className="text-black">{mockKPIs.osEmAberto}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-2">Tarefas para Hoje</p>
                <p className="text-black">{mockKPIs.tarefasHoje}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-600 mb-2">Prazos Vencidos</p>
                <p className="text-black">{mockKPIs.prazosVencidos}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tarefas Prioritárias */}
        <Card className="border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-black mb-1">Minhas Tarefas Prioritárias</h2>
                <p className="text-gray-600">
                  Ordens de Serviço delegadas a você, ordenadas por prazo
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-700">
                    Código OS
                  </th>
                  <th className="px-6 py-3 text-left text-gray-700">Cliente</th>
                  <th className="px-6 py-3 text-left text-gray-700">
                    Etapa Atual
                  </th>
                  <th className="px-6 py-3 text-left text-gray-700">Prazo</th>
                  <th className="px-6 py-3 text-left text-gray-700">Status</th>
                  <th className="px-6 py-3 text-left text-gray-700">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-gray-700">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {tarefas.map((tarefa) => (
                  <tr
                    key={tarefa.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-black">{tarefa.codigo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-black">{tarefa.cliente}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-gray-700">
                        {tarefa.etapaAtual.replace(/_/g, " ")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-black ${
                            isPrazoVencido(tarefa.prazo) ? "text-red-600" : ""
                          }`}
                        >
                          {new Date(tarefa.prazo).toLocaleDateString("pt-BR")}
                        </p>
                        {isPrazoVencido(tarefa.prazo) && (
                          <AlertCircle className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={getStatusColor(tarefa.status)}
                      >
                        {tarefa.status.replace(/_/g, " ")}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant="outline"
                        className={getPrioridadeColor(tarefa.prioridade)}
                      >
                        {tarefa.prioridade}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/colaborador/minhas-os/${tarefa.id}`}>
                        <Button
                          size="sm"
                          className="bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black"
                        >
                          <span className="mr-1">Executar</span>
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}