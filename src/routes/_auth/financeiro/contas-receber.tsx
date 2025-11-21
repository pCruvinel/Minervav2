import { createFileRoute } from '@tanstack/react-router'
import { ContasReceberPage } from '../../../components/financeiro/contas-receber-page'

export const Route = createFileRoute('/_auth/financeiro/contas-receber')({
  component: ContasReceberPage,
})
