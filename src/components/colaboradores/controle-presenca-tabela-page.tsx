import { logger } from '@/lib/utils/logger';
import React, { useState } from 'react';
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
  AlertTriangle,
  MessageSquare,
  Copy,
  Users,
  DollarSign,
  ChevronDown,
} from 'lucide-react';
import { cn } from '../ui/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

interface Colaborador {
  id: string;
  nome: string;
  funcao: string;
  setor: string;
  custoDia: number;
  avatar?: string;
}

interface RegistroPresenca {
  colaboradorId: string;
  status: 'OK' | 'ATRASADO' | 'FALTA';
  performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
  centrosCusto: string[];
  justificativaStatus?: string;
  justificativaPerformance?: string;
  minutosAtraso?: number;
}

// Mock de colaboradores
const mockColaboradores: Colaborador[] = [
  { id: 'col-1', nome: 'João Silva', funcao: 'Pedreiro', setor: 'obras', custoDia: 180.00 },
  { id: 'col-2', nome: 'Maria Santos', funcao: 'Engenheira Civil', setor: 'assessoria', custoDia: 450.00 },
  { id: 'col-3', nome: 'Pedro Oliveira', funcao: 'Auxiliar de Obras', setor: 'obras', custoDia: 120.00 },
  { id: 'col-4', nome: 'Ana Costa', funcao: 'Administrativa', setor: 'administrativo', custoDia: 280.00 },
  { id: 'col-5', nome: 'Carlos Mendes', funcao: 'Servente', setor: 'obras', custoDia: 110.00 },
  { id: 'col-6', nome: 'Beatriz Lima', funcao: 'Arquiteta', setor: 'assessoria', custoDia: 420.00 },
  { id: 'col-7', nome: 'Ricardo Souza', funcao: 'Eletricista', setor: 'obras', custoDia: 160.00 },
  { id: 'col-8', nome: 'Juliana Alves', funcao: 'Pintora', setor: 'obras', custoDia: 140.00 },
];

// Mock de centros de custo
const mockCentrosCusto = [
  { id: 'cc-1', nome: 'Obra Residencial - Jardim das Flores', cor: 'bg-blue-100 text-blue-800' },
  { id: 'cc-2', nome: 'Reforma Comercial - Shopping Norte', cor: 'bg-purple-100 text-purple-800' },
  { id: 'cc-3', nome: 'Laudo Estrutural - Edifício Central', cor: 'bg-amber-100 text-amber-800' },
  { id: 'cc-4', nome: 'Obra Industrial - Fábrica XYZ', cor: 'bg-green-100 text-green-800' },
];

export function ControlePresencaTabelaPage() {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [registros, setRegistros] = useState<Record<string, RegistroPresenca>>(
    mockColaboradores.reduce((acc, col) => ({
      ...acc,
      [col.id]: {
        colaboradorId: col.id,
        status: 'OK',
        performance: 'BOA',
        centrosCusto: [],
      }
    }), {})
  );
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [modalJustificativaOpen, setModalJustificativaOpen] = useState(false);
  const [colaboradorAtual, setColaboradorAtual] = useState<string | null>(null);
  const [tipoJustificativa, setTipoJustificativa] = useState<'STATUS' | 'PERFORMANCE'>('STATUS');

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleSelecionarTodos = (checked: boolean) => {
    if (checked) {
      setSelecionados(new Set(mockColaboradores.map(c => c.id)));
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

  const handleRepetirAlocacaoOntem = () => {
    // Simular dados de ontem
    const alocacaoOntem: Record<string, string[]> = {
      'col-1': ['cc-1', 'cc-2'],
      'col-2': ['cc-3'],
      'col-3': ['cc-1'],
      'col-5': ['cc-2', 'cc-4'],
      'col-7': ['cc-1', 'cc-4'],
      'col-8': ['cc-2'],
    };

    setRegistros(prev => {
      const novos = { ...prev };
      Object.keys(alocacaoOntem).forEach(colId => {
        if (novos[colId]) {
          novos[colId] = {
            ...novos[colId],
            centrosCusto: alocacaoOntem[colId],
          };
        }
      });
      return novos;
    });

    toast.success('Alocação de ontem replicada com sucesso!');
  };

  const handleStatusChange = (colaboradorId: string, status: RegistroPresenca['status']) => {
    // Se mudar para FALTA ou ATRASADO, abrir modal de justificativa
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
    // Se mudar para RUIM, exigir justificativa
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

  const calcularCustoTotalDia = () => {
    return mockColaboradores.reduce((total, col) => {
      const registro = registros[col.id];
      if (registro.status === 'FALTA') return total; // Falta não gera custo

      const numCCs = registro.centrosCusto.length || 1;
      return total + col.custoDia;
    }, 0);
  };

  const calcularEstatisticas = () => {
    const presentes = mockColaboradores.filter(col => registros[col.id].status !== 'FALTA').length;
    const ausentes = mockColaboradores.length - presentes;
    const atrasados = mockColaboradores.filter(col => registros[col.id].status === 'ATRASADO').length;

    return { presentes, ausentes, atrasados };
  };

  const handleConfirmarRegistros = () => {
    // Validar se todos têm pelo menos 1 centro de custo (exceto ADM)
    const erros: string[] = [];

    mockColaboradores.forEach(col => {
      const registro = registros[col.id];

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

    logger.log('Registros confirmados:', registros);
    toast.success(`✅ Presença registrada para ${format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })}!`);
  };

  const getStatusBadge = (status: RegistroPresenca['status']) => {
    const config = {
      OK: { icon: CheckCircle, label: 'OK', className: 'text-green-600' },
      ATRASADO: { icon: Clock, label: 'Atrasado', className: 'text-amber-600' },
      FALTA: { icon: XCircle, label: 'Falta', className: 'text-red-600' },
    };
    const { icon: Icon, label, className } = config[status];
    return (
      <div className="flex items-center gap-1">
        <Icon className={cn('h-4 w-4', className)} />
        <span>{label}</span>
      </div>
    );
  };

  const getPerformanceBadge = (performance: RegistroPresenca['performance']) => {
    const config = {
      OTIMA: { label: 'Ótima', className: 'bg-green-100 text-green-800' },
      BOA: { label: 'Boa', className: 'bg-blue-100 text-blue-800' },
      REGULAR: { label: 'Regular', className: 'bg-amber-100 text-amber-800' },
      RUIM: { label: 'Ruim', className: 'bg-red-100 text-red-800' },
    };
    const { label, className } = config[performance];
    return <Badge className={className}>{label}</Badge>;
  };

  const getCentroCustoNome = (id: string) => {
    return mockCentrosCusto.find(cc => cc.id === id)?.nome.split(' - ')[1] || id;
  };

  const getCentroCustoCor = (id: string) => {
    return mockCentrosCusto.find(cc => cc.id === id)?.cor || 'bg-neutral-100 text-neutral-800';
  };

  const stats = calcularEstatisticas();
  const custoTotalDia = calcularCustoTotalDia();
  const todosSelecionados = selecionados.size === mockColaboradores.length;

  return (
    <div className="flex flex-col h-screen bg-neutral-50">
      {/* Barra Superior de Ações em Massa */}
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
            <div className="flex items-center gap-4 px-4 py-2 bg-neutral-50 rounded-lg border">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  <strong>Total:</strong> {mockColaboradores.length}
                </span>
              </div>
              <div className="h-4 w-px bg-neutral-300" />
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm">
                  <strong>Presentes:</strong> {stats.presentes}
                </span>
              </div>
              {stats.ausentes > 0 && (
                <>
                  <div className="h-4 w-px bg-neutral-300" />
                  <div className="flex items-center gap-2">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <span className="text-sm">
                      <strong>Ausentes:</strong> {stats.ausentes}
                    </span>
                  </div>
                </>
              )}
              {stats.atrasados > 0 && (
                <>
                  <div className="h-4 w-px bg-neutral-300" />
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-600" />
                    <span className="text-sm">
                      <strong>Atrasados:</strong> {stats.atrasados}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Botão Repetir Alocação */}
            <Button variant="outline" onClick={handleRepetirAlocacaoOntem}>
              <Copy className="mr-2 h-4 w-4" />
              Repetir Alocação de Ontem
            </Button>

            {/* Seletor de Data */}
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

      {/* Tabela Grid de Lançamento */}
      <div className="flex-1 overflow-auto px-6 py-4">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-neutral-50">
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
                {mockColaboradores.map((colaborador) => {
                  const registro = registros[colaborador.id];
                  const temJustificativa = registro.justificativaStatus || registro.justificativaPerformance;

                  return (
                    <TableRow
                      key={colaborador.id}
                      className={cn(
                        "hover:bg-neutral-50",
                        registro.status === 'FALTA' && "bg-red-50/50",
                        registro.status === 'ATRASADO' && "bg-amber-50/50"
                      )}
                    >
                      {/* Checkbox */}
                      <TableCell>
                        <Checkbox
                          checked={selecionados.has(colaborador.id)}
                          onCheckedChange={(checked) => handleSelecionarColaborador(colaborador.id, checked as boolean)}
                        />
                      </TableCell>

                      {/* Colaborador */}
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <User className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{colaborador.nome}</p>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <span>{colaborador.funcao}</span>
                              <Badge variant="secondary" className="text-xs">{colaborador.setor}</Badge>
                            </div>
                          </div>
                        </div>
                      </TableCell>

                      {/* Status */}
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

                      {/* Performance */}
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

                      {/* Centro de Custo (Multiselect) */}
                      <TableCell>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full justify-between h-auto min-h-10 py-2"
                            >
                              <div className="flex flex-wrap gap-1">
                                {registro.centrosCusto.length > 0 ? (
                                  registro.centrosCusto.map(ccId => (
                                    <Badge
                                      key={ccId}
                                      variant="secondary"
                                      className={cn('text-xs', getCentroCustoCor(ccId))}
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
                              <div className="space-y-2">
                                {mockCentrosCusto.map(cc => (
                                  <label
                                    key={cc.id}
                                    className={cn(
                                      "flex items-center gap-2 p-2 rounded-md cursor-pointer transition-all border",
                                      registro.centrosCusto.includes(cc.id)
                                        ? "border-primary bg-primary/5"
                                        : "border-transparent hover:bg-neutral-50"
                                    )}
                                  >
                                    <Checkbox
                                      checked={registro.centrosCusto.includes(cc.id)}
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

                      {/* Justificativa (Ícone) */}
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

      {/* Rodapé Fixo com Resumo e Ação */}
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

            <div className="h-12 w-px bg-neutral-300" />

            <div className="text-sm space-y-1">
              <p className="text-muted-foreground">
                📊 <strong>{stats.presentes}</strong> presentes •
                <strong className="ml-2">{stats.ausentes}</strong> ausentes
                {stats.atrasados > 0 && (
                  <> • <strong className="text-amber-600">{stats.atrasados}</strong> atrasados</>
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                {mockColaboradores.filter(c => registros[c.id].centrosCusto.length > 0).length} colaboradores com CC alocado
              </p>
            </div>
          </div>

          <Button size="lg" onClick={handleConfirmarRegistros} className="px-8">
            <CheckCircle className="mr-2 h-5 w-5" />
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
        colaboradorNome={mockColaboradores.find(c => c.id === colaboradorAtual)?.nome || ''}
        status={colaboradorAtual ? registros[colaboradorAtual].status : 'OK'}
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
