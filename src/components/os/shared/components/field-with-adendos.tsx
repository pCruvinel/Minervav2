'use client';

import { useState } from 'react';
import { Plus, Check, X, User, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { EtapaAdendo } from '@/lib/hooks/use-etapa-adendos';

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

interface FieldWithAdendosProps {
    /** Label do campo */
    label: string;
    /** Chave única do campo (usado para filtrar adendos) */
    campoKey: string;
    /** Valor original do campo (imutável) */
    valorOriginal: string | number | boolean | null | undefined;
    /** Data/hora do valor original (opcional) */
    dataOriginal?: string;
    /** Lista de adendos para este campo */
    adendos: EtapaAdendo[];
    /** ID da etapa */
    etapaId: string;
    /** Callback para adicionar adendo */
    onAddAdendo: (campoKey: string, conteudo: string) => Promise<boolean>;
    /** Permitir adicionar adendos? */
    canAddAdendo?: boolean;
    /** Classes adicionais */
    className?: string;
}

/**
 * Componente de campo com suporte a adendos
 * 
 * Exibe:
 * - Valor original (imutável, cor padrão)
 * - Lista de adendos (cor azul, indentados)
 * - Botão para adicionar novo adendo
 * 
 * @example
 * ```tsx
 * <FieldWithAdendos
 *   label="Motivo da Procura"
 *   campoKey="motivoProcura"
 *   valorOriginal={data.motivoProcura}
 *   dataOriginal={data.motivoProcura_data}
 *   adendos={getAdendosByCampo('motivoProcura')}
 *   etapaId={etapaId}
 *   onAddAdendo={async (key, content) => {
 *     const result = await addAdendo(key, content);
 *     return !!result;
 *   }}
 *   canAddAdendo={isCompleted && !isCanceled}
 * />
 * ```
 */
export function FieldWithAdendos({
    label,
    campoKey,
    valorOriginal,
    dataOriginal,
    adendos,
    etapaId,
    onAddAdendo,
    canAddAdendo = true,
    className,
}: FieldWithAdendosProps) {
    const [isAddingAdendo, setIsAddingAdendo] = useState(false);
    const [novoAdendo, setNovoAdendo] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Filtrar adendos deste campo
    const fieldAdendos = adendos
        .filter(a => a.campo_referencia === campoKey)
        .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());

    // Formatar valor original para exibição
    const displayValue = (() => {
        if (valorOriginal === null || valorOriginal === undefined) return '-';
        if (typeof valorOriginal === 'boolean') return valorOriginal ? 'Sim' : 'Não';
        return String(valorOriginal);
    })();

    const handleSaveAdendo = async () => {
        if (!novoAdendo.trim()) return;

        setIsSaving(true);
        try {
            const success = await onAddAdendo(campoKey, novoAdendo.trim());
            if (success) {
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

    return (
        <div className={cn('space-y-2', className)}>
            {/* Label */}
            <Label className="text-sm font-medium text-muted-foreground">
                {label}
            </Label>

            {/* Valor Original - Imutável */}
            <div className="bg-muted/30 border border-border rounded-md p-3">
                <p className="text-foreground whitespace-pre-wrap">{displayValue}</p>
                {dataOriginal && (
                    <span className="text-xs text-muted-foreground mt-2 block text-right">
                        📅 {formatDateTime(dataOriginal)}
                    </span>
                )}
            </div>

            {/* Lista de Adendos */}
            {fieldAdendos.map(adendo => (
                <div
                    key={adendo.id}
                    className="bg-muted/20 border-l-2 border-muted-foreground/30 rounded-r-md p-3 ml-4"
                >
                    <p className="text-sm text-muted-foreground italic whitespace-pre-wrap">{adendo.conteudo}</p>
                    <div className="flex justify-end gap-3 mt-2 text-xs text-muted-foreground/70">
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

            {/* Botão para Adicionar Adendo */}
            {canAddAdendo && !isAddingAdendo && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="text-primary hover:text-primary/80 hover:bg-primary/5"
                    onClick={() => setIsAddingAdendo(true)}
                >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar Adendo
                </Button>
            )}

            {/* Formulário de Novo Adendo */}
            {isAddingAdendo && (
                <div className="space-y-2 ml-4 border-l-2 border-primary/30 pl-3">
                    <Textarea
                        placeholder="Digite o complemento à informação original..."
                        value={novoAdendo}
                        onChange={(e) => setNovoAdendo(e.target.value)}
                        className="min-h-[80px] focus:border-primary"
                        disabled={isSaving}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleCancel}
                            disabled={isSaving}
                        >
                            <X className="h-4 w-4 mr-1" />
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleSaveAdendo}
                            disabled={!novoAdendo.trim() || isSaving}
                        >
                            <Check className="h-4 w-4 mr-1" />
                            {isSaving ? 'Salvando...' : 'Salvar Adendo'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
