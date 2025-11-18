import React from 'react';
import { Button } from '../../../ui/button';
import { PrimaryButton } from '../../../ui/primary-button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { CheckCircle } from 'lucide-react';

interface StepAtivarContratoAssessoriaProps {
  tipoOS: 'OS-05' | 'OS-06';
  onAtivarContrato: () => void;
}

export function StepAtivarContratoAssessoria({ tipoOS, onAtivarContrato }: StepAtivarContratoAssessoriaProps) {
  return (
    <div className="space-y-6">
      <Alert className="bg-primary/10 border-primary/20">
        <CheckCircle className="h-4 w-4 text-primary" />
        <AlertDescription className="text-primary">
          Todas as etapas anteriores foram concluídas com sucesso! 
          Clique no botão abaixo para ativar o contrato e criar a {tipoOS === 'OS-05' ? 'OS 12 (Execução de Assessoria)' : 'OS 11 (Execução de Laudo)'}.
        </AlertDescription>
      </Alert>

      <div className="flex flex-col items-center justify-center py-12 gap-6 border-2 border-dashed border-primary/30 rounded-lg bg-primary/5">
        <div className="text-center">
          <CheckCircle className="h-20 w-20 text-primary mx-auto mb-4" />
          <h3 className="text-xl mb-2">Pronto para Ativação</h3>
          <p className="text-sm text-muted-foreground">
            O contrato está pronto para ser ativado no sistema
          </p>
        </div>

        <PrimaryButton
          size="lg"
          onClick={onAtivarContrato}
        >
          <CheckCircle className="w-5 h-5 mr-2" />
          Ativar Contrato
        </PrimaryButton>

        <p className="text-xs text-muted-foreground text-center max-w-md">
          Ao ativar, uma nova {tipoOS === 'OS-05' ? 'OS 12' : 'OS 11'} será criada automaticamente para a execução do contrato.
        </p>
      </div>
    </div>
  );
}