import React, { useState } from 'react';
import { Label } from '../../../ui/label';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from '../../../../lib/utils/safe-toast';

interface StepUploadOrcamentosProps {
  data: {
    orcamentosAnexados: string[];
  };
  onDataChange: (data: any) => void;
}

export function StepUploadOrcamentos({ data, onDataChange }: StepUploadOrcamentosProps) {
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Validar que não ultrapasse 3 arquivos
    const totalFiles = data.orcamentosAnexados.length + files.length;
    if (totalFiles > 3) {
      toast.error('Você só pode anexar até 3 orçamentos');
      return;
    }

    setUploadingFiles(true);
    try {
      // Simular upload (substituir com lógica real de upload)
      const newFiles = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
      }));
      
      const updatedFiles = [...data.orcamentosAnexados, ...newFiles.map(f => f.url)];
      onDataChange({ ...data, orcamentosAnexados: updatedFiles });
      
      toast.success(`${files.length} orçamento(s) anexado(s) com sucesso!`);
    } catch (error) {
      toast.error('Erro ao fazer upload dos arquivos');
    } finally {
      setUploadingFiles(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = data.orcamentosAnexados.filter((_, i) => i !== index);
    onDataChange({ ...data, orcamentosAnexados: newFiles });
    toast.info('Orçamento removido');
  };

  const remainingUploads = 3 - data.orcamentosAnexados.length;
  const isComplete = data.orcamentosAnexados.length === 3;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Upload de Orçamentos</h2>
        <p className="text-sm text-neutral-600">
          Anexe 3 orçamentos de fornecedores diferentes para comparação
        </p>
      </div>

      {/* Status dos Uploads */}
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
              {isComplete ? 'Todos os orçamentos foram anexados!' : 'Progresso do Upload'}
            </h3>
            <p className="text-sm text-neutral-600 mb-4">
              {isComplete 
                ? 'Você anexou os 3 orçamentos necessários. Revise os arquivos antes de avançar.'
                : `Você anexou ${data.orcamentosAnexados.length} de 3 orçamentos obrigatórios.`
              }
            </p>
            
            {/* Barra de Progresso */}
            <div className="w-full bg-neutral-200 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(data.orcamentosAnexados.length / 3) * 100}%`,
                  backgroundColor: isComplete ? '#10b981' : '#D3AF37',
                }}
              />
            </div>
            <p className="text-xs text-neutral-600 mt-2">
              {data.orcamentosAnexados.length} / 3 orçamentos
            </p>
          </div>
        </div>
      </div>

      {/* Área de Upload */}
      {!isComplete && (
        <div className="space-y-2">
          <Label>
            Anexar Orçamentos <span className="text-red-500">*</span>
          </Label>
          
          <div className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors">
            <input
              type="file"
              id="file-upload-orcamentos"
              className="hidden"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
              onChange={handleFileUpload}
              disabled={uploadingFiles || isComplete}
            />
            <label htmlFor="file-upload-orcamentos" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-neutral-400" />
              <p className="text-sm text-neutral-600 mb-2">
                Clique para selecionar ou arraste arquivos
              </p>
              <p className="text-xs text-neutral-500 mb-3">
                PDF, DOC, DOCX, XLS, XLSX, PNG, JPG até 10MB
              </p>
              <p className="text-sm" style={{ color: '#D3AF37' }}>
                {remainingUploads === 3 
                  ? 'Anexe os 3 orçamentos'
                  : `Faltam ${remainingUploads} orçamento${remainingUploads > 1 ? 's' : ''}`
                }
              </p>
            </label>
          </div>
        </div>
      )}

      {/* Lista de Arquivos Anexados */}
      {data.orcamentosAnexados.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
            Orçamentos Anexados ({data.orcamentosAnexados.length})
          </h3>
          
          <div className="space-y-2">
            {data.orcamentosAnexados.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-white border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: '#DDC063' }}
                  >
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">
                      Orçamento {index + 1}
                    </p>
                    <p className="text-xs text-neutral-500">
                      Arquivo anexado
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(file, '_blank')}
                    className="text-neutral-600 hover:text-neutral-900"
                  >
                    Visualizar
                  </Button>
                  
                  <button
                    onClick={() => handleRemoveFile(index)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alertas */}
      {isComplete ? (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Todos os 3 orçamentos foram anexados com sucesso! Você pode avançar para a próxima etapa
            ou revisar os arquivos anexados.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            É obrigatório anexar exatamente 3 orçamentos de fornecedores diferentes.
            Certifique-se de que os arquivos estão legíveis e contêm todas as informações necessárias.
          </AlertDescription>
        </Alert>
      )}

      {/* Informações Adicionais */}
      <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50">
        <h4 className="text-sm mb-3">📋 Informações Importantes</h4>
        <ul className="space-y-2 text-sm text-neutral-600">
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Os orçamentos devem ser de fornecedores diferentes</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Certifique-se de que os valores e especificações estão claros</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Os arquivos devem estar em formato PDF ou imagem (PNG, JPG)</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-neutral-400">•</span>
            <span>Valide os prazos de validade dos orçamentos</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
