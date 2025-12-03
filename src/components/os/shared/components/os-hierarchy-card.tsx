/**
 * Componente: OSHierarchyCard
 * 
 * Exibe a hierarquia de uma OS:
 * - OS Origem (parent)
 * - OSs Derivadas (children)
 */

import { ArrowUp, ArrowDown, ExternalLink } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useOSHierarchy } from '@/lib/hooks/use-os-hierarchy';
import { formatarData } from '@/lib/utils/date-utils';
import type { OrdemServico } from '@/lib/types';

interface OSHierarchyCardProps {
    osId: string;
}

export function OSHierarchyCard({ osId }: OSHierarchyCardProps) {
    const { parent, children, loading } = useOSHierarchy(osId);

    // Não mostrar card se não houver hierarquia
    if (!loading && !parent && children.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <span className="text-lg">📊</span>
                    Hierarquia da OS
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {loading ? (
                    <LoadingSkeleton />
                ) : (
                    <>
                        {/* OS Origem (Parent) */}
                        {parent && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <ArrowUp className="h-3 w-3" />
                                    Origem
                                </div>
                                <OSHierarchyItem os={parent} />
                            </div>
                        )}

                        {/* Divisor */}
                        {parent && children.length > 0 && (
                            <div className="border-t" />
                        )}

                        {/* OSs Derivadas (Children) */}
                        {children.length > 0 && (
                            <div className="space-y-2">
                                <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                    <ArrowDown className="h-3 w-3" />
                                    OSs Derivadas ({children.length})
                                </div>
                                <div className="space-y-2">
                                    {children.map((child) => (
                                        <OSHierarchyItem key={child.id} os={child} />
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}

function OSHierarchyItem({ os }: { os: OrdemServico }) {
    return (
        <Link
            to="/os/$osId"
            params={{ osId: os.id }}
            className="block p-3 rounded-md border bg-card hover:bg-accent transition-colors group"
        >
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-sm font-medium">
                            {os.codigo_os}
                        </span>
                        <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* @ts-ignore - tipos_os vem do join */}
                    {os.tipos_os?.nome && (
                        <p className="text-xs text-muted-foreground line-clamp-1">
                            {/* @ts-ignore */}
                            {os.tipos_os.nome}
                        </p>
                    )}

                    {os.data_entrada && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {formatarData(os.data_entrada)}
                        </p>
                    )}
                </div>

                <Badge variant="outline" className="text-xs shrink-0">
                    {getStatusLabel(os.status_geral)}
                </Badge>
            </div>
        </Link>
    );
}

function LoadingSkeleton() {
    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-20 w-full" />
            </div>
        </div>
    );
}

function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        'em_triagem': 'Triagem',
        'em_andamento': 'Andamento',
        'concluida': 'Concluída',
        'cancelada': 'Cancelada',
        'aguardando_aprovacao': 'Aguardando'
    };
    return labels[status] || status;
}
