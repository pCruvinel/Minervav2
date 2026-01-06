import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
    FileText,
    User,
    Building2,
    MapPin,
    Calendar,
    Package,
    ArrowLeft,
    CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { PRAZOS_NECESSIDADE, type ItemRequisicao } from '@/lib/types';

interface StepConfirmacaoRequisicaoProps {
    data: {
        // Dados do solicitante
        solicitante?: {
            nome: string;
            setor?: string;
            cargo?: string;
        };
        // Centro de Custo
        centro_custo_id?: string;
        centro_custo_nome?: string;
        // Prazo
        prazo_necessidade?: string;
        // Endereço
        cep?: string;
        logradouro?: string;
        numero?: string;
        complemento?: string;
        bairro?: string;
        cidade?: string;
        uf?: string;
        // Itens
        itens?: ItemRequisicao[];
        // Metadados
        codigo_os?: string;
        data_criacao?: string;
    };
    /** ID da etapa 1 para buscar itens caso não venham no data */
    etapaId?: string;
    onVoltar: () => void;
    onConfirmar: () => void;
    isLoading?: boolean;
}

import { useRequisitionItems } from '@/lib/hooks/use-requisition-items';

/**
 * StepConfirmacaoRequisicao - Etapa 2 da OS-09
 * 
 * Exibe uma visualização estilo "PDF" com todos os dados da requisição
 * para confirmação antes de avançar para upload de orçamentos.
 */
export function StepConfirmacaoRequisicao({
    data,
    etapaId,
    onVoltar,
    onConfirmar,
    isLoading = false
}: StepConfirmacaoRequisicaoProps) {
    // Busca autônoma de itens para garantir dados frescos
    const { items: fetchedItems, loading: loadingItems } = useRequisitionItems(etapaId);

    // Prioriza itens passados via prop, mas usa fetchedItems se props estiver vazio
    // Isso resolve o problema de sincronização com o pai
    const itens = (data.itens && data.itens.length > 0) ? data.itens : fetchedItems;

    // Debug
    // console.log('StepConfirmacao: props.itens', data.itens?.length, 'fetchedItems', fetchedItems.length);

    const formatCurrency = (value: number) => {
        return value.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        });
    };

    const prazoLabel = PRAZOS_NECESSIDADE.find(p => p.value === data.prazo_necessidade)?.label || data.prazo_necessidade;

    const totalItens = itens.length;
    const valorTotal = itens.reduce(
        (sum, item) => sum + (item.quantidade || 0) * (item.preco_unitario || 0),
        0
    );

    const enderecoCompleto = [
        data.logradouro,
        data.numero,
        data.complemento,
        data.bairro,
        `${data.cidade} - ${data.uf}`,
        data.cep
    ].filter(Boolean).join(', ');

    return (
        <div className="space-y-6">
            {/* Header estilo documento */}
            <div className="text-center border-b border-border pb-6">
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                        <FileText className="h-8 w-8 text-primary" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold">Requisição de Compra</h1>
                <div className="flex items-center justify-center gap-4 mt-3">
                    {data.codigo_os && (
                        <Badge variant="outline" className="font-mono text-base px-3 py-1">
                            {data.codigo_os}
                        </Badge>
                    )}
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {data.data_criacao
                            ? format(new Date(data.data_criacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                            : format(new Date(), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })
                        }
                    </span>
                </div>
            </div>

            {/* Corpo do documento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Solicitante */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                            <User className="h-4 w-4" />
                            Solicitante
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold">{data.solicitante?.nome || 'Não informado'}</p>
                            {data.solicitante?.cargo && (
                                <p className="text-sm text-muted-foreground">{data.solicitante.cargo}</p>
                            )}
                            {data.solicitante?.setor && (
                                <Badge variant="secondary" className="mt-1">{data.solicitante.setor}</Badge>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Centro de Custo */}
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                            <Building2 className="h-4 w-4" />
                            Centro de Custo
                        </div>
                        <div className="space-y-1">
                            <p className="font-semibold">{data.centro_custo_nome || 'Não selecionado'}</p>
                            <p className="text-sm text-muted-foreground">
                                Prazo: <span className="font-medium">{prazoLabel}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Endereço de Entrega */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                        <MapPin className="h-4 w-4" />
                        Endereço de Entrega
                    </div>
                    <p className="font-medium">{enderecoCompleto || 'Endereço não informado'}</p>
                </CardContent>
            </Card>

            {/* Tabela de Itens */}
            <Card>
                <CardContent className="p-0">
                    <div className="flex items-center justify-between p-4 border-b border-border">
                        <div className="flex items-center gap-2 text-sm font-medium">
                            <Package className="h-4 w-4" />
                            Itens da Requisição
                        </div>
                        <Badge variant="secondary">{totalItens} {totalItens === 1 ? 'item' : 'itens'}</Badge>
                    </div>

                    {itens.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground">
                            Nenhum item adicionado
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-border bg-muted/50">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">#</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tipo</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Descrição</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Qtd</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Un.</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Preço Unit.</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {itens.map((item, index) => {
                                        const total = (item.quantidade || 0) * (item.preco_unitario || 0);
                                        return (
                                            <tr key={item.id || index} className="border-b border-border">
                                                <td className="py-3 px-4 text-sm font-mono text-muted-foreground">{index + 1}</td>
                                                <td className="py-3 px-4 text-sm">
                                                    <div>
                                                        <div className="font-medium">{item.tipo}</div>
                                                        {item.sub_tipo && <div className="text-xs text-muted-foreground">{item.sub_tipo}</div>}
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4 text-sm max-w-md">
                                                    <div className="truncate" title={item.descricao}>{item.descricao}</div>
                                                    {item.link_produto && (
                                                        <a
                                                            href={item.link_produto}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-xs text-primary hover:underline"
                                                        >
                                                            Ver produto
                                                        </a>
                                                    )}
                                                </td>
                                                <td className="py-3 px-4 text-sm text-right font-medium">{item.quantidade}</td>
                                                <td className="py-3 px-4 text-sm">{item.unidade_medida}</td>
                                                <td className="py-3 px-4 text-sm text-right">{formatCurrency(item.preco_unitario || 0)}</td>
                                                <td className="py-3 px-4 text-sm text-right font-semibold">{formatCurrency(total)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Resumo */}
                    <div className="p-4 bg-muted/30 border-t border-border">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Valor Total da Requisição:</span>
                            <span className="text-2xl font-bold">{formatCurrency(valorTotal)}</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Rodapé com ações */}
            <div className="flex items-center justify-between pt-4">
                <Button
                    variant="outline"
                    onClick={onVoltar}
                    disabled={isLoading}
                    className="gap-2"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Editar Requisição
                </Button>

                <Button
                    onClick={onConfirmar}
                    disabled={isLoading || loadingItems || totalItens === 0}
                    className="gap-2"
                >
                    <CheckCircle className="h-4 w-4" />
                    {(isLoading || loadingItems) ? 'Processando...' : 'Confirmar e Avançar'}
                </Button>
            </div>
        </div>
    );
}
