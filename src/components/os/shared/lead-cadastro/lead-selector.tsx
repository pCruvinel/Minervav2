"use client";

/**
 * LeadSelector - Combobox de seleção de lead
 * 
 * Componente para buscar e selecionar um lead existente ou criar um novo.
 * 
 * @example
 * ```tsx
 * <LeadSelector
 *   selectedLeadId={leadId}
 *   onSelectLead={(id, data) => handleSelect(id, data)}
 *   onCreateNew={() => setShowDialog(true)}
 * />
 * ```
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, UserPlus, Check, Loader2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useClientes } from '@/lib/hooks/use-clientes';
import { logger } from '@/lib/utils/logger';

interface LeadSelectorProps {
    /** ID do lead selecionado */
    selectedLeadId?: string;

    /** Callback quando um lead é selecionado */
    onSelectLead: (leadId: string, leadData?: any) => void;

    /** Callback quando "Criar novo" é clicado */
    onCreateNew: () => void;

    /** Se está desabilitado */
    disabled?: boolean;

    /** Placeholder do botão */
    placeholder?: string;

    /** Filtro de status para busca (ex: 'LEAD', ['LEAD', 'ATIVO']) */
    statusFilter?: string | string[];
}

export function LeadSelector({
    selectedLeadId,
    onSelectLead,
    onCreateNew,
    disabled = false,
    placeholder = "Buscar por nome, CPF ou CNPJ...",
    statusFilter = 'LEAD',
}: LeadSelectorProps) {
    const [open, setOpen] = useState(false);

    // Buscar leads do banco com filtro
    const { clientes: leads, loading, error, refetch } = useClientes(
        statusFilter ? { status: statusFilter } : 'LEAD'
    );

    // Lead selecionado
    const selectedLead = leads?.find(l => l.id === selectedLeadId);

    const handleSelectLead = (lead: any) => {
        try {
            logger.log('🎯 Selecionando lead:', lead.id);

            if (!lead || !lead.id) {
                logger.error('❌ Lead inválido:', lead);
                return;
            }

            onSelectLead(lead.id, lead);

            // Fechar popover após seleção
            setTimeout(() => setOpen(false), 50);

            logger.log('✅ Lead selecionado:', lead.nome_razao_social);
        } catch (error) {
            logger.error('❌ Erro ao selecionar lead:', error);
        }
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between focus:ring-0 focus:ring-offset-0"
                    disabled={disabled || loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Carregando leads...
                        </>
                    ) : selectedLead ? (
                        <div className="flex items-center gap-2 truncate flex-1">
                            <Avatar className="h-6 w-6 shrink-0">
                                <AvatarFallback className="text-xs">
                                    {selectedLead.nome_razao_social?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{selectedLead.nome_razao_social}</span>
                            {selectedLead.status && (
                                <Badge
                                    variant={selectedLead.status === 'ativo' ? 'success' : 'secondary'}
                                    className="text-[10px] h-5 px-1 ml-auto"
                                >
                                    {selectedLead.status === 'ativo' ? 'CLIENTE' : 'LEAD'}
                                </Badge>
                            )}
                        </div>
                    ) : (
                        placeholder
                    )}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent
                className="p-0"
                align="start"
                style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
                <Command>
                    <CommandInput
                        placeholder="Buscar por nome, CPF ou CNPJ..."
                        className="focus:ring-0 focus:outline-none"
                    />

                    <CommandEmpty>
                        <div className="py-6 text-center text-sm text-muted-foreground">
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Carregando leads...
                                </div>
                            ) : error ? (
                                <div className="space-y-2">
                                    <p className="text-destructive">Erro ao carregar leads</p>
                                    <Button variant="outline" size="sm" onClick={() => refetch()}>
                                        Tentar novamente
                                    </Button>
                                </div>
                            ) : (
                                'Nenhum lead encontrado.'
                            )}
                        </div>
                    </CommandEmpty>

                    <CommandList>
                        <CommandGroup>
                            {leads?.map((lead) => {
                                if (!lead?.id || !lead?.nome_razao_social) return null;

                                return (
                                    <CommandItem
                                        key={lead.id}
                                        value={`${lead.nome_razao_social} ${lead.cpf_cnpj || ''}`}
                                        onSelect={() => handleSelectLead(lead)}
                                        className="flex items-center gap-2 px-3 py-2"
                                    >
                                        <Avatar className="h-8 w-8">
                                            <AvatarFallback>
                                                {lead.nome_razao_social?.substring(0, 2).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-medium truncate flex items-center gap-2">
                                                <span>{lead.nome_razao_social}</span>
                                                {lead.status && (
                                                    <Badge
                                                        variant={lead.status === 'ativo' ? 'success' : 'secondary'}
                                                        className="text-[10px] h-5 px-1"
                                                    >
                                                        {lead.status === 'ativo' ? 'CLIENTE' : 'LEAD'}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-muted-foreground truncate">
                                                {lead.cpf_cnpj || 'Sem CPF/CNPJ'} • {lead.telefone || 'Sem telefone'}
                                            </div>
                                        </div>
                                        <Check
                                            className={cn(
                                                "h-4 w-4 shrink-0",
                                                selectedLeadId === lead.id ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>

                    {/* Footer fixo com botão Criar Novo */}
                    <div className="border-t bg-white p-2">
                        <Button
                            variant="ghost"
                            className="w-full justify-start text-sm"
                            onClick={() => {
                                setOpen(false);
                                onCreateNew();
                            }}
                        >
                            <UserPlus className="h-4 w-4 mr-2" />
                            Criar novo cliente
                        </Button>
                    </div>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
