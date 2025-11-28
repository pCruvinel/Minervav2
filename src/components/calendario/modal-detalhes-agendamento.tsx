import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, FileText, AlertCircle } from 'lucide-react';

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
                return 'bg-green-100 text-green-800 border-green-200';
            case 'realizado':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'ausente':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'cancelado':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Calendar className="h-5 w-5" />
                        Detalhes do Agendamento
                    </DialogTitle>
                    <DialogDescription>
                        Informações completas sobre o agendamento selecionado.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Status:</span>
                        <Badge className={getStatusColor(agendamento.status)}>
                            {agendamento.status}
                        </Badge>
                    </div>

                    {/* Data e Horário */}
                    <div className="bg-neutral-50 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-neutral-600" />
                            <span className="font-medium">Data:</span>
                            <span>{formatarData(agendamento.data)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <Clock className="h-4 w-4 text-neutral-600" />
                            <span className="font-medium">Horário:</span>
                            <span>{formatarHorario(agendamento.horarioInicio, agendamento.horarioFim)}</span>
                        </div>
                    </div>

                    {/* Categoria */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Categoria:</span>
                        <Badge variant="outline">{agendamento.categoria}</Badge>
                    </div>

                    {/* Setor */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Setor:</span>
                        <Badge variant="outline">{agendamento.setor}</Badge>
                    </div>

                    {/* Nome do Colaborador */}
                    {agendamento.usuarioNome && (
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-neutral-600" />
                            <span className="text-sm font-medium">Colaborador:</span>
                            <span className="text-sm">{agendamento.usuarioNome}</span>
                        </div>
                    )}

                    {/* Ordem de Serviço Vinculada */}
                    {agendamento.osId && (
                        <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-neutral-600" />
                            <span className="text-sm font-medium">OS Vinculada:</span>
                            <span className="text-sm font-mono">{agendamento.osCodigo || agendamento.osId}</span>
                        </div>
                    )}

                    {/* Descrição */}
                    {agendamento.solicitanteObservacoes && (
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="h-4 w-4 text-neutral-600" />
                                <span className="text-sm font-medium">Descrição:</span>
                            </div>
                            <div className="bg-neutral-50 rounded-lg p-3">
                                <p className="text-sm text-neutral-700">{agendamento.solicitanteObservacoes}</p>
                            </div>
                        </div>
                    )}

                    {/* Cliente */}
                    {agendamento.clienteNome && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Cliente:</span>
                            <span className="text-sm">{agendamento.clienteNome}</span>
                        </div>
                    )}

                    {/* Duração */}
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">Duração:</span>
                        <span className="text-sm">{agendamento.duracaoHoras}h</span>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}