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
import { StatusBadge, PriorityBadge } from "@/components/design-system";
import { getStatusColor, getPrioridadeColor } from "@/lib/color-utils";
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
    osEmAberto: minhasOS.filter((os) => os.status !== "concluido").length,
    tarefasHoje: minhasOS.filter((os) => {
      const hoje = new Date().toISOString().split("T")[0];
      return os.prazo === hoje;
    }).length,
    prazosVencidos: minhasOS.filter((os) => {
      const hoje = new Date();
      const prazo = new Date(os.prazo);
      return prazo < hoje && os.status !== "concluido";
    }).length,
  }), [minhasOS]);

  const mockTarefasPrioritarias = useMemo(() => minhasOS.slice(0, 15), [minhasOS]);

  const [tarefas] = useState(mockTarefasPrioritarias);

  // Funções de cores migradas para usar design system
  // @deprecated Use StatusBadge e PriorityBadge components

  const isPrazoVencido = (prazo: string) => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    return dataPrazo < hoje;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground mb-1">Dashboard Operacional</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {mockUser.nome} • Setor {mockUser.setor}
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/colaborador/minhas-os">
                <Button
                  variant="outline"
                  className="border-primary text-foreground hover:bg-primary/10"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Ver Todas as OS
                </Button>
              </Link>
              <Link href="/colaborador/agenda">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
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
          <Card className="p-6 border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Minhas OS em Aberto</p>
                <p className="text-foreground">{mockKPIs.osEmAberto}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-info" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Tarefas para Hoje</p>
                <p className="text-foreground">{mockKPIs.tarefasHoje}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-border">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-muted-foreground mb-2">Prazos Vencidos</p>
                <p className="text-foreground">{mockKPIs.prazosVencidos}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tarefas Prioritárias */}
        <Card className="border-border">
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-foreground mb-1">Minhas Tarefas Prioritárias</h2>
                <p className="text-muted-foreground">
                  Ordens de Serviço delegadas a você, ordenadas por prazo
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-6 py-3 text-left text-muted-foreground">
                    Código OS
                  </th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Cliente</th>
                  <th className="px-6 py-3 text-left text-muted-foreground">
                    Etapa Atual
                  </th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Prazo</th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Status</th>
                  <th className="px-6 py-3 text-left text-muted-foreground">
                    Prioridade
                  </th>
                  <th className="px-6 py-3 text-left text-muted-foreground">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {tarefas.map((tarefa) => (
                  <tr
                    key={tarefa.id}
                    className="hover:bg-muted transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="text-foreground">{tarefa.codigo}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{tarefa.cliente}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-muted-foreground">
                        {tarefa.etapaAtual.replace(/_/g, " ")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-foreground ${isPrazoVencido(tarefa.prazo) ? "text-destructive" : ""
                            }`}
                        >
                          {new Date(tarefa.prazo).toLocaleDateString("pt-BR")}
                        </p>
                        {isPrazoVencido(tarefa.prazo) && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tarefa.status as any}>
                        {tarefa.status.replace(/_/g, " ")}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={tarefa.prioridade as any}>
                        {tarefa.prioridade}
                      </PriorityBadge>
                    </td>
                    <td className="px-6 py-4">
                      <Link href={`/colaborador/minhas-os/${tarefa.id}`}>
                        <Button
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
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