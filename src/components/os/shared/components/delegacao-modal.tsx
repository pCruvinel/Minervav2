/**
 * ============================================================================
 * DelegacaoModal
 * ============================================================================
 * 
 * Modal para delegar uma etapa para outro colaborador do mesmo setor.
 * 
 * @example
 * ```tsx
 * <DelegacaoModal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   etapaId={etapaId}
 *   etapaNome="Identifique o Lead"
 *   etapaOrdem={1}
 *   setorSlug="administrativo"
 *   onDelegate={handleDelegate}
 * />
 * ```
 * 
 * @module delegacao-modal
 * @author Minerva ERP
 */

'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Search, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/lib/supabase-client';
import { logger } from '@/lib/utils/logger';
import { cn } from '@/lib/utils';
import { SETOR_NOMES } from '@/lib/types/os-responsabilidade';
import type { DelegacaoModalProps } from '@/lib/types/os-responsabilidade';
import type { SetorSlug } from '@/lib/constants/os-ownership-rules';

interface Colaborador {
    id: string;
    nome: string;
    funcao: string;
    avatar_url?: string;
}

/**
 * Modal de delegação de etapa
 */
export function DelegacaoModal({
    isOpen,
    onClose,
    etapaId: _etapaId,
    etapaNome,
    etapaOrdem,
    setorSlug,
    onDelegate,
    isLoading: externalLoading,
}: DelegacaoModalProps) {
    // Estado
    const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
    const [filteredColaboradores, setFilteredColaboradores] = useState<Colaborador[]>([]);
    const [selectedColaborador, setSelectedColaborador] = useState<string | null>(null);
    const [motivo, setMotivo] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoadingColaboradores, setIsLoadingColaboradores] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Buscar colaboradores do setor
    useEffect(() => {
        if (!isOpen) return;

        const fetchColaboradores = async () => {
            setIsLoadingColaboradores(true);
            try {
                // Buscar colaboradores do setor que têm acesso ao sistema
                const funcoesPorSetor: Record<SetorSlug, string[]> = {
                    administrativo: ['coord_administrativo', 'operacional_admin'],
                    obras: ['coord_obras', 'operacional_obras'],
                    assessoria: ['coord_assessoria', 'operacional_assessoria'],
                };

                const funcoesPermitidas = funcoesPorSetor[setorSlug] || [];

                const { data, error } = await supabase
                    .from('colaboradores')
                    .select('id, nome, funcao, avatar_url')
                    .in('funcao', [...funcoesPermitidas, 'admin', 'diretor'])
                    .eq('ativo', true)
                    .order('nome');

                if (error) throw error;

                setColaboradores(data || []);
                setFilteredColaboradores(data || []);
            } catch (err) {
                logger.error('Erro ao buscar colaboradores:', err);
            } finally {
                setIsLoadingColaboradores(false);
            }
        };

        fetchColaboradores();
    }, [isOpen, setorSlug]);

    // Filtrar por termo de busca
    useEffect(() => {
        if (!searchTerm) {
            setFilteredColaboradores(colaboradores);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredColaboradores(
                colaboradores.filter(
                    (c) =>
                        c.nome.toLowerCase().includes(term) ||
                        c.funcao.toLowerCase().includes(term)
                )
            );
        }
    }, [searchTerm, colaboradores]);

    // Reset ao fechar
    useEffect(() => {
        if (!isOpen) {
            setSelectedColaborador(null);
            setMotivo('');
            setSearchTerm('');
        }
    }, [isOpen]);

    // Handler de submit
    const handleSubmit = async () => {
        if (!selectedColaborador) return;

        setIsSubmitting(true);
        try {
            const success = await onDelegate(selectedColaborador, motivo || undefined);
            if (success) {
                onClose();
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const isLoading = externalLoading || isSubmitting;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <RefreshCw className="h-5 w-5 text-primary" />
                        Delegar Etapa
                    </DialogTitle>
                    <DialogDescription>
                        Delegue a <strong>Etapa {etapaOrdem}: {etapaNome}</strong> para outro
                        colaborador do setor <Badge variant="outline">{SETOR_NOMES[setorSlug]}</Badge>.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Busca */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder="Buscar colaborador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    {/* Lista de colaboradores */}
                    <div className="space-y-2">
                        <Label>Selecione o responsável</Label>
                        {isLoadingColaboradores ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : filteredColaboradores.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                Nenhum colaborador encontrado
                            </div>
                        ) : (
                            <ScrollArea className="h-[200px] rounded-md border p-2">
                                <RadioGroup
                                    value={selectedColaborador || ''}
                                    onValueChange={setSelectedColaborador}
                                >
                                    {filteredColaboradores.map((colaborador) => (
                                        <label
                                            key={colaborador.id}
                                            htmlFor={colaborador.id}
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg p-3 cursor-pointer transition-colors',
                                                'hover:bg-muted/50',
                                                selectedColaborador === colaborador.id && 'bg-primary/10 border border-primary/30'
                                            )}
                                        >
                                            <RadioGroupItem value={colaborador.id} id={colaborador.id} />
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={colaborador.avatar_url} alt={colaborador.nome} />
                                                <AvatarFallback className="text-xs">
                                                    {colaborador.nome
                                                        .split(' ')
                                                        .map((n) => n[0])
                                                        .slice(0, 2)
                                                        .join('')
                                                        .toUpperCase()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium text-sm truncate">{colaborador.nome}</p>
                                                <p className="text-xs text-muted-foreground truncate">
                                                    {colaborador.funcao.replace(/_/g, ' ')}
                                                </p>
                                            </div>
                                        </label>
                                    ))}
                                </RadioGroup>
                            </ScrollArea>
                        )}
                    </div>

                    {/* Motivo (opcional) */}
                    <div className="space-y-2">
                        <Label htmlFor="motivo">Motivo (opcional)</Label>
                        <Textarea
                            id="motivo"
                            placeholder="Descreva o motivo da delegação..."
                            value={motivo}
                            onChange={(e) => setMotivo(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedColaborador || isLoading}
                    >
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Confirmar Delegação
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DelegacaoModal;
