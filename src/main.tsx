import { StrictMode, useMemo } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { AuthProvider, useAuth } from './lib/contexts/auth-context'
import './index.css'

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {
    auth: undefined!, // We'll inject this in the App component
  },
})

// Register the router instance for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

function InnerApp() {
  const auth = useAuth()

  // Memoize context para evitar recriação em cada render
  // Isso previne race conditions no router durante navegação
  const routerContext = useMemo(() => ({ auth }), [auth])

  return <RouterProvider router={router} context={routerContext} />
}

function App() {
  return (
    <AuthProvider>
      <InnerApp />
    </AuthProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)