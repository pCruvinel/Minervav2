/**
 * ActionKanban - Quadro Kanban para Foco em Execução
 * 
 * Visualização em 4 colunas para operacionais e coordenadores:
 * - 🔴 Urgente/Atrasado: Prazos vencidos sob responsabilidade do usuário
 * - 🟡 Minha Vez: OSs que acabaram de chegar (delegação recebida)
 * - 🔵 Em Andamento: Tarefas que o usuário já iniciou
 * - ⚪ Aguardando Terceiros: OSs que o usuário criou/participou mas estão com outros
 */

import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    AlertTriangle,
    Clock,
    Play,
    Users,
    Calendar,
    Building2,
    ArrowRight
} from 'lucide-react';
import { type OSComEtapa } from '@/lib/hooks/use-dashboard-data';
import { useAuth } from '@/lib/contexts/auth-context';

// ============================================================
// TIPOS
// ============================================================

interface ActionKanbanProps {
    /** Dados de "minhas pendências" do hook useDashboardData */
    minhasPendencias: OSComEtapa[];
    /** Dados de OSs que criei mas estão com outros */
    aguardandoTerceiros?: OSComEtapa[];
    /** Título customizado */
    title?: string;
}

interface KanbanColumnProps {
    title: string;
    icon: React.ReactNode;
    items: OSComEtapa[];
    variant: 'danger' | 'warning' | 'primary' | 'muted';
    emptyMessage: string;
}

// ============================================================
// COMPONENTES INTERNOS
// ============================================================

function KanbanCard({ os }: { os: OSComEtapa }) {
    const getInitials = (nome: string) => {
        if (!nome) return '??';
        const parts = nome.trim().split(' ');
        if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    };

    const formatDate = (dateStr: string | undefined) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    };

    return (
        <Link
            to="/os/$osId"
            params={{ osId: os.id }}
            className="block"
        >
            <div className={`
        p-3 rounded-lg border transition-all cursor-pointer
        hover:shadow-md hover:border-primary/50
        ${os.prazoVencido ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-card'}
      `}>
                {/* Header do Card */}
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold text-primary">
                        {os.codigo_os}
                    </span>
                    {os.prazoVencido && (
                        <Badge variant="destructive" className="text-[10px] h-5 px-1.5">
                            Atrasado
                        </Badge>
                    )}
                </div>

                {/* Tipo OS */}
                <p className="text-sm font-medium text-foreground line-clamp-1 mb-2">
                    {os.tipo_os_nome || 'Ordem de Serviço'}
                </p>

                {/* Cliente */}
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">{os.cliente_nome || 'Cliente não informado'}</span>
                </div>

                {/* Etapa Atual */}
                {os.etapaAtual && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                        <ArrowRight className="w-3 h-3" />
                        <span className="truncate">
                            {os.etapaAtual.numero}. {os.etapaAtual.titulo}
                        </span>
                    </div>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                        <Avatar className="h-5 w-5">
                            <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                                {getInitials(os.responsavel_nome || '')}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-[10px] text-muted-foreground truncate max-w-[80px]">
                            {os.responsavel_nome || 'Sem resp.'}
                        </span>
                    </div>

                    {os.prazoEtapa && (
                        <div className={`flex items-center gap-1 text-[10px] ${os.prazoVencido ? 'text-destructive' : 'text-muted-foreground'}`}>
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(os.prazoEtapa)}</span>
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}

function KanbanColumn({ title, icon, items, variant, emptyMessage }: KanbanColumnProps) {
    const variantStyles = {
        danger: 'border-t-destructive bg-destructive/5',
        warning: 'border-t-warning bg-warning/5',
        primary: 'border-t-primary bg-primary/5',
        muted: 'border-t-muted-foreground/30 bg-muted/30',
    };

    const headerStyles = {
        danger: 'text-destructive',
        warning: 'text-warning',
        primary: 'text-primary',
        muted: 'text-muted-foreground',
    };

    return (
        <Card className={`flex flex-col h-full border-t-4 ${variantStyles[variant]}`}>
            <CardHeader className="pb-3">
                <CardTitle className={`flex items-center gap-2 text-base ${headerStyles[variant]}`}>
                    {icon}
                    <span>{title}</span>
                    <Badge variant="secondary" className="ml-auto">
                        {items.length}
                    </Badge>
                </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-3 pt-0">
                <ScrollArea className="h-[400px] pr-3">
                    {items.length === 0 ? (
                        <div className="flex items-center justify-center h-32 text-center">
                            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {items.map((os) => (
                                <KanbanCard key={os.id} os={os} />
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </CardContent>
        </Card>
    );
}

// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export function ActionKanban({
    minhasPendencias,
    aguardandoTerceiros = [],
    title = 'Minhas Tarefas'
}: ActionKanbanProps) {
    const { currentUser } = useAuth();

    // Separar em colunas
    const colunas = useMemo(() => {
        const urgentes: OSComEtapa[] = [];
        const minhaVez: OSComEtapa[] = [];
        const emAndamento: OSComEtapa[] = [];

        minhasPendencias.forEach(os => {
            // Urgente: prazo vencido
            if (os.prazoVencido) {
                urgentes.push(os);
            }
            // Em andamento: já iniciei
            else if (os.statusEtapa === 'em_andamento') {
                emAndamento.push(os);
            }
            // Minha vez: pendente, acabou de chegar
            else if (os.statusEtapa === 'pendente') {
                minhaVez.push(os);
            }
        });

        return { urgentes, minhaVez, emAndamento };
    }, [minhasPendencias]);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">
                        O que você precisa fazer agora
                    </p>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                    {minhasPendencias.length + aguardandoTerceiros.length} pendências
                </Badge>
            </div>

            {/* Grid de Colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KanbanColumn
                    title="Urgente/Atrasado"
                    icon={<AlertTriangle className="w-4 h-4" />}
                    items={colunas.urgentes}
                    variant="danger"
                    emptyMessage="🎉 Nada atrasado!"
                />

                <KanbanColumn
                    title="Minha Vez"
                    icon={<Clock className="w-4 h-4" />}
                    items={colunas.minhaVez}
                    variant="warning"
                    emptyMessage="Aguardando novas tarefas"
                />

                <KanbanColumn
                    title="Em Andamento"
                    icon={<Play className="w-4 h-4" />}
                    items={colunas.emAndamento}
                    variant="primary"
                    emptyMessage="Nenhuma tarefa iniciada"
                />

                <KanbanColumn
                    title="Aguardando Terceiros"
                    icon={<Users className="w-4 h-4" />}
                    items={aguardandoTerceiros}
                    variant="muted"
                    emptyMessage="Nada em acompanhamento"
                />
            </div>
        </div>
    );
}
