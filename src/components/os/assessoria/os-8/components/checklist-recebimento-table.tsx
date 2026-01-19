/**
 * Checklist de Recebimento de Unidade - Formato Tabela
 * 
 * Este componente renderiza o checklist em formato de tabelas agrupadas,
 * com colunas para Status (Select), Observação e Fotos.
 * 
 * Mantém compatibilidade com a estrutura de dados ChecklistRecebimentoData
 * do componente original (checklist-recebimento.tsx).
 */

import { useState, useMemo, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import { CheckCircle2, AlertTriangle, MinusCircle, Camera, ChevronDown, ChevronRight } from 'lucide-react';

// =====================================================
// TYPES - Reutilizamos os tipos do componente original
// =====================================================

export type StatusItem = 'C' | 'NC' | 'NA' | '';

export interface ChecklistItemData {
    id: string;
    status: StatusItem;
    observacao: string;
    fotos: FileWithComment[];
}

export interface ChecklistRecebimentoData {
    items: Record<string, ChecklistItemData>;
}

// =====================================================
// ESTRUTURA DO CHECKLIST (8 blocos, 27 itens)
// =====================================================

interface ChecklistItemDefinition {
    id: string;
    label: string;
    descricao?: string;
}

interface ChecklistBlocoDefinition {
    id: string;
    titulo: string;
    items: ChecklistItemDefinition[];
}

const CHECKLIST_BLOCOS: ChecklistBlocoDefinition[] = [
    {
        id: 'documentacao',
        titulo: '1. Documentação Geral',
        items: [
            { id: 'doc_memorial', label: 'Memorial Descritivo', descricao: 'Verificar conformidade com projeto' },
            { id: 'doc_manual', label: 'Manual do Proprietário', descricao: 'Entrega do manual com orientações' },
            { id: 'doc_pbqph', label: 'Certificação PBQP-H', descricao: 'Verificar certificado válido' },
        ],
    },
    {
        id: 'pisos',
        titulo: '2. Pisos e Revestimentos',
        items: [
            { id: 'piso_pecas_ocas', label: 'Peças ocas (teste de percussão)', descricao: 'Verificar som cavo nas cerâmicas' },
            { id: 'piso_caimentos', label: 'Caimentos para ralos', descricao: 'Verificar escoamento de água' },
            { id: 'piso_rejuntes', label: 'Rejuntes íntegros', descricao: 'Verificar falhas e trincas' },
            { id: 'piso_nivelamento', label: 'Nivelamento adequado', descricao: 'Verificar desníveis entre ambientes' },
        ],
    },
    {
        id: 'paredes',
        titulo: '3. Paredes e Tetos',
        items: [
            { id: 'parede_fissuras', label: 'Fissuras e trincas', descricao: 'Identificar patologias visíveis' },
            { id: 'parede_pintura', label: 'Pintura e acabamento', descricao: 'Verificar manchas, bolhas, descascamentos' },
            { id: 'parede_alinhamento', label: 'Alinhamento e prumo', descricao: 'Verificar verticalidade das paredes' },
            { id: 'parede_umidade', label: 'Sinais de umidade', descricao: 'Verificar manchas e eflorescências' },
        ],
    },
    {
        id: 'portas_vidros',
        titulo: '4. Portas e Vidros',
        items: [
            { id: 'porta_funcionamento', label: 'Funcionamento das portas', descricao: 'Abertura, fechamento e travamento' },
            { id: 'porta_vedacao', label: 'Vedação de esquadrias', descricao: 'Verificar frestas e infiltrações' },
            { id: 'porta_ferragens', label: 'Ferragens e dobradiças', descricao: 'Verificar fixação e funcionamento' },
            { id: 'vidro_integridade', label: 'Integridade dos vidros', descricao: 'Verificar riscos, trincas e manchas' },
        ],
    },
    {
        id: 'loucas_metais',
        titulo: '5. Louças e Metais',
        items: [
            { id: 'louca_fixacao', label: 'Fixação de louças', descricao: 'Verificar estabilidade de vasos e pias' },
            { id: 'louca_vazamentos', label: 'Vazamentos em sifões', descricao: 'Teste com água' },
            { id: 'metal_torneiras', label: 'Funcionamento de torneiras', descricao: 'Verificar fluxo e gotejamento' },
            { id: 'metal_registros', label: 'Registros e válvulas', descricao: 'Verificar abertura e vedação' },
        ],
    },
    {
        id: 'areas_molhadas',
        titulo: '6. Áreas Molhadas',
        items: [
            { id: 'molhada_vazamento', label: 'Teste de vazamento', descricao: 'Teste com água parada por 72h' },
            { id: 'molhada_impermeabilizacao', label: 'Impermeabilização', descricao: 'Verificar manchas no teto inferior' },
            { id: 'molhada_ralos', label: 'Ralos e grelhas', descricao: 'Verificar escoamento e vedação' },
            { id: 'molhada_rejuntes', label: 'Rejuntes em box', descricao: 'Verificar integridade com silicone' },
        ],
    },
    {
        id: 'eletrica',
        titulo: '7. Elétrica e Comunicação',
        items: [
            { id: 'elet_disjuntores', label: 'Disjuntores identificados', descricao: 'Verificar identificação no quadro' },
            { id: 'elet_tomadas', label: 'Tomadas funcionais', descricao: 'Testar com multímetro' },
            { id: 'elet_interruptores', label: 'Interruptores funcionais', descricao: 'Verificar todos os pontos' },
            { id: 'elet_interfone', label: 'Interfone/porteiro', descricao: 'Testar comunicação' },
        ],
    },
    {
        id: 'externas',
        titulo: '8. Áreas Externas',
        items: [
            { id: 'ext_varanda', label: 'Varanda/sacada', descricao: 'Verificar guarda-corpo e caimentos' },
            { id: 'ext_garagem', label: 'Vaga de garagem', descricao: 'Verificar demarcação e acabamento' },
            { id: 'ext_fachada', label: 'Fachada correspondente', descricao: 'Verificar conformidade com projeto' },
        ],
    },
];

// =====================================================
// COMPONENTES AUXILIARES
// =====================================================

const STATUS_OPTIONS = [
    { value: 'C', label: 'Conforme', shortLabel: 'C', icon: CheckCircle2, className: 'text-success' },
    { value: 'NC', label: 'Não Conforme', shortLabel: 'NC', icon: AlertTriangle, className: 'text-destructive' },
    { value: 'NA', label: 'Não se Aplica', shortLabel: 'N/A', icon: MinusCircle, className: 'text-muted-foreground' },
] as const;

interface PhotoUploadDialogProps {
    itemId: string;
    itemLabel: string;
    fotos: FileWithComment[];
    onFotosChange: (fotos: FileWithComment[]) => void;
    disabled?: boolean;
    osId?: string;
}

function PhotoUploadDialog({ itemId, itemLabel, fotos, onFotosChange, disabled, osId }: PhotoUploadDialogProps) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className={cn(
                        'gap-1.5 h-8',
                        fotos.length > 0 && 'border-primary text-primary'
                    )}
                    disabled={disabled}
                >
                    <Camera className="h-3.5 w-3.5" />
                    <span className="text-xs">{fotos.length}/2</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Fotos: {itemLabel}</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    <FileUploadUnificado
                        label="Evidência Fotográfica"
                        files={fotos}
                        onFilesChange={onFotosChange}
                        disabled={disabled}
                        osId={osId}
                        maxFiles={2}
                        acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}

// =====================================================
// COMPONENTE BLOCO (Tabela)
// =====================================================

interface ChecklistBlocoTableProps {
    bloco: ChecklistBlocoDefinition;
    getItemData: (itemId: string) => ChecklistItemData;
    onItemChange: (itemId: string, data: ChecklistItemData) => void;
    readOnly?: boolean;
    osId?: string;
}

function ChecklistBlocoTable({ bloco, getItemData, onItemChange, readOnly, osId }: ChecklistBlocoTableProps) {
    const [expanded, setExpanded] = useState(true);

    // Calcular estatísticas
    const stats = useMemo(() => {
        let conformes = 0;
        let naoConformes = 0;
        let naoAplica = 0;
        let pendentes = 0;

        bloco.items.forEach(item => {
            const data = getItemData(item.id);
            switch (data.status) {
                case 'C': conformes++; break;
                case 'NC': naoConformes++; break;
                case 'NA': naoAplica++; break;
                default: pendentes++;
            }
        });

        return { conformes, naoConformes, naoAplica, pendentes };
    }, [bloco.items, getItemData]);

    const handleStatusChange = useCallback((itemId: string, status: StatusItem) => {
        const currentData = getItemData(itemId);
        onItemChange(itemId, { ...currentData, status });
    }, [getItemData, onItemChange]);

    const handleObservacaoChange = useCallback((itemId: string, observacao: string) => {
        const currentData = getItemData(itemId);
        onItemChange(itemId, { ...currentData, observacao });
    }, [getItemData, onItemChange]);

    const handleFotosChange = useCallback((itemId: string, fotos: FileWithComment[]) => {
        const currentData = getItemData(itemId);
        onItemChange(itemId, { ...currentData, fotos });
    }, [getItemData, onItemChange]);

    const hasNonConformes = stats.naoConformes > 0;
    const isComplete = stats.pendentes === 0;

    return (
        <div className={cn(
            'border rounded-lg overflow-hidden',
            hasNonConformes && 'border-destructive/40',
            isComplete && !hasNonConformes && 'border-success/40'
        )}>
            {/* Header colapsável */}
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className={cn(
                    'w-full flex items-center justify-between px-4 py-3 text-left',
                    'hover:bg-muted/50 transition-colors',
                    hasNonConformes && 'bg-destructive/5',
                    isComplete && !hasNonConformes && 'bg-success/5'
                )}
            >
                <div className="flex items-center gap-2">
                    {expanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    )}
                    <span className="font-medium">{bloco.titulo}</span>
                </div>

                {/* Badges de estatísticas */}
                <div className="flex items-center gap-1.5">
                    {stats.conformes > 0 && (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-xs">
                            {stats.conformes}C
                        </Badge>
                    )}
                    {stats.naoConformes > 0 && (
                        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-xs">
                            {stats.naoConformes}NC
                        </Badge>
                    )}
                    {stats.naoAplica > 0 && (
                        <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
                            {stats.naoAplica}N/A
                        </Badge>
                    )}
                    {stats.pendentes > 0 && (
                        <Badge variant="outline" className="text-muted-foreground text-xs">
                            {stats.pendentes} pendentes
                        </Badge>
                    )}
                </div>
            </button>

            {/* Tabela de itens */}
            {expanded && (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/30">
                                <TableHead className="w-[40%]">Item</TableHead>
                                <TableHead className="w-[120px]">Status</TableHead>
                                <TableHead className="w-[35%]">Observação</TableHead>
                                <TableHead className="w-[80px] text-center">Fotos</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bloco.items.map((item) => {
                                const itemData = getItemData(item.id);
                                const isNaoConforme = itemData.status === 'NC';
                                const needsObservacao = isNaoConforme && !itemData.observacao.trim();

                                return (
                                    <TableRow
                                        key={item.id}
                                        className={cn(
                                            isNaoConforme && 'bg-destructive/5',
                                            needsObservacao && 'bg-destructive/10'
                                        )}
                                    >
                                        {/* Coluna Item */}
                                        <TableCell className="py-2">
                                            <div>
                                                <p className="font-medium text-sm">{item.label}</p>
                                                {item.descricao && (
                                                    <p className="text-xs text-muted-foreground">{item.descricao}</p>
                                                )}
                                            </div>
                                        </TableCell>

                                        {/* Coluna Status (Select) */}
                                        <TableCell className="py-2">
                                            <Select
                                                value={itemData.status || undefined}
                                                onValueChange={(value) => handleStatusChange(item.id, value as StatusItem)}
                                                disabled={readOnly}
                                            >
                                                <SelectTrigger className={cn(
                                                    'h-8 text-xs',
                                                    itemData.status === 'C' && 'text-success border-success/50',
                                                    itemData.status === 'NC' && 'text-destructive border-destructive/50',
                                                    itemData.status === 'NA' && 'text-muted-foreground'
                                                )}>
                                                    <SelectValue placeholder="Selecione" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {STATUS_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.value} value={opt.value}>
                                                            <span className={cn('flex items-center gap-1.5', opt.className)}>
                                                                <opt.icon className="h-3.5 w-3.5" />
                                                                {opt.label}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </TableCell>

                                        {/* Coluna Observação */}
                                        <TableCell className="py-2">
                                            <Input
                                                value={itemData.observacao}
                                                onChange={(e) => handleObservacaoChange(item.id, e.target.value)}
                                                placeholder={isNaoConforme ? 'Obrigatório para NC *' : 'Opcional...'}
                                                disabled={readOnly}
                                                className={cn(
                                                    'h-8 text-xs',
                                                    needsObservacao && 'border-destructive placeholder:text-destructive/70'
                                                )}
                                            />
                                        </TableCell>

                                        {/* Coluna Fotos */}
                                        <TableCell className="py-2 text-center">
                                            <PhotoUploadDialog
                                                itemId={item.id}
                                                itemLabel={item.label}
                                                fotos={itemData.fotos}
                                                onFotosChange={(fotos) => handleFotosChange(item.id, fotos)}
                                                disabled={readOnly}
                                                osId={osId}
                                            />
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>
            )}
        </div>
    );
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

interface ChecklistRecebimentoTableProps {
    data: ChecklistRecebimentoData;
    onChange: (data: ChecklistRecebimentoData) => void;
    readOnly?: boolean;
    osId?: string;
}

export function ChecklistRecebimentoTable({ data, onChange, readOnly, osId }: ChecklistRecebimentoTableProps) {
    // Inicializar dados de itens se não existirem
    const getItemData = useCallback((itemId: string): ChecklistItemData => {
        return data.items[itemId] || {
            id: itemId,
            status: '',
            observacao: '',
            fotos: [],
        };
    }, [data.items]);

    const handleItemChange = useCallback((itemId: string, itemData: ChecklistItemData) => {
        onChange({
            ...data,
            items: {
                ...data.items,
                [itemId]: itemData,
            },
        });
    }, [data, onChange]);

    // Estatísticas globais
    const globalStats = useMemo(() => {
        let total = 0;
        let conformes = 0;
        let naoConformes = 0;

        CHECKLIST_BLOCOS.forEach(bloco => {
            bloco.items.forEach(item => {
                total++;
                const itemData = getItemData(item.id);
                if (itemData.status === 'C') conformes++;
                if (itemData.status === 'NC') naoConformes++;
            });
        });

        return { total, conformes, naoConformes };
    }, [data.items, getItemData]);

    return (
        <div className="space-y-4">
            {/* Header com estatísticas globais */}
            <div className="bg-muted/30 border rounded-lg p-4">
                <h3 className="font-semibold mb-3">Checklist de Recebimento de Unidade Autônoma</h3>
                <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-success" />
                        <span>Conformes: <strong>{globalStats.conformes}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-destructive" />
                        <span>Não Conformes: <strong>{globalStats.naoConformes}</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-muted-foreground" />
                        <span>Total: <strong>{globalStats.total}</strong> itens</span>
                    </div>
                </div>
            </div>

            {/* Blocos de tabelas */}
            <div className="space-y-3">
                {CHECKLIST_BLOCOS.map((bloco) => (
                    <ChecklistBlocoTable
                        key={bloco.id}
                        bloco={bloco}
                        getItemData={getItemData}
                        onItemChange={handleItemChange}
                        readOnly={readOnly}
                        osId={osId}
                    />
                ))}
            </div>
        </div>
    );
}

// Re-export para compatibilidade
export { CHECKLIST_BLOCOS };
