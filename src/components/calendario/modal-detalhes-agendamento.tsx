
import {
    Dialog,
    DialogContent,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Calendar, Clock, FileText, AlertCircle, Tag, Briefcase, Timer } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { categoryColors } from '@/lib/design-tokens';
import { ModalHeaderPadrao } from '../ui/modal-header-padrao';

interface ModalDetalhesAgendamentoProps {
    open: boolean;
    onClose: () => void;
    agendamento: any;
}

export function ModalDetalhesAgendamento({ open, onClose, agendamento }: ModalDetalhesAgendamentoProps) {
    if (!agendamento) return null;

    const formatarData = (data: string) => {
        return new Date(data).toLocaleDateString('pt-BR', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const formatarHorario = (inicio: string, fim: string) => {
        return `${inicio} - ${fim}`;
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'confirmado':
                return 'bg-success/10 text-success border-success/20';
            case 'realizado':
                return 'bg-primary/10 text-primary border-primary/20';
            case 'ausente':
                return 'bg-warning/10 text-warning border-warning/20';
            case 'cancelado':
                return 'bg-destructive/10 text-destructive border-destructive/20';
            default:
                return 'bg-muted text-muted-foreground border-border';
        }
    };

    // Obter cor da categoria
    const categoryColor = categoryColors[agendamento.categoria as keyof typeof categoryColors];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-0">
                <ModalHeaderPadrao
                    title="Detalhes do Agendamento"
                    description="Informações completas sobre o agendamento selecionado."
                    icon={Calendar}
                    theme="default"
                    rightContent={
                        <Badge className={`${getStatusColor(agendamento.status)} px-3 py-1 text-sm font-medium`}>
                            {agendamento.status}
                        </Badge>
                    }
                />

                <div className="space-y-4 p-6">
                    {/* Data e Horário Card */}
                    <div className="bg-muted/50 rounded-xl p-5 space-y-3 border border-border shadow-sm">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Data:</span>
                            <span>{formatarData(agendamento.data)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">Horário:</span>
                            <span>{formatarHorario(agendamento.horarioInicio, agendamento.horarioFim)}</span>
                        </div>
                    </div>

                    {/* Info Cards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Categoria Card */}
                        <div
                            className="rounded-xl p-4 border shadow-sm"
                            style={{
                                backgroundColor: categoryColor?.bg || 'hsl(var(--primary) / 0.1)',
                                borderColor: categoryColor?.border || 'hsl(var(--primary) / 0.2)'
                            }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Tag className="h-4 w-4" style={{ color: categoryColor?.text || 'hsl(var(--primary))' }} />
                                <span className="text-xs font-medium opacity-75" style={{ color: categoryColor?.text || 'hsl(var(--primary))' }}>
                                    Categoria
                                </span>
                            </div>
                            <p className="font-semibold" style={{ color: categoryColor?.text || 'hsl(var(--primary))' }}>
                                {agendamento.categoria}
                            </p>
                        </div>

                        {/* Setor Card */}
                        <div className="bg-muted/30 rounded-xl p-4 border border-border/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium text-primary opacity-75">Setor</span>
                            </div>
                            <p className="font-semibold text-foreground">{agendamento.setor}</p>
                        </div>

                        {/* Duração Card */}
                        <div className="bg-muted/30 rounded-xl p-4 border border-border/50 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Timer className="h-4 w-4 text-primary" />
                                <span className="text-xs font-medium text-primary opacity-75">Duração</span>
                            </div>
                            <p className="font-semibold text-foreground">{agendamento.duracaoHoras}h</p>
                        </div>

                        {/* Colaborador Card (se existir) */}
                        {agendamento.usuarioNome && (
                            <div className="bg-muted/30 rounded-xl p-4 border border-border/50 shadow-sm">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage src={agendamento.usuarioAvatarUrl || undefined} alt={agendamento.usuarioNome} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                            {agendamento.usuarioNome?.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <span className="text-xs font-medium text-primary opacity-75">Colaborador</span>
                                        <p className="font-semibold text-foreground truncate" title={agendamento.usuarioNome}>
                                            {agendamento.usuarioNome}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* OS Vinculada (se existir) */}
                    {agendamento.osId && (
                        <div className="bg-muted/30 rounded-xl p-4 border border-border/50 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-muted rounded-lg p-2">
                                    <FileText className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">OS Vinculada</p>
                                    <p className="text-sm font-semibold text-foreground font-mono">
                                        {agendamento.osCodigo || agendamento.osId}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cliente (se existir) */}
                    {agendamento.clienteNome && (
                        <div className="bg-muted/30 rounded-xl p-4 border border-border/50 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-muted rounded-lg p-2">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="text-xs text-muted-foreground font-medium">Cliente</p>
                                    <p className="text-sm font-semibold text-foreground">{agendamento.clienteNome}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Descrição (se existir) */}
                    {agendamento.solicitanteObservacoes && (
                        <div className="bg-warning/5 border border-warning/20 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-5 w-5 text-warning" />
                                <span className="text-sm font-semibold text-warning">Observações</span>
                            </div>
                            <p className="text-sm text-warning leading-relaxed">
                                {agendamento.solicitanteObservacoes}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}