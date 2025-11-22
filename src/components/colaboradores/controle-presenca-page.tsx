import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Alert, AlertDescription } from '../ui/alert';
import {
  Calendar as CalendarIcon,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  Calculator,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { Calendar } from '../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
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
}

interface RegistroPresenca {
  colaboradorId: string;
  status: 'OK' | 'ATRASADO' | 'FALTA' | 'FALTA_JUSTIFICADA' | '';
  minutosAtraso?: number;
  justificativa?: string;
  performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM' | 'PESSIMA' | '';
  performanceJustificativa?: string;
  centrosCusto: string[];
  anexoAtestado?: File | null;
}

// Mock de colaboradores
const mockColaboradores: Colaborador[] = [
  { id: 'col-1', nome: 'João Silva', funcao: 'Pedreiro', setor: 'obras', custoDia: 180.00 },
  { id: 'col-2', nome: 'Maria Santos', funcao: 'Engenheira', setor: 'assessoria', custoDia: 450.00 },
  { id: 'col-3', nome: 'Pedro Oliveira', funcao: 'Auxiliar', setor: 'obras', custoDia: 120.00 },
  { id: 'col-4', nome: 'Ana Costa', funcao: 'Administrativa', setor: 'administrativo', custoDia: 280.00 },
  { id: 'col-5', nome: 'Carlos Mendes', funcao: 'Servente', setor: 'obras', custoDia: 110.00 },
];

// Mock de centros de custo (obras)
const mockCentrosCusto = [
  { id: 'cc-1', nome: 'Obra Residencial - Jardim das Flores' },
  { id: 'cc-2', nome: 'Reforma Comercial - Shopping Norte' },
  { id: 'cc-3', nome: 'Laudo Estrutural - Edifício Central' },
];

export function ControlePresencaPage() {
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [registros, setRegistros] = useState<Record<string, RegistroPresenca>>(
    mockColaboradores.reduce((acc, col) => ({
      ...acc,
      [col.id]: {
        colaboradorId: col.id,
        status: '',
        performance: '',
        centrosCusto: [],
        anexoAtestado: null,
      }
    }), {})
  );
  const [colaboradorExpandido, setColaboradorExpandido] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleStatusChange = (colaboradorId: string, status: RegistroPresenca['status']) => {
    setRegistros(prev => ({
      ...prev,
      [colaboradorId]: {
        ...prev[colaboradorId],
        status,
        // Reset campos dependentes
        minutosAtraso: status === 'ATRASADO' ? prev[colaboradorId].minutosAtraso : undefined,
        justificativa: ['FALTA', 'ATRASADO'].includes(status) ? prev[colaboradorId].justificativa : undefined,
        anexoAtestado: status === 'FALTA_JUSTIFICADA' ? prev[colaboradorId].anexoAtestado : null,
      }
    }));
  };

  const handlePerformanceChange = (colaboradorId: string, performance: RegistroPresenca['performance']) => {
    setRegistros(prev => ({
      ...prev,
      [colaboradorId]: {
        ...prev[colaboradorId],
        performance,
        // Reset justificativa se não for necessária
        performanceJustificativa: ['REGULAR', 'RUIM', 'PESSIMA'].includes(performance)
          ? prev[colaboradorId].performanceJustificativa
          : undefined,
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

  const calcularRateioCustoDia = (colaborador: Colaborador, registro: RegistroPresenca) => {
    const numCCs = registro.centrosCusto.length || 1;
    return colaborador.custoDia / numCCs;
  };

  const handleRegistrarPresenca = () => {
    // Validações
    const registrosValidos = mockColaboradores.every(col => {
      const reg = registros[col.id];

      if (!reg.status) {
        toast.error(`Defina o status de presença para ${col.nome}`);
        return false;
      }

      if (reg.status === 'ATRASADO' && !reg.minutosAtraso) {
        toast.error(`Informe os minutos de atraso para ${col.nome}`);
        return false;
      }

      if (['FALTA', 'ATRASADO'].includes(reg.status) && !reg.justificativa) {
        toast.error(`Informe a justificativa para ${col.nome}`);
        return false;
      }

      if (reg.status === 'FALTA_JUSTIFICADA' && !reg.anexoAtestado) {
        toast.error(`Anexe o atestado para ${col.nome}`);
        return false;
      }

      if (!reg.performance) {
        toast.error(`Defina a performance para ${col.nome}`);
        return false;
      }

      if (['REGULAR', 'RUIM', 'PESSIMA'].includes(reg.performance) && !reg.performanceJustificativa) {
        toast.error(`Justifique a performance de ${col.nome}`);
        return false;
      }

      return true;
    });

    if (!registrosValidos) return;

    // Salvar registros
    console.log('Registros de presença:', registros);

    toast.success(`Presença registrada com sucesso para ${format(dataSelecionada, 'dd/MM/yyyy', { locale: ptBR })}!`);
  };

  const getStatusIcon = (status: RegistroPresenca['status']) => {
    switch (status) {
      case 'OK':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'ATRASADO':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'FALTA':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'FALTA_JUSTIFICADA':
        return <FileText className="h-4 w-4 text-blue-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusLabel = (status: RegistroPresenca['status']) => {
    const map: Record<string, string> = {
      OK: 'OK',
      ATRASADO: 'Atrasado',
      FALTA: 'Falta',
      FALTA_JUSTIFICADA: 'Falta Justificada',
    };
    return map[status] || 'Não definido';
  };

  const getPerformanceColor = (performance: RegistroPresenca['performance']) => {
    switch (performance) {
      case 'OTIMA':
        return 'bg-green-100 text-green-800';
      case 'BOA':
        return 'bg-blue-100 text-blue-800';
      case 'REGULAR':
        return 'bg-amber-100 text-amber-800';
      case 'RUIM':
        return 'bg-orange-100 text-orange-800';
      case 'PESSIMA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-neutral-100 text-neutral-800';
    }
  };

  return (
    <div className="p-6 space-y-6 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl mb-2">Controle de Presença Diária</h1>
          <p className="text-muted-foreground">
            Registro de presença, performance e rateio de custos por colaborador
          </p>
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-64">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dataSelecionada ? format(dataSelecionada, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : 'Selecione a data'}
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

      {/* Alerta de Regras */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Regras de Preenchimento:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1 text-sm">
            <li><strong>Atrasado:</strong> Informe os minutos de atraso e justificativa</li>
            <li><strong>Falta:</strong> Justificativa obrigatória</li>
            <li><strong>Falta Justificada:</strong> Anexo de atestado obrigatório</li>
            <li><strong>Performance Regular/Ruim/Péssima:</strong> Justificativa obrigatória</li>
            <li><strong>Rateio por CC:</strong> Opcional para ADM, obrigatório para Obras/Assessoria</li>
          </ul>
        </AlertDescription>
      </Alert>

      {/* Tabela de Registros */}
      <Card>
        <CardHeader>
          <CardTitle>Equipe ({mockColaboradores.length} colaboradores)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockColaboradores.map((colaborador) => {
              const registro = registros[colaborador.id];
              const custoDiaRateado = calcularRateioCustoDia(colaborador, registro);
              const requireCC = colaborador.setor !== 'administrativo';
              const isExpandido = colaboradorExpandido === colaborador.id;
              const isCompleto = registro.status && registro.performance;

              return (
                <Card key={colaborador.id} className="overflow-hidden">
                  {/* Header Clicável (sempre visível) */}
                  <div
                    className="p-4 cursor-pointer hover:bg-neutral-50 transition-colors"
                    onClick={() => setColaboradorExpandido(isExpandido ? null : colaborador.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {isExpandido ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                        )}

                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <User className="h-5 w-5 text-primary" />
                        </div>

                        <div className="flex-1">
                          <h4 className="font-medium">{colaborador.nome}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>{colaborador.funcao}</span>
                            <Badge variant="secondary" className="text-xs">{colaborador.setor}</Badge>
                          </div>
                        </div>

                        {/* Status resumido quando colapsado */}
                        {!isExpandido && (
                          <div className="flex items-center gap-3">
                            {registro.status && (
                              <div className="flex items-center gap-1">
                                {getStatusIcon(registro.status)}
                                <span className="text-sm text-muted-foreground">
                                  {getStatusLabel(registro.status)}
                                </span>
                              </div>
                            )}

                            {registro.performance && (
                              <Badge className={getPerformanceColor(registro.performance)}>
                                {registro.performance}
                              </Badge>
                            )}

                            {!isCompleto && (
                              <Badge variant="outline" className="text-amber-600 border-amber-600">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}

                            {isCompleto && (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Completo
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <p className="text-xs text-muted-foreground mb-1">Custo-Dia</p>
                        <p className="text-lg font-medium text-primary">{formatCurrency(colaborador.custoDia)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Formulário (exibido apenas quando expandido) */}
                  {isExpandido && (
                    <CardContent className="pt-0 pb-4 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Status */}
                        <div className="space-y-2">
                          <Label>Status de Presença *</Label>
                          <Select
                            value={registro.status}
                            onValueChange={(value) => handleStatusChange(colaborador.id, value as RegistroPresenca['status'])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OK">✅ OK</SelectItem>
                              <SelectItem value="ATRASADO">⏰ Atrasado</SelectItem>
                              <SelectItem value="FALTA">❌ Falta</SelectItem>
                              <SelectItem value="FALTA_JUSTIFICADA">📄 Falta Justificada</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Performance */}
                        <div className="space-y-2">
                          <Label>Performance *</Label>
                          <Select
                            value={registro.performance}
                            onValueChange={(value) => handlePerformanceChange(colaborador.id, value as RegistroPresenca['performance'])}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Avalie a performance..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="OTIMA">🌟 Ótima</SelectItem>
                              <SelectItem value="BOA">👍 Boa</SelectItem>
                              <SelectItem value="REGULAR">⚠️ Regular</SelectItem>
                              <SelectItem value="RUIM">👎 Ruim</SelectItem>
                              <SelectItem value="PESSIMA">❌ Péssima</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Minutos de Atraso (condicional) */}
                        {registro.status === 'ATRASADO' && (
                          <div className="space-y-2">
                            <Label>Minutos de Atraso *</Label>
                            <Input
                              type="number"
                              min="1"
                              placeholder="Ex: 30"
                              value={registro.minutosAtraso || ''}
                              onChange={(e) => setRegistros(prev => ({
                                ...prev,
                                [colaborador.id]: {
                                  ...prev[colaborador.id],
                                  minutosAtraso: parseInt(e.target.value) || undefined
                                }
                              }))}
                            />
                          </div>
                        )}

                        {/* Justificativa (condicional) */}
                        {(['FALTA', 'ATRASADO'].includes(registro.status) ||
                          ['REGULAR', 'RUIM', 'PESSIMA'].includes(registro.performance)) && (
                            <div className={`space-y-2 ${['FALTA', 'ATRASADO'].includes(registro.status) &&
                              ['REGULAR', 'RUIM', 'PESSIMA'].includes(registro.performance)
                              ? 'col-span-2'
                              : ''
                              }`}>
                              <Label>
                                Justificativa *
                                {['REGULAR', 'RUIM', 'PESSIMA'].includes(registro.performance) &&
                                  ' (Performance)'}
                              </Label>
                              <Textarea
                                placeholder="Descreva a justificativa..."
                                rows={2}
                                value={
                                  ['FALTA', 'ATRASADO'].includes(registro.status)
                                    ? registro.justificativa || ''
                                    : registro.performanceJustificativa || ''
                                }
                                onChange={(e) => {
                                  const field = ['FALTA', 'ATRASADO'].includes(registro.status)
                                    ? 'justificativa'
                                    : 'performanceJustificativa';

                                  setRegistros(prev => ({
                                    ...prev,
                                    [colaborador.id]: {
                                      ...prev[colaborador.id],
                                      [field]: e.target.value
                                    }
                                  }));
                                }}
                              />
                            </div>
                          )}

                        {/* Anexo Atestado (condicional) */}
                        {registro.status === 'FALTA_JUSTIFICADA' && (
                          <div className="space-y-2 col-span-2">
                            <Label>Anexo de Atestado *</Label>
                            <div className="border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer">
                              <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">
                                {registro.anexoAtestado ?
                                  `✅ ${registro.anexoAtestado.name}` :
                                  'Clique para fazer upload do atestado médico'}
                              </p>
                              <input
                                type="file"
                                className="hidden"
                                accept=".pdf,.jpg,.jpeg,.png"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  setRegistros(prev => ({
                                    ...prev,
                                    [colaborador.id]: {
                                      ...prev[colaborador.id],
                                      anexoAtestado: file
                                    }
                                  }));
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Rateio por Centro de Custo */}
                        <div className="space-y-2 col-span-2">
                          <div className="flex items-center justify-between">
                            <Label>
                              Centro de Custo (Multiselect) {requireCC && '*'}
                            </Label>
                            {!requireCC && (
                              <span className="text-xs text-muted-foreground">Opcional para ADM</span>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            {mockCentrosCusto.map(cc => (
                              <label
                                key={cc.id}
                                className={cn(
                                  "flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all",
                                  registro.centrosCusto.includes(cc.id)
                                    ? "border-primary bg-primary/5"
                                    : "border-neutral-200 hover:border-primary/50"
                                )}
                              >
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-primary"
                                  checked={registro.centrosCusto.includes(cc.id)}
                                  onChange={() => handleCentroCustoToggle(colaborador.id, cc.id)}
                                />
                                <span className="text-sm">{cc.nome}</span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Display de Rateio */}
                        {registro.centrosCusto.length > 0 && (
                          <div className="col-span-2 bg-primary/5 border border-primary/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Calculator className="h-5 w-5 text-primary" />
                              <h5 className="font-medium">Cálculo de Rateio</h5>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">Custo-Dia Total</p>
                                <p className="text-lg font-medium">{formatCurrency(colaborador.custoDia)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground mb-1">
                                  Custo por CC ({registro.centrosCusto.length} CC{registro.centrosCusto.length > 1 ? 's' : ''})
                                </p>
                                <p className="text-lg font-medium text-primary">
                                  {formatCurrency(custoDiaRateado)}
                                </p>
                              </div>
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                              📌 Fórmula: Custo por CC = {formatCurrency(colaborador.custoDia)} ÷ {registro.centrosCusto.length}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Botão de Salvar */}
          <div className="mt-6 flex justify-end">
            <Button size="lg" onClick={handleRegistrarPresenca}>
              <CheckCircle className="mr-2 h-5 w-5" />
              Registrar Presença de Todos
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}