import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Search,
  Save,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  XCircle,
  FileText,
  Paperclip,
  DollarSign,
  Loader2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase-client';
import { Colaborador } from '@/types/colaborador';

// Interfaces
interface CentroCusto {
  id: string;
  nome: string;
  codigo?: string;
}

interface RegistroPresenca {
  status: 'OK' | 'ATRASADO' | 'FALTA' | 'FALTA_JUSTIFICADA';
  minutosAtraso?: number;
  justificativa?: string;
  performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM' | 'PESSIMA';
  performanceJustificativa?: string;
  centrosCusto: string[]; // IDs dos centros de custo
  anexoAtestado?: File | null;
  anexoUrl?: string;
}

interface ResumoDia {
  totalPresentes: number;
  totalFaltas: number;
  totalAtrasos: number;
  custoTotalDia: number;
}

export function ControlePresencaPage() {
  const { toast } = useToast();
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Dados reais
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [registros, setRegistros] = useState<Record<string, RegistroPresenca>>({});

  // Carregar dados iniciais
  useEffect(() => {
    fetchDadosIniciais();
  }, []);

  // Carregar registros quando a data mudar
  useEffect(() => {
    if (colaboradores.length > 0) {
      fetchRegistrosDoDia(dataSelecionada);
    }
  }, [dataSelecionada, colaboradores]);

  const fetchDadosIniciais = async () => {
    try {
      setLoading(true);

      // 1. Buscar Colaboradores
      const { data: colsData, error: colsError } = await supabase
        .from('colaboradores')
        .select('*')
        .eq('ativo', true)
        .order('nome_completo');

      if (colsError) throw colsError;

      // 2. Buscar Centros de Custo
      const { data: ccData, error: ccError } = await supabase
        .from('centros_custo')
        .select('id, nome') // Assumindo que existe tabela centros_custo
        .eq('ativo', true)
        .order('nome');

      if (ccError) {
        console.warn('Erro ao buscar centros de custo:', ccError);
        // Fallback se tabela não existir ou erro
        setCentrosCusto([]);
      } else {
        setCentrosCusto(ccData || []);
      }

      setColaboradores(colsData || []);

      // Inicializar registros vazios
      const inicial: Record<string, RegistroPresenca> = {};
      (colsData || []).forEach(col => {
        inicial[col.id] = {
          status: 'OK',
          performance: 'BOA',
          centrosCusto: []
        };
      });
      setRegistros(inicial);

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar a lista de colaboradores.'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchRegistrosDoDia = async (date: Date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('registros_presenca')
        .select('*')
        .eq('data', dateStr);

      if (error) throw error;

      if (data && data.length > 0) {
        const registrosDia: Record<string, RegistroPresenca> = {};

        data.forEach(reg => {
          registrosDia[reg.colaborador_id] = {
            status: reg.status,
            minutosAtraso: reg.minutos_atraso,
            justificativa: reg.justificativa,
            performance: reg.performance,
            performanceJustificativa: reg.performance_justificativa,
            centrosCusto: reg.centros_custo || [], // JSONB array de IDs
            anexoUrl: reg.anexo_url
          };
        });

        // Merge com o estado atual (mantém defaults para quem não tem registro)
        setRegistros(prev => ({
          ...prev,
          ...registrosDia
        }));
      } else {
        // Resetar para defaults se não houver registros no dia
        const reset: Record<string, RegistroPresenca> = {};
        colaboradores.forEach(col => {
          reset[col.id] = {
            status: 'OK',
            performance: 'BOA',
            centrosCusto: []
          };
        });
        setRegistros(reset);
      }

    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao buscar registros',
        description: 'Não foi possível carregar os registros do dia.'
      });
    }
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
        performance
      }
    }));
  };

  const handleCentroCustoChange = (colaboradorId: string, ccId: string, checked: boolean) => {
    setRegistros(prev => {
      const currentCCs = prev[colaboradorId].centrosCusto || [];
      const newCCs = checked
        ? [...currentCCs, ccId]
        : currentCCs.filter(id => id !== ccId);

      return {
        ...prev,
        [colaboradorId]: {
          ...prev[colaboradorId],
          centrosCusto: newCCs
        }
      };
    });
  };

  const handleSalvarPresenca = async () => {
    try {
      setSaving(true);
      const dateStr = format(dataSelecionada, 'yyyy-MM-dd');

      const upsertData = colaboradores.map(col => {
        const reg = registros[col.id];

        // Validação básica
        if (reg.status === 'FALTA_JUSTIFICADA' && !reg.justificativa) {
          throw new Error(`Justificativa obrigatória para ${col.nome_completo}`);
        }

        return {
          colaborador_id: col.id,
          data: dateStr,
          status: reg.status,
          minutos_atraso: reg.minutosAtraso || null,
          justificativa: reg.justificativa || null,
          performance: reg.performance,
          performance_justificativa: reg.performanceJustificativa || null,
          centros_custo: reg.centros_custo, // Supabase trata array JS como JSONB automaticamente
          // TODO: Upload de anexo se houver (reg.anexoAtestado)
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

      toast({
        title: "Presença registrada",
        description: `Dados de ${format(dataSelecionada, "dd/MM/yyyy")} salvos com sucesso.`,
      });

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast({
        variant: 'destructive',
        title: "Erro ao salvar",
        description: error.message || "Ocorreu um erro ao salvar os registros.",
      });
    } finally {
      setSaving(false);
    }
  };

  const calcularCustoDia = (colaborador: Colaborador) => {
    // Lógica simplificada - idealmente viria do backend ou hook
    if (colaborador.tipo_contratacao === 'CLT') {
      return (colaborador.salario_base * 1.46) / 22; // +46% encargos / 22 dias úteis
    }
    return colaborador.custo_dia || 0;
  };

  const calcularResumo = (): ResumoDia => {
    let resumo: ResumoDia = {
      totalPresentes: 0,
      totalFaltas: 0,
      totalAtrasos: 0,
      custoTotalDia: 0
    };

    colaboradores.forEach(col => {
      const reg = registros[col.id];
      if (!reg) return;

      if (['OK', 'ATRASADO'].includes(reg.status)) {
        resumo.totalPresentes++;
        resumo.custoTotalDia += calcularCustoDia(col);
      }
      if (reg.status === 'ATRASADO') resumo.totalAtrasos++;
      if (['FALTA', 'FALTA_JUSTIFICADA'].includes(reg.status)) resumo.totalFaltas++;
    });

    return resumo;
  };

  const resumo = calcularResumo();

  const colaboradoresFiltrados = colaboradores.filter(col => {
    const matchNome = col.nome_completo.toLowerCase().includes(filtroNome.toLowerCase());
    const matchSetor = filtroSetor === 'todos' || col.setor === filtroSetor;
    return matchNome && matchSetor;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Carregando colaboradores...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Controle de Presença e Performance</h1>
          <p className="text-muted-foreground">
            Gerencie a presença diária, alocação de custos e avaliação da equipe.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(dataSelecionada, "PPP", { locale: ptBR })}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={dataSelecionada}
                onSelect={(date) => date && setDataSelecionada(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleSalvarPresenca} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Dia
          </Button>
        </div>
      </div>

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes Hoje</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.totalPresentes}/{colaboradores.length}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((resumo.totalPresentes / colaboradores.length) * 100)}% de presença
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atrasos</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.totalAtrasos}</div>
            <p className="text-xs text-muted-foreground">
              Colaboradores com atraso
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faltas</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resumo.totalFaltas}</div>
            <p className="text-xs text-muted-foreground">
              {resumo.totalFaltas} justificadas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Diário Est.</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumo.custoTotalDia)}
            </div>
            <p className="text-xs text-muted-foreground">
              Baseado na alocação atual
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar colaborador..."
            className="pl-8"
            value={filtroNome}
            onChange={(e) => setFiltroNome(e.target.value)}
          />
        </div>
        <Select value={filtroSetor} onValueChange={setFiltroSetor}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os Setores</SelectItem>
            <SelectItem value="obras">Obras</SelectItem>
            <SelectItem value="administrativo">Administrativo</SelectItem>
            <SelectItem value="assessoria">Assessoria</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Lista de Colaboradores */}
      <div className="space-y-4">
        {colaboradoresFiltrados.map((colaborador) => {
          const registro = registros[colaborador.id] || { status: 'OK', performance: 'BOA', centrosCusto: [] };

          return (
            <Card key={colaborador.id} className={`transition-colors ${registro.status === 'FALTA' ? 'bg-red-50 border-red-200' :
                registro.status === 'FALTA_JUSTIFICADA' ? 'bg-orange-50 border-orange-200' :
                  registro.status === 'ATRASADO' ? 'bg-yellow-50 border-yellow-200' : ''
              }`}>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Info Colaborador */}
                  <div className="flex items-start gap-4 min-w-[250px]">
                    <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                      <AvatarImage src={colaborador.avatar_url} />
                      <AvatarFallback>{colaborador.nome_completo.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold text-lg">{colaborador.nome_completo}</h3>
                      <div className="flex flex-col text-sm text-muted-foreground">
                        <span className="capitalize">{colaborador.funcao?.replace('_', ' ').toLowerCase()}</span>
                        <Badge variant="outline" className="w-fit mt-1 text-xs">
                          {colaborador.tipo_contratacao}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    {/* Status e Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Status Presença</Label>
                        <Select
                          value={registro.status}
                          onValueChange={(val: any) => handleStatusChange(colaborador.id, val)}
                        >
                          <SelectTrigger className={
                            registro.status === 'OK' ? 'text-green-600 font-medium' :
                              registro.status === 'FALTA' ? 'text-red-600 font-medium' :
                                registro.status === 'ATRASADO' ? 'text-yellow-600 font-medium' : ''
                          }>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OK">Presente (No Horário)</SelectItem>
                            <SelectItem value="ATRASADO">Atrasado</SelectItem>
                            <SelectItem value="FALTA">Falta (Não Justificada)</SelectItem>
                            <SelectItem value="FALTA_JUSTIFICADA">Falta Justificada</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Avaliação Diária</Label>
                        <Select
                          value={registro.performance}
                          onValueChange={(val: any) => handlePerformanceChange(colaborador.id, val)}
                          disabled={['FALTA', 'FALTA_JUSTIFICADA'].includes(registro.status)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="OTIMA">⭐⭐⭐⭐⭐ Ótima</SelectItem>
                            <SelectItem value="BOA">⭐⭐⭐⭐ Boa</SelectItem>
                            <SelectItem value="REGULAR">⭐⭐⭐ Regular</SelectItem>
                            <SelectItem value="RUIM">⭐⭐ Ruim</SelectItem>
                            <SelectItem value="PESSIMA">⭐ Péssima</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Campos Condicionais */}
                    {registro.status === 'ATRASADO' && (
                      <div className="flex gap-4 items-end animate-in fade-in slide-in-from-top-2">
                        <div className="w-32">
                          <Label>Minutos</Label>
                          <Input
                            type="number"
                            placeholder="min"
                            value={registro.minutosAtraso || ''}
                            onChange={(e) => setRegistros(prev => ({
                              ...prev,
                              [colaborador.id]: { ...prev[colaborador.id], minutosAtraso: parseInt(e.target.value) }
                            }))}
                          />
                        </div>
                        <div className="flex-1">
                          <Label>Justificativa do Atraso</Label>
                          <Input
                            placeholder="Motivo do atraso..."
                            value={registro.justificativa || ''}
                            onChange={(e) => setRegistros(prev => ({
                              ...prev,
                              [colaborador.id]: { ...prev[colaborador.id], justificativa: e.target.value }
                            }))}
                          />
                        </div>
                      </div>
                    )}

                    {registro.status === 'FALTA_JUSTIFICADA' && (
                      <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                        <div>
                          <Label>Motivo da Falta</Label>
                          <Textarea
                            placeholder="Descreva o motivo da falta..."
                            value={registro.justificativa || ''}
                            onChange={(e) => setRegistros(prev => ({
                              ...prev,
                              [colaborador.id]: { ...prev[colaborador.id], justificativa: e.target.value }
                            }))}
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" className="w-full border-dashed">
                            <Paperclip className="mr-2 h-4 w-4" />
                            Anexar Atestado/Comprovante
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Alocação de Centros de Custo */}
                    {!['FALTA', 'FALTA_JUSTIFICADA'].includes(registro.status) && (
                      <div className="pt-2 border-t mt-4">
                        <Label className="mb-2 block text-xs uppercase text-muted-foreground font-semibold">
                          Alocação de Custo (Onde trabalhou hoje?)
                        </Label>
                        <div className="flex flex-wrap gap-2">
                          {centrosCusto.length === 0 && (
                            <span className="text-sm text-muted-foreground italic">Nenhum centro de custo disponível.</span>
                          )}
                          {centrosCusto.map(cc => (
                            <div key={cc.id} className="flex items-center space-x-2 bg-secondary/50 p-2 rounded-md">
                              <Checkbox
                                id={`cc-${colaborador.id}-${cc.id}`}
                                checked={registro.centrosCusto.includes(cc.id)}
                                onCheckedChange={(checked) => handleCentroCustoChange(colaborador.id, cc.id, checked as boolean)}
                              />
                              <label
                                htmlFor={`cc-${colaborador.id}-${cc.id}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                              >
                                {cc.nome}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {colaboradoresFiltrados.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhum colaborador encontrado com os filtros atuais.
          </div>
        )}
      </div>
    </div>
  );
}