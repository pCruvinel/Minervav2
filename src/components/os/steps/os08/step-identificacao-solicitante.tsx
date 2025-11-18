import React, { useState } from 'react';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Upload, X, FileText, AlertCircle } from 'lucide-react';
import { toast } from '../../../../lib/utils/safe-toast';

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
    fotosAnexadas: string[];
  };
  onDataChange: (data: any) => void;
}

export function StepIdentificacaoSolicitante({ data, onDataChange }: StepIdentificacaoSolicitanteProps) {
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      // Simular upload (substituir com lógica real de upload)
      const newFiles = Array.from(files).map((file) => URL.createObjectURL(file));
      handleInputChange('fotosAnexadas', [...data.fotosAnexadas, ...newFiles]);
      toast.success(`${files.length} arquivo(s) anexado(s) com sucesso!`);
    } catch (error) {
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = data.fotosAnexadas.filter((_, i) => i !== index);
    handleInputChange('fotosAnexadas', newFiles);
    toast.info('Arquivo removido');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Identificação do Solicitante</h2>
        <p className="text-sm text-neutral-600">
          Preencha as informações do solicitante da visita técnica
        </p>
      </div>

      {/* Dados Básicos */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Dados Básicos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="nomeCompleto">
              Nome Completo <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nomeCompleto"
              value={data.nomeCompleto}
              onChange={(e) => handleInputChange('nomeCompleto', e.target.value)}
              placeholder="Digite o nome completo"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contatoWhatsApp">
              Contato WhatsApp <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contatoWhatsApp"
              type="tel"
              value={data.contatoWhatsApp}
              onChange={(e) => handleInputChange('contatoWhatsApp', e.target.value)}
              placeholder="(00) 00000-0000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="condominio">
              Condomínio <span className="text-red-500">*</span>
            </Label>
            <Input
              id="condominio"
              value={data.condominio}
              onChange={(e) => handleInputChange('condominio', e.target.value)}
              placeholder="Nome do condomínio"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">
              Cargo (caso seja colaborador do condomínio) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cargo"
              value={data.cargo}
              onChange={(e) => handleInputChange('cargo', e.target.value)}
              placeholder="Ex: Síndico, Zelador, etc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bloco">
              Bloco (caso seja morador) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bloco"
              value={data.bloco}
              onChange={(e) => handleInputChange('bloco', e.target.value)}
              placeholder="Ex: Bloco A"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unidadeAutonoma">
              Unidade Autônoma (caso seja morador) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="unidadeAutonoma"
              value={data.unidadeAutonoma}
              onChange={(e) => handleInputChange('unidadeAutonoma', e.target.value)}
              placeholder="Ex: Apto 101"
            />
          </div>
        </div>
      </div>

      {/* Tipo de Área */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Tipo de Área
        </h3>

        <RadioGroup
          value={data.tipoArea}
          onValueChange={(value) => handleInputChange('tipoArea', value)}
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
      </div>

      {/* Questionário 01 */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Questionário 01
        </h3>

        <div className="space-y-2">
          <Label htmlFor="unidadesVistoriar">
            Unidades a serem vistoriadas <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="unidadesVistoriar"
            value={data.unidadesVistoriar}
            onChange={(e) => handleInputChange('unidadesVistoriar', e.target.value)}
            placeholder="No caso de infiltração, é obrigatório o agendamento com a outra unidade que se desconfia ser a causadora"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contatoUnidades">
            Contato das unidades envolvidas <span className="text-red-500">*</span>
          </Label>
          <Input
            id="contatoUnidades"
            type="tel"
            value={data.contatoUnidades}
            onChange={(e) => handleInputChange('contatoUnidades', e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>
      </div>

      {/* Discriminação */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Discriminação
        </h3>

        <div className="space-y-2">
          <Label htmlFor="tipoDocumento">
            Esta visita técnica é para gerar um parecer técnico ou escopo de intervenção? <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tipoDocumento"
            value={data.tipoDocumento}
            onChange={(e) => handleInputChange('tipoDocumento', e.target.value)}
            placeholder="Ex: Parecer técnico"
          />
        </div>

        <div className="space-y-3">
          <Label>
            Área a ser vistoriada <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={data.areaVistoriada}
            onValueChange={(value) => handleInputChange('areaVistoriada', value)}
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
            Detalhe a sua solicitação. O que deve ser vistoriado? <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="detalhesSolicitacao"
            value={data.detalhesSolicitacao}
            onChange={(e) => handleInputChange('detalhesSolicitacao', e.target.value)}
            placeholder="Descreva detalhadamente o que precisa ser vistoriado"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="tempoSituacao">
            Há quanto tempo esta situação ocorre? <span className="text-red-500">*</span>
          </Label>
          <Input
            id="tempoSituacao"
            value={data.tempoSituacao}
            onChange={(e) => handleInputChange('tempoSituacao', e.target.value)}
            placeholder="Ex: 3 meses, 1 ano, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="primeiraVisita">
            É a primeira visita técnica solicitada? <span className="text-red-500">*</span>
          </Label>
          <Input
            id="primeiraVisita"
            value={data.primeiraVisita}
            onChange={(e) => handleInputChange('primeiraVisita', e.target.value)}
            placeholder="Sim ou Não"
          />
        </div>
      </div>

      {/* Upload de Fotos */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Anexar Fotos
        </h3>

        <div className="space-y-2">
          <Label>
            Anexe fotos da situação <span className="text-red-500">*</span>
          </Label>
          
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-neutral-400 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploadingFiles}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-10 h-10 mx-auto mb-3 text-neutral-400" />
              <p className="text-sm text-neutral-600 mb-1">
                Clique para selecionar ou arraste arquivos
              </p>
              <p className="text-xs text-neutral-500">
                PNG, JPG, JPEG até 10MB
              </p>
            </label>
          </div>

          {data.fotosAnexadas.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm text-neutral-600">
                {data.fotosAnexadas.length} arquivo(s) anexado(s)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.fotosAnexadas.map((file, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-square rounded-lg overflow-hidden bg-neutral-100 border border-neutral-200">
                      <img
                        src={file}
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveFile(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Alert Informativo */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Todos os campos marcados com <span className="text-red-500">*</span> são obrigatórios.
          Certifique-se de preencher todas as informações antes de avançar.
        </AlertDescription>
      </Alert>
    </div>
  );
}
