import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/suporte')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/portal/suporte"!</div>
}
