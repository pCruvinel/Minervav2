import React from 'react';
import { StepAnexarArquivoGenerico } from '../shared/step-anexar-arquivo-generico';

interface StepPlacaObraProps {
  data: { placaAnexada: string };
  onDataChange: (data: any) => void;
}

export function StepPlacaObra({ data, onDataChange }: StepPlacaObraProps) {
  return (
    <StepAnexarArquivoGenerico
      titulo="Gerar Placa de Obra"
      descricao="Anexe o arquivo da placa de obra que será instalada no local"
      mensagemSucesso="Placa de obra anexada!"
      mensagemPendente="Aguardando arquivo da placa"
      mensagemAlerta="A placa de obra deve conter informações sobre a empresa responsável, engenheiro, ART e demais dados obrigatórios conforme legislação."
      nomeArquivo="Placa de Obra"
      acceptFormats=".pdf,.png,.jpg,.ai,.psd"
      data={data}
      dataKey="placaAnexada"
      onDataChange={onDataChange}
    />
  );
}
