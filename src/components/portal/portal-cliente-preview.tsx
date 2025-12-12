/**
 * PortalClientePreview - Preview do portal para administradores
 * 
 * Exibe a mesma interface do portal do cliente, mas usando o clienteId
 * passado como prop ao invés de buscar do usuário logado.
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    Home,
    History,
    FolderOpen,
    HeadphonesIcon,
} from 'lucide-react'
import { supabase } from '@/lib/supabase-client'
import { logger } from '@/lib/utils/logger'

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

interface PortalClientePreviewProps {
    clienteId: string
}

export function PortalClientePreview({ clienteId }: PortalClientePreviewProps) {
    const [cliente, setCliente] = useState<ClienteData | null>(null)
    const [resumo, setResumo] = useState<ResumoPortal | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [activeTab, setActiveTab] = useState('visao-geral')

    useEffect(() => {
        if (clienteId) {
            fetchClienteData()
        }
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

            // Buscar resumo
            // Contar contratos ativos
            const { count: contratosCount } = await supabase
                .from('contratos')
                .select('*', { count: 'exact', head: true })
                .eq('cliente_id', clienteId)
                .eq('status', 'ativo')

            // Contar tickets abertos (OS-07 e OS-08 não concluídas)
            const { count: ticketsCount } = await supabase
                .from('ordens_servico')
                .select('*', { count: 'exact', head: true })
                .eq('cliente_id', clienteId)
                .in('tipo_os', [7, 8])
                .neq('status', 'concluida')

            setResumo({
                statusContrato: clienteData.status === 'ativo' ? 'ativo' : 'inativo',
                ticketsAbertos: ticketsCount || 0,
                proximaVistoria: undefined,
                totalContratos: contratosCount || 1
            })

        } catch (err) {
            logger.error('Erro ao carregar dados do portal:', err)
            setError('Erro ao carregar dados. Tente novamente.')
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return <PreviewLoading />
    }

    if (error || !cliente) {
        return (
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error || 'Cliente não encontrado'}</AlertDescription>
            </Alert>
        )
    }

    return (
        <div className="min-h-[600px] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-lg border p-6">
            {/* Header do Portal */}
            <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                        <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                        <h2 className="text-xl font-semibold">Portal do Cliente</h2>
                        <p className="text-sm text-muted-foreground">{cliente.nome_razao_social}</p>
                    </div>
                </div>
            </div>

            {/* Saudação */}
            <div className="mb-6">
                <h1 className="text-2xl font-semibold">
                    Olá, {cliente.nome_razao_social.split(' ')[0]}! 👋
                </h1>
                <p className="text-muted-foreground">
                    Bem-vindo ao seu portal. Aqui você pode acompanhar seus contratos e serviços.
                </p>
            </div>

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-3 mb-6">
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
            <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10 mb-6">
                <CardContent className="pt-6">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h3 className="font-semibold">Precisa de ajuda?</h3>
                            <p className="text-sm text-muted-foreground">
                                Abra um chamado para solicitar reforma, relatar problema ou tirar dúvidas.
                            </p>
                        </div>
                        <Button className="gap-2" disabled>
                            <Plus className="h-4 w-4" />
                            Abrir Novo Chamado
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Navegação por Abas */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-5 mb-4">
                    <TabsTrigger value="visao-geral" className="gap-2">
                        <Home className="h-4 w-4" />
                        <span className="hidden sm:inline">Visão Geral</span>
                    </TabsTrigger>
                    <TabsTrigger value="contratos" className="gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="hidden sm:inline">Contratos</span>
                    </TabsTrigger>
                    <TabsTrigger value="historico" className="gap-2">
                        <History className="h-4 w-4" />
                        <span className="hidden sm:inline">Histórico</span>
                    </TabsTrigger>
                    <TabsTrigger value="documentos" className="gap-2">
                        <FolderOpen className="h-4 w-4" />
                        <span className="hidden sm:inline">Documentos</span>
                    </TabsTrigger>
                    <TabsTrigger value="suporte" className="gap-2">
                        <HeadphonesIcon className="h-4 w-4" />
                        <span className="hidden sm:inline">Suporte</span>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="visao-geral">
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        <Building2 className="h-5 w-5" />
                                        Dados Cadastrais
                                    </CardTitle>
                                    <CardDescription>
                                        Informações da empresa registradas no sistema
                                    </CardDescription>
                                </div>
                                <Button variant="outline" size="sm" disabled>
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    Solicitar Alteração
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Razão Social</p>
                                        <p className="font-medium">{cliente.nome_razao_social || '-'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">CPF/CNPJ</p>
                                        <p className="font-medium">{cliente.cpf_cnpj || '-'}</p>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <User className="h-4 w-4 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Responsável</p>
                                            <p className="font-medium">{cliente.nome_responsavel || '-'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-2">
                                        <Mail className="h-4 w-4 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">E-mail</p>
                                            <p className="font-medium">{cliente.email || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Phone className="h-4 w-4 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Telefone</p>
                                            <p className="font-medium">{cliente.telefone || '-'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                                        <div>
                                            <p className="text-sm text-muted-foreground">Endereço</p>
                                            <p className="font-medium">
                                                {cliente.endereco?.logradouro ? (
                                                    <>
                                                        {cliente.endereco.logradouro}, {cliente.endereco.numero}
                                                        {cliente.endereco.complemento && ` - ${cliente.endereco.complemento}`}
                                                        <br />
                                                        {cliente.endereco.bairro} - {cliente.endereco.cidade}/{cliente.endereco.estado}
                                                    </>
                                                ) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="contratos">
                    <Card>
                        <CardContent className="pt-6 text-center py-12">
                            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Visualização de contratos</p>
                            <p className="text-sm text-muted-foreground">Os contratos do cliente aparecerão aqui</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="historico">
                    <Card>
                        <CardContent className="pt-6 text-center py-12">
                            <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Histórico de serviços</p>
                            <p className="text-sm text-muted-foreground">Os serviços concluídos aparecerão aqui</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="documentos">
                    <Card>
                        <CardContent className="pt-6 text-center py-12">
                            <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Documentos</p>
                            <p className="text-sm text-muted-foreground">Os documentos disponíveis aparecerão aqui</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="suporte">
                    <Card>
                        <CardContent className="pt-6 text-center py-12">
                            <HeadphonesIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground">Suporte e Chamados</p>
                            <p className="text-sm text-muted-foreground">Os chamados do cliente aparecerão aqui</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

function PreviewLoading() {
    return (
        <div className="p-6 space-y-6 bg-slate-50 rounded-lg border">
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
        </div>
    )
}
