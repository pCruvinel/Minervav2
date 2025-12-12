/**
 * PortalClientePage - Página principal do Portal do Cliente
 * 
 * Exibe:
 * - Painel superior com resumo (Status do Contrato, Tickets Abertos, Próxima Vistoria)
 * - Botão de destaque "Abrir Novo Chamado"
 * - Aba de Visão Geral com dados do cliente
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
    CheckCircle,
    AlertTriangle,
    Calendar,
    FileText,
    Phone,
    Mail,
    MapPin,
    Building2,
    User,
    Plus,
    ExternalLink,
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { supabase } from '@/lib/supabase-client'
import { logger } from '@/lib/utils/logger'
import { useRouter } from '@tanstack/react-router'

interface ClienteData {
    id: string
    nome_razao_social: string
    email: string
    telefone?: string
    cpf_cnpj?: string
    endereco?: {
        logradouro?: string
        numero?: string
        complemento?: string
        bairro?: string
        cidade?: string
        estado?: string
        cep?: string
    }
    nome_responsavel?: string
    status: string
}

interface ResumoPortal {
    statusContrato: 'ativo' | 'inativo' | 'pendente'
    ticketsAbertos: number
    proximaVistoria?: string
    totalContratos: number
}

export function PortalClientePage() {
    const { currentUser } = useAuth()
    const router = useRouter()
    const [cliente, setCliente] = useState<ClienteData | null>(null)
    const [resumo, setResumo] = useState<ResumoPortal | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const clienteId = currentUser?.user_metadata?.cliente_id

    useEffect(() => {
        if (!clienteId) {
            setError('Dados do cliente não encontrados')
            setIsLoading(false)
            return
        }

        fetchClienteData()
    }, [clienteId])

    const fetchClienteData = async () => {
        try {
            setIsLoading(true)

            // Buscar dados do cliente
            const { data: clienteData, error: clienteError } = await supabase
                .from('clientes')
                .select('*')
                .eq('id', clienteId)
                .single()

            if (clienteError) throw clienteError
            setCliente(clienteData)

            // Buscar resumo (contratos, tickets, próxima vistoria)
            // Por enquanto usamos dados mock, depois integrar com queries reais
            setResumo({
                statusContrato: clienteData.status === 'ativo' ? 'ativo' : 'inativo',
                ticketsAbertos: 0,
                proximaVistoria: undefined,
                totalContratos: 1
            })

        } catch (err) {
            logger.error('Erro ao carregar dados do portal:', err)
            setError('Erro ao carregar dados. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleAbrirChamado = () => {
        router.navigate({ to: '/portal/suporte' })
    }

    const handleSolicitarAlteracao = () => {
        router.navigate({ to: '/portal/suporte' })
    }

    if (isLoading) {
        return <PortalLoading />
    }

    if (error) {
        return (
            <div className="space-y-6">
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    const nomeCliente = cliente?.nome_razao_social || currentUser?.user_metadata?.full_name || 'Cliente'

    return (
        <div className="space-y-6">
            {/* Saudação */}
            <div>
                <h1 className="text-2xl font-semibold">
                    Olá, {nomeCliente.split(' ')[0]}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Bem-vindo ao seu portal. Aqui você pode acompanhar seus contratos e serviços.
                </p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-3">
                {/* Status do Contrato */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Status do Contrato</p>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center gap-2">
                            {resumo?.statusContrato === 'ativo' ? (
                                <>
                                    <CheckCircle className="h-5 w-5 text-emerald-500" />
                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                        Ativo
                                    </Badge>
                                </>
                            ) : (
                                <>
                                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                                        {resumo?.statusContrato === 'pendente' ? 'Pendente' : 'Inativo'}
                                    </Badge>
                                </>
                            )}
                        </div>
                        {resumo?.totalContratos && resumo.totalContratos > 1 && (
                            <p className="text-xs text-muted-foreground mt-2">
                                +{resumo.totalContratos - 1} contrato(s)
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Tickets Abertos */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Chamados Abertos</p>
                            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-bold">{resumo?.ticketsAbertos || 0}</span>
                            <span className="text-sm text-muted-foreground">pendentes</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Próxima Vistoria */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Próxima Vistoria</p>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {resumo?.proximaVistoria ? (
                            <p className="text-lg font-medium">
                                {new Date(resumo.proximaVistoria).toLocaleDateString('pt-BR', {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric'
                                })}
                            </p>
                        ) : (
                            <p className="text-muted-foreground">Não agendada</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Botão Abrir Chamado */}
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold">Precisa de ajuda?</h3>
                            <p className="text-sm text-muted-foreground">
                                Abra um chamado para solicitar reforma, relatar problema ou tirar dúvidas.
                            </p>
                        </div>
                        <Button onClick={handleAbrirChamado} className="gap-2">
                            <Plus className="h-4 w-4" />
                            Abrir Novo Chamado
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Dados Cadastrais - Visão Geral */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Building2 className="h-5 w-5" />
                                Dados Cadastrais
                            </CardTitle>
                            <CardDescription>
                                Informações da sua empresa registradas no sistema
                            </CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleSolicitarAlteracao}>
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Solicitar Alteração
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        {/* Coluna 1 - Identificação */}
                        <div className="space-y-4">
                            <div>
                                <p className="text-sm text-muted-foreground">Razão Social</p>
                                <p className="font-medium">{cliente?.nome_razao_social || '-'}</p>
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                                <p className="font-medium">{cliente?.cpf_cnpj || '-'}</p>
                            </div>
                            <div className="flex items-start gap-2">
                                <User className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Responsável</p>
                                    <p className="font-medium">{cliente?.nome_responsavel || '-'}</p>
                                </div>
                            </div>
                        </div>

                        {/* Coluna 2 - Contato */}
                        <div className="space-y-4">
                            <div className="flex items-start gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">E-mail</p>
                                    <p className="font-medium">{cliente?.email || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Telefone</p>
                                    <p className="font-medium">{cliente?.telefone || '-'}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                <div>
                                    <p className="text-sm text-muted-foreground">Endereço</p>
                                    <p className="font-medium">
                                        {cliente?.endereco ? (
                                            <>
                                                {cliente.endereco.logradouro}, {cliente.endereco.numero}
                                                {cliente.endereco.complemento && ` - ${cliente.endereco.complemento}`}
                                                <br />
                                                {cliente.endereco.bairro} - {cliente.endereco.cidade}/{cliente.endereco.estado}
                                                <br />
                                                CEP: {cliente.endereco.cep}
                                            </>
                                        ) : (
                                            '-'
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

function PortalLoading() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-72" />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
                {[1, 2, 3].map(i => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <Skeleton className="h-4 w-24 mb-2" />
                            <Skeleton className="h-6 w-16" />
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card>
                <CardContent className="pt-6">
                    <Skeleton className="h-12 w-full" />
                </CardContent>
            </Card>
        </div>
    )
}
