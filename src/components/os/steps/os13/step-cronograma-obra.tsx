import React from 'react';
import { StepAnexarArquivoGenerico } from '../shared/step-anexar-arquivo-generico';

interface StepCronogramaObraProps {
  data: { cronogramaAnexado: string };
  onDataChange: (data: any) => void;
}

export function StepCronogramaObra({ data, onDataChange }: StepCronogramaObraProps) {
  return (
    <StepAnexarArquivoGenerico
      titulo="Anexar Cronograma de Obra"
      descricao="Anexe o cronograma detalhado da obra em formato MS Project ou PDF"
      mensagemSucesso="Cronograma anexado com sucesso!"
      mensagemPendente="Aguardando cronograma da obra"
      mensagemAlerta="O cronograma deve conter todas as etapas da obra com datas previstas de início e término, incluindo marcos importantes e dependências entre atividades."
      nomeArquivo="Cronograma de Obra (MS Project)"
      acceptFormats=".pdf,.mpp,.xls,.xlsx"
      data={data}
      dataKey="cronogramaAnexado"
      onDataChange={onDataChange}
    />
  );
}
