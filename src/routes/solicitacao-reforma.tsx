import { createFileRoute } from '@tanstack/react-router'
import { OS07FormPublicoNovo } from '@/components/os/assessoria/os-7/components/os07-form-publico-novo'

/**
 * Rota pública para solicitação de reforma (OS-07)
 * 
 * Acessível sem autenticação em: /solicitacao-reforma
 * 
 * Ao submeter o formulário:
 * 1. Cria uma nova OS-07 com Etapa 1 concluída
 * 2. Notifica o Coordenador de Assessoria
 * 3. Colaborador fará vinculação do cliente na Etapa 2
 */
export const Route = createFileRoute('/solicitacao-reforma')({
  component: SolicitacaoReformaRoute,
})

function SolicitacaoReformaRoute() {
  return <OS07FormPublicoNovo />
}
