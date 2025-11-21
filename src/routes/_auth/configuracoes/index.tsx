import { createFileRoute, useRouter } from '@tanstack/react-router'
import { UsuariosPermissoesPage } from '../../../components/configuracoes/usuarios-permissoes-page'

export const Route = createFileRoute('/_auth/configuracoes/')({
  component: ConfiguracoesRoute,
})

function ConfiguracoesRoute() {
  const router = useRouter()

  return (
    <UsuariosPermissoesPage
      onBack={() => router.history.back()}
    />
  )
}
