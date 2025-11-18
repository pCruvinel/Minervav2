import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../ui/select';
import { Alert, AlertDescription } from '../../../ui/alert';
import { AlertCircle } from 'lucide-react';

interface StepFollowup3Props {
  data: {
    interesseCliente: string;
    pontosDuvida: string;
    proximosPassos: string;
    dataRetorno: string;
  };
  onDataChange: (data: any) => void;
}

export function StepFollowup3({ data, onDataChange }: StepFollowup3Props) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Registre o feedback da apresentação e os próximos passos.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label>Nível de interesse do cliente</Label>
          <Select value={data.interesseCliente} onValueChange={(value) => onDataChange({ ...data, interesseCliente: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alto">Alto - Fechamento provável</SelectItem>
              <SelectItem value="medio">Médio - Aguardando decisão</SelectItem>
              <SelectItem value="baixo">Baixo - Pouco interesse</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>Pontos de dúvida levantados</Label>
          <Textarea
            placeholder="Dúvidas do cliente..."
            value={data.pontosDuvida}
            onChange={(e) => onDataChange({ ...data, pontosDuvida: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label>Próximos passos acordados</Label>
          <Textarea
            placeholder="O que foi combinado..."
            value={data.proximosPassos}
            onChange={(e) => onDataChange({ ...data, proximosPassos: e.target.value })}
            rows={3}
          />
        </div>

        <div>
          <Label>Data prevista para retorno</Label>
          <Input
            type="date"
            value={data.dataRetorno}
            onChange={(e) => onDataChange({ ...data, dataRetorno: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
