import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OS07WorkflowPage } from '../../../components/os/os07-workflow-page'

export const Route = createFileRoute('/_auth/os/criar/solicitacao-reforma')({
  component: SolicitacaoReformaRoute,
})

function SolicitacaoReformaRoute() {
  const router = useRouter()

  return (
    <OS07WorkflowPage
      onBack={() => router.history.back()}
    />
  )
}
