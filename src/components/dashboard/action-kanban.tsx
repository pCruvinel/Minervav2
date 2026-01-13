/**
 * ActionKanban - Quadro Kanban por Status Geral
 * 
 * Visualização em 4 colunas baseadas no ciclo de vida (status_geral):
 * - 📋 Em Triagem: OSs recém criadas (etapas 1-2)
 * - ▶️ Em Andamento: OSs em execução ativa
 * - ✅ Concluído: OSs finalizadas com sucesso
 * - ❌ Cancelado: OSs canceladas
 * 
 * Cada card exibe um badge colorido indicando a situação da ação (status_situacao):
 * - 🔴 Atrasado | 🟣 Aguard. Aprovação | 🟠 Aguard. Info | 🟡 Alerta | 🔵 Ação Pendente
 */

import { useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    FileSearch,
    Play,
    CheckCircle2,
    XCircle,
    Calendar,
    Building2,
    ArrowRight
} from 'lucide-react';
import { type OSComEtapa } from '@/lib/hooks/use-dashboard-data';
import { STATUS_SITUACAO_CONFIG, type StatusSituacao, type OSStatus } from '@/lib/types';

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
    variant: 'triagem' | 'andamento' | 'concluido' | 'cancelado';
    emptyMessage: string;
}

// ============================================================
// COMPONENTES INTERNOS
// ============================================================

/**
 * Badge de Status Situação
 * Exibe o badge colorido conforme a situação da ação
 */
function SituacaoBadge({ situacao }: { situacao?: StatusSituacao | string | null }) {
    if (!situacao || situacao === 'finalizado') return null;

    const config = STATUS_SITUACAO_CONFIG[situacao as StatusSituacao];
    if (!config) return null;

    return (
        <Badge className={`text-[10px] h-5 px-1.5 ${config.className}`}>
            {config.label}
        </Badge>
    );
}

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
            className="block no-underline"
        >
            <div className={`
                p-3 rounded-lg border transition-all cursor-pointer
                hover:shadow-md hover:border-primary/50
                border-border bg-card
            `}>
                {/* Header do Card */}
                <div className="flex items-center justify-between mb-2">
                    <span className="font-mono text-sm font-semibold text-primary">
                        {os.codigo_os}
                    </span>
                    {/* Badge de Situação (Ação) */}
                    <SituacaoBadge situacao={os.status_situacao} />
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
        triagem: 'border-t-muted-foreground bg-muted/20',
        andamento: 'border-t-primary bg-primary/5',
        concluido: 'border-t-success bg-success/5',
        cancelado: 'border-t-destructive bg-destructive/5',
    };

    const headerStyles = {
        triagem: 'text-muted-foreground',
        andamento: 'text-primary',
        concluido: 'text-success',
        cancelado: 'text-destructive',
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
    // Combinar todas as OS para mostrar no kanban
    const todasOS = useMemo(() => {
        return [...minhasPendencias, ...aguardandoTerceiros];
    }, [minhasPendencias, aguardandoTerceiros]);

    // Separar em colunas por status_geral
    const colunas = useMemo(() => {
        const emTriagem: OSComEtapa[] = [];
        const emAndamento: OSComEtapa[] = [];
        const concluido: OSComEtapa[] = [];
        const cancelado: OSComEtapa[] = [];

        todasOS.forEach(os => {
            const status = os.status_geral as OSStatus;
            switch (status) {
                case 'em_triagem':
                    emTriagem.push(os);
                    break;
                case 'em_andamento':
                case 'aguardando_info':
                case 'aguardando_aprovacao':
                    emAndamento.push(os);
                    break;
                case 'concluido':
                    concluido.push(os);
                    break;
                case 'cancelado':
                    cancelado.push(os);
                    break;
                default:
                    emAndamento.push(os);
            }
        });

        return { emTriagem, emAndamento, concluido, cancelado };
    }, [todasOS]);

    // Contar pendências ativas (não concluídas/canceladas)
    const pendenciasAtivas = colunas.emTriagem.length + colunas.emAndamento.length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-semibold">{title}</h2>
                    <p className="text-sm text-muted-foreground">
                        Acompanhe o progresso das suas OSs
                    </p>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                    {pendenciasAtivas} ativas
                </Badge>
            </div>

            {/* Grid de Colunas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <KanbanColumn
                    title="Em Triagem"
                    icon={<FileSearch className="w-4 h-4" />}
                    items={colunas.emTriagem}
                    variant="triagem"
                    emptyMessage="Nenhuma OS em triagem"
                />

                <KanbanColumn
                    title="Em Andamento"
                    icon={<Play className="w-4 h-4" />}
                    items={colunas.emAndamento}
                    variant="andamento"
                    emptyMessage="Nenhuma OS em andamento"
                />

                <KanbanColumn
                    title="Concluído"
                    icon={<CheckCircle2 className="w-4 h-4" />}
                    items={colunas.concluido}
                    variant="concluido"
                    emptyMessage="Nenhuma OS concluída"
                />

                <KanbanColumn
                    title="Cancelado"
                    icon={<XCircle className="w-4 h-4" />}
                    items={colunas.cancelado}
                    variant="cancelado"
                    emptyMessage="Nenhuma OS cancelada"
                />
            </div>
        </div>
    );
}
