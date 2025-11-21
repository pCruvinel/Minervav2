import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/colaboradores/presenca')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/colaboradores/presenca"!</div>
}
