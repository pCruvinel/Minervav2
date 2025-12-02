import React, { useEffect, useState } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';
import { useOrdemServico } from '@/lib/hooks/use-ordens-servico';
import { useEtapas } from '@/lib/hooks/use-etapas';
import logoMinerva from '@/img/logo.png';

interface EtapaPrincipal {
    nome: string;
    subetapas: Array<{
        nome: string;
        m2: string;
        diasUteis: string;
        total: string;
    }>;
}

interface PropostaData {
    codigo: string;
    cliente: {
        nome: string;
        cpfCnpj: string;
        endereco: string;
        telefone: string;
        email: string;
    };
    tipoOS: string;
    escopo: {
        objetivo: string;
        etapasPrincipais: EtapaPrincipal[];
        planejamentoInicial: string;
        logisticaTransporte: string;
        preparacaoArea: string;
    };
    precificacao: {
        valorTotal: number;
        valorEntrada: number;
        valorParcela: number;
        percentualEntrada: string;
        numeroParcelas: string;
    };
    dataGeracao: string;
    validadeDias: string;
    garantiaMeses: string;
}

export function PropostaComercialPrintPage() {
    const { codigo } = useParams({ from: '/_auth/os/proposta/$codigo' });
    const navigate = useNavigate();
    const [propostaData, setPropostaData] = useState<PropostaData | null>(null);

    // Buscar OS e etapas do banco (codigo é na verdade o osId)
    const osId = codigo;
    const { data: os, isLoading: osLoading } = useOrdemServico(osId);
    const { etapas, isLoading: etapasLoading, fetchEtapas } = useEtapas();

    const loading = osLoading || etapasLoading;

    // Buscar dados reais do Supabase
    useEffect(() => {
        if (osId) {
            fetchEtapas(osId);
        }
    }, [osId]);

    // Montar dados da proposta a partir das etapas
    useEffect(() => {
        if (os && etapas && etapas.length > 0) {
            const etapa1 = etapas.find(e => e.ordem === 1)?.dados_etapa as any;
            const etapa2 = etapas.find(e => e.ordem === 2)?.dados_etapa as any;
            const etapa7 = etapas.find(e => e.ordem === 7)?.dados_etapa as any;
            const etapa8 = etapas.find(e => e.ordem === 8)?.dados_etapa as any;
            const etapa9 = etapas.find(e => e.ordem === 9)?.dados_etapa as any;

            if (!etapa1 || !etapa7 || !etapa8) {
                console.error('Dados incompletos:', { etapa1, etapa7, etapa8 });
                return;
            }

            // Calcular valores
            const custoBase = etapa7.etapasPrincipais?.reduce((total: number, etapa: any) => {
                return total + (etapa.subetapas?.reduce((subtotal: number, sub: any) => {
                    return subtotal + (parseFloat(sub.total) || 0);
                }, 0) || 0);
            }, 0) || 0;

            const percentualTotal = 1 +
                (parseFloat(etapa8.percentualImprevisto || '0') / 100) +
                (parseFloat(etapa8.percentualLucro || '0') / 100) +
                (parseFloat(etapa8.percentualImposto || '0') / 100);

            const valorTotal = custoBase * percentualTotal;
            const valorEntrada = valorTotal * (parseFloat(etapa8.percentualEntrada || '0') / 100);
            const numeroParcelas = parseInt(etapa8.numeroParcelas || '1');
            const valorParcela = (valorTotal - valorEntrada) / numeroParcelas;

            const proposta: PropostaData = {
                codigo: etapa9?.codigoProposta || os.codigo_os,
                cliente: {
                    nome: etapa1.nome || os.cliente?.nome_razao_social || '',
                    cpfCnpj: etapa1.cpfCnpj || os.cliente?.cpf_cnpj || '',
                    endereco: `${etapa1.endereco || ''}, ${etapa1.numero || ''} - ${etapa1.bairro || ''}, ${etapa1.cidade || ''} - ${etapa1.estado || ''}`,
                    telefone: etapa1.telefone || os.cliente?.telefone || '',
                    email: etapa1.email || os.cliente?.email || ''
                },
                tipoOS: etapa2.tipoOS || '',
                escopo: {
                    objetivo: etapa7.objetivo || '',
                    etapasPrincipais: etapa7.etapasPrincipais || [],
                    planejamentoInicial: etapa7.planejamentoInicial || '0',
                    logisticaTransporte: etapa7.logisticaTransporte || '0',
                    preparacaoArea: etapa7.preparacaoArea || '0'
                },
                precificacao: {
                    valorTotal,
                    valorEntrada,
                    valorParcela,
                    percentualEntrada: etapa8.percentualEntrada || '0',
                    numeroParcelas: etapa8.numeroParcelas || '1'
                },
                dataGeracao: etapa9?.dataGeracao || new Date().toLocaleDateString('pt-BR'),
                validadeDias: etapa9?.validadeDias || '30',
                garantiaMeses: etapa9?.garantiaMeses || '12'
            };

            setPropostaData(proposta);
        }
    }, [os, etapas]);

    const handlePrint = () => {
        window.print();
    };

    const handleBack = () => {
        navigate({ to: '/os' });
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
        }).format(value);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Carregando proposta...</p>
                </div>
            </div>
        );
    }

    if (!propostaData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-destructive mb-4">Proposta não encontrada</p>
                    <Button onClick={handleBack}>
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Voltar
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header - não aparece na impressão */}
            <div className="print:hidden bg-background border-b p-4 flex justify-between items-center">
                <Button variant="outline" onClick={handleBack}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Voltar ao Sistema
                </Button>
                <Button onClick={handlePrint} className="bg-primary hover:bg-primary/90">
                    <Printer className="w-4 h-4 mr-2" />
                    Imprimir Proposta
                </Button>
            </div>

            {/* Conteúdo da Proposta - Formato A3 */}
            <div className="max-w-4xl mx-auto p-8 print:p-0 print:max-w-none">
                <Card className="border-0 shadow-none print:shadow-none">
                    <CardHeader className="text-center pb-8 border-b-4 border-primary">
                        <div className="flex justify-center mb-6">
                            <img
                                src={logoMinerva}
                                alt="Minerva Engenharia"
                                className="h-24 w-auto object-contain"
                            />
                        </div>
                        <CardTitle className="text-3xl font-bold text-primary mb-2">
                            MINERVA ENGENHARIA
                        </CardTitle>
                        <p className="text-xl font-medium text-foreground">Proposta Comercial</p>
                        <div className="mt-4 flex justify-center gap-4 text-sm text-muted-foreground">
                            <span className="px-3 py-1 bg-primary/10 rounded">Código: {propostaData.codigo}</span>
                            <span className="px-3 py-1 bg-primary/10 rounded">Data: {propostaData.dataGeracao}</span>
                        </div>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {/* 1. Dados do Cliente */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                                1. DADOS DO CLIENTE
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="font-medium text-muted-foreground">Nome/Razão Social:</p>
                                    <p className="text-foreground">{propostaData.cliente.nome}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">CPF/CNPJ:</p>
                                    <p className="text-foreground">{propostaData.cliente.cpfCnpj}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Endereço:</p>
                                    <p className="text-foreground">{propostaData.cliente.endereco}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-muted-foreground">Telefone:</p>
                                    <p className="text-foreground">{propostaData.cliente.telefone}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="font-medium text-muted-foreground">E-mail:</p>
                                    <p className="text-foreground">{propostaData.cliente.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tipo de Serviço */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                                2. TIPO DE SERVIÇO
                            </h2>
                            <p className="text-lg font-medium text-foreground">{propostaData.tipoOS}</p>
                            <p className="text-muted-foreground mt-2">{propostaData.escopo.objetivo}</p>
                        </div>

                        {/* 3. Escopo dos Serviços */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                                3. ESCOPO DOS SERVIÇOS
                            </h2>

                            {/* Cronograma */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-3">Cronograma Previsto:</h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="bg-background p-3 rounded">
                                        <p className="font-medium">Planejamento Inicial</p>
                                        <p className="text-muted-foreground">{propostaData.escopo.planejamentoInicial} dias úteis</p>
                                    </div>
                                    <div className="bg-background p-3 rounded">
                                        <p className="font-medium">Logística e Transporte</p>
                                        <p className="text-muted-foreground">{propostaData.escopo.logisticaTransporte} dias úteis</p>
                                    </div>
                                    <div className="bg-background p-3 rounded">
                                        <p className="font-medium">Preparação de Área</p>
                                        <p className="text-muted-foreground">{propostaData.escopo.preparacaoArea} dias úteis</p>
                                    </div>
                                </div>
                            </div>

                            {/* Etapas Principais */}
                            <div>
                                <h3 className="text-lg font-medium mb-3">Etapas Principais:</h3>
                                {propostaData.escopo.etapasPrincipais.map((etapa, index) => (
                                    <div key={index} className="mb-4">
                                        <h4 className="font-medium text-foreground mb-2">{etapa.nome}</h4>
                                        <table className="w-full border-collapse border border-border text-sm">
                                            <thead>
                                                <tr className="bg-background">
                                                    <th className="border border-border px-3 py-2 text-left">Subetapa</th>
                                                    <th className="border border-border px-3 py-2 text-center">Área (m²)</th>
                                                    <th className="border border-border px-3 py-2 text-center">Dias Úteis</th>
                                                    <th className="border border-border px-3 py-2 text-right">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {etapa.subetapas.map((sub, subIndex) => (
                                                    <tr key={subIndex}>
                                                        <td className="border border-border px-3 py-2">{sub.nome}</td>
                                                        <td className="border border-border px-3 py-2 text-center">{sub.m2}</td>
                                                        <td className="border border-border px-3 py-2 text-center">{sub.diasUteis}</td>
                                                        <td className="border border-border px-3 py-2 text-right">{sub.total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* 4. Valores e Condições */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                                4. VALORES E CONDIÇÕES DE PAGAMENTO
                            </h2>

                            <div className="bg-primary p-6 rounded-lg mb-6 text-white">
                                <div className="text-center">
                                    <p className="text-sm mb-2 opacity-90">Valor Total da Proposta</p>
                                    <p className="text-5xl font-bold">
                                        {formatCurrency(propostaData.precificacao.valorTotal)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-primary/10 border-2 border-primary p-4 rounded-lg">
                                    <h4 className="font-semibold text-primary mb-2">Entrada</h4>
                                    <p className="text-3xl font-bold text-foreground">
                                        {formatCurrency(propostaData.precificacao.valorEntrada)}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        {propostaData.precificacao.percentualEntrada}% do valor total
                                    </p>
                                    <p className="text-xs text-primary font-medium mt-2">
                                        Prazo: 7 dias após assinatura
                                    </p>
                                </div>

                                <div className="bg-primary/10 border-2 border-primary p-4 rounded-lg">
                                    <h4 className="font-semibold text-primary mb-2">Parcelamento</h4>
                                    <p className="text-3xl font-bold text-foreground">
                                        {propostaData.precificacao.numeroParcelas}x {formatCurrency(propostaData.precificacao.valorParcela)}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Total: {formatCurrency(propostaData.precificacao.valorTotal - propostaData.precificacao.valorEntrada)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 5. Informações da Empresa */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                                5. INFORMAÇÕES DA EMPRESA
                            </h2>
                            <div className="space-y-2">
                                <div>
                                    <span className="font-medium">Empresa:</span> MINERVA ENGENHARIA
                                </div>
                                <div>
                                    <span className="font-medium">Endereço:</span>{' '}
                                    Av. Colares Moreira, Edifício Los Angeles, N°100, Loja 01, Renascença, São Luís - MA, CEP: 65075-144
                                </div>
                                <div>
                                    <span className="font-medium">Telefones:</span>{' '}
                                    (98) 98226-7909 / (98) 98151-3355
                                </div>
                                <div>
                                    <span className="font-medium">Contato Digital:</span>{' '}
                                    www.minerva-eng.com.br / contato@minerva-eng.com.br
                                </div>
                            </div>
                        </div>

                        {/* 6. Validade e Garantia */}
                        <div>
                            <h2 className="text-xl font-semibold mb-4 text-primary border-l-4 border-primary pl-3">
                                6. VALIDADE E GARANTIA
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-primary/10 border-2 border-primary p-4 rounded-lg">
                                    <h4 className="font-semibold text-primary mb-2">Validade da Proposta</h4>
                                    <p className="text-3xl font-bold text-foreground">
                                        {propostaData.validadeDias} dias
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        A partir da data de emissão
                                    </p>
                                </div>

                                <div className="bg-primary/10 border-2 border-primary p-4 rounded-lg">
                                    <h4 className="font-semibold text-primary mb-2">Garantia dos Serviços</h4>
                                    <p className="text-3xl font-bold text-foreground">
                                        {propostaData.garantiaMeses} meses
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1">
                                        Contra defeitos de execução
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Assinaturas */}
                        <div className="mt-12 pt-8 border-t">
                            <div className="grid grid-cols-2 gap-12">
                                <div className="text-center">
                                    <div className="border-b border-border w-full mb-2"></div>
                                    <p className="text-sm text-muted-foreground">Cliente</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {propostaData.cliente.nome}
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="border-b border-border w-full mb-2"></div>
                                    <p className="text-sm text-muted-foreground">Minerva Engenharia</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Responsável Técnico
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Observações */}
                        <div className="mt-8 p-4 bg-background rounded-lg">
                            <h4 className="font-medium text-foreground mb-2">Observações Importantes:</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Esta proposta é válida por {propostaData.validadeDias} dias a partir da data de emissão.</li>
                                <li>• Os valores apresentados não incluem eventuais taxas ou impostos municipais.</li>
                                <li>• O cronograma poderá sofrer ajustes devido a condições climáticas ou imprevistos.</li>
                                <li>• A garantia cobre defeitos de execução, não desgaste natural dos materiais.</li>
                                <li>• Para aprovação, é necessário sinal de 50% do valor da entrada.</li>
                            </ul>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* CSS para impressão A3 */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                  @page {
                    size: A3;
                    margin: 1cm;
                  }
      
                  body {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                  }
      
                  .print\\:hidden {
                    display: none !important;
                  }
      
                  .print\\:p-0 {
                    padding: 0 !important;
                  }
      
                  .print\\:max-w-none {
                    max-width: none !important;
                  }
      
                  .print\\:shadow-none {
                    box-shadow: none !important;
                  }
                }
              `
            }} />
        </div>
    );
}