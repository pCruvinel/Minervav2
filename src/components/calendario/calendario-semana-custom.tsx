import { useState, Suspense, lazy, memo } from 'react';
import { CalendarioHeader } from './calendario-header';
import { CalendarioGridV2 } from './calendario-grid-v2';
import { useSemanaCalendario, TurnoProcessado, AgendamentoProcessado } from '@/lib/hooks/use-semana-calendario';
import { useBloqueiosPorPeriodo } from '@/lib/hooks/use-bloqueios';
import { useAuth } from '@/lib/contexts/auth-context';
import { PermissaoUtil } from '@/lib/auth-utils';
import { Loader2 } from 'lucide-react';
import { nowInSaoPaulo, toSaoPauloTime } from '@/lib/utils/timezone';

// Lazy load modals
const ModalNovoAgendamentoV2 = lazy(() => import('./modal-novo-agendamento-v2').then(m => ({ default: m.ModalNovoAgendamentoV2 })));
const ModalCriarBloqueio = lazy(() => import('./modal-criar-bloqueio').then(m => ({ default: m.ModalCriarBloqueio })));
const ModalCriarTurno = lazy(() => import('./modal-criar-turno').then(m => ({ default: m.ModalCriarTurno })));

interface CalendarioSemanaCustomProps {
    dataInicial?: Date;
    onRefresh?: () => void;
    /** Filtro de setor para restringir vagas (usado em OS) */
    setorFiltro?: string;
    /** Callback chamado quando um agendamento é criado com sucesso */
    onAgendamentoCriado?: (agendamento: any) => void;
}

/**
 * CalendarioSemanaCustom - Calendário custom sem FullCalendar
 * 
 * Grid semanal (Dom-Sáb) com turnos e agendamentos.
 * Desenvolvido do zero em React + CSS Grid.
 */
function CalendarioSemanaCustomComponent({ dataInicial, onRefresh, setorFiltro, onAgendamentoCriado }: CalendarioSemanaCustomProps) {
    const { currentUser } = useAuth();
    const [dataAtual, setDataAtual] = useState(dataInicial || new Date());
    
    // v2.0: Estados para modal de agendamento (com turno selecionado)
    const [modalNovoAgendamento, setModalNovoAgendamento] = useState(false);
    const [turnoSelecionado, setTurnoSelecionado] = useState<TurnoProcessado | null>(null);
    const [dataSelecionada, setDataSelecionada] = useState<string>('');
    const [agendamentosDoTurno, setAgendamentosDoTurno] = useState<AgendamentoProcessado[]>([]);
    
    // v2.0: Estados para modais de admin
    const [modalCriarBloqueio, setModalCriarBloqueio] = useState(false);
    const [modalCriarTurno, setModalCriarTurno] = useState(false);

    const ehAdmin = currentUser && PermissaoUtil.ehDiretoria(currentUser);

    // Calcular início da semana (domingo) no timezone de São Paulo
    const calcularInicioSemana = (data: Date) => {
        const d = toSaoPauloTime(data);
        const dia = d.getDay();
        d.setDate(d.getDate() - dia); // Voltar para domingo
        return d.toISOString().split('T')[0];
    };

    // Calcular fim da semana (sábado) no timezone de São Paulo
    const calcularFimSemana = (data: Date) => {
        const d = toSaoPauloTime(data);
        const dia = d.getDay();
        d.setDate(d.getDate() + (6 - dia)); // Avançar para sábado
        return d.toISOString().split('T')[0];
    };

    const dataInicio = calcularInicioSemana(dataAtual);
    const dataFim = calcularFimSemana(dataAtual);

    // Carregar dados da semana
    const { semanaData, loading, error, refetch } = useSemanaCalendario(dataInicio, dataFim);

    // v2.1: Carregar bloqueios da semana
    const { bloqueios, refetch: refetchBloqueios } = useBloqueiosPorPeriodo(dataInicio, dataFim);

    // Handlers de navegação
    const handleSemanaAnterior = () => {
        const nova = new Date(dataAtual);
        nova.setDate(nova.getDate() - 7);
        setDataAtual(nova);
    };

    const handleProximaSemana = () => {
        const nova = new Date(dataAtual);
        nova.setDate(nova.getDate() + 7);
        setDataAtual(nova);
    };

    const handleHoje = () => {
        setDataAtual(nowInSaoPaulo());
    };

    // v2.0: Handler de clique em turno - abre modal de novo agendamento
    const handleClickTurno = (turno: TurnoProcessado, data: string, agendamentos: AgendamentoProcessado[]) => {
        setTurnoSelecionado(turno);
        setDataSelecionada(data);
        setAgendamentosDoTurno(agendamentos);
        setModalNovoAgendamento(true);
    };

    const handleRefetchCompleto = () => {
        refetch();
        refetchBloqueios();
        onRefresh?.();
    };

    // Loading state
    if (loading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Carregando calendário...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="p-6">
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
                    <p className="font-medium">Erro ao carregar calendário</p>
                    <p className="text-sm mt-1">{error.message}</p>
                    <button
                        onClick={() => refetch()}
                        className="mt-2 px-3 py-1 bg-destructive/20 hover:bg-destructive/30 rounded text-sm transition-colors"
                    >
                        Tentar novamente
                    </button>
                </div>
            </div>
        );
    }

    if (!semanaData) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* Header com navegação */}
            <CalendarioHeader
                dataInicio={dataInicio}
                dataFim={dataFim}
                onSemanaAnterior={handleSemanaAnterior}
                onProximaSemana={handleProximaSemana}
                onHoje={handleHoje}
                onCriarBloqueio={() => setModalCriarBloqueio(true)}
                onCriarTurno={() => setModalCriarTurno(true)}
                ehAdmin={!!ehAdmin}
            />

            {/* Grid do calendário v2 - Blocos de Turno */}
            <CalendarioGridV2
                semanaData={semanaData}
                bloqueios={bloqueios}
                onClickTurno={handleClickTurno}
                ehAdmin={!!ehAdmin}
            />

            {/* Modal de novo agendamento v2 */}
            <Suspense fallback={null}>
                <ModalNovoAgendamentoV2
                    open={modalNovoAgendamento}
                    onClose={() => {
                        setModalNovoAgendamento(false);
                        setTurnoSelecionado(null);
                        setDataSelecionada('');
                        setAgendamentosDoTurno([]);
                    }}
                    turno={turnoSelecionado}
                    data={dataSelecionada}
                    agendamentosExistentes={agendamentosDoTurno}
                    setorFiltro={setorFiltro}
                    onSuccess={(agendamento) => {
                        handleRefetchCompleto();
                        onAgendamentoCriado?.(agendamento);
                    }}
                />
            </Suspense>

            {/* v2.0: Modal de criar bloqueio (Admin) */}
            {ehAdmin && (
                <Suspense fallback={null}>
                    <ModalCriarBloqueio
                        open={modalCriarBloqueio}
                        onClose={() => setModalCriarBloqueio(false)}
                        onSuccess={handleRefetchCompleto}
                        dataInicial={dataInicio}
                    />
                </Suspense>
            )}

            {/* v2.0: Modal de criar turno (Admin) */}
            {ehAdmin && (
                <Suspense fallback={null}>
                    <ModalCriarTurno
                        open={modalCriarTurno}
                        onClose={() => setModalCriarTurno(false)}
                        onSuccess={handleRefetchCompleto}
                    />
                </Suspense>
            )}
        </div>
    );
}

export const CalendarioSemanaCustom = memo(CalendarioSemanaCustomComponent);