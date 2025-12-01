"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  ClipboardList,
  Building2,
  Calendar,
  TrendingUp,
  ArrowRight,
  User,
} from "lucide-react";
import Link from "next/link";
import { mockUserColaborador } from "@/lib/mock-data-colaborador";

// Mock de dados - substituir por API real
const mockUser = mockUserColaborador;

const navigationCards = [
  {
    id: "dashboard",
    title: "Dashboard Operacional",
    description: "Visualize suas tarefas prioritárias e KPIs de execução",
    icon: LayoutDashboard,
    href: "/colaborador/dashboard",
    color: "bg-info",
    available: true,
  },
  {
    id: "minhas-os",
    title: "Minhas Ordens de Serviço",
    description: "Gerencie e execute as OS delegadas a você",
    icon: ClipboardList,
    href: "/colaborador/minhas-os",
    color: "bg-primary",
    available: true,
  },
  {
    id: "clientes",
    title: "Consulta de Clientes",
    description: "Acesse informações de contato e localização (somente leitura)",
    icon: Building2,
    href: "/colaborador/clientes",
    color: "bg-secondary",
    available: true,
  },
  {
    id: "agenda",
    title: "Minha Agenda",
    description: "Visualize seus compromissos e agendamentos",
    icon: Calendar,
    href: "/colaborador/agenda",
    color: "bg-success",
    available: true,
  },
  {
    id: "leads",
    title: "Gestão de Leads",
    description: "Gerencie oportunidades de vendas (exclusivo comercial)",
    icon: TrendingUp,
    href: "/colaborador/leads",
    color: "bg-warning",
    available: mockUser.setor === "ADMINISTRATIVO",
  },
];

export default function ColaboradorIndexPage() {
  const availableCards = navigationCards.filter((card) => card.available);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground mb-1">Portal do Colaborador</h1>
              <p className="text-muted-foreground">
                Bem-vindo ao sistema Minerva Engenharia
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-muted border border-border rounded-lg">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-foreground">{mockUser.nome}</p>
                <p className="text-muted-foreground">Setor: {mockUser.setor}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Acesso Rápido */}
        <div className="mb-8">
          <h2 className="text-foreground mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.id} href={card.href}>
                  <Card className="p-6 border-border hover:border-primary transition-all hover:shadow-md cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${card.color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-6 h-6 ${card.color.replace("bg-", "text-")}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-foreground mb-2">{card.title}</h3>
                        <p className="text-muted-foreground mb-4">{card.description}</p>
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-primary hover:text-primary/80 hover:bg-transparent"
                        >
                          Acessar
                          <ArrowRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Informações do Perfil */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Permissões */}
          <Card className="p-6 border-border">
            <h2 className="text-foreground mb-4">Suas Permissões</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <p className="text-foreground">
                  Visualizar e executar OS delegadas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <p className="text-foreground">Consultar informações de clientes</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-success" />
                <p className="text-foreground">Visualizar agenda pessoal</p>
              </div>
              {mockUser.setor === "ADMINISTRATIVO" && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <p className="text-foreground">Gerenciar leads de vendas</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <p className="text-muted-foreground">
                  Aprovar/reprovar ordens de serviço
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <p className="text-muted-foreground">Visualizar dados financeiros</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-destructive" />
                <p className="text-muted-foreground">Editar informações de clientes</p>
              </div>
            </div>
          </Card>

          {/* Atalhos Úteis */}
          <Card className="p-6 border-border">
            <h2 className="text-foreground mb-4">Dicas e Atalhos</h2>
            <div className="space-y-4">
              <div className="p-4 bg-info/5 border border-info/20 rounded-lg">
                <h3 className="text-foreground mb-1">📋 Dashboard</h3>
                <p className="text-foreground">
                  Acesse seu dashboard para ver tarefas prioritárias ordenadas
                  por prazo
                </p>
              </div>
              <div className="p-4 bg-success/5 border border-success/20 rounded-lg">
                <h3 className="text-foreground mb-1">✅ Executar Tarefas</h3>
                <p className="text-foreground">
                  Use "Salvar Rascunho" para continuar depois ou "Submeter para
                  Aprovação" para finalizar
                </p>
              </div>
              <div className="p-4 bg-secondary/5 border border-secondary/20 rounded-lg">
                <h3 className="text-foreground mb-1">📅 Agenda</h3>
                <p className="text-foreground">
                  Clique nos eventos do calendário para ver detalhes e acessar a
                  OS relacionada
                </p>
              </div>
              {mockUser.setor === "ADMINISTRATIVO" && (
                <div className="p-4 bg-warning/5 border border-warning/20 rounded-lg">
                  <h3 className="text-foreground mb-1">🎯 Leads</h3>
                  <p className="text-foreground">
                    Atualize regularmente o status dos seus leads para manter o
                    pipeline organizado
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Informativo */}
        <Card className="mt-6 p-6 border-border bg-warning/5">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-warning mt-2 flex-shrink-0" />
            <div>
              <h3 className="text-foreground mb-1">Precisa de mais acesso?</h3>
              <p className="text-foreground">
                Para solicitar permissões adicionais, aprovações financeiras ou
                delegação de tarefas, entre em contato com seu gestor direto ou
                acesse a área de suporte.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}