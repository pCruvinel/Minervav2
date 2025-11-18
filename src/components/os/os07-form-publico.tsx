// Formulário Público - OS 07: Termo de Comunicação de Reforma
'use client';

import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Trash2, 
  Upload, 
  AlertCircle,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { PrimaryButton } from '../ui/primary-button';
import { Checkbox } from '../ui/checkbox';
import { toast } from '../../lib/utils/safe-toast';

interface OS07FormPublicoProps {
  osId: string;
  condominioPreenchido?: string;
}

interface Alteracao {
  id: string;
  sistema: string;
  item: string;
  geraRuido: string;
  dataInicio: string;
  dataFim: string;
}

interface Executor {
  id: string;
  nome: string;
  cpf: string;
}

export function OS07FormPublico({ osId, condominioPreenchido = '' }: OS07FormPublicoProps) {
  // Dados Cadastrais
  const [nomeSolicitante, setNomeSolicitante] = useState('');
  const [contato, setContato] = useState('');
  const [email, setEmail] = useState('');
  const [condominio, setCondominio] = useState(condominioPreenchido);
  const [bloco, setBloco] = useState('');
  const [unidade, setUnidade] = useState('');

  // Discriminação - Alterações
  const [alteracoes, setAlteracoes] = useState<Alteracao[]>([]);

  // Executores
  const [executores, setExecutores] = useState<Executor[]>([]);

  // Plano de Descarte
  const [planoDescarte, setPlanoDescarte] = useState('');

  // Tipo de Obra (Checklist)
  const [tiposObra, setTiposObra] = useState<string[]>([]);

  // Anexos
  const [arquivoART, setArquivoART] = useState<File | null>(null);
  const [arquivoProjeto, setArquivoProjeto] = useState<File | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Opções de Sistema
  const sistemasOpcoes = [
    'Elétrica',
    'Cívil (paredes e afins)',
    'HIDRÁULICA',
    'FORRO',
    'ESQUADRIAS (vidros, alumínio e afins)',
  ];

  // Tipos de Obra
  const tiposObraExigemART = [
    '1. Instalação de ar-condicionado',
    '2. Demolição ou construção de alvenaria',
    '3. Abertura de vãos em lajes',
    '4. Fechamento ou envidraçamento de sacadas',
    '5. Instalação de banheira',
    '6. Reformas onde há necessidade de engenheiro eletricista',
    '7. Reparo ou alteração nas instalações de gás',
    '8. Troca de revestimentos com uso de ferramentas de alto impacto',
    '9. Mudança de lugar de pontos de água',
    '10. Outras intervenções estruturais',
  ];

  const tiposObraSimples = [
    '11. Pintura',
    '12. Substituição do forro de gesso',
    '13. Colocação de redes de proteção',
    '14. Pequenos reparos elétricos ou hidráulicos',
    '15. Marcenaria e mobiliário',
    '16. Troca de louças, metais e esquadrias',
    '17. Substituição de luminárias e interruptores',
  ];

  // Adicionar Alteração
  const handleAdicionarAlteracao = () => {
    setAlteracoes([
      ...alteracoes,
      {
        id: Date.now().toString(),
        sistema: '',
        item: '',
        geraRuido: '',
        dataInicio: '',
        dataFim: '',
      },
    ]);
  };

  // Remover Alteração
  const handleRemoverAlteracao = (id: string) => {
    setAlteracoes(alteracoes.filter((alt) => alt.id !== id));
  };

  // Atualizar Alteração
  const handleAtualizarAlteracao = (id: string, campo: keyof Alteracao, valor: string) => {
    setAlteracoes(
      alteracoes.map((alt) =>
        alt.id === id ? { ...alt, [campo]: valor } : alt
      )
    );
  };

  // Adicionar Executor
  const handleAdicionarExecutor = () => {
    setExecutores([
      ...executores,
      {
        id: Date.now().toString(),
        nome: '',
        cpf: '',
      },
    ]);
  };

  // Remover Executor
  const handleRemoverExecutor = (id: string) => {
    setExecutores(executores.filter((exec) => exec.id !== id));
  };

  // Atualizar Executor
  const handleAtualizarExecutor = (id: string, campo: keyof Executor, valor: string) => {
    setExecutores(
      executores.map((exec) =>
        exec.id === id ? { ...exec, [campo]: valor } : exec
      )
    );
  };

  // Formatar CPF
  const formatarCPF = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    return valor;
  };

  // Formatar Telefone
  const formatarTelefone = (valor: string) => {
    const numeros = valor.replace(/\D/g, '');
    if (numeros.length <= 11) {
      return numeros
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return valor;
  };

  // Toggle Tipo de Obra
  const handleToggleTipoObra = (tipo: string) => {
    if (tiposObra.includes(tipo)) {
      setTiposObra(tiposObra.filter((t) => t !== tipo));
    } else {
      setTiposObra([...tiposObra, tipo]);
    }
  };

  // Verificar se precisa de ART
  const precisaART = tiposObra.some((tipo) =>
    tiposObraExigemART.some((exige) => tipo === exige)
  );

  // Validar e Enviar
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validações
    if (!nomeSolicitante.trim()) {
      toast.error('Preencha o nome do solicitante');
      return;
    }

    if (!contato.trim()) {
      toast.error('Preencha o contato');
      return;
    }

    if (!email.trim()) {
      toast.error('Preencha o email');
      return;
    }

    if (!unidade.trim()) {
      toast.error('Preencha a unidade autônoma');
      return;
    }

    if (alteracoes.length === 0) {
      toast.error('Adicione pelo menos uma alteração proposta');
      return;
    }

    // Validar todas as alterações
    for (const alt of alteracoes) {
      if (!alt.sistema || !alt.item || !alt.geraRuido || !alt.dataInicio || !alt.dataFim) {
        toast.error('Preencha todos os campos das alterações');
        return;
      }
    }

    if (executores.length === 0) {
      toast.error('Adicione pelo menos um executor');
      return;
    }

    // Validar executores
    for (const exec of executores) {
      if (!exec.nome.trim() || !exec.cpf.trim()) {
        toast.error('Preencha todos os dados dos executores');
        return;
      }
    }

    if (!planoDescarte.trim()) {
      toast.error('Preencha o plano de descarte');
      return;
    }

    if (tiposObra.length === 0) {
      toast.error('Selecione pelo menos um tipo de obra');
      return;
    }

    if (precisaART && !arquivoART) {
      toast.error('Anexe a ART/RRT (obrigatória para o tipo de obra selecionado)');
      return;
    }

    if (!arquivoProjeto) {
      toast.error('Anexe o projeto da alteração');
      return;
    }

    setIsSubmitting(true);

    try {
      // Simular envio
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const dados = {
        osId,
        nomeSolicitante,
        contato,
        email,
        condominio,
        bloco,
        unidade,
        alteracoes,
        executores,
        planoDescarte,
        tiposObra,
        arquivoART: arquivoART?.name,
        arquivoProjeto: arquivoProjeto?.name,
        dataEnvio: new Date().toISOString(),
      };

      console.log('📋 Formulário enviado:', dados);

      setSubmitSuccess(true);
      toast.success('Termo enviado com sucesso! Aguarde a análise da engenharia.');
    } catch (error) {
      console.error('Erro ao enviar:', error);
      toast.error('Erro ao enviar o termo. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success State
  if (submitSuccess) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <Card className="max-w-2xl w-full">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Termo Enviado com Sucesso!</h2>
            <p className="text-neutral-600 mb-6">
              Seu termo de comunicação de reforma foi recebido e será analisado pela nossa equipe de engenharia.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900 font-medium mb-2">📧 Próximos passos:</p>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Você receberá um email de confirmação em breve</li>
                <li>• A análise técnica será realizada em até 5 dias úteis</li>
                <li>• O parecer será enviado por email</li>
              </ul>
            </div>
            <p className="text-sm text-neutral-500">
              Protocolo: <span className="font-mono font-semibold">{osId}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-cyan-500/10 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-cyan-600" />
            </div>
            <div>
              <h1 className="text-3xl font-semibold">Termo de Comunicação de Reforma</h1>
              <p className="text-neutral-600 mt-1">
                Preencha os dados abaixo para solicitar aprovação da reforma
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Importante</p>
                <p className="text-sm text-blue-700">
                  Preencha todos os campos obrigatórios marcados com *. 
                  Após o envio, você receberá um email de confirmação e o parecer técnico em até 5 dias úteis.
                </p>
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Dados Cadastrais */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Solicitante</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="nome">
                    Nome Solicitante <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="nome"
                    value={nomeSolicitante}
                    onChange={(e) => setNomeSolicitante(e.target.value)}
                    placeholder="Nome completo"
                  />
                </div>

                <div>
                  <Label htmlFor="contato">
                    Contato (Telefone/WhatsApp) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="contato"
                    value={contato}
                    onChange={(e) => setContato(formatarTelefone(e.target.value))}
                    placeholder="(00) 00000-0000"
                  />
                </div>

                <div>
                  <Label htmlFor="email">
                    Email <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                </div>

                <div>
                  <Label htmlFor="condominio">Condomínio</Label>
                  <Input
                    id="condominio"
                    value={condominio}
                    onChange={(e) => setCondominio(e.target.value)}
                    placeholder="Nome do condomínio"
                    disabled={!!condominioPreenchido}
                  />
                </div>

                <div>
                  <Label htmlFor="bloco">Bloco</Label>
                  <Input
                    id="bloco"
                    value={bloco}
                    onChange={(e) => setBloco(e.target.value)}
                    placeholder="Ex: A, B, Torre 1"
                  />
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="unidade">
                    Unidade Autônoma <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="unidade"
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    placeholder="Ex: 101, 202, Sala 305"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Discriminação - Alterações */}
          <Card>
            <CardHeader>
              <CardTitle>Discriminação das Alterações Propostas</CardTitle>
              <p className="text-sm text-neutral-600 mt-1">
                Adicione todas as alterações que serão realizadas na unidade
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {alteracoes.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-lg">
                  <Building2 className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                  <p className="text-sm text-neutral-600 mb-4">
                    Nenhuma alteração adicionada ainda
                  </p>
                  <Button type="button" onClick={handleAdicionarAlteracao}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Primeira Alteração
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {alteracoes.map((alt, index) => (
                    <div key={alt.id} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium">Alteração {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverAlteracao(alt.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Sistema *</Label>
                          <select
                            value={alt.sistema}
                            onChange={(e) => handleAtualizarAlteracao(alt.id, 'sistema', e.target.value)}
                            className="w-full h-9 px-3 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Selecione...</option>
                            {sistemasOpcoes.map((sistema) => (
                              <option key={sistema} value={sistema}>
                                {sistema}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label className="text-xs">Item (O que será feito) *</Label>
                          <Input
                            value={alt.item}
                            onChange={(e) => handleAtualizarAlteracao(alt.id, 'item', e.target.value)}
                            placeholder="Descreva o item"
                            className="h-9 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">Gera Ruído *</Label>
                          <select
                            value={alt.geraRuido}
                            onChange={(e) => handleAtualizarAlteracao(alt.id, 'geraRuido', e.target.value)}
                            className="w-full h-9 px-3 rounded-md border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="">Selecione...</option>
                            <option value="Sim">Sim</option>
                            <option value="Não">Não</option>
                          </select>
                        </div>

                        <div>
                          <Label className="text-xs">Data Prevista Início *</Label>
                          <Input
                            type="date"
                            value={alt.dataInicio}
                            onChange={(e) => handleAtualizarAlteracao(alt.id, 'dataInicio', e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <Label className="text-xs">Data Prevista Fim *</Label>
                          <Input
                            type="date"
                            value={alt.dataFim}
                            onChange={(e) => handleAtualizarAlteracao(alt.id, 'dataFim', e.target.value)}
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" onClick={handleAdicionarAlteracao} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Mais uma Alteração
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Identificação dos Executores */}
          <Card>
            <CardHeader>
              <CardTitle>Identificação dos Executores</CardTitle>
              <p className="text-sm text-neutral-600 mt-1">
                Informe os dados dos profissionais que executarão a reforma
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {executores.length === 0 ? (
                <div className="text-center py-8 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-lg">
                  <p className="text-sm text-neutral-600 mb-4">
                    Nenhum executor adicionado ainda
                  </p>
                  <Button type="button" onClick={handleAdicionarExecutor}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Executor
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {executores.map((exec, index) => (
                    <div key={exec.id} className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium">Executor {index + 1}</p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoverExecutor(exec.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label className="text-xs">Nome Completo *</Label>
                          <Input
                            value={exec.nome}
                            onChange={(e) => handleAtualizarExecutor(exec.id, 'nome', e.target.value)}
                            placeholder="Nome completo do executor"
                            className="h-9 text-sm"
                          />
                        </div>

                        <div>
                          <Label className="text-xs">CPF *</Label>
                          <Input
                            value={exec.cpf}
                            onChange={(e) => handleAtualizarExecutor(exec.id, 'cpf', formatarCPF(e.target.value))}
                            placeholder="000.000.000-00"
                            className="h-9 text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" onClick={handleAdicionarExecutor} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Mais um Executor
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Plano de Descarte */}
          <Card>
            <CardHeader>
              <CardTitle>Plano de Descarte</CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="descarte">
                Plano de descarte de resíduos gerados <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="descarte"
                value={planoDescarte}
                onChange={(e) => setPlanoDescarte(e.target.value)}
                placeholder="Descreva como será feito o descarte dos resíduos gerados pela reforma..."
                rows={4}
                className="mt-2"
              />
            </CardContent>
          </Card>

          {/* Tipo de Obra (Checklist) */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Obra</CardTitle>
              <p className="text-sm text-neutral-600 mt-1">
                Marque todas as opções que descrevem sua obra
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Obras que exigem ART */}
              <div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-amber-900">
                    ⚠️ Obras que exigem ART/RRT (documentação obrigatória)
                  </p>
                </div>
                <div className="space-y-2">
                  {tiposObraExigemART.map((tipo) => (
                    <div key={tipo} className="flex items-start gap-3">
                      <Checkbox
                        id={tipo}
                        checked={tiposObra.includes(tipo)}
                        onCheckedChange={() => handleToggleTipoObra(tipo)}
                      />
                      <Label htmlFor={tipo} className="text-sm cursor-pointer">
                        {tipo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Obras simples */}
              <div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                  <p className="text-sm font-medium text-green-900">
                    ✓ Obras Simples (não exigem ART/RRT)
                  </p>
                </div>
                <div className="space-y-2">
                  {tiposObraSimples.map((tipo) => (
                    <div key={tipo} className="flex items-start gap-3">
                      <Checkbox
                        id={tipo}
                        checked={tiposObra.includes(tipo)}
                        onCheckedChange={() => handleToggleTipoObra(tipo)}
                      />
                      <Label htmlFor={tipo} className="text-sm cursor-pointer">
                        {tipo}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Anexos */}
          <Card>
            <CardHeader>
              <CardTitle>Anexos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* ART/RRT (Condicional) */}
              {precisaART && (
                <div>
                  <Label htmlFor="art">
                    ART ou RRT <span className="text-red-500">*</span>
                  </Label>
                  <div className="mt-2 border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                    <input
                      id="art"
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => setArquivoART(e.target.files?.[0] || null)}
                      className="hidden"
                    />
                    <label htmlFor="art" className="cursor-pointer">
                      <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                      <p className="text-sm font-medium text-neutral-700">
                        {arquivoART ? arquivoART.name : 'Clique para fazer upload da ART/RRT'}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        PDF, JPG ou PNG (máx. 10MB)
                      </p>
                    </label>
                  </div>
                  <p className="text-xs text-amber-600 mt-2">
                    ⚠️ Obrigatório para os tipos de obra selecionados
                  </p>
                </div>
              )}

              {/* Projeto (Obrigatório) */}
              <div>
                <Label htmlFor="projeto">
                  Projeto da Alteração <span className="text-red-500">*</span>
                </Label>
                <div className="mt-2 border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    id="projeto"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.dwg"
                    onChange={(e) => setArquivoProjeto(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <label htmlFor="projeto" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-neutral-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-neutral-700">
                      {arquivoProjeto ? arquivoProjeto.name : 'Clique para fazer upload do projeto'}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      PDF, JPG, PNG ou DWG (máx. 20MB)
                    </p>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botão de Envio */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              isLoading={isSubmitting}
              loadingText="Enviando..."
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {!isSubmitting && <CheckCircle2 className="w-4 h-4 mr-2" />}
              Enviar Termo para Análise
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}