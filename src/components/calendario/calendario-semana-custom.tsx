import { useState, Suspense, lazy, memo } from 'react';
import { CalendarioHeader } from './calendario-header';
import { CalendarioGrid } from './calendario-grid';
import { useSemanaCalendario, CelulaData } from '@/lib/hooks/use-semana-calendario';
import { useAuth } from '@/lib/contexts/auth-context';
import { PermissaoUtil } from '@/lib/auth-utils';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

// Lazy load modals (reutilizando os existentes)
const ModalNovoAgendamento = lazy(() => import('./modal-novo-agendamento').then(m => ({ default: m.ModalNovoAgendamento })));
const ModalDetalhesAgendamento = lazy(() => import('./modal-detalhes-agendamento').then(m => ({ default: m.ModalDetalhesAgendamento })));

interface CalendarioSemanaCustomProps {
    dataInicial?: Date;
    onRefresh?: () => void;
}

/**
 * CalendarioSemanaCustom - Calendário custom sem FullCalendar
 * 
 * Grid semanal (Dom-Sáb) com turnos e agendamentos.
 * Desenvolvido do zero em React + CSS Grid.
 */
function CalendarioSemanaCustomComponent({ dataInicial, onRefresh }: CalendarioSemanaCustomProps) {
    const { currentUser } = useAuth();
    const [dataAtual, setDataAtual] = useState(dataInicial || new Date());
    const [modalAgendamento, setModalAgendamento] = useState(false);
    const [modalDetalhes, setModalDetalhes] = useState(false);
    const [celulaSelecionada, setCelulaSelecionada] = useState<CelulaData | null>(null);

    const ehAdmin = currentUser && PermissaoUtil.ehDiretoria(currentUser);

    // Calcular início da semana (domingo)
    const calcularInicioSemana = (data: Date) => {
        const d = new Date(data);
        const dia = d.getDay();
        d.setDate(d.getDate() - dia); // Voltar para domingo
        return d.toISOString().split('T')[0];
    };

    // Calcular fim da semana (sábado)
    const calcularFimSemana = (data: Date) => {
        const d = new Date(data);
        const dia = d.getDay();
        d.setDate(d.getDate() + (6 - dia)); // Avançar para sábado
        return d.toISOString().split('T')[0];
    };

    const dataInicio = calcularInicioSemana(dataAtual);
    const dataFim = calcularFimSemana(dataAtual);

    // Carregar dados da semana
    const { semanaData, loading, error, refetch } = useSemanaCalendario(dataInicio, dataFim);

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
        setDataAtual(new Date());
    };

    // Handler de clique em célula
    const handleClickCelula = (celula: CelulaData) => {
        // Verificar se a data/hora já passou
        const agora = new Date();
        const dataHoraCelula = new Date(`${celula.data}T${String(celula.hora).padStart(2, '0')}:00:00`);

        if (dataHoraCelula < agora) {
            toast.error('Não é possível agendar em datas/horários passados');
            return;
        }

        // Verificar permissões
        if (!ehAdmin && !celula.turno) {
            toast.error('Não há turnos disponíveis neste horário');
            return;
        }

        if (!ehAdmin && celula.turno && !celula.podeAgendar) {
            toast.error('Não há vagas disponíveis neste turno');
            return;
        }

        // Verificar setor (colaborador)
        if (!ehAdmin && celula.turno && currentUser) {
            const setorUsuario = currentUser.setor;
            if (setorUsuario && !celula.turno.setores.includes(setorUsuario)) {
                toast.error(`Este turno é exclusivo para: ${celula.turno.setores.join(', ')}`);
                return;
            }
        }

        // Abrir modal de agendamento
        setCelulaSelecionada(celula);
        setModalAgendamento(true);
    };

    const handleRefetchCompleto = () => {
        refetch();
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
            />

            {/* Grid do calendário */}
            <CalendarioGrid
                dias={semanaData.dias}
                celulas={semanaData.celulas}
                onClickCelula={handleClickCelula}
                ehAdmin={!!ehAdmin}
            />

            {/* Modais */}
            <Suspense fallback={null}>
                <ModalNovoAgendamento
                    open={modalAgendamento}
                    onClose={() => {
                        setModalAgendamento(false);
                        setCelulaSelecionada(null);
                    }}
                    turno={celulaSelecionada?.turno as any}
                    dia={celulaSelecionada ? new Date(celulaSelecionada.data + 'T00:00:00') : new Date()}
                    onSuccess={handleRefetchCompleto}
                />
            </Suspense>

            <Suspense fallback={null}>
                <ModalDetalhesAgendamento
                    open={modalDetalhes}
                    onClose={() => setModalDetalhes(false)}
                    agendamento={null}
                />
            </Suspense>
        </div>
    );
}

export const CalendarioSemanaCustom = memo(CalendarioSemanaCustomComponent);