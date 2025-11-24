import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsPage } from '../../../components/os/os-details-page'
import { mockComentarios, mockDocumentos, mockHistorico } from '../../../lib/mock-data'
import { useOrdemServico, useEtapasOS } from '../../../lib/hooks/use-ordens-servico'
import { useEffect } from 'react'

export const Route = createFileRoute('/_auth/os/$osId')({
  component: OSDetailsRoute,
})

function OSDetailsRoute() {
  const { osId } = Route.useParams()
  const router = useRouter()

  // Fetch OS data
  const { data: os, isLoading: isLoadingOS, error: errorOS } = useOrdemServico(osId)

  // Fetch Etapas data
  const { etapas, loading: isLoadingEtapas } = useEtapasOS(osId)

  if (isLoadingOS || isLoadingEtapas) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (errorOS || !os) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h2 className="text-xl font-semibold text-destructive">Erro ao carregar OS</h2>
        <p className="text-muted-foreground">Não foi possível encontrar a Ordem de Serviço solicitada.</p>
        <button
          onClick={() => router.history.back()}
          className="text-primary hover:underline"
        >
          Voltar para a lista
        </button>
      </div>
    )
  }

  return (
    <OSDetailsPage
      ordemServico={os}
      comentarios={mockComentarios} // TODO: Implement real comments
      documentos={mockDocumentos}   // TODO: Implement real documents
      historico={mockHistorico}     // TODO: Implement real history
      etapas={etapas || []}
      onBack={() => router.history.back()}
      onAddComentario={(texto) => console.log('Add comment:', texto)}
    />
  )
}
