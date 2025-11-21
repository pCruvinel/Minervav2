import { createRootRouteWithContext, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { AuthContextType } from '../lib/contexts/auth-context'
import { Toaster } from '../components/ui/sonner'
import { FontLoader } from '../components/layout/font-loader'

interface MyRouterContext {
  auth: AuthContextType
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: () => (
    <>
      <FontLoader />
      <Toaster />
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
