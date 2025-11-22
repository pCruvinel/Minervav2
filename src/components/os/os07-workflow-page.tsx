// OS 07: Termo de Comunicação de Reforma - Sistema Minerva ERP
'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, Link as LinkIcon, CheckCircle2, Copy, ExternalLink, Clock } from 'lucide-react';
import { StepIdentificacaoLeadCompleto, type StepIdentificacaoLeadCompletoHandle } from './steps/shared/step-identificacao-lead-completo';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { toast } from '../../lib/utils/safe-toast';

interface OS07WorkflowPageProps {
  onBack?: () => void;
}

type EtapaOS07 = 'identificacao' | 'aguardando_cliente' | 'analise' | 'gerar_pdf' | 'concluida';

export function OS07WorkflowPage({ onBack }: OS07WorkflowPageProps) {
  const [etapaAtual, setEtapaAtual] = useState<EtapaOS07>('identificacao');
  // const [condominio, setCondominio] = useState(''); // Substituído pelo formData
  const [osId, setOsId] = useState('');
  const [linkFormulario, setLinkFormulario] = useState('');

  // Estado para StepIdentificacaoLeadCompleto
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [showLeadCombobox, setShowLeadCombobox] = useState(false);
  const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
  const stepLeadRef = useRef<StepIdentificacaoLeadCompletoHandle>(null);

  const [formData, setFormData] = useState({
    nome: '',
    cpfCnpj: '',
    tipo: '',
    nomeResponsavel: '',
    cargoResponsavel: '',
    telefone: '',
    email: '',
    tipoEdificacao: '',
    qtdUnidades: '',
    qtdBlocos: '',
    qtdPavimentos: '',
    tipoTelhado: '',
    possuiElevador: false,
    possuiPiscina: false,
    cep: '',
    endereco: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
  });

  const handleSelectLead = (leadId: string, leadData?: any) => {
    setSelectedLeadId(leadId);
    if (leadData) {
      setFormData(prev => ({
        ...prev,
        nome: leadData.nome_razao_social || '',
        cpfCnpj: leadData.cpf_cnpj || '',
        email: leadData.email || '',
        telefone: leadData.telefone || '',
        tipo: leadData.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' : 'juridica',
        nomeResponsavel: leadData.nome_responsavel || '',
        cargoResponsavel: leadData.endereco?.cargo_responsavel || '',
        tipoEdificacao: leadData.endereco?.tipo_edificacao || '',
        qtdUnidades: leadData.endereco?.qtd_unidades || '',
        qtdBlocos: leadData.endereco?.qtd_blocos || '',
        qtdPavimentos: leadData.endereco?.qtd_pavimentos || '',
        tipoTelhado: leadData.endereco?.tipo_telhado || '',
        possuiElevador: leadData.endereco?.possui_elevador || false,
        possuiPiscina: leadData.endereco?.possui_piscina || false,
        cep: leadData.endereco?.cep || '',
        endereco: leadData.endereco?.rua || '',
        numero: leadData.endereco?.numero || '',
        complemento: leadData.endereco?.complemento || '',
        bairro: leadData.endereco?.bairro || '',
        cidade: leadData.endereco?.cidade || '',
        estado: leadData.endereco?.estado || '',
      }));
    }
  };

  const handleSaveNewLead = () => {
    setShowNewLeadDialog(false);
    // Em um cenário real, o hook useCreateCliente dentro do componente já salvou no banco
    // e chamou onSelectLead com o novo ID.
    // Aqui apenas garantimos que o dialog feche.
  };

  // Etapa 1: Identificação do Cliente
  const handleIdentificarCliente = () => {
    // Validar formulário
    if (stepLeadRef.current && !stepLeadRef.current.validate()) {
      toast.error('Preencha os campos obrigatórios do cliente');
      return;
    }

    if (!selectedLeadId) {
      toast.error('Selecione um cliente/lead');
      return;
    }

    // Gerar ID da OS e link do formulário
    const novoOsId = `OS-007-${Date.now()}`;
    const baseUrl = window.location.origin;
    const novoLink = `${baseUrl}/reforma/${novoOsId}`;

    setOsId(novoOsId);
    setLinkFormulario(novoLink);
    setEtapaAtual('aguardando_cliente');

    toast.success('OS criada! Copie o link e envie ao cliente.');
  };

  // Copiar link do formulário
  const handleCopiarLink = async () => {
    try {
      await navigator.clipboard.writeText(linkFormulario);
      toast.success('Link copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar link. Tente novamente.');
    }
  };

  // Abrir link em nova aba
  const handleAbrirFormulario = () => {
    window.open(linkFormulario, '_blank');
  };

  // Simular recebimento do formulário
  const handleSimularRecebimento = () => {
    toast.success('Formulário recebido! Avançando para análise...');
    setTimeout(() => {
      setEtapaAtual('analise');
    }, 1000);
  };

  const renderEtapaIdentificacao = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <span className="text-lg font-semibold text-primary">1</span>
          </div>
          <div>
            <CardTitle>Identificação do Cliente/Lead</CardTitle>
            <p className="text-sm text-neutral-600 mt-1">
              Selecione o condomínio ou cliente que solicitará a reforma
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <StepIdentificacaoLeadCompleto
          ref={stepLeadRef}
          selectedLeadId={selectedLeadId}
          onSelectLead={handleSelectLead}
          showCombobox={showLeadCombobox}
          onShowComboboxChange={setShowLeadCombobox}
          showNewLeadDialog={showNewLeadDialog}
          onShowNewLeadDialogChange={setShowNewLeadDialog}
          formData={formData}
          onFormDataChange={setFormData}
          onSaveNewLead={handleSaveNewLead}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-200">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <PrimaryButton onClick={handleIdentificarCliente}>
            Criar OS e Gerar Formulário
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </PrimaryButton>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapaAguardandoCliente = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-cyan-500/10 rounded-lg flex items-center justify-center">
            <span className="text-lg font-semibold text-cyan-600">2</span>
          </div>
          <div>
            <CardTitle>Coletar Dados do Cliente</CardTitle>
            <p className="text-sm text-neutral-600 mt-1">
              Envie o link do formulário ao cliente
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações da OS */}
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-medium mb-1">Ordem de Serviço Criada</p>
              <p className="text-xs text-neutral-600">
                Código: <span className="font-mono font-semibold">{osId}</span>
              </p>
            </div>
            <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
              <Clock className="w-3 h-3 mr-1" />
              Aguardando Cliente
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-neutral-600">
              Condomínio: <span className="font-medium">{formData.nome}</span>
            </p>
          </div>
        </div>

        {/* Link do Formulário */}
        <div className="space-y-3">
          <Label>Link do Formulário Público</Label>

          <div className="bg-white border-2 border-cyan-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <LinkIcon className="w-5 h-5 text-cyan-600" />
              <p className="text-sm font-medium text-cyan-900">
                Formulário de Comunicação de Reforma
              </p>
            </div>

            <div className="bg-neutral-50 border border-neutral-200 rounded p-3 mb-4">
              <p className="text-sm font-mono text-neutral-700 break-all">
                {linkFormulario}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCopiarLink}
                className="bg-cyan-500 hover:bg-cyan-600 text-white"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copiar Link
              </Button>

              <Button
                variant="outline"
                onClick={handleAbrirFormulario}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Abrir Formulário
              </Button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900 font-medium mb-2">
              📋 Instruções:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 ml-4 list-decimal">
              <li>Copie o link do formulário usando o botão acima</li>
              <li>Envie o link ao cliente/solicitante por WhatsApp ou Email</li>
              <li>Aguarde o preenchimento e envio do formulário</li>
              <li>A OS avançará automaticamente após o envio</li>
            </ol>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <Button variant="outline" onClick={() => setEtapaAtual('identificacao')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSimularRecebimento}
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Simular Recebimento (Demo)
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapaAnalise = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/10 rounded-lg flex items-center justify-center">
            <span className="text-lg font-semibold text-purple-600">3</span>
          </div>
          <div>
            <CardTitle>Análise e Parecer</CardTitle>
            <p className="text-sm text-neutral-600 mt-1">
              Formulário recebido! Prossiga para análise técnica.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900 mb-1">
                Formulário Recebido com Sucesso
              </p>
              <p className="text-sm text-green-700">
                O cliente preencheu e enviou todos os dados necessários.
                Prossiga para a análise técnica.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-neutral-200">
          <Button variant="outline" onClick={() => setEtapaAtual('aguardando_cliente')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <PrimaryButton onClick={() => window.location.href = `/os/07/analise/${osId}`}>
            Ir para Análise Técnica
            <CheckCircle2 className="w-4 h-4 ml-2" />
          </PrimaryButton>
        </div>
      </CardContent>
    </Card>
  );

  // Timeline de Etapas
  const renderTimeline = () => {
    const etapas = [
      { id: 'identificacao', numero: 1, titulo: 'Identificação', status: etapaAtual === 'identificacao' ? 'atual' : 'concluida' },
      { id: 'aguardando_cliente', numero: 2, titulo: 'Aguardando Cliente', status: etapaAtual === 'aguardando_cliente' ? 'atual' : etapaAtual === 'identificacao' ? 'pendente' : 'concluida' },
      { id: 'analise', numero: 3, titulo: 'Análise', status: etapaAtual === 'analise' ? 'atual' : ['identificacao', 'aguardando_cliente'].includes(etapaAtual) ? 'pendente' : 'concluida' },
      { id: 'gerar_pdf', numero: 4, titulo: 'Gerar PDF', status: 'pendente' },
      { id: 'concluida', numero: 5, titulo: 'Concluída', status: 'pendente' },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {etapas.map((etapa, index) => (
            <React.Fragment key={etapa.id}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm
                    ${etapa.status === 'concluida' ? 'bg-green-500 text-white' : ''}
                    ${etapa.status === 'atual' ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                    ${etapa.status === 'pendente' ? 'bg-neutral-200 text-neutral-500' : ''}
                  `}
                >
                  {etapa.status === 'concluida' ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    etapa.numero
                  )}
                </div>
                <p
                  className={`
                    text-xs text-center max-w-[80px]
                    ${etapa.status === 'atual' ? 'font-semibold text-primary' : ''}
                    ${etapa.status === 'concluida' ? 'text-green-600' : ''}
                    ${etapa.status === 'pendente' ? 'text-neutral-500' : ''}
                  `}
                >
                  {etapa.titulo}
                </p>
              </div>

              {index < etapas.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${etapa.status === 'concluida' ? 'bg-green-500' : 'bg-neutral-200'}
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">OS 07: Termo de Comunicação de Reforma</h1>
              <p className="text-neutral-600 mt-1">
                Fluxo de análise e aprovação de reformas em unidades
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        {renderTimeline()}

        {/* Conteúdo da Etapa */}
        {etapaAtual === 'identificacao' && renderEtapaIdentificacao()}
        {etapaAtual === 'aguardando_cliente' && renderEtapaAguardandoCliente()}
        {etapaAtual === 'analise' && renderEtapaAnalise()}
      </div>
    </div>
  );
}
