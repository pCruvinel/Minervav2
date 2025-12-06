/**
 * WeeklyCalendarWidget - Resumo da Semana
 * 
 * Exibe agendamentos da semana atual do usuário logado
 */
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/auth-context';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from '@tanstack/react-router';
import { format, startOfWeek, endOfWeek, isToday } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================
// TIPOS
// ============================================================

interface Agendamento {
    id: string;
    data: string;
    horario_inicio: string;
    horario_fim?: string;
    categoria: string;
    setor: string;
    cliente_nome?: string;
    codigo_os?: string;
}

// ============================================================
// COMPONENTE
// ============================================================

export function WeeklyCalendarWidget() {
    const { currentUser } = useAuth();
    const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAgendamentos() {
            if (!currentUser?.id) return;

            try {
                const hoje = new Date();
                const inicioSemana = startOfWeek(hoje, { weekStartsOn: 0 });
                const fimSemana = endOfWeek(hoje, { weekStartsOn: 0 });

                const { data, error } = await supabase
                    .from('agendamentos')
                    .select(`
            id,
            data,
            horario_inicio,
            horario_fim,
            categoria,
            setor,
            ordens_servico:os_id(
              codigo_os,
              clientes:cliente_id(nome_razao_social)
            )
          `)
                    .eq('responsavel_id', currentUser.id)
                    .gte('data', inicioSemana.toISOString().split('T')[0])
                    .lte('data', fimSemana.toISOString().split('T')[0])
                    .in('status', ['confirmado', 'realizado'])
                    .order('data', { ascending: true })
                    .order('horario_inicio', { ascending: true })
                    .limit(10);

                if (error) throw error;

                setAgendamentos(
                    (data || []).map((a: any) => ({
                        ...a,
                        cliente_nome: a.ordens_servico?.clientes?.nome_razao_social,
                        codigo_os: a.ordens_servico?.codigo_os
                    }))
                );
            } catch (err) {
                console.warn('[WeeklyCalendarWidget] Erro ao carregar:', err);
                setAgendamentos([]);
            } finally {
                setLoading(false);
            }
        }

        fetchAgendamentos();
    }, [currentUser?.id]);

    // Skeleton loader
    if (loading) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent className="space-y-3">
                    {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                    ))}
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                    Minha Semana
                </CardTitle>
                <CardDescription>
                    {format(new Date(), "'Semana de' dd/MM", { locale: ptBR })}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto">
                {agendamentos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Calendar className="h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">Nenhum agendamento esta semana</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {agendamentos.map((ag) => {
                            const dataAg = new Date(ag.data + 'T00:00:00');
                            const isHoje = isToday(dataAg);

                            return (
                                <div
                                    key={ag.id}
                                    className={`p-3 rounded-lg border transition-colors ${isHoje
                                            ? 'bg-primary/5 border-primary/20'
                                            : 'bg-muted/30 hover:bg-muted/50'
                                        }`}
                                >
                                    <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className={`text-xs font-medium px-2 py-0.5 rounded ${isHoje ? 'bg-primary text-primary-foreground' : 'bg-muted'
                                                }`}>
                                                {format(dataAg, 'EEE', { locale: ptBR })}
                                            </div>
                                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                            <span className="text-sm">{ag.horario_inicio?.slice(0, 5)}</span>
                                        </div>
                                    </div>
                                    <div className="mt-1.5 text-sm font-medium truncate">
                                        {ag.categoria} - {ag.setor}
                                    </div>
                                    {ag.cliente_nome && (
                                        <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                                            <User className="h-3 w-3" />
                                            <span className="truncate">{ag.cliente_nome}</span>
                                        </div>
                                    )}
                                    {ag.codigo_os && (
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {ag.codigo_os}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>

            <CardFooter className="pt-2 border-t">
                <Link
                    to="/calendario"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                    Ver Agenda Completa
                    <ArrowRight className="h-4 w-4" />
                </Link>
            </CardFooter>
        </Card>
    );
}
