import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/proposta/$osId')({
    component: RouteComponent,
})

function RouteComponent() {
    return <div>Hello "/proposta/$osId"!</div>
}
