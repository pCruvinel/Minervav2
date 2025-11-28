// OS 07: Página de Análise e Parecer - Sistema Minerva ERP
'use client';

import { logger } from '@/lib/utils/logger';
import React, { useState } from 'react';
import {
  ArrowLeft,
  FileText,
  CheckCircle2,
  XCircle,
  FileDown,
  Send,
  AlertCircle,
  User,
  Calendar,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Switch } from '../ui/switch';
import { toast } from '../../lib/utils/safe-toast';
import { usePDFGeneration } from '@/lib/hooks/use-pdf-generation';

interface OS07AnalisePageProps {
  osId: string;
  onBack?: () => void;
}

export function OS07AnalisePage({ osId, onBack }: OS07AnalisePageProps) {
  const [aprovarReforma, setAprovarReforma] = useState(true);
  const [comentarioEngenharia, setComentarioEngenharia] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { generating: generatingPDF, generate: generatePDF } = usePDFGeneration();

  // Dados mock do formulário recebido
  const dadosFormulario = {
    nomeSolicitante: 'João da Silva',
    contato: '(11) 98765-4321',
    email: 'joao.silva@email.com',
    condominio: 'Edifício Jardim das Flores',
    bloco: 'Torre A',
    unidade: '302',
    alteracoes: [
      {
        sistema: 'Elétrica',
        item: 'Instalação de ar-condicionado split',
        geraRuido: 'Sim',
        dataInicio: '2024-12-01',
        dataFim: '2024-12-05',
      },
      {
        sistema: 'Cívil (paredes e afins)',
        item: 'Demolição de parede não estrutural',
        geraRuido: 'Sim',
        dataInicio: '2024-12-01',
        dataFim: '2024-12-03',
      },
    ],
    executores: [
      {
        nome: 'Carlos Alberto Oliveira',
        cpf: '123.456.789-00',
      },
      {
        nome: 'Maria Santos',
        cpf: '987.654.321-00',
      },
    ],
    planoDescarte: 'Os resíduos serão descartados em caçamba contratada com empresa especializada em entulho de construção civil. A caçamba ficará alocada no estacionamento por período de 5 dias.',
    tiposObra: [
      '1. Instalação de ar-condicionado',
      '2. Demolição ou construção de alvenaria',
      '11. Pintura',
    ],
    precisaART: true,
    dataEnvio: '2024-11-14T10:30:00',
  };

  const handleGerarParecer = async () => {
    if (!aprovarReforma && !comentarioEngenharia.trim()) {
      toast.error('Adicione um comentário explicando a reprovação');
      return;
    }

    setIsSubmitting(true);

    try {
      const parecer = {
        aprovado: aprovarReforma,
        comentario: comentarioEngenharia,
        dataAnalise: new Date().toISOString(),
        analista: 'Gestor de Assessoria',
      };

      logger.log('📄 Gerando parecer:', parecer);

      // TODO: Salvar análise no banco de dados (metadata.analise da OS)
      // await supabase.from('ordens_servico').update({
      //   metadata: { analise: parecer }
      // }).eq('id', osId);

      // Gerar PDF do parecer
      logger.log('📄 Gerando PDF do parecer...');
      const result = await generatePDF('parecer-reforma', osId, {});

      if (result?.success) {
        logger.log('✅ PDF gerado com sucesso:', result.url);
        toast.success(
          aprovarReforma
            ? 'Parecer aprovado! PDF gerado com sucesso.'
            : 'Parecer de reprovação gerado com sucesso.'
        );

        // Redirecionar ou fechar
        setTimeout(() => {
          if (onBack) {
            onBack();
          }
        }, 1500);
      } else {
        throw new Error('Falha ao gerar PDF');
      }
    } catch (error) {
      logger.error('Erro ao gerar parecer:', error);
      toast.error('Erro ao gerar parecer. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            {onBack && (
              <Button variant="ghost" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Análise e Parecer Técnico</h1>
              <p className="text-neutral-600 mt-1">
                Revise os dados enviados e emita seu parecer
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna Principal - Dados do Formulário */}
          <div className="lg:col-span-2 space-y-6">
            {/* Informações da OS */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Informações da Solicitação</CardTitle>
                  <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                    {osId}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-600 mb-1">Data de Envio</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-neutral-400" />
                      <p className="font-medium">
                        {new Date(dadosFormulario.dataEnvio).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-600 mb-1">Condomínio</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-neutral-400" />
                      <p className="font-medium">{dadosFormulario.condominio}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-neutral-600 mb-1">Unidade</p>
                    <p className="font-medium">
                      {dadosFormulario.bloco} - {dadosFormulario.unidade}
                    </p>
                  </div>
                  <div>
                    <p className="text-neutral-600 mb-1">Requer ART</p>
                    <Badge variant="outline" className={dadosFormulario.precisaART ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}>
                      {dadosFormulario.precisaART ? 'Sim' : 'Não'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Dados do Solicitante */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  Dados do Solicitante
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-neutral-600 mb-1">Nome</p>
                    <p className="font-medium">{dadosFormulario.nomeSolicitante}</p>
                  </div>
                  <div>
                    <p className="text-neutral-600 mb-1">Contato</p>
                    <p className="font-medium">{dadosFormulario.contato}</p>
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-neutral-600 mb-1">Email</p>
                    <p className="font-medium">{dadosFormulario.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alterações Propostas */}
            <Card>
              <CardHeader>
                <CardTitle>Alterações Propostas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dadosFormulario.alteracoes.map((alt, index) => (
                    <div key={index} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                      <div className="flex items-start justify-between mb-3">
                        <p className="text-sm font-medium">Alteração {index + 1}</p>
                        <Badge variant="outline" className={alt.geraRuido === 'Sim' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}>
                          {alt.geraRuido === 'Sim' ? '🔊 Gera Ruído' : '🔇 Sem Ruído'}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-neutral-600 mb-1">Sistema</p>
                          <p className="font-medium">{alt.sistema}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 mb-1">Item</p>
                          <p className="font-medium">{alt.item}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 mb-1">Início Previsto</p>
                          <p className="font-medium">{new Date(alt.dataInicio).toLocaleDateString('pt-BR')}</p>
                        </div>
                        <div>
                          <p className="text-neutral-600 mb-1">Fim Previsto</p>
                          <p className="font-medium">{new Date(alt.dataFim).toLocaleDateString('pt-BR')}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Executores */}
            <Card>
              <CardHeader>
                <CardTitle>Executores da Obra</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dadosFormulario.executores.map((exec, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border border-neutral-200 rounded-lg bg-neutral-50">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{exec.nome}</p>
                        <p className="text-xs text-neutral-600">CPF: {exec.cpf}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Plano de Descarte */}
            <Card>
              <CardHeader>
                <CardTitle>Plano de Descarte</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-700 bg-neutral-50 border border-neutral-200 rounded p-4">
                  {dadosFormulario.planoDescarte}
                </p>
              </CardContent>
            </Card>

            {/* Tipos de Obra */}
            <Card>
              <CardHeader>
                <CardTitle>Tipos de Obra Selecionados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dadosFormulario.tiposObra.map((tipo, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <span>{tipo}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Lateral - Parecer */}
          <div className="lg:col-span-1 space-y-6">
            {/* Formulário de Parecer */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Emitir Parecer</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Switch Aprovar */}
                <div className="space-y-3">
                  <Label>Decisão</Label>
                  <div className="flex items-center justify-between p-4 border-2 border-neutral-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">
                        {aprovarReforma ? 'Aprovar Reforma' : 'Reprovar Reforma'}
                      </p>
                      <p className="text-xs text-neutral-600 mt-1">
                        {aprovarReforma 
                          ? 'A reforma está de acordo com as normas'
                          : 'A reforma não atende aos requisitos'
                        }
                      </p>
                    </div>
                    <Switch
                      checked={aprovarReforma}
                      onCheckedChange={setAprovarReforma}
                    />
                  </div>
                </div>

                {/* Comentário */}
                <div className="space-y-2">
                  <Label htmlFor="comentario">
                    Comentário da Engenharia 
                    {!aprovarReforma && <span className="text-red-500"> *</span>}
                  </Label>
                  <Textarea
                    id="comentario"
                    value={comentarioEngenharia}
                    onChange={(e) => setComentarioEngenharia(e.target.value)}
                    placeholder={
                      aprovarReforma
                        ? 'Adicione observações ou recomendações (opcional)...'
                        : 'Explique os motivos da reprovação...'
                    }
                    rows={6}
                  />
                  {!aprovarReforma && (
                    <p className="text-xs text-amber-600">
                      <AlertCircle className="w-3 h-3 inline mr-1" />
                      Obrigatório informar o motivo da reprovação
                    </p>
                  )}
                </div>

                {/* Botão de Gerar Parecer */}
                <PrimaryButton
                  onClick={handleGerarParecer}
                  disabled={isSubmitting || generatingPDF || (!aprovarReforma && !comentarioEngenharia.trim())}
                  isLoading={isSubmitting || generatingPDF}
                  loadingText={generatingPDF ? 'Gerando PDF...' : 'Salvando...'}
                  className={aprovarReforma ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  {!isSubmitting && !generatingPDF && (
                    <>
                      {aprovarReforma ? (
                        <CheckCircle2 className="w-4 h-4 mr-2" />
                      ) : (
                        <XCircle className="w-4 h-4 mr-2" />
                      )}
                    </>
                  )}
                  Gerar e Enviar Parecer
                </PrimaryButton>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-900">
                    <FileDown className="w-3 h-3 inline mr-1" />
                    O parecer será gerado em PDF e enviado automaticamente para o email do solicitante.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Ações Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Documentos Anexados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {dadosFormulario.precisaART && (
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    ART_RRT.pdf
                  </Button>
                )}
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Projeto_Alteracao.pdf
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
