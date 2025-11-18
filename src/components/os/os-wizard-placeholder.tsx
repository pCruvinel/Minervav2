import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { AlertCircle, ArrowLeft } from 'lucide-react';

interface OSWizardPlaceholderProps {
  title: string;
  description: string;
  onBack: () => void;
}

export function OSWizardPlaceholder({ title, description, onBack }: OSWizardPlaceholderProps) {
  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-[800px] mx-auto space-y-6">
        {/* Botão Voltar */}
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Voltar
        </Button>

        {/* Card de Placeholder */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <AlertCircle className="h-6 w-6" />
              </div>
              <CardTitle>{title}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{description}</p>
            <div className="bg-neutral-100 p-4 rounded-lg space-y-2">
              <p className="text-sm">
                <strong>Este wizard será implementado em breve e incluirá:</strong>
              </p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-4">
                <li>• Passo 1: Identificação do Cliente/Lead</li>
                <li>• Passo 2: Detalhes da Solicitação</li>
                <li>• Criação automática da OS</li>
                <li>• Redirecionamento para o fluxo de trabalho</li>
              </ul>
            </div>
            <Button onClick={onBack} className="w-full">
              Voltar ao Hub de Criação
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
