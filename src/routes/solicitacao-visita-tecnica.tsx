import { createFileRoute } from '@tanstack/react-router'
import { OS08FormPublico } from '@/components/os/assessoria/os-8/components/os08-form-publico'

/**
 * Rota pública para solicitação de visita técnica (OS-08)
 * 
 * Acessível sem autenticação em: /solicitacao-visita-tecnica
 * 
 * Ao submeter o formulário:
 * 1. Cria uma nova OS-08 com Etapa 1 concluída
 * 2. Notifica o Coordenador de Assessoria
 * 3. Colaborador fará vinculação do cliente na Etapa 2
 */
export const Route = createFileRoute('/solicitacao-visita-tecnica')({
  component: SolicitacaoVisitaTecnicaRoute,
})

function SolicitacaoVisitaTecnicaRoute() {
  return <OS08FormPublico />
}
