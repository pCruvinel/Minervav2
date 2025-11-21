import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ClientesListaPage } from '../../../components/clientes/clientes-lista-page'

export const Route = createFileRoute('/_auth/clientes/')({
  component: ClientesListaRoute,
})

function ClientesListaRoute() {
  const router = useRouter()

  return (
    <ClientesListaPage
      onClienteClick={(clienteId) => router.navigate({ to: '/clientes/$clienteId', params: { clienteId } })}
      onNovoContrato={() => router.navigate({ to: '/os/criar/start-contrato-obra' })}
    />
  )
}
