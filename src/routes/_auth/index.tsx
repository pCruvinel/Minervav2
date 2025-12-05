/**
 * Rota: / (Home)
 * 
 * Hub de Informações Gerais - Mural Digital
 * Acessível a todos os usuários autenticados
 */
import { createFileRoute } from '@tanstack/react-router'
import { HomePage } from '@/components/home/home-page'

export const Route = createFileRoute('/_auth/')({
  component: HomeRoute,
})

function HomeRoute() {
  return (
    <div className="content-wrapper">
      <HomePage />
    </div>
  )
}
