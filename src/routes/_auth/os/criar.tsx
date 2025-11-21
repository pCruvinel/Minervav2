import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { OSCreationHub } from '../../../components/os/os-creation-hub'

export const Route = createFileRoute('/_auth/os/criar')({
  component: OSCreationRoute,
})

function OSCreationRoute() {
  const navigate = useNavigate()

  return (
    <OSCreationHub
      onNavigate={(route) => navigate({ to: route })}
    />
  )
}
