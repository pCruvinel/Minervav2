/**
 * LinkedRequestsWidget - Widget de Solicitações Vinculadas
 * 
 * Exibe OSs filhas de uma OS específica.
 * Utiliza useOSHierarchy para buscar children via parent_os_id.
 * 
 * @example
 * ```tsx
 * <LinkedRequestsWidget osId="123-abc" />
 * ```
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useOSHierarchy } from '@/lib/hooks/use-os-hierarchy';
import { LinkedOSDetailModal } from './linked-os-detail-modal';
import { Link2, ExternalLink, ChevronRight } from 'lucide-react';

// ============================================================
// TIPOS
// ============================================================

interface LinkedRequestsWidgetProps {
    /** ID da OS pai */
    osId: string;
}

// ============================================================
// HELPERS
// ============================================================

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
    em_triagem: { label: 'Em Triagem', className: 'bg-warning/10 text-warning border-warning/20' },
    em_andamento: { label: 'Em Andamento', className: 'bg-info/10 text-info border-info/20' },
    aguardando_aprovacao: { label: 'Aguardando', className: 'bg-warning/10 text-warning border-warning/20' },
    concluido: { label: 'Concluída', className: 'bg-success/10 text-success border-success/20' },
    concluida: { label: 'Concluída', className: 'bg-success/10 text-success border-success/20' },
    cancelado: { label: 'Cancelada', className: 'bg-destructive/10 text-destructive border-destructive/20' },
    cancelada: { label: 'Cancelada', className: 'bg-destructive/10 text-destructive border-destructive/20' },
};

function getStatusBadge(status: string) {
    const config = STATUS_CONFIG[status] || { label: status, className: 'bg-muted text-muted-foreground' };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function LinkedRequestsWidget({ osId }: LinkedRequestsWidgetProps) {
    const { children, loading, error } = useOSHierarchy(osId);
    const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

    // Loading state
    if (loading) {
        return (
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Link2 className="h-4 w-4" />
                        Solicitações Vinculadas
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Error state
    if (error) {
        return null; // Silently fail to not break the UI
    }

    // No children
    if (!children || children.length === 0) {
        return null; // Don't render widget if there are no linked OSs
    }

    return (
        <>
            <Card className="border-primary/20">
                <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-sm font-medium">
                        <Link2 className="h-4 w-4 text-primary" />
                        Solicitações Vinculadas
                        <Badge variant="secondary" className="ml-auto">
                            {children.length}
                        </Badge>
                    </CardTitle>
                    <p className="text-xs text-muted-foreground">
                        OSs criadas a partir desta ordem de serviço
                    </p>
                </CardHeader>
                <CardContent className="pt-0">
                    <ul className="space-y-2">
                        {children.map((child) => (
                            <li key={child.id}>
                                <button
                                    onClick={() => setSelectedChildId(child.id)}
                                    className="w-full flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-left"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-sm font-medium text-primary">
                                                {child.codigo_os}
                                            </span>
                                            <span className="text-xs text-muted-foreground">•</span>
                                            <span className="text-sm">
                                                {child.tipos_os?.nome || 'Tipo não definido'}
                                            </span>
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            {child.clientes?.nome_razao_social || 'Sem cliente'}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {getStatusBadge(child.status_geral)}
                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>

                    {/* Link para ver todas em nova aba */}
                    {children.length > 3 && (
                        <div className="mt-3 text-center">
                            <Button variant="ghost" size="sm" className="text-xs">
                                <ExternalLink className="h-3 w-3 mr-1" />
                                Ver todas as solicitações
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Modal de Detalhes */}
            <LinkedOSDetailModal
                osId={selectedChildId}
                open={!!selectedChildId}
                onClose={() => setSelectedChildId(null)}
            />
        </>
    );
}
