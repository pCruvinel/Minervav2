import { useState, useMemo, useCallback, lazy, Suspense } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Plus, Calendar, Clock, Users, Briefcase, Edit, Trash2, Loader2, Lock, Ban } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '../ui/table';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';
import { useTurnos, useDeleteTurno, useTurnosPorSemana, Turno } from '../../lib/hooks/use-turnos';
import { useAgendamentos, useCancelarAgendamento } from '../../lib/hooks/use-agendamentos';
import { useBloqueios, useDeleteBloqueio } from '../../lib/hooks/use-bloqueios';
import { useAuth } from '../../lib/contexts/auth-context';
import { PermissaoUtil } from '../../lib/auth-utils';
import { getBloqueioColor } from '../../lib/design-tokens';
import { BLOQUEIO_MOTIVO_LABELS } from '../../lib/types';

// Lazy load modals
const ModalCriarTurno = lazy(() => import('./modal-criar-turno').then(m => ({ default: m.ModalCriarTurno })));
const ModalDetalhesTurno = lazy(() => import('./modal-detalhes-turno').then(m => ({ default: m.ModalDetalhesTurno })));
const ModalNovoAgendamento = lazy(() => import('./modal-novo-agendamento').then(m => ({ default: m.ModalNovoAgendamento })));
const ModalCriarBloqueio = lazy(() => import('./modal-criar-bloqueio').then(m => ({ default: m.ModalCriarBloqueio })));

/**
 * CalendarioPainelPage - Painel Administrativo do Calendário
 * 
 * Acesso restrito a Admin/Diretoria.
 * Permite gerenciar turnos e agendamentos.
 */
export function CalendarioPainelPage() {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [modalCriarTurno, setModalCriarTurno] = useState(false);
    const [modalDetalhesTurno, setModalDetalhesTurno] = useState(false);
    const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);
    const [modalCriarBloqueio, setModalCriarBloqueio] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState<Turno | null>(null);

    // Verificar se usuário pode acessar esta página (admin/diretoria)
    const podeAcessar = useMemo(() =>
        currentUser && PermissaoUtil.ehDiretoria(currentUser),
        [currentUser]
    );

    // Buscar turnos
    const { turnos, loading: loadingTurnos, refetch: refetchTurnos } = useTurnos();
    const { mutate: deletarTurno, loading: deletando } = useDeleteTurno();

    // Buscar agendamentos para período amplo
    const hoje = useMemo(() => new Date(), []);
    const dataInicio = useMemo(() => {
        const data = new Date(hoje);
        data.setDate(data.getDate() - 30);
        return data.toISOString().split('T')[0];
    }, [hoje]);

    const dataFim = useMemo(() => {
        const data = new Date(hoje);
        data.setDate(data.getDate() + 30);
        return data.toISOString().split('T')[0];
    }, [hoje]);

    const { agendamentos, loading: loadingAgendamentos, refetch: refetchAgendamentos } = useAgendamentos({
        dataInicio,
        dataFim,
    });

    const { mutate: cancelarAgendamento, loading: cancelandoAgendamento } = useCancelarAgendamento();

    const { refetch: refetchTurnosSemana } = useTurnosPorSemana(dataInicio, dataFim);

    // v2.0: Buscar bloqueios
    const { bloqueios, loading: loadingBloqueios, refetch: refetchBloqueios } = useBloqueios({
        dataInicio,
        dataFim
    });
    const { mutate: deletarBloqueio, loading: deletandoBloqueio } = useDeleteBloqueio();

    // Refetch unificado
    const handleRefetch = useCallback(() => {
        refetchTurnos();
        refetchAgendamentos();
        refetchTurnosSemana();
        refetchBloqueios();
    }, [refetchTurnos, refetchAgendamentos, refetchTurnosSemana, refetchBloqueios]);

    // Handler para editar turno
    const handleEditarTurno = (turno: Turno) => {
        setTurnoSelecionado(turno);
        setModalDetalhesTurno(true);
    };

    // Handler para deletar turno
    const handleDeletarTurno = async (turno: Turno) => {
        const confirmado = window.confirm(
            `Tem certeza que deseja excluir o turno ${turno.horaInicio} - ${turno.horaFim}?\n\nEsta ação não pode ser desfeita.`
        );

        if (!confirmado) return;

        try {
            await deletarTurno(turno.id);
            handleRefetch();
        } catch {
            toast.error('Erro ao excluir turno');
        }
    };

    // Handler para cancelar agendamento
    const handleCancelarAgendamento = async (agendamento: any) => {
        const confirmado = window.confirm(
            `Tem certeza que deseja cancelar o agendamento?\n\n` +
            `Colaborador: ${agendamento.usuarioNome || 'N/A'}\n` +
            `Data: ${formatarData(agendamento.data)}\n` +
            `Horário: ${agendamento.horarioInicio} - ${agendamento.horarioFim}\n\n` +
            `Esta ação não pode ser desfeita.`
        );

        if (!confirmado) return;

        const motivo = prompt('Digite o motivo do cancelamento (obrigatório):');
        if (!motivo || motivo.trim() === '') {
            toast.error('O motivo do cancelamento é obrigatório');
            return;
        }

        try {
            await cancelarAgendamento(
                { id: agendamento.id, motivo: motivo.trim() },
                {
                    onSuccess: () => {
                        toast.success('Agendamento cancelado com sucesso!');
                        handleRefetch();
                    },
                    onError: (error: any) => {
                        toast.error(`Erro ao cancelar agendamento: ${error.message || 'Erro desconhecido'}`);
                    }
                }
            );
        } catch (error: any) {
            toast.error(`Erro ao cancelar agendamento: ${error.message || 'Erro desconhecido'}`);
        }
    };

    // v2.0: Handler para deletar bloqueio
    const handleDeletarBloqueio = async (bloqueioId: string) => {
        const confirmado = window.confirm(
            'Tem certeza que deseja remover este bloqueio?\n\nEsta ação não pode ser desfeita.'
        );

        if (!confirmado) return;

        try {
            await deletarBloqueio(bloqueioId);
            toast.success('Bloqueio removido com sucesso!');
            handleRefetch();
        } catch {
            toast.error('Erro ao remover bloqueio');
        }
    };

    // Mapear cor para badge
    const getCorBadge = (cor: string) => {
        switch (cor) {
            case 'verde': return 'bg-success text-success-foreground';
            case 'verm': return 'bg-destructive text-destructive-foreground';
            case 'azul': return 'bg-info text-info-foreground';
            // Fallbacks
            case 'vermelho': return 'bg-destructive text-destructive-foreground';
            case 'primary': return 'bg-success text-success-foreground';
            case 'secondary': return 'bg-info text-info-foreground';
            default: return 'bg-muted text-muted-foreground';
        }
    };

    // Mapear recorrência para texto
    const getRecorrenciaTexto = (tipo: string) => {
        switch (tipo) {
            case 'todos': return 'Todos os dias';
            case 'uteis': return 'Dias úteis (Seg-Sex)';
            case 'custom': return 'Personalizado';
            default: return tipo;
        }
    };

    // Formatar data
    const formatarData = (data: string) => {
        return new Date(data + 'T00:00:00').toLocaleDateString('pt-BR');
    };

    // Redirecionar se não tiver permissão
    if (!podeAcessar) {
        navigate({ to: '/calendario' });
        return null;
    }

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-[1600px] mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-foreground">Painel do Calendário</h1>
                        <p className="text-muted-foreground">Gerencie turnos e agendamentos</p>
                    </div>
                    <div className="flex gap-3">
                        <Button
                            onClick={() => setModalCriarTurno(true)}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Criar Turno
                        </Button>
                        <Button
                            onClick={() => setModalCriarBloqueio(true)}
                            variant="outline"
                            className="text-destructive border-destructive/50 hover:bg-destructive/10"
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            Bloquear Horário
                        </Button>
                        <Button
                            onClick={() => setModalNovoAgendamento(true)}
                            variant="outline"
                        >
                            <Calendar className="h-4 w-4 mr-2" />
                            Criar Agendamento
                        </Button>
                    </div>
                </div>

                {/* Cards de Resumo */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Turnos Ativos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Clock className="h-5 w-5 text-primary" />
                                <span className="text-2xl font-bold">{turnos.length}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Agendamentos (30 dias)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-success" />
                                <span className="text-2xl font-bold">{agendamentos.length}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Vagas Totais
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-info" />
                                <span className="text-2xl font-bold">
                                    {turnos.reduce((acc, t) => acc + t.vagasTotal, 0)}
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">
                                Bloqueios Ativos
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-2">
                                <Ban className="h-5 w-5 text-destructive" />
                                <span className="text-2xl font-bold">
                                    {bloqueios.filter(b => b.ativo).length}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Tabela de Turnos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Turnos Configurados
                        </CardTitle>
                        <CardDescription>
                            Lista de todos os turnos disponíveis para agendamentos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingTurnos ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : turnos.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum turno configurado. Clique em "Criar Turno" para começar.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Horário</TableHead>
                                        <TableHead>Recorrência</TableHead>
                                        <TableHead>Vagas</TableHead>
                                        <TableHead>Setores</TableHead>
                                        <TableHead>Cor</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {turnos.map((turno) => (
                                        <TableRow key={turno.id}>
                                            <TableCell className="font-medium">
                                                {turno.horaInicio} - {turno.horaFim}
                                            </TableCell>
                                            <TableCell>
                                                {getRecorrenciaTexto(turno.tipoRecorrencia)}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{turno.vagasTotal} vagas</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {turno.setores.slice(0, 2).map((setor: string) => (
                                                        <Badge key={setor} variant="secondary" className="text-xs">
                                                            {setor}
                                                        </Badge>
                                                    ))}
                                                    {turno.setores.length > 2 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{turno.setores.length - 2}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className={`w-6 h-6 rounded-full ${getCorBadge(turno.cor)}`} />
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditarTurno(turno)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletarTurno(turno)}
                                                        disabled={deletando}
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Tabela de Agendamentos */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Agendamentos Recentes
                        </CardTitle>
                        <CardDescription>
                            Agendamentos dos últimos 30 dias e próximos 30 dias
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingAgendamentos ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : agendamentos.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum agendamento encontrado no período.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Colaborador</TableHead>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Horário</TableHead>
                                        <TableHead>Setor</TableHead>
                                        <TableHead>Categoria</TableHead>
                                        <TableHead>OS</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {agendamentos.slice(0, 10).map((agendamento) => (
                                        <TableRow key={agendamento.id}>
                                            <TableCell className="font-medium">
                                                {agendamento.usuarioNome || '-'}
                                            </TableCell>
                                            <TableCell>
                                                {formatarData(agendamento.data)}
                                            </TableCell>
                                            <TableCell>
                                                {agendamento.horarioInicio} - {agendamento.horarioFim}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary">
                                                    <Briefcase className="h-3 w-3 mr-1" />
                                                    {agendamento.setor}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {agendamento.categoria}
                                            </TableCell>
                                            <TableCell>
                                                {agendamento.osCodigo || '-'}
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={agendamento.status === 'confirmado' ? 'default' : 'secondary'}
                                                >
                                                    {agendamento.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {agendamento.status !== 'cancelado' && (
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleCancelarAgendamento(agendamento)}
                                                        disabled={cancelandoAgendamento}
                                                        className="text-destructive hover:text-destructive"
                                                        title="Cancelar agendamento"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                        {agendamentos.length > 10 && (
                            <div className="text-center py-4 text-sm text-muted-foreground">
                                Exibindo 10 de {agendamentos.length} agendamentos
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* v2.0: Tabela de Bloqueios */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Bloqueios do Calendário
                        </CardTitle>
                        <CardDescription>
                            Datas e horários bloqueados para agendamentos
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {loadingBloqueios ? (
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                            </div>
                        ) : bloqueios.length === 0 ? (
                            <div className="text-center py-8 text-muted-foreground">
                                Nenhum bloqueio configurado. Clique em "Bloquear Horário" para criar.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Período</TableHead>
                                        <TableHead>Horário</TableHead>
                                        <TableHead>Motivo</TableHead>
                                        <TableHead>Setor</TableHead>
                                        <TableHead>Descrição</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {bloqueios.map((bloqueio) => {
                                        const cor = getBloqueioColor(bloqueio.motivo);
                                        return (
                                            <TableRow key={bloqueio.id}>
                                                <TableCell className="font-medium">
                                                    {formatarData(bloqueio.dataInicio)}
                                                    {bloqueio.dataInicio !== bloqueio.dataFim && (
                                                        <> - {formatarData(bloqueio.dataFim)}</>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {bloqueio.diaInteiro ? (
                                                        <Badge variant="secondary">Dia inteiro</Badge>
                                                    ) : (
                                                        <span className="text-sm">
                                                            {bloqueio.horaInicio} - {bloqueio.horaFim}
                                                        </span>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        style={{
                                                            backgroundColor: cor.bgSolid,
                                                            color: cor.badge.text,
                                                            borderColor: cor.border,
                                                        }}
                                                    >
                                                        {BLOQUEIO_MOTIVO_LABELS[bloqueio.motivo] || bloqueio.motivo}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {bloqueio.setorSlug || 'Todos'}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate">
                                                    {bloqueio.descricao || '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant={bloqueio.ativo ? 'default' : 'secondary'}>
                                                        {bloqueio.ativo ? 'Ativo' : 'Inativo'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDeletarBloqueio(bloqueio.id)}
                                                        disabled={deletandoBloqueio}
                                                        className="text-destructive hover:text-destructive"
                                                        title="Remover bloqueio"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Modais */}
            <Suspense fallback={null}>
                <ModalCriarTurno
                    open={modalCriarTurno}
                    onClose={() => setModalCriarTurno(false)}
                    onSuccess={handleRefetch}
                />
            </Suspense>

            <Suspense fallback={null}>
                <ModalDetalhesTurno
                    open={modalDetalhesTurno}
                    onClose={() => {
                        setModalDetalhesTurno(false);
                        setTurnoSelecionado(null);
                    }}
                    turno={turnoSelecionado}
                    onSuccess={handleRefetch}
                />
            </Suspense>

            <Suspense fallback={null}>
                <ModalNovoAgendamento
                    open={modalNovoAgendamento}
                    onClose={() => setModalNovoAgendamento(false)}
                    turno={turnos[0] || null}
                    dia={new Date()}
                    onSuccess={handleRefetch}
                />
            </Suspense>

            {/* v2.0: Modal de criar bloqueio */}
            <Suspense fallback={null}>
                <ModalCriarBloqueio
                    open={modalCriarBloqueio}
                    onClose={() => setModalCriarBloqueio(false)}
                    onSuccess={handleRefetch}
                />
            </Suspense>
        </div>
    );
}