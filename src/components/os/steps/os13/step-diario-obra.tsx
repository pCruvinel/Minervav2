import React from 'react';
import { StepAnexarArquivoGenerico } from '../shared/step-anexar-arquivo-generico';

interface StepDiarioObraProps {
  data: { diarioAnexado: string };
  onDataChange: (data: any) => void;
}

export function StepDiarioObra({ data, onDataChange }: StepDiarioObraProps) {
  return (
    <StepAnexarArquivoGenerico
      titulo="Cronograma de Obra (Diário de Obra)"
      descricao="Anexe o arquivo do diário de obra para acompanhamento das atividades diárias"
      mensagemSucesso="Diário de obra anexado!"
      mensagemPendente="Aguardando diário de obra"
      mensagemAlerta="O diário de obra deve ser atualizado regularmente com o registro das atividades executadas, mão de obra presente, condições climáticas e ocorrências relevantes."
      nomeArquivo="Diário de Obra"
      acceptFormats=".pdf,.xls,.xlsx,.doc,.docx"
      data={data}
      dataKey="diarioAnexado"
      onDataChange={onDataChange}
    />
  );
}
