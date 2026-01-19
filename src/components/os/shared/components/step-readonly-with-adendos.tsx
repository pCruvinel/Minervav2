'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { Plus, User, Calendar, MessageSquarePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useEtapaAdendos, EtapaAdendo } from '@/lib/hooks/use-etapa-adendos';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

/**
 * Formatar data e hora no padrão brasileiro
 */
function formatDateTime(dateString: string): string {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    } catch {
        return dateString;
    }
}

interface AdendosSectionProps {
    /** Adendos já carregados (hook) */
    adendos: EtapaAdendo[];
    /** Handler para adicionar adendo */
    onAddAdendo: (campoKey: string, conteudo: string) => Promise<EtapaAdendo | null>;
    /** Mostrar botão de adicionar? */
    canAddAdendo?: boolean;
    /** Classes CSS adicionais */
    className?: string;
}

/**
 * Seção de adendos para uma etapa
 * 
 * Mostra todos os adendos da etapa e permite adicionar novos.
 */
function AdendosSection({
    adendos,
    onAddAdendo,
    canAddAdendo = true,
    className,
}: AdendosSectionProps) {
    const [isAddingAdendo, setIsAddingAdendo] = useState(false);
    const [novoAdendo, setNovoAdendo] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [isOpen, setIsOpen] = useState(adendos.length > 0);

    const handleSaveAdendo = async () => {
        if (!novoAdendo.trim()) return;

        setIsSaving(true);
        try {
            // Usar 'geral' como campo de referência para adendos de etapa
            const result = await onAddAdendo('geral', novoAdendo.trim());
            if (result) {
                setNovoAdendo('');
                setIsAddingAdendo(false);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setIsAddingAdendo(false);
        setNovoAdendo('');
    };

    // Se não há adendos e não pode adicionar, não mostrar nada
    if (adendos.length === 0 && !canAddAdendo) {
        return null;
    }

    return (
        <div className={cn('', className)}>
            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between py-2 px-3 hover:bg-muted/50"
                    >
                        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                            <MessageSquarePlus className="h-4 w-4" />
                            Adendos
                            {adendos.length > 0 && (
                                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                    {adendos.length}
                                </span>
                            )}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {isOpen ? '▲' : '▼'}
                        </span>
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="pt-2">
                    <div className="space-y-3 pl-4 border-l-2 border-muted-foreground/20">
                        {/* Lista de Adendos Existentes */}
                        {adendos.map(adendo => (
                            <div
                                key={adendo.id}
                                className="bg-muted/20 rounded-lg p-3"
                            >
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                    {adendo.conteudo}
                                </p>
                                <div className="flex justify-end gap-3 mt-2 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {adendo.criado_por_nome}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDateTime(adendo.criado_em)}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {/* Botão para Adicionar */}
                        {canAddAdendo && !isAddingAdendo && (
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => setIsAddingAdendo(true)}
                            >
                                <Plus className="h-4 w-4" />
                                Adicionar Adendo
                            </Button>
                        )}

                        {/* Formulário de Novo Adendo */}
                        {isAddingAdendo && (
                            <div className="space-y-2 bg-muted/10 rounded-lg p-3 border border-dashed border-primary/30">
                                <Label className="text-sm font-medium">Novo Adendo</Label>
                                <Textarea
                                    placeholder="Digite o complemento à informação da etapa..."
                                    value={novoAdendo}
                                    onChange={(e) => setNovoAdendo(e.target.value)}
                                    className="min-h-[80px]"
                                    disabled={isSaving}
                                />
                                <div className="flex gap-2 justify-end">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancel}
                                        disabled={isSaving}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSaveAdendo}
                                        disabled={!novoAdendo.trim() || isSaving}
                                    >
                                        {isSaving ? 'Salvando...' : 'Salvar'}
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Mensagem quando vazio */}
                        {adendos.length === 0 && !isAddingAdendo && (
                            <p className="text-sm text-muted-foreground italic py-2">
                                Nenhum adendo registrado.
                            </p>
                        )}
                    </div>
                </CollapsibleContent>
            </Collapsible>
        </div>
    );
}

// ============================================================
// STEP READ-ONLY WITH ADENDOS WRAPPER
// ============================================================

interface StepReadOnlyWithAdendosProps {
    /** ID da etapa no banco (UUID) */
    etapaId?: string;
    /** Conteúdo do step em modo read-only */
    children: ReactNode;
    /** Se a OS está em modo readonly (cancelada, etc) */
    readonly?: boolean;
    /** Classes adicionais */
    className?: string;
}

/**
 * Wrapper que combina um step em modo read-only com seção de adendos
 * 
 * @example
 * ```tsx
 * <StepReadOnlyWithAdendos etapaId={etapa?.id}>
 *   <StepFollowup1OS5 data={data} onDataChange={() => {}} readOnly />
 * </StepReadOnlyWithAdendos>
 * ```
 */
export function StepReadOnlyWithAdendos({
    etapaId,
    children,
    readonly = false,
    className,
}: StepReadOnlyWithAdendosProps) {
    // Hook de adendos
    const { adendos, addAdendo } = useEtapaAdendos(etapaId);

    // Handler de adicionar adendo
    const handleAddAdendo = useCallback(async (campoKey: string, conteudo: string) => {
        return await addAdendo(campoKey, conteudo);
    }, [addAdendo]);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Conteúdo do Step em Read-Only */}
            <div className="step-readonly-content">
                {children}
            </div>

            {/* Seção de Adendos */}
            {etapaId && (
                <div className="pt-3 border-t border-border">
                    <AdendosSection
                        adendos={adendos}
                        onAddAdendo={handleAddAdendo}
                        canAddAdendo={!readonly}
                    />
                </div>
            )}
        </div>
    );
}
