import React from 'react';
import { StepAnexarArquivoGenerico } from '../shared/step-anexar-arquivo-generico';

interface StepHistogramaProps {
  data: { histogramaAnexado: string };
  onDataChange: (data: any) => void;
}

export function StepHistograma({ data, onDataChange }: StepHistogramaProps) {
  return (
    <StepAnexarArquivoGenerico
      titulo="Histograma de Obra"
      descricao="Anexe o histograma com a distribuição de recursos ao longo do tempo da obra"
      mensagemSucesso="Histograma anexado!"
      mensagemPendente="Aguardando histograma"
      mensagemAlerta="O histograma deve mostrar a distribuição de mão de obra, materiais e equipamentos ao longo das fases da obra."
      nomeArquivo="Histograma de Obra"
      acceptFormats=".pdf,.xls,.xlsx,.png,.jpg"
      data={data}
      dataKey="histogramaAnexado"
      onDataChange={onDataChange}
    />
  );
}
