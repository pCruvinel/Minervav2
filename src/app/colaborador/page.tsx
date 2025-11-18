"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
    color: "bg-blue-500",
    available: true,
  },
  {
    id: "minhas-os",
    title: "Minhas Ordens de Serviço",
    description: "Gerencie e execute as OS delegadas a você",
    icon: ClipboardList,
    href: "/colaborador/minhas-os",
    color: "bg-[#D3AF37]",
    available: true,
  },
  {
    id: "clientes",
    title: "Consulta de Clientes",
    description: "Acesse informações de contato e localização (somente leitura)",
    icon: Building2,
    href: "/colaborador/clientes",
    color: "bg-purple-500",
    available: true,
  },
  {
    id: "agenda",
    title: "Minha Agenda",
    description: "Visualize seus compromissos e agendamentos",
    icon: Calendar,
    href: "/colaborador/agenda",
    color: "bg-green-500",
    available: true,
  },
  {
    id: "leads",
    title: "Gestão de Leads",
    description: "Gerencie oportunidades de vendas (exclusivo comercial)",
    icon: TrendingUp,
    href: "/colaborador/leads",
    color: "bg-orange-500",
    available: mockUser.setor === "COMERCIAL",
  },
];

export default function ColaboradorIndexPage() {
  const availableCards = navigationCards.filter((card) => card.available);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black mb-1">Portal do Colaborador</h1>
              <p className="text-gray-600">
                Bem-vindo ao sistema Minerva Engenharia
              </p>
            </div>
            <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg">
              <User className="w-5 h-5 text-gray-500" />
              <div>
                <p className="text-black">{mockUser.nome}</p>
                <p className="text-gray-600">Setor: {mockUser.setor}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        {/* Acesso Rápido */}
        <div className="mb-8">
          <h2 className="text-black mb-4">Acesso Rápido</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {availableCards.map((card) => {
              const Icon = card.icon;
              return (
                <Link key={card.id} href={card.href}>
                  <Card className="p-6 border-gray-200 hover:border-[#D3AF37] transition-all hover:shadow-md cursor-pointer h-full">
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${card.color} bg-opacity-10 flex items-center justify-center flex-shrink-0`}
                      >
                        <Icon className={`w-6 h-6 ${card.color.replace("bg-", "text-")}`} />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-black mb-2">{card.title}</h3>
                        <p className="text-gray-600 mb-4">{card.description}</p>
                        <Button
                          variant="ghost"
                          className="p-0 h-auto text-[#D3AF37] hover:text-[#D3AF37]/80 hover:bg-transparent"
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
          <Card className="p-6 border-gray-200">
            <h2 className="text-black mb-4">Suas Permissões</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-gray-700">
                  Visualizar e executar OS delegadas
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-gray-700">Consultar informações de clientes</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <p className="text-gray-700">Visualizar agenda pessoal</p>
              </div>
              {mockUser.setor === "COMERCIAL" && (
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <p className="text-gray-700">Gerenciar leads de vendas</p>
                </div>
              )}
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-gray-500">
                  Aprovar/reprovar ordens de serviço
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-gray-500">Visualizar dados financeiros</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-red-500" />
                <p className="text-gray-500">Editar informações de clientes</p>
              </div>
            </div>
          </Card>

          {/* Atalhos Úteis */}
          <Card className="p-6 border-gray-200">
            <h2 className="text-black mb-4">Dicas e Atalhos</h2>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-black mb-1">📋 Dashboard</h3>
                <p className="text-gray-700">
                  Acesse seu dashboard para ver tarefas prioritárias ordenadas
                  por prazo
                </p>
              </div>
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-black mb-1">✅ Executar Tarefas</h3>
                <p className="text-gray-700">
                  Use "Salvar Rascunho" para continuar depois ou "Submeter para
                  Aprovação" para finalizar
                </p>
              </div>
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                <h3 className="text-black mb-1">📅 Agenda</h3>
                <p className="text-gray-700">
                  Clique nos eventos do calendário para ver detalhes e acessar a
                  OS relacionada
                </p>
              </div>
              {mockUser.setor === "COMERCIAL" && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <h3 className="text-black mb-1">🎯 Leads</h3>
                  <p className="text-gray-700">
                    Atualize regularmente o status dos seus leads para manter o
                    pipeline organizado
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Informativo */}
        <Card className="mt-6 p-6 border-gray-200 bg-yellow-50">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2 flex-shrink-0" />
            <div>
              <h3 className="text-black mb-1">Precisa de mais acesso?</h3>
              <p className="text-gray-700">
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