// Utilitários de Data - Sistema Minerva ERP

/**
 * Formata data ISO para formato brasileiro DD/MM/YYYY
 */
export function formatarData(dataISO: string): string {
  try {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return 'Data inválida';
  }
}

/**
 * Formata data ISO para formato com hora DD/MM/YYYY HH:MM
 */
export function formatarDataHora(dataISO: string): string {
  try {
    const data = new Date(dataISO);
    return data.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Erro ao formatar data/hora:', error);
    return 'Data inválida';
  }
}

/**
 * Formata data para formato relativo (ex: "há 2 dias", "ontem", etc)
 */
export function formatarDataRelativa(dataISO: string): string {
  try {
    const data = new Date(dataISO);
    const agora = new Date();
    const diffMs = agora.getTime() - data.getTime();
    const diffSeg = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSeg / 60);
    const diffHoras = Math.floor(diffMin / 60);
    const diffDias = Math.floor(diffHoras / 24);

    if (diffSeg < 60) {
      return 'agora mesmo';
    } else if (diffMin < 60) {
      return `há ${diffMin} ${diffMin === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHoras < 24) {
      return `há ${diffHoras} ${diffHoras === 1 ? 'hora' : 'horas'}`;
    } else if (diffDias === 1) {
      return 'ontem';
    } else if (diffDias < 7) {
      return `há ${diffDias} dias`;
    } else if (diffDias < 30) {
      const semanas = Math.floor(diffDias / 7);
      return `há ${semanas} ${semanas === 1 ? 'semana' : 'semanas'}`;
    } else if (diffDias < 365) {
      const meses = Math.floor(diffDias / 30);
      return `há ${meses} ${meses === 1 ? 'mês' : 'meses'}`;
    } else {
      const anos = Math.floor(diffDias / 365);
      return `há ${anos} ${anos === 1 ? 'ano' : 'anos'}`;
    }
  } catch (error) {
    console.error('Erro ao formatar data relativa:', error);
    return 'Data inválida';
  }
}

/**
 * Calcula dias restantes até uma data futura
 */
export function calcularDiasRestantes(dataFuturaISO: string): number {
  try {
    const dataFutura = new Date(dataFuturaISO);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    dataFutura.setHours(0, 0, 0, 0);
    
    const diffMs = dataFutura.getTime() - hoje.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDias;
  } catch (error) {
    console.error('Erro ao calcular dias restantes:', error);
    return 0;
  }
}

/**
 * Calcula dias de atraso (número positivo se atrasado)
 */
export function calcularDiasAtraso(dataPrazoISO: string): number {
  try {
    const prazo = new Date(dataPrazoISO);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    prazo.setHours(0, 0, 0, 0);
    
    const diffMs = hoje.getTime() - prazo.getTime();
    const diffDias = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    
    return diffDias > 0 ? diffDias : 0;
  } catch (error) {
    console.error('Erro ao calcular dias de atraso:', error);
    return 0;
  }
}

/**
 * Verifica se uma data está no passado
 */
export function isDataPassada(dataISO: string): boolean {
  try {
    const data = new Date(dataISO);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    data.setHours(0, 0, 0, 0);
    
    return data < hoje;
  } catch (error) {
    console.error('Erro ao verificar data passada:', error);
    return false;
  }
}

/**
 * Verifica se uma data é hoje
 */
export function isDataHoje(dataISO: string): boolean {
  try {
    const data = new Date(dataISO);
    const hoje = new Date();
    
    return (
      data.getDate() === hoje.getDate() &&
      data.getMonth() === hoje.getMonth() &&
      data.getFullYear() === hoje.getFullYear()
    );
  } catch (error) {
    console.error('Erro ao verificar se é hoje:', error);
    return false;
  }
}

/**
 * Formata duração em minutos para formato legível
 */
export function formatarDuracao(minutos: number): string {
  if (minutos < 60) {
    return `${minutos}min`;
  } else if (minutos < 1440) { // menos de 24 horas
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return mins > 0 ? `${horas}h ${mins}min` : `${horas}h`;
  } else {
    const dias = Math.floor(minutos / 1440);
    const horas = Math.floor((minutos % 1440) / 60);
    if (horas > 0) {
      return `${dias}d ${horas}h`;
    }
    return `${dias}d`;
  }
}

/**
 * Adiciona dias a uma data
 */
export function adicionarDias(dataISO: string, dias: number): string {
  try {
    const data = new Date(dataISO);
    data.setDate(data.getDate() + dias);
    return data.toISOString();
  } catch (error) {
    console.error('Erro ao adicionar dias:', error);
    return dataISO;
  }
}

/**
 * Formata data para input type="date" (YYYY-MM-DD)
 */
export function formatarParaInputDate(dataISO?: string): string {
  try {
    const data = dataISO ? new Date(dataISO) : new Date();
    return data.toISOString().split('T')[0];
  } catch (error) {
    console.error('Erro ao formatar para input date:', error);
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Converte input type="date" (YYYY-MM-DD) para ISO
 */
export function converterInputDateParaISO(inputDate: string): string {
  try {
    const data = new Date(inputDate + 'T00:00:00');
    return data.toISOString();
  } catch (error) {
    console.error('Erro ao converter input date:', error);
    return new Date().toISOString();
  }
}

/**
 * Obtém primeiro dia do mês
 */
export function getPrimeiroDiaDoMes(ano: number, mes: number): Date {
  return new Date(ano, mes, 1);
}

/**
 * Obtém último dia do mês
 */
export function getUltimoDiaDoMes(ano: number, mes: number): Date {
  return new Date(ano, mes + 1, 0);
}

/**
 * Obtém nome do mês em português
 */
export function getNomeMes(mes: number): string {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  return meses[mes] || 'Mês inválido';
}

/**
 * Obtém nome do dia da semana em português
 */
export function getNomeDiaSemana(dia: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  return dias[dia] || 'Dia inválido';
}

/**
 * Formata range de datas
 */
export function formatarRangeData(dataInicioISO: string, dataFimISO: string): string {
  try {
    const inicio = new Date(dataInicioISO);
    const fim = new Date(dataFimISO);
    
    if (inicio.toDateString() === fim.toDateString()) {
      return formatarData(dataInicioISO);
    }
    
    return `${formatarData(dataInicioISO)} - ${formatarData(dataFimISO)}`;
  } catch (error) {
    console.error('Erro ao formatar range de datas:', error);
    return 'Range inválido';
  }
}
