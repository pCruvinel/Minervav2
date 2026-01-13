"use client";

/**
 * LeadCadastro - Componente orquestrador para cadastro de Lead
 * 
 * Componente principal que integra:
 * - LeadSelector: Seleção de lead existente
 * - LeadFormIdentificacao: Formulário de identificação
 * - LeadFormEdificacao: Formulário de edificação
 * - LeadFormEndereco: Formulário de endereço
 * 
 * @example
 * ```tsx
 * const ref = useRef<LeadCadastroHandle>(null);
 * 
 * <LeadCadastro
 *   ref={ref}
 *   selectedLeadId={leadId}
 *   onLeadChange={(id, data) => setLeadId(id)}
 *   showEdificacao={true}
 *   showEndereco={true}
 * />
 * 
 * // Para validar e salvar:
 * const isValid = ref.current?.validate();
 * const savedId = await ref.current?.save();
 * ```
 */

import { forwardRef, useImperativeHandle, useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { AlertCircle, Check, Loader2, User, Building2, MapPin, X } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';
import { logger } from '@/lib/utils/logger';
import { supabase } from '@/lib/supabase-client';
import { useClientes } from '@/lib/hooks/use-clientes';

// Sub-componentes
import { LeadSelector } from './lead-selector';
import { LeadFormIdentificacao } from './lead-form-identificacao';
import { LeadFormEdificacao } from './lead-form-edificacao';
import { LeadFormEndereco } from './lead-form-endereco';

// Tipos
import type {
    LeadCadastroProps,
    LeadCadastroHandle,
    LeadCompleto,
    LeadIdentificacao,
    LeadEdificacao,
    LeadEndereco,
} from './types';

// Estado inicial vazio
const EMPTY_IDENTIFICACAO: LeadIdentificacao = {
    nome: '',
    cpfCnpj: '',
    tipo: 'juridica',
    tipoEmpresa: undefined,
    nomeResponsavel: '',
    cargoResponsavel: '',
    telefone: '',
    email: '',
    apelido: '',
};

const EMPTY_EDIFICACAO: LeadEdificacao = {
    tipoEdificacao: '',
    qtdUnidades: '',
    qtdBlocos: '',
    qtdPavimentos: '',
    tipoTelhado: '',
    possuiElevador: false,
    possuiPiscina: false,
};

const EMPTY_ENDERECO: LeadEndereco = {
    cep: '',
    rua: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    estado: '',
};

export const LeadCadastro = forwardRef<LeadCadastroHandle, LeadCadastroProps>(
    function LeadCadastro(
        {
            selectedLeadId,
            onLeadChange,
            readOnly = false,
            showEdificacao = true,
            showEndereco = true,
            initialData,
            statusFilter = 'LEAD',
        },
        ref
    ) {
        // Estados do formulário
        const [identificacao, setIdentificacao] = useState<LeadIdentificacao>(
            initialData?.identificacao || EMPTY_IDENTIFICACAO
        );
        const [edificacao, setEdificacao] = useState<LeadEdificacao>(
            initialData?.edificacao || EMPTY_EDIFICACAO
        );
        const [endereco, setEndereco] = useState<LeadEndereco>(
            initialData?.endereco || EMPTY_ENDERECO
        );

        // Estados de UI
        const [showNewLeadDialog, setShowNewLeadDialog] = useState(false);
        const [errors, setErrors] = useState<Record<string, string>>({});
        const [isSaving, setIsSaving] = useState(false);
        const [activeTab, setActiveTab] = useState('identificacao');

        // Hooks
        const { clientes: leads, loading: loadingLeads, refetch } = useClientes(
            typeof statusFilter === 'string' ? statusFilter : { status: statusFilter }
        );

        // Lead selecionado
        const selectedLead = leads?.find(l => l.id === selectedLeadId);

        // Flag para evitar múltiplas cargas de dados
        const hasLoadedLead = useRef(false);

        // Carregar dados do lead quando selecionado
        useEffect(() => {
            if (selectedLeadId && selectedLead && !hasLoadedLead.current) {
                logger.log('📝 Carregando dados do lead selecionado:', selectedLead.nome_razao_social);
                hasLoadedLead.current = true;

                // Identificação
                setIdentificacao({
                    id: selectedLead.id,
                    nome: selectedLead.nome_razao_social || '',
                    cpfCnpj: selectedLead.cpf_cnpj || '',
                    tipo: selectedLead.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' : 'juridica',
                    tipoEmpresa: selectedLead.tipo_empresa || undefined,
                    nomeResponsavel: selectedLead.nome_responsavel || '',
                    cargoResponsavel: '', // Campo não existe na tabela atual
                    telefone: selectedLead.telefone || '',
                    email: selectedLead.email || '',
                    apelido: selectedLead.apelido || '',
                });

                // Edificação e Endereço do campo 'endereco' JSONB
                if (selectedLead.endereco) {
                    const endData = selectedLead.endereco as any;

                    setEdificacao({
                        tipoEdificacao: endData.tipo_edificacao || '',
                        qtdUnidades: endData.qtd_unidades?.toString() || '',
                        qtdBlocos: endData.qtd_blocos?.toString() || '',
                        qtdPavimentos: endData.qtd_pavimentos?.toString() || '',
                        tipoTelhado: endData.tipo_telhado || '',
                        possuiElevador: endData.possui_elevador || false,
                        possuiPiscina: endData.possui_piscina || false,
                    });

                    setEndereco({
                        cep: endData.cep || '',
                        rua: endData.rua || endData.logradouro || '',
                        numero: endData.numero || '',
                        complemento: endData.complemento || '',
                        bairro: endData.bairro || '',
                        cidade: endData.cidade || '',
                        estado: endData.estado || endData.uf || '',
                    });
                }
            }
        }, [selectedLeadId, selectedLead]);

        // Resetar flag quando lead mudar
        useEffect(() => {
            if (!selectedLeadId) {
                hasLoadedLead.current = false;
            }
        }, [selectedLeadId]);

        /**
         * Valida todos os campos obrigatórios
         */
        const validate = useCallback((): boolean => {
            const newErrors: Record<string, string> = {};

            // Identificação
            if (!identificacao.nome) newErrors.nome = 'Nome é obrigatório';
            if (!identificacao.cpfCnpj) newErrors.cpfCnpj = 'CPF/CNPJ é obrigatório';
            if (!identificacao.tipo) newErrors.tipo = 'Tipo é obrigatório';
            if (!identificacao.telefone) newErrors.telefone = 'Telefone é obrigatório';
            if (!identificacao.email) newErrors.email = 'Email é obrigatório';

            if (identificacao.tipo === 'juridica' && !identificacao.tipoEmpresa) {
                newErrors.tipoEmpresa = 'Tipo de empresa é obrigatório';
            }

            // Edificação (se habilitado)
            if (showEdificacao) {
                if (!edificacao.tipoEdificacao) newErrors.tipoEdificacao = 'Tipo de edificação é obrigatório';
                if (!edificacao.tipoTelhado) newErrors.tipoTelhado = 'Tipo de telhado é obrigatório';

                // Unidades para condomínios
                if (edificacao.tipoEdificacao?.includes('Condomínio') && !edificacao.qtdUnidades) {
                    newErrors.qtdUnidades = 'Quantidade de unidades é obrigatória';
                }

                // Blocos para apartamentos
                if (edificacao.tipoEdificacao === 'Condomínio Residencial - Apartamentos' && !edificacao.qtdBlocos) {
                    newErrors.qtdBlocos = 'Quantidade de blocos é obrigatória';
                }
            }

            // Endereço (se habilitado)
            if (showEndereco) {
                if (!endereco.cep) newErrors.cep = 'CEP é obrigatório';
                if (!endereco.rua) newErrors.rua = 'Rua é obrigatória';
                if (!endereco.numero) newErrors.numero = 'Número é obrigatório';
                if (!endereco.bairro) newErrors.bairro = 'Bairro é obrigatório';
                if (!endereco.cidade) newErrors.cidade = 'Cidade é obrigatória';
                if (!endereco.estado) newErrors.estado = 'Estado é obrigatório';
            }

            setErrors(newErrors);

            if (Object.keys(newErrors).length > 0) {
                logger.warn('⚠️ Validação falhou:', newErrors);

                // Navegar para a aba com erro
                if (newErrors.nome || newErrors.cpfCnpj || newErrors.tipo || newErrors.telefone || newErrors.email) {
                    setActiveTab('identificacao');
                } else if (newErrors.tipoEdificacao || newErrors.tipoTelhado) {
                    setActiveTab('edificacao');
                } else if (newErrors.cep || newErrors.rua) {
                    setActiveTab('endereco');
                }

                return false;
            }

            return true;
        }, [identificacao, edificacao, endereco, showEdificacao, showEndereco]);

        /**
         * Verifica se o formulário está válido sem marcar campos como touched
         */
        const isValid = useCallback((): boolean => {
            // Validação simples sem side effects
            if (!identificacao.nome || !identificacao.cpfCnpj || !identificacao.telefone || !identificacao.email) {
                return false;
            }

            if (showEdificacao && (!edificacao.tipoEdificacao || !edificacao.tipoTelhado)) {
                return false;
            }

            if (showEndereco && (!endereco.cep || !endereco.rua || !endereco.numero)) {
                return false;
            }

            return true;
        }, [identificacao, edificacao, endereco, showEdificacao, showEndereco]);

        /**
         * Retorna os dados atuais do formulário
         */
        const getData = useCallback((): LeadCompleto => {
            return {
                identificacao,
                edificacao,
                endereco,
            };
        }, [identificacao, edificacao, endereco]);

        /**
         * Salva o lead no banco de dados
         */
        const save = useCallback(async (): Promise<string | null> => {
            if (!validate()) {
                toast.error('Preencha todos os campos obrigatórios');
                return null;
            }

            setIsSaving(true);

            try {
                logger.log('💾 Salvando lead...');

                // Montar objeto de endereço JSONB (inclui edificação + endereço)
                const enderecoJsonb = {
                    // Edificação
                    tipo_edificacao: edificacao.tipoEdificacao,
                    qtd_unidades: edificacao.qtdUnidades ? parseInt(edificacao.qtdUnidades) : null,
                    qtd_blocos: edificacao.qtdBlocos ? parseInt(edificacao.qtdBlocos) : null,
                    qtd_pavimentos: edificacao.qtdPavimentos ? parseInt(edificacao.qtdPavimentos) : null,
                    tipo_telhado: edificacao.tipoTelhado,
                    possui_elevador: edificacao.possuiElevador,
                    possui_piscina: edificacao.possuiPiscina,
                    // Endereço
                    cep: endereco.cep,
                    rua: endereco.rua,
                    numero: endereco.numero,
                    complemento: endereco.complemento,
                    bairro: endereco.bairro,
                    cidade: endereco.cidade,
                    estado: endereco.estado,
                };

                // Dados do cliente
                const clienteData = {
                    nome_razao_social: identificacao.nome,
                    cpf_cnpj: identificacao.cpfCnpj,
                    tipo_cliente: identificacao.tipo === 'fisica' ? 'PESSOA_FISICA' : 'PESSOA_JURIDICA',
                    tipo_empresa: identificacao.tipoEmpresa,
                    nome_responsavel: identificacao.nomeResponsavel,
                    telefone: identificacao.telefone,
                    email: identificacao.email,
                    apelido: identificacao.apelido,
                    endereco: enderecoJsonb,
                    status: 'lead',
                };

                let savedId: string;

                if (selectedLeadId) {
                    // Atualizar lead existente
                    logger.log('🔄 Atualizando lead existente:', selectedLeadId);

                    const { error } = await supabase
                        .from('clientes')
                        .update(clienteData)
                        .eq('id', selectedLeadId);

                    if (error) throw error;
                    savedId = selectedLeadId;
                } else {
                    // Criar novo lead
                    logger.log('➕ Criando novo lead...');

                    const { data, error } = await supabase
                        .from('clientes')
                        .insert(clienteData)
                        .select()
                        .single();

                    if (error) throw error;
                    savedId = data.id;
                }

                logger.log('✅ Lead salvo com sucesso:', savedId);
                toast.success('Lead salvo com sucesso!');

                // Atualizar lista de leads
                await refetch();

                // Notificar componente pai
                onLeadChange(savedId, getData());

                return savedId;
            } catch (error: any) {
                logger.error('❌ Erro ao salvar lead:', error);

                if (error.code === '23505') {
                    toast.error('CPF/CNPJ já cadastrado no sistema');
                } else {
                    toast.error('Erro ao salvar lead. Tente novamente.');
                }

                return null;
            } finally {
                setIsSaving(false);
            }
        }, [validate, identificacao, edificacao, endereco, selectedLeadId, onLeadChange, getData, refetch]);

        // Expor métodos via ref
        useImperativeHandle(ref, () => ({
            validate,
            isValid,
            save,
            getData,
        }));

        /**
         * Handle para quando um lead é selecionado no selector
         */
        /**
         * Mapeia dados brutos do cliente para o formato interno LeadCompleto
         */
        const mapToLeadCompleto = useCallback((lead: any): LeadCompleto => {
            if (!lead) return null as any;

            const endData = lead.endereco || {};

            const identificacao: LeadIdentificacao = {
                id: lead.id,
                nome: lead.nome_razao_social || '',
                cpfCnpj: lead.cpf_cnpj || '',
                tipo: lead.tipo_cliente === 'PESSOA_FISICA' ? 'fisica' : 'juridica',
                tipoEmpresa: lead.tipo_empresa || undefined,
                nomeResponsavel: lead.nome_responsavel || '',
                cargoResponsavel: '',
                telefone: lead.telefone || '',
                email: lead.email || '',
                apelido: lead.apelido || '',
            };

            const edificacao: LeadEdificacao = {
                tipoEdificacao: endData.tipo_edificacao || '',
                qtdUnidades: endData.qtd_unidades?.toString() || '',
                qtdBlocos: endData.qtd_blocos?.toString() || '',
                qtdPavimentos: endData.qtd_pavimentos?.toString() || '',
                tipoTelhado: endData.tipo_telhado || '',
                possuiElevador: endData.possui_elevador || false,
                possuiPiscina: endData.possui_piscina || false,
            };

            const endereco: LeadEndereco = {
                cep: endData.cep || '',
                rua: endData.rua || endData.logradouro || '',
                numero: endData.numero || '',
                complemento: endData.complemento || '',
                bairro: endData.bairro || '',
                cidade: endData.cidade || '',
                estado: endData.estado || endData.uf || '',
            };

            return { identificacao, edificacao, endereco };
        }, []);

        /**
         * Handle para quando um lead é selecionado no selector
         */
        const handleSelectLead = (leadId: string, leadData?: any) => {
            // Resetar flag para carregar novos dados
            hasLoadedLead.current = false;
            setShowNewLeadDialog(false);

            // Mapear dados para o formato esperado pelo pai
            const leadCompleto = leadData ? mapToLeadCompleto(leadData) : undefined;

            // Notificar componente pai
            onLeadChange(leadId, leadCompleto);
        };

        /**
         * Handle para limpar seleção
         */
        const handleClearSelection = () => {
            hasLoadedLead.current = false;
            setIdentificacao(EMPTY_IDENTIFICACAO);
            setEdificacao(EMPTY_EDIFICACAO);
            setEndereco(EMPTY_ENDERECO);
            setErrors({});
            onLeadChange('', undefined);
        };

        /**
         * Handle para criar novo lead
         */
        const handleCreateNew = () => {
            handleClearSelection();
            setShowNewLeadDialog(true);
        };

        /**
         * Handle para salvar novo lead do dialog
         */
        const handleSaveNewLead = async () => {
            const savedId = await save();
            if (savedId) {
                setShowNewLeadDialog(false);
            }
        };

        return (
            <div className="space-y-4">
                {/* Card de Seleção/Resumo do Lead */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Cliente
                        </CardTitle>
                        <CardDescription>
                            Selecione um cliente existente ou crie um novo
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        {!selectedLeadId ? (
                            // Selector de lead
                            <LeadSelector
                                selectedLeadId={selectedLeadId}
                                onSelectLead={handleSelectLead}
                                onCreateNew={handleCreateNew}
                                disabled={readOnly || loadingLeads}
                                statusFilter={statusFilter}
                            />
                        ) : (
                            // Card resumo do lead selecionado
                            <div className="flex items-start justify-between p-4 rounded-lg border bg-primary/5 border-primary/20">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarFallback className="bg-primary text-primary-foreground">
                                            {selectedLead?.nome_razao_social?.substring(0, 2).toUpperCase() || 'CL'}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div>
                                        <div className="font-semibold text-lg">
                                            {selectedLead?.nome_razao_social || identificacao.nome}
                                        </div>
                                        <div className="text-sm text-muted-foreground space-y-0.5">
                                            <div>CPF/CNPJ: {selectedLead?.cpf_cnpj || identificacao.cpfCnpj || 'Não informado'}</div>
                                            <div>Tel: {selectedLead?.telefone || identificacao.telefone || 'Não informado'}</div>
                                            <div>Email: {selectedLead?.email || identificacao.email || 'Não informado'}</div>
                                        </div>
                                    </div>
                                </div>

                                {!readOnly && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleClearSelection}
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Alterar
                                    </Button>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Tabs de Edificação e Endereço (se lead selecionado e habilitado) */}
                {selectedLeadId && (showEdificacao || showEndereco) && (
                    <Card>
                        <CardContent className="pt-6">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full" style={{ gridTemplateColumns: `repeat(${(showEdificacao ? 1 : 0) + (showEndereco ? 1 : 0)}, 1fr)` }}>
                                    {showEdificacao && (
                                        <TabsTrigger value="edificacao" className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Edificação
                                            {(errors.tipoEdificacao || errors.tipoTelhado) && (
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                            )}
                                        </TabsTrigger>
                                    )}
                                    {showEndereco && (
                                        <TabsTrigger value="endereco" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Endereço
                                            {(errors.cep || errors.rua) && (
                                                <AlertCircle className="h-4 w-4 text-destructive" />
                                            )}
                                        </TabsTrigger>
                                    )}
                                </TabsList>

                                {showEdificacao && (
                                    <TabsContent value="edificacao" className="mt-4">
                                        <LeadFormEdificacao
                                            data={edificacao}
                                            onChange={setEdificacao}
                                            errors={errors}
                                            readOnly={readOnly}
                                        />
                                    </TabsContent>
                                )}

                                {showEndereco && (
                                    <TabsContent value="endereco" className="mt-4">
                                        <LeadFormEndereco
                                            data={endereco}
                                            onChange={setEndereco}
                                            errors={errors}
                                            readOnly={readOnly}
                                        />
                                    </TabsContent>
                                )}
                            </Tabs>
                        </CardContent>
                    </Card>
                )}

                {/* Dialog para criar novo lead */}
                <Dialog open={showNewLeadDialog} onOpenChange={setShowNewLeadDialog}>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>Cadastrar Novo Cliente</DialogTitle>
                            <DialogDescription>
                                Preencha os dados do cliente para criar um novo cadastro
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-6 py-4">
                            <Tabs value={activeTab} onValueChange={setActiveTab}>
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="identificacao" className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        Identificação
                                        {(errors.nome || errors.cpfCnpj) && (
                                            <AlertCircle className="h-4 w-4 text-destructive" />
                                        )}
                                    </TabsTrigger>
                                    {showEdificacao && (
                                        <TabsTrigger value="edificacao" className="flex items-center gap-2">
                                            <Building2 className="h-4 w-4" />
                                            Edificação
                                        </TabsTrigger>
                                    )}
                                    {showEndereco && (
                                        <TabsTrigger value="endereco" className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            Endereço
                                        </TabsTrigger>
                                    )}
                                </TabsList>

                                <TabsContent value="identificacao" className="mt-4">
                                    <LeadFormIdentificacao
                                        data={identificacao}
                                        onChange={setIdentificacao}
                                        errors={errors}
                                    />
                                </TabsContent>

                                {showEdificacao && (
                                    <TabsContent value="edificacao" className="mt-4">
                                        <LeadFormEdificacao
                                            data={edificacao}
                                            onChange={setEdificacao}
                                            errors={errors}
                                        />
                                    </TabsContent>
                                )}

                                {showEndereco && (
                                    <TabsContent value="endereco" className="mt-4">
                                        <LeadFormEndereco
                                            data={endereco}
                                            onChange={setEndereco}
                                            errors={errors}
                                        />
                                    </TabsContent>
                                )}
                            </Tabs>
                        </div>

                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setShowNewLeadDialog(false);
                                    handleClearSelection();
                                }}
                            >
                                Cancelar
                            </Button>
                            <Button
                                onClick={handleSaveNewLead}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                        Salvando...
                                    </>
                                ) : (
                                    <>
                                        <Check className="h-4 w-4 mr-2" />
                                        Salvar Cliente
                                    </>
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        );
    }
);
