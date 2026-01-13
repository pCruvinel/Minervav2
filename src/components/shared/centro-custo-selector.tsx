/**
 * CentroCustoSelector - Componente reutilizável para seleção de Centro de Custo
 *
 * Carrega automaticamente a lista de Centros de Custo ativos e permite
 * seleção com visualização de detalhes.
 *
 * Features:
 * - Loading state durante carregamento
 * - Empty state quando sem CCs
 * - Error state quando falha
 * - Badge de tipo (Obra/Assessoria/Administrativo)
 * - Card de detalhes do CC selecionado (opcional)
 * - Filtro por cliente (opcional)
 *
 * @example
 * ```tsx
 * <CentroCustoSelector
 *   value={selectedCCId}
 *   onChange={(ccId, ccData) => setSelectedCC(ccId)}
 *   showDetails
 *   required
 *   label="Centro de Custo"
 * />
 * ```
 */

import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, DollarSign, Loader2 } from 'lucide-react';
import { useCentrosCusto, type CentroCusto } from '@/lib/hooks/use-os-workflows';
import { cn } from '@/lib/utils';

export interface CentroCustoSelectorProps {
    /** Valor selecionado (ID do CC) */
    value?: string;

    /** Callback quando o valor muda */
    onChange: (ccId: string, ccData: CentroCusto | null) => void;

    /** Desabilitar seleção */
    disabled?: boolean;

    /** Placeholder customizado */
    placeholder?: string;

    /** Filtrar por cliente específico */
    clienteId?: string;

    /** Mostrar detalhes do CC selecionado */
    showDetails?: boolean;

    /** Obrigatório */
    required?: boolean;

    /** Erro de validação */
    error?: string;

    /** Label customizado */
    label?: string;

    /** Classes CSS adicionais */
    className?: string;

    /** ID do elemento para acessibilidade */
    id?: string;
}

/**
 * Determina o tipo do Centro de Custo baseado no nome ou tipo_os_id
 */
function getTipoCentroCusto(cc: CentroCusto): 'Obra' | 'Assessoria' | 'Administrativo' {
    const nome = cc.nome?.toLowerCase() || '';

    // Verificar pelo código do tipo (CC13 = Obra, CC11/CC12 = Assessoria, etc)
    if (nome.startsWith('cc13') || nome.includes('obra')) return 'Obra';
    if (nome.startsWith('cc11') || nome.startsWith('cc12') || nome.includes('assessoria')) return 'Assessoria';
    if (nome.startsWith('cc09') || nome.startsWith('cc10')) return 'Administrativo';

    return 'Administrativo';
}

/**
 * Retorna a cor do badge baseado no tipo
 */
function getBadgeColor(tipo: 'Obra' | 'Assessoria' | 'Administrativo'): string {
    switch (tipo) {
        case 'Obra':
            return 'bg-primary/10 text-primary';
        case 'Assessoria':
            return 'bg-success/10 text-success';
        default:
            return 'bg-muted text-muted-foreground';
    }
}

export function CentroCustoSelector({
    value,
    onChange,
    disabled = false,
    placeholder = 'Selecione um centro de custo',
    clienteId,
    showDetails = false,
    required = false,
    error,
    label = 'Centro de Custo',
    className,
    id = 'centro-custo-selector',
}: CentroCustoSelectorProps) {
    // Buscar centros de custo reais do Supabase
    const { centrosCusto, loading, error: loadError } = useCentrosCusto();

    // Filtrar por cliente se necessário
    const filteredCCs = clienteId
        ? centrosCusto.filter(cc => cc.cliente_id === clienteId)
        : centrosCusto;

    // Encontrar CC selecionado
    const selectedCC = centrosCusto.find(cc => cc.id === value);

    const handleChange = (ccId: string) => {
        if (disabled) return;
        const cc = centrosCusto.find(c => c.id === ccId);
        onChange(ccId, cc || null);
    };

    return (
        <div className={cn('space-y-4', className)}>
            {/* Campo de seleção */}
            <div className="space-y-2">
                {label && (
                    <Label htmlFor={id}>
                        {label} {required && <span className="text-destructive">*</span>}
                    </Label>
                )}

                {loading ? (
                    <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-muted-foreground">Carregando centros de custo...</span>
                    </div>
                ) : loadError ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Erro ao carregar centros de custo. Por favor, tente novamente.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Select
                        value={value}
                        onValueChange={handleChange}
                        disabled={disabled}
                    >
                        <SelectTrigger id={id} className={cn(error && 'border-destructive')}>
                            <SelectValue placeholder={placeholder} />
                        </SelectTrigger>
                        <SelectContent>
                            {filteredCCs.length === 0 ? (
                                <div className="p-2 text-sm text-muted-foreground text-center">
                                    Nenhum centro de custo encontrado
                                </div>
                            ) : (
                                filteredCCs.map((cc) => {
                                    const tipo = getTipoCentroCusto(cc);
                                    return (
                                        <SelectItem key={cc.id} value={cc.id}>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-0.5 rounded text-xs ${getBadgeColor(tipo)}`}>
                                                    {tipo}
                                                </span>
                                                <span>{cc.nome}</span>
                                                {cc.cliente?.nome_razao_social && (
                                                    <span className="text-xs text-muted-foreground">
                                                        ({cc.cliente.nome_razao_social})
                                                    </span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    );
                                })
                            )}
                        </SelectContent>
                    </Select>
                )}

                {error && (
                    <p className="text-sm text-destructive flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </p>
                )}
            </div>

            {/* Card de detalhes do CC selecionado */}
            {showDetails && selectedCC && (
                <Card className="border-primary/20 bg-primary/5">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                            <DollarSign className="w-4 h-4" />
                            Centro de Custo Selecionado
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-muted-foreground">Nome:</span>
                                <p className="font-medium">{selectedCC.nome}</p>
                            </div>
                            <div>
                                <span className="text-muted-foreground">Tipo:</span>
                                <p className="font-medium">{getTipoCentroCusto(selectedCC)}</p>
                            </div>
                            {selectedCC.cliente?.nome_razao_social && (
                                <div>
                                    <span className="text-muted-foreground">Cliente:</span>
                                    <p className="font-medium">{selectedCC.cliente.nome_razao_social}</p>
                                </div>
                            )}
                            {selectedCC.valor_global && selectedCC.valor_global > 0 && (
                                <div>
                                    <span className="text-muted-foreground">Valor Global:</span>
                                    <p className="font-medium">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(selectedCC.valor_global)}
                                    </p>
                                </div>
                            )}
                            {selectedCC.descricao && (
                                <div className="col-span-2">
                                    <span className="text-muted-foreground">Descrição:</span>
                                    <p className="font-medium">{selectedCC.descricao}</p>
                                </div>
                            )}
                            <div>
                                <span className="text-muted-foreground">ID:</span>
                                <p className="font-medium font-mono text-xs">{selectedCC.id}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

/**
 * Variante compacta do seletor (sem label, sem detalhes)
 */
export function CentroCustoSelectorCompact({
    value,
    onChange,
    disabled,
    placeholder,
    clienteId,
    error,
    className,
}: Omit<CentroCustoSelectorProps, 'showDetails' | 'label' | 'required'>) {
    return (
        <CentroCustoSelector
            value={value}
            onChange={onChange}
            disabled={disabled}
            placeholder={placeholder}
            clienteId={clienteId}
            error={error}
            className={className}
            showDetails={false}
            label=""
        />
    );
}
