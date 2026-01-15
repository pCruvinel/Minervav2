import { createFileRoute } from '@tanstack/react-router'
import { OS07FormPublico } from '@/components/os/assessoria/os-7/components/os07-form-publico'

export const Route = createFileRoute('/reforma/$osId')({
  component: ReformaPublicaRoute,
})

function ReformaPublicaRoute() {
  const { osId } = Route.useParams()

  return <OS07FormPublico osId={osId} />
}
