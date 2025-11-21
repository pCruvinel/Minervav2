import { createFileRoute } from '@tanstack/react-router'
import { ColaboradoresListaPage } from '../../../components/colaboradores/colaboradores-lista-page'

export const Route = createFileRoute('/_auth/colaboradores/')({
  component: ColaboradoresListaPage,
})
