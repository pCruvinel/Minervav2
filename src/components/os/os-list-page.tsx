import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { FileDown, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { User } from '../../lib/types';
import { OSListHeader } from './os-list-header';
import { OSFiltersCard } from './os-filters-card';
import { OSTable } from './os-table';
import { useOrdensServico } from '../../lib/hooks/use-ordens-servico';
import { ordensServicoAPI } from '../../lib/api-client';
import { toast } from '../../lib/utils/safe-toast';

// Mock data para fallback (caso API falhe)
const mockOrdensServico = [
  {
    id: '1',
    codigo: 'OS-2025-001',
    titulo: 'Perícia de Fachada - Edifício Central',
    status: 'em_andamento',
    cliente: { id: '1', nome: 'Construtora ABC Ltda' },
    tipoOS: { id: '01', nome: 'OS 01: Perícia de Fachada', setor: 'obras' },
    responsavel: { id: '1', nome: 'João Silva', avatar: 'JS' },
    dataPrazo: '2025-01-30',
    criadoEm: '2025-01-10'
  },
  {
    id: '2',
    codigo: 'OS-2025-002',
    titulo: 'Revitalização de Fachada - Condomínio Solar',
    status: 'aguardando_aprovacao',
    cliente: { id: '2', nome: 'Incorporadora XYZ' },
    tipoOS: { id: '02', nome: 'OS 02: Revitalização de Fachada', setor: 'obras' },
    responsavel: { id: '3', nome: 'Pedro Oliveira', avatar: 'PO' },
    dataPrazo: '2025-02-15',
    criadoEm: '2025-01-12'
  },
  {
    id: '3',
    codigo: 'OS-2025-003',
    titulo: 'Assessoria Técnica - Shopping Norte',
    status: 'atrasada',
    cliente: { id: '5', nome: 'Grupo Omega' },
    tipoOS: { id: '05', nome: 'OS 05: Assessoria técnica mensal', setor: 'assessoria' },
    responsavel: { id: '2', nome: 'Maria Santos', avatar: 'MS' },
    dataPrazo: '2025-01-15',
    criadoEm: '2025-01-05'
  },
  {
    id: '4',
    codigo: 'OS-2025-004',
    titulo: 'Laudo Pontual - Edifício Atlântico',
    status: 'concluida',
    cliente: { id: '3', nome: 'Empreendimentos Delta' },
    tipoOS: { id: '06', nome: 'OS 06: Laudo pontual', setor: 'assessoria' },
    responsavel: { id: '1', nome: 'João Silva', avatar: 'JS' },
    dataPrazo: '2025-01-20',
    criadoEm: '2025-01-08'
  },
  {
    id: '5',
    codigo: 'OS-2025-005',
    titulo: 'Reforço Estrutural - Ponte Viaduto',
    status: 'em_andamento',
    cliente: { id: '4', nome: 'Construtora Sigma' },
    tipoOS: { id: '03', nome: 'OS 03: Reforço Estrutural', setor: 'obras' },
    responsavel: { id: '3', nome: 'Pedro Oliveira', avatar: 'PO' },
    dataPrazo: '2025-03-01',
    criadoEm: '2025-01-14'
  },
  {
    id: '6',
    codigo: 'OS-2025-006',
    titulo: 'Requisição de Compras - Materiais Diversos',
    status: 'em_andamento',
    cliente: { id: '6', nome: 'Incorporadora Beta' },
    tipoOS: { id: '09', nome: 'OS 09: Requisição de Compras', setor: 'obras' },
    responsavel: { id: '4', nome: 'Ana Costa', avatar: 'AC' },
    dataPrazo: '2025-01-25',
    criadoEm: '2025-01-16'
  },
  {
    id: '7',
    codigo: 'OS-2025-007',
    titulo: 'Start de Contrato - Residencial Vila Nova',
    status: 'aguardando_aprovacao',
    cliente: { id: '7', nome: 'Construtora Alvorada' },
    tipoOS: { id: '13', nome: 'OS 13: Start de Contrato de Obra', setor: 'obras' },
    responsavel: { id: '1', nome: 'João Silva', avatar: 'JS' },
    dataPrazo: '2025-02-10',
    criadoEm: '2025-01-18'
  },
  {
    id: '8',
    codigo: 'OS-2024-045',
    titulo: 'Vistoria Técnica - Edifício Empresarial',
    status: 'concluida',
    cliente: { id: '8', nome: 'Empreendimentos Sul' },
    tipoOS: { id: '08', nome: 'OS 08: Vistoria/Inspeção', setor: 'assessoria' },
    responsavel: { id: '2', nome: 'Maria Santos', avatar: 'MS' },
    dataPrazo: '2024-12-30',
    criadoEm: '2024-12-15'
  }
];

interface OSListPageProps {
  currentUser: User;
  onNavigate: (route: string) => void;
}

export function OSListPage({ currentUser, onNavigate }: OSListPageProps) {
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
    refetch,
    raw: ordensServicoAPI_data
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
    if (currentUser.role === 'colaborador') {
      // Colaborador vê apenas suas próprias OS
      filtered = filtered.filter(os => os.responsavel.id === currentUser.id);
      console.log(`🔍 [RLS-COLABORADOR] Usuário: ${currentUser.id}, OS filtradas: ${filtered.length}`);
    } else if (currentUser.role === 'gestor') {
      // Gestor vê apenas OS do seu setor
      filtered = filtered.filter(os => os.tipoOS.setor === currentUser.setor);
      console.log(`🔍 [RLS-GESTOR] Setor: ${currentUser.setor}, OS filtradas: ${filtered.length}`);
    }
    // Diretoria e Gestor ADM veem todas
    console.log(`🔍 [RLS] Role: ${currentUser.role}, OS após RLS: ${filtered.length}`);

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

    console.log(`✅ [FINAL] Total de OS exibidas: ${filtered.length}`);
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
  const canViewSetorColumn = currentUser.role === 'diretoria' || currentUser.role === 'gestor_adm';

  return (
    <div className="min-h-screen bg-neutral-100 p-6">
      <div className="max-w-[1600px] mx-auto space-y-6">
        {/* Header da Página */}
        <OSListHeader onCreateClick={() => onNavigate('os-criar')} />



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
              canViewSetorColumn={canViewSetorColumn}
              onNavigate={onNavigate}
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