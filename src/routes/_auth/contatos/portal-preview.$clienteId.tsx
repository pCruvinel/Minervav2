import { createFileRoute } from '@tanstack/react-router'
import { PortalClientePreview } from '@/components/portal/portal-cliente-preview'

export const Route = createFileRoute(
  '/_auth/contatos/portal-preview/$clienteId',
)({
  component: RouteComponent,
})

function RouteComponent() {
  const { clienteId } = Route.useParams()
  return <PortalClientePreview clienteId={clienteId} />
}
