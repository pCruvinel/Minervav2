/**
 * Checklist de Recebimento de Unidade Autônoma
 * 
 * Este componente renderiza um checklist completo de 8 blocos para inspeção
 * de recebimento de unidades autônomas, conforme padrão NBR 15575 e PBQP-H.
 * 
 * Cada item possui:
 * - Status: C (Conforme) | NC (Não Conforme) | NA (Não se Aplica)
 * - Observação: Obrigatório quando NC
 * - Foto: Até 2 fotos por item
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

// =====================================================
// TYPES
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
// ESTRUTURA DO CHECKLIST
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
    const getBlocoStats = (bloco: ChecklistBlocoDefinition) => {
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
                                hasNC && 'border-destructive/30 bg-destructive/5',
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
