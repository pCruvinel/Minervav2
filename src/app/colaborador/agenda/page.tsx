"use client";

import { useState } from "react";
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
} from "lucide-react";
import Link from "next/link";
import { mockEventosAgenda } from "@/lib/mock-data-colaborador";

// Mock de dados - substituir por API real
const mockEventos = mockEventosAgenda;

export default function AgendaColaboradorPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 10, 17)); // 17/11/2025
  const [selectedEvento, setSelectedEvento] = useState<(typeof mockEventos)[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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
    return mockEventos.filter((e) => e.data === dateStr);
  };

  const handleEventoClick = (evento: (typeof mockEventos)[0]) => {
    setSelectedEvento(evento);
    setIsDialogOpen(true);
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case "VISTORIA":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "REUNIAO":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "FOLLOW_UP":
        return "bg-green-100 text-green-800 border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-black mb-1">Minha Agenda</h1>
              <p className="text-gray-600">
                Visualize seus compromissos e agendamentos
              </p>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <CalendarIcon className="w-5 h-5" />
              <span className="text-black">
                {mockEventos.length} compromissos este mês
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="p-8">
        <Card className="border-gray-200">
          {/* Cabeçalho do Calendário */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-black">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={previousMonth}
                  className="border-gray-300"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                  className="border-gray-300"
                >
                  Hoje
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={nextMonth}
                  className="border-gray-300"
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
                  className="text-center py-2 text-gray-600 border-b border-gray-200"
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
                    className={`aspect-square border rounded-lg p-2 ${
                      isToday
                        ? "border-[#D3AF37] bg-[#D3AF37]/5"
                        : "border-gray-200"
                    }`}
                  >
                    <div
                      className={`text-right mb-1 ${
                        isToday ? "text-[#D3AF37]" : "text-gray-700"
                      }`}
                    >
                      {day}
                    </div>
                    <div className="space-y-1">
                      {eventos.map((evento) => (
                        <button
                          key={evento.id}
                          onClick={() => handleEventoClick(evento)}
                          className="w-full text-left px-2 py-1 text-xs rounded bg-[#D3AF37] text-black hover:bg-[#D3AF37]/80 transition-colors truncate"
                        >
                          {evento.horaInicio} - {evento.tipo}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className="px-6 pb-6 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-6 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-blue-100 border border-blue-200" />
                <span className="text-gray-700">Vistoria</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-purple-100 border border-purple-200" />
                <span className="text-gray-700">Reunião</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 border border-green-200" />
                <span className="text-gray-700">Follow-up</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Próximos Eventos */}
        <Card className="mt-6 border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-black">Próximos Compromissos</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {mockEventos
              .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
              .slice(0, 5)
              .map((evento) => (
                <div
                  key={evento.id}
                  className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
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
                          className="border-[#D3AF37] text-black bg-[#D3AF37]/10"
                        >
                          {evento.osCodigo}
                        </Badge>
                      </div>
                      <h3 className="text-black mb-2">{evento.titulo}</h3>
                      <div className="space-y-1 text-gray-600">
                        <div className="flex items-center gap-2">
                          <CalendarIcon className="w-4 h-4" />
                          <span>
                            {new Date(evento.data).toLocaleDateString("pt-BR")}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {evento.horaInicio} - {evento.horaFim}
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
                    className="border-[#D3AF37] text-black bg-[#D3AF37]/10"
                  >
                    {selectedEvento.osCodigo}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <CalendarIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600 mb-1">Data</p>
                    <p className="text-black">
                      {new Date(selectedEvento.data).toLocaleDateString(
                        "pt-BR",
                        { weekday: "long", day: "2-digit", month: "long", year: "numeric" }
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600 mb-1">Horário</p>
                    <p className="text-black">
                      {selectedEvento.horaInicio} - {selectedEvento.horaFim}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600 mb-1">Cliente</p>
                    <p className="text-black">{selectedEvento.cliente}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-gray-600 mb-1">Local</p>
                    <p className="text-black">{selectedEvento.endereco}</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Link href={`/colaborador/minhas-os/${selectedEvento.osId}`}>
                  <Button className="w-full bg-[#D3AF37] hover:bg-[#D3AF37]/90 text-black">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Abrir Ordem de Serviço
                  </Button>
                </Link>
              </div>

              <div className="text-gray-500 text-center">
                Somente gestores podem editar ou excluir compromissos
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}