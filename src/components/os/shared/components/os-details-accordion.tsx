'use client';

import { useState, useCallback } from 'react';
import { Check, Plus, User, Calendar } from 'lucide-react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { useEtapaAdendos, EtapaAdendo } from '@/lib/hooks/use-etapa-adendos';
import { Etapa } from '@/lib/types';

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

/**
 * Formatar valor para exibição
 */
function formatValue(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (Array.isArray(value)) {
        if (value.length === 0) return '-';
        // Se for array de objetos (arquivos), contar
        if (typeof value[0] === 'object') return `📎 ${value.length} arquivo(s)`;
        return value.join(', ');
    }
    if (typeof value === 'object') {
        // Tratar endereço de forma especial
        if ('rua' in value || 'logradouro' in value) {
            const rua = value.rua || value.logradouro || '';
            const numero = value.numero || '';
            const bairro = value.bairro || '';
            const cidade = value.cidade || '';
            const estado = value.estado || value.uf || '';
            const cep = value.cep || '';
            const partes = [
                rua && numero ? `${rua}, ${numero}` : rua,
                bairro,
                cidade && estado ? `${cidade}/${estado}` : cidade || estado,
                cep ? `CEP: ${cep}` : ''
            ].filter(Boolean);
            return partes.join(' - ') || '-';
        }
        // Tratar identificação/cliente
        if ('nome' in value || 'nome_razao_social' in value) {
            return value.nome || value.nome_razao_social || '-';
        }
        // Outros objetos: formatar como lista de valores
        const entries = Object.entries(value).filter(([, v]) => v !== null && v !== undefined && v !== '');
        if (entries.length === 0) return '-';
        return entries.map(([k, v]) => `${k}: ${v}`).join(', ');
    }
    return String(value);
}

interface EtapaFieldProps {
    label: string;
    value: any;
    campoKey: string;
    adendos: EtapaAdendo[];
    canAddAdendo: boolean;
    onAddAdendo: (campoKey: string, conteudo: string) => Promise<boolean>;
}

/**
 * Campo individual com suporte a adendos
 */
function EtapaField({
    label,
    value,
    campoKey,
    adendos,
    canAddAdendo,
    onAddAdendo,
}: EtapaFieldProps) {
    const [isAddingAdendo, setIsAddingAdendo] = useState(false);
    const [novoAdendo, setNovoAdendo] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Filtrar adendos deste campo
    const fieldAdendos = adendos
        .filter(a => a.campo_referencia === campoKey)
        .sort((a, b) => new Date(a.criado_em).getTime() - new Date(b.criado_em).getTime());

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

    return (
        <div className="space-y-2">
            {/* Label */}
            <span className="text-xs font-medium text-muted-foreground">{label}</span>

            {/* Valor Original */}
            <div className="bg-muted/30 border border-border rounded-md p-2">
                <p className="text-sm font-medium text-foreground">{formatValue(value)}</p>
            </div>

            {/* Adendos */}
            {fieldAdendos.map(adendo => (
                <div
                    key={adendo.id}
                    className="bg-muted/20 border-l-2 border-muted-foreground/30 rounded-r-md p-2 ml-4"
                >
                    <p className="text-sm text-muted-foreground italic">{adendo.conteudo}</p>
                    <div className="flex justify-end gap-3 mt-1.5 text-xs text-muted-foreground/70">
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
                    className="text-primary hover:text-primary/80 hover:bg-primary/5 h-7 text-xs"
                    onClick={() => setIsAddingAdendo(true)}
                >
                    <Plus className="h-3 w-3 mr-1" />
                    Adendo
                </Button>
            )}

            {/* Formulário de Novo Adendo */}
            {isAddingAdendo && (
                <div className="space-y-2 ml-4 border-l-2 border-primary/30 pl-2">
                    <Textarea
                        placeholder="Digite o complemento..."
                        value={novoAdendo}
                        onChange={(e) => setNovoAdendo(e.target.value)}
                        className="min-h-[60px] text-sm"
                        disabled={isSaving}
                    />
                    <div className="flex gap-2 justify-end">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={() => { setIsAddingAdendo(false); setNovoAdendo(''); }}
                            disabled={isSaving}
                        >
                            Cancelar
                        </Button>
                        <Button
                            size="sm"
                            className="h-7 text-xs"
                            onClick={handleSaveAdendo}
                            disabled={!novoAdendo.trim() || isSaving}
                        >
                            {isSaving ? 'Salvando...' : 'Salvar'}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

interface EtapaAccordionItemProps {
    etapa: Etapa;
    canAddAdendo: boolean;
}

/**
 * Item de Accordion para uma etapa
 */
function EtapaAccordionItem({ etapa, canAddAdendo }: EtapaAccordionItemProps) {
    const { adendos, addAdendo } = useEtapaAdendos(etapa.id);

    const isCompleted = etapa.status === 'concluida';
    const isInProgress = etapa.status === 'em_andamento';
    const dados = etapa.dados_etapa || {};

    const handleAddAdendo = useCallback(async (campoKey: string, conteudo: string): Promise<boolean> => {
        const result = await addAdendo(campoKey, conteudo);
        return !!result;
    }, [addAdendo]);

    // Extrair campos do dados_etapa
    const campos = Object.entries(dados).filter(([key, value]) => {
        // Ignorar campos internos ou vazios
        if (key.startsWith('_') || key === 'id' || key === 'osId') return false;
        if (value === null || value === undefined) return false;
        if (typeof value === 'object' && Object.keys(value).length === 0) return false;
        return true;
    });

    return (
        <AccordionItem
            value={`etapa-${etapa.id}`}
            className={cn(
                'border rounded-lg overflow-hidden mb-2',
                isCompleted && 'border-success/30 bg-success/5',
                isInProgress && 'border-primary/30',
                !isCompleted && !isInProgress && 'border-border'
            )}
        >
            <AccordionTrigger className="px-4 py-3 hover:no-underline [&>svg]:ml-auto">
                {/* Ícone de status */}
                <div
                    className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-medium',
                        isCompleted && 'bg-success/20 text-success',
                        isInProgress && 'bg-primary/20 text-primary',
                        !isCompleted && !isInProgress && 'bg-muted text-muted-foreground'
                    )}
                >
                    {isCompleted ? (
                        <Check className="h-4 w-4" />
                    ) : (
                        etapa.ordem
                    )}
                </div>

                {/* Título */}
                <div className="flex flex-col items-start flex-1 ml-3">
                    <span className={cn(
                        'font-medium text-sm',
                        isCompleted && 'text-success',
                        isInProgress && 'text-primary'
                    )}>
                        {etapa.nome_etapa}
                    </span>
                </div>

                {/* Badge de status */}
                <Badge
                    variant="outline"
                    className={cn(
                        'mr-2 text-xs',
                        isCompleted && 'text-success border-success/30',
                        isInProgress && 'text-primary border-primary/30'
                    )}
                >
                    {isCompleted ? 'Concluída' : isInProgress ? 'Em Andamento' : 'Pendente'}
                </Badge>
            </AccordionTrigger>

            <AccordionContent className="px-4 pb-4">
                {campos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        {campos.map(([key, value]) => {
                            // Formatar label a partir da chave
                            const label = key
                                .replace(/([A-Z])/g, ' $1')
                                .replace(/_/g, ' ')
                                .replace(/^./, str => str.toUpperCase())
                                .trim();

                            // Determinar se é campo de texto longo
                            const isLongText = typeof value === 'string' && value.length > 100;

                            return (
                                <div key={key} className={isLongText ? 'col-span-full' : ''}>
                                    <EtapaField
                                        label={label}
                                        value={value}
                                        campoKey={key}
                                        adendos={adendos}
                                        canAddAdendo={canAddAdendo && isCompleted}
                                        onAddAdendo={handleAddAdendo}
                                    />
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground text-sm py-4">
                        {isCompleted || isInProgress ? 'Sem dados registrados' : 'Etapa ainda não iniciada'}
                    </div>
                )}
            </AccordionContent>
        </AccordionItem>
    );
}

interface OSDetailsAccordionProps {
    /** Lista de etapas da OS */
    etapas: Etapa[];
    /** Permitir adicionar adendos? */
    canAddAdendo?: boolean;
    /** Etapa inicial aberta (opcional) */
    defaultOpenEtapa?: string;
    /** Classes adicionais */
    className?: string;
}

/**
 * Accordion de etapas para a página de Detalhes da OS
 * 
 * Exibe todas as etapas da OS em formato de accordion,
 * com dados preenchidos e suporte a adendos.
 * 
 * @example
 * ```tsx
 * <OSDetailsAccordion
 *   etapas={etapas}
 *   canAddAdendo={userHasPermission}
 * />
 * ```
 */
export function OSDetailsAccordion({
    etapas,
    canAddAdendo = false,
    defaultOpenEtapa,
    className,
}: OSDetailsAccordionProps) {
    // Encontrar primeira etapa concluída ou em andamento para abrir por padrão
    const defaultValue = defaultOpenEtapa || (() => {
        const currentEtapa = etapas.find(e => e.status === 'em_andamento');
        if (currentEtapa) return `etapa-${currentEtapa.id}`;
        const lastCompleted = [...etapas].reverse().find(e => e.status === 'concluida');
        if (lastCompleted) return `etapa-${lastCompleted.id}`;
        return undefined;
    })();

    if (etapas.length === 0) {
        return (
            <div className="text-center py-8 text-muted-foreground">
                Nenhuma etapa encontrada para esta OS.
            </div>
        );
    }

    return (
        <Accordion
            type="single"
            collapsible
            defaultValue={defaultValue}
            className={cn('space-y-2', className)}
        >
            {etapas
                .sort((a, b) => a.ordem - b.ordem)
                .map(etapa => (
                    <EtapaAccordionItem
                        key={etapa.id}
                        etapa={etapa}
                        canAddAdendo={canAddAdendo}
                    />
                ))}
        </Accordion>
    );
}
