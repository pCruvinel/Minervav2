import React, { forwardRef, useImperativeHandle } from 'react';
import { FormInput } from '@/components/ui/form-input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { AlertCircle } from 'lucide-react';
import { FormTextarea } from '@/components/ui/form-textarea';
import { FormSelect } from '@/components/ui/form-select';
import { FormMaskedInput, validarTelefone } from '@/components/ui/form-masked-input';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { etapa3Schema } from '@/lib/validations/os-etapas-schema';

interface ArquivoComComentario {
  id: string;
  name: string;
  url: string;
  path: string;
  size: number;
  type: string;
  uploadedAt: string;
  comentario: string;
}

interface StepFollowup1Props {
  data: {
    anexos?: ArquivoComComentario[];
    idadeEdificacao?: string;
    motivoProcura?: string;
    quandoAconteceu?: string;
    oqueFeitoARespeito?: string;
    existeEscopo?: string;
    previsaoOrcamentaria?: string;
    grauUrgencia?: string;
    apresentacaoProposta?: string;
    nomeContatoLocal?: string;
    telefoneContatoLocal?: string;
    cargoContatoLocal?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
  colaboradorId?: string;
}

export interface StepFollowup1Handle {
  validate: () => boolean;
  isFormValid: () => boolean;
}

export const StepFollowup1 = forwardRef<StepFollowup1Handle, StepFollowup1Props>(
  function StepFollowup1({ data, onDataChange, readOnly = false, osId, colaboradorId }, ref) {
    // Ensure data has default values to prevent undefined issues
    const safeData = {
      anexos: data.anexos || [],
      idadeEdificacao: data.idadeEdificacao || '',
      motivoProcura: data.motivoProcura || '',
      quandoAconteceu: data.quandoAconteceu || '',
      oqueFeitoARespeito: data.oqueFeitoARespeito || '',
      existeEscopo: data.existeEscopo || '',
      previsaoOrcamentaria: data.previsaoOrcamentaria || '',
      grauUrgencia: data.grauUrgencia || '',
      apresentacaoProposta: data.apresentacaoProposta || '',
      nomeContatoLocal: data.nomeContatoLocal || '',
      telefoneContatoLocal: data.telefoneContatoLocal || '',
      cargoContatoLocal: data.cargoContatoLocal || '',
    };
    // Hook de validação
    const {
      errors,
      touched,
      validateField,
      markFieldTouched,
      markAllTouched,
      validateAll,
    } = useFieldValidation(etapa3Schema);

    // Função para realizar upload dos arquivos pendentes (mantida para compatibilidade)
    const uploadPendingFiles = async (): Promise<ArquivoComComentario[]> => {
      // O novo componente já faz upload automático, então retorna array vazio para evitar duplicação
      return [];
    };

    /**
     * Função de validação exposta via imperativeHandle
     * Marca todos os campos como tocados, valida e retorna se é válido
     */
    useImperativeHandle(ref, () => ({
      validate: () => {
        // Marca todos os campos como tocados para mostrar bordas/erros
        markAllTouched();

        // Valida todo o formulário e popula objeto de erros
        const isValid = validateAll(data);

        // Debug: Log detalhado - MOSTRAR VALORES ATUAIS ANTES DE VALIDAR
        console.log('[STEP-FOLLOWUP-1] 🔍 Dados para validação:', {
          idadeEdificacao: safeData.idadeEdificacao,
          motivoProcura: safeData.motivoProcura,
          quandoAconteceu: safeData.quandoAconteceu,
          grauUrgencia: safeData.grauUrgencia,
          apresentacaoProposta: safeData.apresentacaoProposta,
          nomeContatoLocal: safeData.nomeContatoLocal,
          telefoneContatoLocal: safeData.telefoneContatoLocal,
        });

        console.log('[STEP-FOLLOWUP-1] ✅ Resultado validação:', {
          isValid,
          errorsKeys: Object.keys(errors)
        });

        // Se houver erros, scroll para o primeiro campo inválido
        if (!isValid) {
          console.warn('[STEP-FOLLOWUP-1] ❌ Validação falhou! Erros:', errors);
          // Encontra o primeiro campo com erro e faz scroll
          const firstErrorField = Object.keys(errors)[0];
          if (firstErrorField) {
            console.log('[STEP-FOLLOWUP-1] 📍 Scrolling para campo:', firstErrorField);
            const element = document.getElementById(firstErrorField);
            if (element) {
              element.scrollIntoView({ behavior: 'smooth', block: 'center' });
              element.focus();
            }
          }
        } else {
          console.log('[STEP-FOLLOWUP-1] ✅ Validação passou!');
        }

        return isValid;
      },
      isFormValid: () => {
        // Valida silenciosamente sem marcar campos como tocados
        return validateAll(data);
      },
      uploadPendingFiles: async () => {
        return await uploadPendingFiles();
      }
    }), [markAllTouched, validateAll, data, errors, osId, colaboradorId]);

    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <FormSelect
            id="idadeEdificacao"
            label="1. Qual a idade da edificação?"
            required
            value={safeData.idadeEdificacao}
            onValueChange={(value) => {
              if (!readOnly) {
                // Merge with safeData to ensure we don't lose other fields
                const newData = { ...safeData, idadeEdificacao: value };
                console.log('📝 Updating idadeEdificacao:', value, newData);
                onDataChange(newData);
                if (touched.idadeEdificacao) validateField('idadeEdificacao', value);
                markFieldTouched('idadeEdificacao');
              }
            }}
            error={touched.idadeEdificacao ? errors.idadeEdificacao : undefined}
            success={touched.idadeEdificacao && !errors.idadeEdificacao && safeData.idadeEdificacao.length > 0}
            helperText="Selecione a idade aproximada da edificação"
            placeholder="Selecione"
            disabled={readOnly}
            options={[
              { value: "Ainda não foi entregue", label: "Ainda não foi entregue" },
              { value: "0 a 3 anos", label: "0 a 3 anos" },
              { value: "3 a 5 anos", label: "3 a 5 anos" },
              { value: "5 a 10 anos", label: "5 a 10 anos" },
              { value: "10 a 20 anos", label: "10 a 20 anos" },
              { value: "Acima de 20 anos", label: "Acima de 20 anos" },
            ]}
          />

          <FormTextarea
            id="motivoProcura"
            label="2. Qual o motivo fez você nos procurar? Quais problemas existentes?"
            required
            rows={4}
            maxLength={500}
            showCharCount
            value={safeData.motivoProcura}
            onChange={(e) => {
              if (!readOnly) {
                const newData = { ...safeData, motivoProcura: e.target.value };
                onDataChange(newData);
                if (touched.motivoProcura) validateField('motivoProcura', e.target.value);
              }
            }}
            onBlur={() => {
              if (!readOnly) {
                markFieldTouched('motivoProcura');
                validateField('motivoProcura', data.motivoProcura);
              }
            }}
            error={touched.motivoProcura ? errors.motivoProcura : undefined}
            success={touched.motivoProcura && !errors.motivoProcura && safeData.motivoProcura.length >= 5}
            helperText="Mínimo 5 caracteres - Descreva os problemas e motivações"
            placeholder="Descreva os problemas e motivações..."
            disabled={readOnly}
          />

          <FormTextarea
            id="quandoAconteceu"
            label="3. Quando aconteceu? Há quanto tempo vem acontecendo?"
            required
            rows={3}
            maxLength={300}
            showCharCount
            value={safeData.quandoAconteceu}
            onChange={(e) => {
              if (!readOnly) {
                const newData = { ...safeData, quandoAconteceu: e.target.value };
                onDataChange(newData);
                if (touched.quandoAconteceu) validateField('quandoAconteceu', e.target.value);
              }
            }}
            onBlur={() => {
              if (!readOnly) {
                markFieldTouched('quandoAconteceu');
                validateField('quandoAconteceu', data.quandoAconteceu);
              }
            }}
            error={touched.quandoAconteceu ? errors.quandoAconteceu : undefined}
            success={touched.quandoAconteceu && !errors.quandoAconteceu && safeData.quandoAconteceu.length >= 5}
            helperText="Mínimo 5 caracteres - Descreva o histórico do problema"
            placeholder="Descreva o histórico do problema..."
            disabled={readOnly}
          />

          <FormTextarea
            id="oqueFeitoARespeito"
            label="4. O que já foi feito a respeito disso?"
            rows={3}
            maxLength={300}
            showCharCount
            value={safeData.oqueFeitoARespeito}
            onChange={(e) => !readOnly && onDataChange({ ...safeData, oqueFeitoARespeito: e.target.value })}
            helperText="Descreva as ações já realizadas (opcional)"
            placeholder="Descreva as ações já realizadas..."
            disabled={readOnly}
          />

          <FormTextarea
            id="existeEscopo"
            label="5. Existe um escopo de serviços ou laudo com diagnóstico do problema?"
            rows={2}
            maxLength={200}
            showCharCount
            value={safeData.existeEscopo}
            onChange={(e) => !readOnly && onDataChange({ ...safeData, existeEscopo: e.target.value })}
            helperText="Informe se existe documentação prévia (opcional)"
            placeholder="Sim/Não e detalhes..."
            disabled={readOnly}
          />

          <FormTextarea
            id="previsaoOrcamentaria"
            label="6. Existe previsão orçamentária para este serviço? Ou você precisa de parâmetro para taxa extra?"
            rows={2}
            maxLength={200}
            showCharCount
            value={safeData.previsaoOrcamentaria}
            onChange={(e) => !readOnly && onDataChange({ ...safeData, previsaoOrcamentaria: e.target.value })}
            helperText="Informe o orçamento disponível (opcional)"
            placeholder="Informe o orçamento disponível..."
            disabled={readOnly}
          />

          <FormSelect
            id="grauUrgencia"
            label="7. Qual o grau de urgência para executar esse serviço?"
            required
            value={safeData.grauUrgencia}
            onValueChange={(value) => {
              if (!readOnly) {
                const newData = { ...safeData, grauUrgencia: value };
                onDataChange(newData);
                if (touched.grauUrgencia) validateField('grauUrgencia', value);
                markFieldTouched('grauUrgencia');
              }
            }}
            error={touched.grauUrgencia ? errors.grauUrgencia : undefined}
            success={touched.grauUrgencia && !errors.grauUrgencia && safeData.grauUrgencia.length > 0}
            helperText="Selecione o prazo de execução desejado"
            placeholder="Selecione"
            disabled={readOnly}
            options={[
              { value: "30 dias", label: "30 dias" },
              { value: "3 meses", label: "3 meses" },
              { value: "6 meses ou mais", label: "6 meses ou mais" },
            ]}
          />

          <FormTextarea
            id="apresentacaoProposta"
            label="8. Nossas propostas são apresentadas, nós não enviamos orçamento. Você concorda? Deseja que faça o orçamento? Se sim, qual dia e horário sugeridos para apresentação da proposta comercial dessa visita técnica?"
            required
            rows={3}
            maxLength={300}
            showCharCount
            value={safeData.apresentacaoProposta}
            onChange={(e) => {
              if (!readOnly) {
                const newData = { ...safeData, apresentacaoProposta: e.target.value };
                onDataChange(newData);
                if (touched.apresentacaoProposta) validateField('apresentacaoProposta', e.target.value);
              }
            }}
            onBlur={() => {
              if (!readOnly) {
                markFieldTouched('apresentacaoProposta');
                validateField('apresentacaoProposta', data.apresentacaoProposta);
              }
            }}
            error={touched.apresentacaoProposta ? errors.apresentacaoProposta : undefined}
            success={touched.apresentacaoProposta && !errors.apresentacaoProposta && safeData.apresentacaoProposta.length >= 5}
            helperText="Mínimo 5 caracteres - Resposta do cliente sobre apresentação"
            placeholder="Resposta do cliente..."
            disabled={readOnly}
          />

          <Separator />

          <h3 className="text-sm font-medium">Dados do Contato no Local</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              id="nomeContatoLocal"
              label="9. Nome (Contato no Local)"
              required
              value={safeData.nomeContatoLocal}
              onChange={(e) => {
                if (!readOnly) {
                  const newData = { ...safeData, nomeContatoLocal: e.target.value };
                  onDataChange(newData);
                  if (touched.nomeContatoLocal) validateField('nomeContatoLocal', e.target.value);
                }
              }}
              onBlur={() => {
                if (!readOnly) {
                  markFieldTouched('nomeContatoLocal');
                  validateField('nomeContatoLocal', data.nomeContatoLocal);
                }
              }}
              error={touched.nomeContatoLocal ? errors.nomeContatoLocal : undefined}
              success={touched.nomeContatoLocal && !errors.nomeContatoLocal && safeData.nomeContatoLocal.length >= 2}
              helperText="Mínimo 2 caracteres"
              placeholder="Nome completo"
              disabled={readOnly}
            />

            <FormMaskedInput
              id="telefoneContatoLocal"
              label="10. Contato (Celular)"
              required
              maskType="celular"
              value={safeData.telefoneContatoLocal}
              onChange={(e) => {
                if (!readOnly) {
                  const newData = { ...safeData, telefoneContatoLocal: e.target.value };
                  onDataChange(newData);
                  if (touched.telefoneContatoLocal) validateField('telefoneContatoLocal', e.target.value);
                }
              }}
              onBlur={() => {
                if (!readOnly) {
                  markFieldTouched('telefoneContatoLocal');
                  validateField('telefoneContatoLocal', data.telefoneContatoLocal);
                }
              }}
              error={touched.telefoneContatoLocal ? errors.telefoneContatoLocal : undefined}
              success={touched.telefoneContatoLocal && !errors.telefoneContatoLocal && validarTelefone(safeData.telefoneContatoLocal)}
              helperText="Mínimo 8 caracteres - Digite com DDD"
              placeholder="(00) 0 0000-0000"
              disabled={readOnly}
            />

            <div className="col-span-2">
              <FormInput
                id="cargoContatoLocal"
                label="11. Cargo (Contato no Local)"
                value={data.cargoContatoLocal}
                onChange={(e) => !readOnly && onDataChange({ ...safeData, cargoContatoLocal: e.target.value })}
                helperText="Cargo ou função da pessoa no local (opcional)"
                placeholder="Ex: Síndico, Zelador, Gerente..."
                disabled={readOnly}
              />
            </div>
          </div>

          <Separator />

          <FileUploadUnificado
            label="Anexar Arquivos (escopo, laudo, fotos)"
            files={data.anexos || []}
            onFilesChange={(files) => {
              console.log('📁 Updating files:', files);
              // Transformar para formato do schema: { id?, url, nome, tamanho? }
              const filesForSchema = files.map((file: any) => ({
                id: file.id,
                url: file.url,
                nome: file.name || file.nome,  // Handle both formats
                tamanho: file.size || file.tamanho,  // Handle both formats
                comentario: file.comentario || file.comment // Handle both formats for backward compatibility
              }));
              onDataChange({ ...safeData, anexos: filesForSchema });
            }}
            disabled={readOnly}
            osId={osId}
          />
        </div>
      </div>
    );
  }
);

StepFollowup1.displayName = 'StepFollowup1';
