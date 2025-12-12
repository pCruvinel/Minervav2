/**
 * PortalSuporteTab - Suporte e Chamados
 * 
 * Exibe histórico de chamados e formulário para novos (OS-07, OS-08)
 */

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import {
    HeadphonesIcon,
    Plus,
    AlertTriangle,
    Clock,
    CheckCircle,
    Wrench,
    MessageCircle,
    Calendar,
    Loader2,
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { supabase } from '@/lib/supabase-client'
import { logger } from '@/lib/utils/logger'
import { toast } from 'sonner'

interface Chamado {
    id: string
    codigo: string
    tipo: 'reforma' | 'problema'
    descricao: string
    status: 'pendente' | 'em_andamento' | 'concluido'
    created_at: string
}

type TipoChamado = 'reforma' | 'problema'

export function PortalSuporteTab() {
    const { currentUser } = useAuth()
    const [chamados, setChamados] = useState<Chamado[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Form state
    const [dialogOpen, setDialogOpen] = useState(false)
    const [tipoChamado, setTipoChamado] = useState<TipoChamado>('problema')
    const [descricao, setDescricao] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)

    const clienteId = currentUser?.user_metadata?.cliente_id

    useEffect(() => {
        if (clienteId) {
            fetchChamados()
        }
    }, [clienteId])

    const fetchChamados = async () => {
        try {
            setIsLoading(true)

            // Buscar OS-07 e OS-08 do cliente
            const { data, error: fetchError } = await supabase
                .from('ordens_servico')
                .select('id, codigo, tipo, descricao, status, created_at, tipo_os')
                .eq('cliente_id', clienteId)
                .in('tipo_os', [7, 8])
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            setChamados((data || []).map(os => ({
                id: os.id,
                codigo: os.codigo,
                tipo: os.tipo_os === 7 ? 'reforma' : 'problema',
                descricao: os.descricao || '',
                status: os.status === 'concluida' ? 'concluido' :
                    os.status === 'em_andamento' ? 'em_andamento' : 'pendente',
                created_at: os.created_at,
            })))

        } catch (err) {
            logger.error('Erro ao carregar chamados:', err)
            setError('Erro ao carregar chamados')
        } finally {
            setIsLoading(false)
        }
    }

    const handleSubmit = async () => {
        if (!descricao.trim()) {
            toast.error('Por favor, descreva seu chamado')
            return
        }

        setIsSubmitting(true)

        try {
            // Criar OS-07 ou OS-08
            const tipoOs = tipoChamado === 'reforma' ? 7 : 8
            const tipoLabel = tipoChamado === 'reforma' ? 'Solicitação de Reforma' : 'Problema Reportado'

            const { error: insertError } = await supabase
                .from('ordens_servico')
                .insert({
                    tipo_os: tipoOs,
                    tipo: tipoLabel,
                    descricao: descricao.trim(),
                    cliente_id: clienteId,
                    status: 'pendente',
                    setor: 'obras',
                })

            if (insertError) throw insertError

            toast.success('Chamado aberto com sucesso!')
            setDialogOpen(false)
            setDescricao('')
            setTipoChamado('problema')

            // Recarregar lista
            fetchChamados()

        } catch (err) {
            logger.error('Erro ao criar chamado:', err)
            toast.error('Erro ao abrir chamado. Tente novamente.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const getStatusBadge = (status: Chamado['status']) => {
        switch (status) {
            case 'concluido':
                return (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Concluído
                    </Badge>
                )
            case 'em_andamento':
                return (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Em Andamento
                    </Badge>
                )
            default:
                return (
                    <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                        <Clock className="h-3 w-3 mr-1" />
                        Pendente
                    </Badge>
                )
        }
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-24 w-full" />
                {[1, 2].map(i => (
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
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-semibold">Suporte e Chamados</h2>
                    <p className="text-muted-foreground">
                        Abra chamados e acompanhe suas solicitações
                    </p>
                </div>

                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Novo Chamado
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Abrir Novo Chamado</DialogTitle>
                            <DialogDescription>
                                Descreva sua solicitação e nossa equipe entrará em contato.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4">
                            <div className="space-y-3">
                                <Label>Tipo de Chamado</Label>
                                <RadioGroup
                                    value={tipoChamado}
                                    onValueChange={(v) => setTipoChamado(v as TipoChamado)}
                                    className="grid grid-cols-2 gap-4"
                                >
                                    <div>
                                        <RadioGroupItem value="problema" id="problema" className="peer sr-only" />
                                        <Label
                                            htmlFor="problema"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                        >
                                            <AlertTriangle className="mb-3 h-6 w-6" />
                                            <span className="text-sm font-medium">Relatar Problema</span>
                                        </Label>
                                    </div>
                                    <div>
                                        <RadioGroupItem value="reforma" id="reforma" className="peer sr-only" />
                                        <Label
                                            htmlFor="reforma"
                                            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                        >
                                            <Wrench className="mb-3 h-6 w-6" />
                                            <span className="text-sm font-medium">Solicitar Reforma</span>
                                        </Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="descricao">Descrição</Label>
                                <Textarea
                                    id="descricao"
                                    placeholder={tipoChamado === 'problema'
                                        ? "Descreva o problema encontrado..."
                                        : "Descreva a reforma que deseja realizar..."
                                    }
                                    value={descricao}
                                    onChange={(e) => setDescricao(e.target.value)}
                                    rows={4}
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Enviando...
                                    </>
                                ) : (
                                    'Abrir Chamado'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {chamados.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">Nenhum chamado aberto</p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Clique em "Novo Chamado" para abrir uma solicitação
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {chamados.map((chamado) => (
                        <Card key={chamado.id}>
                            <CardContent className="py-4">
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                                    <div className="flex items-start gap-3">
                                        <div className={`p-2 rounded-lg ${chamado.tipo === 'reforma' ? 'bg-blue-100' : 'bg-amber-100'}`}>
                                            {chamado.tipo === 'reforma' ? (
                                                <Wrench className={`h-5 w-5 ${chamado.tipo === 'reforma' ? 'text-blue-600' : 'text-amber-600'}`} />
                                            ) : (
                                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <h3 className="font-medium">
                                                    {chamado.tipo === 'reforma' ? 'Solicitação de Reforma' : 'Problema Reportado'}
                                                </h3>
                                                <Badge variant="outline" className="text-xs">
                                                    {chamado.codigo}
                                                </Badge>
                                                {getStatusBadge(chamado.status)}
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-2">
                                                {chamado.descricao}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                                        <Calendar className="h-4 w-4" />
                                        {new Date(chamado.created_at).toLocaleDateString('pt-BR')}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
