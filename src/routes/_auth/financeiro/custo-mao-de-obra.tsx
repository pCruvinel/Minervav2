import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/financeiro/custo-mao-de-obra')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="content-wrapper">
      <div>Hello "/_auth/financeiro/custo-mao-de-obra"!</div>
    </div>
  )
}
