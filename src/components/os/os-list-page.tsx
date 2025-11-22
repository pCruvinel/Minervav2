import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { FileDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { User } from '../../lib/types';
import { OSListHeader } from './os-list-header';
import { OSFiltersCard } from './os-filters-card';
import { EtapaFilter } from './etapa-filter';
import { OSTable } from './os-table';
import { useOrdensServico } from '../../lib/hooks/use-ordens-servico';
import { ordensServicoAPI } from '../../lib/api-client';
import { toast } from '../../lib/utils/safe-toast';

// Mock data para fallback (caso API falhe)
// Mock data para fallback (caso API falhe)
const mockOrdensServico: any[] = [
  {
    id: '1',
    codigo_os: 'OS-2025-001',
    descricao: 'Perícia de Fachada - Edifício Central',
    status_geral: 'em_andamento',
    cliente_nome: 'Construtora ABC Ltda',
    tipo_os_nome: 'OS 01: Perícia de Fachada',
    responsavel_nome: 'João Silva',
    responsavel_id: '1',
    data_prazo: '2025-01-30',
    created_at: '2025-01-10',
    data_entrada: '2025-01-10'
  },
  {
    id: '2',
    codigo_os: 'OS-2025-002',
    descricao: 'Revitalização de Fachada - Condomínio Solar',
    status_geral: 'aguardando_aprovacao',
    cliente_nome: 'Incorporadora XYZ',
    tipo_os_nome: 'OS 02: Revitalização de Fachada',
    responsavel_nome: 'Pedro Oliveira',
    responsavel_id: '3',
    data_prazo: '2025-02-15',
    created_at: '2025-01-12',
    data_entrada: '2025-01-12'
  },
  {
    id: '3',
    codigo_os: 'OS-2025-003',
    descricao: 'Assessoria Técnica - Shopping Norte',
    status_geral: 'atrasada',
    cliente_nome: 'Grupo Omega',
    tipo_os_nome: 'OS 05: Assessoria técnica mensal',
    responsavel_nome: 'Maria Santos',
    responsavel_id: '2',
    data_prazo: '2025-01-15',
    created_at: '2025-01-05',
    data_entrada: '2025-01-05'
  }
];

interface OSListPageProps {
  currentUser: User;
}

export function OSListPage({ currentUser }: OSListPageProps) {
  // Estados de filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [tipoOSFilter, setTipoOSFilter] = useState('todos');
  const [setorFilter, setSetorFilter] = useState('todos');
  const [responsavelFilter, setResponsavelFilter] = useState('todos');
  const [etapaFilter, setEtapaFilter] = useState<number[]>([]); // Novo: filtro de etapas
  const [isCancelling, setIsCancelling] = useState(false);

  // Buscar OS da API usando hook customizado
  const {
    ordensServico: ordensServicoFromAPI,
    loading,
    error,
    refetch
  } = useOrdensServico();

  // 🔍 DEBUG: Verificar dados recebidos da API
  console.log('🔍 [OS-LIST-DEBUG] Dados da API:', {
    total_api: ordensServicoFromAPI?.length || 0,
    loading,
    error: error?.message,
    primeiras_3_OS: ordensServicoFromAPI?.slice(0, 3)
  });

  // Filtrar OS baseado em RLS (Role-Level Security)
  const ordensServico = useMemo(() => {
    let filtered = error ? [...mockOrdensServico] : [...(ordensServicoFromAPI || [])];

    console.log('🔍 [FILTROS-DEBUG] Antes dos filtros RLS:', filtered.length);

    // Aplicar RLS baseado no papel do usuário
    if (currentUser.role_nivel === 'colaborador') {
      // Colaborador vê apenas suas próprias OS
      filtered = filtered.filter(os => os.responsavel.id === currentUser.id);
      console.log(`🔍 [RLS-COLABORADOR] Usuário: ${currentUser.id}, OS filtradas: ${filtered.length}`);
    } else if (currentUser.role_nivel?.startsWith('gestor')) {
      // Gestor vê apenas OS do seu setor
      filtered = filtered.filter(os => os.tipo_os_nome.toLowerCase().includes(currentUser.setor || ''));
      console.log(`🔍 [RLS-GESTOR] Setor: ${currentUser.setor}, OS filtradas: ${filtered.length}`);
    }
    // Diretoria e Gestor ADM veem todas
    console.log(`🔍 [RLS] Role: ${currentUser.role_nivel}, OS após RLS: ${filtered.length}`);

    // Aplicar filtros de busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(os =>
        os.codigo.toLowerCase().includes(search) ||
        os.cliente.nome.toLowerCase().includes(search) ||
        os.titulo.toLowerCase().includes(search)
      );
      console.log(`🔍 [BUSCA] Termo: "${searchTerm}", OS filtradas: ${filtered.length}`);
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(os => os.status === statusFilter);
      console.log(`🔍 [STATUS] Filtro: ${statusFilter}, OS filtradas: ${filtered.length}`);
    }

    if (tipoOSFilter !== 'todos') {
      filtered = filtered.filter(os => os.tipoOS.id === tipoOSFilter);
      console.log(`🔍 [TIPO] Filtro: ${tipoOSFilter}, OS filtradas: ${filtered.length}`);
    }

    if (setorFilter !== 'todos') {
      filtered = filtered.filter(os => os.tipoOS.setor === setorFilter);
      console.log(`🔍 [SETOR] Filtro: ${setorFilter}, OS filtradas: ${filtered.length}`);
    }

    if (responsavelFilter !== 'todos') {
      filtered = filtered.filter(os => os.responsavel.id === responsavelFilter);
      console.log(`🔍 [RESPONSAVEL] Filtro: ${responsavelFilter}, OS filtradas: ${filtered.length}`);
    }

    // Novo: Filtro por etapa atual
    if (etapaFilter.length > 0) {
      filtered = filtered.filter(os => {
        // Se a OS tem etapaAtual e está em uma das etapas selecionadas
        return os.etapaAtual && etapaFilter.includes(os.etapaAtual.numero);
      });
      console.log(`🔍 [ETAPA] Filtro: ${etapaFilter.join(', ')}, OS filtradas: ${filtered.length}`);
    }

    console.log(`✅ [FINAL] Total de OS exibidas: ${filtered.length}`);
    return filtered;
  }, [searchTerm, statusFilter, tipoOSFilter, setorFilter, responsavelFilter, etapaFilter, currentUser, ordensServicoFromAPI, error]);

  // Função para exportar dados
  const handleExport = () => {
    // Implementação futura: exportar para Excel/CSV
    alert('Funcionalidade de exportação será implementada em breve!');
  };

  // Função para cancelar OS
  const handleCancelOS = async (osId: string) => {
    setIsCancelling(true);
    try {
      await ordensServicoAPI.update(osId, { status_geral: 'CANCELADA' });
      toast.success('OS cancelada com sucesso!');
      refetch(); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao cancelar OS:', error);
      toast.error('Erro ao cancelar OS. Tente novamente.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Verificar se o usuário pode ver a coluna Setor
  const canViewSetorColumn = currentUser.role_nivel === 'diretoria' || currentUser.role_nivel === 'gestor_administrativo';

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header da Página */}
        {/* Header da Página */}
        <OSListHeader />



        {/* Loading State */}
        {loading && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Carregando ordens de serviço do banco de dados...
              <br />
              <span className="text-xs text-muted-foreground">
                Se demorar muito, verifique o console do navegador para mais detalhes.
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erro ao conectar com banco de dados:</strong> {error.message}
              <br />
              <span className="text-xs">Exibindo dados de exemplo (mock). </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-2 h-6"
                onClick={refetch}
              >
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Card de Filtros */}
        <OSFiltersCard
          currentUser={currentUser}
          searchTerm={searchTerm}
          statusFilter={statusFilter}
          tipoOSFilter={tipoOSFilter}
          setorFilter={setorFilter}
          responsavelFilter={responsavelFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          onTipoOSChange={setTipoOSFilter}
          onSetorChange={setSetorFilter}
          onResponsavelChange={setResponsavelFilter}
        />

        {/* Filtro de Etapas - Dinâmico por tipo de OS */}
        <EtapaFilter
          totalSteps={15} // OS 01-04 tem 15 etapas (futuro: detectar automaticamente por tipo)
          selectedEtapas={etapaFilter}
          onFilterChange={setEtapaFilter}
          useLocalStorage={true}
          storageKey="os_list_etapa_filter"
        />

        {/* Card da Tabela */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle>
              {ordensServico.length} {ordensServico.length === 1 ? 'Ordem de Serviço' : 'Ordens de Serviço'}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" onClick={refetch}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
              <Button variant="outline" onClick={handleExport}>
                <FileDown className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <OSTable
              ordensServico={ordensServico}
              canViewSetorColumn={canViewSetorColumn}
              onCancelOS={handleCancelOS}
              isCancelling={isCancelling}
            />

            {/* Informação de paginação */}
            {ordensServico.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-muted-foreground">
                  Mostrando {ordensServico.length} de {ordensServico.length} resultados
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}