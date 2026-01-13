'use client';

import { ReactNode, useState, useEffect } from 'react';
import { Check, Circle, Lock, Loader2, ArrowRight } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Definição de uma etapa do workflow
 */
export interface WorkflowStepDefinition {
    id: number;
    title: string;
    short?: string;
    responsible?: string;
}

interface WorkflowAccordionProps {
    /** Definição das etapas do workflow */
    steps: WorkflowStepDefinition[];
    /** Etapa atualmente ativa (onde o usuário está trabalhando) */
    currentStep: number;
    /** Dados de todas as etapas */
    formDataByStep: Record<number, unknown>;
    /** IDs das etapas concluídas (salvas no banco com status='concluida') */
    completedSteps: number[];
    /** Callback quando etapa mudar - NÃO usado para navegação histórica */
    onStepChange?: (step: number) => void;
    /** Função para renderizar o formulário editável da etapa atual */
    renderForm: (step: number) => ReactNode;
    /** Função para renderizar o resumo read-only de uma etapa concluída */
    renderSummary: (step: number, data: unknown) => ReactNode;
    /** Classes adicionais */
    className?: string;

    // 🆕 Props para botão interno de salvar
    /** Callback para salvar e avançar - retorna true se sucesso */
    onSaveAndAdvance?: (step: number) => Promise<boolean>;
    /** Texto do botão (default: "Salvar e Avançar") */
    saveButtonText?: string;
    /** Texto do botão final (default: "Concluir") */
    finalButtonText?: string;
    /** Estado de loading externo */
    isSaving?: boolean;
    /** Ocultar botão interno (para usar footer externo) */
    hideInternalButton?: boolean;
}

/**
 * Componente Accordion para visualização de workflow de OS
 * 
 * Características:
 * - Etapas concluídas: Expandíveis para visualização read-only (NÃO muda currentStep)
 * - Etapa atual: Sempre expandida com formulário editável + botão Salvar
 * - Etapas pendentes: Colapsadas e bloqueadas
 * - 🆕 Botão "Salvar e Avançar" interno para cada etapa
 * 
 * ✅ FIX: Clicar em etapa concluída apenas expande/colapsa, não muda currentStep
 * O currentStep só avança via botão "Salvar e Avançar"
 */
export function WorkflowAccordion({
    steps,
    currentStep,
    formDataByStep,
    completedSteps,
    onStepChange: _onStepChange, // Prefixado - não usado para navegação histórica
    renderForm,
    renderSummary,
    className,
    // 🆕 Novas props
    onSaveAndAdvance,
    saveButtonText = 'Salvar e Avançar',
    finalButtonText = 'Concluir',
    isSaving: externalIsSaving = false,
    hideInternalButton = false,
}: WorkflowAccordionProps) {
    // ✅ FIX: Estado local para controlar quais etapas estão expandidas
    // Etapa atual sempre começa expandida + etapas que o usuário expandir manualmente
    const [expandedSteps, setExpandedSteps] = useState<string[]>([`step-${currentStep}`]);
    const [internalIsSaving, setInternalIsSaving] = useState(false);

    const isSaving = externalIsSaving || internalIsSaving;

    // Quando currentStep muda (via Salvar e Continuar), garantir que a nova etapa seja expandida
    // e a anterior seja fechada
    useEffect(() => {
        setExpandedSteps([`step-${currentStep}`]);
    }, [currentStep]);

    // Handler para expandir/colapsar etapas
    // ✅ FIX: Não chama onStepChange - apenas controla expansão visual
    const handleValueChange = (values: string[]) => {
        // Garantir que a etapa atual nunca seja colapsada
        const currentStepValue = `step-${currentStep}`;
        if (!values.includes(currentStepValue)) {
            values = [...values, currentStepValue];
        }
        setExpandedSteps(values);
    };

    // 🆕 Handler para salvar e avançar
    const handleSaveAndAdvance = async (step: number) => {
        if (!onSaveAndAdvance) return;

        setInternalIsSaving(true);
        try {
            const success = await onSaveAndAdvance(step);
            if (success) {
                // Fechar etapa atual e abrir próxima (será feito pelo useEffect quando currentStep mudar)
            }
        } finally {
            setInternalIsSaving(false);
        }
    };

    const totalSteps = steps.length;

    return (
        <Accordion
            type="multiple"
            value={expandedSteps}
            onValueChange={handleValueChange}
            className={cn('space-y-2', className)}
        >
            {steps.map((step) => {
                const isCompleted = completedSteps.includes(step.id);
                const isCurrent = step.id === currentStep;
                const isAccessible = isCompleted || isCurrent;
                const isPending = !isCompleted && !isCurrent;
                const stepData = formDataByStep[step.id];
                const isLastStep = step.id === totalSteps;
                const showSaveButton = isCurrent && !isCompleted && onSaveAndAdvance && !hideInternalButton;

                return (
                    <AccordionItem
                        key={step.id}
                        value={`step-${step.id}`}
                        disabled={!isAccessible}
                        className={cn(
                            'border rounded-lg overflow-hidden transition-all',
                            // ✅ FIX: Cor baseada em isCompleted, não em isCurrent
                            isCompleted && !isCurrent && 'border-success/30 bg-success/5',
                            isCurrent && 'border-primary/30 bg-primary/5 ring-2 ring-primary/20',
                            isPending && 'border-border bg-muted/20 opacity-60'
                        )}
                    >
                        <AccordionTrigger
                            className={cn(
                                'px-4 py-3 hover:no-underline [&[data-state=open]>svg]:rotate-180',
                                !isAccessible && 'cursor-not-allowed'
                            )}
                            disabled={!isAccessible}
                        >
                            <div className="flex items-center gap-3 flex-1">
                                {/* Ícone de status */}
                                <div
                                    className={cn(
                                        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                                        // ✅ FIX: Ícone baseado em status real, não em currentStep
                                        isCompleted && 'bg-success/20',
                                        isCurrent && !isCompleted && 'bg-primary/20',
                                        isPending && 'bg-muted'
                                    )}
                                >
                                    {isCompleted ? (
                                        <Check className="h-4 w-4 text-success" />
                                    ) : isCurrent ? (
                                        <Circle className="h-4 w-4 text-primary fill-primary" />
                                    ) : (
                                        <Lock className="h-4 w-4 text-muted-foreground" />
                                    )}
                                </div>

                                {/* Título da etapa */}
                                <div className="flex flex-col items-start">
                                    <span
                                        className={cn(
                                            'font-medium',
                                            // ✅ FIX: Cor baseada em status real
                                            isCompleted && 'text-success',
                                            isCurrent && !isCompleted && 'text-primary',
                                            isPending && 'text-muted-foreground'
                                        )}
                                    >
                                        Etapa {step.id}: {step.title}
                                    </span>
                                    {step.responsible && (
                                        <span className="text-xs text-muted-foreground">
                                            Responsável: {step.responsible}
                                        </span>
                                    )}
                                </div>

                                {/* Badge de status - Concluída tem prioridade sobre Atual */}
                                {isCompleted ? (
                                    <Badge variant="outline" className="ml-auto mr-2 text-success border-success/30">
                                        ✓ Concluída
                                    </Badge>
                                ) : isCurrent ? (
                                    <Badge variant="default" className="ml-auto mr-2">
                                        Atual
                                    </Badge>
                                ) : null}
                            </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-4 pb-4">
                            {isCurrent && !isCompleted ? (
                                // Formulário editável para etapa atual NÃO concluída
                                <div className="pt-2 space-y-4">
                                    {renderForm(step.id)}

                                    {/* 🆕 Botão Salvar e Avançar interno */}
                                    {showSaveButton && (
                                        <div className="flex justify-end pt-4 border-t border-border/50">
                                            <Button
                                                onClick={() => handleSaveAndAdvance(step.id)}
                                                disabled={isSaving}
                                                className="gap-2"
                                            >
                                                {isSaving ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                        Salvando...
                                                    </>
                                                ) : isLastStep ? (
                                                    <>
                                                        {finalButtonText}
                                                        <Check className="h-4 w-4" />
                                                    </>
                                                ) : (
                                                    <>
                                                        {saveButtonText}
                                                        <ArrowRight className="h-4 w-4" />
                                                    </>
                                                )}
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            ) : isCompleted ? (
                                // Resumo read-only para etapas concluídas (mesmo se for currentStep)
                                <div className="pt-2">
                                    {stepData ? (
                                        renderSummary(step.id, stepData)
                                    ) : (
                                        <div className="text-center text-muted-foreground text-sm py-4">
                                            Dados da etapa não disponíveis
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Placeholder para etapas sem dados
                                <div className="pt-2 text-center text-muted-foreground text-sm py-4">
                                    Etapa pendente
                                </div>
                            )}
                        </AccordionContent>
                    </AccordionItem>
                );
            })}
        </Accordion>
    );
}

