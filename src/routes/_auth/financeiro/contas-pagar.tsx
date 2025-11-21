import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/financeiro/contas-pagar')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/financeiro/contas-pagar"!</div>
}
