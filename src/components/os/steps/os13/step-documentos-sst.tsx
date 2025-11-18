import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { Alert, AlertDescription } from '../../../ui/alert';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepDocumentosSSTProps {
  data: { documentosAnexados: string[] };
  onDataChange: (data: any) => void;
}

export function StepDocumentosSST({ data, onDataChange }: StepDocumentosSSTProps) {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      const newFiles = Array.from(files).map((file) => URL.createObjectURL(file));
      const updated = [...data.documentosAnexados, ...newFiles];
      onDataChange({ documentosAnexados: updated });
      toast.success(`${files.length} documento(s) anexado(s)!`);
    } catch (error) {
      toast.error('Erro ao fazer upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (index: number) => {
    const updated = data.documentosAnexados.filter((_, i) => i !== index);
    onDataChange({ documentosAnexados: updated });
    toast.info('Documento removido');
  };

  const isComplete = data.documentosAnexados.length >= 2;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Gerar Documentos SST</h2>
        <p className="text-sm text-neutral-600">
          Anexe os documentos de Segurança e Saúde do Trabalho (PGR e PCMSO)
        </p>
      </div>

      {/* Status */}
      <div className="border border-neutral-200 rounded-lg p-6 bg-neutral-50">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: isComplete ? '#10b981' : '#DDC063' }}
          >
            {isComplete ? (
              <CheckCircle2 className="w-6 h-6 text-white" />
            ) : (
              <FileText className="w-6 h-6 text-white" />
            )}
          </div>
          
          <div className="flex-1">
            <h3 className="text-base mb-2">
              {isComplete ? 'Documentos SST anexados!' : 'Aguardando documentos SST'}
            </h3>
            <p className="text-sm text-neutral-600">
              {data.documentosAnexados.length} de 2 documentos anexados (PGR e PCMSO)
            </p>
          </div>
        </div>
      </div>

      {/* Upload */}
      {!isComplete && (
        <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors">
          <input
            type="file"
            id="file-upload-sst"
            className="hidden"
            multiple
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            disabled={uploading}
          />
          <label htmlFor="file-upload-sst" className="cursor-pointer">
            <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
            <p className="text-sm text-neutral-600 mb-2">
              Clique para selecionar ou arraste os arquivos
            </p>
            <p className="text-xs text-neutral-500 mb-3">
              PDF, DOC, DOCX até 10MB cada
            </p>
            <p className="text-sm" style={{ color: '#D3AF37' }}>
              Anexe PGR (Programa de Gerenciamento de Riscos) e PCMSO (Programa de Controle Médico)
            </p>
          </label>
        </div>
      )}

      {/* Lista de Arquivos */}
      {data.documentosAnexados.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
            Documentos Anexados ({data.documentosAnexados.length})
          </h3>
          
          <div className="space-y-2">
            {data.documentosAnexados.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: '#DDC063' }}
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm">
                      {index === 0 ? 'PGR - Programa de Gerenciamento de Riscos' : 
                       index === 1 ? 'PCMSO - Programa de Controle Médico' : 
                       `Documento SST ${index + 1}`}
                    </p>
                    <p className="text-xs text-neutral-500">Arquivo anexado</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(index)}
                  className="p-2 rounded-lg hover:bg-red-50 text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isComplete ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Documentos SST completos! PGR e PCMSO anexados com sucesso.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É obrigatório anexar o PGR (Programa de Gerenciamento de Riscos) e o PCMSO (Programa de Controle Médico de Saúde Ocupacional).
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
