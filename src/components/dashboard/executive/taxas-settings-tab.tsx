/**
 * TaxasSettingsTab - Aba de configuração de Taxas de Precificação
 *
 * Permite configurar valores padrão e editabilidade de campos percentuais:
 * - Imprevisto (%)
 * - Lucro (%)
 * - Imposto (%)
 *
 * Para OS 1-4 (Obras) e OS 5-6 (Assessoria).
 */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Percent, Save, RotateCcw, Loader2, Info, Lock, LockOpen, Calculator } from 'lucide-react';
import { usePrecificacaoConfig, PrecificacaoConfig } from '@/lib/hooks/use-precificacao-config';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';

// Mapeamento de nomes amigáveis para os campos
const FIELD_LABELS: Record<string, string> = {
    'percentual_imprevisto': 'Imprevisto (%)',
    'percentual_lucro': 'Lucro (%)',
    'percentual_imposto': 'Imposto (%)',
};

// Opções de Tipo de OS
const TIPOS_OS_OPTIONS = [
    { value: 'OS-01-04', label: 'OS 01-04 (Obras)' },
    { value: 'OS-05-06', label: 'OS 05-06 (Assessoria)' },
];

export function TaxasSettingsTab() {
    const { currentUser } = useAuth();
    const [selectedTipoOs, setSelectedTipoOs] = useState<string>('OS-01-04');
    const [localConfigs, setLocalConfigs] = useState<PrecificacaoConfig[]>([]);
    const [hasChanges, setHasChanges] = useState(false);
    const [showResetDialog, setShowResetDialog] = useState(false);

    const {
        configs,
        isLoading,
        isSaving,
        fetchConfigs,
        updateConfig,
        restaurarPadroes,
    } = usePrecificacaoConfig(selectedTipoOs);

    // Sincronizar estado local quando configs mudam
    useEffect(() => {
        setLocalConfigs(configs);
        setHasChanges(false);
    }, [configs]);

    // Handler de mudança de valor
    const handleValueChange = (id: string, valor: string) => {
        const numValor = parseFloat(valor);
        if (isNaN(numValor) || numValor < 0) return;

        setLocalConfigs(prev => prev.map(c =>
            c.id === id ? { ...c, valor_padrao: numValor } : c
        ));
        setHasChanges(true);
    };

    // Handler de toggle editável
    const handleEditableChange = (id: string, checked: boolean) => {
        setLocalConfigs(prev => prev.map(c =>
            c.id === id ? { ...c, campo_editavel: checked } : c
        ));
        setHasChanges(true);
    };

    // Salvar todas as alterações
    const handleSave = async () => {
        const promises = localConfigs.map(localConfig => {
            const originalConfig = configs.find(c => c.id === localConfig.id);
            if (!originalConfig) return null;

            const updates: { valor_padrao?: number; campo_editavel?: boolean } = {};
            let needsUpdate = false;

            if (localConfig.valor_padrao !== originalConfig.valor_padrao) {
                updates.valor_padrao = localConfig.valor_padrao;
                needsUpdate = true;
            }

            if (localConfig.campo_editavel !== originalConfig.campo_editavel) {
                updates.campo_editavel = localConfig.campo_editavel;
                needsUpdate = true;
            }

            if (needsUpdate) {
                return updateConfig(localConfig.id, updates, currentUser?.id);
            }
            return null;
        });

        await Promise.all(promises.filter(Boolean));
        setHasChanges(false);
        await fetchConfigs(selectedTipoOs); // Recarregar para garantir sincronia
    };

    // Restaurar Padrão
    const handleResetConfirm = async () => {
        setShowResetDialog(false);
        const sucesso = await restaurarPadroes(selectedTipoOs, currentUser?.id);
        if (sucesso) {
            // fetchConfigs é chamado dentro de restaurarPadroes
        }
    };

    const handleDiscard = () => {
        setLocalConfigs(configs);
        setHasChanges(false);
        toast.info('Alterações descartadas');
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Percent className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Configuração de Taxas de Precificação</CardTitle>
                            <CardDescription>
                                Defina os valores padrão e permissões de edição para taxas de Imprevisto, Lucro e Imposto.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {/* Selector de Tipo de OS */}
                        <div className="flex-1 max-w-md">
                            <Select value={selectedTipoOs} onValueChange={setSelectedTipoOs}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo de OS" />
                                </SelectTrigger>
                                <SelectContent>
                                    {TIPOS_OS_OPTIONS.map((tipo) => (
                                        <SelectItem key={tipo.value} value={tipo.value}>
                                            {tipo.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ações */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowResetDialog(true)}
                                disabled={isSaving || isLoading}
                            >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Restaurar Padrão
                            </Button>

                            {hasChanges && (
                                <>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleDiscard}
                                        disabled={isSaving}
                                    >
                                        Descartar
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={handleSave}
                                        disabled={isSaving}
                                    >
                                        {isSaving ? (
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        ) : (
                                            <Save className="h-4 w-4 mr-2" />
                                        )}
                                        Salvar Alterações
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Info box */}
                    <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                        <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <p>
                            Valores definidos aqui serão carregados automaticamente em novas propostas.
                            Se "Editável na OS" estiver desligado, o campo aparecerá bloqueado para o usuário.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* Tabela de Configurações */}
            <Card>
                <CardContent className="pt-6">
                    {isLoading ? (
                        <div className="flex justify-center p-8">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[300px]">Campo</TableHead>
                                    <TableHead className="w-[200px]">Valor Padrão (%)</TableHead>
                                    <TableHead className="w-[200px]">Editável na OS?</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {localConfigs.map((config) => (
                                    <TableRow key={config.id}>
                                        <TableCell className="font-medium">
                                            {FIELD_LABELS[config.campo_nome] || config.campo_nome}
                                        </TableCell>
                                        <TableCell>
                                            <div className="relative w-24">
                                                <Input
                                                    type="number"
                                                    value={config.valor_padrao}
                                                    onChange={(e) => handleValueChange(config.id, e.target.value)}
                                                    className="pr-6"
                                                    step="0.1"
                                                    min="0"
                                                />
                                                <span className="absolute right-2 top-2.5 text-xs text-muted-foreground">%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center space-x-2">
                                                <Switch
                                                    checked={config.campo_editavel}
                                                    onCheckedChange={(checked) => handleEditableChange(config.id, checked)}
                                                />
                                                <Label className="text-sm text-muted-foreground w-20">
                                                    {config.campo_editavel ? 'Sim' : 'Não'}
                                                </Label>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {config.campo_editavel ? (
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    <LockOpen className="h-3 w-3 mr-1" />
                                                    Desbloqueado
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-xs text-amber-600 font-medium">
                                                    <Lock className="h-3 w-3 mr-1" />
                                                    Bloqueado
                                                </div>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                                {localConfigs.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                            Nenhuma configuração encontrada para este tipo de OS.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Seção de Fórmulas de Cálculo */}
            <Card className="mt-6">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-info/10">
                            <Calculator className="h-6 w-6 text-info" />
                        </div>
                        <div>
                            <CardTitle>Fórmulas de Cálculo</CardTitle>
                            <CardDescription>
                                Como os valores são calculados nas propostas comerciais.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Valor por Item (Proposta)</h4>
                        <code className="text-sm bg-background px-2 py-1 rounded">
                            Valor Item = Custo × (1 + %Imprevisto + %Lucro + %Imposto)
                        </code>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Valor Total da Proposta</h4>
                        <code className="text-sm bg-background px-2 py-1 rounded">
                            Valor Total = Σ(Custo Itens) × (1 + %Imprevisto + %Lucro + %Imposto)
                        </code>
                    </div>
                    <div className="p-4 rounded-lg bg-muted/50">
                        <h4 className="font-medium mb-2">Simulação com Valores Atuais</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                            Com as taxas atuais ({TIPOS_OS_OPTIONS.find(t => t.value === selectedTipoOs)?.label}):
                        </p>
                        <ul className="text-sm space-y-1">
                            <li>• Imprevisto: {localConfigs.find(c => c.campo_nome === 'percentual_imprevisto')?.valor_padrao || 0}%</li>
                            <li>• Lucro: {localConfigs.find(c => c.campo_nome === 'percentual_lucro')?.valor_padrao || 0}%</li>
                            <li>• Imposto: {localConfigs.find(c => c.campo_nome === 'percentual_imposto')?.valor_padrao || 0}%</li>
                        </ul>
                        <div className="mt-3 pt-3 border-t">
                            <p className="font-medium">
                                → Fator Multiplicador: {(1 +
                                    (localConfigs.find(c => c.campo_nome === 'percentual_imprevisto')?.valor_padrao || 0) / 100 +
                                    (localConfigs.find(c => c.campo_nome === 'percentual_lucro')?.valor_padrao || 0) / 100 +
                                    (localConfigs.find(c => c.campo_nome === 'percentual_imposto')?.valor_padrao || 0) / 100
                                ).toFixed(4)}x
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                                Exemplo: um custo de R$ 1.000 será apresentado como R$ {(1000 * (1 +
                                    (localConfigs.find(c => c.campo_nome === 'percentual_imprevisto')?.valor_padrao || 0) / 100 +
                                    (localConfigs.find(c => c.campo_nome === 'percentual_lucro')?.valor_padrao || 0) / 100 +
                                    (localConfigs.find(c => c.campo_nome === 'percentual_imposto')?.valor_padrao || 0) / 100
                                )).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} na proposta.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Dialog de confirmação de reset */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restaurar padrões?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação irá redefinir todos os valores para o padrão do sistema:
                            <br /><br />
                            • Imprevisto: 10% (Editável)<br />
                            • Lucro: 40% (Editável)<br />
                            • Imposto: 15% (Editável)
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetConfirm}>
                            Confirmar Reset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
