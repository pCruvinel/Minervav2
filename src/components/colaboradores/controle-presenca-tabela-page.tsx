import { logger } from '@/lib/utils/logger';
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
  Loader2
} from 'lucide-react';
import { cn } from '../ui/utils';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { Colaborador } from '@/types/colaborador';
import { CentroCusto } from '@/lib/hooks/use-centro-custo';

interface RegistroPresenca {
  colaboradorId: string;
  status: 'OK' | 'ATRASADO' | 'FALTA';
  performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
  centrosCusto: string[];
  justificativaStatus?: string;
  justificativaPerformance?: string;
  minutosAtraso?: number;
  anexoUrl?: string;
}

export function ControlePresencaTabelaPage() {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [registros, setRegistros] = useState<Record<string, RegistroPresenca>>({});
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [modalJustificativaOpen, setModalJustificativaOpen] = useState(false);
  const [colaboradorAtual, setColaboradorAtual] = useState<string | null>(null);
  const [tipoJustificativa, setTipoJustificativa] = useState<'STATUS' | 'PERFORMANCE'>('STATUS');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

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
              anexoUrl: reg.anexo_url
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
        .select('colaborador_id, centros_custo')
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
            };
          }
        });
        return novos;
      });

      toast.success(`Alocação de ${format(ontem, 'dd/MM')} replicada!`);
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

  const handleConfirmarRegistros = async () => {
    const erros: string[] = [];
    const dateStr = format(dataSelecionada, 'yyyy-MM-dd');

    // Validação
    colaboradores.forEach(col => {
      const registro = registros[col.id];
      if (!registro) return;

      if (col.setor !== 'administrativo' && registro.status !== 'FALTA' && registro.centrosCusto.length === 0) {
        erros.push(`${col.nome} precisa ter pelo menos 1 Centro de Custo`);
      }
      if ((registro.status === 'FALTA' || registro.status === 'ATRASADO') && !registro.justificativaStatus) {
        erros.push(`${col.nome} precisa ter justificativa de ${registro.status === 'FALTA' ? 'falta' : 'atraso'}`);
      }
      if (registro.performance === 'RUIM' && !registro.justificativaPerformance) {
        erros.push(`${col.nome} precisa ter justificativa de performance ruim`);
      }
      if (registro.status === 'ATRASADO' && !registro.minutosAtraso) {
        erros.push(`${col.nome} precisa informar os minutos de atraso`);
      }
    });

    if (erros.length > 0) {
      toast.error(erros[0]);
      return;
    }

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

      toast.success(`✅ Presença registrada para ${format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })}!`);

      // Recarregar para garantir sincronia
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

  const stats = calcularEstatisticas();
  const custoTotalDia = calcularCustoTotalDia();
  const todosSelecionados = selecionados.size === colaboradores.length;

  if (loading && colaboradores.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando...</span>
      </div>
    );
  }

  return (
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

            <Button variant="outline" onClick={handleRepetirAlocacaoOntem} disabled={loading}>
              <Copy className="mr-2 h-4 w-4" />
              Repetir Alocação de Ontem
            </Button>

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
                  <TableHead className="w-48">Status</TableHead>
                  <TableHead className="w-48">Performance</TableHead>
                  <TableHead className="min-w-96">Centro de Custo</TableHead>
                  <TableHead className="w-20 text-center">Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colaborador) => {
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
                            <p className="font-medium">{colaborador.nome_completo || colaborador.nome}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span className="capitalize">{colaborador.funcao?.replace('_', ' ').toLowerCase() || 'N/A'}</span>
                              <Badge variant="secondary" className="text-xs">{colaborador.setor}</Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={registro.status}
                          onValueChange={(value) => handleStatusChange(colaborador.id, value as RegistroPresenca['status'])}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OK">✅ OK</SelectItem>
                            <SelectItem value="ATRASADO">⏰ Atrasado</SelectItem>
                            <SelectItem value="FALTA">❌ Falta</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Select
                          value={registro.performance}
                          onValueChange={(value) => handlePerformanceChange(colaborador.id, value as RegistroPresenca['performance'])}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OTIMA">🌟 Ótima</SelectItem>
                            <SelectItem value="BOA">👍 Boa</SelectItem>
                            <SelectItem value="REGULAR">⚠️ Regular</SelectItem>
                            <SelectItem value="RUIM">👎 Ruim</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>

                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-auto min-h-10 py-2"
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
                📊 <strong>{stats.presentes}</strong> presentes •
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

          <Button size="lg" onClick={handleConfirmarRegistros} className="px-8" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <CheckCircle className="mr-2 h-5 w-5" />}
            Confirmar e Registrar Presenças
          </Button>
        </div>
      </div>

      {/* Modal de Justificativa */}
      <ModalJustificativa
        open={modalJustificativaOpen}
        onClose={() => {
          setModalJustificativaOpen(false);
          setColaboradorAtual(null);
        }}
        onSalvar={handleSalvarJustificativa}
        tipo={tipoJustificativa}
        colaboradorNome={colaboradores.find(c => c.id === colaboradorAtual)?.nome || ''}
        status={colaboradorAtual ? registros[colaboradorAtual]?.status : 'OK'}
      />
    </div>
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
