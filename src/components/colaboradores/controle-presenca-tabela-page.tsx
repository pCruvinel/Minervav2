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
import { TooltipProvider } from '../ui/tooltip';
import {
  Calendar as CalendarIcon,
  Search,
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
  Star,
  Building,
  X,
  History,
  LayoutList
} from 'lucide-react';
import { PageHeader } from '@/components/shared/page-header';
import { cn } from '../ui/utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { Colaborador } from '@/types/colaborador';
import { CentroCusto } from '@/lib/hooks/use-centro-custo';
import { useAuth } from '@/lib/contexts/auth-context';
import { Link } from '@tanstack/react-router';
import { calcularCustoDiaMaoDeObra, getCentroCustoFixo } from '@/lib/constants/colaboradores';
import { useDiasUteisMes } from '@/lib/hooks/use-dias-uteis';
import { ModalJustificativa } from './modals/modal-justificativa';
import { ModalRateioCC, ColaboradorRateio } from './modals/modal-rateio-cc';

export interface RegistroPresenca {
  colaboradorId: string;
  status: 'OK' | 'ATRASADO' | 'FALTA' | 'FALTA_JUSTIFICADA';
  performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
  centrosCusto: string[];
  justificativaStatus?: string;
  justificativaPerformance?: string;
  minutosAtraso?: number;
  anexoUrl?: string;
  confirmedAt?: string;
  confirmedBy?: string;
  confirmedChanges?: { timestamp: string; action: string; previous_state?: string; by?: string | null }[];
  isAbonada?: boolean;
  motivoAbono?: string;
}

/** Helper: verifica se o status é qualquer tipo de falta */
const isFalta = (status: string | undefined): boolean =>
  status === 'FALTA' || status === 'FALTA_JUSTIFICADA';

export function ControlePresencaTabelaPage() {
  const { currentUser } = useAuth();
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const { data: diasUteisMes = 22 } = useDiasUteisMes(dataSelecionada.getFullYear(), dataSelecionada.getMonth() + 1);
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

  // Estados para Bulk Actions
  const [bulkCCOpen, setBulkCCOpen] = useState(false);
  const [bulkPerformanceOpen, setBulkPerformanceOpen] = useState(false);
  const [bulkCCSelection, setBulkCCSelection] = useState<string[]>([]);
  const [bulkJustificativaOpen, setBulkJustificativaOpen] = useState(false);
  const [bulkJustificativaTexto, setBulkJustificativaTexto] = useState('');
  const [bulkJustificativaArquivo, setBulkJustificativaArquivo] = useState<File | null>(null);

  // Carregar dados iniciais (Colaboradores e Centros de Custo)
  useEffect(() => {
    const fetchDadosIniciais = async () => {
      try {
        setLoading(true);
        const [colsRes, ccRes] = await Promise.all([
          supabase.from('colaboradores').select('*, setores(id, nome, slug)').eq('ativo', true).order('nome_completo'),
          supabase.from('centros_custo').select('id, nome').eq('ativo', true).order('nome')
        ]);

        if (colsRes.error) throw colsRes.error;
        if (ccRes.error) throw ccRes.error;

        // Map the joined setor data onto each colaborador so that
        // `colaborador.setor` (slug) is populated for filtering/display
        const colaboradoresComSetor = (colsRes.data || []).map((col: Partial<Colaborador> & { setores?: { slug?: string } }) => ({
          ...col,
          setor: col.setores?.slug || col.setor || undefined,
          setor_slug: col.setores?.slug || col.setor_slug || undefined,
        })) as Colaborador[];

        setColaboradores(colaboradoresComSetor);
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
        const ccFixoCodigo = getCentroCustoFixo(col.funcao);
        const ccFixoObj = ccFixoCodigo ? centrosCusto.find(cc => cc.nome === ccFixoCodigo) : undefined;
        const defaultCCs = ccFixoObj ? [ccFixoObj.id] : [];

        novosRegistros[col.id] = {
          colaboradorId: col.id,
          status: 'OK',
          performance: 'BOA',
          centrosCusto: defaultCCs,
        };
      });

      // Sobrescrever com dados do banco se existirem
      if (data && data.length > 0) {
        data.forEach(reg => {
          if (novosRegistros[reg.colaborador_id]) {
            const currentColab = colaboradores.find(c => c.id === reg.colaborador_id);
            const ccFixoCodigo = currentColab ? getCentroCustoFixo(currentColab.funcao) : undefined;
            const ccFixoObj = ccFixoCodigo ? centrosCusto.find(cc => cc.nome === ccFixoCodigo) : undefined;
            const dbCCs = reg.centros_custo || [];
            const computedCCs = ccFixoObj && dbCCs.length === 0 ? [ccFixoObj.id] : dbCCs;

            novosRegistros[reg.colaborador_id] = {
              colaboradorId: reg.colaborador_id,
              status: (reg.status as  'OK' | 'ATRASADO' | 'FALTA' | 'FALTA_JUSTIFICADA') || 'OK',
              performance: (reg.performance as 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM') || 'BOA',
              centrosCusto: computedCCs,
              justificativaStatus: reg.justificativa,
              justificativaPerformance: reg.performance_justificativa,
              minutosAtraso: reg.minutos_atraso,
              anexoUrl: reg.anexo_url,
              confirmedAt: reg.confirmed_at,
              confirmedBy: reg.confirmed_by,
              confirmedChanges: Array.isArray(reg.confirmed_changes) 
                ? reg.confirmed_changes 
                : (reg.confirmed_changes ? [reg.confirmed_changes] : [])
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
    // Se status é FALTA/FALTA_JUSTIFICADA, limpar performance (não faz sentido avaliar quem faltou)
    const novaPerformance = isFalta(status) ? undefined : registros[colaboradorId]?.performance;

    if (isFalta(status) || status === 'ATRASADO') {
      setColaboradorAtual(colaboradorId);
      setTipoJustificativa('STATUS');
      setModalJustificativaOpen(true);
    }

    setRegistros(prev => ({
      ...prev,
      [colaboradorId]: {
        ...prev[colaboradorId],
        status,
        performance: novaPerformance as RegistroPresenca['performance'],
        justificativaStatus: status === 'OK' ? undefined : prev[colaboradorId].justificativaStatus,
        justificativaPerformance: isFalta(status) ? undefined : prev[colaboradorId].justificativaPerformance,
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

  const handleSalvarJustificativa = (justificativa: string, minutosAtraso?: number, anexoUrl?: string) => {
    if (!colaboradorAtual) return;

    setRegistros(prev => ({
      ...prev,
      [colaboradorAtual]: {
        ...prev[colaboradorAtual],
        ...(tipoJustificativa === 'STATUS'
          ? { justificativaStatus: justificativa, minutosAtraso, anexoUrl }
          : { justificativaPerformance: justificativa }
        ),
      }
    }));

    setModalJustificativaOpen(false);
    setColaboradorAtual(null);
  };

  // Bulk Actions
  const handleBulkSetStatus = (status: RegistroPresenca['status']) => {
    if (selecionados.size === 0) return;

    // Se FALTA, abrir modal de justificativa em massa
    if (status === 'FALTA') {
      setBulkJustificativaOpen(true);
      return;
    }

    // ATRASADO requer minutos individuais por colaborador — não suporta bulk
    if (status === 'ATRASADO') {
      toast.warning('Para marcar como ATRASADO, use o controle individual de cada colaborador. A ação em massa requer minutos de atraso específicos por pessoa.');
      return;
    }

    setRegistros(prev => {
      const novos = { ...prev };
      selecionados.forEach(id => {
        novos[id] = {
          ...novos[id],
          status,
        } as RegistroPresenca;
      });
      return novos;
    });

    toast.success(`${selecionados.size} colaborador(es) marcado(s) como ${status}`);
  };

  // Confirmar justificativa em massa (para FALTA)
  const handleBulkJustificativaConfirm = async () => {
    if (!bulkJustificativaTexto.trim()) {
      toast.error('Preencha a justificativa');
      return;
    }

    let anexoUrl: string | undefined;

    // Upload do arquivo se existir
    if (bulkJustificativaArquivo) {
      try {
        const fileName = `bulk/${Date.now()}_${bulkJustificativaArquivo.name}`;

        const { error: uploadError } = await supabase.storage
          .from('comprovantes-presenca')
          .upload(fileName, bulkJustificativaArquivo);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('comprovantes-presenca')
          .getPublicUrl(fileName);

        anexoUrl = publicUrl;
      } catch (error) {
        console.error('Erro upload:', error);
        toast.error('Erro ao fazer upload do arquivo');
        return;
      }
    }

    // Aplicar FALTA a todos os selecionados
    setRegistros(prev => {
      const novos = { ...prev };
      selecionados.forEach(id => {
        novos[id] = {
          ...novos[id],
          status: 'FALTA',
          performance: 'BOA', // Default para satisfazer constraint NOT NULL
          justificativaStatus: bulkJustificativaTexto,
          anexoUrl: anexoUrl,
        };
      });
      return novos;
    });

    toast.success(`${selecionados.size} colaborador(es) marcado(s) como FALTA`);
    setBulkJustificativaOpen(false);
    setBulkJustificativaTexto('');
    setBulkJustificativaArquivo(null);
  };

  const handleBulkSetCC = (ccIds: string[]) => {
    if (selecionados.size === 0) return;

    setRegistros(prev => {
      const novos = { ...prev };
      selecionados.forEach(id => {
        // Só atribui CC se não estiver como FALTA
        if (!isFalta(novos[id].status)) {
          novos[id] = {
            ...novos[id],
            centrosCusto: ccIds,
          };
        }
      });
      return novos;
    });

    setBulkCCOpen(false);
    setBulkCCSelection([]);
    toast.success(`CCs atribuídos a ${selecionados.size} colaborador(es)`);
  };

  const handleBulkSetPerformance = (performance: RegistroPresenca['performance']) => {
    if (selecionados.size === 0) return;

    setRegistros(prev => {
      const novos = { ...prev };
      selecionados.forEach(id => {
        // Só atribui performance se não estiver como FALTA
        if (!isFalta(novos[id].status)) {
          novos[id] = {
            ...novos[id],
            performance,
          };
        }
      });
      return novos;
    });

    setBulkPerformanceOpen(false);
    toast.success(`Performance atribuída a ${selecionados.size} colaborador(es)`);
  };

  const handleSelectBySetor = (setor: string) => {
    const idsDoSetor = colaboradores
      .filter(c => c.setor === setor)
      .map(c => c.id);
    setSelecionados(new Set(idsDoSetor));
    toast.info(`${idsDoSetor.length} colaborador(es) de ${setor} selecionado(s)`);
  };

  const calcularCustoDia = (colaborador: Colaborador) => {
    return calcularCustoDiaMaoDeObra(
      colaborador.salario_base,
      colaborador.custo_dia,
      diasUteisMes,
      colaborador.tipo_contratacao === 'CLT'
    );
  };

  const calcularCustoTotalDia = () => {
    return colaboradores.reduce((total, col) => {
      const registro = registros[col.id];
      if (!registro || isFalta(registro.status)) return total;
      return total + calcularCustoDia(col);
    }, 0);
  };

  const calcularEstatisticas = () => {
    const presentes = colaboradores.filter(col => !isFalta(registros[col.id]?.status)).length;
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

      if (col.setor !== 'administrativo' && !isFalta(registro.status) && registro.centrosCusto.length === 0) {
        erros.push(`${col.nome_completo} precisa ter pelo menos 1 Centro de Custo`);
      }
      if ((isFalta(registro.status) || registro.status === 'ATRASADO') && !registro.justificativaStatus) {
        erros.push(`${col.nome_completo} precisa ter justificativa de ${isFalta(registro.status) ? 'falta' : 'atraso'}`);
      }
      if (registro.performance === 'RUIM' && !registro.justificativaPerformance) {
        erros.push(`${col.nome_completo} precisa ter justificativa de performance ruim`);
      }
      if (registro.status === 'ATRASADO' && (registro.minutosAtraso == null || registro.minutosAtraso <= 0)) {
        erros.push(`${col.nome_completo} precisa informar os minutos de atraso (mínimo 1 minuto)`);
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
      if (!registro || isFalta(registro.status)) return;

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
          minutos_atraso: reg.status === 'ATRASADO' && reg.minutosAtraso ? reg.minutosAtraso : null,
          justificativa: reg.justificativaStatus || null,
          performance: reg.performance || 'BOA', // Default para 'BOA' quando FALTA (campo obrigatório no banco)
          performance_justificativa: reg.justificativaPerformance || null,
          centros_custo: reg.centrosCusto,
          anexo_url: reg.anexoUrl || null,
          confirmed_at: new Date().toISOString(),
          confirmed_by: currentUser?.id || null,
          confirmed_changes: [
            ...(reg.confirmedChanges || []),
            {
              timestamp: new Date().toISOString(),
              action: 'confirmed',
              previous_state: reg.confirmedAt ? 'confirmed' : 'draft'
            }
          ],
          updated_at: new Date().toISOString()
        };
      });

      // 1. Salvar registros de presença
      const { error } = await supabase
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
        if (!reg || isFalta(reg.status) || reg.centrosCusto.length === 0) return;

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
        const { error: deleteAlocError } = await supabase
          .from('alocacao_horas_cc')
          .delete()
          .in('registro_presenca_id', registroIds);

        if (deleteAlocError) {
          toast.error('Erro ao limpar alocações anteriores de centros de custo. Tente novamente.');
          throw deleteAlocError;
        }

        // Inserir novas alocações
        const { error: alocError } = await supabase
          .from('alocacao_horas_cc')
          .insert(alocacoesParaSalvar);

        if (alocError) {
          toast.error('Erro ao salvar rateio de centros de custo. Verifique os dados e tente novamente.');
          throw alocError;
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
    if (selecionados.size === 0) {
      toast.warning('Selecione pelo menos um colaborador para reverter a confirmação.');
      return;
    }

    try {
      setSaving(true);
      const dateStr = format(dataSelecionada, 'yyyy-MM-dd');

      const prevRegistros = Array.from(selecionados)
        .map(id => registros[id])
        .filter(reg => reg && isRegistroConfirmado(reg));

      if (prevRegistros.length === 0) {
        toast.warning('Nenhum registro selecionado já está confirmado.');
        setSaving(false);
        return;
      }

      const upsertData = prevRegistros.map(reg => {
        return {
          colaborador_id: reg.colaboradorId,
          data: dateStr,
          status: reg.status,
          minutos_atraso: reg.minutosAtraso || null,
          justificativa: reg.justificativaStatus || null,
          performance: reg.performance || 'BOA',
          performance_justificativa: reg.justificativaPerformance || null,
          centros_custo: reg.centrosCusto,
          anexo_url: reg.anexoUrl || null,
          confirmed_at: null,
          confirmed_by: null,
          confirmed_changes: [
            ...(reg.confirmedChanges || []),
            {
              timestamp: new Date().toISOString(),
              action: 'reverted',
              previous_state: 'confirmed',
              by: currentUser?.id || null
            }
          ],
          updated_at: new Date().toISOString()
        };
      });

      const { error } = await supabase
        .from('registros_presenca')
        .upsert(upsertData, {
          onConflict: 'colaborador_id,data',
          ignoreDuplicates: false
        });

      if (error) throw error;

      toast.success(`✅ Confirmação revertida para ${prevRegistros.length} colaborador(es)!`);
      setSelecionados(new Set());

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
        hasError = colaborador.setor !== 'administrativo' && !isFalta(registro.status) && registro.centrosCusto.length === 0;
        break;
      case 'status':
        hasError = (isFalta(registro.status) || registro.status === 'ATRASADO') && !registro.justificativaStatus;
        break;
      case 'performance':
        hasError = registro.performance === 'RUIM' && !registro.justificativaPerformance;
        break;
    }

    return hasError ? 'border-destructive' : '';
  };

  if (loading && colaboradores.length === 0) {
    return (
      <div className="flex items-center justify-center h-full min-h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <PageHeader
          title="Controle de Presença Diária"
          subtitle="Interface de alta produtividade para lançamento rápido"
          showBackButton={true}
        >
          <div className="flex items-center gap-2">
            <Link to="/colaboradores/presenca">
              <Button variant="outline" className="h-9">
                <LayoutList className="mr-2 h-4 w-4" />
                Modo Detalhado
              </Button>
            </Link>

            {algumRegistroConfirmado && (
              <div className="flex items-center gap-2 mr-2">
                <Badge variant="secondary" className="bg-success/10 text-success border-success/20 h-9 px-3">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Confirmado
                </Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleReverterConfirmacao}
                  disabled={saving || selecionados.size === 0}
                  className="h-9"
                  title="Selecione um ou mais colaboradores para reverter"
                >
                  Reverter Selec.
                </Button>
              </div>
            )}

            <Link to="/colaboradores/presenca-historico">
              <Button variant="outline" className="h-9">
                <History className="mr-2 h-4 w-4" />
                Ver Histórico
              </Button>
            </Link>

            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-56 h-9">
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
        </PageHeader>

        {/* KPIs e Filtros */}
        <div className="space-y-4">
          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-primary/5 border-primary/20 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Total</p>
                  <p className="text-2xl font-bold text-neutral-900">{colaboradores.length}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-success/5 border-success/20 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-success" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Presentes</p>
                  <p className="text-2xl font-bold text-success">{stats.presentes}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-destructive/5 border-destructive/20 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <XCircle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Ausentes</p>
                  <p className="text-2xl font-bold text-destructive">{stats.ausentes}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-warning/5 border-warning/20 shadow-none">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                  <Clock className="h-5 w-5 text-warning" />
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-500">Atrasados</p>
                  <p className="text-2xl font-bold text-warning">{stats.atrasados}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros e Ações */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Bulk Actions Bar */}
            {selecionados.size > 0 && !algumRegistroConfirmado ? (
              <div className="flex-1 w-full bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">
                    <CheckCircle className="inline-block mr-2 h-4 w-4 text-primary" />
                    {selecionados.size} selecionado{selecionados.size > 1 ? 's' : ''}
                  </span>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkSetStatus('OK')}
                      className="bg-success/10 border-success/30 text-success hover:bg-success/20 h-8"
                    >
                      <CheckCircle className="mr-2 h-3.5 w-3.5" />
                      OK
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBulkSetStatus('FALTA')}
                      className="bg-destructive/10 border-destructive/30 text-destructive hover:bg-destructive/20 h-8"
                    >
                      <XCircle className="mr-2 h-3.5 w-3.5" />
                      Falta
                    </Button>

                    <Popover open={bulkCCOpen} onOpenChange={setBulkCCOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Building className="mr-2 h-3.5 w-3.5" />
                          CC
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <div className="space-y-2">
                          <Label>Selecione os CCs</Label>
                          <div className="space-y-2 max-h-60 overflow-y-auto">
                            {centrosCusto.map(cc => (
                              <label key={cc.id} className="flex items-center gap-2 p-2 rounded hover:bg-muted cursor-pointer">
                                <Checkbox
                                  checked={bulkCCSelection.includes(cc.id)}
                                  onCheckedChange={(checked) => {
                                    if (checked) {
                                      setBulkCCSelection([...bulkCCSelection, cc.id]);
                                    } else {
                                      setBulkCCSelection(bulkCCSelection.filter(id => id !== cc.id));
                                    }
                                  }}
                                />
                                <span className="text-sm">{cc.nome}</span>
                              </label>
                            ))}
                          </div>
                          <Button
                            className="w-full mt-2"
                            onClick={() => handleBulkSetCC(bulkCCSelection)}
                            disabled={bulkCCSelection.length === 0}
                          >
                            Aplicar
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>

                    <Popover open={bulkPerformanceOpen} onOpenChange={setBulkPerformanceOpen}>
                      <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8">
                          <Star className="mr-2 h-3.5 w-3.5" />
                          Perf.
                          <ChevronDown className="ml-1 h-3 w-3" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-48">
                        <div className="space-y-1">
                          {(['OTIMA', 'BOA', 'REGULAR', 'RUIM'] as const).map(perf => (
                            <Button
                              key={perf}
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => handleBulkSetPerformance(perf)}
                            >
                              {perf === 'OTIMA' ? 'Ótima' : perf === 'BOA' ? 'Boa' : perf === 'REGULAR' ? 'Regular' : 'Ruim'}
                            </Button>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8">
                        Setor
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-48">
                      <div className="space-y-1">
                        {setoresUnicos.map(setor => (
                          <Button
                            key={setor}
                            variant="ghost"
                            className="w-full justify-start capitalize"
                            onClick={() => handleSelectBySetor(setor || '')}
                          >
                            {setor || 'Sem setor'}
                          </Button>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelecionados(new Set())}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              // Empty div to keep alignment if needed, or nothing
              <div className="hidden sm:block" />
            )}

            <div className="flex items-center gap-3 ml-auto">
              <Button variant="outline" onClick={handleRepetirAlocacaoOntem} disabled={loading || algumRegistroConfirmado}>
                <Copy className="mr-2 h-4 w-4" />
                Repetir de Ontem
              </Button>

              <Select value={setorFiltro} onValueChange={setSetorFiltro}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Filtrar por setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os setores</SelectItem>
                  {setoresUnicos.map(setor => (
                    <SelectItem key={setor} value={setor || ''}>
                      {setor ? setor.charAt(0).toUpperCase() + setor.slice(1) : 'Sem setor'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Tabela Grid */}
        <Card className="shadow-card overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-12 text-center">
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
                        "hover:bg-muted/50 transition-colors",
                        isFalta(registro.status) && "bg-destructive/5 hover:bg-destructive/10",
                        registro.status === 'ATRASADO' && "bg-warning/5 hover:bg-warning/10"
                      )}
                    >
                      <TableCell className="text-center">
                        <Checkbox
                          checked={selecionados.has(colaborador.id)}
                          onCheckedChange={(checked) => handleSelecionarColaborador(colaborador.id, checked as boolean)}
                        />
                      </TableCell>

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden shrink-0">
                            {colaborador.avatar_url ? (
                              <img src={colaborador.avatar_url} alt={colaborador.nome} className="w-full h-full object-cover" />
                            ) : (
                              <User className="h-5 w-5 text-primary" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-neutral-900">{colaborador.nome_completo}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span className="capitalize">{colaborador.funcao?.replace('_', ' ').toLowerCase() || 'N/A'}</span>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className="capitalize font-normal text-muted-foreground">
                          {colaborador.setor || '-'}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={registro.status}
                          onValueChange={(value) => handleStatusChange(colaborador.id, value as RegistroPresenca['status'])}
                          disabled={isRegistroConfirmado(registro)}
                        >
                          <SelectTrigger className={cn("w-full h-9", getValidationClass(colaborador, registro, 'status'))}>
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
                          value={isFalta(registro.status) ? '' : (registro.performance || '')}
                          onValueChange={(value) => handlePerformanceChange(colaborador.id, value as RegistroPresenca['performance'])}
                          disabled={isRegistroConfirmado(registro) || isFalta(registro.status)}
                        >
                          <SelectTrigger className={cn(
                            "w-full h-9",
                            getValidationClass(colaborador, registro, 'performance'),
                            isFalta(registro.status) && "opacity-50 cursor-not-allowed bg-muted"
                          )}>
                            <SelectValue placeholder={isFalta(registro.status) ? 'N/A' : 'Selecione'} />
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
                        {(() => {
                          const ccFixoCodigo = getCentroCustoFixo(colaborador.funcao);
                          const hasCCFixo = !!ccFixoCodigo;
                          
                          if (hasCCFixo) {
                            return (
                              <Badge variant="secondary" className="font-normal border-none bg-muted w-full justify-start py-2 px-3 text-sm h-9">
                                Custo Fixo: {ccFixoCodigo}
                              </Badge>
                            );
                          }
                          
                          const ccsFiltrados = centrosCusto.filter(cc => !cc.nome?.startsWith('CC-'));

                          return (
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn("w-full justify-between h-auto min-h-9 py-2", getValidationClass(colaborador, registro, 'centrosCusto'))}
                                  disabled={isRegistroConfirmado(registro) || hasCCFixo}
                                >
                                  <div className="flex flex-wrap gap-1 text-left">
                                    {registro.centrosCusto && registro.centrosCusto.length > 0 ? (
                                      registro.centrosCusto.map(ccId => (
                                        <Badge
                                          key={ccId}
                                          variant="secondary"
                                          className="text-[10px] bg-info/10 text-info hover:bg-info/20 border-none"
                                        >
                                          {getCentroCustoNome(ccId)}
                                        </Badge>
                                      ))
                                    ) : (
                                      <span className="text-sm text-neutral-400">
                                        Selecione os CCs...
                                      </span>
                                    )}
                                  </div>
                                  <ChevronDown className="h-4 w-4 ml-2 flex-shrink-0 opacity-50" />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-96 p-0" align="start">
                                <div className="p-3 border-b bg-muted/30">
                                  <Label className="text-sm font-medium">
                                    Alocação de Custo (Onde trabalhou hoje?)
                                  </Label>
                                </div>
                                <div className="p-2 space-y-1 max-h-60 overflow-y-auto">
                                  {ccsFiltrados.length === 0 && (
                                    <p className="text-sm text-muted-foreground p-2">Nenhum CC disponível.</p>
                                  )}
                                  {ccsFiltrados.map(cc => (
                                    <label
                                      key={cc.id}
                                      className={cn(
                                        "flex items-center gap-3 p-2 rounded-md cursor-pointer transition-all",
                                        registro.centrosCusto?.includes(cc.id)
                                          ? "bg-primary/5 text-primary"
                                          : "hover:bg-muted"
                                      )}
                                    >
                                      <Checkbox
                                        checked={registro.centrosCusto?.includes(cc.id)}
                                        onCheckedChange={() => handleCentroCustoToggle(colaborador.id, cc.id)}
                                        className="border-muted-foreground/30 data-[state=checked]:border-primary"
                                      />
                                      <span className="text-sm flex-1">{cc.nome}</span>
                                    </label>
                                  ))}
                                </div>
                              </PopoverContent>
                            </Popover>
                          );
                        })()}
                      </TableCell>

                      <TableCell className="text-center">
                        {temJustificativa && (
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-primary">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-80" align="end">
                              <div className="space-y-3">
                                <h4 className="font-medium text-sm border-b pb-2">Justificativas</h4>
                                {registro.justificativaStatus && (
                                  <div>
                                    <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                      {isFalta(registro.status) ? 'Falta' : 'Atraso'}
                                      {registro.minutosAtraso && ` (${registro.minutosAtraso} min)`}
                                    </Label>
                                    <p className="text-sm mt-1 bg-muted/50 p-2 rounded-md">{registro.justificativaStatus}</p>
                                  </div>
                                )}
                                {registro.justificativaPerformance && (
                                  <div>
                                    <Label className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                                      Performance
                                    </Label>
                                    <p className="text-sm mt-1 bg-muted/50 p-2 rounded-md">{registro.justificativaPerformance}</p>
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

        {/* Padding para compensar footer fixo */}
        <div className="h-24" />

        {/* Rodapé Fixo */}
        <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t shadow-lg z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-start">
                {/* Custo Total */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <DollarSign className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">Custo Dia</p>
                    <p className="text-xl font-bold text-primary leading-none">{formatCurrency(custoTotalDia)}</p>
                  </div>
                </div>

                <div className="hidden sm:block h-8 w-px bg-border" />

                {/* Resumo */}
                <div className="hidden sm:block text-sm space-y-0.5">
                  <p className="text-muted-foreground">
                    <strong className="text-success">{stats.presentes}</strong> presentes •
                    <strong className="text-foreground ml-2">{stats.ausentes}</strong> ausentes
                    {stats.atrasados > 0 && (
                      <> • <strong className="text-warning">{stats.atrasados}</strong> atrasados</>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {colaboradores.filter(c => registros[c.id]?.centrosCusto?.length > 0).length} com CC alocado
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-auto">
                <Button
                  size="lg"
                  onClick={handleAbrirModalConfirmacao}
                  className="w-full sm:w-auto px-8 shadow-md"
                  disabled={saving || algumRegistroConfirmado}
                >
                  {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
                  {algumRegistroConfirmado ? 'Presenças Já Confirmadas' : 'Registrar Presenças'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Modal de Confirmação */}
        <Dialog open={modalConfirmacaoOpen} onOpenChange={setModalConfirmacaoOpen}>
          <DialogContent className="max-w-md">
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
          colaboradorId={colaboradorAtual || undefined}
          status={colaboradorAtual ? (isFalta(registros[colaboradorAtual]?.status) ? 'FALTA' : registros[colaboradorAtual]?.status) as 'OK' | 'ATRASADO' | 'FALTA' : 'OK'}
        />

        {/* Modal de Justificativa em Massa */}
        <Dialog open={bulkJustificativaOpen} onOpenChange={setBulkJustificativaOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Justificativa de Falta em Massa</DialogTitle>
              <DialogDescription>
                Informe a justificativa que será aplicada a <strong>{selecionados.size} colaborador(es)</strong> selecionados.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-justificativa">Justificativa *</Label>
                <Textarea
                  id="bulk-justificativa"
                  placeholder="Descreva o motivo da falta..."
                  value={bulkJustificativaTexto}
                  onChange={(e) => setBulkJustificativaTexto(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Anexar Comprovante (Opcional)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error('Arquivo muito grande. Máximo 5MB.');
                          return;
                        }
                        setBulkJustificativaArquivo(file);
                      }
                    }}
                    className="flex-1"
                  />
                  {bulkJustificativaArquivo && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setBulkJustificativaArquivo(null)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                {bulkJustificativaArquivo && (
                  <p className="text-xs text-muted-foreground">
                    📎 {bulkJustificativaArquivo.name} ({(bulkJustificativaArquivo.size / 1024).toFixed(1)} KB)
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: PDF, JPG, PNG (máx. 5MB)
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setBulkJustificativaOpen(false);
                setBulkJustificativaTexto('');
                setBulkJustificativaArquivo(null);
              }}>
                Cancelar
              </Button>
              <Button onClick={handleBulkJustificativaConfirm}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Confirmar Faltas
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  );
}
