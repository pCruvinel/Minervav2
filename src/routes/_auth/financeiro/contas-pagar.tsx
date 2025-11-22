import { createFileRoute } from '@tanstack/react-router'
import { ContasPagarPage } from '../../../components/financeiro/contas-pagar-page'

export const Route = createFileRoute('/_auth/financeiro/contas-pagar')({
  component: ContasPagarPage,
})
