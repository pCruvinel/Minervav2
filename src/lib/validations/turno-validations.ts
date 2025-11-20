/**
 * Validações de Turnos
 *
 * Funções auxiliares para validação de turnos e agendamentos:
 * - Verificação de sobreposição de horários
 * - Validação de duração
 * - Validação de horários operacionais
 */

// =====================================================
// TIPOS
// =====================================================

export interface Turno {
  horaInicio: string;
  horaFim: string;
}

export interface HorarioValidacao {
  valido: boolean;
  erro?: string;
}

// =====================================================
// FUNÇÕES DE VALIDAÇÃO
// =====================================================

/**
 * Converte tempo HH:MM para minutos desde meia-noite
 */
export function converterParaMinutos(horario: string): number {
  const [horas, minutos] = horario.split(':').map(Number);
  return horas * 60 + minutos;
}

/**
 * Verifica se dois turnos se sobrepõem
 *
 * @param turno1 Primeiro turno
 * @param turno2 Segundo turno
 * @returns true se os turnos se sobrepõem
 *
 * Exemplos:
 * - 09:00-11:00 vs 10:00-12:00 → true (sobrepõem)
 * - 09:00-11:00 vs 11:00-13:00 → false (adjacentes, não sobrepõem)
 * - 09:00-11:00 vs 13:00-15:00 → false (sem sobreposição)
 */
export function verificarSobreposicao(turno1: Turno, turno2: Turno): boolean {
  const inicio1 = converterParaMinutos(turno1.horaInicio);
  const fim1 = converterParaMinutos(turno1.horaFim);
  const inicio2 = converterParaMinutos(turno2.horaInicio);
  const fim2 = converterParaMinutos(turno2.horaFim);

  // Não sobrepõem se um termina antes do outro começar
  return !(fim1 <= inicio2 || fim2 <= inicio1);
}

/**
 * Valida se um horário está dentro do intervalo operacional
 *
 * @param horario Horário no formato HH:MM
 * @param horaMinima Hora mínima permitida (ex: "08:00")
 * @param horaMaxima Hora máxima permitida (ex: "18:00")
 * @returns HorarioValidacao
 */
export function validarHorarioOperacional(
  horario: string,
  horaMinima: string = '08:00',
  horaMaxima: string = '18:00'
): HorarioValidacao {
  if (!horario) {
    return { valido: false, erro: 'Horário é obrigatório' };
  }

  if (!/^\d{2}:\d{2}$/.test(horario)) {
    return { valido: false, erro: 'Formato inválido (use HH:MM)' };
  }

  const minutos = converterParaMinutos(horario);
  const minutoMinimo = converterParaMinutos(horaMinima);
  const minutoMaximo = converterParaMinutos(horaMaxima);

  if (minutos < minutoMinimo || minutos > minutoMaximo) {
    return {
      valido: false,
      erro: `Deve estar entre ${horaMinima} e ${horaMaxima}`,
    };
  }

  return { valido: true };
}

/**
 * Valida duração entre dois horários
 *
 * @param horaInicio Hora de início (HH:MM)
 * @param horaFim Hora de fim (HH:MM)
 * @param duracoMinima Duração mínima em minutos (padrão: 30)
 * @param duracaoMaxima Duração máxima em minutos (padrão: 240 = 4h)
 * @returns HorarioValidacao
 */
export function validarDuracao(
  horaInicio: string,
  horaFim: string,
  duracaoMinima: number = 30,
  duracaoMaxima: number = 240
): HorarioValidacao {
  if (!horaInicio || !horaFim) {
    return { valido: false, erro: 'Horários são obrigatórios' };
  }

  const inicioMinutos = converterParaMinutos(horaInicio);
  const fimMinutos = converterParaMinutos(horaFim);

  if (fimMinutos <= inicioMinutos) {
    return { valido: false, erro: 'Hora de fim deve ser após a hora de início' };
  }

  const duracao = fimMinutos - inicioMinutos;

  if (duracao < duracaoMinima) {
    const minutos = duracaoMinima % 60;
    const horas = Math.floor(duracaoMinima / 60);
    const texto =
      horas > 0 && minutos > 0
        ? `${horas}h ${minutos}min`
        : horas > 0
          ? `${horas}h`
          : `${minutos}min`;
    return {
      valido: false,
      erro: `Duração mínima é ${texto}`,
    };
  }

  if (duracao > duracaoMaxima) {
    const minutos = duracaoMaxima % 60;
    const horas = Math.floor(duracaoMaxima / 60);
    const texto =
      horas > 0 && minutos > 0
        ? `${horas}h ${minutos}min`
        : horas > 0
          ? `${horas}h`
          : `${minutos}min`;
    return {
      valido: false,
      erro: `Duração máxima é ${texto}`,
    };
  }

  return { valido: true };
}

/**
 * Valida se um novo turno se sobrepõe com turnos existentes
 *
 * @param novoTurno Turno que será criado/editado
 * @param turnosExistentes Lista de turnos existentes
 * @returns HorarioValidacao
 */
export function validarSobreposicaoComExistentes(
  novoTurno: Turno,
  turnosExistentes: Turno[]
): HorarioValidacao {
  const turnosSobrepostos = turnosExistentes.filter((turno) =>
    verificarSobreposicao(novoTurno, turno)
  );

  if (turnosSobrepostos.length > 0) {
    const horariosSobrepostos = turnosSobrepostos
      .map((t) => `${t.horaInicio}-${t.horaFim}`)
      .join(', ');
    return {
      valido: false,
      erro: `Sobrepõe com os seguintes turnos: ${horariosSobrepostos}`,
    };
  }

  return { valido: true };
}

/**
 * Calcula a duração em horas e minutos
 *
 * @param horaInicio Hora de início (HH:MM)
 * @param horaFim Hora de fim (HH:MM)
 * @returns Objeto com horas e minutos
 */
export function calcularDuracao(horaInicio: string, horaFim: string) {
  const inicioMinutos = converterParaMinutos(horaInicio);
  const fimMinutos = converterParaMinutos(horaFim);
  const duracao = fimMinutos - inicioMinutos;

  return {
    minutos: duracao,
    horas: Math.floor(duracao / 60),
    minutosResto: duracao % 60,
    texto: `${Math.floor(duracao / 60)}h ${duracao % 60}min`,
  };
}
