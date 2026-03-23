import { createFileRoute, useRouter } from '@tanstack/react-router'
import { ContratoDetalhePage } from '../../../../components/contratos/contrato-detalhe-page'

export const Route = createFileRoute('/_auth/comercial/contratos/$contratoId')({
  component: ContratoDetalheRoute,
})

function ContratoDetalheRoute() {
  const { contratoId } = Route.useParams()
  const router = useRouter()

  return (
    <ContratoDetalhePage
      contratoId={contratoId}
      onBack={() => router.history.back()}
    />
  )
}
