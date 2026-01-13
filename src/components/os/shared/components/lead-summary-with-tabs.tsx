'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, MapPin, User, Check, X } from 'lucide-react';

/**
 * Interface para dados do Lead (Etapa 1)
 */
interface LeadData {
    // Identificação
    nome?: string;
    cpfCnpj?: string;
    tipo?: 'fisica' | 'juridica';
    telefone?: string;
    email?: string;
    nomeResponsavel?: string;
    cargoResponsavel?: string;
    // Edificação
    tipoEdificacao?: string;
    qtdUnidades?: string;
    qtdBlocos?: string;
    qtdPavimentos?: string;
    tipoTelhado?: string;
    possuiElevador?: boolean;
    possuiPiscina?: boolean;
    // Endereço
    cep?: string;
    endereco?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
}

interface LeadSummaryWithTabsProps {
    data: LeadData;
    className?: string;
}

/**
 * Componente de resumo read-only para Etapa 1 (Identifique o Lead)
 * 
 * Exibe os dados do lead/cliente com tabs para:
 * - Identificação
 * - Edificação
 * - Endereço
 * 
 * ⚠️ NÃO suporta Adendos - dados de cliente não são alteráveis via adendo
 */
export function LeadSummaryWithTabs({ data, className }: LeadSummaryWithTabsProps) {
    const tipoLabel = data.tipo === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física';

    return (
        <div className={className}>
            <Tabs defaultValue="identificacao" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="identificacao" className="gap-2">
                        <User className="h-4 w-4" />
                        Identificação
                    </TabsTrigger>
                    <TabsTrigger value="edificacao" className="gap-2">
                        <Building2 className="h-4 w-4" />
                        Edificação
                    </TabsTrigger>
                    <TabsTrigger value="endereco" className="gap-2">
                        <MapPin className="h-4 w-4" />
                        Endereço
                    </TabsTrigger>
                </TabsList>

                {/* Tab: Identificação */}
                <TabsContent value="identificacao" className="mt-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4 text-muted-foreground" />
                                Dados do Cliente
                                <Badge variant="outline" className="ml-auto">
                                    {tipoLabel}
                                </Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SummaryField
                                    label="Nome/Razão Social"
                                    value={data.nome}
                                />
                                <SummaryField
                                    label={data.tipo === 'juridica' ? 'CNPJ' : 'CPF'}
                                    value={data.cpfCnpj}
                                />
                                <SummaryField
                                    label="Telefone"
                                    value={data.telefone}
                                />
                                <SummaryField
                                    label="Email"
                                    value={data.email}
                                />
                                {data.nomeResponsavel && (
                                    <SummaryField
                                        label="Responsável"
                                        value={data.nomeResponsavel}
                                    />
                                )}
                                {data.cargoResponsavel && (
                                    <SummaryField
                                        label="Cargo"
                                        value={data.cargoResponsavel}
                                    />
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Edificação */}
                <TabsContent value="edificacao" className="mt-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                Dados da Edificação
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SummaryField
                                    label="Tipo de Edificação"
                                    value={data.tipoEdificacao}
                                    className="md:col-span-2"
                                />
                                {data.qtdUnidades && (
                                    <SummaryField
                                        label="Qtd. Unidades"
                                        value={data.qtdUnidades}
                                    />
                                )}
                                {data.qtdBlocos && (
                                    <SummaryField
                                        label="Qtd. Blocos"
                                        value={data.qtdBlocos}
                                    />
                                )}
                                <SummaryField
                                    label="Qtd. Pavimentos"
                                    value={data.qtdPavimentos || 'Não informado'}
                                />
                                <SummaryField
                                    label="Tipo de Telhado"
                                    value={data.tipoTelhado}
                                />
                                <BooleanField
                                    label="Possui Elevador"
                                    value={data.possuiElevador}
                                />
                                <BooleanField
                                    label="Possui Piscina"
                                    value={data.possuiPiscina}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Tab: Endereço */}
                <TabsContent value="endereco" className="mt-4">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-muted-foreground" />
                                Endereço da Edificação
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SummaryField
                                    label="CEP"
                                    value={data.cep}
                                />
                                <SummaryField
                                    label="Número"
                                    value={data.numero}
                                />
                                <SummaryField
                                    label="Endereço"
                                    value={data.endereco}
                                    className="md:col-span-2"
                                />
                                {data.complemento && (
                                    <SummaryField
                                        label="Complemento"
                                        value={data.complemento}
                                        className="md:col-span-2"
                                    />
                                )}
                                <SummaryField
                                    label="Bairro"
                                    value={data.bairro}
                                />
                                <SummaryField
                                    label="Cidade/Estado"
                                    value={data.cidade && data.estado ? `${data.cidade}/${data.estado}` : data.cidade || '--'}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}

/**
 * Campo de resumo simples (label + valor)
 */
function SummaryField({
    label,
    value,
    className,
}: {
    label: string;
    value?: string;
    className?: string;
}) {
    return (
        <div className={className}>
            <span className="text-xs text-muted-foreground block mb-1">
                {label}
            </span>
            <span className="text-sm font-medium text-foreground">
                {value || '--'}
            </span>
        </div>
    );
}

/**
 * Campo booleano (Sim/Não com ícone)
 */
function BooleanField({
    label,
    value,
}: {
    label: string;
    value?: boolean;
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
                {label}:
            </span>
            {value ? (
                <Badge variant="outline" className="text-success border-success/30 gap-1">
                    <Check className="h-3 w-3" />
                    Sim
                </Badge>
            ) : (
                <Badge variant="outline" className="text-muted-foreground gap-1">
                    <X className="h-3 w-3" />
                    Não
                </Badge>
            )}
        </div>
    );
}

export type { LeadData, LeadSummaryWithTabsProps };
