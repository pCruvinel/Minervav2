import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/portal/contratos')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/portal/contratos"!</div>
}
