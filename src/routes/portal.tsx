import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/portal')({
  component: PortalLayout,
})

function PortalLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased">
      <Outlet />
    </div>
  )
}
