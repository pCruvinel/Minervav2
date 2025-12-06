"use client";

import { useState, useMemo, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ClipboardList,
  Calendar,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StatusBadge, PriorityBadge } from "@/components/design-system";
import { useAuth } from "@/lib/contexts/auth-context";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

interface OrdemServico {
  id: string;
  codigo_os: string;
  cliente_id: string;
  responsavel_id: string;
  criado_por_id: string;
  status_geral: string;
  descricao: string;
  valor_proposta: number;
  data_prazo: string;
  data_entrada: string;
  prioridade: string;
  cliente?: {
    nome_razao_social: string;
  };
  etapa_atual?: string;
}

export default function ColaboradorDashboardPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar OS do colaborador autenticado
  useEffect(() => {
    if (currentUser?.id) {
      fetchOrdensServico();
    }
  }, [currentUser?.id]);

  const fetchOrdensServico = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('ordens_servico')
        .select(`
          id,
          codigo_os,
          cliente_id,
          responsavel_id,
          criado_por_id,
          status_geral,
          descricao,
          valor_proposta,
          data_prazo,
          data_entrada,
          prioridade,
          clientes (
            nome_razao_social
          )
        `)
        .or(`responsavel_id.eq.${currentUser?.id},criado_por_id.eq.${currentUser?.id}`)
        .order('data_prazo', { ascending: true });

      if (error) throw error;

      setOrdensServico(data || []);
    } catch (error) {
      console.error('Erro ao buscar OS:', error);
      toast.error('Erro ao carregar ordens de serviço');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar apenas as OS do colaborador logado e ordenar por prazo
  const minhasOS = useMemo(() =>
    ordensServico
      .filter((os) => os.responsavel_id === currentUser?.id || os.criado_por_id === currentUser?.id)
      .sort((a, b) => new Date(a.data_prazo).getTime() - new Date(b.data_prazo).getTime()),
    [ordensServico, currentUser?.id]
  );

  const kpis = useMemo(() => ({
    osEmAberto: minhasOS.filter((os) => os.status_geral !== "concluido").length,
    tarefasHoje: minhasOS.filter((os) => {
      const hoje = new Date().toISOString().split("T")[0];
      return os.data_prazo.split("T")[0] === hoje;
    }).length,
    prazosVencidos: minhasOS.filter((os) => {
      const hoje = new Date();
      const prazo = new Date(os.data_prazo);
      return prazo < hoje && os.status_geral !== "concluido";
    }).length,
  }), [minhasOS]);

  const tarefasPrioritarias = useMemo(() => minhasOS.slice(0, 15), [minhasOS]);

  const [tarefas] = useState(tarefasPrioritarias);

  // Funções de cores migradas para usar design system
  // @deprecated Use StatusBadge e PriorityBadge components

  const isPrazoVencido = (prazo: string) => {
    const hoje = new Date();
    const dataPrazo = new Date(prazo);
    return dataPrazo < hoje;
  };

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-foreground mb-1">Dashboard Operacional</h1>
              <p className="text-muted-foreground">
                Bem-vindo, {currentUser.nome_completo} • Setor {currentUser.setor_slug}
              </p>
            </div>
            <div className="flex gap-3">
              <Link to="/colaborador/minhas-os">
                <Button
                  variant="outline"
                  className="border-primary text-foreground hover:bg-primary/10"
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  Ver Todas as OS
                </Button>
              </Link>
              <Link to="/colaborador/agenda">
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
                <p className="text-foreground">{kpis.osEmAberto}</p>
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
                <p className="text-foreground">{kpis.tarefasHoje}</p>
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
                <p className="text-foreground">{kpis.prazosVencidos}</p>
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
                      <p className="text-foreground">{tarefa.codigo_os}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-foreground">{tarefa.cliente?.nome_razao_social || 'N/A'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-muted-foreground">
                        {tarefa.status_geral.replace(/_/g, " ")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-foreground ${isPrazoVencido(tarefa.data_prazo) ? "text-destructive" : ""
                            }`}
                        >
                          {new Date(tarefa.data_prazo).toLocaleDateString("pt-BR")}
                        </p>
                        {isPrazoVencido(tarefa.data_prazo) && (
                          <AlertCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={tarefa.status_geral as any}>
                        {tarefa.status_geral.replace(/_/g, " ")}
                      </StatusBadge>
                    </td>
                    <td className="px-6 py-4">
                      <PriorityBadge priority={tarefa.prioridade as any}>
                        {tarefa.prioridade}
                      </PriorityBadge>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/colaborador/minhas-os/${tarefa.id}`}>
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