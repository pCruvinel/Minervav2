import { createFileRoute } from '@tanstack/react-router'
import { ConciliacaoBancariaPage } from '../../../components/financeiro/conciliacao-bancaria-page'

export const Route = createFileRoute('/_auth/financeiro/conciliacao')({
  component: ConciliacaoBancariaPage,
})
