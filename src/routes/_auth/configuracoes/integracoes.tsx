
import { createFileRoute } from '@tanstack/react-router'
import { IntegracoesPage } from '../../../components/configuracoes/integracoes-page'

export const Route = createFileRoute('/_auth/configuracoes/integracoes')({
  component: IntegracoesPage,
})
