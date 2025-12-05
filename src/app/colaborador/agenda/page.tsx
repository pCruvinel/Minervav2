"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Clock,
  User,
  ExternalLink,
  Loader2,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/lib/contexts/auth-context";
import { supabase } from "@/lib/supabase-client";
import { toast } from "sonner";

interface Agendamento {
  id: string;
  titulo: string;
  data: string;
  hora_inicio: string;
  hora_fim: string;
  tipo: string;
  endereco: string;
  os_id: string;
  cliente_id: string;
  responsavel_id: string;
  ordens_servico?: {
    codigo_os: string;
  };
  clientes?: {
    nome_razao_social: string;
  };
}

export default function AgendaColaboradorPage() {
  const { currentUser, isLoading: authLoading } = useAuth();
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvento, setSelectedEvento] = useState<Agendamento | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Carregar agendamentos do colaborador autenticado
  useEffect(() => {
    if (currentUser?.id) {
      fetchAgendamentos();
    }
  }, [currentUser?.id]);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('agendamentos')
        .select(`
          id,
          titulo,
          data,
          hora_inicio,
          hora_fim,
          tipo,
          endereco,
          os_id,
          cliente_id,
          responsavel_id,
          ordens_servico (
            codigo_os
          ),
          clientes (
            nome_razao_social
          )
        `)
        .eq('responsavel_id', currentUser?.id)
        .order('data', { ascending: true });

      if (error) throw error;

      setAgendamentos(data || []);
    } catch (error) {
      console.error('Erro ao buscar agendamentos:', error);
      toast.error('Erro ao carregar agendamentos');
    } finally {
      setLoading(false);
    }
  };

  const daysInMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0
  ).getDate();
  const firstDayOfMonth = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  ).getDay();

  const monthNames = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const previousMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1)
    );
  };

  const nextMonth = () => {
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1)
    );
  };

  const getEventosForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(
      currentDate.getMonth() + 1
    ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return agendamentos.filter((e) => e.data === dateStr);
  };

  const handleEventoClick = (evento: Agendamento) => {
    setSelectedEvento(evento);
    setIsDialogOpen(true);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "VISTORIA":
        return "bg-primary/10 text-primary border-primary/20";
      case "REUNIAO":
        return "bg-secondary/10 text-secondary border-secondary/20";
      case "FOLLOW_UP":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-muted text-foreground border-border";
    }
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
      <div className="bg-white border-b border-border">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black mb-1">Minha Agenda</h1>
              <p className="text-muted-foreground">
                Visualize seus compromissos e agendamentos
              </p>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarIcon className="w-5 h-5" />
              <span className="text-black">
                {agendamentos.length} compromissos este mês
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <Card className="border-border">
          {/* Cabeçalho do Calendário */}
          <div className="p-6 border-b border-border">
            <div className="flex items-center justify-between">
              <h2 className="text-black">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousMonth}
                  className="border-border"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="border-border"
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                  className="border-border"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Grid do Calendário */}
          <div className="p-6">
            {/* Dias da Semana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
                <div
                  key={day}
                  className="text-center py-2 text-muted-foreground border-b border-border"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do Mês */}
            <div className="grid grid-cols-7 gap-2">
              {/* Espaços vazios antes do primeiro dia */}
              {Array.from({ length: firstDayOfMonth }).map((_, index) => (
                <div key={`empty-${index}`} className="aspect-square" />
              ))}

              {/* Dias do mês */}
              {Array.from({ length: daysInMonth }).map((_, index) => {
                const day = index + 1;
                const eventos = getEventosForDay(day);
                const isToday =
                  day === 17 &&
                  currentDate.getMonth() === 10 &&
                  currentDate.getFullYear() === 2025;

                return (
                  <div
                    key={day}
                    className={`aspect-square border rounded-lg p-2 ${isToday
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-border"
                      }`}
                  >
                    <div
                      className={`text-right mb-1 ${isToday ? "text-[var(--primary)]" : "text-muted-foreground"
                        }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {eventos.map((evento) => (
                        <button
                          key={evento.id}
                          onClick={() => handleEventoClick(evento)}
                          className="w-full text-left px-2 py-1 text-xs rounded bg-[var(--primary)] text-black hover:bg-[var(--primary)]/80 transition-colors truncate"
                        >
                          {evento.hora_inicio} - {evento.tipo}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className="px-6 pb-6 pt-4 border-t border-border">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-primary/10 border border-primary/20" />
                <span className="text-muted-foreground">Vistoria</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-secondary/10 border border-secondary/20" />
                <span className="text-muted-foreground">Reunião</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-success/10 border border-success/20" />
                <span className="text-muted-foreground">Follow-up</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Próximos Eventos */}
        <Card className="mt-6 border-border">
          <div className="p-6 border-b border-border">
            <h2 className="text-black">Próximos Compromissos</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {agendamentos
              .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
              .slice(0, 5)
              .map((evento) => (
                <div
                  key={evento.id}
                  className="p-6 hover:bg-background transition-colors cursor-pointer"
                  onClick={() => handleEventoClick(evento)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge
                          variant="outline"
                          className={getTipoColor(evento.tipo)}
                        >
                          {evento.tipo.replace(/_/g, " ")}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="border-[var(--primary)] text-black bg-[var(--primary)]/10"
                        >
                          {evento.ordens_servico?.codigo_os || 'N/A'}
                        </Badge>
                      </div>
                      <h3 className="text-black mb-2">{evento.titulo}</h3>
                      <div className="space-y-1 text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {new Date(evento.data).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {evento.hora_inicio} - {evento.hora_fim}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{evento.endereco}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </Card>
      </div>

      {/* Dialog de Detalhes do Evento */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-black">
              Detalhes do Compromisso
            </DialogTitle>
          </DialogHeader>

          {selectedEvento && (
            <div className="space-y-6">
              <div>
                <h3 className="text-black mb-2">{selectedEvento.titulo}</h3>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={getTipoColor(selectedEvento.tipo)}
                  >
                    {selectedEvento.tipo.replace(/_/g, " ")}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-[var(--primary)] text-black bg-[var(--primary)]/10"
                  >
                    {selectedEvento.ordens_servico?.codigo_os || 'N/A'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground mb-1">Data</p>
                    <p className="text-black">
                      {new Date(selectedEvento.data).toLocaleDateString(
                        "pt-BR",
                        { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground mb-1">Horário</p>
                    <p className="text-black">
                      {selectedEvento.hora_inicio} - {selectedEvento.hora_fim}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground mb-1">Cliente</p>
                    <p className="text-black">{selectedEvento.clientes?.nome_razao_social || 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-muted-foreground mb-1">Local</p>
                    <p className="text-black">{selectedEvento.endereco}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <Link to={`/colaborador/minhas-os/${selectedEvento.os_id}`}>
                  <Button className="w-full bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-black">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Ordem de Serviço
                  </Button>
                </Link>
              </div>

              <div className="text-muted-foreground text-center">
                Somente gestores podem editar ou excluir compromissos
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}