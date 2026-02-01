'use client';

/**
 * Formulário Público OS-08: Solicitação de Visita Técnica
 * 
 * Este formulário é acessado externamente por clientes (sem autenticação).
 * Ao submeter, cria uma nova OS-08 com a Etapa 1 concluída.
 * O colaborador interno fará a identificação do cliente na Etapa 2.
 * 
 * Usa FormDetalhesVisita (shared) para campos reutilizáveis.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle2, 
  Send, 
  Building2, 
  Phone, 
  Mail, 
  User, 
  Loader2 
} from 'lucide-react';
import { supabase } from '@/lib/supabase-client';
import { ordensServicoAPI } from '@/lib/api-client';
import { logger } from '@/lib/utils/logger';

// Logo da Minerva
import logoMinerva from '@/img/logo.png';

// Componente compartilhado
import { 
  FormDetalhesVisita, 
  DetalhesSolicitacaoData,
  EMPTY_DETALHES_DATA,
} from '../shared/form-detalhes-visita';

// Interface para dados do solicitante
interface DadosSolicitante {
  nome: string;
  whatsapp: string;
  email: string;
  condominioNome: string;
  cargo: string;
  blocoUnidade: string;
}

// Estado inicial
const INITIAL_SOLICITANTE: DadosSolicitante = {
  nome: '',
  whatsapp: '',
  email: '',
  condominioNome: '',
  cargo: '',
  blocoUnidade: '',
};

export function OS08FormPublico() {
  const [solicitante, setSolicitante] = useState<DadosSolicitante>(INITIAL_SOLICITANTE);
  const [detalhes, setDetalhes] = useState<DetalhesSolicitacaoData>(EMPTY_DETALHES_DATA);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [protocolo, setProtocolo] = useState<string>('');
  const [errors, setErrors] = useState<string[]>([]);

  // Formatadores
  const formatarWhatsapp = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 2) return `(${digits}`;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  // Handlers
  const handleSolicitanteChange = (field: keyof DadosSolicitante, value: string) => {
    if (field === 'whatsapp') {
      value = formatarWhatsapp(value);
    }
    setSolicitante(prev => ({ ...prev, [field]: value }));
  };

  // Ref para validação do formulário de detalhes
  const formDetalhesRef = React.useRef<{ validate: () => boolean }>(null);

  // Submissão
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let validationErrors: string[] = [];

    // Validar dados do solicitante (Simples, manual para não complicar)
    if (!solicitante.nome.trim()) validationErrors.push('Nome do solicitante é obrigatório');
    if (!solicitante.whatsapp.trim()) validationErrors.push('WhatsApp é obrigatório');
    if (!solicitante.email.trim()) validationErrors.push('E-mail é obrigatório');
    if (!solicitante.email.includes('@')) validationErrors.push('E-mail inválido');
    if (!solicitante.condominioNome.trim()) validationErrors.push('Nome do condomínio é obrigatório');

    // Validar detalhes usando o ref do componente com Zod
    const isDetalhesValid = formDetalhesRef.current?.validate();
    if (!isDetalhesValid) {
        validationErrors.push('Verifique os campos obrigatórios nos detalhes da solicitação');
    }

    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      // Scroll para o topo se houver erros gerais
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setErrors([]);
    setIsSubmitting(true);

    try {
      logger.log('[OS08FormPublico] 🚀 Iniciando criação de OS pública...');

      // Buscar tipo de OS
      const tiposOS = await ordensServicoAPI.getTiposOS();
      const tipoOS08 = tiposOS.find((t: { codigo: string }) => t.codigo === 'OS-08');

      if (!tipoOS08) {
        throw new Error('Tipo de OS OS-08 não encontrado no sistema');
      }

      // Dados do formulário
      const dadosFormulario = {
        solicitante: { ...solicitante },
        detalhes: {
          ...detalhes,
          arquivos: detalhes.arquivos?.map(a => ({
            name: a.name,
            comentario: a.comentario,
          })) || [],
        },
        origemFormularioPublico: true,
        dataSubmissao: new Date().toISOString(),
      };

      // Criar OS
      const { data: novaOS, error: createError } = await supabase
        .from('ordens_servico')
        .insert({
          tipo_os_id: tipoOS08.id,
          status_geral: 'em_triagem',
          status_situacao: 'acao_pendente',
          descricao: `Visita Técnica - ${solicitante.condominioNome}`,
          dados_publicos: dadosFormulario,
          data_entrada: new Date().toISOString(),
        })
        .select('id, codigo_os')
        .single();

      if (createError) {
        logger.error('[OS08FormPublico] ❌ Erro ao criar OS:', createError);
        throw createError;
      }

      logger.log('[OS08FormPublico] ✅ OS criada:', novaOS);

      // Criar etapas da OS
      const etapasData = [
        { os_id: novaOS.id, ordem: 1, nome_etapa: 'Detalhes da Solicitação', status: 'concluida' as const, dados_etapa: dadosFormulario },
        { os_id: novaOS.id, ordem: 2, nome_etapa: 'Identificação do Cliente', status: 'pendente' as const, dados_etapa: {} },
        { os_id: novaOS.id, ordem: 3, nome_etapa: 'Agendar Visita', status: 'pendente' as const, dados_etapa: {} },
        { os_id: novaOS.id, ordem: 4, nome_etapa: 'Realizar Visita', status: 'pendente' as const, dados_etapa: {} },
        { os_id: novaOS.id, ordem: 5, nome_etapa: 'Formulário Pós-Visita', status: 'pendente' as const, dados_etapa: {} },
        { os_id: novaOS.id, ordem: 6, nome_etapa: 'Gerar Documento', status: 'pendente' as const, dados_etapa: {} },
        { os_id: novaOS.id, ordem: 7, nome_etapa: 'Enviar ao Cliente', status: 'pendente' as const, dados_etapa: {} },
      ];

      const { error: etapasError } = await supabase
        .from('os_etapas')
        .insert(etapasData);

      if (etapasError) {
        logger.error('[OS08FormPublico] ❌ Erro ao criar etapas:', etapasError);
      }

      setProtocolo(novaOS.codigo_os);
      setSubmitSuccess(true);

    } catch (error) {
      logger.error('[OS08FormPublico] ❌ Erro ao submeter:', error);
      setErrors(['Erro ao enviar solicitação. Tente novamente.']);
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
                  Sua solicitação de visita técnica foi registrada e encaminhada para agendamento.
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
                  <span>Equipe técnica entrará em contato para agendamento</span>
                </li>
                <li className="flex items-start gap-3 text-sm text-muted-foreground">
                  <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <span>Parecer técnico será enviado após a vistoria</span>
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
            Solicitação de Visita Técnica
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Preencha o formulário abaixo para solicitar uma visita técnica em seu condomínio.
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
                <div className="space-y-2">
                  <Label htmlFor="nome">
                    Nome Completo <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={solicitante.nome}
                    onChange={(e) => handleSolicitanteChange('nome', e.target.value)}
                    placeholder="Seu nome completo"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp">
                    <Phone className="w-4 h-4 inline mr-1" />
                    WhatsApp <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="whatsapp"
                    type="tel"
                    value={solicitante.whatsapp}
                    onChange={(e) => handleSolicitanteChange('whatsapp', e.target.value)}
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="w-4 h-4 inline mr-1" />
                  E-mail <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={solicitante.email}
                  onChange={(e) => handleSolicitanteChange('email', e.target.value)}
                  placeholder="seu@email.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condominio">
                  <Building2 className="w-4 h-4 inline mr-1" />
                  Nome do Condomínio <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="condominio"
                  value={solicitante.condominioNome}
                  onChange={(e) => handleSolicitanteChange('condominioNome', e.target.value)}
                  placeholder="Nome do condomínio"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cargo">Cargo (se colaborador)</Label>
                  <Input
                    id="cargo"
                    value={solicitante.cargo}
                    onChange={(e) => handleSolicitanteChange('cargo', e.target.value)}
                    placeholder="Ex: Síndico, Zelador"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blocoUnidade">Bloco/Unidade (se morador)</Label>
                  <Input
                    id="blocoUnidade"
                    value={solicitante.blocoUnidade}
                    onChange={(e) => handleSolicitanteChange('blocoUnidade', e.target.value)}
                    placeholder="Ex: Bloco A, Apto 101"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Detalhes da Solicitação (Componente Compartilhado) */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhes da Solicitação</CardTitle>
              <CardDescription>
                Informe os detalhes técnicos da vistoria solicitada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormDetalhesVisita
                ref={formDetalhesRef}
                data={detalhes}
                onDataChange={setDetalhes}
                variant="public"
                useCards={false}
              />
            </CardContent>

            <CardFooter className="flex-col space-y-4">
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
