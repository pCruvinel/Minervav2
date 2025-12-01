import { createFileRoute, redirect, Outlet, useRouter } from '@tanstack/react-router'
import { Sidebar } from '../components/layout/sidebar'
import { SidebarProvider, useSidebarContext } from '../components/layout/sidebar-context'
import { Header } from '../components/layout/header'
import { useAuth } from '../lib/contexts/auth-context'
import { cn } from '../lib/utils'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context, location }) => {
    // Se ainda está carregando, retorna sem bloquear
    // TanStack Router vai re-executar quando context mudar
    if (context.auth.isLoading) {
      return
    }

    // Só verificar se usuário está autenticado após loading terminar
    if (!context.auth.currentUser) {
      throw redirect({
        to: '/login',
        search: {
          redirect: location.href,
        },
      })
    }
  },
  component: AuthLayout,
})

function AuthLayoutContent() {
  const { currentUser, logout } = useAuth()
  const router = useRouter()
  const navigate = useRouter().navigate
  const { isOpen } = useSidebarContext()

  const currentPath = router.state.location.pathname

  const getCurrentPage = (path: string): string => {
    if (path === '/' || path === '/_auth/dashboard') return 'dashboard'
    if (path.startsWith('/os/criar')) return 'os-criar'
    if (path.startsWith('/os')) return 'os-list'
    if (path.startsWith('/financeiro')) return 'financeiro-dashboard'
    if (path.startsWith('/clientes')) return 'clientes-lista'
    if (path.startsWith('/colaboradores')) return 'colaboradores-lista'
    if (path.startsWith('/calendario')) return 'calendario'
    if (path.startsWith('/configuracoes')) return 'configuracoes'
    return 'dashboard'
  }

  const currentPage = getCurrentPage(currentPath)

  const handleLogout = () => {
    logout()
    navigate({ to: '/login' })
  }

  const getBreadcrumbs = () => {
    const crumbs = [{ label: 'Início', href: '/' }]

    if (currentPage === 'os-list') {
      crumbs.push({ label: 'Ordens de Serviço', href: '/os' })
    } else if (currentPage === 'os-criar') {
      crumbs.push({ label: 'Ordens de Serviço', href: '/os' })
      crumbs.push({ label: 'Criar Nova OS', href: '/os/criar' })
    } else if (currentPage === 'financeiro-dashboard') {
      crumbs.push({ label: 'Financeiro', href: '/financeiro' })
    } else if (currentPage === 'clientes-lista') {
      crumbs.push({ label: 'Clientes', href: '/clientes' })
    }

    return crumbs
  }

  if (!currentUser) return null

  return (
    <div className={cn("app-container", isOpen && "sidebar-open")}>
      <Sidebar />

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="main-header">
          <Header
            user={currentUser}
            breadcrumbs={getBreadcrumbs()}
            onLogout={handleLogout}
          />
        </header>

        {/* Page Content */}
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

function AuthLayout() {
  return (
    <SidebarProvider>
      <AuthLayoutContent />
    </SidebarProvider>
  )
}
