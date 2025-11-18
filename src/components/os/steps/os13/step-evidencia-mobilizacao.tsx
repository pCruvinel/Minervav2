import React from 'react';
import { StepAnexarArquivoGenerico } from '../shared/step-anexar-arquivo-generico';

interface StepEvidenciaMobilizacaoProps {
  data: { evidenciaAnexada: string };
  onDataChange: (data: any) => void;
}

export function StepEvidenciaMobilizacao({ data, onDataChange }: StepEvidenciaMobilizacaoProps) {
  return (
    <StepAnexarArquivoGenerico
      titulo="Evidência de Mobilização Concluída"
      descricao="Anexe evidências fotográficas da mobilização: placa instalada, sinalização, caminho seguro e canteiro"
      mensagemSucesso="Evidências anexadas!"
      mensagemPendente="Aguardando evidências de mobilização"
      mensagemAlerta="As evidências devem incluir fotos da placa de obra instalada, sinalização de segurança, caminhos seguros demarcados e canteiro de obras montado."
      nomeArquivo="Evidências de Mobilização"
      acceptFormats=".pdf,.zip,.png,.jpg,.jpeg"
      data={data}
      dataKey="evidenciaAnexada"
      onDataChange={onDataChange}
    />
  );
}
