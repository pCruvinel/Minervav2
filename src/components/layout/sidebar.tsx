import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from '@tanstack/react-router';
import {
  Home,
  LayoutDashboard,
  FileText,
  Users,
  DollarSign,
  Calendar,
  Settings,
  PieChart,
  CreditCard,
  Kanban,
  Receipt,
  TrendingUp,
  TrendingDown,
  UserCog,
  ClipboardCheck,
  Shield,
  ChevronRight,
  LayoutGrid,
  Eye,
  ShoppingCart,
  UserPlus,
  Briefcase,
} from 'lucide-react';
import { MinervaLogo } from './minerva-logo';
import { useAuth } from '@/lib/contexts/auth-context';
import { RoleLevel, podeAcessarFinanceiro } from '@/lib/types';
import { useSidebarContext } from './sidebar-context';
import { cn } from '@/lib/utils';

// ============================================================
// MAPEAMENTO DE VISIBILIDADE DE MENU POR PERFIL
// ============================================================

const visibilityByRole: Record<RoleLevel, string[]> = {
  // Nível 10: Admin - Acesso Total
  'admin': ['home', 'dashboard', 'comercial', 'financeiro', 'colaboradores', 'calendario', 'configuracoes'],

  // Nível 9: Diretor - Acesso Total
  'diretor': ['home', 'dashboard', 'comercial', 'financeiro', 'colaboradores', 'calendario', 'configuracoes'],

  // Nível 6: Coord. Administrativo - Acesso Total (inclui financeiro)
  'coord_administrativo': ['home', 'dashboard', 'comercial', 'financeiro', 'colaboradores', 'calendario', 'configuracoes'],

  // Nível 5: Coordenadores Setoriais - SEM acesso financeiro
  'coord_assessoria': ['home', 'dashboard', 'colaboradores', 'calendario'],
  'coord_obras': ['home', 'dashboard', 'colaboradores', 'calendario'],

  // Nível 3: Operacionais - Básico sem financeiro
  'operacional_admin': ['home', 'dashboard', 'calendario'],
  'operacional_comercial': ['home', 'dashboard', 'comercial', 'calendario'],

  // Nível 2: Operacionais Jr - Básico sem financeiro
  'operacional_assessoria': ['home', 'dashboard', 'calendario'],
  'operacional_obras': ['home', 'dashboard', 'calendario'],

  // Nível 0: Colaborador Obra - Sem acesso ao sistema
  'colaborador_obra': [],
};

const menuItems = [
  {
    id: 'home',
    label: 'Home',
    icon: Home,
    to: '/'
  },
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    submenu: [
      { id: 'dashboard-home', label: 'Operacional', icon: PieChart, to: '/dashboard' },
      { id: 'dashboard-kanban', label: 'Kanban', icon: Kanban, to: '/dashboard/kanban' },
      { id: 'dashboard-executivo', label: 'Executivo', icon: Shield, to: '/dashboard/executivo' },
    ]
  },
  {
    id: 'comercial',
    label: 'Comercial',
    icon: Briefcase,
    submenu: [
      { id: 'comercial-novo-lead', label: 'Novo Lead', icon: UserPlus, to: '/comercial/novo-lead' },
      { id: 'comercial-clientes', label: 'Clientes', icon: Users, to: '/clientes' },
      { id: 'comercial-contratos', label: 'Contratos', icon: FileText, to: '/comercial/contratos' },
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
      { id: 'aprovar-requisicoes', label: 'Gestão de Compras', icon: ShoppingCart, to: '/financeiro/requisicoes' },
    ]
  },
  {
    id: 'colaboradores',
    label: 'Recursos Humanos',
    icon: Users,
    submenu: [
      { id: 'colaboradores-lista', label: 'Colaboradores', icon: UserCog, to: '/colaboradores' },
      { id: 'controle-presenca', label: 'Controle de Presença', icon: ClipboardCheck, to: '/colaboradores/presenca-tabela' },
      { id: 'recrutamento', label: 'Recrutamento', icon: Briefcase, to: '/colaboradores/recrutamento' },
    ]
  },
  {
    id: 'calendario',
    label: 'Calendário',
    icon: Calendar,
    submenu: [
      { id: 'calendario-view', label: 'Visualização', icon: Eye, to: '/calendario' },
      { id: 'calendario-painel', label: 'Painel', icon: LayoutGrid, to: '/calendario/painel' },
    ]
  },
  {
    id: 'configuracoes',
    label: 'Configurações',
    icon: Settings,
    submenu: [
      { id: 'usuarios-permissoes', label: 'Usuários e Permissões', icon: Shield, to: '/configuracoes' },
    ]
  },
];

// Componente Popover para Submenu quando colapsado
interface SubmenuPopoverProps {
  items: typeof menuItems[0]['submenu'];
  isActive: (to: string) => boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onMouseEnter: () => void;
}

function SubmenuPopover({ items, isActive, anchorEl, onClose, onMouseEnter: onPopoverMouseEnter }: SubmenuPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node) &&
        anchorEl &&
        !anchorEl.contains(event.target as Node)
      ) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [anchorEl, onClose]);

  if (!anchorEl || !items) return null;

  const rect = anchorEl.getBoundingClientRect();

  return (
    <div
      ref={popoverRef}
      className="fixed bg-white rounded-lg shadow-lg border z-50"
      style={{
        top: rect.top,
        left: rect.right + 8,
        minWidth: '200px',
        padding: 'var(--spacing-xs)',
      }}
      onMouseEnter={onPopoverMouseEnter}
      onMouseLeave={onClose}
    >
      <ul className="flex flex-col" style={{ gap: 'var(--spacing-xs)' }}>
        {items.map((subItem) => {
          const SubIcon = subItem.icon;
          const subIsActive = isActive(subItem.to);

          return (
            <li key={subItem.id}>
              <Link
                to={subItem.to}
                className="flex items-center rounded-lg transition-colors text-sm"
                style={{
                  gap: 'var(--spacing-sm)',
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: subIsActive ? 'var(--color-primary-50)' : 'transparent',
                  color: subIsActive ? 'var(--color-primary-700)' : 'var(--color-neutral-700)',
                  fontWeight: subIsActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                  transitionDuration: 'var(--transition-base)',
                  textDecoration: 'none',
                }}
                onMouseEnter={(e) => {
                  if (!subIsActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!subIsActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
                onClick={onClose}
              >
                <SubIcon className="w-4 h-4 shrink-0" />
                <span>{subItem.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function Sidebar() {
  const { currentUser } = useAuth();
  const location = useLocation();
  const { isOpen, toggle } = useSidebarContext();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [hoveredMenu, setHoveredMenu] = useState<{ id: string; element: HTMLElement } | null>(null);
  const hoverTimeoutRef = useRef<number | null>(null);

  const currentPath = location.pathname;

  // Filtrar itens do menu baseado no perfil do usuário
  const getVisibleMenuItems = () => {
    if (!currentUser) return menuItems;

    // Tentar obter o role de várias propriedades possíveis
    const roleSlug = (
      currentUser.cargo_slug ||
      currentUser.role_nivel ||
      'colaborador_obra'
    ) as RoleLevel;

    const visibleItemIds = visibilityByRole[roleSlug];

    // Se o role não foi encontrado ou retornou undefined, mostrar todos os itens
    // (usuário logado mas com cargo não mapeado ainda)
    if (!visibleItemIds || visibleItemIds.length === 0) {
      console.warn(`[Sidebar] Role "${roleSlug}" não encontrado em visibilityByRole. Mostrando menu completo.`);
      return menuItems;
    }

    // Filtrar itens base por role
    let filteredItems = menuItems.filter(item => visibleItemIds.includes(item.id));

    // 🆕 VERIFICAÇÃO DINÂMICA: Remover menu 'Financeiro' se usuário não tem acesso_financeiro
    if (!podeAcessarFinanceiro(currentUser)) {
      filteredItems = filteredItems.filter(item => item.id !== 'financeiro');
    }

    return filteredItems;
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
      className="fixed left-0 top-0 h-screen flex flex-col transition-all bg-white shadow-sm sidebar-component"
      style={{
        width: isOpen ? 'var(--sidebar-width)' : 'var(--sidebar-collapsed)',
        zIndex: 'var(--z-sticky)',
        borderRight: '1px solid hsl(var(--border))',
        transitionDuration: 'var(--transition-base)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-center px-4 shrink-0"
        style={{
          height: 'var(--sidebar-header-height)',
          borderBottom: '1px solid hsl(var(--border))',
        }}
      >
        {isOpen ? (
          <MinervaLogo variant="full" className="h-[67px] w-full" />
        ) : (
          <MinervaLogo variant="icon" className="h-16 w-16" />
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
                    onMouseEnter={(e) => {
                      // Adicionar efeito de hover
                      if (!itemIsActive) {
                        e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
                      }
                      // Limpar timeout anterior se existir
                      if (hoverTimeoutRef.current) {
                        clearTimeout(hoverTimeoutRef.current);
                        hoverTimeoutRef.current = null;
                      }
                      // Mostrar popover quando colapsado
                      if (!isOpen) {
                        setHoveredMenu({ id: item.id, element: e.currentTarget });
                      }
                    }}
                    onMouseLeave={(e) => {
                      // Remover efeito de hover
                      if (!itemIsActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                      }
                      // Delay para permitir mover o mouse para o popover
                      if (!isOpen) {
                        hoverTimeoutRef.current = setTimeout(() => {
                          setHoveredMenu(prev => prev?.id === item.id ? null : prev);
                        }, 300);
                      }
                    }}
                    className="w-full flex items-center rounded-lg transition-colors text-sm font-medium"
                    style={{
                      gap: 'var(--spacing-sm)',
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: itemIsActive ? 'var(--color-primary-50)' : 'transparent',
                      color: itemIsActive ? 'var(--color-primary-700)' : 'var(--color-neutral-700)',
                      transitionDuration: 'var(--transition-base)',
                      textDecoration: 'none',
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

                  {/* Popover para menu colapsado */}
                  {!isOpen && hoveredMenu?.id === item.id && (
                    <SubmenuPopover
                      items={item.submenu}
                      isActive={isActive}
                      anchorEl={hoveredMenu.element}
                      onMouseEnter={() => {
                        // Cancelar timeout quando mouse entra no popover
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current);
                          hoverTimeoutRef.current = null;
                        }
                      }}
                      onClose={() => {
                        if (hoverTimeoutRef.current) {
                          clearTimeout(hoverTimeoutRef.current);
                          hoverTimeoutRef.current = null;
                        }
                        setHoveredMenu(null);
                      }}
                    />
                  )}

                  {/* Submenu expandido tradicional */}
                  {isOpen && isExpanded && (
                    <ul
                      className="flex flex-col"
                      style={{
                        marginLeft: 'var(--spacing-md)',
                        marginTop: 'var(--spacing-xs)',
                        paddingLeft: 'var(--spacing-md)',
                        gap: 'var(--spacing-xs)',
                        borderLeft: '2px solid hsl(var(--border))',
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
                                color: subIsActive ? 'var(--color-primary-700)' : 'var(--color-neutral-700)',
                                fontWeight: subIsActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)',
                                transitionDuration: 'var(--transition-base)',
                                textDecoration: 'none',
                              }}
                              onMouseEnter={(e) => {
                                if (!subIsActive) {
                                  e.currentTarget.style.backgroundColor = 'var(--color-neutral-100)';
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
                    transitionDuration: 'var(--transition-base)',
                    textDecoration: 'none',
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
      <div className="shrink-0" style={{ borderTop: '1px solid hsl(var(--border))' }}>
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
