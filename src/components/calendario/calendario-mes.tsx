import { Users, Loader2, AlertCircle } from 'lucide-react';
import { useTurnosPorSemana, TurnoComVagas } from '../../lib/hooks/use-turnos';
import { Alert, AlertDescription } from '../ui/alert';

interface CalendarioMesProps {
  dataAtual: Date;
}

export function CalendarioMes({ dataAtual }: CalendarioMesProps) {
  // Calcular período do mês
  const primeiroDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), 1);
  const ultimoDia = new Date(dataAtual.getFullYear(), dataAtual.getMonth() + 1, 0);

  const startDate = primeiroDia.toISOString().split('T')[0];
  const endDate = ultimoDia.toISOString().split('T')[0];

  // Buscar turnos do mês
  const { turnosPorDia, loading, error } = useTurnosPorSemana(startDate, endDate);

  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

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
  const getTurnosDoDia = (dia: number | null): TurnoComVagas[] => {
    if (!dia || !turnosPorDia) return [];

    // Formatar dia como string (ex: "2025-11-20")
    const dataStr = new Date(dataAtual.getFullYear(), dataAtual.getMonth(), dia)
      .toISOString()
      .split('T')[0];

    return turnosPorDia.get(dataStr) || [];
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-neutral-600">Carregando turnos...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carrega turnos: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

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
            const ehHoje =
              dia === hoje.getDate() &&
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
                    <div
                      className={`
                      inline-flex items-center justify-center w-7 h-7 rounded-full mb-2
                      ${ehHoje ? 'bg-primary text-white' : ''}
                    `}
                    >
                      {dia}
                    </div>

                    {/* Turnos do dia */}
                    <div className="space-y-1">
                      {turnos.length === 0 ? (
                        <p className="text-xs text-neutral-400">Sem turnos</p>
                      ) : (
                        turnos.map((turno, idx) => {
                          const vagasOcupadas = turno.vagasOcupadas || 0;
                          const vagasTotal = turno.vagasTotal || 1;
                          return (
                            <div
                              key={idx}
                              className="rounded px-2 py-1.5 text-xs cursor-pointer hover:opacity-90 transition-opacity"
                              style={{ backgroundColor: turno.cor || '#DBEAFE' }}
                            >
                              <div className="flex items-center justify-between">
                                <Users className="h-3 w-3" />
                                <span>
                                  {vagasOcupadas}/{vagasTotal}
                                </span>
                              </div>
                            </div>
                          );
                        })
                      )}
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
          <span className="font-medium">Legenda:</span> Cada bloco representa um turno com sua disponibilidade de
          vagas
        </div>
      </div>
    </div>
  );
}
