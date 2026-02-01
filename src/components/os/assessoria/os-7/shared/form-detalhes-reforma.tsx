/**
 * FormDetalhesReforma - Componente compartilhado para campos de reforma
 * 
 * Este componente é reutilizado tanto no formulário público (/solicitacao-reforma)
 * quanto no workflow interno.
 * 
 * Alterações aqui refletem em ambos os contextos.
 */

import React, { useEffect, useImperativeHandle, forwardRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUploadUnificado, FileWithComment } from '@/components/ui/file-upload-unificado';
import { AlertTriangle, Plus, Trash2, Calendar, HardHat, FileText, Trash } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Validação
import { useFieldValidation } from '@/lib/hooks/use-field-validation';
import { detalhesReformaSchema } from '@/lib/validations/os07-schema';

// Componentes Padronizados
import { FormInput } from '@/components/ui/form-input';
import { FormSelect } from '@/components/ui/form-select';
import { FormTextarea } from '@/components/ui/form-textarea';
import { FormCheckbox } from '@/components/ui/form-checkbox';
import { FormMaskedInput } from '@/components/ui/form-masked-input';

// ================== TIPOS ==================

// Executor de obra
export interface Executor {
  id: string;
  nome: string;
  cpf: string;
}

// Item de discriminação da reforma
export interface ItemDiscriminacao {
  id: string;
  sistema: string;
  item: string;
  geraRuido: boolean;
  previsaoInicio: string;
  previsaoFim: string;
}

// Dados completos do formulário
export interface DetalhesReformaData {
  intervencoesSelecionadas: string[];
  executores: Executor[];
  discriminacoes: ItemDiscriminacao[];
  planoDescarte: string;
  arquivosART: FileWithComment[];
  arquivosProjeto: FileWithComment[];
}

// Estado inicial vazio
export const EMPTY_REFORMA_DATA: DetalhesReformaData = {
  intervencoesSelecionadas: [],
  executores: [],
  discriminacoes: [],
  planoDescarte: '',
  arquivosART: [],
  arquivosProjeto: [],
};

// ================== CONSTANTES ==================

// Sistemas disponíveis para discriminação
export const SISTEMAS_REFORMA = [
  { id: 'eletrica', label: 'ELÉTRICA' },
  { id: 'civil', label: 'CIVIL (paredes e afins)' },
  { id: 'hidraulica', label: 'HIDRÁULICA' },
  { id: 'forro', label: 'FORRO' },
  { id: 'esquadrias', label: 'ESQUADRIAS (vidros, alumínio e afins)' },
];

// Intervenções críticas que exigem ART/RRT
export const INTERVENCOES_CRITICAS = [
  { id: 'ar_condicionado', label: 'Instalação de ar-condicionado' },
  { id: 'demolicao_alvenaria', label: 'Demolição ou construção de alvenaria' },
  { id: 'abertura_laje', label: 'Abertura de vãos em lajes' },
  { id: 'envidracamento_sacada', label: 'Fechamento ou envidraçamento de sacadas' },
  { id: 'banheira', label: 'Instalação de banheira' },
  { id: 'reforma_eletrica', label: 'Reformas com engenheiro eletricista' },
  { id: 'instalacao_gas', label: 'Reparo ou alteração nas instalações de gás' },
  { id: 'revestimento_impacto', label: 'Troca de revestimentos com ferramentas de alto impacto' },
  { id: 'pontos_agua', label: 'Mudança de lugar de pontos de água' },
  { id: 'outras_estruturais', label: 'Outras intervenções estruturais' },
];

// Intervenções simples
export const INTERVENCOES_SIMPLES = [
  { id: 'pintura', label: 'Pintura' },
  { id: 'forro_gesso', label: 'Substituição do forro de gesso' },
  { id: 'redes_protecao', label: 'Colocação de redes de proteção' },
  { id: 'pequenos_reparos', label: 'Pequenos reparos elétricos ou hidráulicos' },
  { id: 'marcenaria', label: 'Marcenaria e mobiliário' },
  { id: 'troca_loucas', label: 'Troca de louças, metais e esquadrias' },
  { id: 'luminarias', label: 'Substituição de luminárias e interruptores' },
];

// ================== UTILITÁRIOS ==================

export function temIntervencaoCritica(intervencoes: string[]): boolean {
  return intervencoes.some(id => INTERVENCOES_CRITICAS.some(i => i.id === id));
}

export function formatarCPF(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
}

export function formatarData(value: string): string {
  const digits = value.replace(/\D/g, '');
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4, 6)}`;
}

// Wrapper para seções
const SectionWrapper = ({ 
  title, 
  description, 
  icon: Icon,
  children 
}: { 
  title: string; 
  description?: string; 
  icon?: React.ElementType;
  children: React.ReactNode; 
}) => {
  return (
    <Card>
        <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              {Icon && <Icon className="w-5 h-5 text-primary" />}
              {title}
            </CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent>{children}</CardContent>
    </Card>
  );
};

// ================== COMPONENTE PRINCIPAL ==================

interface FormDetalhesReformaProps {
  data: DetalhesReformaData;
  onDataChange: (data: DetalhesReformaData) => void;
  readOnly?: boolean;
  variant?: 'public' | 'internal';
}

export interface FormDetalhesReformaRef {
  validate: () => boolean;
}

export const FormDetalhesReforma = forwardRef<FormDetalhesReformaRef, FormDetalhesReformaProps>(({ 
  data, 
  onDataChange, 
  readOnly, 
}, ref) => {
  const critico = temIntervencaoCritica(data.intervencoesSelecionadas);

  // Hook de validação
  const {
      errors,
      touched,
      validateField,
      markFieldTouched,
      markAllTouched,
      validateAll
  } = useFieldValidation(detalhesReformaSchema);

  // Expor função de validação para o pai (useImperativeHandle)
  useImperativeHandle(ref, () => ({
      validate: () => {
          markAllTouched();
          const valid = validateAll(data);
          
          if (!valid) {
               // Scroll para o primeiro erro
               const firstError = Object.keys(errors)[0];
               if (firstError) {
                   // Tentar encontrar elemento pelo ID (nome do campo)
                   const el = document.getElementById(firstError) || document.querySelector(`[name="${firstError}"]`);
                   el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
               } else {
                 // Fallback: topo
                 window.scrollTo({ top: 0, behavior: 'smooth' });
               }
          }
          return valid;
      }
  }));

  // ================== HANDLERS: INTERVENÇÕES ==================
  
  const toggleIntervencao = (id: string) => {
    if (readOnly) return;
    const novasIntervencoes = data.intervencoesSelecionadas.includes(id)
      ? data.intervencoesSelecionadas.filter(i => i !== id)
      : [...data.intervencoesSelecionadas, id];
    
    onChangeField('intervencoesSelecionadas', novasIntervencoes);
  };

  const onChangeField = (field: keyof DetalhesReformaData, value: any) => {
    onDataChange({ ...data, [field]: value });
    if (touched[field]) {
      validateField(field, value);
    }
  };

  // ================== HANDLERS: EXECUTORES ==================

  const adicionarExecutor = () => {
    if (readOnly) return;
    const novo = { id: Date.now().toString(), nome: '', cpf: '' };
    const novosExecutores = [...data.executores, novo];
    onChangeField('executores', novosExecutores);
  };

  const removerExecutor = (id: string) => {
    if (readOnly) return;
    const novosExecutores = data.executores.filter(e => e.id !== id);
    onChangeField('executores', novosExecutores);
  };

  const atualizarExecutor = (id: string, field: keyof Executor, value: string) => {
    if (readOnly) return;
    if (field === 'cpf') {
      value = formatarCPF(value);
    }
    const novosExecutores = data.executores.map(e => e.id === id ? { ...e, [field]: value } : e);
    onChangeField('executores', novosExecutores);
  };

  // ================== HANDLERS: DISCRIMINAÇÕES ==================

  const adicionarDiscriminacao = () => {
    if (readOnly) return;
    const novaDiscriminacao: ItemDiscriminacao = {
      id: Date.now().toString(),
      sistema: '',
      item: '',
      geraRuido: false,
      previsaoInicio: '',
      previsaoFim: '',
    };
    const novasDisc = [...data.discriminacoes, novaDiscriminacao];
    onChangeField('discriminacoes', novasDisc);
  };

  const removerDiscriminacao = (id: string) => {
    if (readOnly) return;
    const novasDisc = data.discriminacoes.filter(d => d.id !== id);
    onChangeField('discriminacoes', novasDisc);
  };

  const atualizarDiscriminacao = (id: string, field: keyof ItemDiscriminacao, value: string | boolean) => {
    if (readOnly) return;
    // Formatar datas
    if ((field === 'previsaoInicio' || field === 'previsaoFim') && typeof value === 'string') {
      value = formatarData(value);
    }
    const novasDisc = data.discriminacoes.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    );
    onChangeField('discriminacoes', novasDisc);
  };

  // ================== RENDER ==================

  return (
    <div className="space-y-6">
      {/* Card 1: Tipo de Intervenção */}
      <SectionWrapper 
        title="Tipo de Intervenção" 
        description="Selecione todos os tipos de intervenção que serão realizados"
        icon={HardHat}
      >
          {/* Intervenções Críticas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-warning" />
              <div className="text-warning font-medium text-sm">
                Intervenções que exigem ART/RRT
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2 bg-warning/5 border border-warning/20 rounded-lg p-4">
              {INTERVENCOES_CRITICAS.map((item) => (
                <FormCheckbox
                   key={item.id}
                   id={item.id}
                   label={item.label}
                   checked={data.intervencoesSelecionadas.includes(item.id)}
                   onCheckedChange={() => toggleIntervencao(item.id)}
                   disabled={readOnly}
                />
              ))}
            </div>
          </div>

          {/* Intervenções Simples */}
          <div className="space-y-3 mt-6">
            <div className="font-medium text-sm text-muted-foreground uppercase tracking-wide">Outras Intervenções</div>
            <div className="grid grid-cols-1 gap-2">
              {INTERVENCOES_SIMPLES.map((item) => (
                 <FormCheckbox
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    checked={data.intervencoesSelecionadas.includes(item.id)}
                    onCheckedChange={() => toggleIntervencao(item.id)}
                    disabled={readOnly}
                 />
              ))}
            </div>
          </div>
          
          {/* Erro de validação se nenhuma selecionada */}
          {touched.intervencoesSelecionadas && errors.intervencoesSelecionadas && (
              <p className="text-sm font-medium text-destructive mt-2">{errors.intervencoesSelecionadas}</p>
          )}

          {/* Alerta ART obrigatório */}
          {critico && (
            <Alert variant="default" className="border-warning bg-warning/10 mt-4">
              <AlertTriangle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning">
                <strong>ART/RRT obrigatório!</strong> A intervenção selecionada exige responsabilidade técnica.
              </AlertDescription>
            </Alert>
          )}
      </SectionWrapper>

      {/* Card 2: Discriminação das Alterações */}
      <SectionWrapper 
         title="Discriminação das Alterações" 
         description="Detalhe cada alteração que será realizada na unidade"
         icon={Calendar}
      >
          {data.discriminacoes.length === 0 ? (
            <div className="text-center py-8 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-3">Nenhuma alteração adicionada</p>
              <Button type="button" variant="outline" onClick={adicionarDiscriminacao} disabled={readOnly}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Alteração
              </Button>
            </div>
          ) : (
            <>
              {/* Tabela de Discriminações */}
              <div className="border rounded-lg overflow-hidden overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[180px]">Sistema *</TableHead>
                      <TableHead>Item (O que será feito) *</TableHead>
                      <TableHead className="w-[100px] text-center">Ruído?</TableHead>
                      <TableHead className="w-[120px]">Início *</TableHead>
                      <TableHead className="w-[120px]">Fim *</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {data.discriminacoes.map((item, idx) => (
                      <TableRow key={item.id}>
                        <TableCell className="p-2 align-top">
                          <FormSelect
                            id={`disc-sis-${idx}`}
                            value={item.sistema}
                            onValueChange={(v) => atualizarDiscriminacao(item.id, 'sistema', v)}
                            disabled={readOnly}
                            placeholder="Selecione"
                            options={SISTEMAS_REFORMA.map(s => ({ value: s.id, label: s.label }))}
                          />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <FormInput
                             id={`disc-item-${idx}`}
                             value={item.item}
                             onChange={(e) => atualizarDiscriminacao(item.id, 'item', e.target.value)}
                             placeholder="Descreva o que será feito"
                             disabled={readOnly}
                          />
                        </TableCell>
                        <TableCell className="p-2 text-center align-top pt-3">
                          <FormCheckbox
                             id={`disc-noise-${idx}`}
                             checked={item.geraRuido}
                             onCheckedChange={(v) => atualizarDiscriminacao(item.id, 'geraRuido', v as boolean)}
                             disabled={readOnly}
                             label=""
                          />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <FormMaskedInput
                            id={`disc-ini-${idx}`}
                            maskType="data"
                            value={item.previsaoInicio}
                            onChange={(e) => atualizarDiscriminacao(item.id, 'previsaoInicio', e.target.value)}
                            placeholder="dd/mm/aa"
                            className="text-center"
                            disabled={readOnly}
                          />
                        </TableCell>
                        <TableCell className="p-2 align-top">
                          <FormMaskedInput
                            id={`disc-fim-${idx}`}
                            maskType="data"
                            value={item.previsaoFim}
                            onChange={(e) => atualizarDiscriminacao(item.id, 'previsaoFim', e.target.value)}
                            placeholder="dd/mm/aa"
                            className="text-center"
                            disabled={readOnly}
                          />
                        </TableCell>
                        <TableCell className="p-2 align-top pt-3">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removerDiscriminacao(item.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            disabled={readOnly}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                onClick={adicionarDiscriminacao} 
                className="w-full mt-4"
                disabled={readOnly}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Outra Alteração
              </Button>
            </>
          )}
      </SectionWrapper>

      {/* Card 3: Plano de Descarte */}
      <SectionWrapper 
        title="Plano de Descarte de Resíduos" 
        description="Descreva como será feito o descarte dos resíduos gerados pela obra"
      >
          <FormTextarea
            id="planoDescarte"
            value={data.planoDescarte}
            onChange={(e) => onChangeField('planoDescarte', e.target.value)}
            onBlur={() => markFieldTouched('planoDescarte')}
            placeholder="Descreva o plano de descarte: local de armazenamento temporário, empresa responsável pela coleta, horários de retirada, tipo de resíduos, etc."
            rows={4}
            disabled={readOnly}
            error={touched.planoDescarte ? errors.planoDescarte : undefined}
          />
      </SectionWrapper>

      {/* Card 4: Executores */}
      <SectionWrapper 
        title="Identificação dos Executores" 
        description="Informações dos profissionais que executarão a obra"
      >
          {data.executores.length === 0 ? (
            <div className="text-center py-6 border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground mb-3">Nenhum executor adicionado</p>
              <Button type="button" variant="outline" onClick={adicionarExecutor} disabled={readOnly}>
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Executor
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {data.executores.map((exec, index) => (
                <div key={exec.id} className="border rounded-lg p-4 space-y-3 relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-sm bg-muted px-2 py-1 rounded">Executor {index + 1}</div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removerExecutor(exec.id)}
                      className="text-destructive h-8 w-8 p-0"
                      disabled={readOnly}
                    >
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormInput
                        id={`exec-nome-${index}`}
                        label="Nome Completo *"
                        value={exec.nome}
                        onChange={(e) => atualizarExecutor(exec.id, 'nome', e.target.value)}
                        placeholder="Nome completo"
                        disabled={readOnly}
                    />
                    <FormMaskedInput
                        id={`exec-cpf-${index}`}
                        label="CPF *"
                        maskType="cpf"
                        value={exec.cpf}
                        onChange={(e) => atualizarExecutor(exec.id, 'cpf', e.target.value)}
                        placeholder="000.000.000-00"
                        disabled={readOnly}
                    />
                  </div>
                </div>
              ))}
              <Button 
                type="button" 
                variant="outline" 
                onClick={adicionarExecutor} 
                className="w-full"
                disabled={readOnly}
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Outro Executor
              </Button>
            </div>
          )}
      </SectionWrapper>

      {/* Card 5: Documentação */}
      <SectionWrapper 
        title="Documentação" 
        description="Anexe os documentos necessários para análise"
        icon={FileText}
      >
          {/* Upload ART (condicional) */}
          {critico && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-1">
                 <AlertTriangle className="w-4 h-4 text-warning" />
                 <span className="text-sm font-medium">ART/RRT <span className="text-destructive">*</span></span>
              </div>
              <FileUploadUnificado
                id="arquivosART"
                label="Anexe a ART ou RRT do responsável técnico"
                files={data.arquivosART}
                onFilesChange={(files) => onChangeField('arquivosART', files)}
                disabled={readOnly}
                maxFiles={3}
                acceptedTypes={['application/pdf', 'image/jpeg', 'image/png']}
              />
              {touched.arquivosART && errors.arquivosART && (
                  <p className="text-sm font-medium text-destructive">{errors.arquivosART}</p>
              )}
            </div>
          )}

          {/* Upload Projeto */}
          <div className="space-y-2 mt-4">
            <div className="text-sm font-medium mb-1">Projeto/Croqui da Alteração</div>
            <FileUploadUnificado
              id="arquivosProjeto"
              label="Anexe o projeto ou croqui das alterações (opcional)"
              files={data.arquivosProjeto}
              onFilesChange={(files) => onChangeField('arquivosProjeto', files)}
              disabled={readOnly}
              maxFiles={5}
              acceptedTypes={['application/pdf', 'image/jpeg', 'image/png']}
            />
          </div>
      </SectionWrapper>
    </div>
  );
});

FormDetalhesReforma.displayName = 'FormDetalhesReforma';
