import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Checkbox } from '../ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import {
  Calendar as CalendarIcon,
  User,
  CheckCircle,
  XCircle,
  Clock,
  MessageSquare,
  Copy,
  Users,
  DollarSign,
  ChevronDown,
  Loader2,
  PieChart,
  AlertTriangle
} from 'lucide-react';
import { cn } from '../ui/utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { Colaborador } from '@/types/colaborador';
import { CentroCusto } from '@/lib/hooks/use-centro-custo';
import { useAuth } from '@/lib/contexts/auth-context';

interface RegistroPresenca {
  colaboradorId: string;
  status: 'OK' | 'ATRASADO' | 'FALTA';
  performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
  centrosCusto: string[];
  justificativaStatus?: string;
  justificativaPerformance?: string;
  minutosAtraso?: number;
  anexoUrl?: string;
  confirmedAt?: string;
  confirmedBy?: string;
}

// Interface para rateio de CC
interface RateioCC {
  ccId: string;
  ccNome: string;
  percentual: number;
}

interface ColaboradorRateio {
  colaboradorId: string;
  colaboradorNome: string;
  centrosCusto: RateioCC[];
}

export function ControlePresencaTabelaPage() {
  const { currentUser } = useAuth();
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [registros, setRegistros] = useState<Record<string, RegistroPresenca>>({});
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [modalJustificativaOpen, setModalJustificativaOpen] = useState(false);
  const [modalConfirmacaoOpen, setModalConfirmacaoOpen] = useState(false);
  const [modalRateioOpen, setModalRateioOpen] = useState(false);
  const [colaboradorAtual, setColaboradorAtual] = useState<string | null>(null);
  const [tipoJustificativa, setTipoJustificativa] = useState<'STATUS' | 'PERFORMANCE'>('STATUS');
  const [setorFiltro, setSetorFiltro] = useState<string>('todos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [colaboradoresRateio, setColaboradoresRateio] = useState<ColaboradorRateio[]>([]);

  // Carregar dados iniciais (Colaboradores e Centros de Custo)
  useEffect(() => {
    const fetchDadosIniciais = async () => {
      try {
        setLoading(true);
        const [colsRes, ccRes] = await Promise.all([
          supabase.from('colaboradores').select('*').eq('ativo', true).order('nome_completo'),
          supabase.from('centros_custo').select('id, nome').eq('ativo', true).order('nome')
        ]);

        if (colsRes.error) throw colsRes.error;
        if (ccRes.error) throw ccRes.error;

        setColaboradores(colsRes.data || []);
        setCentrosCusto(ccRes.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados iniciais:', error);
        toast.error('Erro ao carregar colaboradores e centros de custo.');
      } finally {
        setLoading(false);
      }
    };

    fetchDadosIniciais();
  }, []);

  // Carregar registros do dia selecionado
  useEffect(() => {
    if (colaboradores.length > 0) {
      fetchRegistrosDoDia(dataSelecionada);
    }
  }, [dataSelecionada, colaboradores]);

  const fetchRegistrosDoDia = async (date: Date) => {
    try {
      setLoading(true);
      const dateStr = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('registros_presenca')
        .select('*')
        .eq('data', dateStr);

      if (error) throw error;

      const novosRegistros: Record<string, RegistroPresenca> = {};

      // Inicializar todos com padrão
      colaboradores.forEach(col => {
        novosRegistros[col.id] = {
          colaboradorId: col.id,
          status: 'OK',
          performance: 'BOA',
          centrosCusto: [],
        };
      });

      // Sobrescrever com dados do banco se existirem
      if (data && data.length > 0) {
        data.forEach(reg => {
          if (novosRegistros[reg.colaborador_id]) {
            novosRegistros[reg.colaborador_id] = {
              colaboradorId: reg.colaborador_id,
              status: reg.status as any,
              performance: reg.performance as any,
              centrosCusto: reg.centros_custo || [],
              justificativaStatus: reg.justificativa,
              justificativaPerformance: reg.performance_justificativa,
              minutosAtraso: reg.minutos_atraso,
              anexoUrl: reg.anexo_url,
              confirmedAt: reg.confirmed_at,
              confirmedBy: reg.confirmed_by
            };
          }
        });
      }

      setRegistros(novosRegistros);
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      toast.error('Erro ao carregar registros do dia.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSelecionarTodos = (checked: boolean) => {
    if (checked) {
      setSelecionados(new Set(colaboradores.map(c => c.id)));
    } else {
      setSelecionados(new Set());
    }
  };

  const handleSelecionarColaborador = (id: string, checked: boolean) => {
    const novos = new Set(selecionados);
    if (checked) {
      novos.add(id);
    } else {
      novos.delete(id);
    }
    setSelecionados(novos);
  };

  const handleRepetirAlocacaoOntem = async () => {
    try {
      const ontem = subDays(dataSelecionada, 1);
      const dateStr = format(ontem, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('registros_presenca')
        .select('colaborador_id, centros_custo, status, performance')
        .eq('data', dateStr);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast.info('Nenhum registro encontrado no dia anterior.');
        return;
      }

      setRegistros(prev => {
        const novos = { ...prev };
        data.forEach(reg => {
          if (novos[reg.colaborador_id]) {
            novos[reg.colaborador_id] = {
              ...novos[reg.colaborador_id],
              centrosCusto: reg.centros_custo || [],
              status: reg.status || 'OK',
              performance: reg.performance || 'BOA',
              // Limpar justificativas do dia anterior (não devem ser copiadas)
              justificativaStatus: undefined,
              justificativaPerformance: undefined,
              minutosAtraso: undefined,
            };
          }
        });
        return novos;
      });

      toast.success(`✅ Presença de ${format(ontem, 'dd/MM')} copiada com sucesso!`);
    } catch (error) {
      console.error('Erro ao replicar alocação:', error);
      toast.error('Erro ao buscar dados do dia anterior.');
    }
  };

  const handleStatusChange = (colaboradorId: string, status: RegistroPresenca['status']) => {
    if (status === 'FALTA' || status === 'ATRASADO') {
      setColaboradorAtual(colaboradorId);
      setTipoJustificativa('STATUS');
      setModalJustificativaOpen(true);
    }

    setRegistros(prev => ({
      ...prev,
      [colaboradorId]: {
        ...prev[colaboradorId],
        status,
        justificativaStatus: status === 'OK' ? undefined : prev[colaboradorId].justificativaStatus,
        minutosAtraso: status === 'ATRASADO' ? prev[colaboradorId].minutosAtraso : undefined,
      }
    }));
  };

  const handlePerformanceChange = (colaboradorId: string, performance: RegistroPresenca['performance']) => {
    if (performance === 'RUIM') {
      setColaboradorAtual(colaboradorId);
      setTipoJustificativa('PERFORMANCE');
      setModalJustificativaOpen(true);
    }

    setRegistros(prev => ({
      ...prev,
      [colaboradorId]: {
        ...prev[colaboradorId],
        performance,
        justificativaPerformance: performance === 'RUIM' ? prev[colaboradorId].justificativaPerformance : undefined,
      }
    }));
  };

  const handleCentroCustoToggle = (colaboradorId: string, centroCustoId: string) => {
    setRegistros(prev => {
      const centrosAtuais = prev[colaboradorId].centrosCusto;
      const novos = centrosAtuais.includes(centroCustoId)
        ? centrosAtuais.filter(id => id !== centroCustoId)
        : [...centrosAtuais, centroCustoId];

      return {
        ...prev,
        [colaboradorId]: {
          ...prev[colaboradorId],
          centrosCusto: novos,
        }
      };
    });
  };

  const handleSalvarJustificativa = (justificativa: string, minutosAtraso?: number) => {
    if (!colaboradorAtual) return;

    setRegistros(prev => ({
      ...prev,
      [colaboradorAtual]: {
        ...prev[colaboradorAtual],
        ...(tipoJustificativa === 'STATUS'
          ? { justificativaStatus: justificativa, minutosAtraso }
          : { justificativaPerformance: justificativa }
        ),
      }
    }));

    setModalJustificativaOpen(false);
    setColaboradorAtual(null);
  };

  const calcularCustoDia = (colaborador: Colaborador) => {
    if (colaborador.tipo_contratacao === 'CLT') {
      return (colaborador.salario_base || 0) * 1.46 / 22;
    }
    return colaborador.custo_dia || 0;
  };

  const calcularCustoTotalDia = () => {
    return colaboradores.reduce((total, col) => {
      const registro = registros[col.id];
      if (!registro || registro.status === 'FALTA') return total;
      return total + calcularCustoDia(col);
    }, 0);
  };

  const calcularEstatisticas = () => {
    const presentes = colaboradores.filter(col => registros[col.id]?.status !== 'FALTA').length;
    const ausentes = colaboradores.length - presentes;
    const atrasados = colaboradores.filter(col => registros[col.id]?.status === 'ATRASADO').length;

    return { presentes, ausentes, atrasados };
  };

  const handleAbrirModalConfirmacao = () => {
    const erros: string[] = [];

    // Verificar se usuário está autenticado
    if (!currentUser?.id) {
      toast.error('Usuário não autenticado. Faça login para confirmar presenças.');
      return;
    }

    // Validação
    colaboradores.forEach(col => {
      const registro = registros[col.id];
      if (!registro) return;

      if (col.setor !== 'administrativo' && registro.status !== 'FALTA' && registro.centrosCusto.length === 0) {
        erros.push(`${col.nome_completo} precisa ter pelo menos 1 Centro de Custo`);
      }
      if ((registro.status === 'FALTA' || registro.status === 'ATRASADO') && !registro.justificativaStatus) {
        erros.push(`${col.nome_completo} precisa ter justificativa de ${registro.status === 'FALTA' ? 'falta' : 'atraso'}`);
      }
      if (registro.performance === 'RUIM' && !registro.justificativaPerformance) {
        erros.push(`${col.nome_completo} precisa ter justificativa de performance ruim`);
      }
      if (registro.status === 'ATRASADO' && !registro.minutosAtraso) {
        erros.push(`${col.nome_completo} precisa informar os minutos de atraso`);
      }
    });

    if (erros.length > 0) {
      toast.error(erros[0]);
      return;
    }

    // Identificar colaboradores com múltiplos CCs (precisam de rateio)
    const colabsComMultiplosCCs: ColaboradorRateio[] = [];
    
    colaboradores.forEach(col => {
      const registro = registros[col.id];
      if (!registro || registro.status === 'FALTA') return;
      
      // Só precisa de rateio se tiver mais de 1 CC
      if (registro.centrosCusto.length > 1) {
        const percentualIgual = Math.round(100 / registro.centrosCusto.length);
        colabsComMultiplosCCs.push({
          colaboradorId: col.id,
          colaboradorNome: col.nome_completo || '',
          centrosCusto: registro.centrosCusto.map((ccId, index) => ({
            ccId,
            ccNome: getCentroCustoNome(ccId),
            // Último CC pega o resto para garantir soma = 100
            percentual: index === registro.centrosCusto.length - 1 
              ? 100 - (percentualIgual * (registro.centrosCusto.length - 1))
              : percentualIgual
          }))
        });
      }
    });

    // Se tem colaboradores com múltiplos CCs, mostrar modal de rateio primeiro
    if (colabsComMultiplosCCs.length > 0) {
      setColaboradoresRateio(colabsComMultiplosCCs);
      setModalRateioOpen(true);
      return;
    }

    // Se não tem rateio para fazer, ir direto para confirmação
    setModalConfirmacaoOpen(true);
  };

  const handleConfirmarRegistros = async () => {
    const dateStr = format(dataSelecionada, 'yyyy-MM-dd');

    try {
      setSaving(true);

      const upsertData = colaboradores.map(col => {
        const reg = registros[col.id];
        return {
          colaborador_id: col.id,
          data: dateStr,
          status: reg.status,
          minutos_atraso: reg.minutosAtraso || null,
          justificativa: reg.justificativaStatus || null,
          performance: reg.performance,
          performance_justificativa: reg.justificativaPerformance || null,
          centros_custo: reg.centrosCusto,
          anexo_url: reg.anexoUrl || null,
          confirmed_at: new Date().toISOString(),
          confirmed_by: currentUser?.id || null,
          confirmed_changes: {
            timestamp: new Date().toISOString(),
            action: 'confirmed',
            previous_state: reg.confirmedAt ? 'confirmed' : 'draft'
          },
          updated_at: new Date().toISOString()
        };
      });

      // 1. Salvar registros de presença
      const { data: registrosSalvos, error } = await supabase
        .from('registros_presenca')
        .upsert(upsertData, {
          onConflict: 'colaborador_id,data',
          ignoreDuplicates: false
        })
        .select('id, colaborador_id');

      if (error) throw error;

      // 2. Preparar dados de alocação por CC (para tabela alocacao_horas_cc)
      const alocacoesParaSalvar: Array<{
        registro_presenca_id: string;
        cc_id: string;
        percentual: number;
      }> = [];

      // Criar mapa de colaborador_id -> registro_presenca_id
      const registroIdMap = new Map<string, string>();
      
      // Buscar IDs dos registros criados/atualizados
      const { data: registrosComIds } = await supabase
        .from('registros_presenca')
        .select('id, colaborador_id')
        .eq('data', dateStr);

      registrosComIds?.forEach(r => {
        registroIdMap.set(r.colaborador_id, r.id);
      });

      // Montar alocações
      colaboradores.forEach(col => {
        const reg = registros[col.id];
        if (!reg || reg.status === 'FALTA' || reg.centrosCusto.length === 0) return;

        const registroPresencaId = registroIdMap.get(col.id);
        if (!registroPresencaId) return;

        // Verificar se tem rateio definido
        const rateioDefinido = colaboradoresRateio.find(cr => cr.colaboradorId === col.id);

        if (rateioDefinido) {
          // Usar percentuais definidos no modal
          rateioDefinido.centrosCusto.forEach(cc => {
            alocacoesParaSalvar.push({
              registro_presenca_id: registroPresencaId,
              cc_id: cc.ccId,
              percentual: cc.percentual
            });
          });
        } else {
          // CC único = 100%
          reg.centrosCusto.forEach(ccId => {
            alocacoesParaSalvar.push({
              registro_presenca_id: registroPresencaId,
              cc_id: ccId,
              percentual: reg.centrosCusto.length === 1 ? 100 : Math.round(100 / reg.centrosCusto.length)
            });
          });
        }
      });

      // 3. Deletar alocações antigas do dia e inserir novas
      if (alocacoesParaSalvar.length > 0) {
        // Buscar IDs de registros do dia para deletar alocações antigas
        const registroIds = Array.from(registroIdMap.values());
        
        // Deletar alocações existentes
        await supabase
          .from('alocacao_horas_cc')
          .delete()
          .in('registro_presenca_id', registroIds);

        // Inserir novas alocações
        const { error: alocError } = await supabase
          .from('alocacao_horas_cc')
          .insert(alocacoesParaSalvar);

        if (alocError) {
          console.error('Erro ao salvar alocações:', alocError);
          // Não falhar toda operação, só logar
        }
      }

      toast.success(`✅ Presença registrada para ${format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })}!`);

      // Fechar modais e recarregar
      setModalConfirmacaoOpen(false);
      setModalRateioOpen(false);
      setColaboradoresRateio([]);
      fetchRegistrosDoDia(dataSelecionada);

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error(error.message || 'Erro ao salvar registros.');
    } finally {
      setSaving(false);
    }
  };

  const getCentroCustoNome = (id: string) => {
    return centrosCusto.find(cc => cc.id === id)?.nome || id;
  };

  const isRegistroConfirmado = (registro: RegistroPresenca) => {
    return registro.confirmedAt !== null && registro.confirmedAt !== undefined;
  };

  const handleReverterConfirmacao = async () => {
    try {
      setSaving(true);
      const dateStr = format(dataSelecionada, 'yyyy-MM-dd');

      const { error } = await supabase
        .from('registros_presenca')
        .update({
          confirmed_at: null,
          confirmed_by: null,
          confirmed_changes: null,
          updated_at: new Date().toISOString()
        })
        .eq('data', dateStr);

      if (error) throw error;

      toast.success('✅ Confirmação revertida! Agora é possível editar os registros.');

      // Recarregar para refletir mudanças
      fetchRegistrosDoDia(dataSelecionada);

    } catch (error: any) {
      console.error('Erro ao reverter confirmação:', error);
      toast.error(error.message || 'Erro ao reverter confirmação.');
    } finally {
      setSaving(false);
    }
  };

  const stats = calcularEstatisticas();
  const custoTotalDia = calcularCustoTotalDia();
  const todosSelecionados = selecionados.size === colaboradores.length;
  const algumRegistroConfirmado = colaboradores.some(col => isRegistroConfirmado(registros[col.id] || { status: 'OK', performance: 'BOA', centrosCusto: [] }));

  // Filtrar colaboradores por setor
  const colaboradoresFiltrados = colaboradores.filter(col =>
    setorFiltro === 'todos' || col.setor === setorFiltro
  );

  // Obter setores únicos para o filtro
  const setoresUnicos = Array.from(new Set(colaboradores.map(col => col.setor))).filter(Boolean).sort();

  // Função para validar campos obrigatórios visualmente
  const getValidationClass = (colaborador: Colaborador, registro: RegistroPresenca, field: 'status' | 'performance' | 'centrosCusto') => {
    if (isRegistroConfirmado(registro)) return '';

    let hasError = false;

    switch (field) {
      case 'centrosCusto':
        hasError = colaborador.setor !== 'administrativo' && registro.status !== 'FALTA' && registro.centrosCusto.length === 0;
        break;
      case 'status':
        hasError = (registro.status === 'FALTA' || registro.status === 'ATRASADO') && !registro.justificativaStatus;
        break;
      case 'performance':
        hasError = registro.performance === 'RUIM' && !registro.justificativaPerformance;
        break;
    }

    return hasError ? 'border-destructive' : '';
  };

  if (loading && colaboradores.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Barra Superior */}
        <div className="bg-white border-b px-6 py-4 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl mb-1">Controle de Presença Diária</h1>
              <p className="text-sm text-muted-foreground">
                Interface de alta produtividade para lançamento rápido
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Resumo */}
              <div className="flex items-center gap-4 px-4 py-2 bg-muted rounded-lg border">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    <strong>Total:</strong> {colaboradores.length}
                  </span>
                </div>
                <div className="h-4 w-px bg-border" />
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-success" />
                  <span className="text-sm">
                    <strong>Presentes:</strong> {stats.presentes}
                  </span>
                </div>
                {stats.ausentes > 0 && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm">
                        <strong>Ausentes:</strong> {stats.ausentes}
                      </span>
                    </div>
                  </>
                )}
                {stats.atrasados > 0 && (
                  <>
                    <div className="h-4 w-px bg-border" />
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-warning" />
                      <span className="text-sm">
                        <strong>Atrasados:</strong> {stats.atrasados}
                      </span>
                    </div>
                  </>
                )}
              </div>

              <Button variant="outline" onClick={handleRepetirAlocacaoOntem} disabled={loading || algumRegistroConfirmado}>
                <Copy className="mr-2 h-4 w-4" />
                Repetir Alocação de Ontem
              </Button>

              <Select value={setorFiltro} onValueChange={setSetorFiltro}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filtrar por setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os setores</SelectItem>
                  {setoresUnicos.map(setor => (
                    <SelectItem key={setor} value={setor}>
                      {setor.charAt(0).toUpperCase() + setor.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {algumRegistroConfirmado && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                    <CheckCircle className="mr-1 h-3 w-3" />
                    Confirmado
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleReverterConfirmacao}
                    disabled={saving}
                    className="text-xs"
                  >
                    Reverter Confirmação
                  </Button>
                </div>
              )}

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-64">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dataSelecionada, "dd 'de' MMMM", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="single"
                    selected={dataSelecionada}
                    onSelect={(date) => date && setDataSelecionada(date)}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>

        {/* Tabela Grid */}
        <div className="flex-1 overflow-auto px-6 py-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="w-12">
                      <Checkbox
                        checked={todosSelecionados}
                        onCheckedChange={handleSelecionarTodos}
                      />
                    </TableHead>
                    <TableHead className="w-80">Colaborador</TableHead>
                    <TableHead className="w-32">Setor</TableHead>
                    <TableHead className="w-48">Status</TableHead>
                    <TableHead className="w-48">Performance</TableHead>
                    <TableHead className="w-80">Centro de Custo</TableHead>
                    <TableHead className="w-20 text-center">Info</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {colaboradoresFiltrados.map((colaborador) => {
                    const registro = registros[colaborador.id] || { status: 'OK', performance: 'BOA', centrosCusto: [] };
                    const temJustificativa = registro.justificativaStatus || registro.justificativaPerformance;

                    return (
                      <TableRow
                        key={colaborador.id}
                        className={cn(
                          "hover:bg-muted",
                          registro.status === 'FALTA' && "bg-destructive/5",
                          registro.status === 'ATRASADO' && "bg-warning/5"
                        )}
                      >
                        <TableCell>
                          <Checkbox
                            checked={selecionados.has(colaborador.id)}
                            onCheckedChange={(checked) => handleSelecionarColaborador(colaborador.id, checked as boolean)}
                          />
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                              {colaborador.avatar_url ? (
                                <img src={colaborador.avatar_url} alt={colaborador.nome} className="w-full h-full object-cover" />
                              ) : (
                                <User className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{colaborador.nome_completo}</p>
                              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <span className="capitalize">{colaborador.funcao?.replace('_', ' ').toLowerCase() || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {colaborador.setor || '-'}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <Select
                            value={registro.status}
                            onValueChange={(value) => handleStatusChange(colaborador.id, value as RegistroPresenca['status'])}
                            disabled={isRegistroConfirmado(registro)}
                          >
                            <SelectTrigger className={cn("w-full", getValidationClass(colaborador, registro, 'status'))}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OK">OK</SelectItem>
                              <SelectItem value="ATRASADO">Atrasado</SelectItem>
                              <SelectItem value="FALTA">Falta</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <Select
                            value={registro.performance}
                            onValueChange={(value) => handlePerformanceChange(colaborador.id, value as RegistroPresenca['performance'])}
                            disabled={isRegistroConfirmado(registro)}
                          >
                            <SelectTrigger className={cn("w-full", getValidationClass(colaborador, registro, 'performance'))}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OTIMA">Ótima</SelectItem>
                              <SelectItem value="BOA">Boa</SelectItem>
                              <SelectItem value="REGULAR">Regular</SelectItem>
                              <SelectItem value="RUIM">Ruim</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>

                        <TableCell>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn("w-full justify-between h-auto min-h-10 py-2", getValidationClass(colaborador, registro, 'centrosCusto'))}
                                disabled={isRegistroConfirmado(registro)}
                              >
                                <div className="flex flex-wrap gap-1">
                                  {registro.centrosCusto && registro.centrosCusto.length > 0 ? (
                                    registro.centrosCusto.map(ccId => (
                                      <Badge
                                        key={ccId}
                                        variant="secondary"
                                        className="text-xs bg-info/10 text-info"
                                      >
                                        {getCentroCustoNome(ccId)}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-sm text-muted-foreground">
                                      Selecione os CCs...
                                    </span>
                                  )}
                                </div>
                                <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-96" align="start">
                              <div className="space-y-2">
                                <Label className="text-sm font-medium">
                                  Centros de Custo (Multiselect)
                                </Label>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                  {centrosCusto.map(cc => (
                                    <label
                                      key={cc.id}
                                      className={cn(
                                        "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border",
                                        registro.centrosCusto?.includes(cc.id)
                                          ? "border-primary bg-primary/5"
                                          : "border-transparent hover:bg-muted"
                                      )}
                                    >
                                      <Checkbox
                                        checked={registro.centrosCusto?.includes(cc.id)}
                                        onCheckedChange={() => handleCentroCustoToggle(colaborador.id, cc.id)}
                                      />
                                      <span className="text-sm flex-1">{cc.nome}</span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </TableCell>

                        <TableCell className="text-center">
                          {temJustificativa && (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MessageSquare className="h-4 w-4 text-primary" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-80" align="end">
                                <div className="space-y-2">
                                  {registro.justificativaStatus && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        Justificativa de {registro.status === 'FALTA' ? 'Falta' : 'Atraso'}
                                        {registro.minutosAtraso && ` (${registro.minutosAtraso} min)`}
                                      </Label>
                                      <p className="text-sm mt-1">{registro.justificativaStatus}</p>
                                    </div>
                                  )}
                                  {registro.justificativaPerformance && (
                                    <div>
                                      <Label className="text-xs text-muted-foreground">
                                        Justificativa de Performance
                                      </Label>
                                      <p className="text-sm mt-1">{registro.justificativaPerformance}</p>
                                    </div>
                                  )}
                                </div>
                              </PopoverContent>
                            </Popover>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Rodapé Fixo */}
        <div className="bg-white border-t px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <DollarSign className="h-6 w-6 text-primary" />
                <div>
                  <p className="text-xs text-muted-foreground">Custo Total do Dia (Rateado)</p>
                  <p className="text-2xl font-medium text-primary">{formatCurrency(custoTotalDia)}</p>
                </div>
              </div>

              <div className="h-12 w-px bg-border" />

              <div className="text-sm space-y-1">
                <p className="text-muted-foreground">
                  <strong>{stats.presentes}</strong> presentes •
                  <strong className="ml-2">{stats.ausentes}</strong> ausentes
                  {stats.atrasados > 0 && (
                    <> • <strong className="text-warning">{stats.atrasados}</strong> atrasados</>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {colaboradores.filter(c => registros[c.id]?.centrosCusto?.length > 0).length} colaboradores com CC alocado
                </p>
              </div>
            </div>

            <Button size="lg" onClick={handleAbrirModalConfirmacao} className="px-8" disabled={saving || algumRegistroConfirmado}>
              {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
              {algumRegistroConfirmado ? 'Presenças Já Confirmadas' : 'Registrar'}
            </Button>
          </div>
        </div>

        {/* Modal de Confirmação */}
        <Dialog open={modalConfirmacaoOpen} onOpenChange={setModalConfirmacaoOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirmar Registro de Presenças</DialogTitle>
              <DialogDescription>
                Você deseja registrar as presenças do dia {format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })}?
                Esta ação irá confirmar todos os registros e não poderá ser desfeita sem autorização administrativa.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter>
              <Button variant="outline" onClick={() => setModalConfirmacaoOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmarRegistros} disabled={saving}>
                {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Confirmar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Modal de Rateio de Centros de Custo */}
        <ModalRateioCC
          open={modalRateioOpen}
          onClose={() => {
            setModalRateioOpen(false);
            setColaboradoresRateio([]);
          }}
          colaboradores={colaboradoresRateio}
          onConfirmar={(rateiosAtualizados) => {
            setColaboradoresRateio(rateiosAtualizados);
            setModalRateioOpen(false);
            setModalConfirmacaoOpen(true);
          }}
        />

        {/* Modal de Justificativa */}
        <ModalJustificativa
          open={modalJustificativaOpen}
          onClose={() => {
            setModalJustificativaOpen(false);
            setColaboradorAtual(null);
          }}
          onSalvar={handleSalvarJustificativa}
          tipo={tipoJustificativa}
          colaboradorNome={colaboradores.find(c => c.id === colaboradorAtual)?.nome_completo || ''}
          status={colaboradorAtual ? registros[colaboradorAtual]?.status : 'OK'}
        />
      </div>
    </TooltipProvider>
  );
}

// Modal de Justificativa
interface ModalJustificativaProps {
  open: boolean;
  onClose: () => void;
  onSalvar: (justificativa: string, minutosAtraso?: number) => void;
  tipo: 'STATUS' | 'PERFORMANCE';
  colaboradorNome: string;
  status: RegistroPresenca['status'];
}

function ModalJustificativa({ open, onClose, onSalvar, tipo, colaboradorNome, status }: ModalJustificativaProps) {
  const [justificativa, setJustificativa] = useState('');
  const [minutosAtraso, setMinutosAtraso] = useState('');

  const handleSalvar = () => {
    if (!justificativa.trim()) {
      toast.error('Preencha a justificativa');
      return;
    }

    if (status === 'ATRASADO' && !minutosAtraso) {
      toast.error('Informe os minutos de atraso');
      return;
    }

    onSalvar(justificativa, minutosAtraso ? parseInt(minutosAtraso) : undefined);
    setJustificativa('');
    setMinutosAtraso('');
  };

  const handleClose = () => {
    setJustificativa('');
    setMinutosAtraso('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {tipo === 'STATUS' ? 'Justificativa Obrigatória' : 'Justifique a Performance'}
          </DialogTitle>
          <DialogDescription>
            {tipo === 'STATUS'
              ? `Informe o motivo da ${status === 'FALTA' ? 'falta' : 'chegada atrasada'} de ${colaboradorNome}`
              : `Explique por que a performance de ${colaboradorNome} foi avaliada como RUIM`
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {status === 'ATRASADO' && tipo === 'STATUS' && (
            <div className="space-y-2">
              <Label>Minutos de Atraso *</Label>
              <Input
                type="number"
                min="1"
                placeholder="Ex: 30"
                value={minutosAtraso}
                onChange={(e) => setMinutosAtraso(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Justificativa *</Label>
            <Textarea
              placeholder="Descreva o motivo detalhadamente..."
              rows={4}
              value={justificativa}
              onChange={(e) => setJustificativa(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button onClick={handleSalvar}>
            Salvar Justificativa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Modal de Rateio de Centros de Custo
interface ModalRateioCCProps {
  open: boolean;
  onClose: () => void;
  colaboradores: ColaboradorRateio[];
  onConfirmar: (rateios: ColaboradorRateio[]) => void;
}

function ModalRateioCC({ open, onClose, colaboradores, onConfirmar }: ModalRateioCCProps) {
  const [rateiosLocal, setRateiosLocal] = useState<ColaboradorRateio[]>([]);
  const [erros, setErros] = useState<Record<string, string>>({});

  // Sincronizar estado local quando modal abre
  React.useEffect(() => {
    if (open && colaboradores.length > 0) {
      setRateiosLocal([...colaboradores]);
      setErros({});
    }
  }, [open, colaboradores]);

  const handlePercentualChange = (colaboradorId: string, ccId: string, novoValor: string) => {
    const valor = parseInt(novoValor) || 0;
    
    setRateiosLocal(prev => prev.map(colab => {
      if (colab.colaboradorId !== colaboradorId) return colab;
      
      return {
        ...colab,
        centrosCusto: colab.centrosCusto.map(cc => 
          cc.ccId === ccId ? { ...cc, percentual: valor } : cc
        )
      };
    }));

    // Limpar erro desse colaborador
    setErros(prev => {
      const novos = { ...prev };
      delete novos[colaboradorId];
      return novos;
    });
  };

  const validarRateios = (): boolean => {
    const novosErros: Record<string, string> = {};
    
    rateiosLocal.forEach(colab => {
      const soma = colab.centrosCusto.reduce((acc, cc) => acc + cc.percentual, 0);
      
      if (soma !== 100) {
        novosErros[colab.colaboradorId] = `Soma deve ser 100% (atual: ${soma}%)`;
      }

      // Verificar se algum CC tem 0%
      const temZero = colab.centrosCusto.some(cc => cc.percentual <= 0);
      if (temZero) {
        novosErros[colab.colaboradorId] = 'Todos os CCs devem ter percentual maior que 0';
      }
    });

    setErros(novosErros);
    return Object.keys(novosErros).length === 0;
  };

  const handleConfirmar = () => {
    if (validarRateios()) {
      onConfirmar(rateiosLocal);
    }
  };

  const getSomaPercentual = (colaboradorId: string): number => {
    const colab = rateiosLocal.find(c => c.colaboradorId === colaboradorId);
    if (!colab) return 0;
    return colab.centrosCusto.reduce((acc, cc) => acc + cc.percentual, 0);
  };

  const distribuirIgualmente = (colaboradorId: string) => {
    setRateiosLocal(prev => prev.map(colab => {
      if (colab.colaboradorId !== colaboradorId) return colab;
      
      const qtdCCs = colab.centrosCusto.length;
      const percentualBase = Math.floor(100 / qtdCCs);
      const resto = 100 - (percentualBase * qtdCCs);
      
      return {
        ...colab,
        centrosCusto: colab.centrosCusto.map((cc, idx) => ({
          ...cc,
          percentual: idx === 0 ? percentualBase + resto : percentualBase
        }))
      };
    }));

    // Limpar erro
    setErros(prev => {
      const novos = { ...prev };
      delete novos[colaboradorId];
      return novos;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Definir Rateio de Centros de Custo
          </DialogTitle>
          <DialogDescription>
            Os colaboradores abaixo estão alocados em mais de um Centro de Custo.
            Defina o percentual de cada CC (a soma deve ser 100%).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4 space-y-6">
          {rateiosLocal.map((colab) => {
            const soma = getSomaPercentual(colab.colaboradorId);
            const temErro = !!erros[colab.colaboradorId];
            const somaCorreta = soma === 100;

            return (
              <div 
                key={colab.colaboradorId} 
                className={cn(
                  "p-4 rounded-lg border transition-all",
                  temErro ? "border-destructive bg-destructive/5" : 
                  somaCorreta ? "border-success/50 bg-success/5" : "border-border"
                )}
              >
                {/* Header do Colaborador */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">{colab.colaboradorNome}</span>
                    <Badge variant="secondary" className="text-xs">
                      {colab.centrosCusto.length} CCs
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => distribuirIgualmente(colab.colaboradorId)}
                      className="text-xs"
                    >
                      Distribuir igual
                    </Button>
                    <Badge 
                      variant={somaCorreta ? "default" : "destructive"}
                      className={cn(
                        "text-xs font-mono",
                        somaCorreta && "bg-success hover:bg-success"
                      )}
                    >
                      {soma}%
                    </Badge>
                  </div>
                </div>

                {/* Inputs de Percentual */}
                <div className="grid gap-2">
                  {colab.centrosCusto.map((cc) => (
                    <div 
                      key={cc.ccId} 
                      className="flex items-center gap-3 p-2 rounded bg-muted/50"
                    >
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium truncate block">
                          {cc.ccNome}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          value={cc.percentual}
                          onChange={(e) => handlePercentualChange(
                            colab.colaboradorId, 
                            cc.ccId, 
                            e.target.value
                          )}
                          className="w-20 text-center font-mono"
                        />
                        <span className="text-sm text-muted-foreground">%</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Erro */}
                {temErro && (
                  <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    {erros[colab.colaboradorId]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmar}>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirmar Rateio e Registrar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
