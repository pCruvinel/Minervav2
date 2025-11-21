import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  DollarSign, 
  Calendar, 
  Settings,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
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
  Globe,
  Shield
} from 'lucide-react';
import { MinervaLogo } from './minerva-logo';
import { useAuth } from '../../lib/contexts/auth-context';
import { RoleLevel } from '../../lib/types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

// ============================================================
// MAPEAMENTO DE VISIBILIDADE DE MENU POR PERFIL
// ============================================================

const visibilityByRole: Record<RoleLevel, string[]> = {
  // DIRETORIA: Acesso completo
  'DIRETORIA': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  
  // GESTORES: Acesso completo
  'GESTOR_ADMINISTRATIVO': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  'GESTOR_ASSESSORIA': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  'GESTOR_OBRAS': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  
  // COLABORADORES: Acesso limitado (Dashboard, Ordem de Serviço, Clientes, Calendário)
  'COLABORADOR_ADMINISTRATIVO': ['dashboard', 'projetos', 'clientes', 'calendario'],
  'COLABORADOR_ASSESSORIA': ['dashboard', 'projetos', 'clientes', 'calendario'],
  'COLABORADOR_OBRAS': ['dashboard', 'projetos', 'clientes', 'calendario'],
  
  // MOBRA: Acesso mínimo
  'MOBRA': ['dashboard'],
};

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { 
    id: 'projetos', 
    label: 'Ordem de Serviço', 
    icon: FileText,
    submenu: [
      { id: 'os-criar', label: 'Nova OS', icon: Plus },
      { id: 'os-list', label: 'Kanban', icon: Kanban },
      { id: 'historico-os', label: 'Histórico', icon: History },
    ]
  },
  { 
    id: 'financeiro', 
    label: 'Financeiro', 
    icon: DollarSign,
    submenu: [
      { id: 'financeiro-dashboard', label: 'Dashboard Financeiro', icon: PieChart },
      { id: 'conciliacao-bancaria', label: 'Conciliação Bancária', icon: CreditCard },
      { id: 'prestacao-contas', label: 'Prestação de Contas', icon: Receipt },
      { id: 'contas-pagar', label: 'Contas a Pagar', icon: TrendingDown },
      { id: 'contas-receber', label: 'Contas a Receber', icon: TrendingUp },
    ]
  },
  { 
    id: 'colaboradores', 
    label: 'Colaboradores', 
    icon: Users,
    submenu: [
      { id: 'colaboradores-lista', label: 'Gestão de Colaboradores', icon: UserCog },
      { id: 'controle-presenca', label: 'Controle de Presença', icon: ClipboardCheck },
    ]
  },
  { 
    id: 'clientes', 
    label: 'Clientes', 
    icon: Building2,
    submenu: [
      { id: 'clientes-lista', label: 'Meus Clientes', icon: Users },
      { id: 'portal-cliente', label: 'Portal do Cliente', icon: Globe },
    ]
  },
  { id: 'calendario', label: 'Calendário', icon: Calendar },
  { 
    id: 'configuracoes', 
    label: 'Configurações', 
    icon: Settings,
    submenu: [
      { id: 'usuarios-permissoes', label: 'Usuários e Permissões', icon: Shield },
    ]
  },
];

export function Sidebar({ currentPage, onNavigate, collapsed, onToggleCollapse }: SidebarProps) {
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);
  const { currentUser } = useAuth();
  
  // Filtrar itens do menu baseado no perfil do usuário
  const getVisibleMenuItems = () => {
    // Se não houver usuário logado, mostrar menu completo (fallback)
    if (!currentUser) {
      return menuItems;
    }
    
    // Obter lista de itens visíveis para o role do usuário
    const visibleItemIds = visibilityByRole[currentUser.role_nivel] || [];
    
    // Filtrar menuItems baseado na visibilidade
    return menuItems.filter(item => visibleItemIds.includes(item.id));
  };
  
  const visibleMenuItems = getVisibleMenuItems();
  
  return (
    <div className={`minerva-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Logo */}
      <div className="minerva-sidebar-logo">
        {!collapsed ? (
          <MinervaLogo variant="full" className="px-2" />
        ) : (
          <MinervaLogo variant="icon" />
        )}
      </div>

      {/* Menu Items */}
      <nav className="minerva-sidebar-nav">
        {visibleMenuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id || (item.submenu && item.submenu.some(sub => sub.id === currentPage));
          const isSubmenuOpen = openSubmenu === item.id;
          
          return (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.submenu) {
                    setOpenSubmenu(isSubmenuOpen ? null : item.id);
                  } else {
                    onNavigate(item.id);
                  }
                }}
                className={`minerva-sidebar-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="minerva-sidebar-item-icon" />
                {!collapsed && (
                  <>
                    <span className="minerva-sidebar-item-text">{item.label}</span>
                    {item.submenu && (
                      <span className="ml-auto">
                        {isSubmenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </span>
                    )}
                  </>
                )}
              </button>
              
              {/* Submenu */}
              {item.submenu && isSubmenuOpen && !collapsed && (
                <div className="ml-4 mt-1 space-y-1">
                  {item.submenu.map((subItem) => {
                    const SubIcon = subItem.icon;
                    const isSubActive = currentPage === subItem.id;
                    
                    return (
                      <button
                        key={subItem.id}
                        onClick={() => onNavigate(subItem.id)}
                        className={`minerva-sidebar-item text-sm ${isSubActive ? 'active' : ''}`}
                      >
                        <SubIcon className="minerva-sidebar-item-icon w-4 h-4" />
                        <span className="minerva-sidebar-item-text">{subItem.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Toggle Button */}
      <div className="minerva-sidebar-footer">
        <button
          onClick={onToggleCollapse}
          className={`minerva-button minerva-button-ghost w-full ${collapsed ? 'px-0' : ''}`}
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5" />
              <span className="ml-2">Recolher</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}