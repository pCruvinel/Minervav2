/**
 * Portal Index - PÃ¡gina principal do Portal do Cliente
 * 
 * Exibe:
 * - Cards de resumo (Status do Contrato, Tickets Abertos, PrÃ³xima Vistoria)
 * - BotÃ£o "Abrir Novo Chamado"
 * - Aba de VisÃ£o Geral
 */

import { createFileRoute } from '@tanstack/react-router'
import { PortalClientePage } from '@/components/portal/portal-cliente-page'

export const Route = createFileRoute('/portal/')({
  component: PortalIndex,
})

function PortalIndex() {
  return <PortalClientePage />
}
