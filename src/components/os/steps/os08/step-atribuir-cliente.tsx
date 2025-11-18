import React from 'react';
import { Label } from '../../../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Alert, AlertDescription } from '../../../ui/alert';
import { AlertCircle } from 'lucide-react';

// Mock de clientes (substituir com dados reais da API)
const CLIENTES_MOCK = [
  { id: '1', nome: 'Condomínio Residencial Solar' },
  { id: '2', nome: 'Condomínio Edifício Central' },
  { id: '3', nome: 'Condomínio Vila Verde' },
  { id: '4', nome: 'Condomínio Residencial Parque das Águas' },
  { id: '5', nome: 'Condomínio Residencial Torres do Sul' },
];

interface StepAtribuirClienteProps {
  data: {
    clienteId: string;
  };
  onDataChange: (data: any) => void;
}

export function StepAtribuirCliente({ data, onDataChange }: StepAtribuirClienteProps) {
  const handleInputChange = (field: string, value: any) => {
    onDataChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl mb-1">Atribuir Cliente</h2>
        <p className="text-sm text-neutral-600">
          Selecione o cliente responsável por esta ordem de serviço
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="clienteId">
            Cliente <span className="text-red-500">*</span>
          </Label>
          <Select
            value={data.clienteId}
            onValueChange={(value) => handleInputChange('clienteId', value)}
          >
            <SelectTrigger id="clienteId">
              <SelectValue placeholder="Selecione um cliente" />
            </SelectTrigger>
            <SelectContent>
              {CLIENTES_MOCK.map((cliente) => (
                <SelectItem key={cliente.id} value={cliente.id}>
                  {cliente.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {data.clienteId && (
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <h3 className="text-sm mb-2">Cliente Selecionado</h3>
            <p className="text-neutral-700">
              {CLIENTES_MOCK.find((c) => c.id === data.clienteId)?.nome}
            </p>
          </div>
        )}
      </div>

      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          O cliente selecionado será responsável por esta OS e receberá todas as notificações relacionadas.
        </AlertDescription>
      </Alert>
    </div>
  );
}
