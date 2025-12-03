import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Building2, DollarSign, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCentrosCusto } from '@/lib/hooks/use-os-workflows';

interface OS10StepData {
    centroCusto: string;
    centroCustoNome: string;
    obraVinculada: string;
}

interface StepSelecaoCentroCustoProps {
    data: OS10StepData;
    onDataChange: (data: OS10StepData) => void;
    readOnly?: boolean;
}

export function StepSelecaoCentroCusto({ data, onDataChange, readOnly }: StepSelecaoCentroCustoProps) {
    // Buscar centros de custo reais do Supabase
    const { centrosCusto, loading, error } = useCentrosCusto();

    const handleCentroCustoChange = (ccId: string) => {
        if (readOnly) return;
        const cc = centrosCusto.find(c => c.id === ccId);
        onDataChange({
            ...data,
            centroCusto: ccId,
            centroCustoNome: cc?.nome || '',
            obraVinculada: cc?.cliente?.nome_razao_social || '',
        });
    };

    const selectedCC = centrosCusto.find(c => c.id === data.centroCusto);

    // Determinar tipo do centro de custo baseado no tipo_os_id ou nome
    const getTipoCentroCusto = (cc: typeof centrosCusto[0]) => {
        if (cc.nome.toLowerCase().includes('obra')) return 'Obra';
        if (cc.nome.toLowerCase().includes('assessoria')) return 'Assessoria';
        return 'Administrativo';
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                    <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h2 className="text-xl mb-1">Seleção do Centro de Custo</h2>
                    <p className="text-sm text-muted-foreground">
                        Selecione o centro de custo onde o colaborador será alocado
                    </p>
                </div>
            </div>

            {/* Seleção de Centro de Custo */}
            <div className="space-y-4">
                <h3 className="text-base border-b border-border pb-2" style={{ color: 'var(--primary)' }}>
                    Centro de Custo
                </h3>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="centroCusto">
                            Centro de Custo Ativo <span className="text-destructive">*</span>
                        </Label>

                        {loading ? (
                            <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span className="text-sm text-muted-foreground">Carregando centros de custo...</span>
                            </div>
                        ) : error ? (
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertDescription>
                                    Erro ao carregar centros de custo. Por favor, tente novamente.
                                </AlertDescription>
                            </Alert>
                        ) : (
                            <Select
                                value={data.centroCusto}
                                onValueChange={handleCentroCustoChange}
                                disabled={readOnly}
                            >
                                <SelectTrigger id="centroCusto">
                                    <SelectValue placeholder="Selecione um centro de custo ativo" />
                                </SelectTrigger>
                                <SelectContent>
                                    {centrosCusto.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground text-center">
                                            Nenhum centro de custo ativo encontrado
                                        </div>
                                    ) : (
                                        centrosCusto.map((cc) => {
                                            const tipo = getTipoCentroCusto(cc);
                                            return (
                                                <SelectItem key={cc.id} value={cc.id}>
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-2 py-0.5 rounded text-xs ${tipo === 'Obra' ? 'bg-primary/10 text-primary' :
                                                                tipo === 'Assessoria' ? 'bg-success/10 text-success' :
                                                                    'bg-muted text-muted-foreground'
                                                            }`}>
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
                        <p className="text-xs text-muted-foreground">
                            O custo do colaborador será automaticamente rateado neste centro de custo
                        </p>
                    </div>
                </div>
            </div>

            {/* Info do Centro de Custo Selecionado */}
            {selectedCC && (
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
                            {selectedCC.valor_global > 0 && (
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

            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    <strong>Importante:</strong> O colaborador contratado terá seu custo diário rateado
                    automaticamente no centro de custo selecionado. Certifique-se de escolher o centro
                    de custo correto.
                </AlertDescription>
            </Alert>
        </div>
    );
}