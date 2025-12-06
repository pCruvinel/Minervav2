/**
 * ============================================================================
 * MODAL DE DELEGAÇÃO DE RESPONSABILIDADE
 * ============================================================================
 * 
 * Modal que aparece quando é necessário delegar responsabilidade de uma OS
 * para outro colaborador durante a transição de etapas.
 * 
 * @module delegation-modal
 * @author Minerva ERP
 */

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, UserPlus, ArrowRight, AlertCircle, Building2 } from 'lucide-react';
import { useDelegation, EligibleDelegate } from '@/lib/hooks/use-delegation';
import { HandoffPoint, CargoSlug } from '@/lib/constants/os-ownership-rules';

// ============================================================================
// TIPOS
// ============================================================================

interface DelegationModalProps {
    /** Se o modal está aberto */
    isOpen: boolean;
    /** Callback para fechar o modal */
    onClose: () => void;
    /** Callback chamado após delegação bem sucedida */
    onDelegationComplete: (newOwnerId: string) => void;
    /** ID da OS */
    osId: string;
    /** ID do responsável atual */
    currentOwnerId: string;
    /** Informações do handoff */
    handoff: HandoffPoint;
}

// ============================================================================
// COMPONENTE
// ============================================================================

export function DelegationModal({
    isOpen,
    onClose,
    onDelegationComplete,
    osId,
    currentOwnerId,
    handoff,
}: DelegationModalProps) {
    // Estado local
    const [selectedDelegateId, setSelectedDelegateId] = useState<string>('');

    // Hook de delegação
    const {
        eligibleDelegates,
        isLoadingDelegates,
        isProcessing,
        error,
        loadEligibleDelegates,
        delegate,
        reset
    } = useDelegation();

    // Carregar colaboradores elegíveis quando o modal abrir
    useEffect(() => {
        if (isOpen && handoff) {
            loadEligibleDelegates(handoff.toCargo);
        }

        // Limpar seleção ao abrir
        setSelectedDelegateId('');
    }, [isOpen, handoff, loadEligibleDelegates]);

    // Limpar estado ao fechar
    useEffect(() => {
        if (!isOpen) {
            reset();
        }
    }, [isOpen, reset]);

    // Handler de delegação
    const handleDelegate = async () => {
        if (!selectedDelegateId) return;

        const result = await delegate(
            osId,
            selectedDelegateId,
            currentOwnerId,
            handoff.description
        );

        if (result.success) {
            onDelegationComplete(selectedDelegateId);
            onClose();
        }
    };

    // Obter iniciais para avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Colaborador selecionado
    const selectedDelegate = eligibleDelegates.find(d => d.id === selectedDelegateId);

    // Mapear cargo para nome amigável
    const getCargoNomeAmigavel = (cargoSlug: CargoSlug): string => {
        const map: Record<CargoSlug, string> = {
            coord_administrativo: 'Coordenador(a) Administrativo',
            coord_assessoria: 'Coordenador(a) de Assessoria',
            coord_obras: 'Coordenador(a) de Obras',
            operacional_admin: 'Operacional Administrativo',
            operacional_assessoria: 'Operacional de Assessoria',
            operacional_obras: 'Operacional de Obras',
        };
        return map[cargoSlug] || cargoSlug;
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <UserPlus className="h-5 w-5 text-primary" />
                        Transferir Responsabilidade
                    </DialogTitle>
                    <DialogDescription>
                        {handoff.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Informação da transição */}
                    <div className="flex items-center justify-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <Badge variant="outline" className="text-sm">
                            Etapa {handoff.fromStep}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        <Badge variant="secondary" className="text-sm">
                            Etapa {handoff.toStep}
                        </Badge>
                    </div>

                    {/* Alerta sobre delegação obrigatória */}
                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            A próxima etapa pertence ao{' '}
                            <strong>{getCargoNomeAmigavel(handoff.toCargo)}</strong>
                        </AlertDescription>
                    </Alert>

                    {/* Erro se houver */}
                    {error && (
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    {/* Seletor de colaborador */}
                    <div className="space-y-2">
                        <Label htmlFor="delegate-select">Selecione o novo responsável</Label>

                        {isLoadingDelegates ? (
                            <div className="flex items-center justify-center p-8 border border-dashed rounded-lg">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                <span className="ml-2 text-muted-foreground">
                                    Carregando colaboradores...
                                </span>
                            </div>
                        ) : eligibleDelegates.length === 0 ? (
                            <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                                <Building2 className="h-8 w-8 text-muted-foreground mb-2" />
                                <p className="text-sm text-muted-foreground text-center">
                                    Nenhum colaborador disponível com o cargo de{' '}
                                    <strong>{getCargoNomeAmigavel(handoff.toCargo)}</strong>.
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Cadastre um colaborador com este cargo para continuar.
                                </p>
                            </div>
                        ) : (
                            <Select
                                value={selectedDelegateId}
                                onValueChange={setSelectedDelegateId}
                            >
                                <SelectTrigger id="delegate-select" className="h-14">
                                    <SelectValue placeholder="Escolha um colaborador..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {eligibleDelegates.map((delegate) => (
                                        <SelectItem
                                            key={delegate.id}
                                            value={delegate.id}
                                            className="py-3"
                                        >
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-8 w-8">
                                                    <AvatarImage src={delegate.avatar_url} />
                                                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                        {getInitials(delegate.nome_completo)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-medium">
                                                        {delegate.nome_completo}
                                                    </span>
                                                    <span className="text-xs text-muted-foreground">
                                                        {delegate.cargo_nome} • {delegate.setor_nome}
                                                    </span>
                                                </div>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        )}
                    </div>

                    {/* Preview do selecionado */}
                    {selectedDelegate && (
                        <div className="p-4 border rounded-lg bg-background">
                            <p className="text-xs text-muted-foreground mb-2">
                                Novo responsável selecionado:
                            </p>
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10">
                                    <AvatarImage src={selectedDelegate.avatar_url} />
                                    <AvatarFallback className="bg-primary/10 text-primary">
                                        {getInitials(selectedDelegate.nome_completo)}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{selectedDelegate.nome_completo}</p>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedDelegate.email}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <DialogFooter className="gap-2">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        disabled={isProcessing}
                    >
                        Cancelar
                    </Button>
                    <PrimaryButton
                        onClick={handleDelegate}
                        disabled={!selectedDelegateId || isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Transferindo...
                            </>
                        ) : (
                            <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Confirmar Transferência
                            </>
                        )}
                    </PrimaryButton>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default DelegationModal;
