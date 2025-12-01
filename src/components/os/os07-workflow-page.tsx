// OS 07: Termo de Comunicação de Reforma - Sistema Minerva ERP
'use client';

import React, { useState, useRef } from 'react';
import { ArrowLeft, Link as LinkIcon, CheckCircle2, Copy, ExternalLink, Clock, Loader2 } from 'lucide-react';
import { CadastrarLead, type CadastrarLeadHandle } from './steps/shared/cadastrar-lead';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { Badge } from '../ui/badge';
import { Label } from '../ui/label';
import { toast } from '../../lib/utils/safe-toast';
import { useCreateCliente, transformFormToCliente } from '../../lib/hooks/use-clientes';
import { ordensServicoAPI, clientesAPI } from '../../lib/api-client';
import { useAuth } from '../../lib/contexts/auth-context';
import { mapearTipoOSParaCodigo } from '../../lib/utils/os-workflow-helpers';

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
  const stepLeadRef = useRef<CadastrarLeadHandle>(null);

  const { mutate: createCliente, loading: isCreatingClient } = useCreateCliente();
  const [isCreatingOS, setIsCreatingOS] = useState(false);
  const { currentUser } = useAuth();
  const currentUserId = currentUser?.id || 'user-unknown';

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
  const handleIdentificarCliente = async () => {
    // Validar formulário
    if (stepLeadRef.current && !stepLeadRef.current.validate()) {
      toast.error('Preencha os campos obrigatórios do cliente');
      return;
    }

    try {
      setIsCreatingOS(true);
      let leadIdFinal = selectedLeadId;

      // Se não selecionou lead mas preencheu o formulário, criar lead automaticamente
      if (!leadIdFinal) {
        // Transformar dados do formulário para formato do banco
        const clienteData = transformFormToCliente(formData);

        // Adicionar campos obrigatórios que podem faltar no transform
        if (!clienteData.nome_razao_social) clienteData.nome_razao_social = formData.nome;
        if (!clienteData.cpf_cnpj) clienteData.cpf_cnpj = formData.cpfCnpj;

        // Criar cliente
        const novoCliente = await createCliente(clienteData);
        leadIdFinal = novoCliente.id;
        setSelectedLeadId(leadIdFinal);
        toast.success('Cliente cadastrado automaticamente!');
      }

      if (!leadIdFinal) {
        toast.error('Erro ao identificar cliente. Tente novamente.');
        setIsCreatingOS(false);
        return;
      }

      // Criar OS no Supabase
      try {
        // Buscar tipo de OS OS-07
        const tiposOS = await ordensServicoAPI.getTiposOS();
        const tipoOS07 = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-07');

        if (!tipoOS07) {
          throw new Error('Tipo de OS OS-07 não encontrado no sistema');
        }

        // Buscar nome do cliente
        let nomeCliente = 'Cliente';
        try {
          const cliente = await clientesAPI.getById(leadIdFinal);
          nomeCliente = cliente.nome_razao_social || cliente.nome || 'Cliente';
        } catch (error) {
          console.warn('Não foi possível buscar nome do cliente, usando nome genérico');
        }

        // Criar OS no banco
        const novaOS = await ordensServicoAPI.create({
          cliente_id: leadIdFinal,
          tipo_os_id: tipoOS07.id,
          descricao: `OS 07: Termo de Comunicação de Reforma - ${nomeCliente}`,
          criado_por_id: currentUserId,
          status_geral: 'em_andamento',
        });

        // Gerar link do formulário
        const baseUrl = window.location.origin;
        const novoLink = `${baseUrl}/reforma/${novaOS.id}`;

        setOsId(novaOS.id);
        setLinkFormulario(novoLink);
        setEtapaAtual('aguardando_cliente');

        toast.success(`OS ${novaOS.codigo_os} criada! Copie o link e envie ao cliente.`);
      } catch (error) {
        console.error('Erro ao criar OS:', error);
        toast.error('Erro ao criar Ordem de Serviço. Tente novamente.');
        setIsCreatingOS(false);
        return;
      }
    } catch (error) {
      console.error('Erro ao processar cliente:', error);
      toast.error('Erro ao processar dados do cliente');
    } finally {
      setIsCreatingOS(false);
    }
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
            <p className="text-sm text-muted-foreground mt-1">
              Selecione o condomínio ou cliente que solicitará a reforma
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <CadastrarLead
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

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar
            </Button>
          )}
          <PrimaryButton onClick={handleIdentificarCliente} disabled={isCreatingClient || isCreatingOS}>
            {(isCreatingClient || isCreatingOS) ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                Criar OS e Gerar Formulário
                <CheckCircle2 className="w-4 h-4 ml-2" />
              </>
            )}
          </PrimaryButton>
        </div>
      </CardContent>
    </Card>
  );

  const renderEtapaAguardandoCliente = () => (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-info/10 rounded-lg flex items-center justify-center">
            <span className="text-lg font-semibold text-info">2</span>
          </div>
          <div>
            <CardTitle>Coletar Dados do Cliente</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Envie o link do formulário ao cliente
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Informações da OS */}
        <div className="bg-background border border-border rounded-lg p-4">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div>
              <p className="text-sm font-medium mb-1">Ordem de Serviço Criada</p>
              <p className="text-xs text-muted-foreground">
                Código: <span className="font-mono font-semibold">{osId}</span>
              </p>
            </div>
            <Badge variant="outline" className="bg-info/5 text-info border-info/20">
              <Clock className="w-3 h-3 mr-1" />
              Aguardando Cliente
            </Badge>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Condomínio: <span className="font-medium">{formData.nome}</span>
            </p>
          </div>
        </div>

        {/* Link do Formulário */}
        <div className="space-y-3">
          <Label>Link do Formulário Público</Label>

          <div className="bg-white border-2 border-info/20 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <LinkIcon className="w-5 h-5 text-info" />
              <p className="text-sm font-medium text-info">
                Formulário de Comunicação de Reforma
              </p>
            </div>

            <div className="bg-background border border-border rounded p-3 mb-4">
              <p className="text-sm font-mono text-muted-foreground break-all">
                {linkFormulario}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleCopiarLink}
                className="bg-info hover:bg-info text-white"
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

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm text-primary font-medium mb-2">
              📋 Instruções:
            </p>
            <ol className="text-sm text-primary space-y-1 ml-4 list-decimal">
              <li>Copie o link do formulário usando o botão acima</li>
              <li>Envie o link ao cliente/solicitante por WhatsApp ou Email</li>
              <li>Aguarde o preenchimento e envio do formulário</li>
              <li>A OS avançará automaticamente após o envio</li>
            </ol>
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <Button variant="outline" onClick={() => setEtapaAtual('identificacao')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={handleSimularRecebimento}
              className="text-success border-green-600 hover:bg-success/5"
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
          <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
            <span className="text-lg font-semibold text-secondary">3</span>
          </div>
          <div>
            <CardTitle>Análise e Parecer</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Formulário recebido! Prossiga para análise técnica.
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-success/5 border border-success/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-success mb-1">
                Formulário Recebido com Sucesso
              </p>
              <p className="text-sm text-success">
                O cliente preencheu e enviou todos os dados necessários.
                Prossiga para a análise técnica.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-border">
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
                    ${etapa.status === 'concluida' ? 'bg-success text-white' : ''}
                    ${etapa.status === 'atual' ? 'bg-primary text-white ring-4 ring-primary/20' : ''}
                    ${etapa.status === 'pendente' ? 'bg-muted text-muted-foreground' : ''}
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
                    ${etapa.status === 'concluida' ? 'text-success' : ''}
                    ${etapa.status === 'pendente' ? 'text-muted-foreground' : ''}
                  `}
                >
                  {etapa.titulo}
                </p>
              </div>

              {index < etapas.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-2
                    ${etapa.status === 'concluida' ? 'bg-success' : 'bg-muted'}
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
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-info/10 rounded-lg flex items-center justify-center">
              <LinkIcon className="w-6 h-6 text-info" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">OS 07: Termo de Comunicação de Reforma</h1>
              <p className="text-muted-foreground mt-1">
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
