/**
 * ============================================================================
 * StepResponsibilityHeader
 * ============================================================================
 * 
 * Componente para exibir informações de responsabilidade no cabeçalho da etapa.
 * Mostra setor, responsável atual e botão de delegação (se aplicável).
 * 
 * @example
 * ```tsx
 * <StepResponsibilityHeader
 *   stepNumber={1}
 *   stepTitle="Identifique o Lead"
 *   setor="administrativo"
 *   setorNome="Administrativo"
 *   responsavelNome="João Silva"
 *   responsavelCargo="Coord. Administrativo"
 *   canDelegate={true}
 *   onDelegate={() => setDelegacaoModalOpen(true)}
 * />
 * ```
 * 
 * @module step-responsibility-header
 * @author Minerva ERP
 */

'use client';

import { Building2, User, UserCheck, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { StepResponsibilityHeaderProps } from '@/lib/types/os-responsabilidade';

/**
 * Componente compacto de info de responsabilidade para exibir inline
 */
export function StepResponsibilityInfo({
    setor,
    responsavel,
    responsavelCargo,
    isDelegado,
    compact = false,
}: {
    setor: string;
    responsavel: string;
    responsavelCargo?: string;
    isDelegado?: boolean;
    compact?: boolean;
}) {
    if (compact) {
        return (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Setor: {setor}</span>
                <span>•</span>
                <span>
                    Responsável: {responsavel}
                    {isDelegado && <span className="text-primary ml-1">(delegado)</span>}
                </span>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span>Setor:</span>
                <span className="font-medium text-foreground">{setor}</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
                {isDelegado ? (
                    <UserCheck className="h-3.5 w-3.5 text-primary" />
                ) : (
                    <User className="h-3.5 w-3.5" />
                )}
                <span>Responsável:</span>
                <span className="font-medium text-foreground">
                    {responsavel}
                    {responsavelCargo && (
                        <span className="text-muted-foreground ml-1">({responsavelCargo})</span>
                    )}
                </span>
                {isDelegado && (
                    <Badge variant="secondary" className="ml-1 text-xs">
                        Delegado
                    </Badge>
                )}
            </div>
        </div>
    );
}

/**
 * Cabeçalho completo de responsabilidade para etapa
 */
export function StepResponsibilityHeader({
    stepNumber,
    stepTitle,
    setor,
    setorNome,
    responsavelId,
    responsavelNome,
    responsavelCargo,
    responsavelAvatar,
    isDelegado = false,
    isCompleted,
    isCurrent,
    canEdit,
    canDelegate,
    onDelegate,
}: StepResponsibilityHeaderProps) {
    return (
        <div className="flex flex-col gap-2">
            {/* Título da Etapa */}
            <div className="flex items-center gap-2">
                <span className="font-medium">
                    Etapa {stepNumber}: {stepTitle}
                </span>
                {!canEdit && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger>
                                <Badge variant="outline" className="text-xs">
                                    Somente leitura
                                </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Você não tem permissão para editar esta etapa</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>

            {/* Info de Responsabilidade */}
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    {/* Avatar do responsável */}
                    <Avatar className="h-8 w-8">
                        <AvatarImage src={responsavelAvatar} alt={responsavelNome} />
                        <AvatarFallback className="text-xs">
                            {responsavelNome
                                ?.split(' ')
                                .map((n) => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase()}
                        </AvatarFallback>
                    </Avatar>

                    {/* Setor e Responsável */}
                    <StepResponsibilityInfo
                        setor={setorNome}
                        responsavel={responsavelNome}
                        responsavelCargo={responsavelCargo}
                        isDelegado={isDelegado}
                    />
                </div>

                {/* Botão de Delegação */}
                {canDelegate && onDelegate && !isCompleted && (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelegate();
                                    }}
                                    className="text-primary hover:text-primary/80"
                                >
                                    <RefreshCw className="h-4 w-4 mr-1" />
                                    Delegar
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Delegar esta etapa para outro colaborador do setor</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                )}
            </div>
        </div>
    );
}

/**
 * Versão simplificada para uso no AccordionTrigger
 */
export function StepResponsibilityBadge({
    setorNome,
    responsavelNome,
    isDelegado,
}: {
    setorNome: string;
    responsavelNome: string;
    isDelegado?: boolean;
}) {
    return (
        <span className="text-xs text-muted-foreground">
            {setorNome} • {responsavelNome}
            {isDelegado && ' (delegado)'}
        </span>
    );
}

export default StepResponsibilityHeader;
