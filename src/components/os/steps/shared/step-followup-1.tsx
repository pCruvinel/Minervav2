import React, { forwardRef, useImperativeHandle } from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Separator } from '../../../ui/separator';
import { AlertCircle, Upload } from 'lucide-react';
import { FormInput } from '../../../ui/form-input';
import { FormTextarea } from '../../../ui/form-textarea';
import { FormSelect } from '../../../ui/form-select';
import { FormMaskedInput, validarTelefone } from '../../../ui/form-masked-input';
import { useFieldValidation } from '../../../../lib/hooks/use-field-validation';
import { etapa3Schema } from '../../../../lib/validations/os-etapas-schema';

interface StepFollowup1Props {
  data: {
    idadeEdificacao: string;
    motivoProcura: string;
    quandoAconteceu: string;
    oqueFeitoARespeito: string;
    existeEscopo: string;
    previsaoOrcamentaria: string;
    grauUrgencia: string;
    apresentacaoProposta: string;
    nomeContatoLocal: string;
    telefoneContatoLocal: string;
    cargoContatoLocal: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export interface StepFollowup1Handle {
  validate: () => boolean;
}

export const StepFollowup1 = forwardRef<StepFollowup1Handle, StepFollowup1Props>(
  function StepFollowup1({ data, onDataChange, readOnly = false }, ref) {
  // Hook de validação
  const {
    errors,
    touched,
    validateField,
    markFieldTouched,
    markAllTouched,
    validateAll,
  } = useFieldValidation(etapa3Schema);

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

      // Se houver erros, scroll para o primeiro campo inválido
      if (!isValid) {
        // Encontra o primeiro campo com erro e faz scroll
        const firstErrorField = Object.keys(errors)[0];
        if (firstErrorField) {
          const element = document.getElementById(firstErrorField);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            element.focus();
          }
        }
      }

      return isValid;
    }
  }), [markAllTouched, validateAll, data, errors]);

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Realize a entrevista inicial com o lead/cliente para levantar informações sobre o projeto.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <FormSelect
          id="idadeEdificacao"
          label="1. Qual a idade da edificação?"
          required
          value={data.idadeEdificacao}
          onValueChange={(value) => {
            if (!readOnly) {
              onDataChange({ ...data, idadeEdificacao: value });
              if (touched.idadeEdificacao) validateField('idadeEdificacao', value);
              markFieldTouched('idadeEdificacao');
            }
          }}
          error={touched.idadeEdificacao ? errors.idadeEdificacao : undefined}
          success={touched.idadeEdificacao && !errors.idadeEdificacao && data.idadeEdificacao.length > 0}
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
          value={data.motivoProcura}
          onChange={(e) => {
            if (!readOnly) {
              onDataChange({ ...data, motivoProcura: e.target.value });
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
          success={touched.motivoProcura && !errors.motivoProcura && data.motivoProcura.length >= 10}
          helperText="Mínimo 10 caracteres - Descreva os problemas e motivações"
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
          value={data.quandoAconteceu}
          onChange={(e) => {
            if (!readOnly) {
              onDataChange({ ...data, quandoAconteceu: e.target.value });
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
          success={touched.quandoAconteceu && !errors.quandoAconteceu && data.quandoAconteceu.length >= 10}
          helperText="Mínimo 10 caracteres - Descreva o histórico do problema"
          placeholder="Descreva o histórico do problema..."
          disabled={readOnly}
        />

        <FormTextarea
          id="oqueFeitoARespeito"
          label="4. O que já foi feito a respeito disso?"
          rows={3}
          maxLength={300}
          showCharCount
          value={data.oqueFeitoARespeito}
          onChange={(e) => !readOnly && onDataChange({ ...data, oqueFeitoARespeito: e.target.value })}
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
          value={data.existeEscopo}
          onChange={(e) => !readOnly && onDataChange({ ...data, existeEscopo: e.target.value })}
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
          value={data.previsaoOrcamentaria}
          onChange={(e) => !readOnly && onDataChange({ ...data, previsaoOrcamentaria: e.target.value })}
          helperText="Informe o orçamento disponível (opcional)"
          placeholder="Informe o orçamento disponível..."
          disabled={readOnly}
        />

        <FormSelect
          id="grauUrgencia"
          label="7. Qual o grau de urgência para executar esse serviço?"
          required
          value={data.grauUrgencia}
          onValueChange={(value) => {
            if (!readOnly) {
              onDataChange({ ...data, grauUrgencia: value });
              if (touched.grauUrgencia) validateField('grauUrgencia', value);
              markFieldTouched('grauUrgencia');
            }
          }}
          error={touched.grauUrgencia ? errors.grauUrgencia : undefined}
          success={touched.grauUrgencia && !errors.grauUrgencia && data.grauUrgencia.length > 0}
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
          value={data.apresentacaoProposta}
          onChange={(e) => {
            if (!readOnly) {
              onDataChange({ ...data, apresentacaoProposta: e.target.value });
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
          success={touched.apresentacaoProposta && !errors.apresentacaoProposta && data.apresentacaoProposta.length >= 10}
          helperText="Mínimo 10 caracteres - Resposta do cliente sobre apresentação"
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
            value={data.nomeContatoLocal}
            onChange={(e) => {
              if (!readOnly) {
                onDataChange({ ...data, nomeContatoLocal: e.target.value });
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
            success={touched.nomeContatoLocal && !errors.nomeContatoLocal && data.nomeContatoLocal.length >= 3}
            helperText="Mínimo 3 caracteres"
            placeholder="Nome completo"
            disabled={readOnly}
          />

          <FormMaskedInput
            id="telefoneContatoLocal"
            label="10. Contato (Telefone)"
            required
            maskType="telefone"
            value={data.telefoneContatoLocal}
            onChange={(e) => {
              if (!readOnly) {
                onDataChange({ ...data, telefoneContatoLocal: e.target.value });
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
            success={touched.telefoneContatoLocal && !errors.telefoneContatoLocal && validarTelefone(data.telefoneContatoLocal)}
            helperText="Digite com DDD (10 ou 11 dígitos)"
            placeholder="(00) 00000-0000"
            disabled={readOnly}
          />

          <div className="col-span-2">
            <FormInput
              id="cargoContatoLocal"
              label="11. Cargo (Contato no Local)"
              value={data.cargoContatoLocal}
              onChange={(e) => !readOnly && onDataChange({ ...data, cargoContatoLocal: e.target.value })}
              helperText="Cargo ou função da pessoa no local (opcional)"
              placeholder="Ex: Síndico, Zelador, Gerente..."
              disabled={readOnly}
            />
          </div>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label>Anexar Arquivos (escopo, laudo, fotos)</Label>
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
            <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Clique para selecionar ou arraste arquivos aqui
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              PDF, DOC, JPG, PNG - Máx. 10MB por arquivo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  }
);

StepFollowup1.displayName = 'StepFollowup1';
