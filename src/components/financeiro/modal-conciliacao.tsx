/**
 * ModalConciliacao - Modal unificado para conciliação bancária
 *
 * Duas abas:
 * - Vincular: Selecionar despesa/receita existente
 * - Criar Novo: Formulário de classificação (categoria, setor, rateio)
 *
 * Features:
 * - Matching automático por valor/data
 * - Split de valor (vincular parcialmente)
 * - Modal de confirmação antes de conciliar
 * - Modo read-only para transações já conciliadas
 * - Campo de anexo
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import {
  Link2,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Building2,
  Calendar,
  Wallet,
  Check,
  Sparkles,
  Trash2,
  Upload,
  File,
  FileText,
  Clock,
  AlertTriangle,
  Info,
  Users,
  UserCheck,
  Unlink,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../ui/utils';

import {
  useSugestoesConciliacao,
  useRegistrosFinanceirosPendentes,
  useVincularLancamento,
  type SugestaoVinculo,
} from '@/lib/hooks/use-registros-financeiros';
import { useCategoriasFinanceiras } from '@/lib/hooks/use-categorias-financeiras';
import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
import { useClassificarLancamento, type LancamentoBancario } from '@/lib/hooks/use-lancamentos-bancarios';
import { useSetores } from '@/lib/hooks/use-setores';
import { supabase } from '@/lib/supabase-client';
import { useColaboradoresSelect } from '@/lib/hooks/use-colaboradores';
import { useCustosVariaveisPorLancamento } from '@/lib/hooks/use-custos-variaveis';
import { MultiSelect } from '@/components/ui/multi-select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  useReceitasPrevistasConciliacao,
  filtrarReceitasPorBusca,
  type ReceitaPrevistaConciliacao,
} from '@/lib/hooks/use-receitas-previstas-conciliacao';
import { validarExtensaoAnexo, gerarPathAnexo } from '@/lib/hooks/colab-anexo-utils';
import { useVincularPagador, useDesvincularPagador } from '@/lib/hooks/use-vincular-pagador';
import { useClientes } from '@/lib/hooks/use-clientes';

const CATEGORIA_MAO_DE_OBRA_ID = '843f5fef-fb6a-49bd-bec3-b0917c2d4204';

// Nomes de categorias para detecção no modo read-only
const MO_CATEGORY_NAMES = ['mão de obra', 'mao de obra', 'tributos de mão de obra', 'tributos de mao de obra'];

// Categorias fixas para Entradas (Receitas) avulsas
const CATEGORIA_RESGATE_APLICACAO_ID = '__resgate_aplicacao__';
const CATEGORIA_OUTROS_ID = '__outros__';
const ENTRY_EXTRA_CATEGORIES = [
  { id: CATEGORIA_RESGATE_APLICACAO_ID, nome: 'Resgate de Aplicação', codigo: 'RESGATE', tipo: 'receber' as const, ativo: true },
  { id: CATEGORIA_OUTROS_ID, nome: 'Outros', codigo: 'OUTROS', tipo: 'receber' as const, ativo: true },
];

// Categorias fixas para Saídas (Despesas) avulsas
const CATEGORIA_APLICACAO_ID = '__aplicacao__';
const EXIT_EXTRA_CATEGORIES = [
  { id: CATEGORIA_APLICACAO_ID, nome: 'Aplicação', codigo: 'APLICACAO', tipo: 'pagar' as const, ativo: true },
];

// IDs de categorias que são descartadas de relatórios
const CATEGORIAS_DESCARTADAS = [CATEGORIA_RESGATE_APLICACAO_ID, CATEGORIA_APLICACAO_ID];

// ============================================================
// TYPES
// ============================================================

interface RateioItem {
  id: string;
  centroCusto: string;
  valor: number;
  percentual: number;
}

interface ModalConciliacaoProps {
  open: boolean;
  onClose: () => void;
  lancamento: LancamentoBancario | null;
}

const SETORES = [
  { value: 'administrativo', label: 'Administrativo' },
  { value: 'obras', label: 'Obras' },
  { value: 'assessoria', label: 'Assessoria' },
  { value: 'diretoria', label: 'Diretoria' },
  { value: 'ti', label: 'TI' },
];

// ============================================================
// COMPONENT
// ============================================================

export function ModalConciliacao({ open, onClose, lancamento }: ModalConciliacaoProps) {
  // Tab state
  const [activeTab, setActiveTab] = useState<'vincular' | 'criar'>('vincular');

  // Confirmation dialog state
  const [showConfirmation, setShowConfirmation] = useState(false);

  // File upload states (separate for NF and Comprovante)
  const [notaFiscal, setNotaFiscal] = useState<File | null>(null);
  const [comprovante, setComprovante] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const notaFiscalInputRef = useRef<HTMLInputElement>(null);
  const comprovanteInputRef = useRef<HTMLInputElement>(null);

  // Vincular state
  const [registroSelecionado, setRegistroSelecionado] = useState<SugestaoVinculo | null>(null);
  const [usarValorParcial, setUsarValorParcial] = useState(false);
  const [valorParcial, setValorParcial] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermReceitas, setSearchTermReceitas] = useState('');

  // Criar state
  const [categoriaIdSelecionada, setCategoriaIdSelecionada] = useState('');
  const [setorSelecionado, setSetorSelecionado] = useState('');
  const [rateios, setRateios] = useState<RateioItem[]>([]);
  
  // Mão de Obra state
  const [selectedColabIds, setSelectedColabIds] = useState<string[]>([]);
  const [tipoCustoVariavel, setTipoCustoVariavel] = useState<'flutuante' | 'geral'>('flutuante');
  const [colabRateios, setColabRateios] = useState<Record<string, number>>({}); // { colabId: percentual }
  const [colabAnexos, setColabAnexos] = useState<Record<string, File | null>>({}); // { colabId: File }

  // Vincular Cliente state
  const [clienteSelecionadoId, setClienteSelecionadoId] = useState<string>('');
  const [lembrarPagador, setLembrarPagador] = useState(true);
  const [relacaoPagador, setRelacaoPagador] = useState<'titular' | 'socio' | 'familiar' | 'terceiro'>('terceiro');
  const [searchCliente, setSearchCliente] = useState('');

  // Read-only mode detection
  const isReadOnly = lancamento?.status === 'conciliado';

  // Data hooks
  const tipoRegistro = lancamento?.entrada ? 'receber' : 'pagar';
  const valorLancamento = lancamento?.entrada || lancamento?.saida || 0;
  const dataLancamento = lancamento?.data || '';

  const { data: sugestoes = [] } = useSugestoesConciliacao(
    valorLancamento,
    dataLancamento,
    tipoRegistro,
    open && !!lancamento
  );

  const { data: todosRegistros = [], isLoading: loadingRegistros } = useRegistrosFinanceirosPendentes(tipoRegistro);

  const { data: categorias = [] } = useCategoriasFinanceiras(tipoRegistro === 'receber' ? 'receber' : 'pagar');
  const { listCentrosCusto } = useCentroCusto();
  const [centrosCusto, setCentrosCusto] = useState<{ id: string; nome: string }[]>([]);
  const { setores = [] } = useSetores();
  const { data: colaboradores = [] } = useColaboradoresSelect();

  // Hook: custos variáveis do lançamento (para read-only MO)
  const { data: custosVariaveisLancamento = [] } = useCustosVariaveisPorLancamento(
    isReadOnly && lancamento?.id ? lancamento.id : undefined
  );

  // Hook: receitas previstas para Vincular Entrada
  const { data: receitasPrevistas = [], isLoading: loadingReceitas } = useReceitasPrevistasConciliacao(
    open && !!lancamento?.entrada
  );

  const vincularMutation = useVincularLancamento();
  const classificarMutation = useClassificarLancamento();
  const vincularPagadorMutation = useVincularPagador();
  const desvincularPagadorMutation = useDesvincularPagador();
  const { clientes: todosClientes = [], loading: loadingClientes } = useClientes({ status: ['ativo', 'lead'] });

  // Filtrar clientes por busca
  const clientesFiltrados = useMemo(() => {
    if (!searchCliente) return todosClientes.slice(0, 20);
    const term = searchCliente.toLowerCase();
    return todosClientes.filter(
      (c: any) =>
        c.nome_razao_social?.toLowerCase().includes(term) ||
        c.cpf_cnpj?.toLowerCase().includes(term) ||
        c.apelido?.toLowerCase().includes(term)
    ).slice(0, 20);
  }, [todosClientes, searchCliente]);

  // Detectar se categoria é Mão de Obra (para read-only)
  const isCategoriaMovelObra = useMemo(() => {
    const nomeCategoria = lancamento?.categoria?.nome?.toLowerCase() || '';
    return MO_CATEGORY_NAMES.some(n => nomeCategoria.includes(n));
  }, [lancamento?.categoria?.nome]);

  // Categorias mescladas (adiciona extras por tipo, sem duplicar nomes existentes do banco)
  const categoriasComExtras = useMemo(() => {
    const extras = lancamento?.entrada ? ENTRY_EXTRA_CATEGORIES : EXIT_EXTRA_CATEGORIES;
    const existingNames = new Set(categorias.map(c => c.nome.toLowerCase()));
    const filtered = extras.filter(e => !existingNames.has(e.nome.toLowerCase()));
    return [...categorias, ...filtered];
  }, [categorias, lancamento?.entrada]);

  // ID real da categoria "Aplicação" do banco (para o hint)
  const aplicacaoDbId = useMemo(() => {
    return categorias.find(c => c.nome.toLowerCase() === 'aplicação')?.id;
  }, [categorias]);

  // Todas IDs que devem mostrar o hint de descarte
  const isCategoriDescartada = useMemo(() => {
    const ids = [...CATEGORIAS_DESCARTADAS];
    if (aplicacaoDbId) ids.push(aplicacaoDbId);
    return ids.includes(categoriaIdSelecionada);
  }, [categoriaIdSelecionada, aplicacaoDbId]);

  // Para Entrada Vincular: filtrar receitas previstas por busca
  const receitasPrevistasFiltradas = useMemo(() => {
    return filtrarReceitasPorBusca(receitasPrevistas, searchTermReceitas);
  }, [receitasPrevistas, searchTermReceitas]);

  // Load CCs when modal opens
  useEffect(() => {
    if (open) {
      listCentrosCusto().then(setCentrosCusto);
    }
  }, [open, listCentrosCusto]);

  // Reset state when modal opens
  useEffect(() => {
    if (open && lancamento) {
      setActiveTab('vincular');
      setRegistroSelecionado(null);
      setUsarValorParcial(false);
      setValorParcial(valorLancamento);
      setSearchTerm('');
      setCategoriaIdSelecionada('');
      setSetorSelecionado('');
      setRateios([{ id: '1', centroCusto: '', valor: valorLancamento, percentual: 100 }]);
      setSelectedColabIds([]);
      setTipoCustoVariavel('flutuante');
      setColabRateios({});
      setColabAnexos({});
      setSearchTermReceitas('');
      setClienteSelecionadoId('');
      setLembrarPagador(true);
      setRelacaoPagador('terceiro');
      setSearchCliente('');
    }
  }, [open, lancamento, valorLancamento]);

  // Auto-preencher setor quando categoria muda (feature removed - setor_padrao not available on CategoriaFinanceira)
  // useEffect(() => {
  //   if (categoriaIdSelecionada) {
  //     const cat = categorias.find((c) => c.id === categoriaIdSelecionada);
  //     if (cat?.setor_padrao?.slug) {
  //       setSetorSelecionado(cat.setor_padrao.slug);
  //     }
  //   }
  // }, [categoriaIdSelecionada, categorias]);

  // Filtrar registros por busca
  const registrosFiltrados = useMemo(() => {
    if (!searchTerm) return todosRegistros;
    const term = searchTerm.toLowerCase();
    return todosRegistros.filter(
      (r) =>
        r.descricao.toLowerCase().includes(term) ||
        r.fornecedor?.toLowerCase().includes(term) ||
        r.cliente_nome?.toLowerCase().includes(term) ||
        r.cc_nome?.toLowerCase().includes(term)
    );
  }, [todosRegistros, searchTerm]);

  // Format helpers
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  // Helper to get CC name by ID
  const getCCNome = (ccId: string) => {
    const cc = centrosCusto.find(c => c.id === ccId);
    return cc?.nome || ccId;
  };

  // Collaborator rateio helpers
  const dividirColabsIgualmente = () => {
    if (selectedColabIds.length === 0) return;
    const percentualIgual = 100 / selectedColabIds.length;
    const newRateios: Record<string, number> = {};
    selectedColabIds.forEach(id => {
      newRateios[id] = percentualIgual;
    });
    setColabRateios(newRateios);
  };

  const handleUpdateColabRateio = (colabId: string, campo: 'percentual' | 'valor', rawValue: string) => {
    const numValue = parseFloat(rawValue) || 0;
    
    let newPercentual: number;
    if (campo === 'percentual') {
      newPercentual = numValue;
    } else {
      // Calculate percentual from valor
      newPercentual = valorLancamento > 0 ? (numValue / valorLancamento) * 100 : 0;
    }
    
    setColabRateios(prev => ({
      ...prev,
      [colabId]: newPercentual
    }));
  };

  // Get collaborator percentual (from state or equal distribution if not set)
  const getColabPercentual = (colabId: string) => {
    if (colabRateios[colabId] !== undefined) {
      return colabRateios[colabId];
    }
    // Default: equal distribution
    return selectedColabIds.length > 0 ? 100 / selectedColabIds.length : 0;
  };

  // Validation: total should be 100%
  const totalColabPercentual = selectedColabIds.reduce((sum, id) => sum + getColabPercentual(id), 0);
  const isColabRateioValido = Math.abs(totalColabPercentual - 100) < 0.01;

  // Rateio handlers
  const handleAdicionarRateio = () => {
    setRateios([...rateios, { id: Date.now().toString(), centroCusto: '', valor: 0, percentual: 0 }]);
  };

  const handleRemoverRateio = (id: string) => {
    if (rateios.length > 1) {
      setRateios(rateios.filter((r) => r.id !== id));
    }
  };

  const handleAtualizarRateio = (id: string, campo: 'centroCusto' | 'valor' | 'percentual', valor: string | number) => {
    setRateios(
      rateios.map((r) => {
        if (r.id === id) {
          if (campo === 'percentual') {
            const percentual = typeof valor === 'string' ? parseFloat(valor) || 0 : valor;
            const valorCalc = valorLancamento * (percentual / 100);
            return { ...r, percentual, valor: valorCalc };
          } else if (campo === 'valor') {
            const valorNum = typeof valor === 'string' ? parseFloat(valor) || 0 : valor;
            const percentual = (valorNum / valorLancamento) * 100;
            return { ...r, valor: valorNum, percentual };
          } else {
            return { ...r, [campo]: String(valor) };
          }
        }
        return r;
      })
    );
  };

  const handleDistribuirIgualmente = () => {
    const percentualPorItem = 100 / rateios.length;
    const valorPorItem = valorLancamento / rateios.length;
    setRateios(rateios.map((r) => ({ ...r, percentual: percentualPorItem, valor: valorPorItem })));
  };

  const totalPercentual = rateios.reduce((acc, r) => acc + r.percentual, 0);
  const totalValor = rateios.reduce((acc, r) => acc + r.valor, 0);
  const isRateioValido = Math.abs(totalPercentual - 100) < 0.1 && Math.abs(totalValor - valorLancamento) < 0.1;

  // Helper de upload
  const uploadFile = async (file: File) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('financeiro')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('financeiro').getPublicUrl(filePath);
    return data.publicUrl;
  };

  // Submit handlers
  const handleVincular = async () => {
    if (!lancamento || !registroSelecionado) return;

    try {
      setIsUploading(true);
      let notaFiscalUrl = lancamento.nota_fiscal_url;
      let comprovanteUrl = lancamento.comprovante_url;

      if (notaFiscal) notaFiscalUrl = await uploadFile(notaFiscal);
      if (comprovante) comprovanteUrl = await uploadFile(comprovante);

      await vincularMutation.mutateAsync({
        lancamentoId: lancamento.id,
        contaPagarId: tipoRegistro === 'pagar' ? registroSelecionado.id : undefined,
        contaReceberId: tipoRegistro === 'receber' ? registroSelecionado.id : undefined,
        valorParcial: usarValorParcial ? valorParcial : undefined,
        // Ao vincular, atualizar URLs de documento se houver novos uploads
        // Nota: O backend precisa suportar isso no useVincularConta, vamos assumir que o sistema atualiza se mandar no update
      });
      
      // Se houve upload, precisamos atualizar os campos de URL no lançamento separadamente se o useVincular não fizer isso
      // O useVincularLancamento atual não recebe URLs, então vamos fazer um update manual se necessário
      if (notaFiscalUrl !== lancamento.nota_fiscal_url || comprovanteUrl !== lancamento.comprovante_url) {
         await supabase.from('lancamentos_bancarios').update({
            nota_fiscal_url: notaFiscalUrl,
            comprovante_url: comprovanteUrl
         }).eq('id', lancamento.id);
      }

      toast.success('Transação conciliada com sucesso!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao conciliar transação');
    } finally {
      setIsUploading(false);
    }
  };

  const getSetorId = (slug: string) => {
    const map: Record<string, string> = {
      administrativo: 'Administrativo',
      obras: 'Obras',
      assessoria: 'Assessoria',
      diretoria: 'Diretoria',
      ti: 'TI',
    };
    const nome = map[slug] || slug;
    const setor = setores.find((s: { nome: string; id: string }) => s.nome === nome || s.nome.toLowerCase() === slug.toLowerCase());
    return setor?.id;
  };

  const handleCriar = async () => {
    const isCategoriaMaoDeObra = categoriaIdSelecionada === CATEGORIA_MAO_DE_OBRA_ID;

    // Mão de Obra não precisa de setor/rateio CC pois colaborador já tem
    if (!lancamento || !categoriaIdSelecionada || (!isCategoriaMaoDeObra && !setorSelecionado)) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (!isCategoriaMaoDeObra && !isRateioValido) {
      toast.error('A soma dos rateios deve ser igual a 100%');
      return;
    }

    try {
      setIsUploading(true);
      const setorId = getSetorId(setorSelecionado);

      // Se houver apenas um rateio (100%), usar o CC dele como cc_id principal
      const ccIdPrincipal = rateios.length === 1 && rateios[0].centroCusto ? rateios[0].centroCusto : undefined;

      let notaFiscalUrl = lancamento.nota_fiscal_url;
      let comprovanteUrl = lancamento.comprovante_url;

      // Upload per-collaborator attachments for MO
      let colabAnexoUrls: Record<string, string> | undefined;
      if (isCategoriaMaoDeObra) {
        colabAnexoUrls = {};
        for (const [colabId, file] of Object.entries(colabAnexos)) {
          if (file) {
            const path = gerarPathAnexo(colabId, lancamento.id, file.name);
            const { error: upErr } = await supabase.storage
              .from('financeiro')
              .upload(path, file);
            if (upErr) throw upErr;
            const { data: urlData } = supabase.storage.from('financeiro').getPublicUrl(path);
            colabAnexoUrls[colabId] = urlData.publicUrl;
          }
        }
      } else {
        if (notaFiscal) notaFiscalUrl = await uploadFile(notaFiscal);
        if (comprovante) comprovanteUrl = await uploadFile(comprovante);
      }

      await classificarMutation.mutateAsync({
        id: lancamento.id,
        categoria_id: categoriaIdSelecionada,
        setor_id: setorId,
        cc_id: ccIdPrincipal,
        rateios: rateios.map((r) => ({
          cc_id: r.centroCusto,
          cc_nome: centrosCusto.find(cc => cc.id === r.centroCusto)?.nome,
          valor: r.valor,
          percentual: r.percentual,
        })),
        nota_fiscal_url: isCategoriaMaoDeObra ? undefined : (notaFiscalUrl || undefined),
        comprovante_url: isCategoriaMaoDeObra ? undefined : (comprovanteUrl || undefined),
        // Campos Extras Mão de Obra
        tipo_custo_mo: isCategoriaMaoDeObra ? tipoCustoVariavel : undefined,
        colaborador_ids: isCategoriaMaoDeObra ? selectedColabIds : undefined,
        is_rateio_colaboradores: isCategoriaMaoDeObra ? selectedColabIds.length > 0 : undefined,
        colabAnexoUrls: isCategoriaMaoDeObra ? colabAnexoUrls : undefined,
      });

      toast.success('Transação classificada com sucesso!');
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Erro ao classificar transação');
    } finally {
      setIsUploading(false);
    }
  };

  if (!lancamento) return null;

  const isEntrada = !!lancamento.entrada;

  // Handler para abrir modal de confirmação
  const handleConciliarClick = () => {
    setShowConfirmation(true);
  };

  // Handler para confirmar conciliação
  const handleConfirmConciliar = async () => {
    setShowConfirmation(false);
    if (activeTab === 'vincular') {
      await handleVincular();
    } else {
      await handleCriar();
    }
  };

  // Renderizar modo read-only para transações já conciliadas
  if (isReadOnly) {
    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
          {/* Header com badges */}
          <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  'p-3 rounded-xl',
                  isEntrada ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                )}
              >
                {isEntrada ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <DialogTitle className="text-lg font-semibold">
                    {lancamento.contraparte_nome || lancamento.descricao}
                  </DialogTitle>
                  <Badge variant="outline" className="text-[10px] bg-blue-600 text-white hover:bg-blue-700 border-none rounded-full">
                    {lancamento.status === 'conciliado' ? 'Conciliado' : lancamento.status}
                  </Badge>
                </div>
                <DialogDescription className="text-sm mt-1 truncate">
                  {lancamento.descricao}
                </DialogDescription>
                {/* Badges de informação */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {lancamento.metodo_transacao && (
                    <Badge variant="secondary" className="text-[10px]">
                      {lancamento.metodo_transacao}
                    </Badge>
                  )}
                  <Badge variant="outline" className={cn(
                    "text-[10px]",
                    isEntrada ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive'
                  )}>
                    {isEntrada ? 'Entrada' : 'Saída'}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">
                    <Calendar className="h-3 w-3 mr-1" />
                    {format(new Date(lancamento.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor</p>
                <p
                  className={cn(
                    'text-2xl font-bold tabular-nums',
                    isEntrada ? 'text-success' : 'text-destructive'
                  )}
                >
                  {isEntrada ? '+' : '-'}
                  {formatCurrency(valorLancamento)}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Conteúdo Scrollável */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="px-6 py-4 space-y-4">
              
              {/* Seção: Detalhes da Transação */}
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  Detalhes da Transação
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Banco</span>
                    <p className="font-medium">{lancamento.banco || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Conta</span>
                    <p className="font-medium">{lancamento.conta_bancaria || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Saldo Após</span>
                    <p className="font-medium">{lancamento.saldo_apos ? formatCurrency(lancamento.saldo_apos) : '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">ID Cora</span>
                    <p className="font-medium font-mono text-xs">{lancamento.cora_entry_id || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Seção: Contraparte */}
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Contraparte
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nome</span>
                    <p className="font-medium">{lancamento.contraparte_nome || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Documento (CPF/CNPJ)</span>
                    <p className="font-medium font-mono">{lancamento.contraparte_documento || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Seção: Classificação */}
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Classificação
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Categoria</span>
                    <p className="font-medium">{lancamento.categoria?.nome || '-'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Setor</span>
                    <p className="font-medium">{lancamento.setor?.nome || '-'}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-muted-foreground">Centro de Custo</span>
                    <p className="font-medium">{lancamento.centro_custo?.nome || '-'}</p>
                  </div>
                  {lancamento.rateios && lancamento.rateios.length > 0 && (
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Rateio</span>
                      <div className="mt-1 space-y-1">
                        {lancamento.rateios.map((r, idx) => (
                          <div key={idx} className="flex justify-between text-xs bg-muted/50 rounded px-2 py-1">
                            <span>{r.cc_nome || getCCNome(r.cc_id)}</span>
                            <span>{r.percentual}% ({formatCurrency(r.valor || 0)})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Seção: Detalhes de Mão de Obra (Read-Only) */}
              {isCategoriaMovelObra && (
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Detalhes de Mão de Obra
                  </h4>

                  {/* Tipo de Custo */}
                  {lancamento.tipo_custo_mo && (
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground">Tipo:</span>
                      <Badge
                        variant={lancamento.tipo_custo_mo === 'flutuante' ? 'default' : 'secondary'}
                        className="text-[10px]"
                      >
                        {lancamento.tipo_custo_mo === 'flutuante' ? 'Custo Flutuante (Soma ao Custo Dia)' : 'Custo Geral/Fixo'}
                      </Badge>
                    </div>
                  )}

                  {/* Lista de Colaboradores */}
                  {custosVariaveisLancamento.length > 0 ? (
                    <div className="rounded-md border overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-muted/50">
                          <tr>
                            <th className="text-left px-3 py-2 font-medium text-xs">Colaborador</th>
                            <th className="text-right px-3 py-2 font-medium text-xs w-24">Valor</th>
                            <th className="text-right px-3 py-2 font-medium text-xs w-16">%</th>
                            <th className="text-center px-3 py-2 font-medium text-xs w-28">Tipo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {custosVariaveisLancamento.map((custo, idx) => {
                            const percentual = custo.valor_original && custo.valor_original > 0
                              ? ((custo.valor / custo.valor_original) * 100)
                              : null;
                            return (
                              <tr
                                key={custo.id}
                                className={cn('border-t', idx % 2 === 1 && 'bg-muted/20')}
                              >
                                <td className="px-3 py-2 text-xs">
                                  {custo.colaborador?.nome_completo || 'Todos'}
                                </td>
                                <td className="px-3 py-2 text-xs text-right tabular-nums font-medium">
                                  {formatCurrency(custo.valor)}
                                </td>
                                <td className="px-3 py-2 text-xs text-right tabular-nums">
                                  {percentual !== null ? `${percentual.toFixed(1)}%` : '-'}
                                </td>
                                <td className="px-3 py-2 text-center">
                                  <Badge
                                    variant={custo.tipo_custo === 'flutuante' ? 'default' : 'secondary'}
                                    className="text-[9px]"
                                  >
                                    {custo.tipo_custo === 'flutuante' ? 'Flutuante' : 'Geral/Fixo'}
                                  </Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : lancamento.colaborador_ids && lancamento.colaborador_ids.length > 0 ? (
                    <p className="text-xs text-muted-foreground italic">
                      {lancamento.colaborador_ids.length} colaborador(es) vinculado(s) — detalhes de rateio não disponíveis.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground italic">
                      Nenhum colaborador vinculado a este lançamento.
                    </p>
                  )}
                </div>
              )}

              {/* Seção: Vínculos */}
              {(lancamento.conta_pagar_id || lancamento.conta_receber_id) && (
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <Link2 className="h-4 w-4" />
                    Vínculos
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {lancamento.conta_pagar_id && (
                      <div>
                        <span className="text-muted-foreground">Conta a Pagar</span>
                        <p className="font-medium font-mono text-xs">{lancamento.conta_pagar_id}</p>
                      </div>
                    )}
                    {lancamento.conta_receber_id && (
                      <div>
                        <span className="text-muted-foreground">Conta a Receber</span>
                        <p className="font-medium font-mono text-xs">{lancamento.conta_receber_id}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Seção: Documentos */}
              <div className="rounded-lg border p-4">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <File className="h-4 w-4" />
                  Documentos
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Nota Fiscal</span>
                    {lancamento.nota_fiscal_url ? (
                      <a
                        href={lancamento.nota_fiscal_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline mt-1"
                      >
                        <File className="h-3 w-3" />
                        Ver documento
                      </a>
                    ) : (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Comprovante</span>
                    {lancamento.comprovante_url ? (
                      <a
                        href={lancamento.comprovante_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline mt-1"
                      >
                        <File className="h-3 w-3" />
                        Ver documento
                      </a>
                    ) : (
                      <p className="text-muted-foreground">-</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seção: Histórico */}
              <div className="rounded-lg border p-4 bg-muted/30">
                <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Histórico
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Classificado por</span>
                    <p className="font-medium">{lancamento.classificado_por?.nome || 'Sistema'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Data da Classificação</span>
                    <p className="font-medium">
                      {lancamento.classificado_em
                        ? format(new Date(lancamento.classificado_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
                        : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Observações */}
              {lancamento.observacoes && (
                <div className="rounded-lg border p-4">
                  <h4 className="text-sm font-semibold mb-2">Observações</h4>
                  <p className="text-sm text-muted-foreground">{lancamento.observacoes}</p>
                </div>
              )}

            </div>
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0">
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-4 border-b bg-muted/30">
          <div className="flex items-start gap-4">
            <div
              className={cn(
                'p-3 rounded-xl',
                isEntrada ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
              )}
            >
              {isEntrada ? <ArrowDownRight className="h-6 w-6" /> : <ArrowUpRight className="h-6 w-6" />}
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg font-semibold">Conciliar Transação</DialogTitle>
              <DialogDescription className="text-sm mt-1">
                {lancamento.contraparte_nome || lancamento.descricao}
              </DialogDescription>
              {/* Badges de informação */}
              <div className="flex flex-wrap items-center gap-2 mt-2">
                {lancamento.metodo_transacao && (
                  <Badge variant="secondary" className="text-[10px]">
                    {lancamento.metodo_transacao}
                  </Badge>
                )}
                <Badge variant="outline" className={cn(
                  "text-[10px]",
                  isEntrada ? 'border-success/30 text-success' : 'border-destructive/30 text-destructive'
                )}>
                  {isEntrada ? 'Entrada' : 'Saída'}
                </Badge>
                <Badge variant="outline" className="text-[10px]">
                  <Calendar className="h-3 w-3 mr-1" />
                  {format(new Date(lancamento.data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                </Badge>
                {lancamento.contraparte_documento && (
                  <Badge variant="outline" className="text-[10px]">
                    <Building2 className="h-3 w-3 mr-1" />
                    {lancamento.contraparte_documento}
                  </Badge>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Valor</p>
              <p
                className={cn(
                  'text-2xl font-bold tabular-nums',
                  isEntrada ? 'text-success' : 'text-destructive'
                )}
              >
                {isEntrada ? '+' : '-'}
                {formatCurrency(valorLancamento)}
              </p>
            </div>
          </div>
        </DialogHeader>

        {/* Seção: Vincular Cliente */}
        {lancamento.contraparte_documento && (
          <div className="mx-6 mt-3 rounded-lg border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <UserCheck className="h-4 w-4" />
                Cliente Vinculado
              </h4>
              {lancamento.match_type && (
                <Badge
                  variant="outline"
                  className={cn(
                    'text-[10px]',
                    lancamento.match_type === 'auto_direto' && 'border-success/30 text-success bg-success/10',
                    lancamento.match_type === 'auto_terceiro' && 'border-primary/30 text-primary bg-primary/10',
                    lancamento.match_type === 'manual' && 'border-warning/30 text-warning bg-warning/10'
                  )}
                >
                  {lancamento.match_type === 'auto_direto' && '✓ Auto (CPF/CNPJ)'}
                  {lancamento.match_type === 'auto_terceiro' && '✓ Auto (Terceiro)'}
                  {lancamento.match_type === 'manual' && '✓ Manual'}
                </Badge>
              )}
            </div>

            {lancamento.cliente_id && lancamento.cliente ? (
              /* Cliente já vinculado */
              <div className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{lancamento.cliente.nome_razao_social}</p>
                    <p className="text-xs text-muted-foreground font-mono">{lancamento.cliente.cpf_cnpj}</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-destructive hover:text-destructive"
                  onClick={() => {
                    if (lancamento?.id) {
                      desvincularPagadorMutation.mutate(lancamento.id);
                    }
                  }}
                  disabled={desvincularPagadorMutation.isPending}
                >
                  <Unlink className="h-3 w-3 mr-1" />
                  Desvincular
                </Button>
              </div>
            ) : (
              /* Sem vínculo — formulário de busca */
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar cliente por nome ou CPF/CNPJ..."
                    value={searchCliente}
                    onChange={(e) => setSearchCliente(e.target.value)}
                    className="pl-9 h-8 text-sm"
                  />
                </div>

                {/* Lista de clientes */}
                {(searchCliente || clienteSelecionadoId) && (
                  <div className="max-h-[120px] overflow-y-auto border rounded-md">
                    {loadingClientes ? (
                      <p className="text-xs text-muted-foreground text-center py-2">Carregando...</p>
                    ) : clientesFiltrados.length === 0 ? (
                      <p className="text-xs text-muted-foreground text-center py-2">Nenhum cliente encontrado</p>
                    ) : (
                      clientesFiltrados.map((c: any) => (
                        <button
                          key={c.id}
                          type="button"
                          className={cn(
                            'w-full text-left px-3 py-1.5 text-xs hover:bg-muted/50 flex items-center justify-between',
                            clienteSelecionadoId === c.id && 'bg-primary/10 text-primary'
                          )}
                          onClick={() => setClienteSelecionadoId(c.id === clienteSelecionadoId ? '' : c.id)}
                        >
                          <div>
                            <span className="font-medium">{c.nome_razao_social}</span>
                            {c.apelido && <span className="text-muted-foreground ml-1">({c.apelido})</span>}
                          </div>
                          <span className="font-mono text-muted-foreground">{c.cpf_cnpj}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}

                {/* Opções de vínculo */}
                {clienteSelecionadoId && (
                  <div className="flex items-center gap-4 pt-1">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id="lembrar-pagador"
                        checked={lembrarPagador}
                        onCheckedChange={(v) => setLembrarPagador(!!v)}
                      />
                      <Label htmlFor="lembrar-pagador" className="text-xs cursor-pointer">
                        Lembrar este pagador
                      </Label>
                    </div>
                    {lembrarPagador && (
                      <Select value={relacaoPagador} onValueChange={(v) => setRelacaoPagador(v as any)}>
                        <SelectTrigger className="h-7 w-[130px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent side="bottom" sideOffset={4}>
                          <SelectItem value="titular">Titular</SelectItem>
                          <SelectItem value="socio">Sócio</SelectItem>
                          <SelectItem value="familiar">Familiar</SelectItem>
                          <SelectItem value="terceiro">Terceiro</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button
                      size="sm"
                      className="h-7 text-xs ml-auto"
                      onClick={() => {
                        if (lancamento?.id && clienteSelecionadoId) {
                          vincularPagadorMutation.mutate({
                            lancamento_id: lancamento.id,
                            cliente_id: clienteSelecionadoId,
                            lembrar: lembrarPagador,
                            relacao: relacaoPagador,
                          });
                        }
                      }}
                      disabled={vincularPagadorMutation.isPending}
                    >
                      <UserCheck className="h-3 w-3 mr-1" />
                      Vincular
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'vincular' | 'criar')} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="mx-6 mt-4 grid w-auto grid-cols-2 bg-muted/50">
            <TabsTrigger value="vincular" className="gap-2">
              <Link2 className="h-4 w-4" />
              Vincular Existente
            </TabsTrigger>
            <TabsTrigger value="criar" className="gap-2">
              <Plus className="h-4 w-4" />
              Criar Novo
            </TabsTrigger>
          </TabsList>

          {/* Tab: Vincular */}
          <TabsContent value="vincular" className="flex-1 overflow-hidden flex flex-col m-0 px-6 py-4 data-[state=inactive]:hidden">
            {/* ===== FLUXO ENTRADA: Receitas Previstas ===== */}
            {isEntrada ? (
              <>
                {/* Busca */}
                <div className="space-y-2 mb-4">
                  <Label className="text-sm font-medium">Selecione a receita prevista</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por cliente, centro de custo..."
                      value={searchTermReceitas}
                      onChange={(e) => setSearchTermReceitas(e.target.value)}
                      className="pl-9"
                      aria-label="Buscar receita prevista"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {receitasPrevistasFiltradas.length} receita{receitasPrevistasFiltradas.length !== 1 ? 's' : ''} pendente{receitasPrevistasFiltradas.length !== 1 ? 's' : ''}
                  </p>
                </div>

                {/* Lista de receitas previstas */}
                <div className="flex-1 overflow-hidden">
                  <div className="h-[250px] overflow-y-auto pr-2">
                    <div className="space-y-2" role="listbox" aria-label="Receitas previstas pendentes">
                      {loadingReceitas ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Carregando receitas...</p>
                      ) : receitasPrevistasFiltradas.length === 0 ? (
                        <div className="flex-1 flex items-center justify-center py-8">
                          <div className="text-center text-muted-foreground">
                            <Wallet className="h-10 w-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">Nenhuma receita prevista encontrada</p>
                            {searchTermReceitas && (
                              <p className="text-xs mt-1">Tente outro termo de busca</p>
                            )}
                          </div>
                        </div>
                      ) : (
                        receitasPrevistasFiltradas.map((receita) => {
                          const valorMatch = Math.abs(receita.valor_previsto - valorLancamento) < 0.01;
                          const isSelected = registroSelecionado?.id === receita.id;
                          return (
                            <ReceitaPrevistaCard
                              key={receita.id}
                              receita={receita}
                              selected={isSelected}
                              valorMatch={valorMatch}
                              onSelect={() => {
                                setRegistroSelecionado({
                                  id: receita.id,
                                  tipo: 'receber',
                                  descricao: receita.descricaoFormatada,
                                  valor: receita.valor_previsto,
                                  vencimento: receita.vencimento,
                                  status: receita.status as 'pendente' | 'pago' | 'recebido' | 'atrasado' | 'parcial',
                                  cc_id: receita.cc_id,
                                  cc_nome: receita.cc_nome,
                                  categoria_id: null,
                                  categoria_nome: null,
                                  setor_id: null,
                                  setor_nome: null,
                                  cliente_nome: receita.cliente_nome,
                                  contrato_id: receita.contrato_id,
                                  matchScore: valorMatch ? 100 : 0,
                                  matchReason: valorMatch ? 'Valor exato' : '',
                                });
                              }}
                            />
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>

                {/* Opção de valor parcial */}
                {registroSelecionado && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        id="valor-parcial"
                        checked={usarValorParcial}
                        onCheckedChange={(checked) => setUsarValorParcial(checked === true)}
                      />
                      <Label htmlFor="valor-parcial" className="text-sm cursor-pointer">
                        Vincular valor parcial
                      </Label>
                    </div>
                    {usarValorParcial && (
                      <div className="flex items-center gap-2 mt-2">
                        <Label className="text-sm text-muted-foreground w-24">Valor a vincular:</Label>
                        <Input
                          type="number"
                          value={valorParcial}
                          onChange={(e) => setValorParcial(parseFloat(e.target.value) || 0)}
                          className="w-32"
                          min={0}
                          max={valorLancamento}
                          step={0.01}
                        />
                        <span className="text-sm text-muted-foreground">de {formatCurrency(valorLancamento)}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              /* ===== FLUXO SAÍDA: Comportamento original ===== */
              <>
                {/* Search */}
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por descrição, fornecedor, CC..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Sugestões automáticas */}
                {sugestoes.length > 0 && !searchTerm && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="h-4 w-4 text-warning" />
                      <span className="text-sm font-medium">Sugestões (valores similares)</span>
                    </div>
                    <div className="space-y-2">
                      {sugestoes.slice(0, 3).map((sugestao) => (
                        <RegistroCard
                          key={sugestao.id}
                          registro={sugestao}
                          selected={registroSelecionado?.id === sugestao.id}
                          onSelect={() => setRegistroSelecionado(sugestao)}
                          showMatch
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Lista completa */}
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-medium mb-2 text-muted-foreground">
                    {tipoRegistro === 'pagar' ? 'Despesas' : 'Receitas'} Pendentes ({registrosFiltrados.length})
                  </p>
                  <div className="h-[200px] overflow-y-auto pr-4">
                    <div className="space-y-2">
                      {loadingRegistros ? (
                        <p className="text-sm text-muted-foreground text-center py-4">Carregando...</p>
                      ) : registrosFiltrados.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          Nenhum registro pendente encontrado
                        </p>
                      ) : (
                        registrosFiltrados.map((registro) => (
                          <RegistroCard
                            key={registro.id}
                            registro={{
                              ...registro,
                              matchScore: registro.matchScore ?? 0,
                              matchReason: registro.matchReason ?? ''
                            }}
                            selected={registroSelecionado?.id === registro.id}
                            onSelect={() => setRegistroSelecionado({
                              ...registro,
                              matchScore: registro.matchScore ?? 0,
                              matchReason: registro.matchReason ?? ''
                            })}
                          />
                        ))
                      )}
                    </div>
                  </div>
                </div>

                {/* Opção de valor parcial */}
                {registroSelecionado && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg border">
                    <div className="flex items-center gap-2 mb-2">
                      <Checkbox
                        id="valor-parcial"
                        checked={usarValorParcial}
                        onCheckedChange={(checked) => setUsarValorParcial(checked === true)}
                      />
                      <Label htmlFor="valor-parcial" className="text-sm cursor-pointer">
                        Vincular valor parcial
                      </Label>
                    </div>
                    {usarValorParcial && (
                      <div className="flex items-center gap-2 mt-2">
                        <Label className="text-sm text-muted-foreground w-24">Valor a vincular:</Label>
                        <Input
                          type="number"
                          value={valorParcial}
                          onChange={(e) => setValorParcial(parseFloat(e.target.value) || 0)}
                          className="w-32"
                          min={0}
                          max={valorLancamento}
                          step={0.01}
                        />
                        <span className="text-sm text-muted-foreground">de {formatCurrency(valorLancamento)}</span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* Tab: Criar Novo */}
          <TabsContent value="criar" className="flex-1 overflow-auto m-0 px-6 py-4">
            <div className="space-y-5">
              {/* Categoria e Setor */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={categoriaIdSelecionada} onValueChange={setCategoriaIdSelecionada}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={4}>
                      {categoriasComExtras.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {categoriaIdSelecionada !== CATEGORIA_MAO_DE_OBRA_ID && (
                <div className="space-y-2">
                  <Label>Setor *</Label>
                  <Select value={setorSelecionado} onValueChange={setSetorSelecionado}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent side="bottom" sideOffset={4}>
                      {SETORES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                )}
              </div>

              {/* Hint: Categorias descartadas (Resgate / Aplicação) */}
              {isCategoriDescartada && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                  <Info className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 dark:text-amber-300">
                    <span className="font-medium">{categoriaIdSelecionada === CATEGORIA_RESGATE_APLICACAO_ID ? 'Resgate de Aplicação' : 'Aplicação'}:</span> Esta movimentação será descartada e não irá compor relatórios, dashboards ou o DRE operacional.
                  </p>
                </div>
              )}

              {/* Mão de Obra Logic */}
              {categoriaIdSelecionada === CATEGORIA_MAO_DE_OBRA_ID && (
                <div className="rounded-lg border p-4 bg-muted/20 space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">Detalhamento de Mão de Obra</span>
                  </div>

                  {/* Tipo de Custo */}
                  <div className="space-y-2">
                    <Label>Tipo de Custo</Label>
                    <RadioGroup
                        value={tipoCustoVariavel}
                        onValueChange={(v) => setTipoCustoVariavel(v as 'flutuante' | 'geral')}
                        className="flex gap-4"
                    >
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted bg-background">
                            <RadioGroupItem value="flutuante" id="r-flutuante" />
                            <Label htmlFor="r-flutuante" className="cursor-pointer">
                                <span className="block font-medium">Custo Flutuante</span>
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-muted bg-background">
                            <RadioGroupItem value="geral" id="r-geral" />
                            <Label htmlFor="r-geral" className="cursor-pointer">
                                <span className="block font-medium">Custo Geral/Tributo</span>
                            </Label>
                        </div>
                    </RadioGroup>
                  </div>

                  {/* Seleção de Colaboradores */}
                  <div className="space-y-2">
                      <div className="flex justify-between items-center h-4">
                          <Label>Colaboradores Envolvidos</Label>
                          <Button
                              variant="ghost" 
                              size="sm" 
                              className="h-6 text-xs text-primary"
                              onClick={() => {
                                  if (selectedColabIds.length === colaboradores.length) {
                                      setSelectedColabIds([]);
                                  } else {
                                      setSelectedColabIds(colaboradores.map(c => c.id));
                                  }
                              }}
                          >
                              {selectedColabIds.length === colaboradores.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
                          </Button>
                      </div>
                      
                      <MultiSelect
                          options={colaboradores.map(c => ({ label: c.nome_completo, value: c.id }))}
                          selected={selectedColabIds}
                          onChange={setSelectedColabIds}
                          placeholder="Selecione os colaboradores..."
                          searchPlaceholder="Buscar colaborador..."
                          emptyMessage="Nenhum colaborador encontrado"
                          maxDisplayed={3}
                          className="w-full focus-visible:ring-0"
                      />
                      
                      {/* Tabela de colaboradores selecionados */}
                      {selectedColabIds.length > 0 && (
                          <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                  <span className="text-xs text-muted-foreground">{selectedColabIds.length} colaborador(es)</span>
                                  <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      onClick={dividirColabsIgualmente}
                                      className="h-7 text-xs"
                                  >
                                      Dividir Igualmente
                                  </Button>
                              </div>
                              <div className="rounded-md border overflow-hidden">
                                  <table className="w-full text-sm">
                                      <thead className="bg-muted/50">
                                          <tr>
                                              <th className="text-left px-3 py-2 font-medium">Nome</th>
                                              <th className="text-left px-3 py-2 font-medium">Setor</th>
                                              <th className="text-right px-3 py-2 font-medium w-24">%</th>
                                              <th className="text-right px-3 py-2 font-medium w-28">Valor</th>
                                              <th className="text-center px-3 py-2 font-medium w-24">Anexo</th>
                                          </tr>
                                      </thead>
                                      <tbody>
                                          {selectedColabIds.map((colabId) => {
                                              const colab = colaboradores.find(c => c.id === colabId);
                                              const percentual = getColabPercentual(colabId);
                                              const valor = (percentual / 100) * valorLancamento;
                                              return (
                                                  <tr key={colabId} className="border-t">
                                                      <td className="px-3 py-1.5">{colab?.nome_completo || '-'}</td>
                                                      <td className="px-3 py-1.5 text-muted-foreground text-xs">{colab?.setor || '-'}</td>
                                                      <td className="px-1 py-1">
                                                          <Input
                                                              type="number"
                                                              min="0"
                                                              max="100"
                                                              step="0.1"
                                                              inputMode="decimal"
                                                              value={percentual}
                                                              onChange={(e) => handleUpdateColabRateio(colabId, 'percentual', e.target.value)}
                                                              onFocus={(e) => e.target.select()}
                                                              className="h-7 text-right tabular-nums text-xs w-16 ml-auto"
                                                          />
                                                      </td>
                                                      <td className="px-1 py-1">
                                                          <Input
                                                              type="number"
                                                              min="0"
                                                              step="0.01"
                                                              inputMode="decimal"
                                                              value={valor}
                                                              onChange={(e) => handleUpdateColabRateio(colabId, 'valor', e.target.value)}
                                                              onFocus={(e) => e.target.select()}
                                                              className="h-7 text-right tabular-nums text-xs w-24 ml-auto"
                                                          />
                                                      </td>
                                                      <td className="px-1 py-1 text-center">
                                                          {colabAnexos[colabId] ? (
                                                            <div className="flex items-center justify-center gap-1">
                                                              <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                                                              <span className="text-[10px] truncate max-w-[50px]" title={colabAnexos[colabId]!.name}>
                                                                {colabAnexos[colabId]!.name}
                                                              </span>
                                                              <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-5 w-5 p-0 shrink-0"
                                                                aria-label={`Remover anexo de ${colab?.nome_completo || 'colaborador'}`}
                                                                onClick={() => setColabAnexos(prev => ({ ...prev, [colabId]: null }))}
                                                              >
                                                                <Trash2 className="h-3 w-3 text-destructive" />
                                                              </Button>
                                                            </div>
                                                          ) : (
                                                            <label
                                                              className="inline-flex items-center gap-1 cursor-pointer text-muted-foreground hover:text-primary transition-colors"
                                                              aria-label={`Anexar documento para ${colab?.nome_completo || 'colaborador'}`}
                                                            >
                                                              <Upload className="h-3.5 w-3.5" />
                                                              <span className="text-[10px]">Anexar</span>
                                                              <input
                                                                type="file"
                                                                className="hidden"
                                                                accept=".pdf,.jpg,.jpeg,.png"
                                                                onChange={(e) => {
                                                                  const file = e.target.files?.[0];
                                                                  if (file && validarExtensaoAnexo(file.name)) {
                                                                    setColabAnexos(prev => ({ ...prev, [colabId]: file }));
                                                                  }
                                                                  e.target.value = '';
                                                                }}
                                                              />
                                                            </label>
                                                          )}
                                                      </td>
                                                  </tr>
                                              );
                                          })}
                                      </tbody>
                                      <tfoot className={cn(
                                          "border-t font-semibold",
                                          isColabRateioValido ? "bg-muted/30" : "bg-destructive/10"
                                      )}>
                                          <tr>
                                              <td className="px-3 py-2" colSpan={3}>TOTAL</td>
                                              <td className={cn(
                                                  "px-3 py-2 text-right",
                                                  !isColabRateioValido && "text-destructive"
                                              )}>
                                                  {totalColabPercentual.toFixed(1)}%
                                              </td>
                                              <td className={cn(
                                                  "px-3 py-2 text-right",
                                                  isColabRateioValido ? "text-primary" : "text-destructive"
                                              )}>
                                                  {formatCurrency((totalColabPercentual / 100) * valorLancamento)}
                                              </td>
                                          </tr>
                                      </tfoot>
                                  </table>
                              </div>
                              {!isColabRateioValido && (
                                  <p className="text-xs text-destructive flex items-center gap-1">
                                      <AlertTriangle className="h-3 w-3" />
                                      A soma deve ser exatamente 100% para conciliar
                                  </p>
                              )}
                          </div>
                      )}
                  </div>
                </div>
              )}

              {/* Rateio por CC - hide when Mão de Obra selected OR when it's an Entry (Receita) */}
              {categoriaIdSelecionada !== CATEGORIA_MAO_DE_OBRA_ID && !isEntrada && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Rateio por Centro de Custo</Label>
                  {rateios.length > 1 && (
                    <Button type="button" variant="outline" size="sm" onClick={handleDistribuirIgualmente}>
                      Distribuir Igualmente
                    </Button>
                  )}
                </div>

                {rateios.map((rateio) => (
                  <div key={rateio.id} className="flex gap-2 items-end p-3 bg-muted/30 rounded-lg">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs">Centro de Custo</Label>
                      <Select
                        value={rateio.centroCusto}
                        onValueChange={(val) => handleAtualizarRateio(rateio.id, 'centroCusto', val)}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione CC..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-[200px]" side="bottom" sideOffset={4}>
                          {centrosCusto.map((cc) => (
                            <SelectItem key={cc.id} value={cc.id}>
                              {cc.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="w-24 space-y-1">
                      <Label className="text-xs">%</Label>
                      <Input
                        type="number"
                        min="0"
                        max="100"
                        step="0.01"
                        className="h-9"
                        value={rateio.percentual}
                        onChange={(e) => handleAtualizarRateio(rateio.id, 'percentual', e.target.value)}
                      />
                    </div>
                    <div className="w-28 space-y-1">
                      <Label className="text-xs">Valor</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-9"
                        value={rateio.valor}
                        onChange={(e) => handleAtualizarRateio(rateio.id, 'valor', e.target.value)}
                      />
                    </div>
                    {rateios.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoverRateio(rateio.id)}
                        className="h-9 w-9 p-0"
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                ))}

                <Button type="button" variant="outline" size="sm" onClick={handleAdicionarRateio} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Centro de Custo
                </Button>

                {/* Totalizador */}
                <div className="bg-muted p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Rateado:</span>
                    <div className="flex gap-4">
                      <Badge variant={isRateioValido ? 'default' : 'destructive'}>
                        {totalPercentual.toFixed(2)}%
                      </Badge>
                      <span className={cn('font-medium', isRateioValido ? 'text-success' : 'text-destructive')}>
                        {formatCurrency(totalValor)}
                      </span>
                    </div>
                  </div>
                  {!isRateioValido && (
                    <p className="text-xs text-destructive mt-2">
                      A soma deve ser exatamente 100% ({formatCurrency(valorLancamento)})
                    </p>
                  )}
                </div>
              </div>
              )}

              {/* Seção: Documentos - oculta quando Mão de Obra (upload é por linha) */}
              {categoriaIdSelecionada !== CATEGORIA_MAO_DE_OBRA_ID && (
              <div className="space-y-3 pt-2 border-t">
                <h4 className="text-sm font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Documentos
                </h4>
                
                <div className="grid grid-cols-2 gap-4">
                  {/* Nota Fiscal */}
                  <div className="space-y-1">
                    <Label className="text-xs">Nota Fiscal</Label>
                    <div
                      className={cn(
                        'border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors',
                        notaFiscal ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                      )}
                      onClick={() => notaFiscalInputRef.current?.click()}
                    >
                      <input
                        ref={notaFiscalInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setNotaFiscal(file);
                        }}
                      />
                      {notaFiscal ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium truncate max-w-[80px]">{notaFiscal.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNotaFiscal(null);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Anexar NF
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Comprovante */}
                  <div className="space-y-1">
                    <Label className="text-xs">Comprovante</Label>
                    <div
                      className={cn(
                        'border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors',
                        comprovante ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
                      )}
                      onClick={() => comprovanteInputRef.current?.click()}
                    >
                      <input
                        ref={comprovanteInputRef}
                        type="file"
                        className="hidden"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) setComprovante(file);
                        }}
                      />
                      {comprovante ? (
                        <div className="flex items-center justify-center gap-2">
                          <FileText className="h-4 w-4 text-primary" />
                          <span className="text-xs font-medium truncate max-w-[80px]">{comprovante.name}</span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-5 w-5 p-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              setComprovante(null);
                            }}
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-1">
                          <Upload className="h-5 w-5 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            Anexar
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/20">
          <Button variant="outline" onClick={onClose}>
            {isReadOnly ? 'Fechar' : 'Cancelar'}
          </Button>
          {!isReadOnly && (
            <Button
              onClick={handleConciliarClick}
              disabled={
                activeTab === 'vincular'
                  ? !registroSelecionado || vincularMutation.isPending || isUploading
                  : !categoriaIdSelecionada || 
                    (categoriaIdSelecionada !== CATEGORIA_MAO_DE_OBRA_ID && !setorSelecionado) ||
                    (categoriaIdSelecionada !== CATEGORIA_MAO_DE_OBRA_ID && !isRateioValido) ||
                    (categoriaIdSelecionada === CATEGORIA_MAO_DE_OBRA_ID && selectedColabIds.length > 0 && !isColabRateioValido) ||
                    classificarMutation.isPending || 
                    isUploading
              }
              className="gap-2"
            >
              <Check className="h-4 w-4" />
              {vincularMutation.isPending || classificarMutation.isPending || isUploading ? 'Conciliando...' : 'Conciliar'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>

      {/* Modal de Confirmação */}
      <AlertDialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Confirmar Conciliação
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não poderá ser desfeita. A transação será marcada como conciliada
              {activeTab === 'vincular' && registroSelecionado && (
                <> e vinculada ao registro selecionado</>  
              )}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmConciliar}>
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}

// ============================================================
// SUB-COMPONENTS
// ============================================================

interface RegistroCardProps {
  registro: SugestaoVinculo;
  selected: boolean;
  onSelect: () => void;
  showMatch?: boolean;
}

function RegistroCard({ registro, selected, onSelect, showMatch }: RegistroCardProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), 'dd/MM', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        'hover:bg-muted/50 hover:border-primary/30',
        selected ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-background border-border'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{registro.descricao}</p>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            {registro.cc_nome && (
              <span className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                {registro.cc_nome}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Venc: {formatDate(registro.vencimento)}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-sm tabular-nums">{formatCurrency(registro.valor)}</p>
          {showMatch && registro.matchScore !== undefined && (
            <Badge
              variant="outline"
              className={cn(
                'text-[10px] mt-1',
                registro.matchScore >= 90
                  ? 'border-success/50 text-success bg-success/10'
                  : registro.matchScore >= 70
                    ? 'border-warning/50 text-warning bg-warning/10'
                    : 'border-muted-foreground/30'
              )}
            >
              {registro.matchScore}% match
            </Badge>
          )}
        </div>
        {selected && (
          <div className="shrink-0">
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
      {showMatch && registro.matchReason && (
        <p className="text-[10px] text-muted-foreground mt-1">{registro.matchReason}</p>
      )}
    </button>
  );
}

// ---- ReceitaPrevistaCard ----

interface ReceitaPrevistaCardProps {
  receita: ReceitaPrevistaConciliacao;
  selected: boolean;
  valorMatch: boolean;
  onSelect: () => void;
}

function ReceitaPrevistaCard({ receita, selected, valorMatch, onSelect }: ReceitaPrevistaCardProps) {
  const fmtCurrency = (v: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

  const fmtDate = (d: string) => {
    try {
      return format(new Date(d), 'dd/MM/yyyy', { locale: ptBR });
    } catch {
      return d;
    }
  };

  return (
    <button
      type="button"
      role="option"
      aria-selected={selected}
      onClick={onSelect}
      className={cn(
        'w-full text-left p-3 rounded-lg border transition-all',
        'hover:bg-muted/50 hover:border-primary/30',
        selected ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-background border-border'
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{receita.descricaoFormatada}</p>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
            {receita.cc_nome && (
              <span className="flex items-center gap-1">
                <Wallet className="h-3 w-3" />
                {receita.cc_nome}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Venc: {fmtDate(receita.vencimento)}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold text-sm tabular-nums">{fmtCurrency(receita.valor_previsto)}</p>
          {receita.valor_recebido > 0 && (
            <p className="text-[10px] text-muted-foreground">Recebido: {fmtCurrency(receita.valor_recebido)}</p>
          )}
          <div className="flex gap-1 mt-1 justify-end">
            {valorMatch && (
              <Badge variant="outline" className="text-[10px] border-success/50 text-success bg-success/10">
                Valor exato
              </Badge>
            )}
            {receita.dias_atraso > 0 && (
              <Badge variant="outline" className="text-[10px] border-destructive/50 text-destructive bg-destructive/10">
                {receita.dias_atraso}d atraso
              </Badge>
            )}
          </div>
        </div>
        {selected && (
          <div className="shrink-0">
            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
              <Check className="h-3 w-3 text-primary-foreground" />
            </div>
          </div>
        )}
      </div>
    </button>
  );
}
