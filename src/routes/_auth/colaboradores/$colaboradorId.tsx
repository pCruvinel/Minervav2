import { createFileRoute } from '@tanstack/react-router'
import { ColaboradorDetalhesPage } from '@/components/colaboradores/colaborador-detalhes-page'

export const Route = createFileRoute('/_auth/colaboradores/$colaboradorId')({
  component: ColaboradorDetalhesPage,
})
