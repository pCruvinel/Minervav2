import React from 'react';
import { Label } from '../../../ui/label';
import { Input } from '../../../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Switch } from '../../../ui/switch';
import { Alert, AlertDescription } from '../../../ui/alert';
import { AlertCircle } from 'lucide-react';

const TIPOS_EDIFICACAO = [
  'Condomínio Comercial',
  'Condomínio residencial - Casas',
  'Condomínio Residencial - Apartamentos',
  'Hotel',
  'Shopping',
  'Hospital',
  'Indústria',
  'Igreja',
  'Outro',
];

const TIPOS_TELHADO = [
  'Laje impermeabilizada',
  'Telha Cerâmica',
  'Telha de Fibrocimento',
  'Telha Metálica/Alumínio',
];

const ESTADOS_BRASIL = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 
  'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

interface StepDadosClienteProps {
  data: {
    cliente: string;
    tipoEdificacao: string;
    qtdPavimentos: string;
    tipoTelhado: string;
    possuiElevador: boolean;
    possuiPiscina: boolean;
    cnpj: string;
    cep: string;
    estado: string;
    cidade: string;
    endereco: string;
    bairro: string;
    responsavel: string;
    cargo: string;
    telefone: string;
    email: string;
  };
  onDataChange: (data: any) => void;
}

export function StepDadosCliente({ data, onDataChange }: StepDadosClienteProps) {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 8) {
      return numbers.replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatTelefone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 11) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Dados do Cliente e da Edificação</h2>
        <p className="text-sm text-neutral-600">
          Preencha todas as informações sobre o cliente e características da obra
        </p>
      </div>

      {/* Dados Gerais */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Dados Gerais
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="cliente">
              Cliente <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.cliente}
              onValueChange={(value) => handleInputChange('cliente', value)}
            >
              <SelectTrigger id="cliente">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente1">Condomínio Jardim das Flores</SelectItem>
                <SelectItem value="cliente2">Edifício Sunset Boulevard</SelectItem>
                <SelectItem value="cliente3">Shopping Center Plaza</SelectItem>
                <SelectItem value="cliente4">Hotel Boa Vista</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="tipoEdificacao">
              Tipo de Edificação <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.tipoEdificacao}
              onValueChange={(value) => handleInputChange('tipoEdificacao', value)}
            >
              <SelectTrigger id="tipoEdificacao">
                <SelectValue placeholder="Selecione o tipo de edificação" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_EDIFICACAO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qtdPavimentos">
              Quantidade de Pavimentos <span className="text-red-500">*</span>
            </Label>
            <Input
              id="qtdPavimentos"
              type="number"
              min="1"
              value={data.qtdPavimentos}
              onChange={(e) => handleInputChange('qtdPavimentos', e.target.value)}
              placeholder="Ex: 15"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipoTelhado">
              Tipo de Telhado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.tipoTelhado}
              onValueChange={(value) => handleInputChange('tipoTelhado', value)}
            >
              <SelectTrigger id="tipoTelhado">
                <SelectValue placeholder="Selecione o tipo de telhado" />
              </SelectTrigger>
              <SelectContent>
                {TIPOS_TELHADO.map((tipo) => (
                  <SelectItem key={tipo} value={tipo}>
                    {tipo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <Label htmlFor="possuiElevador" className="cursor-pointer">
              Possui Elevador?
            </Label>
            <Switch
              id="possuiElevador"
              checked={data.possuiElevador}
              onCheckedChange={(checked) => handleInputChange('possuiElevador', checked)}
            />
          </div>

          <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
            <Label htmlFor="possuiPiscina" className="cursor-pointer">
              Possui Piscina?
            </Label>
            <Switch
              id="possuiPiscina"
              checked={data.possuiPiscina}
              onCheckedChange={(checked) => handleInputChange('possuiPiscina', checked)}
            />
          </div>
        </div>
      </div>

      {/* Dados Complementares */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Dados Complementares
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="cnpj">
              CNPJ <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cnpj"
              value={data.cnpj}
              onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
              placeholder="00.000.000/0000-00"
              maxLength={18}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cep">
              CEP <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cep"
              value={data.cep}
              onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
              placeholder="00000-000"
              maxLength={9}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="estado">
              Estado <span className="text-red-500">*</span>
            </Label>
            <Select
              value={data.estado}
              onValueChange={(value) => handleInputChange('estado', value)}
            >
              <SelectTrigger id="estado">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                {ESTADOS_BRASIL.map((estado) => (
                  <SelectItem key={estado} value={estado}>
                    {estado}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cidade">
              Cidade <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cidade"
              value={data.cidade}
              onChange={(e) => handleInputChange('cidade', e.target.value)}
              placeholder="Digite a cidade"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="endereco">
              Endereço <span className="text-red-500">*</span>
            </Label>
            <Input
              id="endereco"
              value={data.endereco}
              onChange={(e) => handleInputChange('endereco', e.target.value)}
              placeholder="Rua, Avenida, número"
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="bairro">
              Bairro <span className="text-red-500">*</span>
            </Label>
            <Input
              id="bairro"
              value={data.bairro}
              onChange={(e) => handleInputChange('bairro', e.target.value)}
              placeholder="Digite o bairro"
            />
          </div>
        </div>
      </div>

      {/* Dados do Responsável */}
      <div className="space-y-4">
        <h3 className="text-base border-b border-neutral-200 pb-2" style={{ color: '#D3AF37' }}>
          Dados do Responsável
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="responsavel">
              Responsável <span className="text-red-500">*</span>
            </Label>
            <Input
              id="responsavel"
              value={data.responsavel}
              onChange={(e) => handleInputChange('responsavel', e.target.value)}
              placeholder="Nome completo do responsável"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cargo">
              Cargo do Responsável <span className="text-red-500">*</span>
            </Label>
            <Input
              id="cargo"
              value={data.cargo}
              onChange={(e) => handleInputChange('cargo', e.target.value)}
              placeholder="Ex: Síndico, Gerente, Diretor"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="telefone">
              Telefone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="telefone"
              value={data.telefone}
              onChange={(e) => handleInputChange('telefone', formatTelefone(e.target.value))}
              placeholder="(00) 00000-0000"
              maxLength={15}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">
              E-mail <span className="text-red-500">*</span>
            </Label>
            <Input
              id="email"
              type="email"
              value={data.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="email@exemplo.com"
            />
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
