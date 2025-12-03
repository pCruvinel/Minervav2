import { useState, Suspense, lazy, memo } from 'react';
import { CalendarioHeaderMes } from './calendario-header-mes';
import { CalendarioGridMes } from './calendario-grid-mes';
import { useMesCalendario } from '@/lib/hooks/use-mes-calendario';
import { Loader2 } from 'lucide-react';
import { nowInSaoPaulo } from '@/lib/utils/timezone';

// Lazy load modal
const ModalDetalhesDia = lazy(() => import('./modal-detalhes-dia').then(m => ({ default: m.ModalDetalhesDia })));

interface CalendarioMesProps {
  mesInicial?: Date;
  onRefresh?: () => void;
}

/**
 * CalendarioMes - Visualização mensal do calendário
 *
 * Grid 7×6 (42 células) mostrando turnos e agendamentos do mês.
 * Click em célula abre modal com detalhes do dia.
 */
function CalendarioMesComponent({ mesInicial, onRefresh }: CalendarioMesProps) {
  const [dataAtual, setDataAtual] = useState(mesInicial || nowInSaoPaulo());
  const [modalDia, setModalDia] = useState(false);
  const [diaSelecionado, setDiaSelecionado] = useState<string | null>(null);

  // Calcular primeiro dia do mês no formato YYYY-MM-01
  const calcularInicioMes = (data: Date) => {
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    return `${ano}-${mes}-01`;
  };

  const mesInicio = calcularInicioMes(dataAtual);

  // Carregar dados do mês
  const { mesData, loading, error, refetch } = useMesCalendario(mesInicio);

  // Handlers de navegação
  const handleMesAnterior = () => {
    const nova = new Date(dataAtual);
    nova.setMonth(nova.getMonth() - 1);
    setDataAtual(nova);
  };

  const handleProximoMes = () => {
    const nova = new Date(dataAtual);
    nova.setMonth(nova.getMonth() + 1);
    setDataAtual(nova);
  };

  const handleHoje = () => {
    setDataAtual(nowInSaoPaulo());
  };

  // Handler de clique em célula
  const handleClickCelula = (data: string) => {
    setDiaSelecionado(data);
    setModalDia(true);
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

  if (!mesData) {
    return null;
  }

  // Encontrar célula selecionada
  const celulaSelecionada = diaSelecionado
    ? mesData.celulas.find(c => c.data === diaSelecionado)
    : null;

  return (
    <div className="space-y-4">
      {/* Header com navegação */}
      <CalendarioHeaderMes
        mesInicio={mesInicio}
        onMesAnterior={handleMesAnterior}
        onProximoMes={handleProximoMes}
        onHoje={handleHoje}
      />

      {/* Grid mensal */}
      <CalendarioGridMes
        celulas={mesData.celulas}
        onCelulaClick={handleClickCelula}
      />

      {/* Modal de detalhes do dia */}
      <Suspense fallback={null}>
        <ModalDetalhesDia
          open={modalDia}
          onClose={() => {
            setModalDia(false);
            setDiaSelecionado(null);
          }}
          celula={celulaSelecionada || undefined}
          onSuccess={handleRefetchCompleto}
        />
      </Suspense>
    </div>
  );
}

export const CalendarioMes = memo(CalendarioMesComponent);
