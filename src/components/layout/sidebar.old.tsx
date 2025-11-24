import {
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Settings,
  PieChart,
  CreditCard,
  Plus,
  Kanban,
  History,
  Receipt,
  TrendingUp,
  TrendingDown,
  UserCog,
  ClipboardCheck,
  Building2,
  Shield,
  ChevronRight
} from 'lucide-react';
import { MinervaLogo } from './minerva-logo';
import { useAuth } from '../../lib/contexts/auth-context';
import { RoleLevel } from '../../lib/types';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

// ============================================================
// MAPEAMENTO DE VISIBILIDADE DE MENU POR PERFIL
// ============================================================

const visibilityByRole: Record<RoleLevel, string[]> = {
  // Admin: Acesso total
  'admin': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],

  // Diretoria: Acesso completo
  'diretoria': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],

  // Gestores: Acesso completo (financeiro pode ser restrito por gestor_obras/assessoria)
  'gestor_administrativo': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  'gestor_assessoria': ['dashboard', 'projetos', 'colaboradores', 'clientes', 'calendario'],
  'gestor_obras': ['dashboard', 'projetos', 'colaboradores', 'clientes', 'calendario'],

  // Colaborador: Acesso limitado
  'colaborador': ['dashboard', 'projetos', 'clientes', 'calendario'],

  // Mão de obra: Sem acesso ao sistema
  'mao_de_obra': [],
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, to: '/' },
  {
    id: 'projetos',
    label: 'Ordem de Serviço',
    icon: FileText,
    submenu: [
      { id: 'os-criar', label: 'Nova OS', icon: Plus, to: '/os/criar' },
      { id: 'os-list', label: 'Kanban', icon: Kanban, to: '/os' },
      { id: 'historico-os', label: 'Histórico', icon: History, to: '/os' },
    ]
  },
  {
    id: 'financeiro',
    label: 'Financeiro',
    icon: DollarSign,
    submenu: [
      { id: 'financeiro-dashboard', label: 'Dashboard Financeiro', icon: PieChart, to: '/financeiro' },
      { id: 'conciliacao-bancaria', label: 'Conciliação Bancária', icon: CreditCard, to: '/financeiro/conciliacao' },
      { id: 'prestacao-contas', label: 'Prestação de Contas', icon: Receipt, to: '/financeiro/prestacao-contas' },
      { id: 'contas-pagar', label: 'Contas a Pagar', icon: TrendingDown, to: '/financeiro/contas-pagar' },
      { id: 'contas-receber', label: 'Contas a Receber', icon: TrendingUp, to: '/financeiro/contas-receber' },
    ]
  },
  {
    id: 'colaboradores',
    label: 'Colaboradores',
    icon: Users,
    submenu: [
      { id: 'colaboradores-lista', label: 'Gestão de Colaboradores', icon: UserCog, to: '/colaboradores' },
      { id: 'controle-presenca', label: 'Controle de Presença', icon: ClipboardCheck, to: '/colaboradores/presenca-tabela' },
    ]
  },
  {
    id: 'clientes',
    label: 'Clientes',
    icon: Building2,
    submenu: [
      { id: 'clientes-lista', label: 'Meus Clientes', icon: Users, to: '/clientes' },
    ]
  },
  { id: 'calendario', label: 'Calendário', icon: Calendar, to: '/calendario' },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    submenu: [
      { id: 'usuarios-permissoes', label: 'Usuários e Permissões', icon: Shield, to: '/configuracoes' },
    ]
  },
];

export function AppSidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const { state } = useSidebar();

  // Filtrar itens do menu baseado no perfil do usuário
  const getVisibleMenuItems = () => {
    if (!currentUser) {
      return menuItems;
    }

    const roleSlug = currentUser.cargo_slug || currentUser.role_nivel || 'colaborador';
    const visibleItemIds = visibilityByRole[roleSlug] || [];

    return menuItems.filter(item => visibleItemIds.includes(item.id));
  };

  const visibleMenuItems = getVisibleMenuItems();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="h-16 border-b border-sidebar-border flex items-center justify-center">
        {state === 'expanded' ? (
          <MinervaLogo variant="full" className="h-10" />
        ) : (
          <MinervaLogo variant="icon" className="h-8 w-8" />
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => {
                const Icon = item.icon;

                // Check if any child is active to highlight parent
                const isParentActive = item.submenu?.some(sub =>
                  currentPath === sub.to || currentPath.startsWith(sub.to + '/')
                );

                // Check if direct link is active
                const isDirectActive = !item.submenu && (
                  item.to === '/' ? currentPath === '/' : currentPath.startsWith(item.to!)
                );

                const isActive = isParentActive || isDirectActive;

                if (item.submenu) {
                  return (
                    <Collapsible
                      key={item.id}
                      asChild
                      defaultOpen={isActive}
                      className="group/collapsible"
                    >
                      <SidebarMenuItem>
                        <CollapsibleTrigger asChild>
                          <SidebarMenuButton
                            tooltip={item.label}
                            isActive={isActive}
                            className="data-[active=true]:bg-primary-50 data-[active=true]:text-primary-700 hover:bg-neutral-50 hover:text-primary-600"
                          >
                            <Icon className="size-4" />
                            <span>{item.label}</span>
                            <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                          </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub>
                            {item.submenu.map((subItem) => {
                              const SubIcon = subItem.icon;
                              const isSubActive = currentPath === subItem.to || currentPath.startsWith(subItem.to + '/');

                              return (
                                <SidebarMenuSubItem key={subItem.id}>
                                  <SidebarMenuSubButton
                                    asChild
                                    isActive={isSubActive}
                                    className="data-[active=true]:bg-primary-50 data-[active=true]:text-primary-700 hover:bg-neutral-50 hover:text-primary-600"
                                  >
                                    <Link to={subItem.to}>
                                      <SubIcon className="size-4 mr-2" />
                                      <span>{subItem.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </SidebarMenuItem>
                    </Collapsible>
                  );
                }

                return (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive}
                      className="data-[active=true]:bg-primary-50 data-[active=true]:text-primary-700 hover:bg-neutral-50 hover:text-primary-600"
                    >
                      <Link to={item.to!}>
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-sidebar-border">
        {state === 'expanded' ? (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0">
              {currentUser?.nome_completo?.substring(0, 2).toUpperCase() || 'US'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-neutral-900 truncate">
                {currentUser?.nome_completo || 'Usuário'}
              </p>
              <p className="text-xs text-neutral-500 truncate capitalize">
                {currentUser?.role_nivel?.replace('_', ' ') || 'Colaborador'}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-xs shrink-0" title={currentUser?.nome_completo}>
              {currentUser?.nome_completo?.substring(0, 2).toUpperCase() || 'US'}
            </div>
          </div>
        )}
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}