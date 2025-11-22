import { createFileRoute, useRouter } from '@tanstack/react-router'
import { DelegacoesPage } from '../../components/delegacao/delegacoes-page'

export const Route = createFileRoute('/_auth/delegacoes')({
  component: DelegacoesRoute,
})

function DelegacoesRoute() {
  const router = useRouter()

  return (
    <DelegacoesPage
      onBack={() => router.history.back()}
    />
  )
}
