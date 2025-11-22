import React, { useState, useEffect } from 'react';
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
import { Link, useLocation } from '@tanstack/react-router';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

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
      { id: 'historico-os', label: 'Histórico', icon: History, to: '/os' }, // TODO: Create history route
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
      // { id: 'portal-cliente', label: 'Portal do Cliente', icon: Globe, to: '/portal' },
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

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { currentUser } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  
  // Initialize open submenu based on current path
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(() => {
    const activeItem = menuItems.find(item => 
      item.submenu?.some(sub => currentPath.startsWith(sub.to))
    );
    return activeItem ? activeItem.id : null;
  });

  // Update open submenu when path changes (optional, but good for deep linking)
  useEffect(() => {
    if (collapsed) return;
    
    const activeItem = menuItems.find(item => 
      item.submenu?.some(sub => currentPath.startsWith(sub.to))
    );
    if (activeItem) {
      setOpenSubmenu(activeItem.id);
    }
  }, [currentPath, collapsed]);
  
  // Filtrar itens do menu baseado no perfil do usuário
  const getVisibleMenuItems = () => {
    // Se não houver usuário logado, mostrar menu completo (fallback)
    if (!currentUser) {
      return menuItems;
    }

    // Obter lista de itens visíveis para o role do usuário (usar cargo_slug)
    const roleSlug = currentUser.cargo_slug || currentUser.role_nivel || 'colaborador';
    const visibleItemIds = visibilityByRole[roleSlug] || [];

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
          const isSubmenuOpen = openSubmenu === item.id;
          
          // Check if any child is active to highlight parent
          const isParentActive = item.submenu?.some(sub => 
            currentPath === sub.to || currentPath.startsWith(sub.to + '/')
          );
          
          // If item has submenu, render button to toggle
          if (item.submenu) {
            return (
              <div key={item.id}>
                <button
                  onClick={() => setOpenSubmenu(isSubmenuOpen ? null : item.id)}
                  className={`minerva-sidebar-item w-full justify-between ${isSubmenuOpen ? 'bg-neutral-100' : ''} ${isParentActive ? 'active' : ''}`}
                >
                  <div className="flex items-center">
                    <Icon className="minerva-sidebar-item-icon" />
                    {!collapsed && <span className="minerva-sidebar-item-text">{item.label}</span>}
                  </div>
                  {!collapsed && (
                    <span className="ml-auto">
                      {isSubmenuOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  )}
                </button>
                
                {/* Submenu */}
                {isSubmenuOpen && !collapsed && (
                  <div className="ml-4 mt-1 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      
                      return (
                        <Link
                          key={subItem.id}
                          to={subItem.to}
                          className="minerva-sidebar-item text-sm"
                          activeProps={{ className: 'active' }}
                        >
                          <SubIcon className="minerva-sidebar-item-icon w-4 h-4" />
                          <span className="minerva-sidebar-item-text">{subItem.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          }

          // If item is a direct link
          return (
            <Link
              key={item.id}
              to={item.to}
              className="minerva-sidebar-item"
              activeProps={{ className: 'active' }}
              activeOptions={{ exact: item.to === '/' }}
            >
              <Icon className="minerva-sidebar-item-icon" />
              {!collapsed && <span className="minerva-sidebar-item-text">{item.label}</span>}
            </Link>
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