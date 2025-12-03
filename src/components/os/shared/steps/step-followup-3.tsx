import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface StepFollowup3Props {
  data: {
    interesseCliente: string;
    pontosDuvida: string;
    proximosPassos: string;
    dataRetorno: string;
  };
  onDataChange: (data: any) => void;
  readOnly?: boolean;
}

export function StepFollowup3({ data, onDataChange, readOnly = false }: StepFollowup3Props) {
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
          <Select 
            value={data.interesseCliente} 
            onValueChange={(value: string) => !readOnly && onDataChange({ ...data, interesseCliente: value })}
            disabled={readOnly}
          >
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
            onChange={(e) => !readOnly && onDataChange({ ...data, pontosDuvida: e.target.value })}
            rows={3}
            disabled={readOnly}
          />
        </div>

        <div>
          <Label>Próximos passos acordados</Label>
          <Textarea
            placeholder="O que foi combinado..."
            value={data.proximosPassos}
            onChange={(e) => !readOnly && onDataChange({ ...data, proximosPassos: e.target.value })}
            rows={3}
            disabled={readOnly}
          />
        </div>

        <div>
          <Label>Data prevista para retorno</Label>
          <Input
            type="date"
            value={data.dataRetorno}
            onChange={(e) => !readOnly && onDataChange({ ...data, dataRetorno: e.target.value })}
            disabled={readOnly}
          />
        </div>
      </div>
    </div>
  );
}
