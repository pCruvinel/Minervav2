import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Calendar as CalendarIcon,
  Search,
  Save,
  CheckCircle2,
  Clock,
  XCircle,
  Paperclip,
  DollarSign,
  Loader2,
  Download,
  Eye
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
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase-client';
import { Colaborador } from '@/types/colaborador';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

// Interfaces
interface CentroCusto {
  id: string;
  nome: string;
  codigo?: string;
}

interface RegistroPresenca {
  id?: string; // ID do registro no banco
  status: 'OK' | 'ATRASADO' | 'FALTA' | 'FALTA_JUSTIFICADA';
  minutosAtraso?: number;
  justificativa?: string;
  performance: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM' | 'PESSIMA';
  performanceJustificativa?: string;
  centrosCusto: string[]; // IDs dos centros de custo
  anexoArquivo?: File | null; // Arquivo para upload
  anexoUrl?: string; // URL do arquivo já salvo
}

interface ResumoDia {
  totalPresentes: number;
  totalFaltas: number;
  totalAtrasos: number;
  custoTotalDia: number;
}

interface ResumoMensal {
  colaboradorId: string;
  nome: string;
  diasUteis: number;
  presencas: number;
  atrasos: number;
  faltas: number;
  faltasJustificadas: number;
  custoTotal: number;
  performanceMedia: number; // 1-5
}

export function ControlePresencaPage() {
  const [activeTab, setActiveTab] = useState('diario');
  const [dataSelecionada, setDataSelecionada] = useState<Date>(new Date());
  const [mesSelecionado, setMesSelecionado] = useState<Date>(new Date());
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroSetor, setFiltroSetor] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingRelatorio, setLoadingRelatorio] = useState(false);

  // Dados
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [registros, setRegistros] = useState<Record<string, RegistroPresenca>>({});
  const [dadosRelatorio, setDadosRelatorio] = useState<ResumoMensal[]>([]);

  // Carregar dados iniciais
  useEffect(() => {
    fetchDadosIniciais();
  }, []);

  // Carregar registros quando a data mudar (apenas na aba diário)
  useEffect(() => {
    if (colaboradores.length > 0 && activeTab === 'diario') {
      fetchRegistrosDoDia(dataSelecionada);
    }
  }, [dataSelecionada, colaboradores, activeTab]);

  // Carregar relatório quando mês mudar (apenas na aba relatório)
  useEffect(() => {
    if (colaboradores.length > 0 && activeTab === 'relatorio') {
      fetchRelatorioMensal(mesSelecionado);
    }
  }, [mesSelecionado, colaboradores, activeTab]);

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
        .select('id, nome')
        .eq('ativo', true)
        .order('nome');

      if (ccError) {
        console.warn('Erro ao buscar centros de custo:', ccError);
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
      toast.error('Erro ao carregar dados', {
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
            id: reg.id,
            status: reg.status,
            minutosAtraso: reg.minutos_atraso,
            justificativa: reg.justificativa,
            performance: reg.performance,
            performanceJustificativa: reg.performance_justificativa,
            centrosCusto: reg.centros_custo || [],
            anexoUrl: reg.anexo_url
          };
        });

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
      toast.error('Erro ao buscar registros', {
        description: 'Não foi possível carregar os registros do dia.'
      });
    }
  };

  const fetchRelatorioMensal = async (date: Date) => {
    try {
      setLoadingRelatorio(true);
      const start = startOfMonth(date);
      const end = endOfMonth(date);

      const { data, error } = await supabase
        .from('registros_presenca')
        .select('*')
        .gte('data', format(start, 'yyyy-MM-dd'))
        .lte('data', format(end, 'yyyy-MM-dd'));

      if (error) throw error;

      // Processar dados
      const resumo: Record<string, ResumoMensal> = {};

      // Inicializar para todos colaboradores
      colaboradores.forEach(col => {
        resumo[col.id] = {
          colaboradorId: col.id,
          nome: col.nome_completo,
          diasUteis: 22, // Simplificado
          presencas: 0,
          atrasos: 0,
          faltas: 0,
          faltasJustificadas: 0,
          custoTotal: 0,
          performanceMedia: 0
        };
      });

      // Agregar registros
      const performanceScore = { 'OTIMA': 5, 'BOA': 4, 'REGULAR': 3, 'RUIM': 2, 'PESSIMA': 1 };
      const performanceCount: Record<string, number> = {};
      const performanceSum: Record<string, number> = {};

      data?.forEach(reg => {
        if (!resumo[reg.colaborador_id]) return;

        const r = resumo[reg.colaborador_id];
        const col = colaboradores.find(c => c.id === reg.colaborador_id);
        const custoDia = calcularCustoDia(col!);

        if (reg.status === 'OK') {
          r.presencas++;
          r.custoTotal += custoDia;
        } else if (reg.status === 'ATRASADO') {
          r.atrasos++;
          r.custoTotal += custoDia;
        } else if (reg.status === 'FALTA') {
          r.faltas++;
        } else if (reg.status === 'FALTA_JUSTIFICADA') {
          r.faltasJustificadas++;
        }

        // Performance
        if (reg.performance) {
          performanceSum[reg.colaborador_id] = (performanceSum[reg.colaborador_id] || 0) + performanceScore[reg.performance as keyof typeof performanceScore];
          performanceCount[reg.colaborador_id] = (performanceCount[reg.colaborador_id] || 0) + 1;
        }
      });

      // Calcular médias
      Object.keys(resumo).forEach(id => {
        if (performanceCount[id] > 0) {
          resumo[id].performanceMedia = performanceSum[id] / performanceCount[id];
        }
      });

      setDadosRelatorio(Object.values(resumo));

    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      toast.error('Erro ao gerar relatório', {
        description: 'Não foi possível processar os dados do mês.'
      });
    } finally {
      setLoadingRelatorio(false);
    }
  };

  const uploadAtestado = async (file: File, colaboradorId: string): Promise<string | null> => {
    try {
      const timestamp = new Date().getTime();
      const ext = file.name.split('.').pop();
      const filename = `${colaboradorId}_${timestamp}.${ext}`;
      const path = `${filename}`;

      const { error: uploadError } = await supabase.storage
        .from('comprovantes-presenca')
        .upload(path, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('comprovantes-presenca')
        .getPublicUrl(path);

      return publicUrl;
    } catch (error) {
      console.error('Erro no upload:', error);
      throw error;
    }
  };

  const handleSalvarPresenca = async () => {
    try {
      setSaving(true);
      const dateStr = format(dataSelecionada, 'yyyy-MM-dd');

      // Filtrar apenas colaboradores que tiveram alterações ou precisam ser salvos
      // Por simplicidade, salvamos todos do dia para garantir consistência

      for (const col of colaboradores) {
        const reg = registros[col.id];
        let anexoUrl = reg.anexoUrl;

        // Validação básica
        if (reg.status === 'FALTA_JUSTIFICADA' && !reg.justificativa) {
          throw new Error(`Justificativa obrigatória para ${col.nome_completo}`);
        }

        // Upload de arquivo se houver novo
        if (reg.anexoArquivo) {
          try {
            const url = await uploadAtestado(reg.anexoArquivo, col.id);
            if (url) anexoUrl = url;
          } catch (e) {
            console.error(`Erro upload ${col.nome_completo}:`, e);
            toast.error(`Erro no anexo de ${col.nome_completo}`, {
              description: 'Não foi possível enviar o arquivo. Tente novamente.'
            });
            continue; // Pula este colaborador mas tenta salvar os outros? Ou aborta? Abortando para segurança.
            throw e;
          }
        }

        const upsertData = {
          colaborador_id: col.id,
          data: dateStr,
          status: reg.status,
          minutos_atraso: reg.minutosAtraso || null,
          justificativa: reg.justificativa || null,
          performance: reg.performance,
          performance_justificativa: reg.performanceJustificativa || null,
          centros_custo: reg.centrosCusto,
          anexo_url: anexoUrl,
          updated_at: new Date().toISOString()
        };

        const { error } = await supabase
          .from('registros_presenca')
          .upsert(upsertData, {
            onConflict: 'colaborador_id,data',
            ignoreDuplicates: false
          });

        if (error) throw error;
      }

      toast.success("Presença registrada", {
        description: `Dados de ${format(dataSelecionada, "dd/MM/yyyy")} salvos com sucesso.`,
      });

      // Recarregar para confirmar dados e limpar arquivos pendentes
      fetchRegistrosDoDia(dataSelecionada);

    } catch (error: any) {
      console.error('Erro ao salvar:', error);
      toast.error("Erro ao salvar", {
        description: error.message || "Ocorreu um erro ao salvar os registros.",
      });
    } finally {
      setSaving(false);
    }
  };

  const calcularCustoDia = (colaborador: Colaborador) => {
    if (colaborador.tipo_contratacao === 'CLT') {
      return (colaborador.salario_base * 1.46) / 22;
    }
    return colaborador.custo_dia || 0;
  };

  const calcularResumoDia = (): ResumoDia => {
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

  const resumoDia = calcularResumoDia();

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
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="diario">Controle Diário</TabsTrigger>
          <TabsTrigger value="relatorio">Relatório Mensal</TabsTrigger>
        </TabsList>

        <TabsContent value="diario" className="space-y-6">
          {/* Controles do Dia */}
          <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(dataSelecionada, "PPP", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataSelecionada}
                    onSelect={(date) => date && setDataSelecionada(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <Button onClick={handleSalvarPresenca} disabled={saving}>
              {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
              Salvar Dia
            </Button>
          </div>

          {/* Cards de Resumo do Dia */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Presentes Hoje</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-success" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumoDia.totalPresentes}/{colaboradores.length}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((resumoDia.totalPresentes / colaboradores.length) * 100)}% de presença
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Atrasos</CardTitle>
                <Clock className="h-4 w-4 text-warning" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumoDia.totalAtrasos}</div>
                <p className="text-xs text-muted-foreground">
                  Colaboradores com atraso
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faltas</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{resumoDia.totalFaltas}</div>
                <p className="text-xs text-muted-foreground">
                  {resumoDia.totalFaltas} justificadas
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
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(resumoDia.custoTotalDia)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Baseado na alocação atual
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex gap-4 items-center">
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
                <Card key={colaborador.id} className={`transition-colors ${registro.status === 'FALTA' ? 'bg-destructive/5 border-destructive/20' :
                  registro.status === 'FALTA_JUSTIFICADA' ? 'bg-warning/5 border-warning/20' :
                    registro.status === 'ATRASADO' ? 'bg-warning/5 border-warning/20' : ''
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
                              onValueChange={(val: any) => {
                                setRegistros(prev => ({
                                  ...prev,
                                  [colaborador.id]: {
                                    ...prev[colaborador.id],
                                    status: val,
                                    minutosAtraso: val === 'ATRASADO' ? prev[colaborador.id].minutosAtraso : undefined,
                                    justificativa: ['FALTA', 'ATRASADO'].includes(val) ? prev[colaborador.id].justificativa : undefined,
                                    anexoArquivo: val === 'FALTA_JUSTIFICADA' ? prev[colaborador.id].anexoArquivo : null,
                                  }
                                }));
                              }}
                            >
                              <SelectTrigger className={
                                registro.status === 'OK' ? 'text-success font-medium' :
                                  registro.status === 'FALTA' ? 'text-destructive font-medium' :
                                    registro.status === 'ATRASADO' ? 'text-warning font-medium' : ''
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
                              onValueChange={(val: any) => {
                                setRegistros(prev => ({
                                  ...prev,
                                  [colaborador.id]: { ...prev[colaborador.id], performance: val }
                                }));
                              }}
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
                              <div className="flex-1">
                                <Label htmlFor={`file-${colaborador.id}`} className="cursor-pointer">
                                  <div className="flex items-center justify-center w-full h-10 px-4 py-2 text-sm font-medium transition-colors border rounded-md hover:bg-accent hover:text-accent-foreground border-input bg-background border-dashed">
                                    <Paperclip className="mr-2 h-4 w-4" />
                                    {registro.anexoArquivo ? registro.anexoArquivo.name : "Anexar Atestado"}
                                  </div>
                                </Label>
                                <Input
                                  id={`file-${colaborador.id}`}
                                  type="file"
                                  className="hidden"
                                  accept=".pdf,.jpg,.jpeg,.png"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      setRegistros(prev => ({
                                        ...prev,
                                        [colaborador.id]: { ...prev[colaborador.id], anexoArquivo: file }
                                      }));
                                    }
                                  }}
                                />
                              </div>
                              {registro.anexoUrl && (
                                <Button variant="outline" size="icon" asChild>
                                  <a href={registro.anexoUrl} target="_blank" rel="noopener noreferrer">
                                    <Eye className="h-4 w-4" />
                                  </a>
                                </Button>
                              )}
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
                                    onCheckedChange={(checked) => {
                                      setRegistros(prev => {
                                        const currentCCs = prev[colaborador.id].centrosCusto || [];
                                        const newCCs = checked
                                          ? [...currentCCs, cc.id]
                                          : currentCCs.filter(id => id !== cc.id);

                                        return {
                                          ...prev,
                                          [colaborador.id]: {
                                            ...prev[colaborador.id],
                                            centrosCusto: newCCs
                                          }
                                        };
                                      });
                                    }}
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
          </div>
        </TabsContent>

        <TabsContent value="relatorio">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Relatório Mensal de Presença</CardTitle>
                  <CardDescription>
                    Visão consolidada de faltas, atrasos e custos por colaborador.
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={mesSelecionado.toISOString()}
                    onValueChange={(val) => setMesSelecionado(new Date(val))}
                  >
                    <SelectTrigger className="w-[180px]">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      <SelectValue>{format(mesSelecionado, 'MMMM yyyy', { locale: ptBR })}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {/* Gerar últimos 6 meses */}
                      {Array.from({ length: 6 }).map((_, i) => {
                        const date = new Date();
                        date.setMonth(date.getMonth() - i);
                        return (
                          <SelectItem key={i} value={date.toISOString()}>
                            {format(date, 'MMMM yyyy', { locale: ptBR })}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadingRelatorio ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Colaborador</TableHead>
                      <TableHead className="text-center">Dias Úteis</TableHead>
                      <TableHead className="text-center">Presenças</TableHead>
                      <TableHead className="text-center text-warning">Atrasos</TableHead>
                      <TableHead className="text-center text-destructive">Faltas</TableHead>
                      <TableHead className="text-center">Performance</TableHead>
                      <TableHead className="text-right">Custo Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dadosRelatorio.map((item) => (
                      <TableRow key={item.colaboradorId}>
                        <TableCell className="font-medium">{item.nome}</TableCell>
                        <TableCell className="text-center">{item.diasUteis}</TableCell>
                        <TableCell className="text-center">{item.presencas}</TableCell>
                        <TableCell className="text-center text-warning font-medium">{item.atrasos}</TableCell>
                        <TableCell className="text-center text-destructive font-medium">{item.faltas + item.faltasJustificadas}</TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1">
                            <span className="font-bold">{item.performanceMedia.toFixed(1)}</span>
                            <span className="text-xs text-muted-foreground">/ 5.0</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.custoTotal)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}