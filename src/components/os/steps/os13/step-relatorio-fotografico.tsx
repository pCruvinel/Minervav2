import React from 'react';
import { StepAnexarArquivoGenerico } from '../shared/step-anexar-arquivo-generico';

export interface StepRelatorioFotograficoProps {
  data: { relatorioAnexado: string };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepRelatorioFotografico({ data, onDataChange, readOnly }: StepRelatorioFotograficoProps) {
  return (
    <StepAnexarArquivoGenerico
      titulo="Anexar Relatório Fotográfico Pré-Obra"
      descricao="Anexe o relatório fotográfico da vistoria cautelar realizada antes do início da obra"
      mensagemSucesso="Relatório fotográfico anexado!"
      mensagemPendente="Aguardando relatório fotográfico"
      mensagemAlerta="O relatório fotográfico pré-obra é essencial para documentar o estado inicial da edificação e áreas adjacentes."
      nomeArquivo="Relatório Fotográfico Pré-Obra"
      acceptFormats=".pdf,.zip"
      data={data}
      dataKey="relatorioAnexado"
      onDataChange={onDataChange}
      readOnly={readOnly}
    />
  );
}
