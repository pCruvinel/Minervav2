import { createFileRoute } from '@tanstack/react-router'
import { ControlePresencaTabelaPage } from '../../../components/colaboradores/controle-presenca-tabela-page'

export const Route = createFileRoute('/_auth/colaboradores/presenca-tabela')({
  component: ControlePresencaTabelaPage,
})
