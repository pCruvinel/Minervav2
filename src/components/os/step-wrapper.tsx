"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Check, Circle, Lock } from 'lucide-react';
import { cn } from '../ui/utils';

interface StepWrapperProps {
  stepNumber: string;
  title: string;
  responsible: string;
  status: 'completed' | 'active' | 'pending';
  children?: React.ReactNode;
}

const statusConfig = {
  completed: {
    icon: Check,
    iconColor: 'text-green-600',
    iconBg: 'bg-green-100',
    badge: { variant: 'default' as const, text: 'Concluído', className: 'bg-green-100 text-green-700' }
  },
  active: {
    icon: Circle,
    iconColor: 'text-primary',
    iconBg: 'bg-primary/10',
    badge: { variant: 'default' as const, text: 'Em Andamento', className: 'bg-primary/20 text-primary' }
  },
  pending: {
    icon: Lock,
    iconColor: 'text-neutral-400',
    iconBg: 'bg-neutral-100',
    badge: { variant: 'secondary' as const, text: 'Pendente', className: 'bg-neutral-200 text-neutral-600' }
  }
};

export function StepWrapper({ 
  stepNumber, 
  title, 
  responsible, 
  status, 
  children 
}: StepWrapperProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isDisabled = status === 'pending';

  return (
    <Card className={cn(
      "border-border rounded-lg shadow-sm transition-all",
      status === 'active' && "border-primary border-2",
      isDisabled && "opacity-60"
    )}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {/* Ícone de Status */}
            <div className={cn(
              "rounded-full p-2 mt-0.5",
              config.iconBg
            )}>
              <Icon className={cn("h-5 w-5", config.iconColor)} />
            </div>

            {/* Título e Informações */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <CardTitle className="text-lg">{title}</CardTitle>
                <Badge className={cn("font-medium", config.badge.className)}>
                  {config.badge.text}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Etapa {stepNumber}</span>
                <span>•</span>
                <span>Responsável: {responsible}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>

      {/* Conteúdo da Etapa */}
      {children && (
        <CardContent className={cn(
          "pt-0",
          isDisabled && "pointer-events-none"
        )}>
          {children}
        </CardContent>
      )}
    </Card>
  );
}
