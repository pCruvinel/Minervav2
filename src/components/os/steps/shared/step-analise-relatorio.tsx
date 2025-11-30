import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

interface StepAnaliseRelatorioProps {
  data: {
    propostaApresentada?: string;
    metodoApresentacao?: string;
    clienteAchouProposta?: string;
    clienteAchouContrato?: string;
    doresNaoAtendidas?: string;
    indicadorFechamento?: string;
    quemEstavaNaApresentacao?: string;
    nivelSatisfacao?: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepAnaliseRelatorio({
  data,
  onDataChange,
  readOnly = false,
}: StepAnaliseRelatorioProps) {
  const handleChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Documente a reação do cliente após a apresentação da proposta comercial.
        </AlertDescription>
      </Alert>

      {/* Momento 1: Apresentação */}
      <div className="space-y-4">
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 1: Sobre a Apresentação</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="propostaApresentada">
            1. Qual a proposta apresentada? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="propostaApresentada"
            rows={3}
            value={data.propostaApresentada || ''}
            onChange={(e) => handleChange('propostaApresentada', e.target.value)}
            placeholder="Descreva a proposta apresentada..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metodoApresentacao">
            2. Qual o método de apresentação? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="metodoApresentacao"
            rows={2}
            value={data.metodoApresentacao || ''}
            onChange={(e) => handleChange('metodoApresentacao', e.target.value)}
            placeholder="Ex: Presencial, Online, Slides..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="clienteAchouProposta">
            3. O que o cliente achou da proposta? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="clienteAchouProposta"
            rows={3}
            value={data.clienteAchouProposta || ''}
            onChange={(e) => handleChange('clienteAchouProposta', e.target.value)}
            placeholder="Descreva a reação e comentários do cliente..."
            disabled={readOnly}
          />
        </div>
      </div>

      <Separator />

      {/* Momento 2: Contrato e Dores */}
      <div className="space-y-4">
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 2: Contrato e Dores do Cliente</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clienteAchouContrato">
            4. O que o cliente achou do contrato? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="clienteAchouContrato"
            rows={3}
            value={data.clienteAchouContrato || ''}
            onChange={(e) => handleChange('clienteAchouContrato', e.target.value)}
            placeholder="Descreva a opinião do cliente sobre o contrato..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="doresNaoAtendidas">
            5. Quais as dores do cliente não atendidas?
          </Label>
          <Textarea
            id="doresNaoAtendidas"
            rows={3}
            value={data.doresNaoAtendidas || ''}
            onChange={(e) => handleChange('doresNaoAtendidas', e.target.value)}
            placeholder="Liste possíveis objeções ou pontos não atendidos..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="indicadorFechamento">
            6. Qual o indicador de fechamento da proposta? <span className="text-destructive">*</span>
          </Label>
          <Select
            value={data.indicadorFechamento || ''}
            onValueChange={(value: string) => handleChange('indicadorFechamento', value)}
            disabled={readOnly}
          >
            <SelectTrigger id="indicadorFechamento">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Fechado">Fechado</SelectItem>
              <SelectItem value="Quente">Quente</SelectItem>
              <SelectItem value="Morno">Morno</SelectItem>
              <SelectItem value="Frio">Frio</SelectItem>
              <SelectItem value="Perdido">Perdido</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Separator />

      {/* Momento 3: Satisfação */}
      <div className="space-y-4">
        <div className="bg-neutral-100 px-4 py-2 rounded-md">
          <h3 className="text-sm font-medium">Momento 3: Satisfação do Cliente</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="quemEstavaNaApresentacao">
            7. Quem estava na apresentação? <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="quemEstavaNaApresentacao"
            rows={2}
            value={data.quemEstavaNaApresentacao || ''}
            onChange={(e) => handleChange('quemEstavaNaApresentacao', e.target.value)}
            placeholder="Liste os participantes da reunião..."
            disabled={readOnly}
          />
        </div>

        <div className="space-y-2">
          <Label>
            8. Qual o nível de satisfação do cliente? <span className="text-destructive">*</span>
          </Label>
          <RadioGroup
            value={data.nivelSatisfacao || ''}
            onValueChange={(value: string) => handleChange('nivelSatisfacao', value)}
            disabled={readOnly}
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Produtiva, cliente interessado" id="ns1" disabled={readOnly} />
              <Label htmlFor="ns1" className="cursor-pointer">Produtiva, cliente interessado</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Pouco produtiva" id="ns2" disabled={readOnly} />
              <Label htmlFor="ns2" className="cursor-pointer">Pouco produtiva</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Improdutiva" id="ns3" disabled={readOnly} />
              <Label htmlFor="ns3" className="cursor-pointer">Improdutiva</Label>
            </div>
          </RadioGroup>
        </div>
      </div>
    </div>
  );
}
