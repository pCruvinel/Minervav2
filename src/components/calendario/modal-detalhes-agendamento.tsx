import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '../ui/dialog';
import { Badge } from '../ui/badge';
import { Calendar, Clock, User, FileText, AlertCircle, Tag, Briefcase, Timer } from 'lucide-react';
import { categoryColors } from '@/lib/design-tokens';

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

    // Obter cor da categoria
    const categoryColor = categoryColors[agendamento.categoria as keyof typeof categoryColors];

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg p-0">
                {/* Header com Gradiente */}
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 rounded-t-lg">
                    <DialogHeader>
                        <div className="flex items-center justify-between">
                            <DialogTitle className="text-white text-2xl font-semibold flex items-center gap-2">
                                <Calendar className="h-6 w-6" />
                                Detalhes do Agendamento
                            </DialogTitle>
                            <Badge className={`${getStatusColor(agendamento.status)} px-3 py-1 text-sm font-medium`}>
                                {agendamento.status}
                            </Badge>
                        </div>
                        <DialogDescription className="text-indigo-50 mt-2">
                            Informações completas sobre o agendamento selecionado.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="space-y-4 p-6">
                    {/* Data e Horário Card */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 space-y-3 border border-blue-100 shadow-sm">
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

                    {/* Info Cards Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Categoria Card */}
                        <div
                            className="rounded-xl p-4 border-2 shadow-sm"
                            style={{
                                backgroundColor: categoryColor?.bg || '#DBEAFE',
                                borderColor: categoryColor?.border || '#93C5FD'
                            }}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <Tag className="h-4 w-4" style={{ color: categoryColor?.text || '#1E40AF' }} />
                                <span className="text-xs font-medium opacity-75" style={{ color: categoryColor?.text || '#1E40AF' }}>
                                    Categoria
                                </span>
                            </div>
                            <p className="font-semibold" style={{ color: categoryColor?.text || '#1E40AF' }}>
                                {agendamento.categoria}
                            </p>
                        </div>

                        {/* Setor Card */}
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 border-2 border-purple-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Briefcase className="h-4 w-4 text-purple-600" />
                                <span className="text-xs font-medium text-purple-600 opacity-75">Setor</span>
                            </div>
                            <p className="font-semibold text-purple-900">{agendamento.setor}</p>
                        </div>

                        {/* Duração Card */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl p-4 border-2 border-orange-100 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Timer className="h-4 w-4 text-orange-600" />
                                <span className="text-xs font-medium text-orange-600 opacity-75">Duração</span>
                            </div>
                            <p className="font-semibold text-orange-900">{agendamento.duracaoHoras}h</p>
                        </div>

                        {/* Colaborador Card (se existir) */}
                        {agendamento.usuarioNome && (
                            <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border-2 border-emerald-100 shadow-sm">
                                <div className="flex items-center gap-2 mb-1">
                                    <User className="h-4 w-4 text-emerald-600" />
                                    <span className="text-xs font-medium text-emerald-600 opacity-75">Colaborador</span>
                                </div>
                                <p className="font-semibold text-emerald-900 truncate" title={agendamento.usuarioNome}>
                                    {agendamento.usuarioNome}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* OS Vinculada (se existir) */}
                    {agendamento.osId && (
                        <div className="bg-gradient-to-r from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-200 rounded-lg p-2">
                                    <FileText className="h-5 w-5 text-slate-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-600 font-medium">OS Vinculada</p>
                                    <p className="text-sm font-semibold text-slate-900 font-mono">
                                        {agendamento.osCodigo || agendamento.osId}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Cliente (se existir) */}
                    {agendamento.clienteNome && (
                        <div className="bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-4 border border-sky-200 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="bg-sky-200 rounded-lg p-2">
                                    <User className="h-5 w-5 text-sky-700" />
                                </div>
                                <div>
                                    <p className="text-xs text-sky-600 font-medium">Cliente</p>
                                    <p className="text-sm font-semibold text-sky-900">{agendamento.clienteNome}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Descrição (se existir) */}
                    {agendamento.solicitanteObservacoes && (
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle className="h-5 w-5 text-amber-600" />
                                <span className="text-sm font-semibold text-amber-900">Observações</span>
                            </div>
                            <p className="text-sm text-amber-800 leading-relaxed">
                                {agendamento.solicitanteObservacoes}
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}