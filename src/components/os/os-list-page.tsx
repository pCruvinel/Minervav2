import { logger } from '@/lib/utils/logger';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { FileDown, Loader2, AlertCircle, RefreshCw, ClipboardList, AlertTriangle, Clock, CheckCircle2 } from 'lucide-react';
import { User } from '../../lib/types';
import { OSListHeader } from './os-list-header';
import { OSFiltersCard } from './os-filters-card';

import { OSTable } from './os-table';
import { useOrdensServico } from '../../lib/hooks/use-ordens-servico';
import { ordensServicoAPI } from '../../lib/api-client';
import { toast } from '../../lib/utils/safe-toast';

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

  const [isCancelling, setIsCancelling] = useState(false);

  // Buscar OS da API usando hook customizado
  const {
    ordensServico: ordensServicoFromAPI,
    loading,
    error,
    refetch
  } = useOrdensServico();

  // 🔍 DEBUG: Verificar dados recebidos da API
  logger.log('🔍 [OS-LIST-DEBUG] Dados da API:', {
    total_api: ordensServicoFromAPI?.length || 0,
    loading,
    error: error?.message,
    primeiras_3_OS: ordensServicoFromAPI?.slice(0, 3)
  });

  // Calcular estatísticas para os cards
  const stats = useMemo(() => {
    const data = ordensServicoFromAPI || [];
    // Filtrar apenas OS onde o usuário é responsável para os cards de "Minha Atuação"
    const myOS = data.filter(os => os.responsavel_id === currentUser.id);

    return {
      total: myOS.length,
      actionNeeded: myOS.filter(os => ['aguardando_aprovacao', 'atrasada'].includes(os.status_geral)).length,
      inProgress: myOS.filter(os => os.status_geral === 'em_andamento').length,
      completed: myOS.filter(os => os.status_geral === 'concluida').length
    };
  }, [ordensServicoFromAPI, currentUser.id]);

  // Filtrar OS baseado em filtros de UI
  // NOTA: A segurança real (RLS) é aplicada no banco de dados via Supabase Row Level Security
  // Este código é apenas para filtros de UI e fallback de exibição
  const ordensServico = useMemo(() => {
    let filtered = error ? [...mockOrdensServico] : [...(ordensServicoFromAPI || [])];

    logger.log('🔍 [FILTROS-DEBUG] Total de OS recebidas:', filtered.length);

    // IMPORTANTE: O RLS do banco já filtra os dados na origem
    // A lógica abaixo é apenas fallback/filtro adicional de UI
    // Regras RLS reais estão em: docs/technical/Manual de Permissões e Controle de Acesso.md

    // REMOVIDO: Filtros de role removidos conforme solicitação para exibir todas as OS
    logger.log(`🔍 [FILTRO-UI] Role: ${currentUser.role_nivel}, Exibindo todas as OS recebidas: ${filtered.length}`);

    // Aplicar filtros de busca
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(os =>
        os.codigo.toLowerCase().includes(search) ||
        os.cliente.nome.toLowerCase().includes(search) ||
        os.titulo.toLowerCase().includes(search)
      );
      logger.log(`🔍 [BUSCA] Termo: "${searchTerm}", OS filtradas: ${filtered.length}`);
    }

    if (statusFilter !== 'todos') {
      filtered = filtered.filter(os => os.status === statusFilter);
      logger.log(`🔍 [STATUS] Filtro: ${statusFilter}, OS filtradas: ${filtered.length}`);
    }

    if (tipoOSFilter !== 'todos') {
      filtered = filtered.filter(os => os.tipoOS.id === tipoOSFilter);
      logger.log(`🔍 [TIPO] Filtro: ${tipoOSFilter}, OS filtradas: ${filtered.length}`);
    }

    if (setorFilter !== 'todos') {
      filtered = filtered.filter(os => os.tipoOS.setor === setorFilter);
      logger.log(`🔍 [SETOR] Filtro: ${setorFilter}, OS filtradas: ${filtered.length}`);
    }

    if (responsavelFilter !== 'todos') {
      filtered = filtered.filter(os => os.responsavel.id === responsavelFilter);
      logger.log(`🔍 [RESPONSAVEL] Filtro: ${responsavelFilter}, OS filtradas: ${filtered.length}`);
    }

    logger.log(`✅ [FINAL] Total de OS exibidas: ${filtered.length}`);
    return filtered;
  }, [searchTerm, statusFilter, tipoOSFilter, setorFilter, responsavelFilter, currentUser, ordensServicoFromAPI, error]);

  // Função para exportar dados
  const handleExport = () => {
    // Implementação futura: exportar para Excel/CSV
    alert('Funcionalidade de exportação será implementada em breve!');
  };

  // Função para cancelar OS
  const handleCancelOS = async (osId: string) => {
    setIsCancelling(true);
    try {
      await ordensServicoAPI.update(osId, { status_geral: 'cancelado' });
      toast.success('OS cancelada com sucesso!');
      refetch(); // Recarregar a lista
    } catch (error) {
      logger.error('Erro ao cancelar OS:', error);
      toast.error('Erro ao cancelar OS. Tente novamente.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Verificar se o usuário pode ver a coluna Setor
  const canViewSetorColumn = currentUser.role_nivel === 'diretoria' || currentUser.role_nivel === 'gestor_administrativo';

  return (
    <div className="content-wrapper">
      <div className="content-wrapper-wide space-y-6">
        {/* Header da Página */}
        <OSListHeader />

      {/* Cards de Resumo */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Alocadas</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Sob sua responsabilidade</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ação Necessária</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{stats.actionNeeded}</div>
            <p className="text-xs text-muted-foreground">Aguardando ou Atrasadas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Em execução ativa</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finalizadas</p>
          </CardContent>
        </Card>
      </div>

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
            currentUser={currentUser}
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