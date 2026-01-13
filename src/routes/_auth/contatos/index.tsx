import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ClientesListaPage } from '../../../components/clientes/clientes-lista-page'

export const Route = createFileRoute('/_auth/contatos/')({
  component: ContatosListaRoute,
})

function ContatosListaRoute() {
  const router = useRouter()

  return (
    <ClientesListaPage
      onClienteClick={(clienteId) => router.navigate({ to: '/contatos/$clienteId', params: { clienteId } })}
    />
  )
}
