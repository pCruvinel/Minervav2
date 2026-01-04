"use client";

/**
 * CadastrarClienteObra - Componente de cadastro de cliente para obras (OS13 Etapa 1)
 *
 * Funcionalidades:
 * - Seleção de lead existente
 * - Campos estratégicos (data contratação, aniversário gestor, senha, centro de custo)
 * - Upload de documentos (cliente + OS)
 * - Geração automática de Centro de Custo
 *
 * @example
 * ```tsx
 * <CadastrarClienteObra
 *   ref={stepRef}
 *   data={etapa1Data}
 *   onDataChange={setEtapa1Data}
 *   readOnly={false}
 *   osId={osId}
 * />
 * ```
 */

import { forwardRef, useImperativeHandle, useState, useEffect, useRef } from 'react';
import { logger } from '@/lib/utils/logger';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/components/ui/utils';
import { toast } from '@/lib/utils/safe-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Hooks
import { useClientes } from '@/lib/hooks/use-clientes';
import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
import { type TipoDocumento } from '@/lib/hooks/use-cliente-documentos';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import { supabase } from '@/lib/supabase-client';

// Validação
import { steps } from '@/components/os/obras/os-13/pages/constants';
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';
import { cadastrarClienteObraSchema, type CadastrarClienteObraData } from '@/lib/validations/cadastrar-cliente-obra-schema';

export interface CadastrarClienteObraProps {
  data: CadastrarClienteObraData;
  onDataChange: (data: CadastrarClienteObraData) => void;
  readOnly?: boolean;
  osId?: string;
  parentOSId?: string;
  clienteId?: string;
}

export interface CadastrarClienteObraHandle {
  validate: () => boolean;
  saveData: () => Promise<string | null>;
}

export const CadastrarClienteObra = forwardRef<CadastrarClienteObraHandle, CadastrarClienteObraProps>(
  function CadastrarClienteObra({ data, onDataChange, readOnly = false, osId: initialOsId, parentOSId, clienteId }, ref) {
    // Estados locais
    const [showCombobox, setShowCombobox] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Datas
    const [dataContratacao, setDataContratacao] = useState<Date | undefined>(
      data.dataContratacao ? new Date(data.dataContratacao) : undefined
    );
    const [aniversarioGestor, setAniversarioGestor] = useState<Date | undefined>(
      data.aniversarioGestor ? new Date(data.aniversarioGestor) : undefined
    );

    // Hooks
    const { clientes: leads, loading: loadingLeads } = useClientes('LEAD');
    const { createCentroCustoWithId } = useCentroCusto();
    const { mutate: createOS } = useCreateOSWorkflow();

    // Cliente selecionado
    const selectedLead = leads.find(l => l.id === data.clienteId);

    /**
     * Registra arquivos já uploadados pelo FileUploadUnificado na tabela clientes_documentos
     * Os arquivos já estão no Storage, apenas precisamos registrar os metadados no banco
     */
    const registerUploadedDocuments = async (
      files: FileWithComment[],
      tipo: TipoDocumento
    ): Promise<void> => {
      if (!files || files.length === 0 || !data.clienteId) return;

      logger.log(`📁 Registrando ${files.length} ${tipo} no banco...`);

      for (const fileItem of files) {
        // Verificar se já foi registrado (tem ID do banco)
        // FileWithComment do FileUploadUnificado já tem url e path preenchidos
        if (!fileItem.url || !fileItem.path) {
          logger.warn(`⚠️ Arquivo ${fileItem.name} não tem URL/path, pulando...`);
          continue;
        }

        // Registrar no banco de dados (insert simples, sem upsert)
        const { error } = await supabase
          .from('clientes_documentos')
          .insert({
            cliente_id: data.clienteId,
            tipo_documento: tipo,
            nome_arquivo: fileItem.name,
            caminho_storage: fileItem.path,
            mime_type: fileItem.type,
            tamanho_bytes: fileItem.size,
          });

        if (error) {
          // Se for erro de duplicata, ignorar (documento já registrado)
          if (error.code === '23505') {
            logger.log(`ℹ️ Documento ${fileItem.name} já registrado, pulando...`);
          } else {
            logger.error(`❌ Erro ao registrar ${fileItem.name}:`, error);
          }
          // Não lançar erro, continuar com próximo arquivo
        }
      }

      logger.log(`✅ ${files.length} ${tipo} registrados`);
    };

    // Pré-selecionar cliente quando clienteId é fornecido via prop (vindo de OS pai)
    const hasPreselectedClient = useRef(false);
    useEffect(() => {
      // Só executar uma vez quando:
      // 1. Tem clienteId da prop (vindo da URL)
      // 2. Leads já carregaram
      // 3. Ainda não pré-selecionamos
      if (clienteId && leads.length > 0 && !hasPreselectedClient.current) {
        const cliente = leads.find(l => l.id === clienteId);
        if (cliente) {
          logger.log('🔗 Pré-selecionando cliente da OS pai:', cliente.nome_razao_social);
          onDataChange({ ...data, clienteId });
          hasPreselectedClient.current = true;
        }
      }
    }, [clienteId, leads]);

    // ... (generatePassword and validate functions remain the same) ...



    /**
     * Valida todos os campos obrigatórios
     */
    const validate = (): boolean => {
      try {
        cadastrarClienteObraSchema.parse(data);
        setErrors({});
        return true;
      } catch (err: any) {
        const newErrors: Record<string, string> = {};

        if (err.errors) {
          err.errors.forEach((error: any) => {
            const field = error.path[0];
            newErrors[field] = error.message;
          });
        }

        setErrors(newErrors);
        logger.error('❌ Validação falhou:', newErrors);
        toast.error('Preencha todos os campos obrigatórios');
        return false;
      }
    };

    /**
     * Salva todos os dados (cliente, documentos, centro de custo, metadata OS)
     */
    const saveData = async (): Promise<string | null> => {
      if (!validate()) {
        return null;
      }

      try {
        setIsSaving(true);
        logger.log('💾 Iniciando salvamento de dados da obra...');

        // 1. (Removido) Atualização de senha feita via fluxo de convite


        // 2. Registrar documentos do cliente no banco (já foram uploadados pelo FileUploadUnificado)
        logger.log('📁 Registrando documentos do cliente no banco...');

        await Promise.all([
          registerUploadedDocuments(data.documentosFoto, 'documento_foto'),
          registerUploadedDocuments(data.comprovantesResidencia, 'comprovante_residencia'),
          registerUploadedDocuments(data.contratoSocial, 'contrato_social'),
          data.logoCliente && data.logoCliente.length > 0
            ? registerUploadedDocuments(data.logoCliente, 'logo_cliente')
            : Promise.resolve()
        ]);

        // 3. Gerar Centro de Custo
        logger.log('🏗️ Gerando Centro de Custo...');

        // 3. Obter usuário logado
        const { data: { user } } = await supabase.auth.getUser();

        // 4. Criar ou recuperar OS primeiro
        let currentOsId: string | undefined = initialOsId;
        let osCreatedNow = false;

        if (!currentOsId) {
          logger.log('🆕 Criando nova OS (sem CC inicial)...');
          // Criamos a OS sem CC primeiro
          const result = await createOS({
            tipoOSCodigo: 'OS-13',
            clienteId: data.clienteId,
            ccId: undefined, // Será atualizado depois
            responsavelId: user?.id || null,
            descricao: `Start de Contrato - ${selectedLead?.nome_razao_social || 'Cliente'}`,
            metadata: {
              data_contratacao: data.dataContratacao,
              aniversario_gestor: data.aniversarioGestor
            },
            etapas: steps.map(s => ({
              nome_etapa: s.title,
              ordem: s.id,
              dados_etapa: s.id === 1 ? data : {}
            })),
            parentOSId
          });

          currentOsId = result.os.id;
          osCreatedNow = true;
          logger.log('✅ Nova OS criada:', currentOsId);
        } else {
          // Atualizar metadata da OS existente
          logger.log('💾 Salvando metadata da OS...');
          const { data: currentOS } = await supabase
            .from('ordens_servico')
            .select('metadata')
            .eq('id', currentOsId)
            .single();

          const updatedMetadata = {
            ...(currentOS?.metadata || {}),
            data_contratacao: data.dataContratacao,
            aniversario_gestor: data.aniversarioGestor
          };

          await supabase
            .from('ordens_servico')
            .update({ metadata: updatedMetadata })
            .eq('id', currentOsId);
        }

        // 4. Gerar Centro de Custo com ID = OS ID
        logger.log('🏗️ Gerando Centro de Custo com ID igual à OS...');

        // Recuperar tipoOSId se não tivermos
        let tipoOSId = '';
        if (osCreatedNow) {
          // Já sabemos que é OS-13 se acabamos de criar, mas precisamos do ID
          const { data: tipoOS } = await supabase
            .from('tipos_os')
            .select('id')
            .eq('codigo', 'OS-13')
            .single();
          if (tipoOS?.id) tipoOSId = tipoOS.id;
        } else {
          // Buscar da OS existente
          const { data: os } = await supabase
            .from('ordens_servico')
            .select('tipo_os_id')
            .eq('id', currentOsId)
            .single();
          if (os?.tipo_os_id) tipoOSId = os.tipo_os_id;
        }

        if (!tipoOSId) throw new Error('Tipo de OS não encontrado');

        // Criar CC com ID específico
        const cc = await createCentroCustoWithId(
          currentOsId, // ID DO CC = ID DA OS
          tipoOSId,
          data.clienteId,
          `Centro de Custo - ${selectedLead?.nome_razao_social || 'Cliente'}`
        );
        logger.log('✅ Centro de Custo criado:', cc.nome);

        // 5. Vincular CC à OS
        logger.log('🔗 Vinculando Centro de Custo à OS...');
        await supabase
          .from('ordens_servico')
          .update({ cc_id: cc.id })
          .eq('id', currentOsId);

        // 7. Upload de contrato assinado (documento da OS)
        // Agora temos certeza que currentOsId existe
        logger.log('📤 Registrando contrato assinado...');
        const uploadedBy = user?.id || null;

        for (const file of data.contratoAssinado) {
          await supabase.from('os_documentos').insert({
            os_id: currentOsId,
            etapa_id: null, // Documento geral da OS
            nome: file.name,
            tipo: 'contrato_assinado',
            caminho_arquivo: file.path,
            tamanho_bytes: file.size,
            mime_type: file.type,
            uploaded_by: uploadedBy
          });
        }

        // 7. Atualizar data local com Centro de Custo gerado
        onDataChange({
          ...data,
          centroCusto: cc
        });

        logger.log('✅ Salvamento concluído com sucesso!');
        toast.success('Dados salvos com sucesso!');
        return currentOsId;
      } catch (error) {
        logger.error('❌ Erro ao salvar dados:', error);
        toast.error('Erro ao salvar dados. Tente novamente.');
        return null;
      } finally {
        setIsSaving(false);
      }
    };

    // Expor métodos via ref
    useImperativeHandle(ref, () => ({
      validate,
      saveData
    }));

    return (
      <div className="space-y-6">
        {/* SEÇÃO A: Seleção e Visualização de Lead */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Cliente (Lead)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!data.clienteId ? (
              <Popover open={showCombobox} onOpenChange={setShowCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={showCombobox}
                    className="w-full justify-between"
                    disabled={readOnly || loadingLeads}
                  >
                    {loadingLeads ? 'Carregando leads...' : 'Selecione um cliente'}
                    <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar por nome, CPF ou CNPJ..." />
                    <CommandEmpty>Nenhum lead encontrado.</CommandEmpty>
                    <CommandList>
                      <CommandGroup>
                        {leads.map((lead) => (
                          <CommandItem
                            key={lead.id}
                            value={lead.nome_razao_social}
                            onSelect={() => {
                              onDataChange({
                                ...data,
                                clienteId: lead.id,
                                clienteNome: lead.nome_razao_social
                              });
                              setShowCombobox(false);
                            }}
                          >
                            <div className="flex items-center gap-2 w-full">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {lead.nome_razao_social?.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <div className="font-medium">{lead.nome_razao_social}</div>
                                <div className="text-sm text-muted-foreground">
                                  {lead.cpf_cnpj} • {lead.telefone}
                                </div>
                              </div>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            ) : (
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary text-white">
                          {selectedLead?.nome_razao_social?.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-lg">{selectedLead?.nome_razao_social}</div>
                        <div className="text-sm text-muted-foreground space-y-1">
                          <div>CPF/CNPJ: {selectedLead?.cpf_cnpj || 'Não informado'}</div>
                          <div>Telefone: {selectedLead?.telefone || 'Não informado'}</div>
                          <div>Email: {selectedLead?.email || 'Não informado'}</div>
                        </div>
                      </div>
                    </div>
                    {!readOnly && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDataChange({ ...data, clienteId: '', clienteNome: '' })}
                      >
                        Alterar
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            {errors.clienteId && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {errors.clienteId}
              </p>
            )}
          </CardContent>
        </Card>

        {/* SEÇÃO B: Campos Estratégicos */}
        {data.clienteId && (
          <Card>
            <CardHeader>
              <CardTitle>Dados Estratégicos do Contrato</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Data de Contratação */}
              <div className="space-y-2">
                <Label htmlFor="dataContratacao">Data de Contratação *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !dataContratacao && 'text-muted-foreground',
                        errors.dataContratacao && 'border-destructive'
                      )}
                      disabled={readOnly}
                    >
                      {dataContratacao ? format(dataContratacao, 'PPP', { locale: ptBR }) : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={dataContratacao}
                      onSelect={(date) => {
                        setDataContratacao(date);
                        onDataChange({ ...data, dataContratacao: date?.toISOString() || '' });
                      }}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {errors.dataContratacao && (
                  <p className="text-sm text-destructive">{errors.dataContratacao}</p>
                )}
              </div>

              {/* Aniversário do Gestor */}
              <div className="space-y-2">
                <Label htmlFor="aniversarioGestor">Aniversário do Gestor *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left font-normal',
                        !aniversarioGestor && 'text-muted-foreground',
                        errors.aniversarioGestor && 'border-destructive'
                      )}
                      disabled={readOnly}
                    >
                      {aniversarioGestor ? format(aniversarioGestor, 'PPP', { locale: ptBR }) : 'Selecione a data'}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={aniversarioGestor}
                      onSelect={(date) => {
                        setAniversarioGestor(date);
                        onDataChange({ ...data, aniversarioGestor: date?.toISOString() || '' });
                      }}
                      initialFocus
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
                {errors.aniversarioGestor && (
                  <p className="text-sm text-destructive">{errors.aniversarioGestor}</p>
                )}
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Esta data será usada futuramente para criar lembretes automáticos
                  </AlertDescription>
                </Alert>
              </div>



              {/* Centro de Custo (Read-Only) */}
              {data.centroCusto && (
                <div className="space-y-2">
                  <Label>Centro de Custo</Label>
                  <div className="p-3 bg-success/5 border border-success/20 rounded-md">
                    <div className="font-semibold text-success">{data.centroCusto.nome}</div>
                    <div className="text-sm text-success">Gerado automaticamente</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SEÇÃO C: Upload de Documentos */}
        {data.clienteId && (
          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="cliente" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="cliente">Documentos do Cliente</TabsTrigger>
                  <TabsTrigger value="os">Documentos da OS</TabsTrigger>
                </TabsList>

                {/* Documentos do Cliente */}
                <TabsContent value="cliente" className="space-y-4">
                  <FileUploadUnificado
                    label="Documento com Foto (RG/CNH) *"
                    files={data.documentosFoto}
                    onFilesChange={(files) => onDataChange({ ...data, documentosFoto: files })}
                    disabled={readOnly}
                    osId={initialOsId}
                    maxFiles={2}
                    maxFileSize={5}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']}
                  />
                  {errors.documentosFoto && (
                    <p className="text-sm text-destructive">{errors.documentosFoto}</p>
                  )}

                  <FileUploadUnificado
                    label="Comprovante de Residência *"
                    files={data.comprovantesResidencia}
                    onFilesChange={(files) => onDataChange({ ...data, comprovantesResidencia: files })}
                    disabled={readOnly}
                    osId={initialOsId}
                    maxFiles={2}
                    maxFileSize={5}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']}
                  />
                  {errors.comprovantesResidencia && (
                    <p className="text-sm text-destructive">{errors.comprovantesResidencia}</p>
                  )}

                  <FileUploadUnificado
                    label="Contrato Social / Ata de Eleição *"
                    files={data.contratoSocial}
                    onFilesChange={(files) => onDataChange({ ...data, contratoSocial: files })}
                    disabled={readOnly}
                    osId={initialOsId}
                    maxFiles={3}
                    maxFileSize={10}
                    acceptedTypes={['application/pdf']}
                  />
                  {errors.contratoSocial && (
                    <p className="text-sm text-destructive">{errors.contratoSocial}</p>
                  )}

                  <FileUploadUnificado
                    label="Logo do Cliente (Opcional)"
                    files={data.logoCliente || []}
                    onFilesChange={(files) => onDataChange({ ...data, logoCliente: files })}
                    disabled={readOnly}
                    osId={initialOsId}
                    maxFiles={1}
                    maxFileSize={2}
                    acceptedTypes={['image/jpeg', 'image/png', 'image/jpg']}
                  />
                </TabsContent>

                {/* Documentos da OS */}
                <TabsContent value="os" className="space-y-4">
                  <FileUploadUnificado
                    label="Contrato Assinado *"
                    files={data.contratoAssinado}
                    onFilesChange={(files) => onDataChange({ ...data, contratoAssinado: files })}
                    disabled={readOnly}
                    osId={initialOsId}
                    maxFiles={2}
                    maxFileSize={10}
                    acceptedTypes={['application/pdf']}
                  />
                  {errors.contratoAssinado && (
                    <p className="text-sm text-destructive">{errors.contratoAssinado}</p>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Indicador de Salvamento */}
        {isSaving && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Salvando dados e gerando Centro de Custo...
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
);
