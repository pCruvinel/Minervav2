import { createFileRoute } from '@tanstack/react-router'
import { CalendarioPainelPage } from '../../../components/calendario/calendario-painel-page'

export const Route = createFileRoute('/_auth/calendario/painel')({
  component: CalendarioPainelPage,
})
