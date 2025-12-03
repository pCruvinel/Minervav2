import React, { forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Plus, Trash2, X, AlertCircle } from 'lucide-react';
import { FormTextarea } from '@/components/ui/form-textarea';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { etapa7Schema } from '@/lib/validations/os-etapas-schema';

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
    objetivo?: string;
    etapasPrincipais?: EtapaPrincipal[];
    planejamentoInicial?: string;
    logisticaTransporte?: string;
    preparacaoArea?: string;

    // Legacy assessoria fields (backward compatibility)
    descricaoServico?: string;
    escopo?: string;
    prazoEstimado?: string;
    observacoes?: string;
    _legacy?: any;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export interface StepMemorialEscopoHandle {
  validate: () => boolean;
  isFormValid: () => boolean;
}

export const StepMemorialEscopo = forwardRef<StepMemorialEscopoHandle, StepMemorialEscopoProps>(
  function StepMemorialEscopo({ data, onDataChange, readOnly = false }, ref) {
    // Normalizar dados legados de assessoria
    const normalizeData = (inputData: any) => {
      if (inputData.descricaoServico && !inputData.objetivo) {
        return {
          objetivo: inputData.descricaoServico,
          etapasPrincipais: [],
          planejamentoInicial: '',
          logisticaTransporte: '',
          preparacaoArea: '',
          _legacy: {
            escopo: inputData.escopo,
            prazoEstimado: inputData.prazoEstimado,
            observacoes: inputData.observacoes,
          }
        };
      }
      return inputData;
    };

    const normalizedData = normalizeData(data);

    // Garantir que todos os campos tenham valores padrão (controlled components)
    const safeData = {
      objetivo: '',
      planejamentoInicial: '',
      logisticaTransporte: '',
      preparacaoArea: '',
      etapasPrincipais: [],
      ...normalizedData, // Override com dados normalizados se existirem
    };
    // Hook de validação
    const {
      errors,
      touched,
      validateField,
      markFieldTouched,
      markAllTouched,
      validateAll,
    } = useFieldValidation(etapa7Schema);

    /**
     * Expõe métodos de validação via ref
     * Validação flexível: mínimo = objetivo preenchido
     */
    useImperativeHandle(ref, () => ({
      validate: () => {
        markAllTouched();

        // Validação mínima: objetivo preenchido (min 10 chars)
        if (!safeData.objetivo || safeData.objetivo.length < 10) {
          const element = document.getElementById('objetivo');
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
          return false;
        }

        // Se usuário adicionou etapas, validar estrutura completa
        if (safeData.etapasPrincipais.length > 0) {
          return validateAll(safeData);
        }

        return true;
      },
      isFormValid: () => {
        if (!safeData.objetivo || safeData.objetivo.length < 10) {
          return false;
        }

        if (safeData.etapasPrincipais.length > 0) {
          return validateAll(safeData);
        }

        return true;
      }
    }), [markAllTouched, validateAll, safeData]);

    const handleAdicionarEtapaPrincipal = () => {
      const novaEtapa: EtapaPrincipal = {
        nome: '',
        subetapas: [],
      };
      onDataChange({
        ...safeData,
        etapasPrincipais: [...safeData.etapasPrincipais, novaEtapa],
      });
    };

    const handleRemoverEtapaPrincipal = (index: number) => {
      const novasEtapas = safeData.etapasPrincipais.filter((_, i) => i !== index);
      onDataChange({ ...safeData, etapasPrincipais: novasEtapas });
    };

    const handleAtualizarNomeEtapa = (index: number, nome: string) => {
      const novasEtapas = [...safeData.etapasPrincipais];
      novasEtapas[index] = { ...novasEtapas[index], nome };
      onDataChange({ ...safeData, etapasPrincipais: novasEtapas });
    };

    const handleAdicionarSubetapa = (etapaIndex: number) => {
      const novasEtapas = [...safeData.etapasPrincipais];
      const novaSubetapa: SubEtapa = {
        nome: '',
        m2: '',
        diasUteis: '',
        total: '',
      };
      novasEtapas[etapaIndex].subetapas.push(novaSubetapa);
      onDataChange({ ...safeData, etapasPrincipais: novasEtapas });
    };

    const handleRemoverSubetapa = (etapaIndex: number, subIndex: number) => {
      const novasEtapas = [...safeData.etapasPrincipais];
      novasEtapas[etapaIndex].subetapas = novasEtapas[etapaIndex].subetapas.filter((_, i) => i !== subIndex);
      onDataChange({ ...safeData, etapasPrincipais: novasEtapas });
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
      return safeData.etapasPrincipais.reduce((total, etapa) => {
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
        <FormTextarea
          id="objetivo"
          label="1. Qual o objetivo da contratação do serviço?"
          required
          rows={3}
          maxLength={500}
          showCharCount
          value={safeData.objetivo}
          onChange={(e) => {
            if (!readOnly) {
              onDataChange({ ...safeData, objetivo: e.target.value });
              if (touched.objetivo) validateField('objetivo', e.target.value);
            }
          }}
          onBlur={() => {
            if (!readOnly) {
              markFieldTouched('objetivo');
              validateField('objetivo', safeData.objetivo);
            }
          }}
          error={touched.objetivo ? errors.objetivo : undefined}
          success={touched.objetivo && !errors.objetivo && safeData.objetivo.length >= 10}
          helperText="Mínimo 10 caracteres - Descreva o objetivo principal do serviço"
          placeholder="Descreva o objetivo principal do serviço a ser executado..."
          disabled={readOnly}
        />

        <Separator />

        {/* 2. Etapas da Especificação Técnica */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-base">
              2. Etapas da Especificação Técnica <span className="text-muted-foreground">(Opcional)</span>
            </Label>
            <PrimaryButton
              variant="secondary"
              onClick={handleAdicionarEtapaPrincipal}
              disabled={readOnly}
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Etapa Principal
            </PrimaryButton>
          </div>

          {safeData.etapasPrincipais.length === 0 && (
            <Card className="bg-background border-dashed">
              <CardContent className="pt-6 text-center text-sm text-muted-foreground">
                <p>Nenhuma etapa adicionada.</p>
                <p className="mt-1">Clique em "Adicionar Etapa Principal" para começar.</p>
              </CardContent>
            </Card>
          )}

          {safeData.etapasPrincipais.map((etapa, etapaIndex) => (
            <Card key={etapaIndex} className="border-primary/20">
              <CardHeader className="bg-primary/5">
                <div className="flex items-center gap-3">
                  <Input
                    value={etapa.nome}
                    onChange={(e) => !readOnly && handleAtualizarNomeEtapa(etapaIndex, e.target.value)}
                    placeholder={`Ex: ${etapaIndex + 1}. Tratamento de Fachada`}
                    className="flex-1"
                    disabled={readOnly}
                  />
                  <PrimaryButton
                    variant="secondary"
                    onClick={() => handleAdicionarSubetapa(etapaIndex)}
                    disabled={readOnly}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Sub-etapa
                  </PrimaryButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoverEtapaPrincipal(etapaIndex)}
                    disabled={readOnly}
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
                            onChange={(e) => !readOnly && handleAtualizarSubetapa(etapaIndex, subIndex, 'nome', e.target.value)}
                            placeholder="Descrição da sub-etapa"
                            disabled={readOnly}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={sub.m2}
                            onChange={(e) => !readOnly && handleAtualizarSubetapa(etapaIndex, subIndex, 'm2', e.target.value)}
                            placeholder="0"
                            disabled={readOnly}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            value={sub.diasUteis}
                            onChange={(e) => !readOnly && handleAtualizarSubetapa(etapaIndex, subIndex, 'diasUteis', e.target.value)}
                            placeholder="0"
                            disabled={readOnly}
                          />
                        </div>
                        <div className="col-span-2">
                          <Input
                            type="number"
                            step="0.01"
                            value={sub.total}
                            onChange={(e) => !readOnly && handleAtualizarSubetapa(etapaIndex, subIndex, 'total', e.target.value)}
                            placeholder="0,00"
                            disabled={readOnly}
                          />
                        </div>
                        <div className="col-span-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoverSubetapa(etapaIndex, subIndex)}
                            disabled={readOnly}
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
            3. Prazo (Dias Úteis) <span className="text-muted-foreground">(Opcional)</span>
          </Label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Planejamento inicial */}
            <div className="space-y-2">
              <Label htmlFor="planejamentoInicial">
                Planejamento inicial
              </Label>
              <Input
                id="planejamentoInicial"
                type="number"
                value={safeData.planejamentoInicial}
                onChange={(e) => {
                  if (!readOnly) {
                    onDataChange({ ...safeData, planejamentoInicial: e.target.value });
                    if (touched.planejamentoInicial) validateField('planejamentoInicial', e.target.value);
                  }
                }}
                onBlur={() => {
                  if (!readOnly) {
                    markFieldTouched('planejamentoInicial');
                    validateField('planejamentoInicial', safeData.planejamentoInicial);
                  }
                }}
                className={touched.planejamentoInicial && errors.planejamentoInicial ? 'border-destructive' : ''}
                placeholder="0"
                disabled={readOnly}
              />
              <p className="text-xs text-muted-foreground">
                Dias úteis para planejamento e mobilização
              </p>
              {touched.planejamentoInicial && errors.planejamentoInicial && (
                <p className="text-xs text-destructive">❌ {errors.planejamentoInicial}</p>
              )}
            </div>

            {/* Logística e transporte */}
            <div className="space-y-2">
              <Label htmlFor="logisticaTransporte">
                Logística e transporte de materiais
              </Label>
              <Input
                id="logisticaTransporte"
                type="number"
                value={safeData.logisticaTransporte}
                onChange={(e) => {
                  if (!readOnly) {
                    onDataChange({ ...safeData, logisticaTransporte: e.target.value });
                    if (touched.logisticaTransporte) validateField('logisticaTransporte', e.target.value);
                  }
                }}
                onBlur={() => {
                  if (!readOnly) {
                    markFieldTouched('logisticaTransporte');
                    validateField('logisticaTransporte', safeData.logisticaTransporte);
                  }
                }}
                className={touched.logisticaTransporte && errors.logisticaTransporte ? 'border-destructive' : ''}
                placeholder="0"
                disabled={readOnly}
              />
              <p className="text-xs text-muted-foreground">
                Dias úteis para transporte e logística
              </p>
              {touched.logisticaTransporte && errors.logisticaTransporte && (
                <p className="text-xs text-destructive">❌ {errors.logisticaTransporte}</p>
              )}
            </div>

            {/* Preparação de área */}
            <div className="space-y-2">
              <Label htmlFor="preparacaoArea">
                Preparação de área de trabalho
              </Label>
              <Input
                id="preparacaoArea"
                type="number"
                value={safeData.preparacaoArea}
                onChange={(e) => {
                  if (!readOnly) {
                    onDataChange({ ...safeData, preparacaoArea: e.target.value });
                    if (touched.preparacaoArea) validateField('preparacaoArea', e.target.value);
                  }
                }}
                onBlur={() => {
                  if (!readOnly) {
                    markFieldTouched('preparacaoArea');
                    validateField('preparacaoArea', safeData.preparacaoArea);
                  }
                }}
                className={touched.preparacaoArea && errors.preparacaoArea ? 'border-destructive' : ''}
                placeholder="0"
                disabled={readOnly}
              />
              <p className="text-xs text-muted-foreground">
                Dias úteis para montagem de estruturas e preparação
              </p>
              {touched.preparacaoArea && errors.preparacaoArea && (
                <p className="text-xs text-destructive">❌ {errors.preparacaoArea}</p>
              )}
            </div>

            {/* Execução de obra (calculado) */}
            <div className="space-y-2">
              <Label htmlFor="execucaoObra">Execução de obra (calculado automaticamente)</Label>
              <Input
                id="execucaoObra"
                type="number"
                value={calcularExecucaoTotal()}
                disabled
                className="bg-muted"
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
                  <span>{safeData.planejamentoInicial || 0} dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Logística:</span>
                  <span>{safeData.logisticaTransporte || 0} dias</span>
                </div>
                <div className="flex justify-between">
                  <span>Preparação:</span>
                  <span>{safeData.preparacaoArea || 0} dias</span>
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
  });