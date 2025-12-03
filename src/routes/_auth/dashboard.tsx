import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { DashboardPage } from '@/components/dashboard/dashboard-page'
import { mockOrdensServico } from '@/lib/mock-data'
import { useState } from 'react'
import { Delegacao } from '@/lib/types'

export const Route = createFileRoute('/_auth/dashboard')({
    component: DashboardRoute,
})

function DashboardRoute() {
    const navigate = useNavigate()

    // Mock data state - eventually this should come from a query/loader
    const [ordensServico] = useState(mockOrdensServico)

    // Mock de delegações - em produção virá do Supabase
    const [delegacoes] = useState<Delegacao[]>([
        {
            id: 'del-1',
            os_id: 'os-1',
            delegante_id: '22222222-2222-2222-2222-222222222222',
            delegante_nome: 'Maria Silva Gestora Comercial',
            delegado_id: '55555555-5555-5555-5555-555555555555',
            delegado_nome: 'Ana Claudia Vendedora',
            data_prazo: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status_delegacao: 'pendente',
            descricao_tarefa: 'Realizar levantamento de necessidades do cliente para elaboração de proposta comercial.',
            observacoes: 'Cliente já demonstrou interesse em fechar contrato.',
            created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            data_criacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            data_atualizacao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
            id: 'del-2',
            os_id: 'os-2',
            delegante_id: '33333333-3333-3333-3333-333333333333',
            delegante_nome: 'João Pedro Gestor Assessoria',
            delegado_id: '77777777-7777-7777-7777-777777777777',
            delegado_nome: 'Bruno Martins Técnico',
            data_prazo: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            status_delegacao: 'pendente',
            descricao_tarefa: 'Elaborar parecer técnico sobre viabilidade de reforma estrutural.',
            created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            data_criacao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            data_atualizacao: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
    ])

    return (
        <DashboardPage
            ordensServico={ordensServico}
            delegacoes={delegacoes}
            onOSClick={(os) => navigate({ to: '/os/$osId', params: { osId: os.id } })}
            onViewAllOS={() => navigate({ to: '/os' })}
            onDelegarClick={() => navigate({ to: '/delegacoes' })} // Assuming this route will exist
        />
    )
}
