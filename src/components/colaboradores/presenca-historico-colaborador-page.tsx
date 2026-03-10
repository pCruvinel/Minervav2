import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase-client';
import { format, parseISO, startOfMonth, endOfMonth, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, XCircle, Clock, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useParams, useRouter } from '@tanstack/react-router';
import { ModalAbonarFalta } from './modals/modal-abonar-falta';
import { formatMinutosAtraso } from '@/lib/constants/colaboradores';
import { useAuth } from '@/lib/contexts/auth-context';

interface RegistroPresencaHistorico {
    id: string;
    colaborador_id: string;
    data: string;
    status: 'OK' | 'ATRASADO' | 'FALTA';
    justificativa?: string;
    is_abonada?: boolean;
    motivo_abono?: string;
    performance?: 'OTIMA' | 'BOA' | 'REGULAR' | 'RUIM';
    performance_justificativa?: string;
    centros_custo: string[];
    minutos_atraso?: number;
}

export function PresencaHistoricoColaboradorPage() {
    // we assume the route will provide colaboradorId
    const { colaboradorId } = useParams({ strict: false }) as { colaboradorId: string };
    const router = useRouter();
    
    const [mesAno, setMesAno] = useState<string>(format(new Date(), 'yyyy-MM'));
    const [registroAbonoId, setRegistroAbonoId] = useState<string | null>(null);
    const queryClient = useQueryClient();
    const { currentUser } = useAuth();
    
    const isDiretor = currentUser?.cargo_slug === 'diretor' || currentUser?.setor_slug === 'diretoria';

    // Load Colaborador
    const { data: colaborador, isLoading: loadingColab } = useQuery({
        queryKey: ['colaborador', colaboradorId],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('colaboradores')
                .select('*')
                .eq('id', colaboradorId)
                .single();
                
            if (error) throw error;
            return data;
        },
        enabled: !!colaboradorId
    });

    // Load Presencas
    const { data: registros = [], isLoading: loadingRegistros } = useQuery({
        queryKey: ['presencas-detalhes', colaboradorId, mesAno],
        queryFn: async () => {
            const date = parseISO(`${mesAno}-01`);
            if (!isValid(date)) return [];
            
            const startDate = format(startOfMonth(date), 'yyyy-MM-dd');
            const endDate = format(endOfMonth(date), 'yyyy-MM-dd');

            const { data, error } = await supabase
                .from('registros_presenca')
                .select('*')
                .eq('colaborador_id', colaboradorId)
                .gte('data', startDate)
                .lte('data', endDate)
                .order('data', { ascending: false });

            if (error) throw error;
            return data as RegistroPresencaHistorico[];
        },
        enabled: !!colaboradorId && !!mesAno
    });

    const abonarFalta = useMutation({
        mutationFn: async ({ id, motivo, anexo_url }: { id: string, motivo: string, anexo_url: string | null }) => {
            const { error } = await supabase
                .from('registros_presenca')
                .update({ 
                    is_abonada: true, 
                    motivo_abono: motivo,
                    abono_anexo_url: anexo_url,
                    abono_editado_por: currentUser?.nome_completo || currentUser?.email || 'Sistema',
                    abono_editado_em: new Date().toISOString()
                })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Falta abonada com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['presencas-detalhes', colaboradorId, mesAno] });
            setRegistroAbonoId(null);
        },
        onError: (err) => {
            toast.error('Erro ao abonar falta: ' + err.message);
        }
    });

    const reverterAbono = useMutation({
        mutationFn: async ({ id }: { id: string }) => {
            const { error } = await supabase
                .from('registros_presenca')
                .update({ 
                    is_abonada: false, 
                    motivo_abono: null,
                    abono_anexo_url: null,
                    abono_editado_por: currentUser?.nome_completo || currentUser?.email || 'Sistema',
                    abono_editado_em: new Date().toISOString()
                })
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('Abono revertido com sucesso!');
            queryClient.invalidateQueries({ queryKey: ['presencas-detalhes', colaboradorId, mesAno] });
        },
        onError: (err) => {
            toast.error('Erro ao reverter abono: ' + err.message);
        }
    });

    const handleAbonarFalta = async (motivo: string, anexo: File | null) => {
        if (!registroAbonoId) return;

        let anexo_url = null;
        if (anexo) {
            const fileExt = anexo.name.split('.').pop() || 'pdf';
            const filePath = `abonos/${colaboradorId}/${registroAbonoId}_${Date.now()}.${fileExt}`;
            const { error: uploadError } = await supabase.storage
                .from('documentos-colaboradores')
                .upload(filePath, anexo, { upsert: true });

            if (uploadError) {
                toast.error('Erro ao fazer upload do anexo: ' + uploadError.message);
                return;
            }
            anexo_url = filePath;
        }

        abonarFalta.mutate({ id: registroAbonoId, motivo, anexo_url });
    };

    const getStatusBadge = (reg: RegistroPresencaHistorico) => {
        switch (reg.status) {
            case 'OK':
                return (
                    <Badge className="bg-success/10 text-success border-success/30 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Presente
                    </Badge>
                );
            case 'FALTA':
                if (reg.is_abonada) {
                    return (
                        <Badge className="bg-muted text-muted-foreground border-muted-foreground/30 gap-1" title={reg.motivo_abono}>
                            <CheckCircle2 className="h-3 w-3" />
                            Falta Abonada
                        </Badge>
                    );
                }
                return (
                    <Badge className="bg-destructive/10 text-destructive border-destructive/30 gap-1">
                        <XCircle className="h-3 w-3" />
                        Falta
                    </Badge>
                );
            case 'ATRASADO':
                return (
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/30 gap-1">
                        <Clock className="h-3 w-3" />
                        Atrasado
                    </Badge>
                );
            default:
                return <Badge variant="outline">{reg.status}</Badge>;
        }
    };

    if (loadingColab) {
        return <div className="p-6">Carregando dados do colaborador...</div>;
    }

    if (!colaborador) {
        return <div className="p-6">Colaborador não encontrado.</div>;
    }

    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={() => router.history.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                    <h1 className="text-3xl font-bold tracking-tight">Histórico de Presença</h1>
                    <p className="text-muted-foreground">
                        {colaborador?.nome_completo || colaborador?.nome} - Detalhamento de Frequência
                    </p>
                </div>
                </div>
                <div className="flex items-center gap-2">
                    <Input 
                        type="month" 
                        value={mesAno}
                        onChange={(e) => setMesAno(e.target.value)}
                        className="w-auto"
                    />
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Registros do Mês</CardTitle>
                </CardHeader>
                <CardContent>
                    {loadingRegistros ? (
                        <div className="py-4 text-center text-muted-foreground">Carregando registros...</div>
                    ) : registros.length === 0 ? (
                        <div className="py-8 text-center text-muted-foreground border border-dashed rounded-lg">
                            Nenhum registro de presença encontrado neste mês.
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Data</TableHead>
                                        <TableHead>Dia da Semana</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Performance</TableHead>
                                        <TableHead>Justificativa / Abono</TableHead>
                                        <TableHead className="w-[100px]">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registros.map((reg) => {
                                        const parsedDate = parseISO(reg.data);
                                        return (
                                            <TableRow key={reg.id}>
                                                <TableCell className="font-medium whitespace-nowrap">
                                                    {format(parsedDate, 'dd/MM/yyyy')}
                                                </TableCell>
                                                <TableCell className="capitalize whitespace-nowrap">
                                                    {format(parsedDate, 'EEEE', { locale: ptBR })}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1 items-start">
                                                        {getStatusBadge(reg)}
                                                        {reg.status === 'ATRASADO' && reg.minutos_atraso && (
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatMinutosAtraso(reg.minutos_atraso)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {reg.performance ? (
                                                        <Badge variant="outline" className="text-xs">
                                                            {reg.performance}
                                                        </Badge>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate" title={reg.justificativa || reg.motivo_abono || ''}>
                                                    {reg.status === 'FALTA' && reg.is_abonada ? (
                                                        <span className="text-sm text-foreground">
                                                            <span className="font-semibold text-muted-foreground mr-1">Abono:</span>
                                                            {reg.motivo_abono}
                                                        </span>
                                                    ) : reg.justificativa ? (
                                                        <span className="text-sm text-foreground">
                                                            {reg.justificativa}
                                                        </span>
                                                    ) : '-'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        {reg.status === 'FALTA' && !reg.is_abonada && (
                                                            <Button 
                                                                variant="outline" 
                                                                size="sm" 
                                                                onClick={() => setRegistroAbonoId(reg.id)}
                                                            >
                                                                Abonar
                                                            </Button>
                                                        )}
                                                        {reg.status === 'FALTA' && reg.is_abonada && isDiretor && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                className="text-destructive hover:bg-destructive/10"
                                                                onClick={() => {
                                                                    if(window.confirm('Deseja realmente reverter este abono?')) {
                                                                        reverterAbono.mutate({ id: reg.id });
                                                                    }
                                                                }}
                                                                disabled={reverterAbono.isPending}
                                                            >
                                                                Reverter Abono
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <ModalAbonarFalta 
                isOpen={!!registroAbonoId}
                onClose={() => setRegistroAbonoId(null)}
                onConfirm={handleAbonarFalta}
                isLoading={abonarFalta.isPending}
            />
        </div>
    );
}
