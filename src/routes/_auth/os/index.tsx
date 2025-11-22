import { createFileRoute } from '@tanstack/react-router'
import { OSListPage } from '../../../components/os/os-list-page'
import { useAuth } from '../../../lib/contexts/auth-context'

export const Route = createFileRoute('/_auth/os/')({
  component: OSListRoute,
})

function OSListRoute() {
  const { currentUser } = useAuth()

  if (!currentUser) return null

  return (
    <OSListPage currentUser={currentUser} />
  )
}
