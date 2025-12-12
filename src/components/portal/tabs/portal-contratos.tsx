/**
 * PortalContratosTab - Lista de contratos do cliente
 * 
 * Exibe contratos ativos com opção de download do PDF
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    FileText,
    Download,
    Calendar,
    CheckCircle,
    Clock,
    AlertTriangle,
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { supabase } from '@/lib/supabase-client'
import { logger } from '@/lib/utils/logger'

interface Contrato {
    id: string
    tipo: string
    status: 'ativo' | 'inativo' | 'pendente'
    data_inicio: string
    data_fim?: string
    valor_mensal?: number
    documento_url?: string
}

export function PortalContratosTab() {
    const { currentUser } = useAuth()
    const [contratos, setContratos] = useState<Contrato[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const clienteId = currentUser?.user_metadata?.cliente_id

    useEffect(() => {
        if (clienteId) {
            fetchContratos()
        }
    }, [clienteId])

    const fetchContratos = async () => {
        try {
            setIsLoading(true)

            const { data, error: fetchError } = await supabase
                .from('contratos')
                .select('*')
                .eq('cliente_id', clienteId)
                .order('data_inicio', { ascending: false })

            if (fetchError) throw fetchError
            setContratos(data || [])

        } catch (err) {
            logger.error('Erro ao carregar contratos:', err)
            setError('Erro ao carregar contratos')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = (url: string) => {
        window.open(url, '_blank')
    }

    const getStatusBadge = (status: Contrato['status']) => {
        switch (status) {
            case 'ativo':
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                    </Badge>
                )
            case 'pendente':
                return (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                    </Badge>
                )
            default:
                return (
                    <Badge variant="secondary">
                        Inativo
                    </Badge>
                )
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                {[1, 2].map(i => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <Skeleton className="h-20 w-full" />
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
                <h2 className="text-2xl font-semibold">Meus Contratos</h2>
                <p className="text-muted-foreground">
                    Visualize e faça download dos seus contratos
                </p>
            </div>

            {contratos.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum contrato encontrado</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {contratos.map((contrato) => (
                        <Card key={contrato.id}>
                            <CardContent className="pt-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="p-3 bg-primary/10 rounded-lg">
                                            <FileText className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-semibold">{contrato.tipo}</h3>
                                                {getStatusBadge(contrato.status)}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="h-4 w-4" />
                                                    Início: {new Date(contrato.data_inicio).toLocaleDateString('pt-BR')}
                                                </span>
                                                {contrato.data_fim && (
                                                    <span>
                                                        Fim: {new Date(contrato.data_fim).toLocaleDateString('pt-BR')}
                                                    </span>
                                                )}
                                            </div>
                                            {contrato.valor_mensal && (
                                                <p className="text-sm text-muted-foreground mt-1">
                                                    Valor: R$ {contrato.valor_mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {contrato.documento_url && (
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDownload(contrato.documento_url!)}
                                            className="gap-2"
                                        >
                                            <Download className="h-4 w-4" />
                                            Baixar PDF
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
