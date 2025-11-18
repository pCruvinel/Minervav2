import React from 'react';
import { StepAnexarArquivoGenerico } from '../shared/step-anexar-arquivo-generico';

interface StepImagemAreasProps {
  data: { imagemAnexada: string };
  onDataChange: (data: any) => void;
}

export function StepImagemAreas({ data, onDataChange }: StepImagemAreasProps) {
  return (
    <StepAnexarArquivoGenerico
      titulo="Anexar Imagem de Referência de Áreas"
      descricao="Anexe a imagem de referência das áreas vinculada ao cronograma da obra"
      mensagemSucesso="Imagem de áreas anexada!"
      mensagemPendente="Aguardando imagem de áreas"
      mensagemAlerta="Esta imagem deve conter a identificação clara das áreas que serão trabalhadas, servindo como referência para o cronograma."
      nomeArquivo="Imagem de Referência de Áreas"
      acceptFormats=".pdf,.png,.jpg,.jpeg,.dwg"
      data={data}
      dataKey="imagemAnexada"
      onDataChange={onDataChange}
    />
  );
}
