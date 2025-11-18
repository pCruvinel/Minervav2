import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../ui/card';
import { Button } from '../../../ui/button';
import { PrimaryButton } from '../../../ui/primary-button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Separator } from '../../../ui/separator';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';

interface SubEtapa {
  nome: string;
  m2: string;
  diasUteis: string;
  total: string;
}

interface EtapaPrincipal {
  nome: string;
  subetapas: SubEtapa[];
}

interface StepMemorialEscopoProps {
  data: {
    objetivo: string;
    etapasPrincipais: EtapaPrincipal[];
    planejamentoInicial: string;
    logisticaTransporte: string;
    preparacaoArea: string;
  };
  onDataChange: (data: any) => void;
}

export function StepMemorialEscopo({
  data,
  onDataChange,
}: StepMemorialEscopoProps) {
  const handleAdicionarEtapaPrincipal = () => {
    const novaEtapa: EtapaPrincipal = {
      nome: '',
      subetapas: [],
    };
    onDataChange({
      ...data,
      etapasPrincipais: [...data.etapasPrincipais, novaEtapa],
    });
  };

  const handleRemoverEtapaPrincipal = (index: number) => {
    const novasEtapas = data.etapasPrincipais.filter((_, i) => i !== index);
    onDataChange({ ...data, etapasPrincipais: novasEtapas });
  };

  const handleAtualizarNomeEtapa = (index: number, nome: string) => {
    const novasEtapas = [...data.etapasPrincipais];
    novasEtapas[index] = { ...novasEtapas[index], nome };
    onDataChange({ ...data, etapasPrincipais: novasEtapas });
  };

  const handleAdicionarSubetapa = (etapaIndex: number) => {
    const novasEtapas = [...data.etapasPrincipais];
    const novaSubetapa: SubEtapa = {
      nome: '',
      m2: '',
      diasUteis: '',
      total: '',
    };
    novasEtapas[etapaIndex].subetapas.push(novaSubetapa);
    onDataChange({ ...data, etapasPrincipais: novasEtapas });
  };

  const handleRemoverSubetapa = (etapaIndex: number, subIndex: number) => {
    const novasEtapas = [...data.etapasPrincipais];
    novasEtapas[etapaIndex].subetapas = novasEtapas[etapaIndex].subetapas.filter((_, i) => i !== subIndex);
    onDataChange({ ...data, etapasPrincipais: novasEtapas });
  };

  const handleAtualizarSubetapa = (etapaIndex: number, subIndex: number, field: keyof SubEtapa, value: string) => {
    const novasEtapas = [...data.etapasPrincipais];
    novasEtapas[etapaIndex].subetapas[subIndex] = {
      ...novasEtapas[etapaIndex].subetapas[subIndex],
      [field]: value,
    };
    onDataChange({ ...data, etapasPrincipais: novasEtapas });
  };

  const calcularExecucaoTotal = (): number => {
    return data.etapasPrincipais.reduce((total, etapa) => {
      return total + etapa.subetapas.reduce((subtotal, sub) => {
        return subtotal + (parseFloat(sub.diasUteis) || 0);
      }, 0);
    }, 0);
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Digitalize o escopo técnico e prazos do memorial. Adicione etapas principais e suas respectivas sub-etapas com quantificação (m², dias úteis, valores).
        </AlertDescription>
      </Alert>

      {/* 1. Objetivo */}
      <div className="space-y-2">
        <Label htmlFor="objetivo">
          1. Qual o objetivo da contratação do serviço? <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="objetivo"
          rows={3}
          value={data.objetivo}
          onChange={(e) => onDataChange({ ...data, objetivo: e.target.value })}
          placeholder="Descreva o objetivo principal do serviço a ser executado..."
        />
      </div>

      <Separator />

      {/* 2. Etapas da Especificação Técnica */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base">
            2. Etapas da Especificação Técnica <span className="text-destructive">*</span>
          </Label>
          <PrimaryButton
            variant="secondary"
            onClick={handleAdicionarEtapaPrincipal}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Etapa Principal
          </PrimaryButton>
        </div>

        {data.etapasPrincipais.length === 0 && (
          <Card className="bg-neutral-50 border-dashed">
            <CardContent className="pt-6 text-center text-sm text-muted-foreground">
              <p>Nenhuma etapa adicionada.</p>
              <p className="mt-1">Clique em "Adicionar Etapa Principal" para começar.</p>
            </CardContent>
          </Card>
        )}

        {data.etapasPrincipais.map((etapa, etapaIndex) => (
          <Card key={etapaIndex} className="border-primary/20">
            <CardHeader className="bg-primary/5">
              <div className="flex items-center gap-3">
                <Input
                  value={etapa.nome}
                  onChange={(e) => handleAtualizarNomeEtapa(etapaIndex, e.target.value)}
                  placeholder={`Ex: ${etapaIndex + 1}. Tratamento de Fachada`}
                  className="flex-1"
                />
                <PrimaryButton
                  variant="secondary"
                  onClick={() => handleAdicionarSubetapa(etapaIndex)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Sub-etapa
                </PrimaryButton>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoverEtapaPrincipal(etapaIndex)}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              {etapa.subetapas.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Nenhuma sub-etapa. Clique em "Sub-etapa" para adicionar.
                </p>
              ) : (
                <div className="space-y-3">
                  {/* Cabeçalho da tabela */}
                  <div className="grid grid-cols-12 gap-2 text-xs font-medium text-muted-foreground">
                    <div className="col-span-5">Sub-etapa</div>
                    <div className="col-span-2">m²</div>
                    <div className="col-span-2">Dias úteis</div>
                    <div className="col-span-2">Total R$</div>
                    <div className="col-span-1"></div>
                  </div>
                  
                  {/* Linhas de sub-etapas */}
                  {etapa.subetapas.map((sub, subIndex) => (
                    <div key={subIndex} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <Input
                          value={sub.nome}
                          onChange={(e) => handleAtualizarSubetapa(etapaIndex, subIndex, 'nome', e.target.value)}
                          placeholder="Descrição da sub-etapa"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={sub.m2}
                          onChange={(e) => handleAtualizarSubetapa(etapaIndex, subIndex, 'm2', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          value={sub.diasUteis}
                          onChange={(e) => handleAtualizarSubetapa(etapaIndex, subIndex, 'diasUteis', e.target.value)}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          type="number"
                          step="0.01"
                          value={sub.total}
                          onChange={(e) => handleAtualizarSubetapa(etapaIndex, subIndex, 'total', e.target.value)}
                          placeholder="0,00"
                        />
                      </div>
                      <div className="col-span-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverSubetapa(etapaIndex, subIndex)}
                        >
                          <X className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      {/* 3. Prazo (Dias Úteis) */}
      <div className="space-y-4">
        <Label className="text-base">
          3. Prazo (Dias Úteis) <span className="text-destructive">*</span>
        </Label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Planejamento inicial */}
          <div className="space-y-2">
            <Label htmlFor="planejamentoInicial">
              Planejamento inicial <span className="text-destructive">*</span>
            </Label>
            <Input
              id="planejamentoInicial"
              type="number"
              value={data.planejamentoInicial}
              onChange={(e) => onDataChange({ ...data, planejamentoInicial: e.target.value })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Dias úteis para planejamento e mobilização
            </p>
          </div>

          {/* Logística e transporte */}
          <div className="space-y-2">
            <Label htmlFor="logisticaTransporte">
              Logística e transporte de materiais <span className="text-destructive">*</span>
            </Label>
            <Input
              id="logisticaTransporte"
              type="number"
              value={data.logisticaTransporte}
              onChange={(e) => onDataChange({ ...data, logisticaTransporte: e.target.value })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Dias úteis para transporte e logística
            </p>
          </div>

          {/* Preparação de área */}
          <div className="space-y-2">
            <Label htmlFor="preparacaoArea">
              Preparação de área de trabalho <span className="text-destructive">*</span>
            </Label>
            <Input
              id="preparacaoArea"
              type="number"
              value={data.preparacaoArea}
              onChange={(e) => onDataChange({ ...data, preparacaoArea: e.target.value })}
              placeholder="0"
            />
            <p className="text-xs text-muted-foreground">
              Dias úteis para montagem de estruturas e preparação
            </p>
          </div>

          {/* Execução de obra (calculado) */}
          <div className="space-y-2">
            <Label htmlFor="execucaoObra">Execução de obra (calculado automaticamente)</Label>
            <Input
              id="execucaoObra"
              type="number"
              value={calcularExecucaoTotal()}
              disabled
              className="bg-neutral-100"
            />
            <p className="text-xs text-muted-foreground">
              Soma automática dos dias úteis de todas as sub-etapas
            </p>
          </div>
        </div>

        {/* Resumo do Prazo Total */}
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Prazo Total do Projeto:</span>
              <span className="text-lg font-medium">
                {(
                  (parseFloat(data.planejamentoInicial) || 0) +
                  (parseFloat(data.logisticaTransporte) || 0) +
                  (parseFloat(data.preparacaoArea) || 0) +
                  calcularExecucaoTotal()
                ).toFixed(0)}{' '}
                dias úteis
              </span>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              <div className="flex justify-between">
                <span>Planejamento:</span>
                <span>{data.planejamentoInicial || 0} dias</span>
              </div>
              <div className="flex justify-between">
                <span>Logística:</span>
                <span>{data.logisticaTransporte || 0} dias</span>
              </div>
              <div className="flex justify-between">
                <span>Preparação:</span>
                <span>{data.preparacaoArea || 0} dias</span>
              </div>
              <div className="flex justify-between">
                <span>Execução:</span>
                <span>{calcularExecucaoTotal().toFixed(0)} dias</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}