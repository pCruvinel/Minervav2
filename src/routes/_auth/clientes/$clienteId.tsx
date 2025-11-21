import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/clientes/$clienteId')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/clientes/$clienteId"!</div>
}
