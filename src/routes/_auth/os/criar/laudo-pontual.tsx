import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/os/criar/laudo-pontual')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_auth/os/criar/laudo-pontual"!</div>
}
