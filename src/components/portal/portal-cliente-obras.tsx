import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Separator } from '../ui/separator';
import {
  Download,
  FileText,
  Image as ImageIcon,
  Calendar,
  Users,
  CloudRain,
  Sun,
  DollarSign,
  Phone,
  MessageCircle,
  AlertCircle,
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';

interface RelatorioDiario {
  id: string;
  data: string;
  resumo: string;
  clima: 'SOL' | 'NUBLADO' | 'CHUVA';
  efetivo: number;
  fotos: string[];
  atividadesRealizadas: string[];
}

const mockRelatorios: RelatorioDiario[] = [
  {
    id: 'rel-1',
    data: '2024-11-15',
    resumo: 'Avanço da estrutura do segundo pavimento com concretagem parcial.',
    clima: 'SOL',
    efetivo: 12,
    fotos: [
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=400',
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=400',
    ],
    atividadesRealizadas: [
      'Concretagem de laje do 2º pavimento (60% concluído)',
      'Instalação de tubulação elétrica',
      'Alvenaria de vedação - área de serviço',
    ],
  },
  {
    id: 'rel-2',
    data: '2024-11-14',
    resumo: 'Preparação de formas e armação para concretagem.',
    clima: 'NUBLADO',
    efetivo: 10,
    fotos: [
      'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400',
    ],
    atividadesRealizadas: [
      'Montagem de formas para laje',
      'Posicionamento de armações de ferro',
      'Inspeção de segurança do trabalho',
    ],
  },
];

const mockDocumentos = [
  { id: 'doc-1', nome: 'Cronograma da Obra - Atualizado', tipo: 'PDF', dataUpload: '2024-11-01' },
  { id: 'doc-2', nome: 'Contrato de Execução', tipo: 'PDF', dataUpload: '2024-08-15' },
  { id: 'doc-3', nome: 'ART - Anotação de Responsabilidade Técnica', tipo: 'PDF', dataUpload: '2024-08-15' },
  { id: 'doc-4', nome: 'Termo de Garantia', tipo: 'PDF', dataUpload: '2024-08-15' },
];

const mockParcelas = [
  { id: 'parc-1', numero: 11, vencimento: '2024-11-10', valor: 31666.67, status: 'PAGO' },
  { id: 'parc-2', numero: 12, vencimento: '2024-12-10', valor: 31666.67, status: 'EM_ABERTO' },
  { id: 'parc-3', numero: 13, vencimento: '2025-01-10', valor: 31666.66, status: 'EM_ABERTO' },
];

export function PortalClienteObras() {
  const [relatorios] = useState(mockRelatorios);

  const percentualConclusao = 72; // Mock

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const getClimaIcon = (clima: RelatorioDiario['clima']) => {
    switch (clima) {
      case 'SOL':
        return <Sun className="h-5 w-5 text-amber-500" />;
      case 'NUBLADO':
        return <CloudRain className="h-5 w-5 text-neutral-500" />;
      case 'CHUVA':
        return <CloudRain className="h-5 w-5 text-blue-500" />;
    }
  };

  const handleDownloadDocumento = (docId: string) => {
    console.log('Download documento:', docId);
  };

  const handleContatoWhatsApp = () => {
    window.open('https://wa.me/5511987654321?text=Olá, gostaria de falar sobre minha obra.', '_blank');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header com Logos */}
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl mb-1">Portal do Cliente</h1>
              <p className="text-sm text-muted-foreground">Shopping Norte Ltda - Reforma Comercial</p>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Cliente</p>
                <p className="text-sm font-medium">Shopping Norte</p>
              </div>
              <Separator orientation="vertical" className="h-12" />
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Parceria com</p>
                <p className="text-lg font-bold" style={{ color: '#D3AF37' }}>Minerva Engenharia</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-6 space-y-6">
        {/* Barra de Progresso da Obra */}
        <Card className="border-primary/20 shadow-lg">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl font-medium mb-1">Progresso da Obra</h3>
                <p className="text-sm text-muted-foreground">
                  Acompanhe a evolução da sua reforma em tempo real
                </p>
              </div>
              <div className="text-right">
                <p className="text-4xl font-bold text-primary">{percentualConclusao}%</p>
                <p className="text-xs text-muted-foreground">Concluído</p>
              </div>
            </div>
            <Progress value={percentualConclusao} className="h-3" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span>Início: 15/08/2024</span>
              <span>Previsão de Término: 28/02/2025</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feed Diário de Obras */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Relatórios Diários da Obra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {relatorios.map((relatorio) => (
                  <div key={relatorio.id} className="border-b pb-6 last:border-b-0 last:pb-0">
                    {/* Data e Clima */}
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">{formatDate(relatorio.data)}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          {getClimaIcon(relatorio.clima)}
                          <span className="capitalize">{relatorio.clima.toLowerCase()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{relatorio.efetivo} colaboradores</span>
                        </div>
                      </div>
                    </div>

                    {/* Resumo */}
                    <p className="text-sm text-muted-foreground mb-3">{relatorio.resumo}</p>

                    {/* Fotos */}
                    {relatorio.fotos.length > 0 && (
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        {relatorio.fotos.map((foto, idx) => (
                          <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border">
                            <ImageWithFallback
                              src={foto}
                              alt={`Foto da obra ${idx + 1}`}
                              className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Atividades */}
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Atividades Realizadas:
                      </p>
                      <ul className="space-y-1">
                        {relatorio.atividadesRealizadas.map((atividade, idx) => (
                          <li key={idx} className="text-sm flex items-start gap-2">
                            <span className="text-primary mt-1">•</span>
                            <span>{atividade}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar - Documentos e Financeiro */}
          <div className="space-y-6">
            {/* Documentos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Documentos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockDocumentos.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-start justify-between gap-2 p-3 border rounded-lg hover:bg-neutral-50 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.nome}</p>
                      <p className="text-xs text-muted-foreground">
                        Enviado em {formatDate(doc.dataUpload)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocumento(doc.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Financeiro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  Próximas Parcelas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockParcelas.map((parcela) => (
                  <div
                    key={parcela.id}
                    className="p-3 border rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Parcela {parcela.numero}/13</span>
                      {parcela.status === 'pago' ? (
                        <Badge className="bg-green-100 text-green-800">Pago</Badge>
                      ) : (
                        <Badge variant="outline">Em Aberto</Badge>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        Venc: {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
                      </span>
                      <span className="font-medium">{formatCurrency(parcela.valor)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Contato */}
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-6">
                <div className="text-center">
                  <MessageCircle className="h-10 w-10 text-green-600 mx-auto mb-3" />
                  <h4 className="font-medium mb-2">Precisa de Ajuda?</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Entre em contato conosco pelo WhatsApp
                  </p>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    onClick={handleContatoWhatsApp}
                  >
                    <Phone className="mr-2 h-4 w-4" />
                    Falar no WhatsApp
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Botão Flutuante WhatsApp */}
      <button
        onClick={handleContatoWhatsApp}
        className="fixed bottom-6 right-6 bg-green-600 hover:bg-green-700 text-white rounded-full p-4 shadow-lg transition-all hover:scale-110"
        title="Contato WhatsApp"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </div>
  );
}