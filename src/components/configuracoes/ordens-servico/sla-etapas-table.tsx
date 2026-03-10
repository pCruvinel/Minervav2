/**
 * SlaEtapasTable - Tabela editável de etapas com prazos
 *
 * Exibe uma tabela com todas as etapas de um tipo de OS,
 * permitindo edição inline dos prazos em dias úteis.
 *
 * @example
 * ```tsx
 * <SlaEtapasTable
 *   etapas={etapas}
 *   onPrazoChange={(id, valor) => handleChange(id, valor)}
 *   isLoading={isLoading}
 * />
 * ```
 */
'use client';

import { useState, useCallback } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, Building2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EtapaConfig } from '@/lib/hooks/use-sla-config';
import { Switch } from '@/components/ui/switch';
import { FileCheck } from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface PrazoAlterado {
    id: string;
    valorOriginal: number;
    valorNovo: number;
}

interface SlaEtapasTableProps {
    etapas: EtapaConfig[];
    isLoading: boolean;
    onPrazosChange: (alteracoes: PrazoAlterado[]) => void;
    onAprovacaoChange: (id: string, valor: boolean) => void;
    alteracoesPendentes: PrazoAlterado[];
}

// ============================================================
// COMPONENTE
// ============================================================

export function SlaEtapasTable({
    etapas,
    isLoading,
    onPrazosChange,
    onAprovacaoChange,
    alteracoesPendentes,
}: SlaEtapasTableProps) {
    // Map para valores locais de edição
    const [localValues, setLocalValues] = useState<Record<string, string>>({});

    // Handler de mudança de input
    const handleInputChange = useCallback((etapaId: string, valorOriginal: number, valorInput: string) => {
        // Atualizar valor local do input
        setLocalValues(prev => ({ ...prev, [etapaId]: valorInput }));

        // Converter para número
        const valorNumero = parseInt(valorInput, 10);

        // Validar
        if (isNaN(valorNumero) || valorNumero < 1 || valorNumero > 365) {
            return;
        }

        // Atualizar alterações pendentes
        const novaAlteracao: PrazoAlterado = {
            id: etapaId,
            valorOriginal,
            valorNovo: valorNumero,
        };

        // Verificar se já existe alteração para esta etapa
        const alteracoesAtuais = [...alteracoesPendentes];
        const indexExistente = alteracoesAtuais.findIndex(a => a.id === etapaId);

        if (valorNumero === valorOriginal) {
            // Se voltou ao valor original, remover da lista
            if (indexExistente >= 0) {
                alteracoesAtuais.splice(indexExistente, 1);
            }
        } else {
            // Adicionar ou atualizar
            if (indexExistente >= 0) {
                alteracoesAtuais[indexExistente] = novaAlteracao;
            } else {
                alteracoesAtuais.push(novaAlteracao);
            }
        }

        onPrazosChange(alteracoesAtuais);
    }, [alteracoesPendentes, onPrazosChange]);

    // Verificar se etapa foi alterada
    const foiAlterada = useCallback((etapaId: string) => {
        return alteracoesPendentes.some(a => a.id === etapaId);
    }, [alteracoesPendentes]);

    // Obter valor do input (local ou original)
    const getInputValue = useCallback((etapa: EtapaConfig) => {
        if (localValues[etapa.id] !== undefined) {
            return localValues[etapa.id];
        }
        const alteracao = alteracoesPendentes.find(a => a.id === etapa.id);
        if (alteracao) {
            return alteracao.valorNovo.toString();
        }
        return etapa.prazo_dias_uteis.toString();
    }, [localValues, alteracoesPendentes]);

    // Loading state
    if (isLoading) {
        return (
            <div className="rounded-lg border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-16">#</TableHead>
                            <TableHead>Etapa</TableHead>
                            <TableHead className="w-32">Prazo (dias)</TableHead>
                            <TableHead className="w-40">Setor</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <TableRow key={i}>
                                <TableCell><Skeleton className="h-4 w-8" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                                <TableCell><Skeleton className="h-8 w-20" /></TableCell>
                                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        );
    }

    // Empty state
    if (etapas.length === 0) {
        return (
            <div className="rounded-lg border p-8 text-center">
                <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                    Selecione um tipo de OS para visualizar as etapas
                </p>
            </div>
        );
    }

    return (
        <div className="rounded-lg border">
            <Table>
                <TableHeader>
                    <TableRow className="bg-muted/50">
                        <TableHead className="w-16 font-semibold">#</TableHead>
                        <TableHead className="font-semibold">Etapa</TableHead>
                        <TableHead className="w-36 font-semibold">
                            <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Prazo (dias)
                            </div>
                        </TableHead>
                        <TableHead className="w-40 font-semibold">
                            <div className="flex items-center gap-2">
                                <FileCheck className="h-4 w-4" />
                                Aprovação?
                            </div>
                        </TableHead>
                        <TableHead className="w-44 font-semibold">
                            <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4" />
                                Setor
                            </div>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {etapas.map((etapa) => (
                        <TableRow
                            key={etapa.id}
                            className={cn(
                                'transition-colors',
                                foiAlterada(etapa.id) && 'bg-warning/5 border-l-2 border-l-warning'
                            )}
                        >
                            <TableCell className="font-mono text-muted-foreground">
                                {etapa.etapa_numero}
                            </TableCell>
                            <TableCell>
                                <div className="flex flex-col">
                                    <span className="font-medium">{etapa.etapa_nome}</span>
                                    {etapa.etapa_nome_curto && (
                                        <span className="text-xs text-muted-foreground">
                                            ({etapa.etapa_nome_curto})
                                        </span>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        max={365}
                                        value={getInputValue(etapa)}
                                        onChange={(e) => handleInputChange(
                                            etapa.id,
                                            etapa.prazo_dias_uteis,
                                            e.target.value
                                        )}
                                        className={cn(
                                            'w-20 h-8 text-center',
                                            foiAlterada(etapa.id) && 'border-warning ring-1 ring-warning/30'
                                        )}
                                    />
                                    {foiAlterada(etapa.id) && (
                                        <Badge variant="outline" className="text-xs bg-warning/10 text-warning border-warning/30">
                                            Alterado
                                        </Badge>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        checked={etapa.requer_aprovacao}
                                        onCheckedChange={(checked) => onAprovacaoChange(etapa.id, checked)}
                                    />
                                    <span className="text-xs text-muted-foreground w-8">
                                        {etapa.requer_aprovacao ? 'Sim' : 'Não'}
                                    </span>
                                </div>
                            </TableCell>
                            <TableCell>
                                {etapa.setor_nome ? (
                                    <Badge variant="secondary" className="font-normal">
                                        {etapa.setor_nome}
                                    </Badge>
                                ) : (
                                    <span className="text-muted-foreground text-sm">-</span>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

            {/* Summary footer */}
            <div className="px-4 py-3 border-t bg-muted/30 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                    Total: {etapas.length} etapas
                </span>
                {alteracoesPendentes.length > 0 && (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30">
                        {alteracoesPendentes.length} alteração(ões) pendente(s)
                    </Badge>
                )}
            </div>
        </div>
    );
}
