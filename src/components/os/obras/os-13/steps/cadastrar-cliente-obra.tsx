"use client";

/**
 * CadastrarClienteObra - Componente de cadastro de cliente para obras (OS13 Etapa 1)
 *
 * Funcionalidades:
 * - Seleção/Cadastro de Lead (via LeadCadastro)
 * - Upload de documentos do cliente (via ClienteCompletar)
 * - Campos estratégicos (data contratação, aniversário gestor)
 * - Upload de contrato assinado (OS)
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
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { toast } from '@/lib/utils/safe-toast';

// Hooks
import { useCentroCusto } from '@/lib/hooks/use-centro-custo';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { supabase } from '@/lib/supabase-client';

// Validação
import { steps } from '@/components/os/obras/os-13/pages/constants';
import { useCreateOSWorkflow } from '@/lib/hooks/use-os-workflows';
import { cadastrarClienteObraSchema, type CadastrarClienteObraData } from '@/lib/validations/cadastrar-cliente-obra-schema';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { FormDatePicker } from '@/components/ui/form-date-picker';

// Novos Componentes Reutilizáveis
import { LeadCadastro, type LeadCadastroHandle } from '@/components/os/shared/lead-cadastro';
import { ClienteCompletar, type ClienteCompletarHandle } from '@/components/os/shared/cliente-completar';
import { type TipoCliente, type TipoEmpresa } from '@/components/os/shared/lead-cadastro/types';

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
  saveData: () => Promise<{ osId: string; data: CadastrarClienteObraData } | null>;
}

export const CadastrarClienteObra = forwardRef<CadastrarClienteObraHandle, CadastrarClienteObraProps>(
  function CadastrarClienteObra({ data, onDataChange, readOnly = false, osId: initialOsId, parentOSId, clienteId }, ref) {
    // Refs para componentes filhos
    const leadRef = useRef<LeadCadastroHandle>(null);
    const clienteRef = useRef<ClienteCompletarHandle>(null);

    // Estados locais
    const [isSaving, setIsSaving] = useState(false);

    // Estado para tipos (necessário para condicional de documentos)
    const [tipoCliente, setTipoCliente] = useState<TipoCliente>('fisica');
    const [tipoEmpresa, setTipoEmpresa] = useState<TipoEmpresa | undefined>(undefined);

    // Datas
    const [dataContratacao, setDataContratacao] = useState<Date | undefined>(
      data.dataContratacao ? new Date(data.dataContratacao) : undefined
    );
    const [aniversarioGestor, setAniversarioGestor] = useState<Date | undefined>(
      data.aniversarioGestor ? new Date(data.aniversarioGestor) : undefined
    );

    // Hooks
    const { createCentroCustoWithId } = useCentroCusto();
    const { mutate: createOS } = useCreateOSWorkflow();

    // Hook de Validação Padrão (Validation System)
    const {
      errors,
      touched,
      validateField,
      markFieldTouched,
      validateAll,
      markAllTouched
    } = useFieldValidation(cadastrarClienteObraSchema);

    // Sincronizar dados iniciais se clienteId vier da prop (OS Pai)
    useEffect(() => {
      if (clienteId && !data.clienteId) {
        onDataChange({ ...data, clienteId });
      }
    }, [clienteId, data.clienteId, onDataChange, data]);

    /**
     * Valida todos os campos obrigatórios
     */
    const validate = (): boolean => {
      markAllTouched();
      let isValid = true;

      // 1. Valida Lead
      if (leadRef.current && !leadRef.current.validate()) {
        isValid = false;
      } else if (!data.clienteId && !leadRef.current) {
        isValid = false;
        toast.error("Selecione ou cadastre um cliente");
      }

      // 2. Valida Documentos do Cliente
      if (clienteRef.current && !clienteRef.current.validate()) {
        isValid = false;
      }

      // 3. Valida Schema via hook (Datas e Contrato Assinado)
      const formIsValid = validateAll({
        ...data,
        dataContratacao: dataContratacao?.toISOString() || '',
        aniversarioGestor: aniversarioGestor?.toISOString() || ''
      });

      if (!formIsValid) {
        isValid = false;
      }

      if (!isValid) {
        toast.error('Verifique os campos obrigatórios');
        logger.warn('❌ Validação falhou:', errors);
      }

      return isValid;
    };

    /**
     * Salva todos os dados
     */
    const saveData = async (): Promise<{ osId: string; data: CadastrarClienteObraData } | null> => {
      if (!validate()) {
        return null;
      }

      try {
        setIsSaving(true);
        logger.log('💾 Iniciando salvamento de dados da obra...');

        // 1. Salvar Lead (cria ou atualiza)
        const savedLeadId = await leadRef.current?.save();
        if (!savedLeadId) {
          throw new Error("Falha ao salvar dados do lead");
        }

        // Garantir que temos o ID correto no data
        const currentClienteId = savedLeadId;
        if (!currentClienteId) {
          throw new Error("ID do cliente não retornado após salvamento");
        }

        // 2. Salvar Documentos do Cliente
        // Nota: ClienteCompletar salva internamente (documentos e aniversário)
        const docsSaved = await clienteRef.current?.save();
        if (!docsSaved) {
          throw new Error("Falha ao salvar documentos do cliente");
        }

        // 3. Obter usuário logado
        const { data: { user } } = await supabase.auth.getUser();

        // 4. Criar ou recuperar OS
        let currentOsId: string | undefined = initialOsId;
        let osCreatedNow = false;

        if (!currentOsId) {
          logger.log('🆕 Criando nova OS (sem CC inicial)...');

          // Buscar lead para nome
          const leadNome = data.clienteNome || 'Cliente';

          const result = await createOS({
            tipoOSCodigo: 'OS-13',
            clienteId: currentClienteId,
            ccId: undefined, // Será atualizado depois
            responsavelId: user?.id || '',
            descricao: `Start de Contrato - ${leadNome}`,
            metadata: {
              data_contratacao: dataContratacao?.toISOString(),
              aniversario_gestor: aniversarioGestor?.toISOString()
            },
            etapas: steps.map(s => ({
              nome_etapa: s.title,
              ordem: s.id,
              dados_etapa: s.id === 1 ? { ...data, clienteId: currentClienteId } : {}
            })),
            parentOSId: parentOSId || undefined
          });

          // Ignore specific type for os since we just need the id
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          currentOsId = String((result as any).os?.id || '');
          if (!currentOsId) throw new Error("Falha ao recuperar ID da OS criada");
          
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
            data_contratacao: dataContratacao?.toISOString(),
            aniversario_gestor: aniversarioGestor?.toISOString()
          };

          await supabase
            .from('ordens_servico')
            .update({ metadata: updatedMetadata })
            .eq('id', currentOsId);
        }

        // 5. Gerar Centro de Custo com ID = OS ID
        logger.log('🏗️ Gerando Centro de Custo com ID igual à OS...');
        
        if (!currentOsId) {
          throw new Error("ID da OS não está definido para criação do Centro de Custo");
        }

        // Recuperar tipoOSId
        let tipoOSId = '';
        if (osCreatedNow) {
          const { data: tipoOS } = await supabase
            .from('tipos_os')
            .select('id')
            .eq('codigo', 'OS-13')
            .single();
          if (tipoOS?.id) tipoOSId = tipoOS.id;
        } else {
          const { data: os } = await supabase
            .from('ordens_servico')
            .select('tipo_os_id')
            .eq('id', currentOsId)
            .single();
          if (os?.tipo_os_id) tipoOSId = os.tipo_os_id;
        }

        if (!tipoOSId) throw new Error('Tipo de OS não encontrado');

        // Criar CC
        // Nota: Nome do cliente pode ter mudado, ideal buscar do leadRef se possível, ou usar o que temos
        const leadNome = data.clienteNome || 'Cliente';

        const cc = await createCentroCustoWithId(
          currentOsId, // ID DO CC = ID DA OS
          tipoOSId,
          currentClienteId,
          `Centro de Custo - ${leadNome}`
        );
        logger.log('✅ Centro de Custo criado:', cc.nome);

        // 6. Vincular CC à OS
        await supabase
          .from('ordens_servico')
          .update({ cc_id: cc.id })
          .eq('id', currentOsId);

        // 7. Upload de contrato assinado (documento da OS)
        if (data.contratoAssinado.length > 0) {
          logger.log('📤 Registrando contrato assinado...');
          const uploadedBy = user?.id || null;

          for (const file of data.contratoAssinado) {
            // Verifica se já tem ID (já salvo)
            if (file.id && !file.path) continue; // Assumindo que FileWithComment tem ID se do banco

            // Se file.path existe, é porque o componente FileUploadUnificado já fez upload
            if (file.path) {
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
          }
        }

        // 8. Atualizar status do Cliente para 'ativo' se fechou contrato
        await supabase
          .from('clientes')
          .update({ status: 'ativo' })
          .eq('id', currentClienteId);

        // 9. Atualizar data local com Centro de Custo
        const finalData = {
          ...data,
          clienteId: currentClienteId,
          centroCusto: cc
        };

        onDataChange(finalData);

        logger.log('✅ Salvamento concluído com sucesso!');
        toast.success('Dados salvos com sucesso!');

        return { osId: currentOsId, data: finalData };
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
        {/* SEÇÃO A: Lead (Seleção/Cadastro, Identificação, Edificação, Endereço) */}
        <LeadCadastro
          ref={leadRef}
          selectedLeadId={data.clienteId}
          onLeadChange={(id, leadData) => {
            onDataChange({
              ...data,
              clienteId: id,
              clienteNome: leadData?.identificacao.nome
            });
            if (leadData) {
              setTipoCliente(leadData.identificacao.tipo);
              setTipoEmpresa(leadData.identificacao.tipoEmpresa);
            }
          }}
          readOnly={readOnly}
          showEdificacao={true}
          showEndereco={true}
          statusFilter={['lead', 'ativo']} // Permitir leads e clientes ativos
        />

        {/* SEÇÃO B: Cliente (Documentos Obrigatórios, Aniversário) */}
        {data.clienteId && (
          <ClienteCompletar
            ref={clienteRef}
            clienteId={data.clienteId}
            tipoCliente={tipoCliente}
            tipoEmpresa={tipoEmpresa}
            readOnly={readOnly}
            onAniversarioChange={(date) => {
              setAniversarioGestor(date);
              onDataChange({ ...data, aniversarioGestor: date?.toISOString() || '' });
            }}
            // Documentos são salvos internamente, mas podemos logar update se quiser
            onDocumentosChange={(docs) => {
              logger.log('Documentos atualizados:', docs.length);
              // Não precisamos atualizar 'data' com docs pois já estão salvos/gerenciados pelo componente
            }}
          />
        )}

        {/* SEÇÃO C: Dados da OS (Data Contrato, Contrato Assinado) */}
        {data.clienteId && (
          <Card>
            <CardHeader>
              <CardTitle>Dados do Contrato (OS)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data de Contratação */}
              <FormDatePicker
                id="dataContratacao"
                label="Data de Contratação"
                required
                disabled={readOnly}
                value={dataContratacao ? dataContratacao.toISOString() : undefined}
                onChange={(dateStr) => {
                  const date = dateStr ? new Date(dateStr) : undefined;
                  setDataContratacao(date);
                  const updatedData = { ...data, dataContratacao: dateStr };
                  onDataChange(updatedData);
                  markFieldTouched('dataContratacao');
                  validateField('dataContratacao', dateStr);
                }}
                error={touched.dataContratacao ? errors.dataContratacao : undefined}
                success={touched.dataContratacao && !errors.dataContratacao}
                className="w-full md:w-[300px]"
              />

              {/* Contrato Assinado (Upload) */}
              <div className="space-y-2">
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
                <p className="text-xs text-muted-foreground">Original assinado do contrato de prestação de serviços</p>
              </div>

              {/* Centro de Custo (Feedback visual) */}
              {data.centroCusto && (
                <div className="space-y-2 pt-4 border-t">
                  <Label>Centro de Custo Gerado</Label>
                  <div className="p-3 bg-success/5 border border-success/20 rounded-md">
                    <div className="font-semibold text-success">{data.centroCusto.nome}</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Indicador de Salvamento */}
        {isSaving && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertDescription>
              Salvando dados, documentos e gerando Centro de Custo...
            </AlertDescription>
          </Alert>
        )}
      </div>
    );
  }
);
