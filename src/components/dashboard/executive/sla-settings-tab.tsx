/**
 * SlaSettingsTab - Aba de configuração de SLA no Dashboard Executivo
 *
 * Permite configurar prazos (em dias úteis) para cada etapa
 * de cada tipo de Ordem de Serviço.
 *
 * @example
 * ```tsx
 * <TabsContent value="sla">
 *   <SlaSettingsTab />
 * </TabsContent>
 * ```
 */
'use client';

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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
import { Badge } from '@/components/ui/badge';
import { Timer, Save, RotateCcw, Loader2, Info } from 'lucide-react';
import { useSlaConfig } from '@/lib/hooks/use-sla-config';
import { SlaEtapasTable } from './sla-etapas-table';
import { useAuth } from '@/lib/contexts/auth-context';
import { toast } from 'sonner';

// ============================================================
// TIPOS
// ============================================================

interface PrazoAlterado {
    id: string;
    valorOriginal: number;
    valorNovo: number;
}

// ============================================================
// COMPONENTE
// ============================================================

export function SlaSettingsTab() {
    const { currentUser } = useAuth();
    const [selectedTipoOs, setSelectedTipoOs] = useState<string>('');
    const [alteracoesPendentes, setAlteracoesPendentes] = useState<PrazoAlterado[]>([]);
    const [showResetDialog, setShowResetDialog] = useState(false);

    const {
        tiposOs,
        etapas,
        isLoading,
        isSaving,
        fetchEtapas,
        updateMultiplosPrazos,
        updateAprovacao,
        restaurarPadrao,
    } = useSlaConfig(selectedTipoOs);

    // Handler de seleção de tipo de OS
    const handleTipoOsChange = useCallback((value: string) => {
        // Verificar alterações pendentes
        if (alteracoesPendentes.length > 0) {
            const confirmar = window.confirm(
                'Existem alterações não salvas. Deseja descartar?'
            );
            if (!confirmar) return;
        }

        setSelectedTipoOs(value);
        setAlteracoesPendentes([]);
    }, [alteracoesPendentes.length]);

    // Handler de mudança de prazos
    const handlePrazosChange = useCallback((novasAlteracoes: PrazoAlterado[]) => {
        setAlteracoesPendentes(novasAlteracoes);
    }, []);

    // Handler de mudança de aprovação (imediato)
    const handleAprovacaoChange = useCallback(async (id: string, valor: boolean) => {
        await updateAprovacao(id, valor, currentUser?.id);
    }, [currentUser?.id, updateAprovacao]);

    // Salvar alterações
    const handleSave = useCallback(async () => {
        if (alteracoesPendentes.length === 0) return;

        const alteracoesParaSalvar = alteracoesPendentes.map(a => ({
            configId: a.id,
            novoPrazo: a.valorNovo,
        }));

        const sucesso = await updateMultiplosPrazos(
            alteracoesParaSalvar,
            currentUser?.id
        );

        if (sucesso) {
            setAlteracoesPendentes([]);
            await fetchEtapas(selectedTipoOs);
        }
    }, [alteracoesPendentes, currentUser?.id, fetchEtapas, selectedTipoOs, updateMultiplosPrazos]);

    // Restaurar padrão
    const handleResetConfirm = useCallback(async () => {
        setShowResetDialog(false);

        const sucesso = await restaurarPadrao(selectedTipoOs, currentUser?.id);

        if (sucesso) {
            setAlteracoesPendentes([]);
        }
    }, [currentUser?.id, restaurarPadrao, selectedTipoOs]);

    // Descartar alterações
    const handleDiscard = useCallback(() => {
        setAlteracoesPendentes([]);
        // Forçar recarregamento para resetar inputs
        if (selectedTipoOs) {
            fetchEtapas(selectedTipoOs);
        }
        toast.info('Alterações descartadas');
    }, [fetchEtapas, selectedTipoOs]);

    // Encontrar label do tipo selecionado
    const tipoSelecionadoLabel = tiposOs.find(t => t.id === selectedTipoOs)?.codigo;

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Timer className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <CardTitle>Configuração de SLA por Etapa</CardTitle>
                            <CardDescription>
                                Defina o prazo em dias úteis para cada etapa de cada tipo de OS
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        {/* Selector de Tipo de OS */}
                        <div className="flex-1 max-w-md">
                            <Select value={selectedTipoOs} onValueChange={handleTipoOsChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Selecione o tipo de OS" />
                                </SelectTrigger>
                                <SelectContent>
                                    {tiposOs.map((tipo) => (
                                        <SelectItem key={tipo.id} value={tipo.id}>
                                            <span className="font-mono text-primary mr-2">{tipo.codigo}</span>
                                            {tipo.nome}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Ações */}
                        {selectedTipoOs && (
                            <div className="flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowResetDialog(true)}
                                    disabled={isSaving}
                                >
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Restaurar Padrão
                                </Button>

                                {alteracoesPendentes.length > 0 && (
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
                                            Salvar ({alteracoesPendentes.length})
                                        </Button>
                                    </>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Info box */}
                    {selectedTipoOs && (
                        <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                            <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            <p>
                                Os prazos são contados em <strong>dias úteis</strong>, excluindo fins de semana
                                e feriados. Etapas marcadas com "Aprovação" exigem validação do gestor.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Tabela de Etapas */}
            {selectedTipoOs && (
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                                Etapas - <span className="text-primary font-mono">{tipoSelecionadoLabel}</span>
                            </CardTitle>
                            {etapas.length > 0 && (
                                <Badge variant="secondary">
                                    {etapas.length} etapas
                                </Badge>
                            )}
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        <SlaEtapasTable
                            etapas={etapas}
                            isLoading={isLoading}
                            onPrazosChange={handlePrazosChange}
                            onAprovacaoChange={handleAprovacaoChange}
                            alteracoesPendentes={alteracoesPendentes}
                        />
                    </CardContent>
                </Card>
            )}

            {/* Empty state */}
            {!selectedTipoOs && (
                <Card className="border-dashed">
                    <CardContent className="py-12 text-center">
                        <Timer className="h-12 w-12 mx-auto text-muted-foreground/40 mb-4" />
                        <p className="text-muted-foreground">
                            Selecione um tipo de OS acima para visualizar e editar os prazos das etapas
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Dialog de confirmação de reset */}
            <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Restaurar prazos padrão?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Esta ação irá definir o prazo de <strong>todas as etapas</strong> deste tipo de OS
                            para <strong>2 dias úteis</strong>. Esta ação não pode ser desfeita.
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
