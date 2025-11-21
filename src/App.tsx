import React, { useState } from 'react';
import './styles/globals.css';
import { Toaster } from './components/ui/sonner';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Alert, AlertDescription } from './components/ui/alert';
import { Info } from 'lucide-react';
import { LoginPage } from './components/auth/login-page';
import { Sidebar } from './components/layout/sidebar';
import { Header } from './components/layout/header';
import { FontLoader } from './components/layout/font-loader';
import { OSDetailsPage } from './components/os/os-details-page';
import { OSWorkflowPage } from './components/os/os-workflow-page';
import { OSDetailsWorkflowPage } from './components/os/os-details-workflow-page';
import { OSDetailsAssessoriaPage } from './components/os/os-details-assessoria-page';
import { OSListPage } from './components/os/os-list-page';
import { OSCreationHub } from './components/os/os-creation-hub';
import { OSWizardPlaceholder } from './components/os/os-wizard-placeholder';
import { OS07WorkflowPage } from './components/os/os07-workflow-page';
import { OS08WorkflowPage } from './components/os/os08-workflow-page';
import { OS09WorkflowPage } from './components/os/os09-workflow-page';
import { OS13WorkflowPage } from './components/os/os13-workflow-page';
import { CalendarioPage } from './components/calendario/calendario-page';
import { TestSchemaReload } from './components/test-schema-reload';
import { SeedUsuariosPage } from './components/admin/seed-usuarios-page';
import { DelegacoesPage } from './components/delegacao/delegacoes-page';
import { DashboardPage } from './components/dashboard/dashboard-page';
import { FinanceiroDashboardPage } from './components/financeiro/financeiro-dashboard-page';
import { ConciliacaoBancariaPage } from './components/financeiro/conciliacao-bancaria-page';
import { PrestacaoContasPage } from './components/financeiro/prestacao-contas-page';
import { ContasReceberPage } from './components/financeiro/contas-receber-page';
import { ContasPagarPage } from './components/financeiro/contas-pagar-page';
import { ColaboradoresListaPage } from './components/colaboradores/colaboradores-lista-page';
import { ControlePresencaTabelaPage } from './components/colaboradores/controle-presenca-tabela-page';
import { ClientesListaPage } from './components/clientes/clientes-lista-page';
import { ClienteDetalhesPage } from './components/clientes/cliente-detalhes-page';
import { PortalClienteObras } from './components/portal/portal-cliente-obras';
import { PortalClienteAssessoria } from './components/portal/portal-cliente-assessoria';
import { UsuariosPermissoesPage } from './components/configuracoes/usuarios-permissoes-page';
import MenuPreviewPage from './components/admin/menu-preview-page';
// Gestores - Assessoria
import { DashboardGestorAssessoria } from './components/dashboard/dashboard-gestor-assessoria';
import { FilaAprovacaoLaudos } from './components/assessoria/fila-aprovacao-laudos';
import { AnaliseReformas } from './components/assessoria/analise-reformas';
// Gestores - Obras
import { DashboardGestorObras } from './components/dashboard/dashboard-gestor-obras';
import { ListaObrasAtivas } from './components/obras/lista-obras-ativas';
import { AprovacaoMedicoes } from './components/obras/aprovacao-medicoes';
// Comercial
import DashboardComercial from './components/comercial/dashboard-comercial';
import ListaLeads from './components/comercial/lista-leads';
import DetalhesLead from './components/comercial/detalhes-lead';
import PropostasComerciais from './components/comercial/propostas-comerciais';
import { AuthProvider, useAuth } from './lib/contexts/auth-context';
import { 
  mockOrdensServico, 
  mockComentarios, 
  mockDocumentos, 
  mockHistorico 
} from './lib/mock-data';
import { OrdemServico, Comentario, OSStatus, Delegacao } from './lib/types';

type Page = 'login' | 'dashboard' | 'os-list' | 'os-criar' | 'historico-os' | 'wizard-obras-lead' | 'wizard-start-contrato-obra' | 'wizard-assessoria-lead' | 'wizard-start-contrato-assessoria' | 'wizard-solicitacao-reforma' | 'wizard-vistoria' | 'wizard-requisicao-compras' | 'wizard-requisicao-mao-obra' | 'os-details' | 'os-workflow' | 'os-details-workflow' | 'clientes' | 'clientes-lista' | 'cliente-detalhes' | 'portal-cliente-obras' | 'portal-cliente-assessoria' | 'financeiro' | 'financeiro-dashboard' | 'conciliacao-bancaria' | 'prestacao-contas' | 'contas-pagar' | 'contas-receber' | 'colaboradores-lista' | 'controle-presenca' | 'calendario' | 'configuracoes' | 'usuarios-permissoes' | 'debug-schema' | 'seed-usuarios' | 'menu-preview' | 'delegacoes' | 'comercial-dashboard' | 'comercial-leads' | 'comercial-lead-detalhes' | 'comercial-propostas';

// Componente interno que usa o contexto de autenticação
function AppContent() {
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedOS, setSelectedOS] = useState<OrdemServico | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  
  // Mock data state
  const [ordensServico, setOrdensServico] = useState(mockOrdensServico);
  const [comentarios, setComentarios] = useState(mockComentarios);

  // Mock de delegações - em produção virá do Supabase
  const [delegacoes, setDelegacoes] = useState<Delegacao[]>([
    {
      id: 'del-1',
      os_id: 'os-1',
      delegante_id: '22222222-2222-2222-2222-222222222222',
      delegante_nome: 'Maria Silva Gestora Comercial',
      delegado_id: '55555555-5555-5555-5555-555555555555',
      delegado_nome: 'Ana Claudia Vendedora',
      data_prazo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status_delegacao: 'pendente',
      descricao_tarefa: 'Realizar levantamento de necessidades do cliente para elaboração de proposta comercial.',
      observacoes: 'Cliente já demonstrou interesse em fechar contrato.',
      created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      data_criacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      data_atualizacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: 'del-2',
      os_id: 'os-2',
      delegante_id: '33333333-3333-3333-3333-333333333333',
      delegante_nome: 'João Pedro Gestor Assessoria',
      delegado_id: '77777777-7777-7777-7777-777777777777',
      delegado_nome: 'Bruno Martins Técnico',
      data_prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status_delegacao: 'pendente',
      descricao_tarefa: 'Elaborar parecer técnico sobre viabilidade de reforma estrutural.',
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      data_criacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      data_atualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]);

  const handleLogout = () => {
    logout();
    setCurrentPage('login');
    setSelectedOS(null);
  };

  const handleLoginSuccess = () => {
    setCurrentPage('dashboard');
  };

  const handleNavigate = (page: string) => {
    // Mapear rotas de wizard
    const wizardRouteMap: Record<string, Page> = {
      '/os/criar/obras-lead': 'wizard-obras-lead',
      '/os/criar/start-contrato-obra': 'wizard-start-contrato-obra',
      '/os/criar/assessoria-lead': 'wizard-assessoria-lead',
      '/os/criar/start-contrato-assessoria': 'wizard-start-contrato-assessoria',
      '/os/criar/solicitacao-reforma': 'wizard-solicitacao-reforma',
      '/os/criar/vistoria': 'wizard-vistoria',
      '/os/criar/requisicao-compras': 'wizard-requisicao-compras',
      '/os/criar/requisicao-mao-obra': 'wizard-requisicao-mao-obra',
    };

    const mappedPage = wizardRouteMap[page] || (page as Page);
    setCurrentPage(mappedPage);
    setSelectedOS(null);
  };

  const handleOSClick = (os: OrdemServico) => {
    setSelectedOS(os);
    setCurrentPage('os-details');
  };

  const handleBackFromOS = () => {
    setSelectedOS(null);
    setCurrentPage('os-list');
  };

  const handleAddComentario = (texto: string) => {
    if (!selectedOS || !currentUser) return;

    const newComentario: Comentario = {
      id: `${comentarios.length + 1}`,
      osId: selectedOS.id,
      userId: currentUser.id,
      userName: currentUser.nome_completo,
      userAvatar: currentUser.avatar,
      texto,
      createdAt: new Date().toISOString()
    };

    setComentarios([...comentarios, newComentario]);
  };

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Início', href: '#' }];

    if (currentPage === 'os-list') {
      crumbs.push({ label: 'Ordens de Serviço', href: '#' });
    } else if (currentPage === 'os-criar') {
      crumbs.push({ label: 'Ordens de Serviço', href: '#' });
      crumbs.push({ label: 'Criar Nova OS', href: '#' });
    } else if (currentPage === 'os-details' && selectedOS) {
      crumbs.push({ label: 'Ordens de Serviço', href: '#' });
      crumbs.push({ label: selectedOS.codigo, href: '#' });
    } else if (currentPage === 'os-workflow') {
      crumbs.push({ label: 'Ordens de Serviço', href: '#' });
      crumbs.push({ label: 'Fluxo de Trabalho - Obras', href: '#' });
    } else if (currentPage === 'os-details-workflow') {
      crumbs.push({ label: 'Ordens de Serviço', href: '#' });
      crumbs.push({ label: 'Detalhes e Fluxo de Trabalho', href: '#' });
    } else if (currentPage === 'wizard-obras-lead') {
      crumbs.push({ label: 'Ordens de Serviço', href: '#' });
      crumbs.push({ label: 'Criar Nova OS', href: '#' });
      crumbs.push({ label: 'Novo Lead - Obras (OS 01-04)', href: '#' });
    } else if (currentPage.startsWith('wizard-')) {
      crumbs.push({ label: 'Ordens de Serviço', href: '#' });
      crumbs.push({ label: 'Criar Nova OS', href: '#' });
      crumbs.push({ label: 'Wizard', href: '#' });
    } else if (currentPage === 'dashboard') {
      crumbs.push({ label: 'Dashboard', href: '#' });
    } else if (currentPage === 'clientes') {
      crumbs.push({ label: 'Clientes', href: '#' });
    } else if (currentPage === 'financeiro') {
      crumbs.push({ label: 'Financeiro', href: '#' });
    } else if (currentPage === 'financeiro-dashboard') {
      crumbs.push({ label: 'Financeiro', href: '#' });
      crumbs.push({ label: 'Dashboard', href: '#' });
    } else if (currentPage === 'conciliacao-bancaria') {
      crumbs.push({ label: 'Financeiro', href: '#' });
      crumbs.push({ label: 'Conciliação Bancária', href: '#' });
    } else if (currentPage === 'prestacao-contas') {
      crumbs.push({ label: 'Financeiro', href: '#' });
      crumbs.push({ label: 'Prestação de Contas', href: '#' });
    } else if (currentPage === 'calendario') {
      crumbs.push({ label: 'Calendário', href: '#' });
    } else if (currentPage === 'configuracoes') {
      crumbs.push({ label: 'Configurações', href: '#' });
    }
    
    return crumbs;
  };

  // Renderização condicional do conteúdo
  const renderContent = () => {
    // Render Login Page
    if (currentPage === 'login' || !currentUser) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }

    // Render Main Application with Layout
    return (
      <div className="flex h-screen overflow-hidden bg-neutral-100">
        <Sidebar 
          currentPage={currentPage}
          onNavigate={handleNavigate}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header 
            user={currentUser}
            breadcrumbs={getBreadcrumbs()}
            onLogout={handleLogout}
            osData={currentPage === 'os-details-workflow' ? {
              codigo: 'OS-001',
              titulo: 'Perícia de Fachada',
              cliente: 'Condomínio Jardim das Flores',
              status: 'Em Triagem',
              statusVariant: 'outline',
              onBack: () => setCurrentPage('os-list')
            } : undefined}
          />
          
          <main className="flex-1 overflow-auto">
            {currentPage === 'dashboard' && (
              <DashboardPage 
                ordensServico={ordensServico}
                delegacoes={delegacoes}
                onOSClick={handleOSClick}
                onViewAllOS={() => setCurrentPage('os-list')}
                onDelegarClick={() => setCurrentPage('delegacoes')}
              />
            )}
            
            {currentPage === 'os-list' && (
              <OSListPage 
                currentUser={currentUser} 
                onNavigate={handleNavigate}
              />
            )}
            
            {currentPage === 'os-criar' && (
              <OSCreationHub onNavigate={handleNavigate} />
            )}
            
            {currentPage === 'os-details' && selectedOS && (
              <OSDetailsPage 
                ordemServico={selectedOS}
                comentarios={comentarios.filter(c => c.osId === selectedOS.id)}
                documentos={mockDocumentos.filter(d => d.osId === selectedOS.id)}
                historico={mockHistorico.filter(h => h.osId === selectedOS.id)}
                onBack={handleBackFromOS}
                onAddComentario={handleAddComentario}
              />
            )}
            
            {currentPage === 'os-workflow' && (
              <OSWorkflowPage
                onBack={() => setCurrentPage('os-list')}
              />
            )}
            
            {currentPage === 'os-details-workflow' && (
              <OSDetailsWorkflowPage key="os-details-workflow" />
            )}
            
            {currentPage === 'debug-schema' && (
              <TestSchemaReload />
            )}
            
            {currentPage === 'seed-usuarios' && (
              <SeedUsuariosPage onBack={() => setCurrentPage('configuracoes')} />
            )}
            
            {currentPage === 'delegacoes' && (
              <DelegacoesPage onBack={() => setCurrentPage('configuracoes')} />
            )}
            
            {/* Wizards de Criação de OS */}
            {currentPage === 'wizard-obras-lead' && (
              <OSDetailsWorkflowPage key="wizard-obras-lead" onBack={() => setCurrentPage('os-criar')} />
            )}
            
            {currentPage === 'wizard-start-contrato-obra' && (
              <OS13WorkflowPage
                onBack={() => setCurrentPage('os-criar')}
              />
            )}
            
            {currentPage === 'wizard-assessoria-lead' && (
              <OSDetailsAssessoriaPage key="wizard-assessoria-lead" onBack={() => setCurrentPage('os-criar')} />
            )}
            
            {currentPage === 'wizard-start-contrato-assessoria' && (
              <OSWizardPlaceholder
                title="Start de Contrato de Assessoria (OS 11, 12)"
                description="Este wizard permite registrar o início de um contrato de assessoria já assinado."
                onBack={() => setCurrentPage('os-criar')}
              />
            )}
            
            {currentPage === 'wizard-solicitacao-reforma' && (
              <OS07WorkflowPage
                onBack={() => setCurrentPage('os-criar')}
              />
            )}
            
            {currentPage === 'wizard-vistoria' && (
              <OS08WorkflowPage
                onBack={() => setCurrentPage('os-criar')}
              />
            )}
            
            {currentPage === 'wizard-requisicao-compras' && (
              <OS09WorkflowPage
                onBack={() => setCurrentPage('os-criar')}
              />
            )}
            
            {currentPage === 'wizard-requisicao-mao-obra' && (
              <OSWizardPlaceholder
                title="Requisição de Mão de Obra (OS 10)"
                description="Este wizard permite solicitar a contratação de nova mo de obra ou colaboradores."
                onBack={() => setCurrentPage('os-criar')}
              />
            )}
            
            {currentPage === 'clientes' && (
              <ClientesListaPage
                onClienteClick={(id) => setCurrentPage('cliente-detalhes')}
                onNovoContrato={() => setCurrentPage('wizard-start-contrato-obra')}
              />
            )}
            
            {currentPage === 'clientes-lista' && (
              <ClientesListaPage
                onClienteClick={(id) => setCurrentPage('cliente-detalhes')}
                onNovoContrato={() => setCurrentPage('wizard-start-contrato-obra')}
              />
            )}
            
            {currentPage === 'cliente-detalhes' && (
              <ClienteDetalhesPage
                clienteId="cli-1"
                onBack={() => setCurrentPage('clientes')}
                onVisualizarPortal={() => setCurrentPage('portal-cliente-obras')}
              />
            )}
            
            {currentPage === 'portal-cliente-obras' && (
              <PortalClienteObras />
            )}
            
            {currentPage === 'portal-cliente-assessoria' && (
              <PortalClienteAssessoria />
            )}
            
            {currentPage === 'financeiro' && (
              <FinanceiroDashboardPage />
            )}
            
            {currentPage === 'financeiro-dashboard' && (
              <FinanceiroDashboardPage onNavigate={handleNavigate} />
            )}
            
            {currentPage === 'conciliacao-bancaria' && (
              <ConciliacaoBancariaPage />
            )}
            
            {currentPage === 'prestacao-contas' && (
              <PrestacaoContasPage />
            )}
            
            {currentPage === 'contas-receber' && (
              <ContasReceberPage />
            )}
            
            {currentPage === 'contas-pagar' && (
              <ContasPagarPage />
            )}
            
            {currentPage === 'colaboradores-lista' && (
              <ColaboradoresListaPage />
            )}
            
            {currentPage === 'controle-presenca' && (
              <ControlePresencaTabelaPage />
            )}
            
            {currentPage === 'calendario' && (
              <CalendarioPage />
            )}
            
            {currentPage === 'configuracoes' && (
              <div className="text-center py-20">
                <h1 className="text-3xl font-bold mb-4">Configurações</h1>
                <p className="text-neutral-600 font-normal">Em desenvolvimento...</p>
              </div>
            )}
            
            {currentPage === 'usuarios-permissoes' && (
              <UsuariosPermissoesPage onBack={() => setCurrentPage('configuracoes')} />
            )}
            
            {currentPage === 'menu-preview' && (
              <MenuPreviewPage onBack={() => setCurrentPage('configuracoes')} />
            )}
            
            {currentPage === 'comercial-dashboard' && (
              <DashboardComercial />
            )}
            
            {currentPage === 'comercial-leads' && (
              <ListaLeads onLeadClick={(leadId) => {
                setSelectedLeadId(leadId);
                setCurrentPage('comercial-lead-detalhes');
              }} />
            )}
            
            {currentPage === 'comercial-lead-detalhes' && selectedLeadId && (
              <DetalhesLead leadId={selectedLeadId} onBack={() => setCurrentPage('comercial-leads')} />
            )}
            
            {currentPage === 'comercial-propostas' && (
              <PropostasComerciais />
            )}
          </main>
        </div>
      </div>
    );
  };

  // Renderização final com Toaster global único
  return (
    <>
      <FontLoader />
      {/* Toaster global - renderizado PRIMEIRO para garantir que esteja pronto antes de qualquer toast */}
      <Toaster />
      {renderContent()}
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}