/**
 * EXEMPLO DE USO DO COMPONENTE StepLayout
 *
 * Este arquivo demonstra como usar o StepLayout e StepSection
 * para criar novos steps de formulário padronizados.
 */

import React from 'react';
import { StepLayout, StepSection } from './step-layout';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

interface ExampleStepProps {
  data: {
    campo1: string;
    campo2: string;
  };
  onDataChange: (data: any) => void;
  onNext?: () => void;
  onBack?: () => void;
  readOnly?: boolean;
}

/**
 * Exemplo 1: Step Simples
 * Um step básico com apenas uma seção e botões de navegação
 */
export function ExampleStepSimple({ data, onDataChange, onNext, onBack, readOnly }: ExampleStepProps) {
  const handleInputChange = (field: string, value: any) => {
    if (readOnly) return;
    onDataChange({ ...data, [field]: value });
  };

  return (
    <StepLayout
      title="Título do Step"
      description="Descrição breve explicando o objetivo deste step"
      footerActions={
        <>
          <Button variant="outline" onClick={onBack} disabled={readOnly}>
            Voltar
          </Button>
          <Button onClick={onNext} disabled={readOnly}>
            Próximo
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campo1">
            Campo 1 <span className="text-red-500">*</span>
          </Label>
          <Input
            id="campo1"
            value={data.campo1}
            onChange={(e) => handleInputChange('campo1', e.target.value)}
            placeholder="Digite o valor"
            disabled={readOnly}
          />
        </div>
      </div>
    </StepLayout>
  );
}

/**
 * Exemplo 2: Step com Múltiplas Seções
 * Um step mais complexo com várias seções organizadas
 */
export function ExampleStepMultipleSections({ data, onDataChange, onNext, onBack, readOnly }: ExampleStepProps) {
  const handleInputChange = (field: string, value: any) => {
    if (readOnly) return;
    onDataChange({ ...data, [field]: value });
  };

  return (
    <StepLayout
      title="Step com Múltiplas Seções"
      description="Exemplo de como organizar formulários complexos em seções"
      footerActions={
        <>
          <Button variant="outline" onClick={onBack} disabled={readOnly}>
            Voltar
          </Button>
          <Button onClick={onNext} disabled={readOnly}>
            Próximo
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        {/* Seção 1 */}
        <StepSection title="Dados Pessoais">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="campo1">
                Campo 1 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="campo1"
                value={data.campo1}
                onChange={(e) => handleInputChange('campo1', e.target.value)}
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="campo2">
                Campo 2 <span className="text-red-500">*</span>
              </Label>
              <Input
                id="campo2"
                value={data.campo2}
                onChange={(e) => handleInputChange('campo2', e.target.value)}
                disabled={readOnly}
              />
            </div>
          </div>
        </StepSection>

        {/* Seção 2 */}
        <StepSection title="Informações Adicionais">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="outro-campo">Outro Campo</Label>
              <Input
                id="outro-campo"
                placeholder="Informação adicional"
                disabled={readOnly}
              />
            </div>
          </div>
        </StepSection>
      </div>
    </StepLayout>
  );
}

/**
 * Exemplo 3: Step Sem Footer (Auto-save)
 * Step que não precisa de botões de navegação (ex: auto-save)
 */
export function ExampleStepAutoSave({ data, onDataChange, readOnly }: ExampleStepProps) {
  const handleInputChange = (field: string, value: any) => {
    if (readOnly) return;
    onDataChange({ ...data, [field]: value });
  };

  return (
    <StepLayout
      title="Step com Auto-save"
      description="Este step salva automaticamente sem precisar de botões"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campo-autosave">Campo</Label>
          <Input
            id="campo-autosave"
            value={data.campo1}
            onChange={(e) => handleInputChange('campo1', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>
    </StepLayout>
  );
}

/**
 * Exemplo 4: Step com Footer Customizado
 * Demonstra como usar footerActions de forma customizada
 */
export function ExampleStepCustomFooter({ data, onDataChange, onNext, readOnly }: ExampleStepProps) {
  const handleInputChange = (field: string, value: any) => {
    if (readOnly) return;
    onDataChange({ ...data, [field]: value });
  };

  const handleSaveAndNext = () => {
    // Lógica customizada antes de avançar
    console.log('Salvando dados...', data);
    onNext?.();
  };

  return (
    <StepLayout
      title="Step com Footer Customizado"
      description="Exemplo de footer com ações customizadas"
      footerActions={
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:justify-end">
          <Button variant="outline" disabled={readOnly}>
            Salvar Rascunho
          </Button>
          <Button onClick={handleSaveAndNext} disabled={readOnly}>
            Salvar e Continuar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="campo">Campo</Label>
          <Input
            id="campo"
            value={data.campo1}
            onChange={(e) => handleInputChange('campo1', e.target.value)}
            disabled={readOnly}
          />
        </div>
      </div>
    </StepLayout>
  );
}
