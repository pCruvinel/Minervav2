/**
 * Componente ClienteHistoricoCompleto
 *
 * Exibe o histórico completo de um cliente incluindo:
 * - Dados básicos do cliente
 * - Resumo consolidado (OS ativas/concluídas/canceladas, contratos, documentos)
 * - Timeline de interações
 * - Lista de ordens de serviço com centros de custo
 *
 * Implementa as regras de negócio:
 * - Cliente pode ter múltiplas OS (1:N)
 * - Cada OS tem exatamente 1 centro de custo
 */

import React from 'react';
import { useClienteHistorico } from '@/lib/hooks/use-cliente-historico';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FileText, Calendar, DollarSign, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ClienteHistoricoCompletoProps {
    clienteId: string;
    onOSClick?: (osId: string) => void;
    onRefresh?: () => void;
}

export function ClienteHistoricoCompleto({
    clienteId,
    onOSClick,
    onRefresh
}: ClienteHistoricoCompletoProps) {
    const { cliente, resumo, timeline, ordensServico, isLoading, error, refetch } = useClienteHistorico(clienteId);

    if (isLoading) {
        return <ClienteHistoricoSkeleton />;
    }

    if (error) {
        return (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Erro ao carregar dados do cliente.{' '}
                    <Button variant="link" onClick={() => refetch()}>
                        Tentar novamente
                    </Button>
                </AlertDescription>
            </Alert>
        );
    }

    if (!cliente) {
        return (
            <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Cliente não encontrado.</AlertDescription>
            </Alert>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header com dados básicos */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl">{cliente.nome_razao_social}</CardTitle>
                            <p className="text-muted-foreground">{cliente.cpf_cnpj}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant={cliente.status === 'ativo' ? 'default' : 'secondary'}>
                                {cliente.status}
                            </Badge>
                            <Button variant="outline" size="sm" onClick={() => refetch()}>
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </CardHeader>
            </Card>

            {/* Resumo Consolidado */}
            {resumo && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">Total OS</p>
                                    <p className="text-2xl font-bold">{resumo.totalOS}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <Calendar className="h-4 w-4 text-success" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">OS Ativas</p>
                                    <p className="text-2xl font-bold text-success">{resumo.osAtivas}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <DollarSign className="h-4 w-4 text-primary" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">Valor Contratos</p>
                                    <p className="text-2xl font-bold text-primary">
                                        R$ {resumo.valorTotalContratos.toLocaleString('pt-BR')}
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <div className="ml-2">
                                    <p className="text-sm font-medium text-muted-foreground">Documentos</p>
                                    <p className="text-2xl font-bold">{resumo.totalDocumentos}</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Timeline de Interações */}
            <Card>
                <CardHeader>
                    <CardTitle>Timeline de Interações</CardTitle>
                </CardHeader>
                <CardContent>
                    {timeline.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma interação encontrada.</p>
                    ) : (
                        <div className="space-y-4">
                            {timeline.map((item) => (
                                <div key={item.id} className="flex items-start space-x-4">
                                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <h4 className="font-medium">{item.titulo}</h4>
                                            <Badge variant="outline">{item.tipo}</Badge>
                                        </div>
                                        {item.descricao && (
                                            <p className="text-sm text-muted-foreground mt-1">{item.descricao}</p>
                                        )}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(item.data).toLocaleDateString('pt-BR')}
                                            </span>
                                            {item.responsavel_nome && (
                                                <span className="text-xs text-muted-foreground">
                                                    {item.responsavel_nome}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Ordens de Serviço */}
            <Card>
                <CardHeader>
                    <CardTitle>Ordens de Serviço</CardTitle>
                </CardHeader>
                <CardContent>
                    {ordensServico.length === 0 ? (
                        <p className="text-muted-foreground">Nenhuma OS encontrada.</p>
                    ) : (
                        <div className="space-y-4">
                            {ordensServico.map((os) => (
                                <div
                                    key={os.id}
                                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer transition-colors"
                                    onClick={() => onOSClick?.(os.id)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium">{os.codigo_os}</h4>
                                            <p className="text-sm text-muted-foreground">{os.tipo_os_nome}</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={
                                                os.status_geral === 'em_andamento' ? 'default' :
                                                    os.status_geral === 'concluida' ? 'secondary' :
                                                        'destructive'
                                            }>
                                                {os.status_geral}
                                            </Badge>
                                        </div>
                                    </div>

                                    {os.centro_custo && (
                                        <div className="mt-2 p-2 bg-muted rounded text-sm">
                                            <strong>Centro de Custo:</strong> {os.centro_custo.nome}
                                            {os.centro_custo.valor_global > 0 && (
                                                <span className="ml-2">
                                                    (R$ {os.centro_custo.valor_global.toLocaleString('pt-BR')})
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                                        <span>Entrada: {new Date(os.data_entrada).toLocaleDateString('pt-BR')}</span>
                                        {os.responsavel_nome && <span>{os.responsavel_nome}</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

// Componente de loading skeleton
function ClienteHistoricoSkeleton() {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-4 w-32" />
                </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card key={i}>
                        <CardContent className="p-6">
                            <Skeleton className="h-16 w-full" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-start space-x-4">
                                <Skeleton className="w-2 h-2 rounded-full" />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-48 mb-2" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}