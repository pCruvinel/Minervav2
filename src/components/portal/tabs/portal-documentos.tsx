/**
 * PortalDocumentosTab - Biblioteca de documentos para download
 * 
 * Exibe documentos públicos/cliente para download
 */

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Input } from '@/components/ui/input'
import {
    FileText,
    Download,
    Calendar,
    AlertTriangle,
    FolderOpen,
    Search,
    FileImage,
    File,
} from 'lucide-react'
import { useAuth } from '@/lib/contexts/auth-context'
import { supabase } from '@/lib/supabase-client'
import { logger } from '@/lib/utils/logger'

interface Documento {
    id: string
    nome: string
    tipo: string
    url: string
    tamanho?: number
    created_at: string
    os_codigo?: string
}

export function PortalDocumentosTab() {
    const { currentUser } = useAuth()
    const [documentos, setDocumentos] = useState<Documento[]>([])
    const [filteredDocs, setFilteredDocs] = useState<Documento[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const clienteId = currentUser?.user_metadata?.cliente_id

    useEffect(() => {
        if (clienteId) {
            fetchDocumentos()
        }
    }, [clienteId])

    useEffect(() => {
        if (searchQuery) {
            setFilteredDocs(
                documentos.filter(d =>
                    d.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    d.tipo.toLowerCase().includes(searchQuery.toLowerCase())
                )
            )
        } else {
            setFilteredDocs(documentos)
        }
    }, [searchQuery, documentos])

    const fetchDocumentos = async () => {
        try {
            setIsLoading(true)

            // Buscar documentos vinculados ao cliente
            // TODO: Quando campo visibilidade for adicionado, filtrar por visibilidade = 'cliente' ou 'publico'
            const { data, error: fetchError } = await supabase
                .from('os_documentos')
                .select(`
          id,
          nome,
          tipo,
          url,
          tamanho,
          created_at,
          ordens_servico!inner(codigo, cliente_id)
        `)
                .eq('ordens_servico.cliente_id', clienteId)
                .order('created_at', { ascending: false })

            if (fetchError) throw fetchError

            setDocumentos((data || []).map(d => ({
                id: d.id,
                nome: d.nome,
                tipo: d.tipo || 'Documento',
                url: d.url,
                tamanho: d.tamanho,
                created_at: d.created_at,
                os_codigo: (d.ordens_servico as any)?.codigo,
            })))

        } catch (err) {
            logger.error('Erro ao carregar documentos:', err)
            setError('Erro ao carregar documentos')
        } finally {
            setIsLoading(false)
        }
    }

    const handleDownload = (url: string) => {
        window.open(url, '_blank')
    }

    const getFileIcon = (nome: string) => {
        const ext = nome.split('.').pop()?.toLowerCase()
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
            return FileImage
        }
        if (['pdf'].includes(ext || '')) {
            return FileText
        }
        return File
    }

    const formatFileSize = (bytes?: number) => {
        if (!bytes) return '-'
        if (bytes < 1024) return bytes + ' B'
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
    }

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-full max-w-sm" />
                {[1, 2, 3].map(i => (
                    <Card key={i}>
                        <CardContent className="pt-6">
                            <Skeleton className="h-12 w-full" />
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
                <h2 className="text-2xl font-semibold">Documentos</h2>
                <p className="text-muted-foreground">
                    Acesse e baixe seus documentos
                </p>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Buscar documento..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                />
            </div>

            {filteredDocs.length === 0 ? (
                <Card>
                    <CardContent className="pt-6 text-center py-12">
                        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <p className="text-muted-foreground">
                            {searchQuery ? 'Nenhum documento encontrado' : 'Nenhum documento disponível'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredDocs.map((doc) => {
                        const Icon = getFileIcon(doc.nome)
                        return (
                            <Card key={doc.id} className="hover:border-primary/50 transition-colors">
                                <CardContent className="py-4">
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="p-2 bg-muted rounded-lg shrink-0">
                                                <Icon className="h-5 w-5 text-muted-foreground" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{doc.nome}</p>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <span>{doc.tipo}</span>
                                                    <span>{formatFileSize(doc.tamanho)}</span>
                                                    {doc.os_codigo && (
                                                        <Badge variant="outline" className="text-xs">
                                                            {doc.os_codigo}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0">
                                            <span className="text-xs text-muted-foreground hidden sm:inline">
                                                {new Date(doc.created_at).toLocaleDateString('pt-BR')}
                                            </span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDownload(doc.url)}
                                            >
                                                <Download className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
