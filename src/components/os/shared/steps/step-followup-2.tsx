import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';

interface ArquivoComComentario {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
  comentario: string;
}

interface StepFollowUp2Props {
  data: {
    // Momento 1: Perguntas Durante a Visita - Respostas do Cliente
    outrasEmpresas: string;
    comoEsperaResolver: string;
    expectativaCliente: string;
    estadoAncoragem: string;
    fotosAncoragem: Array<ArquivoComComentario>;

    // Momento 2: Avaliação Geral da Visita
    quemAcompanhou: string;
    avaliacaoVisita: string; // "produtiva" | "pouco-produtiva" | "improdutiva"

    // Momento 3: Respostas do Engenheiro
    estadoGeralEdificacao: string;
    servicoResolver: string;
    arquivosGerais: Array<ArquivoComComentario>;
  };
  onDataChange: (data: StepFollowUp2Props['data']) => void;
  osId?: string;
}

export function StepFollowUp2({
  data,
  onDataChange,
  osId,
}: StepFollowUp2Props) {

  // Helper para normalizar arquivos para o formato do schema
  const handleFilesChange = (files: ArquivoComComentario[], field: 'fotosAncoragem' | 'arquivosGerais') => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filesForSchema = files.map((file: any) => ({
      id: file.id,
      url: file.url,
      name: file.name || file.nome,
      path: file.path || '',
      size: file.size || file.tamanho || 0,
      type: file.type || '',
      uploadedAt: file.uploadedAt || new Date().toISOString(),
      comment: file.comentario || file.comment || ''
    }));

    onDataChange({
      ...data,
      [field]: filesForSchema
    });
  };

  // Converter dados do schema para o formato do FileUploadUnificado
  const getFilesForUpload = (files: ArquivoComComentario[]): ArquivoComComentario[] => {
    if (!files) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return files.map((f: any) => ({
      id: f.id || '',
      name: f.name || f.nome || '',
      url: f.url || '',
      path: f.path || '',
      size: f.size || f.tamanho || 0,
      type: f.type || '',
      uploadedAt: f.uploadedAt || '',
      comentario: f.comment || f.comentario || ''
    }));
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Documente as informações coletadas durante e após a visita técnica. Divida em 3 momentos: Respostas do Cliente, Avaliação da Visita e Análise Técnica do Engenheiro.
        </AlertDescription>
      </Alert>

      {/* MOMENTO 1: Perguntas Durante a Visita - Respostas do Cliente */}
      <div className="space-y-4">
        <div className="bg-muted px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 1: Perguntas Durante a Visita - Respostas do Cliente</h3>
        </div>

        {/* 1. Outras empresas */}
        <div className="space-y-2">
          <Label htmlFor="outrasEmpresas">
            1. Há outras empresas realizando visita técnica? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="outrasEmpresas"
            rows={3}
            value={data.outrasEmpresas}
            onChange={(e) => onDataChange({ ...data, outrasEmpresas: e.target.value })}
            placeholder="Informe se há concorrentes e quais..."
          />
        </div>

        {/* 2. Como espera resolver */}
        <div className="space-y-2">
          <Label htmlFor="comoEsperaResolver">
            2. Como você espera resolver esse problema? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="comoEsperaResolver"
            rows={3}
            value={data.comoEsperaResolver}
            onChange={(e) => onDataChange({ ...data, comoEsperaResolver: e.target.value })}
            placeholder="Descreva a expectativa de solução do cliente..."
          />
        </div>

        {/* 3. Expectativa do cliente */}
        <div className="space-y-2">
          <Label htmlFor="expectativaCliente">
            3. Qual a principal expectativa do cliente? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="expectativaCliente"
            rows={3}
            value={data.expectativaCliente}
            onChange={(e) => onDataChange({ ...data, expectativaCliente: e.target.value })}
            placeholder="Descreva a principal expectativa..."
          />
        </div>

        {/* 4. Estado do sistema de ancoragem */}
        <div className="space-y-2">
          <Label htmlFor="estadoAncoragem">
            4. Qual o estado do sistema de ancoragem? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="estadoAncoragem"
            rows={4}
            value={data.estadoAncoragem}
            onChange={(e) => onDataChange({ ...data, estadoAncoragem: e.target.value })}
            placeholder="Descreva detalhadamente o estado do sistema de ancoragem observado..."
          />
        </div>

        {/* 5. Anexar fotos do sistema de ancoragem */}
        <div className="space-y-2">
          <FileUploadUnificado
            label="5. Anexar fotos do sistema de ancoragem"
            files={getFilesForUpload(data.fotosAncoragem || [])}
            onFilesChange={(files) => handleFilesChange(files, 'fotosAncoragem')}
            osId={osId}
            acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
          />
        </div>
      </div>

      <Separator />

      {/* MOMENTO 2: Avaliação Geral da Visita */}
      <div className="space-y-4">
        <div className="bg-muted px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 2: Avaliação Geral da Visita</h3>
        </div>

        {/* 6. Quem acompanhou a visita */}
        <div className="space-y-2">
          <Label htmlFor="quemAcompanhou">
            6. Quem acompanhou a visita? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="quemAcompanhou"
            rows={2}
            value={data.quemAcompanhou}
            onChange={(e) => onDataChange({ ...data, quemAcompanhou: e.target.value })}
            placeholder="Nomes e cargos das pessoas que acompanharam..."
          />
        </div>

        {/* 7. Avaliação da Visita */}
        <div className="space-y-2">
          <Label>
            7. Avaliação da Visita <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.avaliacaoVisita}
            onValueChange={(value) => onDataChange({ ...data, avaliacaoVisita: value })}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="produtiva" id="produtiva" />
              <Label htmlFor="produtiva" className="cursor-pointer font-normal">
                Produtiva, cliente muito interessado
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="pouco-produtiva" id="pouco-produtiva" />
              <Label htmlFor="pouco-produtiva" className="cursor-pointer font-normal">
                Pouco produtiva
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="improdutiva" id="improdutiva" />
              <Label htmlFor="improdutiva" className="cursor-pointer font-normal">
                Improdutiva
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      {/* MOMENTO 3: Respostas do Engenheiro */}
      <div className="space-y-4">
        <div className="bg-muted px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 3: Respostas do Engenheiro</h3>
        </div>

        {/* 8. Estado geral da edificação */}
        <div className="space-y-2">
          <Label htmlFor="estadoGeralEdificacao">
            8. Qual o estado geral da edificação? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="estadoGeralEdificacao"
            rows={4}
            value={data.estadoGeralEdificacao}
            onChange={(e) => onDataChange({ ...data, estadoGeralEdificacao: e.target.value })}
            placeholder="Descreva tecnicamente o estado geral da edificação observado..."
          />
        </div>

        {/* 9. Qual o serviço deve ser feito */}
        <div className="space-y-2">
          <Label htmlFor="servicoResolver">
            9. Qual o serviço deve ser feito para resolver o problema? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="servicoResolver"
            rows={5}
            value={data.servicoResolver}
            onChange={(e) => onDataChange({ ...data, servicoResolver: e.target.value })}
            placeholder="Descreva detalhadamente o escopo técnico do serviço necessário..."
          />
        </div>

        {/* 10. Anexar Arquivos Gerais */}
        <div className="space-y-2">
          <FileUploadUnificado
            label="10. Anexar Arquivos (Fotos gerais, croquis, medições, etc)"
            files={getFilesForUpload(data.arquivosGerais || [])}
            onFilesChange={(files) => handleFilesChange(files, 'arquivosGerais')}
            osId={osId}
          />
        </div>
      </div>
    </div>
  );
}
