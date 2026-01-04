/**
 * QuickActionsPanel - Painel de ações rápidas para criar OS vinculadas
 *
 * Exibe botões para criar OS-09 (Compras) e OS-10 (RH) vinculadas
 * a uma OS contrato (OS-12 ou OS-13).
 *
 * @example
 * ```tsx
 * <QuickActionsPanel
 *   osId="123-abc"
 *   clienteId="456-def"
 *   ccId="789-ghi"
 * />
 * ```
 */

import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle
} from '@/components/ui/dialog';
import {
    ShoppingCart,
    Users,
    Plus,
    Loader2,
    AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { toast } from '@/lib/utils/safe-toast';
import { logger } from '@/lib/utils/logger';
import { useAuth } from '@/lib/contexts/auth-context';

// ============================================================
// TIPOS
// ============================================================

interface QuickActionsPanelProps {
    /** ID da OS pai (contrato) */
    osId: string;
    /** ID do cliente (herdado do contrato) */
    clienteId?: string;
    /** ID do centro de custo (herdado do contrato) */
    ccId?: string;
    /** Se a OS pai é um contrato (OS-12 ou OS-13) */
    isContract?: boolean;
    /** Callback após criar OS */
    onOSCreated?: (novaOsId: string, tipoCriado: string) => void;
}

type OSType = 'OS-09' | 'OS-10';

interface OSTypeConfig {
    codigo: string;
    nome: string;
    descricao: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    route: string;
}

// ============================================================
// CONSTANTES
// ============================================================

const OS_TYPES_CONFIG: Record<OSType, OSTypeConfig> = {
    'OS-09': {
        codigo: 'OS-09',
        nome: 'Requisição de Compras',
        descricao: 'Solicitar materiais, equipamentos ou serviços',
        icon: ShoppingCart,
        color: 'text-warning',
        route: '/os/criar/requisicao-compras'
    },
    'OS-10': {
        codigo: 'OS-10',
        nome: 'Requisição de Mão de Obra',
        descricao: 'Solicitar contratação de novos colaboradores',
        icon: Users,
        color: 'text-info',
        route: '/os/criar/requisicao-mao-de-obra'
    }
};

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function QuickActionsPanel({
    osId,
    clienteId,
    ccId,
    isContract = false,
    onOSCreated
}: QuickActionsPanelProps) {
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [isCreating, setIsCreating] = useState(false);
    const [selectedType, setSelectedType] = useState<OSType | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    // Handler para criar OS vinculada
    const handleCreateOS = async (tipo: OSType) => {
        setSelectedType(tipo);
        setShowConfirmDialog(true);
    };

    const confirmCreateOS = async () => {
        if (!selectedType || !currentUser) return;

        try {
            setIsCreating(true);
            setShowConfirmDialog(false);

            // 1. Buscar tipo_os_id pelo código
            const { data: tipoOS, error: tipoOSError } = await supabase
                .from('tipos_os')
                .select('id')
                .eq('codigo', selectedType)
                .single();

            if (tipoOSError || !tipoOS) {
                throw new Error(`Tipo de OS ${selectedType} não encontrado`);
            }

            // 2. Criar a nova OS vinculada
            const { data: novaOS, error: osError } = await supabase
                .from('ordens_servico')
                .insert({
                    tipo_os_id: tipoOS.id,
                    cliente_id: clienteId || null,
                    cc_id: ccId || null,
                    parent_os_id: osId, // Vínculo com OS pai
                    responsavel_id: currentUser.id,
                    criado_por_id: currentUser.id,
                    status_geral: 'em_triagem',
                    descricao: `${OS_TYPES_CONFIG[selectedType].nome} vinculada`
                })
                .select('id, codigo_os')
                .single();

            if (osError) throw osError;

            toast.success(
                `${OS_TYPES_CONFIG[selectedType].nome} criada com sucesso!`,
                { description: `Código: ${novaOS.codigo_os}` }
            );

            // 3. Callback e navegação
            if (onOSCreated) {
                onOSCreated(novaOS.id, selectedType);
            }

            // Navegar para a página de criação da OS
            navigate({
                to: OS_TYPES_CONFIG[selectedType].route,
                search: { osId: novaOS.id }
            });

        } catch (error) {
            logger.error('Erro ao criar OS vinculada:', error);
            toast.error('Erro ao criar OS', {
                description: (error as Error).message
            });
        } finally {
            setIsCreating(false);
            setSelectedType(null);
        }
    };

    // Não renderizar se não for um contrato
    if (!isContract) {
        return null;
    }

    return (
        <>
            <Card className="border-dashed border-primary/30">
                <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                        <Plus className="w-4 h-4 text-primary" />
                        Ações Rápidas
                    </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                    <div className="grid gap-3 sm:grid-cols-2">
                        {(Object.entries(OS_TYPES_CONFIG) as [OSType, OSTypeConfig][]).map(
                            ([tipo, config]) => {
                                const Icon = config.icon;
                                return (
                                    <Button
                                        key={tipo}
                                        variant="outline"
                                        className="h-auto py-4 flex-col gap-2 hover:bg-muted/50 border-border"
                                        onClick={() => handleCreateOS(tipo)}
                                        disabled={isCreating}
                                    >
                                        <div className={`p-2 rounded-full bg-muted ${config.color}`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-medium text-sm">{config.nome}</p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {config.descricao}
                                            </p>
                                        </div>
                                        <Badge variant="secondary" className="text-xs">
                                            {config.codigo}
                                        </Badge>
                                    </Button>
                                );
                            }
                        )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                        As solicitações serão vinculadas automaticamente a esta OS
                    </p>
                </CardContent>
            </Card>

            {/* Dialog de Confirmação */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            {selectedType && (
                                <>
                                    {(() => {
                                        const Icon = OS_TYPES_CONFIG[selectedType].icon;
                                        return <Icon className={`w-5 h-5 ${OS_TYPES_CONFIG[selectedType].color}`} />;
                                    })()}
                                    Criar {OS_TYPES_CONFIG[selectedType]?.nome}
                                </>
                            )}
                        </DialogTitle>
                        <DialogDescription>
                            Esta solicitação será automaticamente vinculada à OS atual.
                            {clienteId && (
                                <span className="block mt-2 text-sm">
                                    Cliente e Centro de Custo serão herdados.
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-4">
                        <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0" />
                            <div className="text-sm">
                                <p className="font-medium">Após criar, você será redirecionado</p>
                                <p className="text-muted-foreground">
                                    para preencher os detalhes da solicitação.
                                </p>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowConfirmDialog(false)}
                            disabled={isCreating}
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={confirmCreateOS}
                            disabled={isCreating}
                        >
                            {isCreating ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4 mr-2" />
                                    Criar Solicitação
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export type { QuickActionsPanelProps };
