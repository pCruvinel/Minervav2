import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ClienteDetalhesPage } from '../../../components/clientes/cliente-detalhes-page'

export const Route = createFileRoute('/_auth/clientes/$clienteId')({
  component: ClienteDetalhesRoute,
})

function ClienteDetalhesRoute() {
  const { clienteId } = Route.useParams()
  const router = useRouter()

  return (
    <ClienteDetalhesPage
      clienteId={clienteId}
      onBack={() => router.history.back()}
    />
  )
}
