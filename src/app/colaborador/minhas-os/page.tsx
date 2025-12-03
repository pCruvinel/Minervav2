"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Search, Eye, Filter, Loader2 } from "lucide-react";
import Link from "next/link";
import { StatusBadge, PriorityBadge } from "@/components/design-system";
import { useAuth } from "@/lib/contexts/auth-context";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

interface OrdemServico {
  id: string;
  codigo_os: string;
  tipo_os_id: string;
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
  tipos_os?: {
    nome: string;
  };
}

export default function MinhasOSPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [ordensServico, setOrdensServico] = useState<OrdemServico[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("TODOS");
  const [filterPrioridade, setFilterPrioridade] = useState("TODOS");

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
          tipo_os_id,
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
          ),
          tipos_os (
            nome
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

  // Filtrar OS do usuário logado
  const minhasOS = useMemo(() =>
    ordensServico.filter((os) =>
      os.responsavel_id === currentUser?.id || os.criado_por_id === currentUser?.id
    ),
    [ordensServico, currentUser?.id]
  );

  // Aplicar filtros de busca e status
  const osFiltradas = useMemo(() =>
    minhasOS.filter((os) => {
      const matchSearch =
        os.codigo_os.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.cliente?.nome_razao_social?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        os.descricao.toLowerCase().includes(searchTerm.toLowerCase());

      const matchStatus =
        filterStatus === "TODOS" || os.status_geral === filterStatus;

      const matchPrioridade =
        filterPrioridade === "TODOS" || os.prioridade === filterPrioridade;

      return matchSearch && matchStatus && matchPrioridade;
    }),
    [minhasOS, searchTerm, filterStatus, filterPrioridade]
  );

  // Funções de cores migradas para usar design system
  // @deprecated Use StatusBadge e PriorityBadge components

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
                        <p className="text-foreground">{os.codigo_os}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className="border-primary text-primary-foreground bg-primary/10"
                        >
                          {os.tipos_os?.nome || 'N/A'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">{os.cliente?.nome_razao_social || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-muted-foreground max-w-xs truncate">
                          {os.descricao}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-muted-foreground">
                          {os.status_geral.replace(/_/g, " ")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={os.status_geral as any}>
                          {os.status_geral.replace(/_/g, " ")}
                        </StatusBadge>
                      </td>
                      <td className="px-6 py-4">
                        <PriorityBadge priority={os.prioridade as any}>
                          {os.prioridade}
                        </PriorityBadge>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-foreground">
                          {new Date(os.data_prazo).toLocaleDateString("pt-BR")}
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