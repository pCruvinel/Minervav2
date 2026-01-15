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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
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
    // 🛠️ Normalizar dados para suportar estrutura aninhada (LeadCompleto) ou plana
    const normalizedData: LeadData = {
        // Identificação
        nome: data.identificacao?.nome || data.nome,
        cpfCnpj: data.identificacao?.cpfCnpj || data.cpfCnpj,
        tipo: data.identificacao?.tipo || data.tipo,
        telefone: data.identificacao?.telefone || data.telefone,
        email: data.identificacao?.email || data.email,
        nomeResponsavel: data.identificacao?.nomeResponsavel || data.nomeResponsavel,
        cargoResponsavel: data.identificacao?.cargoResponsavel || data.cargoResponsavel,

        // Edificação
        tipoEdificacao: data.edificacao?.tipoEdificacao || data.tipoEdificacao,
        qtdUnidades: data.edificacao?.qtdUnidades || data.qtdUnidades,
        qtdBlocos: data.edificacao?.qtdBlocos || data.qtdBlocos,
        qtdPavimentos: data.edificacao?.qtdPavimentos || data.qtdPavimentos,
        tipoTelhado: data.edificacao?.tipoTelhado || data.tipoTelhado,
        possuiElevador: data.edificacao?.possuiElevador ?? data.possuiElevador,
        possuiPiscina: data.edificacao?.possuiPiscina ?? data.possuiPiscina,

        // Endereço
        cep: data.endereco?.cep || data.cep,
        endereco: data.endereco?.rua || data.endereco?.endereco || data.endereco, // 'rua' no Objeto, 'endereco' no Flat
        numero: data.endereco?.numero || data.numero,
        complemento: data.endereco?.complemento || data.complemento,
        bairro: data.endereco?.bairro || data.bairro,
        cidade: data.endereco?.cidade || data.cidade,
        estado: data.endereco?.estado || data.estado,
    };

    const tipoLabel = normalizedData.tipo === 'juridica' ? 'Pessoa Jurídica' : 'Pessoa Física';

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
                                    value={normalizedData.nome}
                                />
                                <SummaryField
                                    label={normalizedData.tipo === 'juridica' ? 'CNPJ' : 'CPF'}
                                    value={normalizedData.cpfCnpj}
                                />
                                <SummaryField
                                    label="Telefone"
                                    value={normalizedData.telefone}
                                />
                                <SummaryField
                                    label="Email"
                                    value={normalizedData.email}
                                />
                                {normalizedData.nomeResponsavel && (
                                    <SummaryField
                                        label="Responsável"
                                        value={normalizedData.nomeResponsavel}
                                    />
                                )}
                                {normalizedData.cargoResponsavel && (
                                    <SummaryField
                                        label="Cargo"
                                        value={normalizedData.cargoResponsavel}
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
                                    value={normalizedData.tipoEdificacao}
                                    className="md:col-span-2"
                                />
                                {normalizedData.qtdUnidades && (
                                    <SummaryField
                                        label="Qtd. Unidades"
                                        value={normalizedData.qtdUnidades}
                                    />
                                )}
                                {normalizedData.qtdBlocos && (
                                    <SummaryField
                                        label="Qtd. Blocos"
                                        value={normalizedData.qtdBlocos}
                                    />
                                )}
                                <SummaryField
                                    label="Qtd. Pavimentos"
                                    value={normalizedData.qtdPavimentos || 'Não informado'}
                                />
                                <SummaryField
                                    label="Tipo de Telhado"
                                    value={normalizedData.tipoTelhado}
                                />
                                <BooleanField
                                    label="Possui Elevador"
                                    value={normalizedData.possuiElevador}
                                />
                                <BooleanField
                                    label="Possui Piscina"
                                    value={normalizedData.possuiPiscina}
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
                                    value={normalizedData.cep}
                                />
                                <SummaryField
                                    label="Número"
                                    value={normalizedData.numero}
                                />
                                <SummaryField
                                    label="Endereço"
                                    value={normalizedData.endereco}
                                    className="md:col-span-2"
                                />
                                {normalizedData.complemento && (
                                    <SummaryField
                                        label="Complemento"
                                        value={normalizedData.complemento}
                                        className="md:col-span-2"
                                    />
                                )}
                                <SummaryField
                                    label="Bairro"
                                    value={normalizedData.bairro}
                                />
                                <SummaryField
                                    label="Cidade/Estado"
                                    value={normalizedData.cidade && normalizedData.estado ? `${normalizedData.cidade}/${normalizedData.estado}` : normalizedData.cidade || '--'}
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
