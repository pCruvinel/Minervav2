import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_auth/financeiro/fluxo-caixa')({
    beforeLoad: () => {
        throw redirect({ to: '/financeiro' })
    },
})
