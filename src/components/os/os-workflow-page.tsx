"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Alert, AlertDescription } from '../ui/alert';
import { Checkbox } from '../ui/checkbox';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { ScrollArea } from '../ui/scroll-area';
import { StepWrapper } from './step-wrapper';
import { 
  Upload, 
  File, 
  FileText, 
  Check, 
  Calendar as CalendarIcon,
  AlertCircle,
  Clock,
  MessageSquare
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Calendar } from '../ui/calendar';
import { cn } from '../ui/utils';

interface OSWorkflowPageProps {
  onBack: () => void;
}

export function OSWorkflowPage({ onBack }: OSWorkflowPageProps) {
  // Estados do formulário - Etapa 3
  const [idadeEdificacao, setIdadeEdificacao] = useState('');
  const [motivoVisita, setMotivoVisita] = useState('');
  const [tempoOcorrencia, setTempoOcorrencia] = useState('');
  const [grauUrgencia, setGrauUrgencia] = useState('');
  const [escopoInicial, setEscopoInicial] = useState('');

  // Estados do formulário - Etapa 5-6
  const [dataVisita, setDataVisita] = useState<Date>();
  const [acompanhantes, setAcompanhantes] = useState('');
  const [comentariosVisita, setComentariosVisita] = useState('');
  const [solucaoRecomendada, setSolucaoRecomendada] = useState('');

  // Estados do formulário - Etapa 7-8
  const [objetivoMemorial, setObjetivoMemorial] = useState('');
  const [custoTotal, setCustoTotal] = useState('');
  const [percImprevisto, setPercImprevisto] = useState('');
  const [percLucro, setPercLucro] = useState('');
  const [percImposto, setPercImposto] = useState('');
  const [percEntrada, setPercEntrada] = useState('');
  const [numParcelas, setNumParcelas] = useState('');

  // Estados do formulário - Etapa 10-12
  const [dataApresentacao, setDataApresentacao] = useState<Date>();
  const [doresCliente, setDoresCliente] = useState('');
  const [indicadoresFechamento, setIndicadoresFechamento] = useState('');

  // Estados do formulário - Etapa 13-14
  const [contratoAssinado, setContratoAssinado] = useState(false);

  // Estado para comentários
  const [novoComentario, setNovoComentario] = useState('');

  // Mock de histórico/comentários
  const historico = [
    {
      id: '1',
      usuario: 'Diego Almeida',
      avatar: 'DA',
      acao: 'iniciou',
      descricao: 'Etapa 1-2 concluída',
      data: '08/11/2024 14:30',
      tipo: 'status'
    },
    {
      id: '2',
      usuario: 'Helena Silva',
      avatar: 'HS',
      acao: 'comentou',
      descricao: 'Cliente solicitou urgência na vistoria',
      data: '08/11/2024 15:45',
      tipo: 'comentario'
    },
    {
      id: '3',
      usuario: 'Diego Almeida',
      avatar: 'DA',
      acao: 'atualizou',
      descricao: 'Iniciou Follow-up 1',
      data: '09/11/2024 09:15',
      tipo: 'status'
    }
  ];

  const handleAddComentario = () => {
    if (novoComentario.trim()) {
      console.log('Novo comentário:', novoComentario);
      setNovoComentario('');
    }
  };

  return (
    <div className="p-6 bg-muted min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          ← Voltar para Kanban
        </Button>
        <h1 className="text-3xl font-bold">Fluxo de Trabalho - OS de Obras</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe e preencha cada etapa do processo
        </p>
      </div>

      {/* Layout de 2 Colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Coluna da Esquerda - Stepper (70%) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ETAPA 1-2: Informações do Lead (Read-Only) */}
          <StepWrapper
            stepNumber="1-2"
            title="Informações do Cliente"
            responsible="ADM"
            status="completed"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Edificação</Label>
                  <Input value="Condomínio" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Qtd. Unidades Autônomas</Label>
                  <Input value="48" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Qtd. Blocos</Label>
                  <Input value="2" disabled />
                </div>
                <div className="space-y-2">
                  <Label>Contato (Nome)</Label>
                  <Input value="Sra. Helena" disabled />
                </div>
              </div>
              <div className="space-y-2">
                <Label>CNPJ</Label>
                <Input value="00.123.456/0001-00" disabled />
              </div>
            </div>
          </StepWrapper>

          {/* ETAPA 3: Follow-up 1 (Formulário) */}
          <StepWrapper
            stepNumber="3"
            title="Follow-up 1: Entrevista Inicial"
            responsible="ADM"
            status="active"
          >
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="idade-edificacao">
                    Idade da Edificação <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="idade-edificacao"
                    placeholder="Ex: 15 anos"
                    value={idadeEdificacao}
                    onChange={(e) => setIdadeEdificacao(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tempo-ocorrencia">
                    Tempo de Ocorrência <span className="text-destructive">*</span>
                  </Label>
                  <Input 
                    id="tempo-ocorrencia"
                    placeholder="Ex: 6 meses"
                    value={tempoOcorrencia}
                    onChange={(e) => setTempoOcorrencia(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="motivo-visita">
                  Motivo da Visita <span className="text-destructive">*</span>
                </Label>
                <Input 
                  id="motivo-visita"
                  placeholder="Descreva o motivo da solicitação"
                  value={motivoVisita}
                  onChange={(e) => setMotivoVisita(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="grau-urgencia">
                  Grau de Urgência <span className="text-destructive">*</span>
                </Label>
                <Select value={grauUrgencia} onValueChange={setGrauUrgencia}>
                  <SelectTrigger id="grau-urgencia">
                    <SelectValue placeholder="Selecione o grau de urgência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixo">Baixo</SelectItem>
                    <SelectItem value="medio">Médio</SelectItem>
                    <SelectItem value="alto">Alto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="escopo-inicial">
                  Escopo Inicial dos Serviços <span className="text-destructive">*</span>
                </Label>
                <Textarea 
                  id="escopo-inicial"
                  placeholder="Digite o escopo relatado pelo cliente..."
                  rows={4}
                  value={escopoInicial}
                  onChange={(e) => setEscopoInicial(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  Anexar Documentos do Cliente <span className="text-destructive">*</span>
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Fotos, escopos, laudos antigos
                </p>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload de Arquivos
                </Button>
              </div>

              <div className="flex justify-end pt-4">
                <Button>
                  Salvar e Avançar
                  <Check className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </StepWrapper>

          {/* ETAPA 4: Agendar Visita Técnica */}
          <StepWrapper
            stepNumber="4"
            title="Agendar Visita Técnica"
            responsible="ADM"
            status="pending"
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Após concluir o Follow-up 1, você poderá agendar a visita técnica.
              </p>
              <Button variant="secondary" className="w-full bg-secondary hover:bg-secondary/90" disabled>
                <CalendarIcon className="h-4 w-4 mr-2" />
                Agendar no Calendário
              </Button>
            </div>
          </StepWrapper>

          {/* ETAPA 5-6: Follow-up 2 (Formulário) */}
          <StepWrapper
            stepNumber="5-6"
            title="Visita Técnica e Follow-up 2"
            responsible="Obras"
            status="pending"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data da Realização da Visita <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start font-normal",
                        !dataVisita && "text-muted-foreground"
                      )}
                      disabled
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataVisita ? dataVisita.toLocaleDateString('pt-BR') : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataVisita}
                      onSelect={setDataVisita}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Acompanhante(s) na Visita</Label>
                <Input 
                  placeholder="Nome dos acompanhantes"
                  value={acompanhantes}
                  onChange={(e) => setAcompanhantes(e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label>Qualitativo/Comentários dos Achados <span className="text-destructive">*</span></Label>
                <Textarea 
                  placeholder="Descreva os achados da visita técnica..."
                  rows={4}
                  value={comentariosVisita}
                  onChange={(e) => setComentariosVisita(e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label>Serviço/Solução Recomendada <span className="text-destructive">*</span></Label>
                <Textarea 
                  placeholder="Descreva a solução recomendada..."
                  rows={4}
                  value={solucaoRecomendada}
                  onChange={(e) => setSolucaoRecomendada(e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label>Anexar Fotos da Visita Técnica <span className="text-destructive">*</span></Label>
                <Button variant="outline" className="w-full" disabled>
                  <Upload className="h-4 w-4 mr-2" />
                  Fazer Upload de Fotos
                </Button>
              </div>
            </div>
          </StepWrapper>

          {/* ETAPA 7-8: Memorial e Precificação */}
          <StepWrapper
            stepNumber="7-8"
            title="Memorial Descritivo e Precificação"
            responsible="Obras"
            status="pending"
          >
            <div className="space-y-4">
              {/* Upload Memorial (Etapa 7) */}
              <div className="space-y-2">
                <Label>Fazer Upload do Memorial Descritivo <span className="text-destructive">*</span></Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Arquivo Excel ou Word
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Fazer Upload do Memorial
                </Button>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <h4 className="font-medium mb-4">Precificação (Etapa 8)</h4>
                
                <div className="space-y-2 mb-4">
                  <Label>Objetivo do Memorial</Label>
                  <Textarea 
                    placeholder="Descreva o objetivo..."
                    rows={3}
                    value={objetivoMemorial}
                    onChange={(e) => setObjetivoMemorial(e.target.value)}
                    disabled
                  />
                </div>

                <div className="space-y-2 mb-4">
                  <Label>Custo Total (Material + Mão de Obra) <span className="text-destructive">*</span></Label>
                  <Input 
                    type="text"
                    placeholder="R$ 0,00"
                    value={custoTotal}
                    onChange={(e) => setCustoTotal(e.target.value)}
                    disabled
                  />
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>% Imprevisto</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={percImprevisto}
                      onChange={(e) => setPercImprevisto(e.target.value)}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>% Lucro</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={percLucro}
                      onChange={(e) => setPercLucro(e.target.value)}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>% Imposto</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={percImposto}
                      onChange={(e) => setPercImposto(e.target.value)}
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>% Entrada</Label>
                    <Input 
                      type="number"
                      placeholder="0"
                      value={percEntrada}
                      onChange={(e) => setPercEntrada(e.target.value)}
                      disabled
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Nº de Parcelas</Label>
                  <Input 
                    type="number"
                    placeholder="0"
                    value={numParcelas}
                    onChange={(e) => setNumParcelas(e.target.value)}
                    disabled
                  />
                </div>
              </div>
            </div>
          </StepWrapper>

          {/* ETAPA 9: Gerar Proposta Comercial */}
          <StepWrapper
            stepNumber="9"
            title="Gerar Proposta Comercial"
            responsible="ADM"
            status="pending"
          >
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Esta etapa requer aprovação do Gestor ADM antes de prosseguir.
                </AlertDescription>
              </Alert>

              <Button className="w-full" disabled>
                <File className="h-4 w-4 mr-2" />
                Gerar Proposta (PDF)
              </Button>
            </div>
          </StepWrapper>

          {/* ETAPA 10-12: Follow-up 3 */}
          <StepWrapper
            stepNumber="10-12"
            title="Follow-up 3: Pós-Apresentação"
            responsible="ADM"
            status="pending"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Data da Apresentação da Proposta <span className="text-destructive">*</span></Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start font-normal",
                        !dataApresentacao && "text-muted-foreground"
                      )}
                      disabled
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {dataApresentacao ? dataApresentacao.toLocaleDateString('pt-BR') : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={dataApresentacao}
                      onSelect={setDataApresentacao}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Dores e Reação do Cliente <span className="text-destructive">*</span></Label>
                <Textarea 
                  placeholder="Descreva as dores e a reação do cliente..."
                  rows={4}
                  value={doresCliente}
                  onChange={(e) => setDoresCliente(e.target.value)}
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label>Indicadores de Fechamento / Próximos Passos <span className="text-destructive">*</span></Label>
                <Textarea 
                  placeholder="Descreva os indicadores e próximos passos..."
                  rows={4}
                  value={indicadoresFechamento}
                  onChange={(e) => setIndicadoresFechamento(e.target.value)}
                  disabled
                />
              </div>
            </div>
          </StepWrapper>

          {/* ETAPA 13-14: Contrato */}
          <StepWrapper
            stepNumber="13-14"
            title="Fechamento de Contrato"
            responsible="ADM"
            status="pending"
          >
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Fazer Upload da Minuta do Contrato <span className="text-destructive">*</span></Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Arquivo Word ou PDF
                </p>
                <Button variant="outline" className="w-full" disabled>
                  <FileText className="h-4 w-4 mr-2" />
                  Fazer Upload do Contrato
                </Button>
              </div>

              <div className="border-t border-border pt-4 mt-4">
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="contrato-assinado" 
                    checked={contratoAssinado}
                    onCheckedChange={(checked) => setContratoAssinado(checked as boolean)}
                    disabled
                  />
                  <Label 
                    htmlFor="contrato-assinado" 
                    className="font-normal cursor-pointer"
                  >
                    Contrato Assinado pelo Cliente
                  </Label>
                </div>
              </div>
            </div>
          </StepWrapper>

          {/* ETAPA 15: Conclusão */}
          <StepWrapper
            stepNumber="15"
            title="Concluir e Iniciar Obra"
            responsible="Sistema"
            status="pending"
          >
            <div className="space-y-4">
              <p className="text-muted-foreground">
                Após todas as etapas anteriores serem concluídas, você poderá finalizar esta OS e gerar automaticamente uma OS-13 (Start de Contrato de Obra).
              </p>
              <Button className="w-full" disabled>
                <Check className="h-4 w-4 mr-2" />
                Concluir OS e Gerar OS-13 (Start de Obra)
              </Button>
            </div>
          </StepWrapper>

        </div>

        {/* Coluna da Direita - Informações e Histórico (30%) */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-7rem)] lg:overflow-y-auto">
          
          {/* Card: Informações da OS */}
          <Card className="border-border rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle>Informações da OS</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="text-xs text-muted-foreground">Código OS</Label>
                <p className="font-medium">OS-2025-001</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Status</Label>
                <div className="mt-1">
                  <Badge className="bg-primary/20 text-primary font-medium">
                    Em Andamento
                  </Badge>
                </div>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Cliente</Label>
                <p className="font-medium">Condomínio Fit One</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Responsável Atual</Label>
                <p className="font-medium">Diego (Coordenador de Obras)</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Tipo de OS</Label>
                <p className="font-medium">OS 01: Perícia de Fachada</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Prazo Estimado</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">30/12/2024</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Histórico e Comentários */}
          <Card className="border-border rounded-lg shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Histórico e Comentários
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Feed de Atividades */}
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-4">
                  {historico.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <Avatar className="h-8 w-8 flex-shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {item.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{item.usuario}</span>
                          <span className="text-xs text-muted-foreground">{item.acao}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.descricao}</p>
                        <span className="text-xs text-muted-foreground">{item.data}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Adicionar Comentário */}
              <div className="space-y-2 pt-4 border-t border-border">
                <Textarea 
                  placeholder="Adicione um comentário..."
                  rows={3}
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  className="resize-none"
                />
                <Button 
                  size="sm" 
                  className="w-full"
                  onClick={handleAddComentario}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Adicionar Comentário
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}
