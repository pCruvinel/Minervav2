'use client';

/**
 * Formulário Público OS-07: Solicitação de Reforma
 * 
 * Este formulário é acessado externamente por clientes (sem autenticação).
 * Ao submeter, cria uma nova OS-07 com a Etapa 1 concluída.
 * O colaborador interno fará a identificação do cliente na Etapa 2.
 * 
 * Usa FormDetalhesReforma (shared) para campos reutilizáveis.
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FormInput } from '@/components/ui/form-input';
import { toast } from '@/lib/utils/safe-toast';
import { 
  CheckCircle2, 
  Send, 
  User, 
  Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { ordensServicoAPI } from '@/lib/api-client';
import { logger } from '@/lib/utils/logger';

// Logo da Minerva
import logoMinerva from '@/img/logo.png';

// Hook de validação
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { dadosSolicitanteSchema, DadosSolicitanteFormData } from '@/lib/validations/os07-schema';

// Componente compartilhado
import { 
  FormDetalhesReforma, 
  FormDetalhesReformaRef,
  DetalhesReformaData,
  EMPTY_REFORMA_DATA,
  temIntervencaoCritica,
} from '../shared/form-detalhes-reforma';

// Estado inicial
const INITIAL_SOLICITANTE: DadosSolicitanteFormData = {
  nome: '',
  whatsapp: '',
  email: '',
  condominioNome: '',
  bloco: '',
  unidade: '',
};

export function OS07FormPublicoNovo() {
  const [solicitante, setSolicitante] = useState<DadosSolicitanteFormData>(INITIAL_SOLICITANTE);
  const [detalhesReforma, setDetalhesReforma] = useState<DetalhesReformaData>(EMPTY_REFORMA_DATA);
  const formRef = useRef<FormDetalhesReformaRef>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [protocolo, setProtocolo] = useState<string>('');

  // Hook de validação para Dados do Solicitante
  const {
    errors: solicitanteErrors,
    touched: solicitanteTouched,
    validateField: validateSolicitanteField,
    markFieldTouched: markSolicitanteTouched,
    validateAll: validateAllSolicitante,
    markAllTouched: markAllSolicitanteTouched
  } = useFieldValidation(dadosSolicitanteSchema);

  // Verificar se tem intervenções críticas
  const critico = temIntervencaoCritica(detalhesReforma.intervencoesSelecionadas);

  // Formatadores
  const formatarWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Handlers
  const handleSolicitanteChange = (field: keyof DadosSolicitanteFormData, value: string) => {
    let finalValue = value;
    if (field === 'whatsapp') {
      finalValue = formatarWhatsapp(value);
    }
    
    setSolicitante(prev => ({ ...prev, [field]: finalValue }));
    
    // Validar se estiver tocado (ou sempre, dependendo da UX desejada, mas o padrão é if touched)
    if (solicitanteTouched[field]) {
      validateSolicitanteField(field, finalValue);
    }
  };

  const handleSolicitanteBlur = (field: keyof DadosSolicitanteFormData) => {
    markSolicitanteTouched(field);
    validateSolicitanteField(field, solicitante[field]);
  };

  // Submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validar Solicitante
    markAllSolicitanteTouched();
    const isSolicitanteValid = validateAllSolicitante(solicitante);

    // 2. Validar Detalhes da Reforma (componente filho)
    // O componente filho já marca seus campos como touched se falhar
    const isReformaValid = formRef.current?.validate();
    
    if (!isSolicitanteValid || !isReformaValid) {
      toast.error('Verifique os campos obrigatórios destacados em vermelho.');
      
      // Scroll para o topo se erro no solicitante
      if (!isSolicitanteValid) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setIsSubmitting(true);

    try {
      logger.log('[OS07FormPublicoNovo] 🚀 Iniciando criação de OS pública...');

      // Buscar tipo de OS
      const tiposOS = await ordensServicoAPI.getTiposOS();
      const tipoOS07 = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-07');

      if (!tipoOS07) {
        throw new Error('Tipo de OS OS-07 não encontrado no sistema');
      }

      // Dados do formulário
      const dadosFormulario = {
        solicitante: { ...solicitante },
        // Mapping para compatibilidade
        intervencoes: detalhesReforma.intervencoesSelecionadas,
        temIntervencaoCritica: critico,
        discriminacoes: detalhesReforma.discriminacoes,
        planoDescarte: detalhesReforma.planoDescarte,
        executores: detalhesReforma.executores,
        arquivos: {
          art: detalhesReforma.arquivosART.map(a => ({ name: a.name, url: a.url })),
          projeto: detalhesReforma.arquivosProjeto.map(a => ({ name: a.name, url: a.url })),
        },
        origemFormularioPublico: true,
        dataSubmissao: new Date().toISOString(),
      };

      // Criar OS
      const { data: novaOS, error: createError } = await supabase
        .from('ordens_servico')
        .insert({
          tipo_os_id: tipoOS07.id,
          status_geral: 'em_triagem',
          status_situacao: 'acao_pendente',
          descricao: `Solicitação de Reforma - ${solicitante.condominioNome} - ${solicitante.unidade}`,
          dados_publicos: dadosFormulario,
          data_entrada: new Date().toISOString(),
        })
        .select('id, codigo_os')
        .single();

      if (createError) {
        logger.error('[OS07FormPublicoNovo] ❌ Erro ao criar OS:', createError);
        throw createError;
      }

      logger.log('[OS07FormPublicoNovo] ✅ OS criada:', novaOS);

      // Criar etapas da OS
      const etapasData = [
        { os_id: novaOS.id, ordem: 1, nome_etapa: 'Detalhes da Solicitação', status: 'concluida' as const, dados_etapa: dadosFormulario },
        { os_id: novaOS.id, ordem: 2, nome_etapa: 'Identificação do Cliente', status: 'pendente' as const, dados_etapa: {} },
        { os_id: novaOS.id, ordem: 3, nome_etapa: 'Análise e Parecer', status: 'pendente' as const, dados_etapa: {} },
        { os_id: novaOS.id, ordem: 4, nome_etapa: 'Gerar PDF', status: 'pendente' as const, dados_etapa: {} },
        { os_id: novaOS.id, ordem: 5, nome_etapa: 'Concluída', status: 'pendente' as const, dados_etapa: {} },
      ];

      const { error: etapasError } = await supabase
        .from('os_etapas')
        .insert(etapasData);

      if (etapasError) {
        logger.error('[OS07FormPublicoNovo] ❌ Erro ao criar etapas:', etapasError);
      }

      setProtocolo(novaOS.codigo_os);
      setSubmitSuccess(true);

    } catch (error) {
      logger.error('[OS07FormPublicoNovo] ❌ Erro ao submeter:', error);
      toast.error('Erro ao enviar solicitação. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Tela de sucesso
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
        <Card className="max-w-lg w-full text-center shadow-sm">
          <CardContent className="pt-12 pb-10 space-y-8">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-success" />
              </div>
              
              <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                  Solicitação Recebida
                </h2>
                <p className="text-muted-foreground max-w-sm mx-auto">
                  Sua solicitação de reforma foi registrada com sucesso e está em análise.
                </p>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-6 space-y-2 border border-border mx-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Número do Protocolo</p>
              <p className="text-3xl font-mono font-medium text-foreground tracking-tight">{protocolo}</p>
            </div>

            <div className="text-left mx-6 space-y-4">
              <h3 className="text-sm font-medium text-foreground border-b border-border pb-2">
                Próximos Passos
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <span>Confirmação enviada para seu e-mail</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <span>Análise técnica será realizada em até 5 dias úteis</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <span>Parecer final será encaminhado digitalmente</span>
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-background py-8 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header com Logo */}
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <img src={logoMinerva} alt="Minerva" className="h-16 w-auto" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">
            Solicitação de Reforma
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Preencha o formulário abaixo para comunicar uma reforma em sua unidade.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Card 1: Identificação do Solicitante */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Identificação do Solicitante
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormInput
                  id="nome"
                  label="Nome Completo"
                  required
                  placeholder="Seu nome completo"
                  value={solicitante.nome}
                  onChange={(e) => handleSolicitanteChange('nome', e.target.value)}
                  onBlur={() => handleSolicitanteBlur('nome')}
                  error={solicitanteTouched.nome ? solicitanteErrors.nome : undefined}
                  success={solicitanteTouched.nome && !solicitanteErrors.nome}
                />

                <FormInput
                  id="whatsapp"
                  label="WhatsApp"
                  required
                  placeholder="(00) 00000-0000"
                  value={solicitante.whatsapp}
                  onChange={(e) => handleSolicitanteChange('whatsapp', e.target.value)}
                  onBlur={() => handleSolicitanteBlur('whatsapp')}
                  error={solicitanteTouched.whatsapp ? solicitanteErrors.whatsapp : undefined}
                  success={solicitanteTouched.whatsapp && !solicitanteErrors.whatsapp}
                />
              </div>

              <div className="space-y-1">
                <FormInput
                  id="email"
                  label="E-mail"
                  type="email"
                  required
                  placeholder="seu@email.com"
                  value={solicitante.email}
                  onChange={(e) => handleSolicitanteChange('email', e.target.value)}
                  onBlur={() => handleSolicitanteBlur('email')}
                  error={solicitanteTouched.email ? solicitanteErrors.email : undefined}
                  success={solicitanteTouched.email && !solicitanteErrors.email}
                  helperText="Você receberá o termo consolidado neste e-mail"
                />
              </div>

              <FormInput
                id="condominio"
                label="Nome do Condomínio"
                required
                placeholder="Nome do condomínio"
                value={solicitante.condominioNome}
                onChange={(e) => handleSolicitanteChange('condominioNome', e.target.value)}
                onBlur={() => handleSolicitanteBlur('condominioNome')}
                error={solicitanteTouched.condominioNome ? solicitanteErrors.condominioNome : undefined}
                success={solicitanteTouched.condominioNome && !solicitanteErrors.condominioNome}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormInput
                  id="bloco"
                  label="Bloco/Torre"
                  placeholder="Ex: A, Torre 1"
                  value={solicitante.bloco}
                  onChange={(e) => handleSolicitanteChange('bloco', e.target.value)}
                  onBlur={() => handleSolicitanteBlur('bloco')}
                  error={solicitanteTouched.bloco ? solicitanteErrors.bloco : undefined}
                />

                <FormInput
                  id="unidade"
                  label="Unidade"
                  required
                  placeholder="Ex: 101, 1502"
                  value={solicitante.unidade}
                  onChange={(e) => handleSolicitanteChange('unidade', e.target.value)}
                  onBlur={() => handleSolicitanteBlur('unidade')}
                  error={solicitanteTouched.unidade ? solicitanteErrors.unidade : undefined}
                  success={solicitanteTouched.unidade && !solicitanteErrors.unidade}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cards de Detalhes da Reforma (Componente Compartilhado) */}
          <FormDetalhesReforma
            ref={formRef}
            data={detalhesReforma}
            onDataChange={setDetalhesReforma}
            variant="public"
          />

          {/* Card de Submissão */}
          <Card>
            <CardFooter className="flex-col space-y-4 pt-6">
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Enviar Solicitação
                  </>
                )}
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Ao enviar, você concorda com nossa política de privacidade.
              </p>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}
