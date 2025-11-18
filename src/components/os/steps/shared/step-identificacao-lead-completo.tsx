"use client";

import React, { useState } from 'react';
import { Button } from '../../../ui/button';
import { PrimaryButton } from '../../../ui/primary-button';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../ui/dialog';
import { Search, UserPlus, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '../../../ui/avatar';
import { Switch } from '../../../ui/switch';
import { Separator } from '../../../ui/separator';
import { cn } from '../../../ui/utils';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '../../../ui/command';
import { useClientes, useCreateCliente, transformFormToCliente } from '../../../../lib/hooks/use-clientes';
import { toast } from '../../../../lib/utils/safe-toast';

interface FormDataCompleto {
  nome: string;
  cpfCnpj: string;
  tipo: string;
  nomeResponsavel: string;
  cargoResponsavel: string;
  telefone: string;
  email: string;
  tipoEdificacao: string;
  qtdUnidades: string;
  qtdBlocos: string;
  qtdPavimentos: string;
  tipoTelhado: string;
  possuiElevador: boolean;
  possuiPiscina: boolean;
  cep: string;
  endereco: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  estado: string;
}

interface StepIdentificacaoLeadCompletoProps {
  selectedLeadId: string;
  onSelectLead: (leadId: string) => void;
  showCombobox: boolean;
  onShowComboboxChange: (show: boolean) => void;
  showNewLeadDialog: boolean;
  onShowNewLeadDialogChange: (show: boolean) => void;
  formData: FormDataCompleto;
  onFormDataChange: (data: FormDataCompleto) => void;
  onSaveNewLead: () => void;
}

export function StepIdentificacaoLeadCompleto({
  selectedLeadId,
  onSelectLead,
  showCombobox,
  onShowComboboxChange,
  showNewLeadDialog,
  onShowNewLeadDialogChange,
  formData,
  onFormDataChange,
  onSaveNewLead,
}: StepIdentificacaoLeadCompletoProps) {
  // Buscar leads do banco de dados
  const { clientes: leads, loading, error, refetch } = useClientes('LEAD');
  const { mutate: createCliente, loading: creating } = useCreateCliente();
  
  // Estado local para salvar
  const [isSaving, setIsSaving] = useState(false);
  
  const selectedLead = leads?.find(l => l.id === selectedLeadId);
  
  // Função para preencher formData com dados do lead selecionado
  const preencherFormDataComLead = (lead: any) => {
    try {
      console.log('📋 Preenchendo dados do lead:', lead);
      
      onFormDataChange({
        nome: lead.nome_razao_social || '',
        cpfCnpj: lead.cpf_cnpj || '',
        tipo: lead.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' : 'juridica',
        nomeResponsavel: lead.nome_responsavel || '',
        cargoResponsavel: lead.endereco?.cargo_responsavel || '',
        telefone: lead.telefone || '',
        email: lead.email || '',
        tipoEdificacao: lead.endereco?.tipo_edificacao || '',
        qtdUnidades: lead.endereco?.qtd_unidades || '',
        qtdBlocos: lead.endereco?.qtd_blocos || '',
        qtdPavimentos: lead.endereco?.qtd_pavimentos || '',
        tipoTelhado: lead.endereco?.tipo_telhado || '',
        possuiElevador: lead.endereco?.possui_elevador || false,
        possuiPiscina: lead.endereco?.possui_piscina || false,
        cep: lead.endereco?.cep || '',
        endereco: lead.endereco?.rua || '',
        numero: lead.endereco?.numero || '',
        complemento: lead.endereco?.complemento || '',
        bairro: lead.endereco?.bairro || '',
        cidade: lead.endereco?.cidade || '',
        estado: lead.endereco?.estado || '',
      });
      
      console.log('✅ Dados do lead preenchidos com sucesso');
    } catch (error) {
      console.error('❌ Erro ao preencher dados do lead:', error);
      try {
        toast.error('Erro ao carregar dados do lead');
      } catch (toastError) {
        console.error('❌ Erro ao exibir toast (preencherFormData):', toastError);
      }
    }
  };
  
  // Handler para selecionar lead (com tratamento de erro)
  const handleSelectLead = (lead: any) => {
    try {
      console.log('🎯 Selecionando lead:', lead.id);
      
      // Validar lead
      if (!lead || !lead.id) {
        console.error('❌ Lead inválido:', lead);
        try {
          toast.error('Lead inválido');
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast de validação:', toastError);
        }
        return;
      }
      
      // Selecionar lead
      onSelectLead(lead.id);
      
      // Preencher dados
      preencherFormDataComLead(lead);
      
      // Fechar combobox após um pequeno delay para evitar problemas de rendering
      setTimeout(() => {
        onShowComboboxChange(false);
      }, 50);
      
      console.log('✅ Lead selecionado com sucesso:', lead.nome_razao_social);
    } catch (error) {
      console.error('❌ Erro ao selecionar lead:', error);
      try {
        toast.error('Erro ao selecionar lead. Tente novamente.');
      } catch (toastError) {
        console.error('❌ Erro ao exibir toast:', toastError);
      }
    }
  };
  
  // Handler para salvar novo lead no banco
  const handleSaveNewLead = async () => {
    try {
      setIsSaving(true);
      
      // Validações básicas
      if (!formData.nome || !formData.cpfCnpj || !formData.telefone || !formData.email) {
        try {
          toast.error('Preencha todos os campos obrigatórios');
        } catch (toastError) {
          console.error('❌ Erro ao exibir toast (validação novo lead):', toastError);
        }
        return;
      }
      
      // Transformar dados do formulário para formato da API
      const clienteData = transformFormToCliente(formData);
      
      // Criar cliente no banco
      const novoCliente = await createCliente(clienteData);
      
      // Atualizar lista de clientes
      await refetch();
      
      // Selecionar o novo lead criado
      onSelectLead(novoCliente.id);
      
      // Fechar dialog
      onShowNewLeadDialogChange(false);
      
      // Chamar callback original (se necessário)
      onSaveNewLead();
      
    } catch (error) {
      console.error('Erro ao salvar lead:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Associe esta OS a um lead existente ou crie um novo cadastro.
          </AlertDescription>
        </Alert>

        {/* Alerta de erro ao carregar leads */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Erro ao carregar leads do banco de dados</span>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <Label>Cliente / Lead</Label>
          <Popover open={showCombobox} onOpenChange={onShowComboboxChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-full justify-between focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Carregando leads...
                  </>
                ) : selectedLead ? (
                  selectedLead.nome_razao_social
                ) : (
                  "Buscar por nome, CPF ou CNPJ..."
                )}
                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent 
              className="p-0" 
              align="start"
              style={{ width: 'var(--radix-popover-trigger-width)' }}
            >
              <Command>
                <CommandInput placeholder="Buscar por nome, CPF ou CNPJ..." className="focus:ring-0 focus:ring-offset-0 focus:outline-none focus-visible:ring-0 focus-visible:outline-none" />
                <CommandEmpty>
                  <div className="py-6 text-center text-sm text-muted-foreground">
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Carregando leads...
                      </div>
                    ) : error ? (
                      <div className="space-y-2">
                        <p className="text-destructive">Erro ao carregar leads</p>
                        <Button variant="outline" size="sm" onClick={() => refetch()}>
                          Tentar novamente
                        </Button>
                      </div>
                    ) : (
                      'Nenhum lead encontrado.'
                    )}
                  </div>
                </CommandEmpty>
                <CommandList>
                  <CommandGroup>
                    {leads && leads.length > 0 && leads.map((lead) => {
                      // Validar lead antes de renderizar
                      if (!lead || !lead.id || !lead.nome_razao_social) {
                        console.warn('⚠️ Lead inválido detectado:', lead);
                        return null;
                      }
                      
                      return (
                        <CommandItem
                          key={lead.id}
                          value={`${lead.nome_razao_social} ${lead.cpf_cnpj || ''}`}
                          onSelect={() => handleSelectLead(lead)}
                          className="flex items-center gap-2 px-3 py-2"
                        >
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {lead.nome_razao_social.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{lead.nome_razao_social}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {lead.cpf_cnpj || 'Sem CPF/CNPJ'} • {lead.telefone || 'Sem telefone'}
                            </div>
                          </div>
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0",
                              selectedLeadId === lead.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
                
                {/* Footer fixo com botão Criar Novo */}
                <div className="border-t bg-white p-2">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm"
                    onClick={() => {
                      onShowComboboxChange(false);
                      // Resetar formData para vazio ao criar novo cliente
                      onFormDataChange({
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
                      onShowNewLeadDialogChange(true);
                    }}
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar novo cliente
                  </Button>
                </div>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Card de Confirmação de Dados Carregados */}
        {selectedLead && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start gap-3">
              <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-3 flex-1">
                <div>
                  <p className="text-sm font-medium text-green-900">Lead selecionado com sucesso!</p>
                  <p className="text-xs text-green-700 mt-1">
                    Os dados abaixo foram carregados automaticamente:
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div>
                    <span className="text-green-700">Nome:</span>{' '}
                    <span className="font-medium text-green-900">{formData.nome || '-'}</span>
                  </div>
                  <div>
                    <span className="text-green-700">CPF/CNPJ:</span>{' '}
                    <span className="font-medium text-green-900">{formData.cpfCnpj || '-'}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Responsável:</span>{' '}
                    <span className="font-medium text-green-900">{formData.nomeResponsavel || '-'}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Telefone:</span>{' '}
                    <span className="font-medium text-green-900">{formData.telefone || '-'}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Email:</span>{' '}
                    <span className="font-medium text-green-900">{formData.email || '-'}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Qtd. Unidades:</span>{' '}
                    <span className="font-medium text-green-900">{formData.qtdUnidades || '-'}</span>
                  </div>
                  <div>
                    <span className="text-green-700">Qtd. Blocos:</span>{' '}
                    <span className="font-medium text-green-900">{formData.qtdBlocos || '-'}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-green-700">Endereço:</span>{' '}
                    <span className="font-medium text-green-900">
                      {formData.endereco && formData.numero 
                        ? `${formData.endereco}, ${formData.numero}${formData.complemento ? ` - ${formData.complemento}` : ''} - ${formData.bairro}, ${formData.cidade}/${formData.estado}`
                        : '-'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Dialog de Criação de Novo Lead */}
        <Dialog open={showNewLeadDialog} onOpenChange={onShowNewLeadDialogChange}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Cadastrar Novo Lead</DialogTitle>
              <DialogDescription>
                Preencha os dados do novo lead. Campos com * são obrigatórios.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Bloco 1: Identificação */}
              <div>
                <h3 className="text-sm font-medium mb-4">Identificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="nome">
                      Nome / Razão Social <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) => onFormDataChange({ ...formData, nome: e.target.value })}
                      placeholder="Digite o nome completo ou razão social"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cpfCnpj">
                      CPF / CNPJ <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cpfCnpj"
                      value={formData.cpfCnpj}
                      onChange={(e) => onFormDataChange({ ...formData, cpfCnpj: e.target.value })}
                      placeholder="000.000.000-00 ou 00.000.000/0001-00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipo">
                      Tipo de Pessoa <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.tipo} 
                      onValueChange={(value) => onFormDataChange({ ...formData, tipo: value })}
                    >
                      <SelectTrigger id="tipo">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fisica">Pessoa Física</SelectItem>
                        <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                    <Input
                      id="nomeResponsavel"
                      value={formData.nomeResponsavel}
                      onChange={(e) => onFormDataChange({ ...formData, nomeResponsavel: e.target.value })}
                      placeholder="Nome do contato principal"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cargoResponsavel">Cargo do Responsável</Label>
                    <Input
                      id="cargoResponsavel"
                      value={formData.cargoResponsavel}
                      onChange={(e) => onFormDataChange({ ...formData, cargoResponsavel: e.target.value })}
                      placeholder="Ex: Síndico, Gerente, Proprietário"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">
                      Telefone / WhatsApp <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="telefone"
                      value={formData.telefone}
                      onChange={(e) => onFormDataChange({ ...formData, telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">
                      Email <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => onFormDataChange({ ...formData, email: e.target.value })}
                      placeholder="email@exemplo.com"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bloco 2: Dados da Edificação */}
              <div>
                <h3 className="text-sm font-medium mb-4">Dados da Edificação</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="tipoEdificacao">
                      Tipo de Edificação <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.tipoEdificacao} 
                      onValueChange={(value) => onFormDataChange({ ...formData, tipoEdificacao: value })}
                    >
                      <SelectTrigger id="tipoEdificacao">
                        <SelectValue placeholder="Selecione a categoria que melhor descreve o imóvel." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Condomínio Comercial">Condomínio Comercial</SelectItem>
                        <SelectItem value="Condomínio Residencial - Casas">Condomínio Residencial - Casas</SelectItem>
                        <SelectItem value="Condomínio Residencial - Apartamentos">Condomínio Residencial - Apartamentos</SelectItem>
                        <SelectItem value="Hotel">Hotel</SelectItem>
                        <SelectItem value="Shopping">Shopping</SelectItem>
                        <SelectItem value="Hospital">Hospital</SelectItem>
                        <SelectItem value="Indústria">Indústria</SelectItem>
                        <SelectItem value="Igreja">Igreja</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Selecione a categoria que melhor descreve o imóvel.
                    </p>
                  </div>

                  {/* Lógica Condicional: Exibir "Qtd. Unidades" para TODOS os Condomínios */}
                  {(formData.tipoEdificacao === 'Condomínio Comercial' || 
                    formData.tipoEdificacao === 'Condomínio Residencial - Casas' || 
                    formData.tipoEdificacao === 'Condomínio Residencial - Apartamentos') && (
                    <div className="space-y-2">
                      <Label htmlFor="qtdUnidades">
                        Quantidade de Unidades Autônomas <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="qtdUnidades"
                        type="number"
                        value={formData.qtdUnidades}
                        onChange={(e) => onFormDataChange({ ...formData, qtdUnidades: e.target.value })}
                        placeholder="Ex: 48"
                      />
                      <p className="text-xs text-muted-foreground">
                        Informe o número total de unidades independentes (salas, lojas, casas ou apartamentos) do condomínio.
                      </p>
                    </div>
                  )}

                  {/* Lógica Condicional: Exibir "Qtd. Blocos" APENAS para Condomínio Residencial - Apartamentos */}
                  {formData.tipoEdificacao === 'Condomínio Residencial - Apartamentos' && (
                    <div className="space-y-2">
                      <Label htmlFor="qtdBlocos">
                        Quantidade de Blocos <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="qtdBlocos"
                        type="number"
                        value={formData.qtdBlocos}
                        onChange={(e) => onFormDataChange({ ...formData, qtdBlocos: e.target.value })}
                        placeholder="Ex: 2"
                      />
                      <p className="text-xs text-muted-foreground">
                        Informe o número de torres ou blocos que compõem o condomínio.
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="qtdPavimentos">Quantidade de Pavimentação</Label>
                    <Input
                      id="qtdPavimentos"
                      type="number"
                      value={formData.qtdPavimentos}
                      onChange={(e) => onFormDataChange({ ...formData, qtdPavimentos: e.target.value })}
                      placeholder="Ex: 8"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tipoTelhado">
                      Tipo de Telhado <span className="text-destructive">*</span>
                    </Label>
                    <Select 
                      value={formData.tipoTelhado} 
                      onValueChange={(value) => onFormDataChange({ ...formData, tipoTelhado: value })}
                    >
                      <SelectTrigger id="tipoTelhado">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Laje impermeabilizada">Laje impermeabilizada</SelectItem>
                        <SelectItem value="Telhado cerâmico">Telhado cerâmico</SelectItem>
                        <SelectItem value="Telhado fibrocimento">Telhado fibrocimento</SelectItem>
                        <SelectItem value="Telhado metálico">Telhado metálico</SelectItem>
                        <SelectItem value="Não se aplica">Não se aplica</SelectItem>
                        <SelectItem value="Outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="possuiElevador"
                      checked={formData.possuiElevador}
                      onCheckedChange={(checked) => onFormDataChange({ ...formData, possuiElevador: checked })}
                    />
                    <Label htmlFor="possuiElevador" className="cursor-pointer">
                      Possui Elevador?
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="possuiPiscina"
                      checked={formData.possuiPiscina}
                      onCheckedChange={(checked) => onFormDataChange({ ...formData, possuiPiscina: checked })}
                    />
                    <Label htmlFor="possuiPiscina" className="cursor-pointer">
                      Possui Piscina?
                    </Label>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Bloco 3: Endereço */}
              <div>
                <h3 className="text-sm font-medium mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cep">
                      CEP <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cep"
                      value={formData.cep}
                      onChange={(e) => onFormDataChange({ ...formData, cep: e.target.value })}
                      placeholder="00000-000"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero">
                      Número <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="numero"
                      value={formData.numero}
                      onChange={(e) => onFormDataChange({ ...formData, numero: e.target.value })}
                      placeholder="Nº do imóvel"
                    />
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="endereco">
                      Endereço (Rua) <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="endereco"
                      value={formData.endereco}
                      onChange={(e) => onFormDataChange({ ...formData, endereco: e.target.value })}
                      placeholder="Rua, Avenida..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input
                      id="complemento"
                      value={formData.complemento}
                      onChange={(e) => onFormDataChange({ ...formData, complemento: e.target.value })}
                      placeholder="Apto, Bloco, Sala..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bairro">
                      Bairro <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="bairro"
                      value={formData.bairro}
                      onChange={(e) => onFormDataChange({ ...formData, bairro: e.target.value })}
                      placeholder="Bairro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cidade">
                      Cidade <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="cidade"
                      value={formData.cidade}
                      onChange={(e) => onFormDataChange({ ...formData, cidade: e.target.value })}
                      placeholder="Cidade"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="estado">
                      Estado <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="estado"
                      value={formData.estado}
                      onChange={(e) => onFormDataChange({ ...formData, estado: e.target.value })}
                      placeholder="UF"
                    />
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => onShowNewLeadDialogChange(false)}
                disabled={isSaving || creating}
              >
                Cancelar
              </Button>
              <PrimaryButton 
                onClick={handleSaveNewLead} 
                disabled={isSaving || creating}
              >
                {(isSaving || creating) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Salvando...
                  </>
                ) : (
                  'Salvar Lead'
                )}
              </PrimaryButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}