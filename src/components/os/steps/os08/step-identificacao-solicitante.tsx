import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';
import { FileWithComment } from '@/components/ui/file-upload-unificado';
import { StepLayout, StepSection } from '../../step-layout';

const AREAS_VISTORIA = [
  'ABASTECIMENTO DE ÁGUA (tubulações, conexões, hidrômetro, reservatórios, bombas, registros e afins) – exceto SPCI',
  'SPCI (Qualquer item relacionado ao sistema de proteção e combate ao incêndio)',
  'TELEFONE, INTERFONE, ANTENA (cabos, quadros e afins)',
  'ESGOTAMENTO E DRENAGEM (tubulações, conexões, caixas coletoras, galerias, sarjetas, grelhas e afins)',
  'ARQUITETURA (Fachadas, muros, área verde e afins)',
  'ELÉTRICA (Quadros, disjuntores, tomadas, interruptores, centrais de medição e afins)',
  'SPDA (captores, malhas, sinalização, cabos e afins)',
  'ESTRUTURAL (Fundações, lajes, vigas, pilares e afins)',
  'COBERTURA (Telhado, laje, calhas, rufos, platibanda e afins)',
];

interface StepIdentificacaoSolicitanteProps {
  data: {
    nomeCompleto: string;
    contatoWhatsApp: string;
    condominio: string;
    cargo: string;
    bloco: string;
    unidadeAutonoma: string;
    tipoArea: string;
    unidadesVistoriar: string;
    contatoUnidades: string;
    tipoDocumento: string;
    areaVistoriada: string;
    detalhesSolicitacao: string;
    tempoSituacao: string;
    primeiraVisita: string;
    arquivos?: FileWithComment[];
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepIdentificacaoSolicitante({ data, onDataChange, readOnly, osId }: StepIdentificacaoSolicitanteProps) {
  const arquivos = data.arquivos || [];

  const handleInputChange = (field: string, value: any) => {
    if (readOnly) return;
    onDataChange({ ...data, [field]: value });
  };

  return (
    <StepLayout
      title="Identificação do Solicitante"
      description="Preencha as informações do solicitante da visita técnica"
    >
      <div className="space-y-6">
        {/* Dados Básicos */}
        <StepSection title="Dados Básicos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nomeCompleto">
                Nome Completo <span className="text-destructive">*</span>
              </Label>
              <Input
                id="nomeCompleto"
                value={data.nomeCompleto}
                onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
                placeholder="Digite o nome completo"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contatoWhatsApp">
                Contato WhatsApp <span className="text-destructive">*</span>
              </Label>
              <Input
                id="contatoWhatsApp"
                type="tel"
                value={data.contatoWhatsApp}
                onChange={(e) => handleInputChange('contatoWhatsApp', e.target.value)}
                placeholder="(00) 00000-0000"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="condominio">
                Condomínio <span className="text-destructive">*</span>
              </Label>
              <Input
                id="condominio"
                value={data.condominio}
                onChange={(e) => handleInputChange('condominio', e.target.value)}
                placeholder="Nome do condomínio"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cargo">
                Cargo (caso seja colaborador do condomínio) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="cargo"
                value={data.cargo}
                onChange={(e) => handleInputChange('cargo', e.target.value)}
                placeholder="Ex: Síndico, Zelador, etc."
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bloco">
                Bloco (caso seja morador) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="bloco"
                value={data.bloco}
                onChange={(e) => handleInputChange('bloco', e.target.value)}
                placeholder="Ex: Bloco A"
                disabled={readOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="unidadeAutonoma">
                Unidade Autônoma (caso seja morador) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="unidadeAutonoma"
                value={data.unidadeAutonoma}
                onChange={(e) => handleInputChange('unidadeAutonoma', e.target.value)}
                placeholder="Ex: Apto 101"
                disabled={readOnly}
              />
            </div>
          </div>
        </StepSection>

        {/* Tipo de Área */}
        <StepSection title="Tipo de Área">
          <RadioGroup
            value={data.tipoArea}
            onValueChange={(value: string) => handleInputChange('tipoArea', value)}
            disabled={readOnly}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="unidade_autonoma" id="tipo-unidade" />
              <Label htmlFor="tipo-unidade" className="cursor-pointer">
                Unidade autônoma
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="area_comum" id="tipo-area" />
              <Label htmlFor="tipo-area" className="cursor-pointer">
                Área comum do condomínio
              </Label>
            </div>
          </RadioGroup>
        </StepSection>

        {/* Questionário 01 */}
        <StepSection title="Questionário 01">
          <div className="space-y-2">
            <Label htmlFor="unidadesVistoriar">
              Unidades a serem vistoriadas <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="unidadesVistoriar"
              value={data.unidadesVistoriar}
              onChange={(e) => handleInputChange('unidadesVistoriar', e.target.value)}
              placeholder="No caso de infiltração, é obrigatório o agendamento com a outra unidade que se desconfia ser a causadora"
              rows={3}
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contatoUnidades">
              Contato das unidades envolvidas <span className="text-destructive">*</span>
            </Label>
            <Input
              id="contatoUnidades"
              type="tel"
              value={data.contatoUnidades}
              onChange={(e) => handleInputChange('contatoUnidades', e.target.value)}
              placeholder="(00) 00000-0000"
              disabled={readOnly}
            />
          </div>
        </StepSection>

        {/* Discriminação */}
        <StepSection title="Discriminação">
          <div className="space-y-2">
            <Label htmlFor="tipoDocumento">
              Esta visita técnica é para gerar um parecer técnico ou escopo de intervenção? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tipoDocumento"
              value={data.tipoDocumento}
              onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
              placeholder="Ex: Parecer técnico"
              disabled={readOnly}
            />
          </div>

          <div className="space-y-3">
            <Label>
              Área a ser vistoriada <span className="text-destructive">*</span>
            </Label>
            <RadioGroup
              value={data.areaVistoriada}
              onValueChange={(value: string) => handleInputChange('areaVistoriada', value)}
              disabled={readOnly}
            >
              {AREAS_VISTORIA.map((area, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <RadioGroupItem value={area} id={`area-${index}`} className="mt-1" />
                  <Label htmlFor={`area-${index}`} className="cursor-pointer leading-relaxed">
                    {area}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detalhesSolicitacao">
              Detalhe a sua solicitação. O que deve ser vistoriado? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="detalhesSolicitacao"
              value={data.detalhesSolicitacao}
              onChange={(e) => handleInputChange('detalhesSolicitacao', e.target.value)}
              placeholder="Descreva detalhadamente o que precisa ser vistoriado"
              rows={4}
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tempoSituacao">
              Há quanto tempo esta situação ocorre? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="tempoSituacao"
              value={data.tempoSituacao}
              onChange={(e) => handleInputChange('tempoSituacao', e.target.value)}
              placeholder="Ex: 3 meses, 1 ano, etc."
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="primeiraVisita">
              É a primeira visita técnica solicitada? <span className="text-destructive">*</span>
            </Label>
            <Input
              id="primeiraVisita"
              value={data.primeiraVisita}
              onChange={(e) => handleInputChange('primeiraVisita', e.target.value)}
              placeholder="Sim ou Não"
              disabled={readOnly}
            />
          </div>
        </StepSection>

        {/* Upload de Fotos */}
        <StepSection title="Anexar Fotos">
          <FileUploadUnificado
            label="Anexe fotos da situação"
            files={arquivos}
            onFilesChange={(files) => onDataChange({ ...data, arquivos: files })}
            disabled={readOnly}
            osId={osId}
            maxFiles={10}
            acceptedTypes={['image/jpeg', 'image/jpg', 'image/png']}
          />
        </StepSection>

        {/* Alert Informativo */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Todos os campos marcados com <span className="text-destructive">*</span> são obrigatórios.
            Certifique-se de preencher todas as informações antes de avançar.
          </AlertDescription>
        </Alert>
      </div>
    </StepLayout>
  );
}
