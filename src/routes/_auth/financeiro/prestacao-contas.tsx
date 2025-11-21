import { createFileRoute } from '@tanstack/react-router'
import { PrestacaoContasPage } from '../../../components/financeiro/prestacao-contas-page'

export const Route = createFileRoute('/_auth/financeiro/prestacao-contas')({
  component: PrestacaoContasPage,
})
