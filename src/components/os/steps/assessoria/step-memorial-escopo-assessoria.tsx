import React from 'react';
import { Input } from '../../../ui/input';
import { Label } from '../../../ui/label';
import { Textarea } from '../../../ui/textarea';
import { Alert, AlertDescription } from '../../../ui/alert';
import { AlertCircle } from 'lucide-react';

interface StepMemorialEscopoAssessoriaProps {
  data: {
    descricaoServico: string;
    escopo: string;
    prazoEstimado: string;
    observacoes: string;
  };
  onDataChange: (data: any) => void;
}

export function StepMemorialEscopoAssessoria({ data, onDataChange }: StepMemorialEscopoAssessoriaProps) {
  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Defina o escopo detalhado do serviço e os prazos estimados.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div>
          <Label>Descrição do Serviço</Label>
          <Input
            placeholder="Ex: Assessoria técnica mensal, Laudo estrutural..."
            value={data.descricaoServico}
            onChange={(e) => onDataChange({ ...data, descricaoServico: e.target.value })}
          />
        </div>

        <div>
          <Label>Escopo Detalhado</Label>
          <Textarea
            placeholder="Detalhe o escopo completo do serviço..."
            value={data.escopo}
            onChange={(e) => onDataChange({ ...data, escopo: e.target.value })}
            rows={6}
          />
        </div>

        <div>
          <Label>Prazo Estimado</Label>
          <Input
            placeholder="Ex: 12 meses, 30 dias..."
            value={data.prazoEstimado}
            onChange={(e) => onDataChange({ ...data, prazoEstimado: e.target.value })}
          />
        </div>

        <div>
          <Label>Observações</Label>
          <Textarea
            placeholder="Observações adicionais..."
            value={data.observacoes}
            onChange={(e) => onDataChange({ ...data, observacoes: e.target.value })}
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
