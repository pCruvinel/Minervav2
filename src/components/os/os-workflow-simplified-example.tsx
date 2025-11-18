"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { ChevronLeft } from 'lucide-react';
import { WorkflowStepper, WorkflowStep } from './workflow-stepper';

/**
 * EXEMPLO DE USO DO WORKFLOW STEPPER
 * 
 * Este é um exemplo simplificado de como usar o componente WorkflowStepper
 * em um fluxo de OS diferente (ex: OS 05-06 com apenas 4 etapas).
 * 
 * Use este arquivo como referência para implementar outros fluxos.
 */

// Definição de um fluxo simplificado com apenas 4 etapas
const stepsSimplified: WorkflowStep[] = [
  { id: 1, title: 'Identificação do Cliente', short: 'Cliente', responsible: 'ADM' },
  { id: 2, title: 'Definir Escopo da Obra', short: 'Escopo', responsible: 'Obras' },
  { id: 3, title: 'Criar Proposta Comercial', short: 'Proposta', responsible: 'ADM' },
  { id: 4, title: 'Iniciar Contrato de Obra', short: 'Início', responsible: 'Sistema' },
];

interface OSWorkflowSimplifiedExampleProps {
  onBack?: () => void;
}

export function OSWorkflowSimplifiedExample({ onBack }: OSWorkflowSimplifiedExampleProps = {}) {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Estados de exemplo para cada etapa
  const [etapa1Data, setEtapa1Data] = useState({ clienteNome: '', clienteCPF: '' });
  const [etapa2Data, setEtapa2Data] = useState({ escopo: '' });
  const [etapa3Data, setEtapa3Data] = useState({ valorProposta: '' });

  const handleStepClick = (stepId: number) => {
    // Permite navegar apenas para etapas até a atual
    if (stepId <= currentStep) {
      setCurrentStep(stepId);
    }
  };

  const handleNextStep = () => {
    if (currentStep < stepsSimplified.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-neutral-50">
      {/* Botão Voltar (opcional) */}
      {onBack && (
        <div className="border-b border-neutral-200 px-6 py-3 bg-white">
          <Button variant="ghost" onClick={onBack} className="gap-2">
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
        </div>
      )}
      
      {/* 🎯 WORKFLOW STEPPER - Componente Reutilizável */}
      <WorkflowStepper 
        steps={stepsSimplified}
        currentStep={currentStep}
        onStepClick={handleStepClick}
        completedSteps={[]} // Exemplo: sem etapas concluídas
      />

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full p-6">
          <Card className="h-full flex flex-col">
            <CardHeader className="flex-shrink-0">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>{stepsSimplified[currentStep - 1].title}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Responsável: {stepsSimplified[currentStep - 1].responsible}
                  </p>
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  Etapa {currentStep} de {stepsSimplified.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 flex-1 overflow-y-auto">
              
              {/* ETAPA 1: Identificação do Cliente */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clienteNome">Nome do Cliente</Label>
                    <Input
                      id="clienteNome"
                      value={etapa1Data.clienteNome}
                      onChange={(e) => setEtapa1Data({ ...etapa1Data, clienteNome: e.target.value })}
                      placeholder="Digite o nome do cliente"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="clienteCPF">CPF/CNPJ</Label>
                    <Input
                      id="clienteCPF"
                      value={etapa1Data.clienteCPF}
                      onChange={(e) => setEtapa1Data({ ...etapa1Data, clienteCPF: e.target.value })}
                      placeholder="000.000.000-00"
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 2: Definir Escopo */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="escopo">Descrição do Escopo</Label>
                    <Input
                      id="escopo"
                      value={etapa2Data.escopo}
                      onChange={(e) => setEtapa2Data({ ...etapa2Data, escopo: e.target.value })}
                      placeholder="Descreva o escopo da obra"
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 3: Criar Proposta */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="valorProposta">Valor da Proposta</Label>
                    <Input
                      id="valorProposta"
                      value={etapa3Data.valorProposta}
                      onChange={(e) => setEtapa3Data({ ...etapa3Data, valorProposta: e.target.value })}
                      placeholder="R$ 0,00"
                    />
                  </div>
                </div>
              )}

              {/* ETAPA 4: Iniciar Obra */}
              {currentStep === 4 && (
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm">
                      ✅ Todas as etapas foram concluídas! O contrato de obra será iniciado automaticamente.
                    </p>
                  </div>
                </div>
              )}

            </CardContent>

            {/* Footer com botões de navegação */}
            <div className="flex-shrink-0 border-t px-6 py-4 flex justify-between">
              <Button 
                variant="outline" 
                onClick={handlePrevStep}
                disabled={currentStep === 1}
              >
                Voltar
              </Button>
              <Button 
                onClick={handleNextStep}
                disabled={currentStep === stepsSimplified.length}
              >
                Próxima Etapa
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
