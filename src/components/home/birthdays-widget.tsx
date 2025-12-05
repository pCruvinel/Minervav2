/**
 * BirthdaysWidget - Aniversariantes do Mês
 * 
 * Exibe colaboradores que fazem aniversário no mês atual
 */
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Cake, PartyPopper } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// ============================================================
// TIPOS
// ============================================================

interface Aniversariante {
    id: string;
    nome_completo: string;
    avatar_url?: string;
    data_nascimento: string;
    dia: number;
}

// ============================================================
// COMPONENTE
// ============================================================

export function BirthdaysWidget() {
    const [aniversariantes, setAniversariantes] = useState<Aniversariante[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAniversariantes() {
            try {
                const mesAtual = new Date().getMonth() + 1;

                // Buscar colaboradores com data_nascimento no mês atual
                const { data, error } = await supabase
                    .from('colaboradores')
                    .select('id, nome_completo, avatar_url, data_nascimento')
                    .eq('ativo', true)
                    .not('data_nascimento', 'is', null);

                if (error) throw error;

                // Filtrar pelo mês atual e ordenar por dia
                const aniversariantesDoMes = (data || [])
                    .filter((c: any) => {
                        if (!c.data_nascimento) return false;
                        const dataNasc = new Date(c.data_nascimento);
                        return dataNasc.getMonth() + 1 === mesAtual;
                    })
                    .map((c: any) => ({
                        ...c,
                        dia: new Date(c.data_nascimento).getDate()
                    }))
                    .sort((a: any, b: any) => a.dia - b.dia);

                setAniversariantes(aniversariantesDoMes);
            } catch (err) {
                console.warn('[BirthdaysWidget] Erro ao carregar:', err);
                setAniversariantes([]);
            } finally {
                setLoading(false);
            }
        }

        fetchAniversariantes();
    }, []);

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
                        <div key={i} className="flex items-center gap-3">
                            <Skeleton className="h-10 w-10 rounded-full" />
                            <Skeleton className="h-4 w-32" />
                        </div>
                    ))}
                </CardContent>
            </Card>
        );
    }

    const hoje = new Date().getDate();
    const mesNome = format(new Date(), 'MMMM', { locale: ptBR });

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Cake className="h-5 w-5 text-primary" />
                    Aniversariantes
                </CardTitle>
                <CardDescription className="capitalize">
                    {mesNome}
                </CardDescription>
            </CardHeader>

            <CardContent className="flex-1 overflow-auto">
                {aniversariantes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                        <Cake className="h-10 w-10 mb-2 opacity-30" />
                        <p className="text-sm">Nenhum aniversariante este mês</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {aniversariantes.map((pessoa) => {
                            const isHoje = pessoa.dia === hoje;
                            const initials = pessoa.nome_completo
                                .split(' ')
                                .map(n => n[0])
                                .slice(0, 2)
                                .join('')
                                .toUpperCase();

                            return (
                                <div
                                    key={pessoa.id}
                                    className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${isHoje
                                            ? 'bg-primary/10 border border-primary/20'
                                            : 'hover:bg-muted/50'
                                        }`}
                                >
                                    <Avatar className="h-10 w-10">
                                        <AvatarImage src={pessoa.avatar_url} alt={pessoa.nome_completo} />
                                        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium truncate flex items-center gap-1">
                                            {pessoa.nome_completo}
                                            {isHoje && <PartyPopper className="h-4 w-4 text-yellow-500" />}
                                        </p>
                                        <p className={`text-xs ${isHoje ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                                            {isHoje ? 'Hoje! 🎉' : `Dia ${pessoa.dia}`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
