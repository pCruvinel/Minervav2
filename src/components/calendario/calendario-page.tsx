import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { CalendarioSemana } from './calendario-semana';
import { CalendarioMes } from './calendario-mes';
import { CalendarioDia } from './calendario-dia';

type VisualizacaoTipo = 'mes' | 'semana' | 'dia';

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

  // Navegação de mês
  const mesAnterior = () => {
    const novaData = new Date(dataAtual);
    if (visualizacao === 'mes') {
      novaData.setMonth(novaData.getMonth() - 1);
    } else if (visualizacao === 'semana') {
      novaData.setDate(novaData.getDate() - 7);
    } else {
      novaData.setDate(novaData.getDate() - 1);
    }
    setDataAtual(novaData);
  };

  const proximoMes = () => {
    const novaData = new Date(dataAtual);
    if (visualizacao === 'mes') {
      novaData.setMonth(novaData.getMonth() + 1);
    } else if (visualizacao === 'semana') {
      novaData.setDate(novaData.getDate() + 7);
    } else {
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
                onClick={mesAnterior}
                className="h-10 w-10"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              
              <h1 className="capitalize min-w-[200px] text-center">
                {formatarMesAno(dataAtual)}
              </h1>
              
              <Button
                variant="outline"
                size="icon"
                onClick={proximoMes}
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
