import { useState } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
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

  Receipt,
  TrendingUp,
  TrendingDown,
  UserCog,
  ClipboardCheck,
  Building2,
  Shield,
  ChevronRight,
} from 'lucide-react';
import { MinervaLogo } from './minerva-logo';
import { useAuth } from '@/lib/contexts/auth-context';
import { RoleLevel } from '@/lib/types';
import { useSidebarContext } from './sidebar-context';
import { cn } from '@/lib/utils';

// ============================================================
// MAPEAMENTO DE VISIBILIDADE DE MENU POR PERFIL
// ============================================================

const visibilityByRole: Record<RoleLevel, string[]> = {
  'admin': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  'diretoria': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  'gestor_administrativo': ['dashboard', 'projetos', 'financeiro', 'colaboradores', 'clientes', 'calendario', 'configuracoes'],
  'gestor_assessoria': ['dashboard', 'projetos', 'colaboradores', 'clientes', 'calendario'],
  'gestor_obras': ['dashboard', 'projetos', 'colaboradores', 'clientes', 'calendario'],
  'colaborador': ['dashboard', 'projetos', 'clientes', 'calendario'],
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
      { id: 'os-list', label: 'Painel', icon: Kanban, to: '/os' },
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

export function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { isOpen, toggle } = useSidebarContext();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  const currentPath = location.pathname;

  // Filtrar itens do menu baseado no perfil do usuário
  const getVisibleMenuItems = () => {
    if (!currentUser) return menuItems;
    const roleSlug = currentUser.cargo_slug || currentUser.role_nivel || 'colaborador';
    const visibleItemIds = visibilityByRole[roleSlug] || [];
    return menuItems.filter(item => visibleItemIds.includes(item.id));
  };

  const visibleMenuItems = getVisibleMenuItems();

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuId)) {
        newSet.delete(menuId);
      } else {
        newSet.add(menuId);
      }
      return newSet;
    });
  };

  const isActive = (to: string) => {
    if (to === '/') return currentPath === '/';
    return currentPath.startsWith(to);
  };

  const isParentActive = (submenu: typeof menuItems[0]['submenu']) => {
    if (!submenu) return false;
    return submenu.some(sub => isActive(sub.to));
  };

  return (
    <aside
      className="fixed left-0 top-0 h-screen flex flex-col transition-all bg-white border-r shadow-sm sidebar-component"
      style={{
        width: isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)',
        zIndex: 'var(--z-sticky)',
        borderColor: 'var(--color-border-light)',
        transitionDuration: 'var(--transition-base)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center px-4 shrink-0 border-b"
        style={{
          height: 'var(--sidebar-header-height)',
          borderColor: 'var(--color-border-light)',
        }}
      >
        {isOpen ? (
          <MinervaLogo variant="full" className="h-14" />
        ) : (
          <MinervaLogo variant="icon" className="h-10 w-10" />
        )}
      </div>

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden" style={{ padding: 'var(--spacing-lg) var(--spacing-sm)' }}>
        <ul className="flex flex-col" style={{ gap: 'var(--spacing-sm)' }}>
          {visibleMenuItems.map((item) => {
            const Icon = item.icon;
            const hasSubmenu = !!item.submenu;
            const isExpanded = expandedMenus.has(item.id);
            const itemIsActive = hasSubmenu ? isParentActive(item.submenu) : isActive(item.to!);

            if (hasSubmenu) {
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      if (!isOpen) {
                        toggle();
                      }
                      toggleSubmenu(item.id);
                    }}
                    className="w-full flex items-center rounded-lg transition-colors text-sm font-medium"
                    style={{
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: itemIsActive ? 'var(--color-primary-50)' : 'transparent',
                      color: itemIsActive ? 'var(--color-primary-700)' : 'var(--color-neutral-700)',
                      transitionDuration: 'var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (!itemIsActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!itemIsActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                    }}
                    title={!isOpen ? item.label : undefined}
                  >
                    <Icon className="w-5 h-5 shrink-0" />
                    {isOpen && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        <ChevronRight
                          className={cn(
                            'w-4 h-4 transition-transform',
                            isExpanded && 'rotate-90'
                          )}
                        />
                      </>
                    )}
                  </button>

                  {/* Submenu */}
                  {isOpen && isExpanded && (
                    <ul
                      className="border-l-2 flex flex-col"
                      style={{
                        marginLeft: 'var(--spacing-md)',
                        marginTop: 'var(--spacing-xs)',
                        paddingLeft: 'var(--spacing-md)',
                        gap: 'var(--spacing-xs)',
                        borderColor: 'var(--color-border)',
                      }}
                    >
                      {item.submenu!.map((subItem) => {
                        const SubIcon = subItem.icon;
                        const subIsActive = isActive(subItem.to);

                        return (
                          <li key={subItem.id}>
                            <Link
                              to={subItem.to}
                              className="flex items-center rounded-lg transition-colors text-sm"
                              style={{
                                gap: 'var(--spacing-xs)',
                                padding: 'var(--spacing-xs) var(--spacing-sm)',
                                backgroundColor: subIsActive ? 'var(--color-primary-50)' : 'transparent',
                                color: subIsActive ? 'var(--color-primary-700)' : 'var(--color-neutral-600)',
                                fontWeight: subIsActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                                transitionDuration: 'var(--transition-fast)',
                              }}
                              onMouseEnter={(e) => {
                                if (!subIsActive) {
                                  e.currentTarget.style.backgroundColor = 'var(--color-neutral-50)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (!subIsActive) {
                                  e.currentTarget.style.backgroundColor = 'transparent';
                                }
                              }}
                            >
                              <SubIcon className="w-4 h-4 shrink-0" />
                              <span>{subItem.label}</span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </li>
              );
            }

            return (
              <li key={item.id}>
                <Link
                  to={item.to!}
                  className="flex items-center rounded-lg transition-colors text-sm font-medium"
                  style={{
                    gap: 'var(--spacing-sm)',
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: itemIsActive ? 'var(--color-primary-50)' : 'transparent',
                    color: itemIsActive ? 'var(--color-primary-700)' : 'var(--color-neutral-700)',
                    transitionDuration: 'var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    if (!itemIsActive) {
                      e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!itemIsActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                  title={!isOpen ? item.label : undefined}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  {isOpen && <span>{item.label}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer - User Info + Toggle Button */}
      <div className="border-t shrink-0" style={{ borderColor: 'var(--color-border-light)' }}>
        {/* Toggle Button */}
        <div style={{ padding: 'var(--spacing-md)' }}>
          <button
            onClick={toggle}
            className="w-full flex items-center justify-center rounded-lg transition-colors text-sm font-medium"
            style={{
              gap: 'var(--spacing-xs)',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              backgroundColor: 'var(--color-neutral-100)',
              color: 'var(--color-neutral-700)',
              transitionDuration: 'var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-200)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
            }}
            aria-label={isOpen ? 'Recolher menu' : 'Expandir menu'}
          >
            {isOpen ? (
              <>
                <ChevronRight className="w-4 h-4 rotate-180" />
                <span>Recolher</span>
              </>
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
