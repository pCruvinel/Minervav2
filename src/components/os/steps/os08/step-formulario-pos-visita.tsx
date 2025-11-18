import React, { useState } from 'react';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { RadioGroup, RadioGroupItem } from '../../../ui/radio-group';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Upload, X, AlertCircle } from 'lucide-react';
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

interface StepFormularioPosVisitaProps {
  data: {
    pontuacaoEngenheiro: string;
    pontuacaoMorador: string;
    tipoDocumento: string;
    areaVistoriada: string;
    manifestacaoPatologica: string;
    recomendacoesPrevias: string;
    gravidade: string;
    origemNBR: string;
    observacoesGerais: string;
    fotosLocal: string[];
    resultadoVisita: string;
    justificativa: string;
  };
  onDataChange: (data: any) => void;
}

export function StepFormularioPosVisita({ data, onDataChange }: StepFormularioPosVisitaProps) {
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleInputChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    try {
      const newFiles = Array.from(files).map((file) => URL.createObjectURL(file));
      handleInputChange('fotosLocal', [...data.fotosLocal, ...newFiles]);
      toast.success(`${files.length} arquivo(s) anexado(s) com sucesso!`);
    } catch (error) {
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = data.fotosLocal.filter((_, i) => i !== index);
    handleInputChange('fotosLocal', newFiles);
    toast.info('Arquivo removido');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Formulário Pós-Visita</h2>
        <p className="text-sm text-neutral-600">
          Preencha as informações coletadas durante a visita técnica
        </p>
      </div>

      {/* Questionário Inicial */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Questionário
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="pontuacaoEngenheiro">
              Você foi pontual no horário da visita? <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.pontuacaoEngenheiro}
              onValueChange={(value) => handleInputChange('pontuacaoEngenheiro', value)}
            >
              <SelectTrigger id="pontuacaoEngenheiro">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pontuacaoMorador">
              O morador foi pontual no horário da visita? <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.pontuacaoMorador}
              onValueChange={(value) => handleInputChange('pontuacaoMorador', value)}
            >
              <SelectTrigger id="pontuacaoMorador">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tipoDocumento">
              Esta visita técnica é para gerar um parecer técnico ou um escopo de intervenção? <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.tipoDocumento}
              onValueChange={(value) => handleInputChange('tipoDocumento', value)}
            >
              <SelectTrigger id="tipoDocumento">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parecer">Parecer Técnico</SelectItem>
                <SelectItem value="escopo">Escopo de Intervenção</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Área Vistoriada */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Área Vistoriada
        </h3>

        <div className="space-y-3">
          <Label>
            Selecione a área vistoriada <span className="text-red-500">*</span>
          </Label>
          <RadioGroup
            value={data.areaVistoriada}
            onValueChange={(value) => handleInputChange('areaVistoriada', value)}
          >
            {AREAS_VISTORIA.map((area, index) => (
              <div key={index} className="flex items-start space-x-2">
                <RadioGroupItem value={area} id={`area-pos-${index}`} className="mt-1" />
                <Label htmlFor={`area-pos-${index}`} className="cursor-pointer leading-relaxed">
                  {area}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      </div>

      {/* Informações Técnicas */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Informações Técnicas
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="manifestacaoPatologica">
              Manifestação patológica encontrada <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="manifestacaoPatologica"
              value={data.manifestacaoPatologica}
              onChange={(e) => handleInputChange('manifestacaoPatologica', e.target.value)}
              placeholder="Descreva as manifestações patológicas identificadas"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="recomendacoesPrevias">
              Recomendações prévias <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="recomendacoesPrevias"
              value={data.recomendacoesPrevias}
              onChange={(e) => handleInputChange('recomendacoesPrevias', e.target.value)}
              placeholder="Liste as recomendações iniciais"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gravidade">
                Gravidade <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.gravidade}
                onValueChange={(value) => handleInputChange('gravidade', value)}
              >
                <SelectTrigger id="gravidade">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baixa">Baixa</SelectItem>
                  <SelectItem value="media">Média</SelectItem>
                  <SelectItem value="alta">Alta</SelectItem>
                  <SelectItem value="critica">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="origemNBR">
                Origem NBR <span className="text-red-500">*</span>
              </Label>
              <Input
                id="origemNBR"
                value={data.origemNBR}
                onChange={(e) => handleInputChange('origemNBR', e.target.value)}
                placeholder="Ex: NBR 15575"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="observacoesGerais">
              Observações gerais da visita <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="observacoesGerais"
              value={data.observacoesGerais}
              onChange={(e) => handleInputChange('observacoesGerais', e.target.value)}
              placeholder="Adicione observações relevantes sobre a visita"
              rows={4}
            />
          </div>
        </div>
      </div>

      {/* Upload de Fotos */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Fotos do Local Vistoriado
        </h3>

        <div className="space-y-2">
          <Label>
            Anexe fotos do local <span className="text-red-500">*</span>
          </Label>
          
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-neutral-400 transition-colors">
            <input
              type="file"
              id="file-upload-pos"
              className="hidden"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploadingFiles}
            />
            <label htmlFor="file-upload-pos" className="cursor-pointer">
              <Upload className="w-10 h-10 mx-auto mb-3 text-neutral-400" />
              <p className="text-sm text-neutral-600 mb-1">
                Clique para selecionar ou arraste arquivos
              </p>
              <p className="text-xs text-neutral-500">
                PNG, JPG, JPEG até 10MB
              </p>
            </label>
          </div>

          {data.fotosLocal.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm text-neutral-600">
                {data.fotosLocal.length} arquivo(s) anexado(s)
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {data.fotosLocal.map((file, index) => (
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

      {/* Resultado da Visita */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Resultado da Visita
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resultadoVisita">
              Qual o resultado da visita técnica? <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="resultadoVisita"
              value={data.resultadoVisita}
              onChange={(e) => handleInputChange('resultadoVisita', e.target.value)}
              placeholder="Descreva o resultado geral da visita"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="justificativa">
              Justifique <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="justificativa"
              value={data.justificativa}
              onChange={(e) => handleInputChange('justificativa', e.target.value)}
              placeholder="Justifique o resultado apresentado"
              rows={3}
            />
          </div>
        </div>
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Todos os campos marcados com <span className="text-red-500">*</span> são obrigatórios.
          Revise todas as informações antes de avançar para a geração do documento.
        </AlertDescription>
      </Alert>
    </div>
  );
}
