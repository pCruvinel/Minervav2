import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { History, Mail, MessageCircle, RefreshCw, Search, Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { logger } from '@/lib/utils/logger';
import { MessageChannel, MessageStatus } from '@/lib/types/messaging';

// ============================================================
// Types
// ============================================================

interface MensagemEnviada {
    id: string;
    canal: MessageChannel;
    destinatario_nome: string;
    destinatario_contato: string;
    assunto: string | null;
    corpo: string;
    status: MessageStatus;
    erro_mensagem: string | null;
    contexto_tipo: string | null;
    contexto_id: string | null;
    enviado_em: string;
    usuario_id: string;
    usuario_nome?: string;
}

// ============================================================
// Component
// ============================================================

export function MessageHistory() {
    const [mensagens, setMensagens] = useState<MensagemEnviada[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCanal, setFilterCanal] = useState<MessageChannel | 'all'>('all');
    const [filterStatus, setFilterStatus] = useState<MessageStatus | 'all'>('all');

    const pageSize = 15;
    const totalPages = Math.ceil(totalCount / pageSize);

    const fetchMensagens = useCallback(async () => {
        setIsLoading(true);
        try {
            let query = supabase
                .from('mensagens_enviadas')
                .select('*', { count: 'exact' })
                .order('enviado_em', { ascending: false })
                .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

            if (filterCanal !== 'all') {
                query = query.eq('canal', filterCanal);
            }
            if (filterStatus !== 'all') {
                query = query.eq('status', filterStatus);
            }
            if (searchTerm) {
                query = query.or(`destinatario_nome.ilike.%${searchTerm}%,destinatario_contato.ilike.%${searchTerm}%`);
            }

            const { data, count, error } = await query;

            if (error) throw error;

            const formattedData = data?.map((m) => ({
                ...m,
                usuario_nome: 'Sistema', // Simplify - no FK join
            })) || [];

            setMensagens(formattedData);
            setTotalCount(count || 0);
        } catch (err) {
            logger.error('[MessageHistory] Error:', err);
            toast.error('Erro ao carregar histórico de mensagens');
        } finally {
            setIsLoading(false);
        }
    }, [currentPage, filterCanal, filterStatus, searchTerm]);

    useEffect(() => {
        fetchMensagens();
    }, [fetchMensagens]);

    const formatDateTime = (dateString: string) => {
        return new Date(dateString).toLocaleString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="flex items-center gap-2">
                        <History className="h-5 w-5" />
                        Histórico de Mensagens
                    </CardTitle>
                    <CardDescription>
                        Registro de todas as mensagens enviadas pelo sistema
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={fetchMensagens} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Atualizar
                </Button>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* Filters */}
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Buscar por nome ou contato..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9"
                        />
                    </div>

                    <Select value={filterCanal} onValueChange={(v) => setFilterCanal(v as MessageChannel | 'all')}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Canal" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos canais</SelectItem>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="whatsapp">WhatsApp</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as MessageStatus | 'all')}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos status</SelectItem>
                            <SelectItem value="enviado">Enviado</SelectItem>
                            <SelectItem value="falhou">Falhou</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                ) : mensagens.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                        <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhuma mensagem encontrada</p>
                    </div>
                ) : (
                    <>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Canal</TableHead>
                                    <TableHead>Destinatário</TableHead>
                                    <TableHead>Assunto/Prévia</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Enviado Em</TableHead>
                                    <TableHead>Por</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {mensagens.map((msg) => (
                                    <TableRow key={msg.id}>
                                        <TableCell>
                                            <Badge variant={msg.canal === 'email' ? 'default' : 'secondary'}>
                                                {msg.canal === 'email' ? (
                                                    <Mail className="mr-1 h-3 w-3" />
                                                ) : (
                                                    <MessageCircle className="mr-1 h-3 w-3" />
                                                )}
                                                {msg.canal === 'email' ? 'Email' : 'WhatsApp'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium text-sm">{msg.destinatario_nome}</p>
                                                <p className="text-xs text-muted-foreground">{msg.destinatario_contato}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <p className="text-sm truncate">
                                                {msg.assunto || msg.corpo.slice(0, 50)}
                                                {!msg.assunto && msg.corpo.length > 50 ? '...' : ''}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={msg.status === 'enviado' ? 'outline' : 'destructive'}>
                                                {msg.status === 'enviado' ? (
                                                    <CheckCircle className="mr-1 h-3 w-3 text-success" />
                                                ) : (
                                                    <XCircle className="mr-1 h-3 w-3" />
                                                )}
                                                {msg.status === 'enviado' ? 'Enviado' : 'Falhou'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {formatDateTime(msg.enviado_em)}
                                        </TableCell>
                                        <TableCell className="text-sm">
                                            {msg.usuario_nome}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between">
                                <p className="text-sm text-muted-foreground">
                                    Mostrando {((currentPage - 1) * pageSize) + 1} a {Math.min(currentPage * pageSize, totalCount)} de {totalCount} mensagens
                                </p>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => p - 1)}
                                        disabled={currentPage === 1}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                    </Button>
                                    <span className="text-sm">
                                        Página {currentPage} de {totalPages}
                                    </span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setCurrentPage(p => p + 1)}
                                        disabled={currentPage === totalPages}
                                    >
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
}
