import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ArrowUpRight, ArrowDownRight, Loader2 } from 'lucide-react';
import { useOSHierarchy } from '@/lib/hooks/use-os-hierarchy';
import { STATUS_LABELS, OSStatus } from '@/lib/types';

interface OSHierarchyCardProps {
    osId: string;
}

export function OSHierarchyCard({ osId }: OSHierarchyCardProps) {
    const { parent, children, loading } = useOSHierarchy(osId);

    if (loading) {
        return (
            <Card className="border-border rounded-lg shadow-sm">
                <CardContent className="p-6 flex items-center justify-center text-muted-foreground">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Carregando hierarquia...
                </CardContent>
            </Card>
        );
    }

    if (!parent && children.length === 0) {
        return null; // Don't show if no hierarchy exists
    }

    return (
        <Card className="border-border rounded-lg shadow-sm">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-primary" />
                    Relacionamentos e Hierarquia
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Parent OS */}
                {parent && (
                    <div className="p-3 bg-muted/50 rounded-lg border border-border">
                        <div className="flex items-center gap-2 mb-2 text-sm font-medium text-muted-foreground">
                            <ArrowUpRight className="w-4 h-4" />
                            <span>OS Origem (Pai)</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <Link
                                to="/os/$osId"
                                params={{ osId: parent.id }}
                                className="font-medium hover:underline text-primary"
                            >
                                {parent.codigo_os}
                            </Link>
                            <Badge variant="outline" className="text-xs">
                                {STATUS_LABELS[parent.status_geral as OSStatus] || parent.status_geral}
                            </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                            {parent.tipo_os_nome || 'Tipo não definido'}
                        </p>
                    </div>
                )}

                {/* Children OSs */}
                {children.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                            <ArrowDownRight className="w-4 h-4" />
                            <span>OSs Derivadas (Filhas)</span>
                        </div>
                        <div className="grid gap-2">
                            {children.map(child => (
                                <div
                                    key={child.id}
                                    className="flex items-center justify-between p-2 bg-background rounded border border-border hover:bg-muted/50 transition-colors"
                                >
                                    <div className="flex flex-col">
                                        <Link
                                            to="/os/$osId"
                                            params={{ osId: child.id }}
                                            className="font-medium text-sm hover:underline"
                                        >
                                            {child.codigo_os}
                                        </Link>
                                        <span className="text-xs text-muted-foreground">
                                            {child.tipo_os_nome}
                                        </span>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px]">
                                        {STATUS_LABELS[child.status_geral as OSStatus] || child.status_geral}
                                    </Badge>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
