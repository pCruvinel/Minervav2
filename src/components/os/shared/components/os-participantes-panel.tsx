/**
 * ============================================================================
 * OSParticipantesPanel
 * ============================================================================
 * 
 * Painel para gerenciar participantes de uma OS.
 * Exibe lista de participantes e permite adicionar/remover (se tiver permissão).
 * 
 * @example
 * ```tsx
 * <OSParticipantesPanel
 *   osId={osId}
 *   participantes={participantes}
 *   canManage={true}
 *   onAddParticipante={handleAdd}
 *   onRemoveParticipante={handleRemove}
 * />
 * ```
 * 
 * @module os-participantes-panel
 * @author Minerva ERP
 */

'use client';

import { useState } from 'react';
import {
    Users,
    UserPlus,
    Trash2,
    Eye,
    Edit3,
    Crown,
    Loader2,
    MoreVertical,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { cn } from '@/lib/utils';
import type { OSParticipante, OSParticipantesPanelProps, PapelParticipante } from '@/lib/types/os-responsabilidade';
import { PAPEL_LABELS } from '@/lib/types/os-responsabilidade';

// Ícones para cada papel
const PAPEL_ICONS: Record<PapelParticipante, React.ReactNode> = {
    responsavel: <Crown className="h-3.5 w-3.5 text-amber-500" />,
    participante: <Edit3 className="h-3.5 w-3.5 text-primary" />,
    observador: <Eye className="h-3.5 w-3.5 text-muted-foreground" />,
};

// Cores para badges de papel
const PAPEL_VARIANTS: Record<PapelParticipante, 'default' | 'secondary' | 'outline'> = {
    responsavel: 'default',
    participante: 'secondary',
    observador: 'outline',
};

/**
 * Card individual de participante
 */
function ParticipanteCard({
    participante,
    canManage,
    onRemove,
    isRemoving,
}: {
    participante: OSParticipante;
    canManage: boolean;
    onRemove: () => void;
    isRemoving: boolean;
}) {
    const [confirmRemove, setConfirmRemove] = useState(false);

    const handleRemove = () => {
        setConfirmRemove(false);
        onRemove();
    };

    return (
        <>
            <div className={cn(
                'flex items-center gap-3 p-3 rounded-lg border bg-card',
                'transition-colors hover:bg-muted/30'
            )}>
                {/* Avatar */}
                <Avatar className="h-10 w-10">
                    <AvatarImage src={participante.colaborador_avatar} alt={participante.colaborador_nome} />
                    <AvatarFallback className="text-sm">
                        {participante.colaborador_nome
                            .split(' ')
                            .map((n) => n[0])
                            .slice(0, 2)
                            .join('')
                            .toUpperCase()}
                    </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">
                            {participante.colaborador_nome}
                        </span>
                        <Badge variant={PAPEL_VARIANTS[participante.papel]} className="text-xs">
                            {PAPEL_ICONS[participante.papel]}
                            <span className="ml-1">{PAPEL_LABELS[participante.papel]}</span>
                        </Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{participante.colaborador_cargo?.replace(/_/g, ' ')}</span>
                        {participante.setor_nome && (
                            <>
                                <span>•</span>
                                <span>{participante.setor_nome}</span>
                            </>
                        )}
                    </div>
                    {participante.etapas_permitidas && participante.etapas_permitidas.length > 0 && (
                        <div className="text-xs text-muted-foreground mt-1">
                            Etapas: {participante.etapas_permitidas.join(', ')}
                        </div>
                    )}
                </div>

                {/* Ações */}
                {canManage && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                {isRemoving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <MoreVertical className="h-4 w-4" />
                                )}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem
                                onClick={() => setConfirmRemove(true)}
                                className="text-destructive focus:text-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Remover
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>

            {/* Dialog de confirmação */}
            <AlertDialog open={confirmRemove} onOpenChange={setConfirmRemove}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover participante?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover <strong>{participante.colaborador_nome}</strong> desta OS?
                            Esta ação pode ser desfeita adicionando-o novamente.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={handleRemove} className="bg-destructive text-destructive-foreground">
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

/**
 * Painel principal de participantes
 */
export function OSParticipantesPanel({
    osId,
    participantes,
    canManage,
    onAddParticipante,
    onRemoveParticipante,
    isLoading,
}: OSParticipantesPanelProps) {
    const [removingId, setRemovingId] = useState<string | null>(null);

    const handleRemove = async (participanteId: string) => {
        setRemovingId(participanteId);
        try {
            await onRemoveParticipante(participanteId);
        } finally {
            setRemovingId(null);
        }
    };

    // Agrupar por papel
    const responsaveis = participantes.filter((p) => p.papel === 'responsavel');
    const outros = participantes.filter((p) => p.papel !== 'responsavel');

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="text-base flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            Participantes
                        </CardTitle>
                        <CardDescription>
                            {participantes.length} participante{participantes.length !== 1 ? 's' : ''} nesta OS
                        </CardDescription>
                    </div>
                    {canManage && (
                        <Button variant="outline" size="sm" disabled>
                            <UserPlus className="h-4 w-4 mr-2" />
                            Adicionar
                        </Button>
                    )}
                </div>
            </CardHeader>

            <CardContent className="space-y-4">
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                ) : participantes.length === 0 ? (
                    <div className="py-8 text-center text-sm text-muted-foreground">
                        Nenhum participante adicional nesta OS.
                        <br />
                        Os coordenadores de cada setor são os responsáveis padrão.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {/* Responsáveis primeiro */}
                        {responsaveis.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                    Responsáveis
                                </h4>
                                {responsaveis.map((p) => (
                                    <ParticipanteCard
                                        key={p.id}
                                        participante={p}
                                        canManage={canManage}
                                        onRemove={() => handleRemove(p.id)}
                                        isRemoving={removingId === p.id}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Outros participantes */}
                        {outros.length > 0 && (
                            <div className="space-y-2">
                                {responsaveis.length > 0 && (
                                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                        Participantes
                                    </h4>
                                )}
                                {outros.map((p) => (
                                    <ParticipanteCard
                                        key={p.id}
                                        participante={p}
                                        canManage={canManage}
                                        onRemove={() => handleRemove(p.id)}
                                        isRemoving={removingId === p.id}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default OSParticipantesPanel;
