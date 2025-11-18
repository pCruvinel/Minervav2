import React from 'react';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Calendar } from '../../../ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../../../ui/popover';
import { Button } from '../../../ui/button';
import { Alert, AlertDescription } from '../../../ui/alert';
import { AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '../../../ui/utils';

const CENTROS_CUSTO = [
  'Option 01',
  'Option 02',
];

const TIPOS_REQUISICAO = [
  'Material',
  'Ferramenta/Equipamento (aluguel)',
  'Ferramenta/Equipamento (aquisição)',
  'Logística',
  'Documentação',
];

interface StepRequisicaoCompraProps {
  data: {
    cnpj: string;
    centroCusto: string;
    tipo: string;
    descricaoMaterial: string;
    quantidade: string;
    parametroPreco: string;
    linkProduto: string;
    localEntrega: string;
    prazoEntrega: string;
    observacoes: string;
    sistema: string;
    item: string;
    geraRuido: string;
    dataPrevistaInicio: string;
    dataPrevistaFim: string;
  };
  onDataChange: (data: any) => void;
}

export function StepRequisicaoCompra({ data, onDataChange }: StepRequisicaoCompraProps) {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  const handleDateSelect = (field: string, date: Date | undefined) => {
    if (date) {
      handleInputChange(field, date.toISOString());
    }
  };

  const formatCNPJ = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, '');
    
    // Aplica máscara de CNPJ: 00.000.000/0000-00
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCNPJ(e.target.value);
    handleInputChange('cnpj', formatted);
  };

  const dataInicio = data.dataPrevistaInicio ? new Date(data.dataPrevistaInicio) : undefined;
  const dataFim = data.dataPrevistaFim ? new Date(data.dataPrevistaFim) : undefined;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Requisição de Compra</h2>
        <p className="text-sm text-neutral-600">
          Preencha os dados da requisição de compra de material ou serviço
        </p>
      </div>

      {/* Informações Básicas */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Informações Básicas
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">
              CNPJ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cnpj"
              value={data.cnpj}
              onChange={handleCNPJChange}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="centroCusto">
              Centro de Custo da Requisição <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.centroCusto}
              onValueChange={(value) => handleInputChange('centroCusto', value)}
            >
              <SelectTrigger id="centroCusto">
                <SelectValue placeholder="Selecione o centro de custo" />
              </SelectTrigger>
              <SelectContent>
                {CENTROS_CUSTO.map((centro) => (
                  <SelectItem key={centro} value={centro}>
                    {centro}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tipo">
              Tipo <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.tipo}
              onValueChange={(value) => handleInputChange('tipo', value)}
            >
              <SelectTrigger id="tipo">
                <SelectValue placeholder="Selecione o tipo de requisição" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_REQUISICAO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Detalhes do Material/Serviço */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Detalhes do Material/Serviço
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="descricaoMaterial">
              Descrição do Material <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="descricaoMaterial"
              value={data.descricaoMaterial}
              onChange={(e) => handleInputChange('descricaoMaterial', e.target.value)}
              placeholder="Descreva detalhadamente o material ou serviço solicitado"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidade">
                Quantidade (Especifique a unidade de medida) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="quantidade"
                value={data.quantidade}
                onChange={(e) => handleInputChange('quantidade', e.target.value)}
                placeholder="Ex: 100 unidades, 50 metros, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parametroPreco">
                Parâmetro de Preço Unitário <span className="text-red-500">*</span>
              </Label>
              <Input
                id="parametroPreco"
                value={data.parametroPreco}
                onChange={(e) => handleInputChange('parametroPreco', e.target.value)}
                placeholder="Ex: R$ 50,00"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="linkProduto">
                Anexe Link de Produto Parâmetro <span className="text-red-500">*</span>
              </Label>
              <Input
                id="linkProduto"
                type="url"
                value={data.linkProduto}
                onChange={(e) => handleInputChange('linkProduto', e.target.value)}
                placeholder="https://exemplo.com/produto"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Entrega */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Informações de Entrega
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="localEntrega">
              Local de Entrega <span className="text-red-500">*</span>
            </Label>
            <Input
              id="localEntrega"
              value={data.localEntrega}
              onChange={(e) => handleInputChange('localEntrega', e.target.value)}
              placeholder="Endereço completo de entrega"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="prazoEntrega">
              Prazo de Entrega <span className="text-red-500">*</span>
            </Label>
            <Input
              id="prazoEntrega"
              value={data.prazoEntrega}
              onChange={(e) => handleInputChange('prazoEntrega', e.target.value)}
              placeholder="Ex: 15 dias úteis"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              value={data.observacoes}
              onChange={(e) => handleInputChange('observacoes', e.target.value)}
              placeholder="Observações adicionais sobre a requisição"
              rows={3}
            />
          </div>
        </div>
      </div>

      {/* Produtos Adicionados */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Produtos Adicionados
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sistema">
                Sistema <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sistema"
                value={data.sistema}
                onChange={(e) => handleInputChange('sistema', e.target.value)}
                placeholder="Ex: Sistema Hidráulico, Elétrico, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="item">
                Item (o que será feito) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="item"
                value={data.item}
                onChange={(e) => handleInputChange('item', e.target.value)}
                placeholder="Descreva o que será feito"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="geraRuido">
                Gera Ruído? <span className="text-red-500">*</span>
              </Label>
              <Select
                value={data.geraRuido}
                onValueChange={(value) => handleInputChange('geraRuido', value)}
              >
                <SelectTrigger id="geraRuido">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sim">Sim</SelectItem>
                  <SelectItem value="nao">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Datas Previstas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>
                Data Prevista Início <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dataInicio && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataInicio ? format(dataInicio, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataInicio}
                    onSelect={(date) => handleDateSelect('dataPrevistaInicio', date)}
                    locale={ptBR}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>
                Data Prevista Fim <span className="text-red-500">*</span>
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !dataFim && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dataFim ? format(dataFim, 'dd/MM/yyyy', { locale: ptBR }) : 'Selecione a data'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={dataFim}
                    onSelect={(date) => handleDateSelect('dataPrevistaFim', date)}
                    locale={ptBR}
                    disabled={(date) => dataInicio ? date < dataInicio : false}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>

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
