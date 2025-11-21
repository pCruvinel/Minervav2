import { createFileRoute, useRouter } from '@tanstack/react-router'
import { OSDetailsPage } from '../../../components/os/os-details-page'
import { mockOrdensServico, mockComentarios, mockDocumentos, mockHistorico } from '../../../lib/mock-data'
import { useState, useEffect } from 'react'
import { OrdemServico } from '../../../lib/types'

export const Route = createFileRoute('/_auth/os/$osId')({
  component: OSDetailsRoute,
})

function OSDetailsRoute() {
  const { osId } = Route.useParams()
  const router = useRouter()
  const [os, setOs] = useState<OrdemServico | null>(null)

  useEffect(() => {
    // Simulate fetching OS by ID
    // In a real app, this would be a query
    const foundOS = mockOrdensServico.find(o => o.id === osId) || mockOrdensServico[0] // Fallback to first for demo
    setOs(foundOS)
  }, [osId])

  if (!os) return <div>Carregando...</div>

  return (
    <OSDetailsPage
      ordemServico={os}
      comentarios={mockComentarios}
      documentos={mockDocumentos}
      historico={mockHistorico}
      onBack={() => router.history.back()}
      onAddComentario={(texto) => console.log('Add comment:', texto)}
    />
  )
}
