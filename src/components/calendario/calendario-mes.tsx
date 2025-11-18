import React from 'react';
import { Users } from 'lucide-react';

interface CalendarioMesProps {
  dataAtual: Date;
}

// Mock de turnos para alguns dias (simulação)
  const turnosPorDia: { [key: string]: any[] } = {
    '15': [
      { id: '1', horaInicio: '09:00', horaFim: '12:00', vagasOcupadas: 2, vagasTotal: 5, setores: ['Comercial'], cor: '#DBEAFE' },
      { id: '2', horaInicio: '14:00', horaFim: '16:00', vagasOcupadas: 1, vagasTotal: 3, setores: ['Obras'], cor: '#E0E7FF' }
    ],
    '16': [
      { id: '3', horaInicio: '10:00', horaFim: '13:00', vagasOcupadas: 3, vagasTotal: 4, setores: ['Assessoria'], cor: '#FEF3C7' }
    ],
    '18': [
      { id: '4', horaInicio: '08:00', horaFim: '11:00', vagasOcupadas: 0, vagasTotal: 6, setores: ['Comercial', 'Obras'], cor: '#D1FAE5' },
      { id: '5', horaInicio: '14:00', horaFim: '18:00', vagasOcupadas: 4, vagasTotal: 5, setores: ['Obras'], cor: '#FCE7F3' }
    ],
    '20': [
      { id: '6', horaInicio: '09:00', horaFim: '12:00', vagasOcupadas: 5, vagasTotal: 5, setores: ['Comercial'], cor: '#E9D5FF' }
    ],
    '22': [
      { id: '7', horaInicio: '15:00', horaFim: '17:00', vagasOcupadas: 1, vagasTotal: 2, setores: ['Assessoria'], cor: '#FED7AA' }
    ],
    '25': [
      { id: '8', horaInicio: '09:00', horaFim: '13:00', vagasOcupadas: 2, vagasTotal: 8, setores: ['Comercial', 'Obras', 'Assessoria'], cor: '#DBEAFE' }
    ]
  };

export function CalendarioMes({ dataAtual }: CalendarioMesProps) {
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Obter o primeiro e último dia do mês
  const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
  const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);

  // Obter o dia da semana do primeiro dia (0 = Domingo)
  const diaSemanaInicio = primeiroDia.getDay();

  // Total de dias no mês
  const totalDias = ultimoDia.getDate();

  // Criar array de dias (incluindo espaços vazios no início)
  const dias = [];
  
  // Adicionar espaços vazios para os dias antes do primeiro dia do mês
  for (let i = 0; i < diaSemanaInicio; i++) {
    dias.push(null);
  }

  // Adicionar os dias do mês
  for (let dia = 1; dia <= totalDias; dia++) {
    dias.push(dia);
  }

  // Obter turnos para um dia específico
  const getTurnosDoDia = (dia: number | null) => {
    if (!dia) return [];
    return turnosPorDia[dia] || [];
  };

  return (
    <div className="p-6">
      {/* Grade do Calendário */}
      <div className="border border-neutral-200 rounded-lg overflow-hidden">
        {/* Cabeçalho com dias da semana */}
        <div className="grid grid-cols-7 bg-neutral-100 border-b border-neutral-200">
          {diasSemana.map((dia) => (
            <div key={dia} className="p-3 text-center border-r last:border-r-0 border-neutral-200">
              {dia}
            </div>
          ))}
        </div>

        {/* Grade de dias */}
        <div className="grid grid-cols-7">
          {dias.map((dia, index) => {
            const turnos = getTurnosDoDia(dia);
            const hoje = new Date();
            const ehHoje = dia === hoje.getDate() && 
                          dataAtual.getMonth() === hoje.getMonth() && 
                          dataAtual.getFullYear() === hoje.getFullYear();

            return (
              <div
                key={index}
                className={`
                  min-h-[120px] p-2 border-r border-b last:border-r-0
                  ${index % 7 === 0 || index % 7 === 6 ? 'bg-neutral-50' : 'bg-white'}
                  ${!dia ? 'bg-neutral-100' : ''}
                  border-neutral-200
                `}
              >
                {dia && (
                  <>
                    <div className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-full mb-2
                      ${ehHoje ? 'bg-primary text-white' : ''}
                    `}>
                      {dia}
                    </div>
                    
                    {/* Turnos do dia */}
                    <div className="space-y-1">
                      {turnos.map((turno, idx) => (
                        <div
                          key={idx}
                          className="rounded px-2 py-1.5 text-xs cursor-pointer hover:opacity-90 transition-opacity"
                          style={{ backgroundColor: turno.cor }}
                        >
                          <div className="flex items-center justify-between">
                            <Users className="h-3 w-3" />
                            <span>
                              {turno.vagasOcupadas}/{turno.vagasTotal} vagas
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legenda */}
      <div className="mt-4 p-4 bg-neutral-100 rounded-lg">
        <div className="text-sm text-neutral-700">
          <span className="font-medium">Legenda:</span> Clique em um turno para ver detalhes ou fazer um agendamento
        </div>
      </div>
    </div>
  );
}