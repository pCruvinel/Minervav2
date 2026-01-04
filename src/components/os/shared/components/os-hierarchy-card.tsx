import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitBranch, ArrowUpRight, ArrowDownRight, FileCheck, Building } from 'lucide-react';
import { useOSHierarchy } from '@/lib/hooks/use-os-hierarchy';
import { STATUS_LABELS, OSStatus } from '@/lib/types';

interface OSHierarchyCardProps {
    osId: string;
}

export function OSHierarchyCard({ osId }: OSHierarchyCardProps) {
    const { parent, children, isContract, loading, rootLead } = useOSHierarchy(osId);

    // Se estiver carregando, mostra skeleton ou loader simples
    if (loading) {
        return (
            <Card className="border-border rounded-lg shadow-sm animate-pulse">
                <CardHeader className="pb-2">
                    <div className="h-6 w-48 bg-muted rounded" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <div className="h-16 w-full bg-muted rounded" />
                        <div className="h-16 w-full bg-muted rounded" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    // Se não tiver nenhuma relação (nem pai, nem filho, nem contrato), não exibe nada
    if (!parent && children.length === 0 && !isContract) {
        return null;
    }

    return (
        <Card className="border-border rounded-lg shadow-sm overflow-hidden">
            <CardHeader className="pb-4 bg-muted/40 border-b border-border/50">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                    <GitBranch className="w-5 h-5 text-primary" />
                    Rastreabilidade da OS
                    {isContract && (
                        <Badge variant="secondary" className="ml-auto bg-success/10 text-success border-success/20">
                            <FileCheck className="w-3 h-3 mr-1" />
                            Contrato Vinculado
                        </Badge>
                    )}
                </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 relative">
                {/* Linha vertical de conexão contínua */}
                <div className="absolute left-[2.25rem] top-6 bottom-6 w-0.5 bg-border -z-10" />

                <div className="space-y-8">
                    {/* 1. Nível Superior (Pai ou Lead Original) */}
                    {parent ? (
                        <div className="relative pl-12 group">
                            <div className="absolute left-6 top-3 -ml-[5px] w-3 h-3 rounded-full border-2 border-muted-foreground bg-background z-10" />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <ArrowUpRight className="w-3 h-3" />
                                    Origem (Pai)
                                </span>
                                <div className="p-3 bg-muted/30 rounded-lg border border-border/60 hover:border-primary/30 transition-colors group-hover:bg-muted/50">
                                    <div className="flex items-center justify-between mb-1">
                                        <Link
                                            to="/os/$osId"
                                            params={{ osId: parent.id }}
                                            className="font-semibold text-primary hover:underline flex items-center gap-2"
                                        >
                                            {parent.codigo_os}
                                            <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal">
                                                {STATUS_LABELS[parent.status_geral as OSStatus] || parent.status_geral}
                                            </Badge>
                                        </Link>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {parent.tipos_os?.nome || 'Tipo não definido'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : rootLead ? (
                        // Caso tenha apenas Lead Original mas não Pai direto (ex: virou OS direto do Lead)
                        <div className="relative pl-12 group">
                            <div className="absolute left-6 top-3 -ml-[5px] w-3 h-3 rounded-full border-2 border-info bg-background z-10" />
                            <div className="flex flex-col gap-1">
                                <span className="text-xs font-semibold text-info uppercase tracking-wider flex items-center gap-1">
                                    <Building className="w-3 h-3" />
                                    Lead Original
                                </span>
                                <div className="p-3 bg-info/5 rounded-lg border border-info/20">
                                    <div className="flex items-center justify-between mb-1">
                                        <Link
                                            to="/os/$osId"
                                            params={{ osId: rootLead.id }}
                                            className="font-semibold text-info hover:underline"
                                        >
                                            {rootLead.codigo_os}
                                        </Link>
                                        <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-info/30 text-info">
                                            {STATUS_LABELS[rootLead.status_geral as OSStatus] || rootLead.status_geral}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-info/80">
                                        {rootLead.tipos_os?.nome}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Se não tem pai, mostra início do fluxo
                        <div className="relative pl-12">
                            <div className="absolute left-6 top-3 -ml-[5px] w-3 h-3 rounded-full border-2 border-muted-foreground bg-background z-10" />
                            <span className="text-xs font-medium text-muted-foreground italic">
                                OS Inicial (Sem origem vinculada)
                            </span>
                        </div>
                    )}

                    {/* 2. OS Atual */}
                    <div className="relative pl-12">
                        <div className="absolute left-6 top-[1.5rem] -ml-[7px] w-4 h-4 rounded-full border-4 border-primary bg-background ring-4 ring-background z-20 shadow-sm" />
                        <div className="p-4 rounded-lg bg-background border-2 border-primary/20 shadow-sm -mt-2">
                            <Badge className="mb-2 w-fit bg-primary/10 text-primary hover:bg-primary/20 border-0">
                                Você está aqui
                            </Badge>
                            <p className="font-bold text-lg text-foreground">
                                Esta OS
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Visualizando detalhes e vínculos
                            </p>
                        </div>
                    </div>

                    {/* 3. Filhas (Desdobramentos) */}
                    {children.length > 0 ? (
                        <div className="relative pl-12 pb-2">
                            <div className="flow-root">
                                <span className="block mb-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                                    <ArrowDownRight className="w-3 h-3" />
                                    Desdobramentos ({children.length})
                                </span>
                                <div className="grid gap-3">
                                    {children.map(child => (
                                        <div key={child.id} className="relative group">
                                            {/* Conector para cada filho */}
                                            <div className="absolute -left-[1.8rem] top-4 w-4 h-px bg-border group-hover:bg-primary/50 transition-colors" />
                                            {/* Dot do filho na linha principal */}
                                            <div className="absolute -left-[2.05rem] top-3 w-2 h-2 rounded-full bg-border group-hover:bg-primary transition-colors ring-2 ring-background" />

                                            <div className="p-3 bg-muted/30 rounded-lg border border-border/60 hover:border-primary/30 hover:bg-muted/50 transition-all">
                                                <div className="flex items-center justify-between mb-1">
                                                    <Link
                                                        to="/os/$osId"
                                                        params={{ osId: child.id }}
                                                        className="font-medium text-foreground hover:text-primary hover:underline"
                                                    >
                                                        {child.codigo_os}
                                                    </Link>
                                                    <Badge variant="secondary" className="text-[10px]">
                                                        {STATUS_LABELS[child.status_geral as OSStatus] || child.status_geral}
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-muted-foreground">
                                                    {child.tipos_os?.nome || 'Tipo não definido'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Sem desdobramentos
                        <div className="relative pl-12 pb-2 opacity-60">
                            <div className="absolute left-6 top-2 -ml-[4px] w-2 h-2 rounded-full bg-muted-foreground/30" />
                            <p className="text-xs text-muted-foreground italic">
                                Sem desdobramentos até o momento
                            </p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
