import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/historico')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/portal/historico"!</div>
}
