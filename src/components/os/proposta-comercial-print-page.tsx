import React, { useEffect, useState } from 'react';
import { createFileRoute, useParams } from '@tanstack/react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Printer, ArrowLeft } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

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
    const [loading, setLoading] = useState(true);

    // Mock data - em produção, buscar do Supabase ou receber via props/state
    useEffect(() => {
        // Simular carregamento de dados da proposta
        const mockData: PropostaData = {
            codigo: codigo || 'PROP-2024-0001',
            cliente: {
                nome: 'Condomínio Residencial Primavera',
                cpfCnpj: '12.345.678/0001-90',
                endereco: 'Rua das Flores, 123 - Centro, São Luís - MA, CEP: 65000-000',
                telefone: '(98) 99999-9999',
                email: 'contato@condominioprimavera.com.br'
            },
            tipoOS: 'OS 01: Perícia de Fachada',
            escopo: {
                objetivo: 'Realizar diagnóstico estrutural completo da fachada do edifício',
                etapasPrincipais: [
                    {
                        nome: 'Diagnóstico Visual',
                        subetapas: [
                            { nome: 'Inspeção externa', m2: '1200', diasUteis: '2', total: 'R$ 2.400,00' },
                            { nome: 'Fotografia documentada', m2: '1200', diasUteis: '1', total: 'R$ 1.200,00' }
                        ]
                    },
                    {
                        nome: 'Análise Estrutural',
                        subetapas: [
                            { nome: 'Verificação de fissuras', m2: '1200', diasUteis: '3', total: 'R$ 3.600,00' },
                            { nome: 'Teste de resistência', m2: '1200', diasUteis: '2', total: 'R$ 2.400,00' }
                        ]
                    }
                ],
                planejamentoInicial: '5',
                logisticaTransporte: '3',
                preparacaoArea: '2'
            },
            precificacao: {
                valorTotal: 15000.00,
                valorEntrada: 2250.00,
                valorParcela: 1125.00,
                percentualEntrada: '15',
                numeroParcelas: '12'
            },
            dataGeracao: new Date().toLocaleDateString('pt-BR'),
            validadeDias: '30',
            garantiaMeses: '12'
        };

        setTimeout(() => {
            setPropostaData(mockData);
            setLoading(false);
        }, 500);
    }, [codigo]);

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
                    <p className="text-gray-600">Carregando proposta...</p>
                </div>
            </div>
        );
    }

    if (!propostaData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Proposta não encontrada</p>
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
            <div className="print:hidden bg-gray-50 border-b p-4 flex justify-between items-center">
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
                    <CardHeader className="text-center pb-8">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <span className="text-2xl font-bold text-primary">M</span>
                            </div>
                        </div>
                        <CardTitle className="text-3xl font-bold text-primary mb-2">
                            MINERVA ENGENHARIA
                        </CardTitle>
                        <p className="text-lg text-gray-600">Proposta Comercial</p>
                        <p className="text-sm text-gray-500 mt-2">
                            Código: {propostaData.codigo} | Data: {propostaData.dataGeracao}
                        </p>
                    </CardHeader>

                    <CardContent className="space-y-8">
                        {/* 1. Dados do Cliente */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary">1. DADOS DO CLIENTE</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <p className="font-medium text-gray-700">Nome/Razão Social:</p>
                                    <p className="text-gray-900">{propostaData.cliente.nome}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">CPF/CNPJ:</p>
                                    <p className="text-gray-900">{propostaData.cliente.cpfCnpj}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">Endereço:</p>
                                    <p className="text-gray-900">{propostaData.cliente.endereco}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-700">Telefone:</p>
                                    <p className="text-gray-900">{propostaData.cliente.telefone}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="font-medium text-gray-700">E-mail:</p>
                                    <p className="text-gray-900">{propostaData.cliente.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* 2. Tipo de Serviço */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary">2. TIPO DE SERVIÇO</h2>
                            <p className="text-lg font-medium text-gray-900">{propostaData.tipoOS}</p>
                            <p className="text-gray-700 mt-2">{propostaData.escopo.objetivo}</p>
                        </div>

                        {/* 3. Escopo dos Serviços */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary">3. ESCOPO DOS SERVIÇOS</h2>

                            {/* Cronograma */}
                            <div className="mb-6">
                                <h3 className="text-lg font-medium mb-3">Cronograma Previsto:</h3>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="font-medium">Planejamento Inicial</p>
                                        <p className="text-gray-600">{propostaData.escopo.planejamentoInicial} dias úteis</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="font-medium">Logística e Transporte</p>
                                        <p className="text-gray-600">{propostaData.escopo.logisticaTransporte} dias úteis</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded">
                                        <p className="font-medium">Preparação de Área</p>
                                        <p className="text-gray-600">{propostaData.escopo.preparacaoArea} dias úteis</p>
                                    </div>
                                </div>
                            </div>

                            {/* Etapas Principais */}
                            <div>
                                <h3 className="text-lg font-medium mb-3">Etapas Principais:</h3>
                                {propostaData.escopo.etapasPrincipais.map((etapa, index) => (
                                    <div key={index} className="mb-4">
                                        <h4 className="font-medium text-gray-800 mb-2">{etapa.nome}</h4>
                                        <table className="w-full border-collapse border border-gray-300 text-sm">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th className="border border-gray-300 px-3 py-2 text-left">Subetapa</th>
                                                    <th className="border border-gray-300 px-3 py-2 text-center">Área (m²)</th>
                                                    <th className="border border-gray-300 px-3 py-2 text-center">Dias Úteis</th>
                                                    <th className="border border-gray-300 px-3 py-2 text-right">Valor</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {etapa.subetapas.map((sub, subIndex) => (
                                                    <tr key={subIndex}>
                                                        <td className="border border-gray-300 px-3 py-2">{sub.nome}</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-center">{sub.m2}</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-center">{sub.diasUteis}</td>
                                                        <td className="border border-gray-300 px-3 py-2 text-right">{sub.total}</td>
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
                            <h2 className="text-xl font-semibold mb-4 text-primary">4. VALORES E CONDIÇÕES DE PAGAMENTO</h2>

                            <div className="bg-primary/5 p-6 rounded-lg mb-6">
                                <div className="text-center">
                                    <p className="text-sm text-gray-600 mb-2">Valor Total (Investimento + Impostos)</p>
                                    <p className="text-4xl font-bold text-primary">
                                        {formatCurrency(propostaData.precificacao.valorTotal)}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-green-800 mb-2">Entrada</h4>
                                    <p className="text-2xl font-bold text-green-600">
                                        {formatCurrency(propostaData.precificacao.valorEntrada)}
                                    </p>
                                    <p className="text-sm text-green-700">
                                        ({propostaData.precificacao.percentualEntrada}% do total)
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Prazo: 7 dias após assinatura do contrato
                                    </p>
                                </div>

                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-blue-800 mb-2">Parcelas</h4>
                                    <p className="text-2xl font-bold text-blue-600">
                                        {propostaData.precificacao.numeroParcelas}x de {formatCurrency(propostaData.precificacao.valorParcela)}
                                    </p>
                                    <p className="text-sm text-blue-700">
                                        Total financiado: {formatCurrency(propostaData.precificacao.valorTotal - propostaData.precificacao.valorEntrada)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* 5. Informações da Empresa */}
                        <div className="border-b pb-6">
                            <h2 className="text-xl font-semibold mb-4 text-primary">5. INFORMAÇÕES DA EMPRESA</h2>
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
                            <h2 className="text-xl font-semibold mb-4 text-primary">6. VALIDADE E GARANTIA</h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-yellow-800 mb-2">Validade da Proposta</h4>
                                    <p className="text-2xl font-bold text-yellow-600">
                                        {propostaData.validadeDias} dias
                                    </p>
                                    <p className="text-sm text-yellow-700">
                                        A partir da data de emissão
                                    </p>
                                </div>

                                <div className="bg-purple-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-purple-800 mb-2">Garantia dos Serviços</h4>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {propostaData.garantiaMeses} meses
                                    </p>
                                    <p className="text-sm text-purple-700">
                                        Contra defeitos de execução
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Assinaturas */}
                        <div className="mt-12 pt-8 border-t">
                            <div className="grid grid-cols-2 gap-12">
                                <div className="text-center">
                                    <div className="border-b border-gray-400 w-full mb-2"></div>
                                    <p className="text-sm text-gray-600">Cliente</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {propostaData.cliente.nome}
                                    </p>
                                </div>

                                <div className="text-center">
                                    <div className="border-b border-gray-400 w-full mb-2"></div>
                                    <p className="text-sm text-gray-600">Minerva Engenharia</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Responsável Técnico
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Observações */}
                        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-2">Observações Importantes:</h4>
                            <ul className="text-sm text-gray-600 space-y-1">
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