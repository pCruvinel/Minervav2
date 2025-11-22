import { createFileRoute } from '@tanstack/react-router'
import { ControlePresencaPage } from '../../../components/colaboradores/controle-presenca-page'

export const Route = createFileRoute('/_auth/colaboradores/presenca')({
  component: ControlePresencaPage,
})
