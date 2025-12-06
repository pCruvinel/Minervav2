import { createFileRoute } from '@tanstack/react-router'
import { RecrutamentoPage } from '@/components/colaboradores/recrutamento/recrutamento-page'

export const Route = createFileRoute('/_auth/colaboradores/recrutamento')({
  component: RecrutamentoPage,
})
