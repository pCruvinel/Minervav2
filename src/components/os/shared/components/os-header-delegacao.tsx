/**
 * ============================================================================
 * OSHeaderDelegacao
 * ============================================================================
 * 
 * Componente para delegação centralizada no header da OS.
 * Permite que coordenadores selecionem um responsável e múltiplas etapas
 * para delegar de uma só vez.
 * 
 * @example
 * ```tsx
 * <OSHeaderDelegacao
 *   osId={osId}
 *   tipoOS="OS-08"
 *   steps={steps}
 *   onDelegationChange={() => refetch()}
 * />
 * ```
 * 
 * @module os-header-delegacao
 * @author Minerva ERP
 */

'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Loader2, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { supabase } from '@/lib/supabase-client';
import { useAuth } from '@/lib/contexts/auth-context';
import { logger } from '@/lib/utils/logger';
import { toast } from '@/lib/utils/safe-toast';
import { cn } from '@/lib/utils';
import { SETOR_NOMES } from '@/lib/types/os-responsabilidade';
import type { SetorSlug } from '@/lib/constants/os-ownership-rules';
import type { WorkflowStepDefinition } from './workflow-accordion';

// ============================================================================
// TYPES
// ============================================================================

interface Colaborador {
    id: string;
    nome: string;
    funcao: string;
    avatar_url?: string;
}

interface OSHeaderDelegacaoProps {
    /** ID da OS */
    osId: string;
    /** Tipo da OS (ex: 'OS-08') - usado para determinar etapas se não fornecidas */
    tipoOS?: string;
    /** Lista de etapas do workflow (opcional - se não fornecido, busca do banco) */
    steps?: WorkflowStepDefinition[];
    /** Callback após delegação bem-sucedida */
    onDelegationChange?: () => void;
}

// Mapa de funções por setor
const FUNCOES_POR_SETOR: Record<SetorSlug, string[]> = {
    administrativo: ['coord_administrativo', 'operacional_admin'],
    obras: ['coord_obras', 'operacional_obras'],
    assessoria: ['coord_assessoria', 'operacional_assessoria'],
};

// Mapa de cargo para setor
const CARGO_TO_SETOR: Record<string, SetorSlug> = {
    coord_administrativo: 'administrativo',
    gestor_administrativo: 'administrativo',
    operacional_admin: 'administrativo',
    coord_obras: 'obras',
    gestor_obras: 'obras',
    operacional_obras: 'obras',
    coord_assessoria: 'assessoria',
    gestor_assessoria: 'assessoria',
    operacional_assessoria: 'assessoria',
    admin: 'administrativo', // Admin vê administrativo por padrão
    diretoria: 'administrativo', // Diretoria vê administrativo por padrão
};

// ============================================================================
// COMPONENT
// ============================================================================

export function OSHeaderDelegacao({
    osId,
    tipoOS: _tipoOS, // eslint-disable-line @typescript-eslint/no-unused-vars
    steps: propSteps,
    onDelegationChange,
}: OSHeaderDelegacaoProps) {
    // Estado
    const [isOpen, setIsOpen] = useState(false);
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [selectedColaborador, setSelectedColaborador] = useState<string>('');
    const [selectedEtapas, setSelectedEtapas] = useState<number[]>([]);
    const [isLoadingColaboradores, setIsLoadingColaboradores] = useState(false);
    const [isLoadingEtapas, setIsLoadingEtapas] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [delegacoesAtuais, setDelegacoesAtuais] = useState<Record<number, string>>({});
    const [fetchedSteps, setFetchedSteps] = useState<WorkflowStepDefinition[]>([]);

    // Usar steps fornecidos ou os buscados do banco
    const steps = propSteps || fetchedSteps;

    // Auth
    const { currentUser } = useAuth();

    // Detectar setor do usuário
    const userSetor = useMemo<SetorSlug | null>(() => {
        if (!currentUser?.cargo_slug) return null;
        return CARGO_TO_SETOR[currentUser.cargo_slug] || null;
    }, [currentUser?.cargo_slug]);

    // Verificar se usuário pode delegar (coordenador, admin ou diretoria)
    const canDelegate = useMemo(() => {
        if (!currentUser?.cargo_slug) return false;
        const cargo = currentUser.cargo_slug;
        return (
            cargo.startsWith('coord_') ||
            cargo.startsWith('gestor') ||
            cargo === 'admin' ||
            cargo === 'diretoria' ||
            currentUser.pode_delegar === true
        );
    }, [currentUser?.cargo_slug, currentUser?.pode_delegar]);

    // Filtrar etapas do setor do usuário
    const etapasDoSetor = useMemo(() => {
        if (!userSetor) return [];
        return steps.filter(step => step.setor === userSetor);
    }, [steps, userSetor]);

    // Buscar etapas do banco se não fornecidas via props
    useEffect(() => {
        if (propSteps || !osId) return;

        const fetchEtapas = async () => {
            setIsLoadingEtapas(true);
            try {
                const { data, error } = await supabase
                    .from('os_etapas')
                    .select('id, ordem, nome_etapa, setor')
                    .eq('os_id', osId)
                    .order('ordem');

                if (error) throw error;

                // Converter para WorkflowStepDefinition
                const converted: WorkflowStepDefinition[] = (data || []).map((e: { id: string; ordem: number; nome_etapa: string; setor: string }) => ({
                    id: e.ordem,
                    title: e.nome_etapa,
                    setor: e.setor as 'administrativo' | 'obras' | 'assessoria',
                }));

                setFetchedSteps(converted);
            } catch (err) {
                logger.error('Erro ao buscar etapas:', err);
            } finally {
                setIsLoadingEtapas(false);
            }
        };

        fetchEtapas();
    }, [osId, propSteps]);

    // Buscar colaboradores do setor
    useEffect(() => {
        if (!isOpen || !userSetor) return;

        const fetchColaboradores = async () => {
            setIsLoadingColaboradores(true);
            try {
                const funcoesPermitidas = FUNCOES_POR_SETOR[userSetor] || [];

                const { data, error } = await supabase
                    .from('colaboradores')
                    .select('id, nome, funcao, avatar_url')
                    .in('funcao', [...funcoesPermitidas, 'admin', 'diretor'])
                    .eq('ativo', true)
                    .order('nome');

                if (error) throw error;
                setColaboradores(data || []);
            } catch (err) {
                logger.error('Erro ao buscar colaboradores:', err);
            } finally {
                setIsLoadingColaboradores(false);
            }
        };

        fetchColaboradores();
    }, [isOpen, userSetor]);

    // Buscar delegações atuais
    useEffect(() => {
        if (!osId) return;

        const fetchDelegacoes = async () => {
            try {
                // Buscar etapas da OS
                const { data: etapas, error: etapasError } = await supabase
                    .from('os_etapas')
                    .select('id, ordem')
                    .eq('os_id', osId);

                if (etapasError) throw etapasError;

                if (!etapas?.length) return;

                // Buscar delegações ativas
                const { data: delegacoes, error: delegError } = await supabase
                    .from('os_etapas_responsavel')
                    .select(`
            etapa_id,
            responsavel:colaboradores!os_etapas_responsavel_responsavel_id_fkey(nome_completo)
          `)
                    .in('etapa_id', etapas.map(e => e.id))
                    .eq('ativo', true);

                if (delegError) throw delegError;

                // Mapear ordem -> nome do responsável
                const delegMap: Record<number, string> = {};
                delegacoes?.forEach(d => {
                    const etapa = etapas.find(e => e.id === d.etapa_id);
                    if (etapa && d.responsavel) {
                        try {
                            const resp = d.responsavel as unknown as { nome_completo: string } | { nome_completo: string }[];
                            const nome = Array.isArray(resp) ? resp[0]?.nome_completo : resp.nome_completo;
                            if (nome) delegMap[etapa.ordem] = nome;
                        } catch (e) {
                            console.warn('Erro ao processar responsável:', e);
                        }
                    }
                });

                setDelegacoesAtuais(delegMap);
            } catch (err) {
                logger.error('Erro ao buscar delegações:', err);
            }
        };

        fetchDelegacoes();
    }, [osId]);

    // Toggle etapa
    const handleToggleEtapa = useCallback((etapaId: number) => {
        setSelectedEtapas(prev =>
            prev.includes(etapaId)
                ? prev.filter(id => id !== etapaId)
                : [...prev, etapaId]
        );
    }, []);

    // Selecionar todas do setor
    const handleSelectAll = useCallback(() => {
        const todasIds = etapasDoSetor.map(e => e.id);
        setSelectedEtapas(
            selectedEtapas.length === todasIds.length ? [] : todasIds
        );
    }, [etapasDoSetor, selectedEtapas.length]);

    // Confirmar delegação
    const handleConfirmDelegacao = async () => {
        if (!selectedColaborador || selectedEtapas.length === 0 || !currentUser?.id) {
            toast.error('Selecione um responsável e pelo menos uma etapa');
            return;
        }

        setIsSubmitting(true);
        try {
            // Buscar IDs das etapas no banco
            const { data: etapasDB, error: etapasError } = await supabase
                .from('os_etapas')
                .select('id, ordem')
                .eq('os_id', osId)
                .in('ordem', selectedEtapas);

            if (etapasError) throw etapasError;

            if (!etapasDB?.length) {
                toast.error('Etapas não encontradas no banco');
                return;
            }

            // Desativar delegações anteriores
            const etapaIds = etapasDB.map(e => e.id);
            await supabase
                .from('os_etapas_responsavel')
                .update({ ativo: false })
                .in('etapa_id', etapaIds);

            // Criar novas delegações
            const delegacoes = etapasDB.map(etapa => ({
                etapa_id: etapa.id,
                responsavel_id: selectedColaborador,
                delegado_por_id: currentUser.id,
                ativo: true,
            }));

            const { error: insertError } = await supabase
                .from('os_etapas_responsavel')
                .insert(delegacoes);

            if (insertError) throw insertError;

            // Buscar nome do colaborador para exibir
            const colab = colaboradores.find(c => c.id === selectedColaborador);
            const nomeColab = colab?.nome || 'Colaborador';

            toast.success(
                `${selectedEtapas.length} etapa(s) delegada(s) para ${nomeColab}`
            );

            // Reset
            setSelectedEtapas([]);
            setSelectedColaborador('');
            setIsOpen(false);

            // Callback
            onDelegationChange?.();

            // Refresh delegações atuais
            const newDelegMap = { ...delegacoesAtuais };
            selectedEtapas.forEach(ordem => {
                newDelegMap[ordem] = nomeColab;
            });
            setDelegacoesAtuais(newDelegMap);
        } catch (err) {
            logger.error('Erro ao delegar etapas:', err);
            toast.error('Erro ao delegar etapas');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Renderização condicional
    if (!canDelegate || !userSetor || etapasDoSetor.length === 0) {
        return null;
    }

    const delegacoesCount = Object.keys(delegacoesAtuais).length;

    return (
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <div className="border border-border rounded-lg bg-muted/30 mt-4">
                <CollapsibleTrigger asChild>
                    <Button
                        variant="ghost"
                        className="w-full justify-between p-4 h-auto hover:bg-muted/50"
                    >
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-primary" />
                            <span className="font-medium">Delegação</span>
                            <Badge variant="outline" className="ml-2">
                                Setor: {SETOR_NOMES[userSetor]}
                            </Badge>
                            {delegacoesCount > 0 && (
                                <Badge variant="secondary" className="ml-1">
                                    {delegacoesCount} etapa(s) delegada(s)
                                </Badge>
                            )}
                        </div>
                        <ChevronDown
                            className={cn(
                                'h-4 w-4 transition-transform',
                                isOpen && 'rotate-180'
                            )}
                        />
                    </Button>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <div className="px-4 pb-4 space-y-4 border-t border-border/50 pt-4">
                        {/* Seletor de Colaborador */}
                        <div className="space-y-2">
                            <Label>Selecione o Responsável</Label>
                            {isLoadingColaboradores ? (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Carregando colaboradores...
                                </div>
                            ) : (
                                <Select
                                    value={selectedColaborador}
                                    onValueChange={setSelectedColaborador}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione um colaborador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {colaboradores.map((colab) => (
                                            <SelectItem key={colab.id} value={colab.id}>
                                                <div className="flex items-center gap-2">
                                                    <Avatar className="h-6 w-6">
                                                        <AvatarImage src={colab.avatar_url} />
                                                        <AvatarFallback className="text-xs">
                                                            {colab.nome
                                                                .split(' ')
                                                                .map((n) => n[0])
                                                                .slice(0, 2)
                                                                .join('')
                                                                .toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <span>{colab.nome}</span>
                                                    <span className="text-muted-foreground text-xs">
                                                        ({colab.funcao.replace(/_/g, ' ')})
                                                    </span>
                                                </div>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        {/* Seletor de Etapas */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Selecione as Etapas</Label>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={handleSelectAll}
                                >
                                    {selectedEtapas.length === etapasDoSetor.length
                                        ? 'Desmarcar Todas'
                                        : 'Selecionar Todas'}
                                </Button>
                            </div>
                            <ScrollArea className="h-[150px] rounded-md border p-3">
                                <div className="space-y-2">
                                    {etapasDoSetor.map((etapa) => {
                                        const delegadoPara = delegacoesAtuais[etapa.id];
                                        return (
                                            <label
                                                key={etapa.id}
                                                className={cn(
                                                    'flex items-center gap-3 p-2 rounded-md cursor-pointer transition-colors',
                                                    'hover:bg-muted/50',
                                                    selectedEtapas.includes(etapa.id) && 'bg-primary/10'
                                                )}
                                            >
                                                <Checkbox
                                                    checked={selectedEtapas.includes(etapa.id)}
                                                    onCheckedChange={() => handleToggleEtapa(etapa.id)}
                                                />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">
                                                        Etapa {etapa.id}: {etapa.title}
                                                    </p>
                                                    {delegadoPara && (
                                                        <p className="text-xs text-primary">
                                                            Delegado para: {delegadoPara}
                                                        </p>
                                                    )}
                                                </div>
                                            </label>
                                        );
                                    })}
                                </div>
                            </ScrollArea>
                        </div>

                        {/* Botão Confirmar */}
                        <div className="flex justify-end pt-2">
                            <Button
                                onClick={handleConfirmDelegacao}
                                disabled={
                                    !selectedColaborador ||
                                    selectedEtapas.length === 0 ||
                                    isSubmitting
                                }
                                className="gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Delegando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4" />
                                        Confirmar Delegação ({selectedEtapas.length} etapa
                                        {selectedEtapas.length !== 1 ? 's' : ''})
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </CollapsibleContent>
            </div>
        </Collapsible>
    );
}

export default OSHeaderDelegacao;
