/**
 * PortalHistoricoTab - Timeline de serviços finalizados
 * 
 * Exibe histórico de OS concluídas (excluindo internas)
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    CheckCircle,
    Calendar,
    Wrench,
    FileText,
    AlertTriangle,
    Clock,
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { supabase } from '@/lib/supabase-client'
import { logger } from '@/lib/utils/logger'

interface ServicoHistorico {
    id: string
    codigo: string
    tipo: string
    tipo_os: number
    descricao?: string
    status: string
    data_criacao: string
    data_conclusao?: string
}

export function PortalHistoricoTab() {
    const { currentUser } = useAuth()
    const [servicos, setServicos] = useState<ServicoHistorico[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const clienteId = currentUser?.user_metadata?.cliente_id

    useEffect(() => {
        if (clienteId) {
            fetchHistorico()
        }
    }, [clienteId])

    const fetchHistorico = async () => {
        try {
            setIsLoading(true)

            // Buscar OS do cliente, excluindo tipos internos (RH = 10, Compras = 9, etc)
            const { data, error: fetchError } = await supabase
                .from('ordens_servico')
                .select('id, codigo, tipo, tipo_os, descricao, status, created_at, updated_at')
                .eq('cliente_id', clienteId)
                .not('tipo_os', 'in', '(9,10)') // Excluir OS internas
                .eq('status', 'concluida')
                .order('updated_at', { ascending: false })
                .limit(20)

            if (fetchError) throw fetchError

            setServicos((data || []).map(os => ({
                id: os.id,
                codigo: os.codigo,
                tipo: os.tipo,
                tipo_os: os.tipo_os,
                descricao: os.descricao,
                status: os.status,
                data_criacao: os.created_at,
                data_conclusao: os.updated_at,
            })))

        } catch (err) {
            logger.error('Erro ao carregar histórico:', err)
            setError('Erro ao carregar histórico')
        } finally {
            setIsLoading(false)
        }
    }

    const getTipoIcon = (tipoOs: number) => {
        switch (tipoOs) {
            case 1:
            case 2:
            case 3:
            case 4:
                return Wrench // Obras
            default:
                return FileText // Assessoria
        }
    }

    const getTipoLabel = (tipoOs: number) => {
        const labels: Record<number, string> = {
            1: 'Laudo Técnico',
            2: 'Laudo Conclusivo',
            3: 'Parecer de Reforma',
            4: 'Parecer Técnico',
            5: 'Visita Técnica Avulsa',
            6: 'Análise de Projeto',
            7: 'Solicitação de Reforma',
            8: 'Problema Reportado',
            11: 'Contrato de Obra',
            12: 'Contrato Assessoria',
            13: 'Contrato Obra Pontual',
        }
        return labels[tipoOs] || 'Serviço'
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                {[1, 2, 3].map(i => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        )
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-semibold">Histórico de Serviços</h2>
                <p className="text-muted-foreground">
                    Acompanhe os serviços realizados para sua empresa
                </p>
            </div>

            {servicos.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum serviço concluído ainda</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="relative">
                    {/* Timeline line */}
                    <div className="absolute left-6 top-0 bottom-0 w-px bg-border" />

                    <div className="space-y-6">
                        {servicos.map((servico) => {
                            const Icon = getTipoIcon(servico.tipo_os)
                            return (
                                <div key={servico.id} className="relative pl-14">
                                    {/* Timeline dot */}
                                    <div className="absolute left-4 top-2 w-5 h-5 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                                        <CheckCircle className="h-3 w-3 text-primary" />
                                    </div>

                                    <Card>
                                        <CardContent className="pt-4 pb-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div className="flex items-start gap-3">
                                                    <div className="p-2 bg-muted rounded-lg">
                                                        <Icon className="h-5 w-5 text-muted-foreground" />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-medium">{getTipoLabel(servico.tipo_os)}</h3>
                                                            <Badge variant="outline" className="text-xs">
                                                                {servico.codigo}
                                                            </Badge>
                                                        </div>
                                                        {servico.descricao && (
                                                            <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                                                                {servico.descricao}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    <Calendar className="h-4 w-4" />
                                                    {servico.data_conclusao
                                                        ? new Date(servico.data_conclusao).toLocaleDateString('pt-BR')
                                                        : new Date(servico.data_criacao).toLocaleDateString('pt-BR')
                                                    }
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </div>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
