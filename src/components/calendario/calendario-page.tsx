import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { CalendarioSemana } from './calendario-semana';
import { CalendarioMes } from './calendario-mes';
import { CalendarioDia } from './calendario-dia';

type VisualizacaoTipo = 'mes' | 'semana' | 'dia';

/**
 * Retorna a segunda-feira (início da semana) para qualquer data dada
 * @param data - Data de entrada
 * @returns Nova data ajustada para segunda-feira
 */
const getStartOfWeek = (data: Date): Date => {
  const result = new Date(data);
  const dayOfWeek = result.getDay(); // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado

  // Calcular quantos dias voltar para chegar à segunda-feira
  // Se é segunda (1): 0 dias | Se é domingo (0): -6 dias | Se é sexta (5): -4 dias
  const distanceToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  result.setDate(result.getDate() + distanceToMonday);

  return result;
};

/**
 * Retorna o domingo (fim da semana) para qualquer data dada
 * @param data - Data de entrada
 * @returns Nova data ajustada para domingo
 */
const getEndOfWeek = (data: Date): Date => {
  const result = new Date(data);
  const dayOfWeek = result.getDay();

  // Calcular quantos dias avançar para chegar ao domingo
  // Se é segunda (1): +6 dias | Se é domingo (0): 0 dias | Se é sábado (6): +1 dia
  const distanceToSunday = dayOfWeek === 0 ? 0 : 7 - dayOfWeek;
  result.setDate(result.getDate() + distanceToSunday);

  return result;
};

export function CalendarioPage() {
  const [dataAtual, setDataAtual] = useState(new Date());
  const [visualizacao, setVisualizacao] = useState<VisualizacaoTipo>('semana');

  // Formatar mês e ano (ex: "Novembro 2025")
  const formatarMesAno = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      month: 'long',
      year: 'numeric'
    });
  };

  // Formatar data para visualização (ex: "20 Nov - 26 Nov")
  const formatarSemana = (data: Date) => {
    const inicio = getStartOfWeek(data);
    const fim = getEndOfWeek(data);
    const formatData = (d: Date) => d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
    return `${formatData(inicio)} - ${formatData(fim)}`;
  };

  // Formatar data para dia (ex: "Quarta, 20 de Novembro")
  const formatarDia = (data: Date) => {
    return data.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  // Navegação de período anterior
  const irParaPeriodoAnterior = () => {
    const novaData = new Date(dataAtual);
    if (visualizacao === 'mes') {
      novaData.setMonth(novaData.getMonth() - 1);
    } else if (visualizacao === 'semana') {
      // Ir para semana anterior: voltar 7 dias
      novaData.setDate(novaData.getDate() - 7);
    } else {
      // Ir para dia anterior
      novaData.setDate(novaData.getDate() - 1);
    }
    setDataAtual(novaData);
  };

  // Navegação de período próximo
  const irParaProximoPeriodo = () => {
    const novaData = new Date(dataAtual);
    if (visualizacao === 'mes') {
      novaData.setMonth(novaData.getMonth() + 1);
    } else if (visualizacao === 'semana') {
      // Ir para próxima semana: avançar 7 dias
      novaData.setDate(novaData.getDate() + 7);
    } else {
      // Ir para próximo dia
      novaData.setDate(novaData.getDate() + 1);
    }
    setDataAtual(novaData);
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Cabeçalho */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            {/* Navegação de Mês/Ano */}
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={irParaPeriodoAnterior}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>

              <h1 className="capitalize min-w-[200px] text-center">
                {visualizacao === 'mes' && formatarMesAno(dataAtual)}
                {visualizacao === 'semana' && formatarSemana(dataAtual)}
                {visualizacao === 'dia' && formatarDia(dataAtual)}
              </h1>

              <Button
                variant="outline"
                size="icon"
                onClick={irParaProximoPeriodo}
                className="h-10 w-10"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>

            {/* Botões de Visualização */}
            <div className="flex gap-2">
              <Button
                variant={visualizacao === 'mes' ? 'default' : 'outline'}
                onClick={() => setVisualizacao('mes')}
                className="min-w-[100px]"
              >
                Mês
              </Button>
              <Button
                variant={visualizacao === 'semana' ? 'default' : 'outline'}
                onClick={() => setVisualizacao('semana')}
                className="min-w-[100px]"
              >
                Semana
              </Button>
              <Button
                variant={visualizacao === 'dia' ? 'default' : 'outline'}
                onClick={() => setVisualizacao('dia')}
                className="min-w-[100px]"
              >
                Dia
              </Button>
            </div>
          </div>
        </div>

        {/* Conteúdo do Calendário */}
        <div className="bg-white rounded-lg shadow-sm border border-neutral-200">
          {visualizacao === 'semana' && <CalendarioSemana dataAtual={dataAtual} />}
          {visualizacao === 'mes' && <CalendarioMes dataAtual={dataAtual} />}
          {visualizacao === 'dia' && <CalendarioDia dataAtual={dataAtual} />}
        </div>
      </div>
    </div>
  );
}
