import React, { useState } from 'react';
import { BlocoTurno } from './bloco-turno';
import { ModalCriarTurno } from './modal-criar-turno';
import { ModalNovoAgendamento } from './modal-novo-agendamento';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

interface CalendarioSemanaProps {
  dataAtual: Date;
}

// Mock de turnos por dia da semana
const turnosMock = [
  // Segunda (dia 0)
  {
    id: '1',
    dia: 0,
    horaInicio: '09:00',
    horaFim: '12:00',
    vagasOcupadas: 2,
    vagasTotal: 5,
    setores: ['Comercial', 'Obras'],
    cor: '#DBEAFE', // Azul suave
    agendamentos: [
      { id: 'a1', categoria: 'Vistoria Inicial', setor: 'Comercial' },
      { id: 'a2', categoria: 'Apresentação de Proposta', setor: 'Obras' }
    ]
  },
  // Terça (dia 1)
  {
    id: '2',
    dia: 1,
    horaInicio: '08:00',
    horaFim: '10:00',
    vagasOcupadas: 1,
    vagasTotal: 3,
    setores: ['Assessoria'],
    cor: '#FEF3C7', // Amarelo suave
    agendamentos: [
      { id: 'a3', categoria: 'Visita Semanal', setor: 'Assessoria' }
    ]
  },
  {
    id: '3',
    dia: 1,
    horaInicio: '14:00',
    horaFim: '17:00',
    vagasOcupadas: 3,
    vagasTotal: 3,
    setores: ['Obras'],
    cor: '#E0E7FF', // Índigo suave
    agendamentos: [
      { id: 'a4', categoria: 'Vistoria Técnica', setor: 'Obras' },
      { id: 'a5', categoria: 'Reunião de Alinhamento', setor: 'Obras' },
      { id: 'a6', categoria: 'Medições', setor: 'Obras' }
    ]
  },
  // Quarta (dia 2)
  {
    id: '4',
    dia: 2,
    horaInicio: '10:00',
    horaFim: '13:00',
    vagasOcupadas: 0,
    vagasTotal: 4,
    setores: ['Comercial', 'Assessoria'],
    cor: '#D1FAE5', // Verde suave
    agendamentos: []
  },
  // Quinta (dia 3)
  {
    id: '5',
    dia: 3,
    horaInicio: '09:00',
    horaFim: '11:00',
    vagasOcupadas: 2,
    vagasTotal: 5,
    setores: ['Comercial'],
    cor: '#FCE7F3', // Rosa suave
    agendamentos: [
      { id: 'a7', categoria: 'Apresentação de Proposta', setor: 'Comercial' },
      { id: 'a8', categoria: 'Vistoria Inicial', setor: 'Comercial' }
    ]
  },
  // Sexta (dia 4)
  {
    id: '6',
    dia: 4,
    horaInicio: '08:00',
    horaFim: '12:00',
    vagasOcupadas: 1,
    vagasTotal: 6,
    setores: ['Comercial', 'Obras', 'Assessoria'],
    cor: '#E9D5FF', // Roxo suave
    agendamentos: [
      { id: 'a9', categoria: 'Vistoria Inicial', setor: 'Comercial' }
    ]
  },
  {
    id: '7',
    dia: 4,
    horaInicio: '14:00',
    horaFim: '16:00',
    vagasOcupadas: 2,
    vagasTotal: 4,
    setores: ['Assessoria'],
    cor: '#FED7AA', // Laranja suave
    agendamentos: [
      { id: 'a10', categoria: 'Visita Semanal', setor: 'Assessoria' },
      { id: 'a11', categoria: 'Reunião de Alinhamento', setor: 'Assessoria' }
    ]
  }
];

export function CalendarioSemana({ dataAtual }: CalendarioSemanaProps) {
  const [modalCriarTurno, setModalCriarTurno] = useState(false);
  const [modalAgendamento, setModalAgendamento] = useState(false);
  const [turnoSelecionado, setTurnoSelecionado] = useState<any>(null);

  // Dias da semana (Seg - Sex)
  const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex'];
  
  // Horários (08:00 - 18:00)
  const horarios = [
    '08:00', '09:00', '10:00', '11:00', '12:00',
    '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'
  ];

  const ALTURA_SLOT = 80; // Altura de cada slot de horário em pixels

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
  
  // Calcular dias da semana atual
  const obterDiasDaSemana = () => {
    const dias = [];
    const primeiroDia = new Date(dataAtual);
    const diaSemana = primeiroDia.getDay();
    const diff = diaSemana === 0 ? -6 : 1 - diaSemana; // Ajustar para segunda-feira
    primeiroDia.setDate(primeiroDia.getDate() + diff);

    for (let i = 0; i < 5; i++) {
      const dia = new Date(primeiroDia);
      dia.setDate(dia.getDate() + i);
      dias.push(dia);
    }
    return dias;
  };

  const diasDaSemana = obterDiasDaSemana();

  const handleClickTurno = (turno: any) => {
    if (turno.vagasOcupadas < turno.vagasTotal) {
      setTurnoSelecionado(turno);
      setModalAgendamento(true);
    }
  };

  return (
    <>
      <div className="p-6">
        {/* Botão Admin */}
        <div className="mb-4 flex justify-end">
          <Button
            onClick={() => setModalCriarTurno(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="h-4 w-4 mr-2" />
            Configurar Novo Turno
          </Button>
        </div>

        {/* Grade do Calendário */}
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          {/* Cabeçalho com dias da semana */}
          <div className="grid grid-cols-[100px_repeat(5,1fr)] bg-neutral-100 border-b border-neutral-200">
            <div className="p-3 border-r border-neutral-200"></div>
            {diasSemana.map((dia, index) => (
              <div key={dia} className="p-3 text-center border-r last:border-r-0 border-neutral-200">
                <div>{dia}</div>
                <div className="text-sm text-neutral-600">
                  {diasDaSemana[index].getDate()}/{diasDaSemana[index].getMonth() + 1}
                </div>
              </div>
            ))}
          </div>

          {/* Grade de horários */}
          <div className="grid grid-cols-[100px_repeat(5,1fr)]">
            {/* Coluna de horários */}
            <div>
              {horarios.map((horario) => (
                <div
                  key={horario}
                  className="h-[80px] p-3 border-r border-b last:border-b-0 border-neutral-200 bg-neutral-50 flex items-start"
                >
                  <span className="text-sm text-neutral-600">{horario}</span>
                </div>
              ))}
            </div>

            {/* Colunas para cada dia */}
            {[0, 1, 2, 3, 4].map((diaIndex) => (
              <div key={diaIndex} className="border-r last:border-r-0 border-neutral-200 relative">
                {/* Grid de fundo com horários */}
                {horarios.map((horario) => (
                  <div
                    key={horario}
                    className="h-[80px] border-b last:border-b-0 border-neutral-200"
                  />
                ))}

                {/* Turnos posicionados absolutamente */}
                <div className="absolute inset-0 p-2 pointer-events-none">
                  {turnosMock
                    .filter(turno => turno.dia === diaIndex)
                    .map(turno => {
                      const estilo = calcularEstiloTurno(turno);
                      return (
                        <div
                          key={turno.id}
                          className="absolute left-2 right-2 pointer-events-auto"
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
            ))}
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
        dia={turnoSelecionado ? diasDaSemana[turnoSelecionado.dia] : new Date()}
      />
    </>
  );
}