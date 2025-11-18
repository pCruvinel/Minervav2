import React, { useState } from 'react';
import { BlocoTurno } from './bloco-turno';
import { ModalCriarTurno } from './modal-criar-turno';
import { ModalNovoAgendamento } from './modal-novo-agendamento';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface CalendarioDiaProps {
  dataAtual: Date;
}

// Mock de turnos para um dia específico
const turnosDiaMock = [
  {
    id: '1',
    horaInicio: '09:00',
    horaFim: '12:00',
    vagasOcupadas: 3,
    vagasTotal: 5,
    setores: ['Comercial', 'Obras'],
    cor: '#DBEAFE', // Azul suave
    agendamentos: [
      { id: 'a1', categoria: 'Vistoria Inicial', setor: 'Comercial' },
      { id: 'a2', categoria: 'Apresentação de Proposta', setor: 'Obras' },
      { id: 'a3', categoria: 'Vistoria Técnica', setor: 'Comercial' }
    ]
  },
  {
    id: '2',
    horaInicio: '14:00',
    horaFim: '17:00',
    vagasOcupadas: 1,
    vagasTotal: 3,
    setores: ['Assessoria'],
    cor: '#FEF3C7', // Amarelo suave
    agendamentos: [
      { id: 'a4', categoria: 'Visita Semanal', setor: 'Assessoria' }
    ]
  }
];

export function CalendarioDia({ dataAtual }: CalendarioDiaProps) {
  const [modalCriarTurno, setModalCriarTurno] = useState(false);
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);

  // Horários (08:00 - 18:00)
  const horarios = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const ALTURA_SLOT = 100; // Altura de cada slot de horário em pixels

  // Calcular posição e altura do turno
  const calcularEstiloTurno = (turno: any) => {
    const [horaInicio] = turno.horaInicio.split(':').map(Number);
    const [horaFim] = turno.horaFim.split(':').map(Number);
    
    const indexInicio = horarios.findIndex(h => h === turno.horaInicio);
    const duracao = horaFim - horaInicio;
    
    return {
      top: `${indexInicio * ALTURA_SLOT}px`,
      height: `${duracao * ALTURA_SLOT - 8}px` // -8 para padding
    };
  };

  const formatarDia = (data: Date) => {
    return data.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleClickTurno = (turno: any) => {
    if (turno.vagasOcupadas < turno.vagasTotal) {
      setTurnoSelecionado(turno);
      setModalAgendamento(true);
    }
  };

  return (
    <>
      <div className="p-6">
        {/* Cabeçalho do Dia */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-neutral-600">Visualizando</p>
            <h2 className="capitalize">{formatarDia(dataAtual)}</h2>
          </div>
          <Button
            onClick={() => setModalCriarTurno(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Configurar Novo Turno
          </Button>
        </div>

        {/* Grade de Horários */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[100px_1fr]">
            {/* Coluna de horários */}
            <div>
              {horarios.map((horario) => (
                <div
                  key={horario}
                  className="h-[100px] p-3 border-r border-b last:border-b-0 border-neutral-200 bg-neutral-50 flex items-start"
                >
                  <span className="text-sm text-neutral-600">{horario}</span>
                </div>
              ))}
            </div>

            {/* Coluna de conteúdo */}
            <div className="border-neutral-200 relative">
              {/* Grid de fundo com horários */}
              {horarios.map((horario) => (
                <div
                  key={horario}
                  className="h-[100px] border-b last:border-b-0 border-neutral-200"
                />
              ))}

              {/* Turnos posicionados absolutamente */}
              <div className="absolute inset-0 p-3 pointer-events-none">
                {turnosDiaMock.map(turno => {
                  const estilo = calcularEstiloTurno(turno);
                  return (
                    <div
                      key={turno.id}
                      className="absolute left-3 right-3 max-w-2xl pointer-events-auto"
                      style={estilo}
                    >
                      <BlocoTurno
                        turno={turno}
                        onClick={() => handleClickTurno(turno)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modais */}
      <ModalCriarTurno
        open={modalCriarTurno}
        onClose={() => setModalCriarTurno(false)}
      />
      
      <ModalNovoAgendamento
        open={modalAgendamento}
        onClose={() => setModalAgendamento(false)}
        turno={turnoSelecionado}
        dia={dataAtual}
      />
    </>
  );
}