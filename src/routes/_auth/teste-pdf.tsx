import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PDFDownloadButton } from '@/components/pdf/pdf-download-button';
import { PDFPreviewModal } from '@/components/pdf/pdf-preview-modal';
import { Badge } from '@/components/ui/badge';
import { FileText, Eye, CheckCircle2 } from 'lucide-react';
import { PDFType } from '@/lib/types';

export const Route = createFileRoute('/_auth/teste-pdf')({
  component: TestePDFPage,
});

function TestePDFPage() {
  const [previewType, setPreviewType] = useState<PDFType | null>(null);
  const [generatedUrls, setGeneratedUrls] = useState<Record<string, string>>({});

  // Dados de exemplo para Proposta
  const dadosProposta = {
    codigoOS: 'OS-TEST-001',
    tipoOS: 'Proposta Comercial',
    dataEmissao: new Date().toISOString(),
    clienteNome: 'João Silva Teste',
    clienteCpfCnpj: '111.444.777-35', // CPF de teste válido
    clienteEmail: 'joao.silva@email.com',
    clienteTelefone: '(11) 98765-4321',
    clienteEndereco: 'Rua Teste, 123 - São Paulo/SP',
    descricaoServico: 'Projeto de instalações elétricas residencial completo, incluindo dimensionamento de circuitos, quadro de distribuição e proteções.',
    valorProposta: 15000,
    prazoEntrega: '30 dias corridos',
    observacoes: 'Proposta válida por 15 dias. Valores não incluem materiais.',
    itens: [
      {
        descricao: 'Projeto elétrico residencial',
        quantidade: 1,
        valorUnitario: 8000,
        valorTotal: 8000
      },
      {
        descricao: 'ART do projeto',
        quantidade: 1,
        valorUnitario: 500,
        valorTotal: 500
      },
      {
        descricao: 'Memorial descritivo',
        quantidade: 1,
        valorUnitario: 1500,
        valorTotal: 1500
      },
      {
        descricao: 'Visita técnica',
        quantidade: 2,
        valorUnitario: 2500,
        valorTotal: 5000
      }
    ],
    empresaNome: 'Minerva Engenharia',
    empresaCnpj: '12.345.678/0001-99',
    empresaEndereco: 'Av. Paulista, 1000 - São Paulo/SP',
    empresaTelefone: '(11) 3000-0000',
    empresaEmail: 'contato@minerva.com.br'
  };

  // Dados de exemplo para Contrato
  const dadosContrato = {
    codigoOS: 'OS-TEST-001',
    numeroContrato: 'CONT-2025-001',
    dataEmissao: new Date().toISOString(),
    dataInicio: '2025-02-01',
    dataTermino: '2025-03-01',
    contratanteNome: 'Maria Santos Teste',
    contratanteCpfCnpj: '391.799.790-77', // CPF de teste válido
    contratanteEndereco: 'Rua das Flores, 456',
    contratanteCidade: 'São Paulo',
    contratanteEstado: 'SP',
    contratadoNome: 'Minerva Engenharia',
    contratadoCnpj: '12.345.678/0001-99',
    contratadoEndereco: 'Av. Paulista, 1000',
    contratadoCidade: 'São Paulo',
    contratadoEstado: 'SP',
    objetoContrato: 'Prestação de serviços de consultoria em engenharia elétrica para projeto residencial completo, incluindo dimensionamento, memorial descritivo e ART.',
    valorContrato: 15000,
    formaPagamento: '50% no início dos trabalhos e 50% na entrega do projeto final.'
  };

  // Dados de exemplo para Memorial
  const dadosMemorial = {
    codigoOS: 'OS-TEST-001',
    titulo: 'Memorial Descritivo - Projeto Elétrico Residencial',
    dataEmissao: new Date().toISOString(),
    clienteNome: 'Carlos Alberto Teste',
    local: 'Residência Unifamiliar - São Paulo/SP',
    secoes: [
      {
        titulo: '1. INTRODUÇÃO',
        conteudo: 'O presente memorial descritivo tem por objetivo apresentar as especificações técnicas do projeto elétrico residencial, contemplando os critérios de dimensionamento, materiais e metodologias aplicadas.'
      },
      {
        titulo: '2. NORMAS APLICÁVEIS',
        conteudo: 'O projeto foi elaborado em conformidade com as seguintes normas: NBR 5410 - Instalações elétricas de baixa tensão, NBR 5419 - Proteção contra descargas atmosféricas, e normas técnicas da concessionária local.'
      },
      {
        titulo: '3. CARACTERÍSTICAS DA INSTALAÇÃO',
        conteudo: 'A residência possui área construída de 250m², com previsão de carga instalada de 25kW. O sistema será alimentado em 220V, bifásico, com quadro de distribuição principal e quadros secundários.'
      },
      {
        titulo: '4. DIMENSIONAMENTO',
        conteudo: 'Os circuitos foram dimensionados considerando os critérios de capacidade de condução de corrente, queda de tensão máxima de 4% e proteção adequada. Foram previstos circuitos independentes para iluminação, tomadas de uso geral e tomadas de uso específico.'
      },
      {
        titulo: '5. MATERIAIS ESPECIFICADOS',
        conteudo: 'Todos os materiais especificados atendem às normas técnicas vigentes. Condutores de cobre, eletrodutos de PVC rígido, disjuntores termomagnéticos e dispositivos DR conforme padrões NBR.'
      }
    ]
  };

  // Dados de exemplo para Documento SST
  const dadosSST = {
    codigoOS: 'OS-TEST-001',
    tipoDocumento: 'Checklist de Segurança - Visita Técnica',
    dataEmissao: new Date().toISOString(),
    clienteNome: 'Pedro Oliveira Teste',
    local: 'Obra Residencial - Rua das Acácias, 789 - São Paulo/SP',
    responsavelTecnico: 'Eng. José Silva - CREA 123456',
    itens: [
      {
        categoria: 'EPIs',
        descricao: 'Capacete de segurança em bom estado',
        status: 'conforme' as const,
        observacao: 'Todos os colaboradores utilizando'
      },
      {
        categoria: 'EPIs',
        descricao: 'Luvas de proteção adequadas ao risco',
        status: 'conforme' as const
      },
      {
        categoria: 'EPIs',
        descricao: 'Óculos de proteção',
        status: 'nao-conforme' as const,
        observacao: '2 colaboradores sem óculos - orientados'
      },
      {
        categoria: 'FERRAMENTAS',
        descricao: 'Ferramentas em bom estado de conservação',
        status: 'conforme' as const
      },
      {
        categoria: 'FERRAMENTAS',
        descricao: 'Isolamento adequado de ferramentas elétricas',
        status: 'conforme' as const
      },
      {
        categoria: 'LOCAL DE TRABALHO',
        descricao: 'Área limpa e organizada',
        status: 'nao-conforme' as const,
        observacao: 'Solicitada limpeza imediata'
      },
      {
        categoria: 'LOCAL DE TRABALHO',
        descricao: 'Sinalização de segurança adequada',
        status: 'conforme' as const
      },
      {
        categoria: 'LOCAL DE TRABALHO',
        descricao: 'Extintores de incêndio disponíveis',
        status: 'conforme' as const,
        observacao: 'Validade ok até 12/2025'
      },
      {
        categoria: 'ELETRICIDADE',
        descricao: 'Quadro elétrico com proteção adequada',
        status: 'conforme' as const
      },
      {
        categoria: 'ELETRICIDADE',
        descricao: 'Instalações elétricas provisórias seguras',
        status: 'n/a' as const,
        observacao: 'Não há instalações provisórias no momento'
      }
    ],
    conclusao: 'Visita técnica realizada com identificação de 2 não conformidades leves, ambas com ações corretivas imediatas determinadas. De modo geral, o canteiro apresenta boas condições de segurança. Recomenda-se nova visita em 15 dias para verificação das correções.'
  };

  const handleSuccess = (tipo: PDFType) => (url: string) => {
    setGeneratedUrls(prev => ({ ...prev, [tipo]: url }));
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-2">
          🧪 Teste de Geração de PDFs
        </h1>
        <p className="text-neutral-600">
          Teste todos os tipos de PDF com dados de exemplo pré-configurados
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card Proposta */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle>Proposta Comercial</CardTitle>
                  <CardDescription>Com itens detalhados</CardDescription>
                </div>
              </div>
              {generatedUrls.proposta && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">4 itens</Badge>
              <Badge variant="outline">R$ 15.000,00</Badge>
              <Badge variant="outline">Cliente completo</Badge>
            </div>

            <div className="flex gap-2">
              <PDFDownloadButton
                tipo="proposta"
                osId="test-001"
                dados={dadosProposta}
                onSuccess={handleSuccess('proposta')}
                size="sm"
                className="flex-1"
              />
              <button
                onClick={() => setPreviewType('proposta')}
                className="px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {generatedUrls.proposta && (
              <a
                href={generatedUrls.proposta}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline block truncate"
              >
                Ver PDF gerado →
              </a>
            )}
          </CardContent>
        </Card>

        {/* Card Contrato */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle>Contrato</CardTitle>
                  <CardDescription>Com cláusulas padrão</CardDescription>
                </div>
              </div>
              {generatedUrls.contrato && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">7 cláusulas</Badge>
              <Badge variant="outline">R$ 15.000,00</Badge>
              <Badge variant="outline">Ambas partes</Badge>
            </div>

            <div className="flex gap-2">
              <PDFDownloadButton
                tipo="contrato"
                osId="test-001"
                dados={dadosContrato}
                onSuccess={handleSuccess('contrato')}
                size="sm"
                className="flex-1"
              />
              <button
                onClick={() => setPreviewType('contrato')}
                className="px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {generatedUrls.contrato && (
              <a
                href={generatedUrls.contrato}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline block truncate"
              >
                Ver PDF gerado →
              </a>
            )}
          </CardContent>
        </Card>

        {/* Card Memorial */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <CardTitle>Memorial Descritivo</CardTitle>
                  <CardDescription>Com 5 seções técnicas</CardDescription>
                </div>
              </div>
              {generatedUrls.memorial && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">5 seções</Badge>
              <Badge variant="outline">Projeto elétrico</Badge>
              <Badge variant="outline">Técnico</Badge>
            </div>

            <div className="flex gap-2">
              <PDFDownloadButton
                tipo="memorial"
                osId="test-001"
                dados={dadosMemorial}
                onSuccess={handleSuccess('memorial')}
                size="sm"
                className="flex-1"
              />
              <button
                onClick={() => setPreviewType('memorial')}
                className="px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {generatedUrls.memorial && (
              <a
                href={generatedUrls.memorial}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline block truncate"
              >
                Ver PDF gerado →
              </a>
            )}
          </CardContent>
        </Card>

        {/* Card SST */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <CardTitle>Documento SST</CardTitle>
                  <CardDescription>Checklist de segurança</CardDescription>
                </div>
              </div>
              {generatedUrls['documento-sst'] && (
                <CheckCircle2 className="w-5 h-5 text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">10 itens</Badge>
              <Badge variant="outline">2 NC</Badge>
              <Badge variant="outline">Segurança</Badge>
            </div>

            <div className="flex gap-2">
              <PDFDownloadButton
                tipo="documento-sst"
                osId="test-001"
                dados={dadosSST}
                onSuccess={handleSuccess('documento-sst')}
                size="sm"
                className="flex-1"
              />
              <button
                onClick={() => setPreviewType('documento-sst')}
                className="px-3 py-2 text-sm border border-neutral-300 rounded-md hover:bg-neutral-50 flex items-center gap-2"
              >
                <Eye className="w-4 h-4" />
              </button>
            </div>

            {generatedUrls['documento-sst'] && (
              <a
                href={generatedUrls['documento-sst']}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline block truncate"
              >
                Ver PDF gerado →
              </a>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modais de Preview */}
      {previewType === 'proposta' && (
        <PDFPreviewModal
          isOpen={true}
          onClose={() => setPreviewType(null)}
          tipo="proposta"
          osId="test-001"
          dados={dadosProposta}
          onSuccess={handleSuccess('proposta')}
        />
      )}

      {previewType === 'contrato' && (
        <PDFPreviewModal
          isOpen={true}
          onClose={() => setPreviewType(null)}
          tipo="contrato"
          osId="test-001"
          dados={dadosContrato}
          onSuccess={handleSuccess('contrato')}
        />
      )}

      {previewType === 'memorial' && (
        <PDFPreviewModal
          isOpen={true}
          onClose={() => setPreviewType(null)}
          tipo="memorial"
          osId="test-001"
          dados={dadosMemorial}
          onSuccess={handleSuccess('memorial')}
        />
      )}

      {previewType === 'documento-sst' && (
        <PDFPreviewModal
          isOpen={true}
          onClose={() => setPreviewType(null)}
          tipo="documento-sst"
          osId="test-001"
          dados={dadosSST}
          onSuccess={handleSuccess('documento-sst')}
        />
      )}
    </div>
  );
}
