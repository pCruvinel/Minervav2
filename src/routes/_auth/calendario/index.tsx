import { createFileRoute } from '@tanstack/react-router'
import { CalendarioPage } from '../../../components/calendario/calendario-page'

export const Route = createFileRoute('/_auth/calendario/')({
  component: CalendarioPage,
})
