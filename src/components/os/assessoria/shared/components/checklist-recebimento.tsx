/**
 * Checklist de Recebimento de Unidade Autônoma
 * 
 * Este componente renderiza um checklist completo de 8 blocos para inspeção
 * de recebimento de unidades autônomas, conforme padrão NBR 15575 e PBQP-H.
 * 
 * Compartilhado entre OS-08 e OS-11.
 */

import { useState, useMemo } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import { CheckCircle2, AlertTriangle, MinusCircle, Camera } from 'lucide-react';
import { 
  CHECKLIST_BLOCOS,
  type ChecklistItemData,
  type ChecklistRecebimentoData,
  type StatusItem
} from './checklist-recebimento-table';

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

interface StatusBadgeProps {
    status: StatusItem;
}

function StatusBadge({ status }: StatusBadgeProps) {
    if (!status) return null;

    const configs: Record<Exclude<StatusItem, ''>, { label: string; icon: typeof CheckCircle2; className: string }> = {
        C: { label: 'Conforme', icon: CheckCircle2, className: 'bg-success/10 text-success border-success/30' },
        NC: { label: 'Não Conforme', icon: AlertTriangle, className: 'bg-destructive/10 text-destructive border-destructive/30' },
        NA: { label: 'Não se Aplica', icon: MinusCircle, className: 'bg-muted text-muted-foreground border-muted' },
    };

    const config = configs[status];
    const Icon = config.icon;

    return (
        <Badge variant="outline" className={cn('gap-1', config.className)}>
            <Icon className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}

// =====================================================
// COMPONENTE ITEM DO CHECKLIST
// =====================================================

interface ChecklistItemDefinition {
    id: string;
    label: string;
    descricao?: string;
}

interface ChecklistItemComponentProps {
    item: ChecklistItemDefinition;
    data: ChecklistItemData;
    onChange: (data: ChecklistItemData) => void;
    readOnly?: boolean;
    osId?: string;
}

function ChecklistItemComponent({ item, data, onChange, readOnly, osId }: ChecklistItemComponentProps) {
    const handleStatusChange = (status: StatusItem) => {
        onChange({ ...data, status });
    };

    const handleObservacaoChange = (observacao: string) => {
        onChange({ ...data, observacao });
    };

    const handleFotosChange = (fotos: FileWithComment[]) => {
        onChange({ ...data, fotos });
    };

    const isNaoConforme = data.status === 'NC';

    return (
        <div className={cn(
            'border rounded-lg p-4 space-y-4',
            isNaoConforme && 'border-destructive/50 bg-destructive/5'
        )}>
            {/* Header do Item */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <p className="font-medium">{item.label}</p>
                    {item.descricao && (
                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                    )}
                </div>
                {data.status && <StatusBadge status={data.status} />}
            </div>

            {/* Status RadioGroup */}
            <RadioGroup
                value={data.status}
                onValueChange={handleStatusChange}
                disabled={readOnly}
                className="flex gap-4"
            >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="C" id={`${item.id}-c`} />
                    <Label htmlFor={`${item.id}-c`} className="cursor-pointer text-success">
                        Conforme
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NC" id={`${item.id}-nc`} />
                    <Label htmlFor={`${item.id}-nc`} className="cursor-pointer text-destructive">
                        Não Conforme
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="NA" id={`${item.id}-na`} />
                    <Label htmlFor={`${item.id}-na`} className="cursor-pointer text-muted-foreground">
                        Não se Aplica
                    </Label>
                </div>
            </RadioGroup>

            {/* Observação (obrigatório se NC) */}
            <div className="space-y-2">
                <Label htmlFor={`${item.id}-obs`}>
                    Observação {isNaoConforme && <span className="text-destructive">*</span>}
                </Label>
                <Textarea
                    id={`${item.id}-obs`}
                    value={data.observacao}
                    onChange={(e) => handleObservacaoChange(e.target.value)}
                    placeholder={isNaoConforme ? 'Descreva a não conformidade encontrada...' : 'Observações opcionais...'}
                    rows={2}
                    disabled={readOnly}
                    className={cn(isNaoConforme && !data.observacao && 'border-destructive')}
                />
            </div>

            {/* Upload de Fotos */}
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-muted-foreground" />
                    <Label>Evidência Fotográfica (máx. 2)</Label>
                </div>
                <FileUploadUnificado
                    label="Fotos"
                    files={data.fotos}
                    onFilesChange={handleFotosChange}
                    disabled={readOnly}
                    osId={osId}
                    maxFiles={2}
                    acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
                />
            </div>
        </div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

interface ChecklistRecebimentoProps {
    data: ChecklistRecebimentoData;
    onChange: (data: ChecklistRecebimentoData) => void;
    readOnly?: boolean;
    osId?: string;
}

export function ChecklistRecebimento({ data, onChange, readOnly, osId }: ChecklistRecebimentoProps) {
    const [expandedBlocos, setExpandedBlocos] = useState<string[]>(['documentacao']);

    // Inicializar dados de itens se não existirem
    const getItemData = (itemId: string): ChecklistItemData => {
        return data.items[itemId] || {
            id: itemId,
            status: '',
            observacao: '',
            fotos: [],
        };
    };

    const handleItemChange = (itemId: string, itemData: ChecklistItemData) => {
        onChange({
            ...data,
            items: {
                ...data.items,
                [itemId]: itemData,
            },
        });
    };

    // Calcular estatísticas por bloco
    const getBlocoStats = (bloco: typeof CHECKLIST_BLOCOS[0]) => {
        let total = bloco.items.length;
        let conformes = 0;
        let naoConformes = 0;
        let naoAplica = 0;
        let pendentes = 0;

        bloco.items.forEach(item => {
            const itemData = getItemData(item.id);
            switch (itemData.status) {
                case 'C': conformes++; break;
                case 'NC': naoConformes++; break;
                case 'NA': naoAplica++; break;
                default: pendentes++;
            }
        });

        return { total, conformes, naoConformes, naoAplica, pendentes };
    };

    // Estatísticas globais
    const globalStats = useMemo(() => {
        let total = 0;
        let conformes = 0;
        let naoConformes = 0;

        CHECKLIST_BLOCOS.forEach(bloco => {
            const stats = getBlocoStats(bloco);
            total += stats.total;
            conformes += stats.conformes;
            naoConformes += stats.naoConformes;
        });

        return { total, conformes, naoConformes };
    }, [data.items]);

    return (
        <div className="space-y-6">
            {/* Header com estatísticas */}
            <div className="bg-muted/30 border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Checklist de Recebimento de Unidade Autônoma</h3>
                <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span>Conformes: {globalStats.conformes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span>Não Conformes: {globalStats.naoConformes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                        <span>Total: {globalStats.total} itens</span>
                    </div>
                </div>
            </div>

            {/* Accordion de Blocos */}
            <Accordion
                type="multiple"
                value={expandedBlocos}
                onValueChange={setExpandedBlocos}
                className="space-y-2"
            >
                {CHECKLIST_BLOCOS.map((bloco) => {
                    const stats = getBlocoStats(bloco);
                    const isComplete = stats.pendentes === 0;
                    const hasNC = stats.naoConformes > 0;

                    return (
                        <AccordionItem
                            key={bloco.id}
                            value={bloco.id}
                            className={cn(
                                'border rounded-lg overflow-hidden',
                                'hasNC' && hasNC ? 'border-destructive/30 bg-destructive/5' : '',
                                isComplete && !hasNC && 'border-success/30 bg-success/5'
                            )}
                        >
                            <AccordionTrigger className="px-4 py-3 hover:no-underline">
                                <div className="flex items-center justify-between flex-1 mr-4">
                                    <span className="font-medium">{bloco.titulo}</span>
                                    <div className="flex items-center gap-2 text-xs">
                                        {stats.conformes > 0 && (
                                            <Badge variant="outline" className="bg-success/10 text-success">
                                                {stats.conformes}C
                                            </Badge>
                                        )}
                                        {stats.naoConformes > 0 && (
                                            <Badge variant="outline" className="bg-destructive/10 text-destructive">
                                                {stats.naoConformes}NC
                                            </Badge>
                                        )}
                                        {stats.pendentes > 0 && (
                                            <Badge variant="outline" className="bg-muted text-muted-foreground">
                                                {stats.pendentes} pendentes
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </AccordionTrigger>
                            <AccordionContent className="px-4 pb-4">
                                <div className="space-y-4">
                                    {bloco.items.map((item) => (
                                        <ChecklistItemComponent
                                            key={item.id}
                                            item={item}
                                            data={getItemData(item.id)}
                                            onChange={(itemData) => handleItemChange(item.id, itemData)}
                                            readOnly={readOnly}
                                            osId={osId}
                                        />
                                    ))}
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    );
                })}
            </Accordion>
        </div>
    );
}

// Export para uso no step-formulario-pos-visita
export { CHECKLIST_BLOCOS };
