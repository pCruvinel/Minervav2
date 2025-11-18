import React from 'react';
import { Card, CardContent } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Alert, AlertDescription } from '../../../ui/alert';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { Separator } from '../../../ui/separator';
import { Upload, X, AlertCircle } from 'lucide-react';

interface FotoComComentario {
  file: File;
  comment: string;
}

interface StepFollowUp2Props {
  data: {
    // Momento 1: Perguntas Durante a Visita - Respostas do Cliente
    outrasEmpresas: string;
    comoEsperaResolver: string;
    expectativaCliente: string;
    estadoAncoragem: string;
    fotosAncoragem: Array<FotoComComentario>;
    
    // Momento 2: Avaliação Geral da Visita
    quemAcompanhou: string;
    avaliacaoVisita: string; // "produtiva" | "pouco-produtiva" | "improdutiva"
    
    // Momento 3: Respostas do Engenheiro
    estadoGeralEdificacao: string;
    servicoResolver: string;
    arquivosGerais: Array<FotoComComentario>;
  };
  onDataChange: (data: any) => void;
}

export function StepFollowUp2({
  data,
  onDataChange,
}: StepFollowUp2Props) {
  const handleFileUpload = (files: FileList | null, tipo: 'ancoragem' | 'geral') => {
    if (!files) return;
    
    const novoArquivo: FotoComComentario = {
      file: files[0],
      comment: '',
    };
    
    if (tipo === 'ancoragem') {
      onDataChange({
        ...data,
        fotosAncoragem: [...data.fotosAncoragem, novoArquivo],
      });
    } else {
      onDataChange({
        ...data,
        arquivosGerais: [...data.arquivosGerais, novoArquivo],
      });
    }
  };

  const handleRemoverArquivo = (index: number, tipo: 'ancoragem' | 'geral') => {
    if (tipo === 'ancoragem') {
      const novaLista = data.fotosAncoragem.filter((_, i) => i !== index);
      onDataChange({ ...data, fotosAncoragem: novaLista });
    } else {
      const novaLista = data.arquivosGerais.filter((_, i) => i !== index);
      onDataChange({ ...data, arquivosGerais: novaLista });
    }
  };

  const handleAtualizarComentario = (index: number, comentario: string, tipo: 'ancoragem' | 'geral') => {
    if (tipo === 'ancoragem') {
      const novaLista = [...data.fotosAncoragem];
      novaLista[index] = { ...novaLista[index], comment: comentario };
      onDataChange({ ...data, fotosAncoragem: novaLista });
    } else {
      const novaLista = [...data.arquivosGerais];
      novaLista[index] = { ...novaLista[index], comment: comentario };
      onDataChange({ ...data, arquivosGerais: novaLista });
    }
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
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
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
          <Label>5. Anexar fotos do sistema de ancoragem</Label>
          <div className="space-y-3">
            {/* Área de Upload */}
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                id="upload-ancoragem"
                onChange={(e) => handleFileUpload(e.target.files, 'ancoragem')}
              />
              <label htmlFor="upload-ancoragem" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique para selecionar fotos do sistema de ancoragem</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG (máx. 10MB cada)</p>
              </label>
            </div>

            {/* Lista de arquivos carregados */}
            {data.fotosAncoragem.length > 0 && (
              <div className="space-y-2">
                {data.fotosAncoragem.map((foto, index) => (
                  <Card key={index} className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{foto.file.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoverArquivo(index, 'ancoragem')}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <Textarea
                          rows={2}
                          value={foto.comment}
                          onChange={(e) => handleAtualizarComentario(index, e.target.value, 'ancoragem')}
                          placeholder="Adicione um comentário sobre esta foto..."
                          className="text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Separator />

      {/* MOMENTO 2: Avaliação Geral da Visita */}
      <div className="space-y-4">
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
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
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
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
          <Label>10. Anexar Arquivos (Fotos gerais, croquis, medições, etc)</Label>
          <div className="space-y-3">
            {/* Área de Upload */}
            <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
              <input
                type="file"
                accept="image/*,.pdf,.dwg"
                multiple
                className="hidden"
                id="upload-geral"
                onChange={(e) => handleFileUpload(e.target.files, 'geral')}
              />
              <label htmlFor="upload-geral" className="cursor-pointer">
                <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Clique para selecionar arquivos</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, PDF, DWG (máx. 15MB cada)</p>
              </label>
            </div>

            {/* Lista de arquivos carregados */}
            {data.arquivosGerais.length > 0 && (
              <div className="space-y-2">
                {data.arquivosGerais.map((arquivo, index) => (
                  <Card key={index} className="bg-green-50 border-green-200">
                    <CardContent className="pt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{arquivo.file.name}</p>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoverArquivo(index, 'geral')}
                          >
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                        <Textarea
                          rows={2}
                          value={arquivo.comment}
                          onChange={(e) => handleAtualizarComentario(index, e.target.value, 'geral')}
                          placeholder="Adicione um comentário sobre este arquivo..."
                          className="text-sm"
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
