import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { FileUploadUnificado } from '@/components/ui/file-upload-unificado';

interface StepPrepararOrcamentosProps {
  data: {
    outrasEmpresas?: string;
    comoEsperaResolver?: string;
    expectativaCliente?: string;
    estadoAncoragem?: string;
    fotosAncoragem?: any[];
    quemAcompanhou?: string;
    avaliacaoVisita?: string;
    estadoGeralEdificacao?: string;
    servicoResolver?: string;
    arquivosGerais?: any[];
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
  osId?: string;
}

export function StepPrepararOrcamentos({
  data,
  onDataChange,
  readOnly = false,
  osId,
}: StepPrepararOrcamentosProps) {
  const handleChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          Preencha o formulário técnico dividido em três momentos com as informações coletadas durante e após a visita.
        </AlertDescription>
      </Alert>

      {/* Momento 1: Perguntas Durante a Visita - Respostas do Cliente */}
      <div className="space-y-4">
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 1: Perguntas Durante a Visita - Respostas do Cliente</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="outrasEmpresas">
            1. Há outras empresas realizando visita técnica? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="outrasEmpresas"
            rows={3}
            value={data.outrasEmpresas || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('outrasEmpresas', e.target.value)}
            placeholder="Descreva se há outras empresas realizando visita técnica e quais..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="comoEsperaResolver">
            2. Como você espera resolver esse problema? (Solução, Material e metodologia) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="comoEsperaResolver"
            rows={4}
            value={data.comoEsperaResolver || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('comoEsperaResolver', e.target.value)}
            placeholder="Descreva as expectativas do cliente quanto à solução, materiais e metodologia..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="expectativaCliente">
            3. Qual a principal expectativa do cliente? (Solução, Material e metodologia) <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="expectativaCliente"
            rows={4}
            value={data.expectativaCliente || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('expectativaCliente', e.target.value)}
            placeholder="Descreva as principais expectativas em relação à solução, materiais e metodologia..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="estadoAncoragem">
            4. Qual o estado do sistema de ancoragem? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="estadoAncoragem"
            rows={3}
            value={data.estadoAncoragem || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('estadoAncoragem', e.target.value)}
            placeholder="Descreva o estado atual do sistema de ancoragem..."
            disabled={readOnly}
          />
        </div>

        <FileUploadUnificado
          label="5. Anexar fotos do sistema de ancoragem"
          files={data.fotosAncoragem || []}
          onFilesChange={(files) => handleChange('fotosAncoragem', files)}
          disabled={readOnly}
          osId={osId}
        />
      </div>

      <Separator />

      {/* Momento 2: Avaliação Geral da Visita */}
      <div className="space-y-4">
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 2: Avaliação Geral da Visita</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quemAcompanhou">
            6. Quem acompanhou a visita? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="quemAcompanhou"
            rows={3}
            value={data.quemAcompanhou || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('quemAcompanhou', e.target.value)}
            placeholder="Descreva quem acompanhou a visita e suas funções..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>
            7. Avaliação da Visita <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.avaliacaoVisita || ''}
            onValueChange={(value: string) => handleChange('avaliacaoVisita', value)}
            disabled={readOnly}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Produtiva, cliente muito interessado" id="av1" disabled={readOnly} />
              <Label htmlFor="av1" className="cursor-pointer">Produtiva, cliente muito interessado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pouco produtiva" id="av2" disabled={readOnly} />
              <Label htmlFor="av2" className="cursor-pointer">Pouco produtiva</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Improdutiva" id="av3" disabled={readOnly} />
              <Label htmlFor="av3" className="cursor-pointer">Improdutiva</Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <Separator />

      {/* Momento 3: Respostas do Engenheiro */}
      <div className="space-y-4">
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 3: Respostas do Engenheiro</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="estadoGeralEdificacao">
            8. Qual o estado geral da edificação (Condições encontradas)? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="estadoGeralEdificacao"
            rows={4}
            value={data.estadoGeralEdificacao || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('estadoGeralEdificacao', e.target.value)}
            placeholder="Descreva detalhadamente as condições da edificação encontradas..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="servicoResolver">
            9. Qual o serviço deve ser feito para resolver o problema? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="servicoResolver"
            rows={4}
            value={data.servicoResolver || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleChange('servicoResolver', e.target.value)}
            placeholder="Descreva os serviços recomendados para resolver o problema..."
            disabled={readOnly}
          />
        </div>

        <FileUploadUnificado
          label="10. Anexar Arquivos (Fotos gerais, croquis, etc)"
          files={data.arquivosGerais || []}
          onFilesChange={(files) => handleChange('arquivosGerais', files)}
          disabled={readOnly}
          osId={osId}
        />
      </div>
    </div>
  );
}
