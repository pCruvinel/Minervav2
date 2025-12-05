"use client";

import { logger } from '@/lib/utils/logger';
import { useState, forwardRef, useImperativeHandle } from 'react';
import { Button } from '@/components/ui/button';
import { PrimaryButton } from '@/components/ui/primary-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Search, UserPlus, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/components/ui/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { useClientes, useCreateCliente } from '@/lib/hooks/use-clientes';
import { toast } from '@/lib/utils/safe-toast';
import { FormInput } from '@/components/ui/form-input';
import { FormMaskedInput, validarCPF, validarCNPJ, validarTelefone, validarCEP, removeMask } from '@/components/ui/form-masked-input';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { etapa1Schema } from '@/lib/validations/os-etapas-schema';

export interface FormDataCompleto {
  nome: string;
  cpfCnpj: string;
  tipo: string;
  tipoEmpresa?: string;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  data?: any; // Campo opcional para compatibilidade futura
}

/* eslint-disable @typescript-eslint/no-unused-vars */
interface CadastrarLeadProps {
  selectedLeadId: string;
  onSelectLead: (leadId: string, leadData?: any) => void;
  showCombobox: boolean;
  onShowComboboxChange: (show: boolean) => void;
  showNewLeadDialog: boolean;
  onShowNewLeadDialogChange: (show: boolean) => void;
  formData: FormDataCompleto;
  onFormDataChange: (data: FormDataCompleto) => void;
  readOnly?: boolean;
}
/* eslint-enable @typescript-eslint/no-unused-vars */

export interface CadastrarLeadHandle {
  validate: () => boolean;
  isFormValid: () => boolean;
  saveEdificacaoData: () => Promise<boolean>;
}

export const CadastrarLead = forwardRef<CadastrarLeadHandle, CadastrarLeadProps>(
  function CadastrarLead({
    selectedLeadId,
    onSelectLead,
    showCombobox,
    onShowComboboxChange,
    showNewLeadDialog,
    onShowNewLeadDialogChange,
    formData,
    onFormDataChange,
    readOnly = false,
  }, ref) {
    // Buscar leads do banco de dados
    const { clientes: leads, loading, error, refetch } = useClientes('LEAD');
    const { mutate: createCliente, loading: creating } = useCreateCliente();

    // Estado local para salvar
    const [isSaving, setIsSaving] = useState(false);

    // Estado para checkbox "Sou o Responsável?"
    const [souResponsavel, setSouResponsavel] = useState(false);

    // Hook de validação
    const {
      errors,
      touched,
      validateField,
      validateAll,
      markFieldTouched,
      markAllTouched,
    } = useFieldValidation(etapa1Schema);

    /**
     * Expõe métodos de validação via ref
     */
    useImperativeHandle(ref, () => ({
      validate: () => {
        logger.log('🔍 validate(): Iniciando validação...', {
          formData: {
            nome: formData.nome,
            cpfCnpj: formData.cpfCnpj,
            email: formData.email,
            telefone: formData.telefone,
            selectedLeadId: selectedLeadId
          }
        });

        markAllTouched();

        // Incluir leadId na validação
        const validationData = {
          leadId: selectedLeadId,
          nome: formData.nome,
          cpfCnpj: formData.cpfCnpj,
          email: formData.email,
          telefone: formData.telefone,
          tipo: formData.tipo,
          nomeResponsavel: formData.nomeResponsavel,
          cargoResponsavel: formData.cargoResponsavel,
          tipoEdificacao: formData.tipoEdificacao,
          qtdUnidades: formData.qtdUnidades,
          qtdBlocos: formData.qtdBlocos,
          qtdPavimentos: formData.qtdPavimentos,
          tipoTelhado: formData.tipoTelhado,
          possuiElevador: formData.possuiElevador,
          possuiPiscina: formData.possuiPiscina,
          cep: formData.cep,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
        };

        const isValid = validateAll(validationData);

        logger.log('🔍 validate(): Resultado da validação:', isValid);
        logger.log('🔍 validate(): Erros encontrados:', errors);

        if (!isValid) {
          const firstErrorField = Object.keys(errors)[0];
          logger.log('🔍 validate(): Primeiro campo com erro:', firstErrorField);

          if (firstErrorField) {
            const element = document.getElementById(firstErrorField);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }
        }

        return isValid;
      },
      isFormValid: () => {
        const validationData = {
          leadId: selectedLeadId,
          nome: formData.nome,
          cpfCnpj: formData.cpfCnpj,
          email: formData.email,
          telefone: formData.telefone,
          tipo: formData.tipo,
          nomeResponsavel: formData.nomeResponsavel,
          cargoResponsavel: formData.cargoResponsavel,
          tipoEdificacao: formData.tipoEdificacao,
          qtdUnidades: formData.qtdUnidades,
          qtdBlocos: formData.qtdBlocos,
          qtdPavimentos: formData.qtdPavimentos,
          tipoTelhado: formData.tipoTelhado,
          possuiElevador: formData.possuiElevador,
          possuiPiscina: formData.possuiPiscina,
          cep: formData.cep,
          endereco: formData.endereco,
          numero: formData.numero,
          complemento: formData.complemento,
          bairro: formData.bairro,
          cidade: formData.cidade,
          estado: formData.estado,
        };
        return validateAll(validationData);
      },
      saveEdificacaoData: async () => {
        try {
          logger.log('🔍 saveEdificacaoData: Iniciando validação...', {
            formData: {
              tipoEdificacao: formData.tipoEdificacao,
              cep: formData.cep,
              endereco: formData.endereco,
              numero: formData.numero,
              bairro: formData.bairro,
              cidade: formData.cidade,
              estado: formData.estado,
            }
          });

          // Validação básica dos campos obrigatórios de edificação
          const erros: any = {};
          if (!formData.tipoEdificacao) {
            erros.tipoEdificacao = 'Tipo de edificação é obrigatório';
          }
          if (!formData.cep) {
            erros.cep = 'CEP é obrigatório';
          }
          if (!formData.endereco) {
            erros.endereco = 'Endereço é obrigatório';
          }
          if (!formData.numero) {
            erros.numero = 'Número é obrigatório';
          }
          if (!formData.bairro) {
            erros.bairro = 'Bairro é obrigatório';
          }
          if (!formData.cidade) {
            erros.cidade = 'Cidade é obrigatória';
          }
          if (!formData.estado) {
            erros.estado = 'Estado é obrigatório';
          }

          logger.log('🔍 saveEdificacaoData: Erros encontrados:', erros);

          if (Object.keys(erros).length > 0) {
            // Forçar exibição de erros nos campos
            Object.keys(erros).forEach(key => {
              markFieldTouched(key);
            });
            toast.error('Preencha todos os campos obrigatórios da edificação');
            logger.log('❌ saveEdificacaoData: Validação falhou');
            return false;
          }

          logger.log('✅ saveEdificacaoData: Validação passou');
          // Os dados já estão sendo salvos automaticamente pelo componente pai
          // através do onFormDataChange, então apenas retornamos sucesso
          return true;
        } catch (error) {
          logger.error('Erro ao salvar dados de edificação:', error);
          toast.error('Erro ao salvar dados da edificação');
          return false;
        }
      }
    }), [markAllTouched, validateAll, formData, errors]);

    const selectedLead = leads?.find(l => l.id === selectedLeadId);

    // Função para preencher formData com dados do lead selecionado
    const preencherFormDataComLead = (lead: any) => {
      try {
        logger.log('📋 Preenchendo dados do lead:', lead);

        onFormDataChange({
          nome: lead.nome_razao_social || '',
          cpfCnpj: lead.cpf_cnpj || '',
          tipo: lead.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' : 'juridica',
          tipoEmpresa: lead.tipo_empresa || '',
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

        logger.log('✅ Dados do lead preenchidos com sucesso');
      } catch (error) {
        logger.error('❌ Erro ao preencher dados do lead:', error);
        try {
          toast.error('Erro ao carregar dados do lead');
        } catch (toastError) {
          logger.error('❌ Erro ao exibir toast (preencherFormData):', toastError);
        }
      }
    };

    // Handler para selecionar lead (com tratamento de erro)
    const handleSelectLead = (lead: any) => {
      try {
        logger.log('🎯 Selecionando lead:', lead.id);

        // Validar lead
        if (!lead || !lead.id) {
          logger.error('❌ Lead inválido:', lead);
          try {
            toast.error('Lead inválido');
          } catch (toastError) {
            logger.error('❌ Erro ao exibir toast de validação:', toastError);
          }
          return;
        }

        // Selecionar lead - PASSAR O OBJETO COMPLETO DO LEAD
        onSelectLead(lead.id, lead);

        // Preencher dados
        preencherFormDataComLead(lead);

        // Fechar combobox após um pequeno delay para evitar problemas de rendering
        // eslint-disable-next-line no-undef
        setTimeout(() => {
          onShowComboboxChange(false);
        }, 50);

        logger.log('✅ Lead selecionado com sucesso:', lead.nome_razao_social);
      } catch (error) {
        logger.error('❌ Erro ao selecionar lead:', error);
        try {
          toast.error('Erro ao selecionar lead. Tente novamente.');
        } catch (toastError) {
          logger.error('❌ Erro ao exibir toast:', toastError);
        }
      }
    };

    // Handler para salvar novo lead no banco - APENAS IDENTIFICAÇÃO
    const handleSaveNewLead = async () => {
      try {
        setIsSaving(true);

        // Marcar todos os campos como tocados para mostrar erros
        markAllTouched();

        // Validar apenas campos de identificação (nome, cpfCnpj, telefone, email)
        const camposIdentificacao = {
          nome: formData.nome,
          cpfCnpj: formData.cpfCnpj,
          telefone: formData.telefone,
          email: formData.email,
        };

        // Validar campos obrigatórios de identificação
        const erros: any = {};
        if (!camposIdentificacao.nome || camposIdentificacao.nome.length < 3) {
          erros.nome = 'Nome deve ter pelo menos 3 caracteres';
        }
        if (!camposIdentificacao.cpfCnpj) {
          erros.cpfCnpj = formData.tipo === 'juridica' ? 'CNPJ é obrigatório' : 'CPF é obrigatório';
        }
        if (!camposIdentificacao.telefone) {
          erros.telefone = 'Telefone é obrigatório';
        }
        if (!camposIdentificacao.email || !camposIdentificacao.email.includes('@')) {
          erros.email = 'Email válido é obrigatório';
        }

        if (Object.keys(erros).length > 0) {
          // Atualizar erros através do hook de validação
          Object.keys(erros).forEach(key => {
            if (erros[key]) {
              // Forçar erro visual nos campos
              markFieldTouched(key);
            }
          });
          toast.error('Corrija os erros de validação antes de continuar');
          return;
        }

        // Criar cliente com apenas dados de identificação
        const clienteData = {
          nome_razao_social: formData.nome,
          cpf_cnpj: removeMask(formData.cpfCnpj),
          tipo_cliente: formData.tipo === 'juridica' ? 'PESSOA_JURIDICA' : 'PESSOA_FISICA',
          tipo_empresa: formData.tipo === 'juridica' ? formData.tipoEmpresa : null,
          telefone: removeMask(formData.telefone),
          email: formData.email,
          nome_responsavel: formData.nomeResponsavel || null,
          endereco: {
            cargo_responsavel: formData.cargoResponsavel || null,
          }
        };

        // Criar cliente no banco
        const novoCliente = await createCliente(clienteData);

        // Atualizar lista de clientes
        await refetch();

        // Selecionar o novo lead criado
        onSelectLead(novoCliente.id);

        // Fechar dialog - cliente criado, agora mostrar formulário de edificação
        onShowNewLeadDialogChange(false);

        // Resetar campos de edificação para que sejam preenchidos do zero
        onFormDataChange({
          ...formData,
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

        toast.success('Cliente criado com sucesso! Agora preencha os dados da edificação.');

      } catch (error) {
        logger.error('Erro ao salvar lead:', error);
        toast.error(`Erro ao salvar cliente: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
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
              Associe esta ordem de serviço a um cliente existente ou crie um novo.
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
            <Popover open={showCombobox} onOpenChange={onShowComboboxChange}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  className="w-full justify-between focus:ring-0 focus:ring-offset-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={loading || readOnly}
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
                          logger.warn('⚠️ Lead inválido detectado:', lead);
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

          {/* Formulário de Dados da Edificação - Aparece após seleção/cadastro do cliente */}
          {selectedLead && (
            <div className="space-y-6">
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div>
                      <p className="text-sm font-medium text-primary">
                        {selectedLeadId === selectedLead.id ? 'Cliente selecionado' : 'Cliente criado'} com sucesso!
                      </p>
                      <p className="text-xs text-primary">
                        Agora preencha os dados da edificação para continuar.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                      <div>
                        <span className="text-primary">Nome:</span>{' '}
                        <span className="font-medium text-primary">{formData.nome || '-'}</span>
                      </div>
                      <div>
                        <span className="text-primary">CPF/CNPJ:</span>{' '}
                        <span className="font-medium text-primary">{formData.cpfCnpj || '-'}</span>
                      </div>
                      <div>
                        <span className="text-primary">Telefone:</span>{' '}
                        <span className="font-medium text-primary">{formData.telefone || '-'}</span>
                      </div>
                      <div>
                        <span className="text-primary">Email:</span>{' '}
                        <span className="font-medium text-primary">{formData.email || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulário de Dados da Edificação */}
              <div className="space-y-6">
                <div className="rounded-lg border bg-white p-6">
                  <h3 className="text-lg font-medium mb-4">Dados da Edificação</h3>

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

                {/* Formulário de Endereço */}
                <div className="rounded-lg border bg-white p-6">
                  <h3 className="text-lg font-medium mb-4">Endereço da Edificação</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <FormMaskedInput
                        id="cep"
                        label="CEP"
                        required
                        maskType="cep"
                        value={formData.cep}
                        onChange={(e) => {
                          if (!readOnly) {
                            onFormDataChange({ ...formData, cep: e.target.value });
                            if (touched.cep) validateField('cep', e.target.value);
                          }
                        }}
                        onBlur={async () => {
                          if (!readOnly) {
                            markFieldTouched('cep');
                            validateField('cep', formData.cep);

                            // Integração ViaCEP
                            const cepClean = removeMask(formData.cep);
                            if (cepClean.length === 8) {
                              try {
                                // eslint-disable-next-line no-undef
                                const response = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
                                const data = await response.json();

                                if (data.erro) {
                                  toast.error('CEP não encontrado');
                                  return;
                                }

                                onFormDataChange({
                                  ...formData,
                                  endereco: data.logradouro,
                                  bairro: data.bairro,
                                  cidade: data.localidade,
                                  estado: data.uf,
                                  complemento: data.complemento || formData.complemento
                                });

                                toast.success('Endereço encontrado!');
                              } catch (error) {
                                logger.error('Erro ao buscar CEP:', error);
                                toast.error('Erro ao buscar CEP');
                              }
                            }
                          }
                        }}
                        error={touched.cep ? errors.cep : undefined}
                        success={touched.cep && !errors.cep && validarCEP(formData.cep)}
                        helperText="Digite o CEP (8 dígitos)"
                        placeholder="00000-000"
                        disabled={readOnly}
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
            </div>
          )}

          {/* Dialog de Criação de Novo Lead - APENAS IDENTIFICAÇÃO */}
          <Dialog open={showNewLeadDialog} onOpenChange={onShowNewLeadDialogChange}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha apenas os dados de identificação. Campos com * são obrigatórios.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Bloco 1: Identificação */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Identificação</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="col-span-2 space-y-2">
                      <Label htmlFor="tipo">
                        Tipo de Pessoa <span className="text-destructive">*</span>
                      </Label>
                      <Select
                        value={formData.tipo}
                        onValueChange={(value) => {
                          onFormDataChange({
                            ...formData,
                            tipo: value,
                            // Limpar campos dependentes ao mudar o tipo
                            cpfCnpj: '',
                            nome: '',
                            tipoEmpresa: '',
                            nomeResponsavel: ''
                          });
                          // Resetar checkbox ao mudar tipo
                          setSouResponsavel(false);
                        }}
                      >
                        <SelectTrigger id="tipo">
                          <SelectValue placeholder="Selecione o tipo de pessoa" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fisica">Pessoa Física</SelectItem>
                          <SelectItem value="juridica">Pessoa Jurídica</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Dropdown Tipo de Empresa - Apenas para Pessoa Jurídica */}
                    {formData.tipo === 'juridica' && (
                      <div className="col-span-2 space-y-2">
                        <Label htmlFor="tipoEmpresa">
                          Tipo de Empresa <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={formData.tipoEmpresa}
                          onValueChange={(value) => onFormDataChange({ ...formData, tipoEmpresa: value })}
                        >
                          <SelectTrigger id="tipoEmpresa">
                            <SelectValue placeholder="Selecione o tipo de empresa" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="CONDOMINIO">Condomínio</SelectItem>
                            <SelectItem value="CONSTRUTORA">Construtora</SelectItem>
                            <SelectItem value="INCORPORADORA">Incorporadora</SelectItem>
                            <SelectItem value="ADMINISTRADORA">Administradora</SelectItem>
                            <SelectItem value="OUTROS">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div className="col-span-2">
                      <FormInput
                        id="nome"
                        label={formData.tipo === 'juridica' ? "Razão Social" : "Nome Completo"}
                        required
                        value={formData.nome}
                        onChange={(e) => {
                          if (!readOnly) {
                            const novoNome = e.target.value;
                            onFormDataChange({ ...formData, nome: novoNome });
                            if (touched.nome) validateField('nome', novoNome);

                            // Se checkbox marcado, atualizar Nome do Responsável automaticamente
                            if (souResponsavel && formData.tipo === 'fisica') {
                              onFormDataChange({ ...formData, nome: novoNome, nomeResponsavel: novoNome });
                            }
                          }
                        }}
                        onBlur={() => {
                          if (!readOnly) {
                            markFieldTouched('nome');
                            validateField('nome', formData.nome);
                          }
                        }}
                        error={touched.nome ? errors.nome : undefined}
                        success={touched.nome && !errors.nome && formData.nome.length >= 3}
                        helperText="Mínimo 3 caracteres"
                        placeholder={formData.tipo === 'juridica' ? "Digite a razão social da empresa" : "Digite o nome completo"}
                        disabled={readOnly}
                      />
                    </div>

                    {/* Checkbox "Sou o Responsável?" - Apenas para Pessoa Física */}
                    {formData.tipo === 'fisica' && (
                      <div className="col-span-2 flex items-center space-x-2">
                        <Switch
                          id="souResponsavel"
                          checked={souResponsavel}
                          onCheckedChange={(checked) => {
                            setSouResponsavel(checked);
                            if (checked) {
                              // Auto-preencher Nome do Responsável com Nome Completo
                              onFormDataChange({ ...formData, nomeResponsavel: formData.nome });
                            } else {
                              // Limpar Nome do Responsável
                              onFormDataChange({ ...formData, nomeResponsavel: '' });
                            }
                          }}
                        />
                        <Label htmlFor="souResponsavel" className="cursor-pointer">
                          Sou o Responsável?
                        </Label>
                      </div>
                    )}

                    <div>
                      <FormMaskedInput
                        id="cpfCnpj"
                        label={formData.tipo === 'juridica' ? "CNPJ" : "CPF"}
                        required
                        maskType={formData.tipo === 'juridica' ? "cnpj" : "cpf"}
                        value={formData.cpfCnpj}
                        onChange={(e) => {
                          if (!readOnly) {
                            onFormDataChange({ ...formData, cpfCnpj: e.target.value });
                            if (touched.cpfCnpj) {
                              validateField('cpfCnpj', e.target.value);
                            }
                          }
                        }}
                        onBlur={() => {
                          if (!readOnly) {
                            markFieldTouched('cpfCnpj');
                            const cleaned = removeMask(formData.cpfCnpj);
                            if (cleaned.length > 0) {
                              const isValid = formData.tipo === 'juridica' ? validarCNPJ(formData.cpfCnpj) : validarCPF(formData.cpfCnpj);
                              if (!isValid) {
                                // O erro será setado pelo validateField se o schema validar,
                                // mas podemos forçar uma validação visual aqui se necessário
                              }
                            }
                            validateField('cpfCnpj', formData.cpfCnpj);
                          }
                        }}
                        error={touched.cpfCnpj ? errors.cpfCnpj : undefined}
                        success={touched.cpfCnpj && !errors.cpfCnpj && (formData.tipo === 'juridica' ? formData.cpfCnpj.length >= 14 : formData.cpfCnpj.length >= 11)}
                        helperText={formData.tipo === 'juridica' ? "Digite o CNPJ (14 dígitos)" : "Digite o CPF (11 dígitos)"}
                        placeholder={formData.tipo === 'juridica' ? "00.000.000/0001-00" : "000.000.000-00"}
                        disabled={readOnly}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="nomeResponsavel">Nome do Responsável</Label>
                      <Input
                        id="nomeResponsavel"
                        value={formData.nomeResponsavel}
                        onChange={(e) => !souResponsavel && onFormDataChange({ ...formData, nomeResponsavel: e.target.value })}
                        placeholder="Nome do contato principal"
                        disabled={souResponsavel}
                      />
                      {souResponsavel && (
                        <p className="text-xs text-muted-foreground">
                          Nome preenchido automaticamente
                        </p>
                      )}
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

                    <div>
                      <FormMaskedInput
                        id="telefone"
                        label="Celular"
                        required
                        maskType="celular"
                        value={formData.telefone}
                        onChange={(e) => {
                          if (!readOnly) {
                            onFormDataChange({ ...formData, telefone: e.target.value });
                            if (touched.telefone) validateField('telefone', e.target.value);
                          }
                        }}
                        onBlur={() => {
                          if (!readOnly) {
                            markFieldTouched('telefone');
                            validateField('telefone', formData.telefone);
                          }
                        }}
                        error={touched.telefone ? errors.telefone : undefined}
                        success={touched.telefone && !errors.telefone && validarTelefone(formData.telefone)}
                        helperText="Digite com DDD"
                        placeholder="(00) 0 0000-0000"
                        disabled={readOnly}
                      />
                    </div>

                    <div>
                      <FormInput
                        id="email"
                        label="Email"
                        required
                        type="email"
                        value={formData.email}
                        onChange={(e) => {
                          if (!readOnly) {
                            onFormDataChange({ ...formData, email: e.target.value });
                            if (touched.email) validateField('email', e.target.value);
                          }
                        }}
                        onBlur={() => {
                          if (!readOnly) {
                            markFieldTouched('email');
                            validateField('email', formData.email);
                          }
                        }}
                        error={touched.email ? errors.email : undefined}
                        success={touched.email && !errors.email && formData.email.includes('@')}
                        helperText="Digite um email válido"
                        placeholder="email@exemplo.com"
                        disabled={readOnly}
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
  });

CadastrarLead.displayName = 'CadastrarLead';
